# DealLens — Agent Task Instructions

> **For Antigravity:** Read this file completely before touching any code.
> Read `ARCHITECTURE.md` and `rules.md` alongside this file.
> Fix tasks in the exact priority order listed.
> After completing each task, state what files you changed and why.
> Do not modify anything not mentioned in a task.
> Do not combine multiple tasks into one change.

---

## Before You Start

Understand these three files first:

- `backend/pipeline/claim_parser.py` — extracts all claims from the deck (F1). Every other module depends on its output being clean.
- `backend/routers/analyse.py` — orchestrates the full pipeline. This is where context gets passed between modules.
- `backend/services/gemini_client.py` — handles all Gemini API calls including retry logic.

The root cause of most issues is that `routers/analyse.py` does not pass enough context (startup name, year, category) into the modules and prompts that need it.

---

## Task 1 — Add Groq as a Fallback Model

**Priority:** Fix this first. Everything else is useless if the pipeline crashes on stage.

**Context:**
- File: `backend/services/gemini_client.py`
- The current retry logic catches `429` (rate limit) errors but not `503` (server unavailable) errors.
- Gemini free tier frequently returns 503 under load.
- Groq offers Llama 3.3 70B on a free tier (14,400 requests/day). API key from console.groq.com.
- Groq's API follows the OpenAI client format.

**What to build:**
- Create a new file `backend/services/groq_client.py` that wraps the Groq API the same way `gemini_client.py` wraps Gemini. It should accept a system prompt and a user prompt and return a string response. Temperature should always be 0.1 for analytical consistency.
- In `gemini_client.py`, extend the retry logic to also catch 503 and unavailable errors. After all retries are exhausted on Gemini, automatically call the Groq client as a final fallback instead of raising an error.
- Add `GROQ_API_KEY` to `.env.example` with a placeholder value.

**Constraints:**
- Do not change the function signatures of `call_gemini()`. All callers must remain unchanged.
- The fallback must be invisible to the rest of the pipeline — modules should not know or care which model responded.
- Do not use Groq for the scorecard module (F8). F8 uses Flash-Lite specifically to preserve Flash quota. If Flash-Lite 503s, fall back to Flash before Groq.

**Done when:** A simulated 503 from Gemini causes the pipeline to automatically retry with Groq and return a valid response without crashing.

---

## Task 2 — Inject Startup Name Into All Modules

**Priority:** Second. This fixes the self-competition bug where the startup appears in its own competitor list.

**Context:**
- File: `backend/routers/analyse.py`
- The `startup_name` is already extracted by F1 (`claims["startup_name"]`).
- It is currently NOT passed into the Serper search query or the Gemini analysis prompts for F4 (moat tester).
- Result: Serper searches for competitors and the startup's own website ranks highest, pulling itself into the competitor list.
- Files affected: `routers/analyse.py`, `prompts/moat.py`, `services/serper_client.py`

**What to build:**
- In `routers/analyse.py`, after F1 runs, build a shared context block containing at minimum: `startup_name`, `category`, and `context_year` (explained in Task 3). Pass this context block into every module call that currently doesn't receive it.
- In `prompts/moat.py`, add an explicit instruction at the top of the system prompt that names the startup being analysed and instructs the model to never include that name in the competitor list under any circumstances.
- In `services/serper_client.py`, the search query for competitors should programmatically exclude the startup name so it does not appear in search results.

**Constraints:**
- Do not change the return schema of any module. Only the inputs change.
- Do not modify F1 (`claim_parser.py`) in this task. That is covered in Task 3.
- Only modify the competitor search query, not the founder or market search queries.

**Done when:** Running the Brex deck produces a competitor list that does not contain "Brex."

---

## Task 3 — Extract Context Year in F1 and Apply to Searches

**Priority:** Third. This fixes the time-travel bug where modern competitors are applied to historical decks.

**Context:**
- File: `backend/prompts/extraction.py` and `backend/pipeline/claim_parser.py`
- The Uber deck was from 2008. The analysis returned Waymo and Pony.ai as competitors — companies that did not exist in 2008.
- F1 currently does not extract when the deck was made.
- Tavily and Serper fetch live current data with no time constraint.

