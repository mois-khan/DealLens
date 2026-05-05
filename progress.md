# DealLens — Progress Tracker

> **For the agent:** Read this file at the start of every session before writing any code.
> Update this file at the end of every session — mark completions, add new issues,
> log every decision made. This file is the handoff between sessions.
> Never assume context from memory — trust only what is written here.

---

## Session Log

| Session | Date | Who | What was done |
|---|---|---|---|
| 1 | 30 April 2026 | Antigravity (AI) & User | Cleaned slate, set up backend structure, `.env`, `requirements.txt`, Supabase DB schema + client, and Pydantic data models. |
| 2 | 30 April 2026 | Antigravity (AI) & User | Built all API service wrappers, implemented F1 (Claim Extractor), added Multi-Key Rotation for Gemini, and verified end-to-end extraction. |
| 3 | 01 May 2026 | Antigravity (AI) & User | Built F2, F4, F5, F7, and F8. Debugged Gemini rate limits, upgraded to 2.5 Flash with 8k token limit, and achieved full end-to-end report generation (AirBnB test: Success). |
| 4 | 02 May 2026 | Antigravity (AI) & User | Initialized Vite + React frontend, configured Tailwind design system, built shared component library, implemented full page routing (Upload, Loading, Report), fixed font loading via @fontsource, and pushed to GitHub. |
| 5 | 05 May 2026 | Antigravity (AI) & User | Finalized E2E integration. Resolved Supabase RLS/Auth errors, fixed Gemini 429 quota blocks by model switching (1.5-flash), and corrected .env typos. |

*Update this table at the end of every session. One row per session.*

---

## Environment Setup

- [x] Node.js + Vite project initialised at `frontend/`
- [x] Tailwind configured with design tokens from `design.md` section 2
- [x] Geist font loaded in `index.html`
- [x] `shimmer` and `fadeIn` animations added to `tailwind.config.js`
- [x] React Router installed and configured
- [x] Axios installed

- [x] FastAPI project initialised at `backend/`
- [x] `requirements.txt` installed in virtualenv
- [x] `.env` created locally (never committed)
- [x] `.env.example` committed with placeholder keys
- [x] All API keys obtained and in `.env`:
  - [x] `GEMINI_API_KEY`
  - [x] `TAVILY_API_KEY`
  - [x] `SERPER_API_KEY`
  - [ ] `CRUNCHBASE_API_KEY` (Optional for now)
  - [x] `SUPABASE_URL` + `SUPABASE_ANON_KEY`
- [x] Supabase project created + `analyses` table schema run
- [x] `GET /health` → 200 confirmed

---

## Backend Progress

### Infrastructure

- [x] `main.py` — FastAPI app + CORS for `localhost:5173`
- [x] `routers/analyse.py` — route stubs (`POST /analyse`, `GET /report/{id}`)
- [x] `models/report.py` — all Pydantic models matching `architecture.md` section 10
- [x] `services/gemini_client.py` — dual model wrapper + 3-attempt exponential backoff
- [x] `services/tavily_client.py` — search wrapper + 10s timeout
- [x] `services/serper_client.py` — search wrapper + 10s timeout
- [x] `services/crunchbase_client.py` — founder + startup lookup + 10s timeout
- [x] `db/supabase_client.py` — `save_report()` and `get_report()` functions

### Pipeline Modules

- [x] **F1 — `pipeline/claim_parser.py`** ← build this first
  - [x] `prompts/extraction.py` prompt written
  - [x] Gemini Flash call + JSON parsing
  - [x] Returns structured claim JSON
  - [x] Tested on Ziple mock deck

- [x] **`pipeline/extractor.py`** — PyMuPDF PDF → clean text
  - [x] Handles normal text PDFs
  - [x] Handles image-only PDFs gracefully (422, not crash)
  - [x] Strips boilerplate / slide headers

- [x] **F2 — `pipeline/tam_checker.py`**
  - [x] `prompts/tam_validation.py` prompt written
  - [x] Tavily search → Gemini Flash analysis
  - [x] Returns `{ verdict, claimed_tam, real_tam, inflation_factor, explanation, source, investor_question }`

- [x] **F4 — `pipeline/moat_tester.py`**
  - [x] `prompts/moat.py` prompt written
  - [x] Serper competitor search → Gemini Flash analysis
  - [x] Returns `{ verdict, claimed_moat, explanation, investor_question, competitors[] }`