**What to build:**
- Add `context_year` as a required field in the F1 extraction prompt and output schema. Instruct the model to look for explicit year mentions, founding date references, or phrases like "in 20XX." If no year is found, the field must return `null` — never guess.
- In `routers/analyse.py`, after F1 runs, read `context_year` from the claims output.
- Pass `context_year` into the Serper and Tavily search functions. If `context_year` is not null, the search queries for competitors and market data should be time-constrained to that era. If `context_year` is null, run searches without any time constraint — do not default to any year.
- Pass `context_year` into the Gemini prompts for F4 (moat) and F2 (TAM) so the model knows what era it is analysing.

**Constraints:**
- Do not apply time constraints to founder searches. Founder background research should always use current data.
- If `context_year` is null, the pipeline must continue normally. This field is optional enrichment, not a blocker.
- Do not modify the API response schema. `context_year` is internal pipeline context only.

**Done when:** Running the Uber deck produces competitors that existed before 2010, not autonomous vehicle companies from 2020+.

---

## Task 4 — Restrict F1 TAM Extraction to Numeric Claims Only

**Priority:** Fourth. This fixes qualitative sentences being extracted as market size claims.

**Context:**
- File: `backend/prompts/extraction.py`
- The Uber deck's problem statement "Most cabs in 2008 use aging and inefficient technology" was extracted as a `market_claim`.
- The TAM checker then tried to fact-check this sentence as a market size figure and returned a confused verdict.
- The F1 prompt currently extracts any sentence that sounds market-related, regardless of whether it contains a number.

**What to build:**
- Update the F1 system prompt to add a strict filter for `market_claims`. A claim only qualifies as a market claim if it contains a quantitative value — a currency figure, a percentage, or a countable unit. Qualitative descriptions of problems, behaviours, or inefficiencies are explicitly not market claims and must be ignored.
- Add an example of what should and should not be extracted directly into the prompt so the model has a reference pattern to follow.

**Constraints:**
- Do not change any other claim category (traction, moat, financials, founders). Only `market_claims` filtering changes.
- Do not change the output schema. The `market_claims` array still exists — it may just be empty if no numeric claims are found.
- If `market_claims` is empty, the TAM module must handle this gracefully and return `verdict: UNSUBSTANTIATED` with explanation "No TAM figure provided in deck" rather than crashing.

**Done when:** Running the Uber deck does not extract "Most cabs use aging technology" as a market claim.

---

## Task 5 — Fix Founder Module Conditional Routing

**Priority:** Fifth. This fixes the contradiction where the card says "cannot assess" but also claims domain expertise was found.

**Context:**
- File: `backend/routers/analyse.py` and `backend/pipeline/founder_intel.py`
- When the deck contains no founder names, F1 returns an empty `founders` array.
- Currently, F5 (founder intel) still runs and passes an empty string to Tavily and Crunchbase.
- The LLM receives empty search results and hallucinates a generic positive-sounding summary to fill the required JSON keys.
- Result: the card simultaneously says "LOW — cannot assess without founder names" and "search found relevant domain expertise." These contradict each other on the same screen.

**What to build:**
- In `routers/analyse.py`, before calling F5, check whether `claims["founders"]` is empty or null.
- If founders are empty, do not call Tavily or Crunchbase with an empty string. Instead, search using the startup name plus generic terms like "founders" and "CEO" to attempt discovery.
- If that search also returns no useful results, bypass the full F5 analysis and return a hardcoded honest payload for the founder section. This payload must be consistent — every field must say the same thing (no data found), and the public summary must give the investor something actionable rather than a blank card.
- If founders are found by name in F1, run F5 normally as before.

**Constraints:**
- Do not change the founder section's JSON schema. All keys must still be present in the returned object — just populated with honest "not found" values rather than hallucinated content.
- Do not skip the founder card UI entirely. An empty card with an honest message is better than a missing section.
- The fallback payload must never contain positive-sounding language about domain expertise or credibility if no data was actually found.

**Done when:** Running the Uber deck shows a founder card that consistently says no data was found, with no contradictory statements anywhere on the card.

---

## Task 6 — Fix Competitor Table Backend Schema

**Priority:** Sixth. This fixes the most visually broken screen in the app.