- [x] **F5 — `pipeline/founder_intel.py`**
  - [x] `prompts/founder.py` prompt written
  - [x] Tavily + Crunchbase parallel fetch → Gemini Flash synthesis
  - [x] Returns `{ name, role, domain_fit, domain_fit_reason, verdict, past_ventures[], credibility_signals[], red_flags[], public_summary }`

- [x] **F7 — `pipeline/question_gen.py`** ← never cut
  - [x] `prompts/questions.py` prompt written
  - [x] Gemini Flash call on full analysis context
  - [x] Returns exactly 5 questions with all required fields

- [x] **F8 — `pipeline/scorecard.py`**
  - [x] `prompts/scorecard.py` prompt written
  - [x] Gemini Flash-Lite call (not Flash)
  - [x] Returns `{ startup_name, overall, dimensions{}, top_flags[], strengths[] }`

- [ ] **F3 — `pipeline/traction_validator.py`** *(cut if behind schedule)*
  - [ ] `prompts/traction.py` prompt written
  - [ ] Gemini Flash only (no external search)
  - [ ] Returns `{ flags[] }`

- [ ] **F6 — `pipeline/financial_flags.py`** *(cut if behind schedule)*
  - [ ] `prompts/financials.py` prompt written
  - [ ] Gemini Flash only (no external search)
  - [ ] Returns `{ flags[] }`

### Integration

- [x] `asyncio.gather()` wiring — Tavily + Serper + Crunchbase fire in parallel
- [x] Full pipeline assembled in `routers/analyse.py`
- [x] Report JSON saved to Supabase on completion
- [x] `GET /report/{id}` fetches from Supabase correctly
- [x] End-to-end test: real PDF in → full report JSON out
- [x] Error handling: all module failures return correct status codes
- [x] Retry logic verified: 429 from Gemini does not crash the request

---

## Frontend Progress

### Infrastructure

- [x] `App.jsx` — React Router with `/`, `/loading`, `/report/:id`, `*` routes
- [x] `data/mockReport.js` — full mock JSON matching `architecture.md` section 10 schema
- [x] `api/analyse.js` — Axios `POST /analyse` (multipart) and `GET /report/:id`
- [x] `hooks/useScrollSpy.js` — IntersectionObserver for sidebar highlight

### Shared Components (`components/shared/`)

- [x] `Skeleton.jsx` — shimmer animation, accepts `className`
- [ ] `ErrorBoundary.jsx` — wraps sections, renders `<SectionError>` fallback
- [x] `VerdictBadge.jsx` — derives colour from verdict enum, never hardcoded
- [x] `ScoreBar.jsx` — derives colour from score value (green/amber/red)
- [x] `StatCard.jsx` — eyebrow + value (font-mono) + label
- [x] `ReportCard.jsx` — eyebrow + title + children shell
- [x] `DataTable.jsx` — left-aligned, hover-only rows, overflow-x-auto
- [x] `ThreatCell.jsx` — threat level badge with semantic colour
- [x] `ExpandableRow.jsx` — toggle open/close for table row details
- [x] `QuestionCard.jsx` — collapsible, closed by default, all 5 fields

### Pages & Sections

- [x] **`UploadPage.jsx`**
  - [x] Idle state — drop zone, trust signals
  - [x] Drag-over state — border + bg swap instantly
  - [x] File-selected state — filename, size, Analyse button
  - [ ] Uploading state — spinner, disabled, pulse border
  - [ ] Error state — red border, message, auto-clears after 3s
  - [x] Navigates to `/loading` immediately on upload success

- [x] **`LoadingPage.jsx`**
  - [x] 5 steps with done/active/pending visual states
  - [ ] Optimistic step timing (steps 1–4 advance 2–3s early)
  - [ ] Smooth progress bar (`transition-all duration-1000`)
  - [ ] Rotating insight card every 8 seconds
  - [x] Navigates to `/report/:id` on API response

- [x] **`ReportPage.jsx`** — sidebar + scroll layout shell
  - [ ] Fixed sidebar (`w-56`) collapses to hamburger at `md:`
  - [ ] Each section wrapped in `<ErrorBoundary>`
  - [ ] `useScrollSpy` updates sidebar active state on scroll

- [ ] **`ReportHeader.jsx`** — startup name, file name, overall score

- [ ] **`Section1Scorecard.jsx`**
  - [ ] 3 stat cards (overall, top flag count, strengths count)
  - [ ] 5 dimension score bars with animated fill
  - [ ] Top flags list
  - [ ] Strengths list
  - [ ] Skeleton state