**Context:**
- File: `backend/prompts/moat.py`
- The Competitor Map currently renders as a numbered flat list of names with no columns.
- The frontend `DataTable` component expects each competitor to be a structured object with four fields: name, backing, scale, and threat level.
- The Gemini moat prompt is not enforcing this object structure strictly enough, causing the model to return a plain array of strings in some cases.

**What to build:**
- Update the system prompt in `prompts/moat.py` to define the competitor object structure with extreme clarity. Include a concrete example of what a correctly structured competitor object looks like. Instruct the model that returning plain strings instead of objects is a format violation.
- The threat level field must be one of exactly four values. List them explicitly in the prompt. Do not allow any other string.
- Add a validation step in `pipeline/moat_tester.py` that checks each item in the competitors array after parsing. If an item is a plain string rather than an object, either attempt to restructure it or discard it and log a warning. Never pass malformed competitor data to the frontend.

**Constraints:**
- Do not change the frontend competitor table component in this task. Fix the data source first.
- Do not change the overall moat module return schema. Only the structure of items inside the `competitors` array changes.

**Done when:** Running the Brex deck shows a competitor table with all four columns populated and colour-coded threat badges visible.

---

## Task 7 — Add Vision Fallback for Table and Chart Slides

**Priority:** Seventh. This reduces redundant investor questions caused by missed tabular data.

**Context:**
- File: `backend/pipeline/extractor.py`
- PyMuPDF's `get_text()` scrambles or drops table and chart data because it cannot preserve grid structure.
- The Brex deck's LTV table (Slide 11) was completely missed, causing the system to ask for data the founder had already provided.
- PyMuPDF can also render pages as images natively without any additional libraries.
- Gemini Flash supports vision input and is already in the stack.

**What to build:**
- In `extractor.py`, after extracting text from each slide, check the length of the extracted text. If a slide produces very little text (use a threshold that makes sense given typical slide content), treat it as a likely chart or table slide.
- For those slides only, use PyMuPDF's built-in page rendering to produce a JPEG image of the slide.
- Pass that image to Gemini Flash with a targeted prompt asking it to describe any tables, charts, data grids, or numerical information it sees. Append this description to the slide's text content.
- For slides with normal text extraction, do not call vision at all. This must not add latency to normal slides.

**Constraints:**
- Do not replace PyMuPDF text extraction. Vision is additive — it supplements short slides, not replaces the main extraction.
- Do not use any external library beyond what is already in `requirements.txt`. PyMuPDF can render images natively.
- Vision fallback failures must not crash the pipeline. If the vision call fails, log a warning and continue with whatever text was extracted.

**Done when:** Running the Brex deck extracts the LTV table from Slide 11 and no investor question asks for data that was already present in the deck.

---

## Task 8 — Fix Sidebar and Section Heading Consistency

**Priority:** Last. Polish only — do this when everything else works.

**Context:**
- File: `frontend/src/components/shared/` and `frontend/src/components/Report/`
- The sidebar navigation label says "Founder Card" but the section heading inside the report reads "Founder Intelligence."
- This looks like an unintentional inconsistency rather than a deliberate design choice.

**What to build:**
- Decide on one label for each section and apply it consistently in both the sidebar and the section heading.
- Recommended convention: sidebar uses short labels (space is limited), section headings use full descriptive labels. This is intentional and acceptable as long as they clearly refer to the same section.
- Review all five sections for similar mismatches and fix any others found.

**Constraints:**
- Do not change section IDs used by the scroll spy. Only visible label text changes.
- Do not change the sidebar component structure.

**Done when:** Every sidebar label clearly corresponds to its section heading with no ambiguity.

---

## General Rules for All Tasks

- Read the existing code in the file before writing anything. Do not assume what is there.
- If a task conflicts with `rules.md`, flag it and ask before proceeding.
- If a fix requires a new environment variable, add it to `.env.example` with a placeholder.
- Never commit working code without also handling its failure case.
- After all tasks are complete, run the full pipeline on the Brex deck and confirm no task has broken another.

---

*DealLens Agent Tasks · Hand this file to Antigravity alongside ARCHITECTURE.md and rules.md*