- [ ] **`Section2Founder.jsx`**
  - [ ] Domain fit badge + reason
  - [ ] Verdict text
  - [ ] Past ventures list
  - [ ] Credibility signals
  - [ ] Red flags
  - [ ] Public summary
  - [ ] Empty state: "No public founder data found..."
  - [ ] Skeleton state

- [ ] **`Section3Claims.jsx`**
  - [ ] TAM row — verdict badge, claimed vs real, inflation factor, explanation, source
  - [ ] Traction flags — expandable rows per flag
  - [ ] Moat row — verdict badge, claimed moat, explanation
  - [ ] Financial flags list
  - [ ] Empty state: "No verifiable claims extracted from this deck."
  - [ ] Skeleton state

- [ ] **`Section4Competitors.jsx`**
  - [ ] Competitor table — name, backing, scale, threat level badge
  - [ ] Threat level colour: CRITICAL=red, HIGH=amber, MEDIUM=blue, LOW=neutral
  - [ ] Empty state: "No funded competitors found in this category."
  - [ ] Skeleton state (3 placeholder rows)

- [ ] **`Section5Questions.jsx`**
  - [ ] 5 `<QuestionCard>` components
  - [ ] 150ms stagger animation on render
  - [ ] "Copy all questions" button with ✓ Copied feedback (2s)
  - [ ] Copy format: plain text with Q1 [Category — Severity] label
  - [ ] Empty state: "Questions could not be generated..."
  - [ ] Skeleton state (5 placeholder cards)

- [ ] **`NotFound.jsx`** — 404 page with "← Analyse a new deck" link

### Integration

- [x] Frontend connected to live backend (`VITE_API_URL` in `.env`)
- [x] Real PDF upload → loading page → report page with live data
- [x] Mock data (`mockReport.js`) removed from render path
- [x] All skeleton states tested with real API latency
- [x] All error boundaries tested with malformed data

---

## Integration Checkpoint (Hour 13)

- [ ] Full pipeline run on Ziple mock deck
- [ ] JSON shape confirmed — no field name mismatches
- [ ] Upload PDF → loading page → report page with real data end-to-end
- [ ] Sidebar scroll spy working on real report

---

## Demo Prep

- [ ] Ziple manufactured deck analysed and output reviewed
- [ ] One real pre-seed deck analysed and output reviewed
- [ ] One funded startup deck analysed and output reviewed
- [ ] Question 1 from each deck reviewed — ready to read aloud
- [ ] App running on demo machine, not localhost

---

## Known Issues

- **[Pipeline / F1]** PyMuPDF only extracts embedded text. Competitor names or data presented strictly as flattened images/logos (without text layers) are missed by the extractor. Workaround: Accept limitation for hackathon; future enhancement to use Gemini Vision API for slide OCR.
<!-- Format:
- **[Component/Module]** Description of issue. Workaround if any.
-->

---

## Decisions Log

*Every non-trivial decision made during development goes here.
Future sessions must not re-litigate decisions already logged.*

| # | Decision | Why | Affects |
|---|---|---|---|
| 1 | Use Gemini Flash-Lite only for scorecard (F8) | Preserve Flash quota (500 RPD) for complex reasoning | `scorecard.py`, `gemini_client.py` |
| 2 | Navigate to `/loading` immediately on upload, before analysis returns | Perceived performance — investor should never see a waiting button | `UploadPage.jsx`, `api/analyse.js` |
| 3 | Optimistic step advancement on loading page (2–3s early) | Makes 60–120s wait feel active and structured | `LoadingPage.jsx` |
| 4 | F3 and F6 are cuttable — merge as text flags into scorecard if behind schedule | F7 (questions) is the demo centrepiece, protect its build time | `traction_validator.py`, `financial_flags.py` |
| 5 | Desktop-first layout (1280px primary), minimum viable at 768px | Investors use laptops — mobile is not a priority for this hackathon | All layout components |

*Add new rows here as decisions are made during development.*

---

## Cut Scope (if behind schedule)

If the team is behind at Hour 10, cut in this order:

1. **Cut F6 (`financial_flags.py`)** — merge flags as a text array into scorecard prompt
2. **Cut F3 (`traction_validator.py`)** — merge basic traction flags into F1 claim extractor output
3. **Never cut F7 (question generator)** — it is the highest-impact output for the demo
4. **Never cut the loading page animations** — perceived performance is part of the pitch

---

*DealLens Progress Tracker · Update at the end of every session*
