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

*Update this table at the end of every session. One row per session.*

---

## Environment Setup

- [ ] Node.js + Vite project initialised at `frontend/`
- [ ] Tailwind configured with design tokens from `design.md` section 2
- [ ] Geist font loaded in `index.html`
- [ ] `shimmer` and `fadeIn` animations added to `tailwind.config.js`
- [ ] React Router installed and configured
- [ ] Axios installed

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

- [ ] **F2 — `pipeline/tam_checker.py`**
  - [ ] `prompts/tam_validation.py` prompt written
  - [ ] Tavily search → Gemini Flash analysis
  - [ ] Returns `{ verdict, claimed_tam, real_tam, inflation_factor, explanation, source, investor_question }`

- [ ] **F4 — `pipeline/moat_tester.py`**
  - [ ] `prompts/moat.py` prompt written
  - [ ] Serper competitor search → Gemini Flash analysis
  - [ ] Returns `{ verdict, claimed_moat, explanation, investor_question, competitors[] }`

- [ ] **F5 — `pipeline/founder_intel.py`**
  - [ ] `prompts/founder.py` prompt written
  - [ ] Tavily + Crunchbase parallel fetch → Gemini Flash synthesis
  - [ ] Returns `{ name, role, domain_fit, domain_fit_reason, verdict, past_ventures[], credibility_signals[], red_flags[], public_summary }`

- [ ] **F7 — `pipeline/question_gen.py`** ← never cut
  - [ ] `prompts/questions.py` prompt written
  - [ ] Gemini Flash call on full analysis context
  - [ ] Returns exactly 5 questions with all required fields

- [ ] **F8 — `pipeline/scorecard.py`**
  - [ ] `prompts/scorecard.py` prompt written
  - [ ] Gemini Flash-Lite call (not Flash)
  - [ ] Returns `{ startup_name, overall, dimensions{}, top_flags[], strengths[] }`

- [ ] **F3 — `pipeline/traction_validator.py`** *(cut if behind schedule)*
  - [ ] `prompts/traction.py` prompt written
  - [ ] Gemini Flash only (no external search)
  - [ ] Returns `{ flags[] }`

- [ ] **F6 — `pipeline/financial_flags.py`** *(cut if behind schedule)*
  - [ ] `prompts/financials.py` prompt written
  - [ ] Gemini Flash only (no external search)
  - [ ] Returns `{ flags[] }`

### Integration

- [ ] `asyncio.gather()` wiring — Tavily + Serper + Crunchbase fire in parallel
- [ ] Full pipeline assembled in `routers/analyse.py`
- [ ] Report JSON saved to Supabase on completion
- [ ] `GET /report/{id}` fetches from Supabase correctly
- [ ] End-to-end test: real PDF in → full report JSON out
- [ ] Error handling: all module failures return correct status codes
- [ ] Retry logic verified: 429 from Gemini does not crash the request

---

## Frontend Progress

### Infrastructure

- [ ] `App.jsx` — React Router with `/`, `/loading`, `/report/:id`, `*` routes
- [ ] `data/mockReport.js` — full mock JSON matching `architecture.md` section 10 schema
- [ ] `api/analyse.js` — Axios `POST /analyse` (multipart) and `GET /report/:id`
- [ ] `hooks/useScrollSpy.js` — IntersectionObserver for sidebar highlight

### Shared Components (`components/shared/`)

- [ ] `Skeleton.jsx` — shimmer animation, accepts `className`
- [ ] `ErrorBoundary.jsx` — wraps sections, renders `<SectionError>` fallback
- [ ] `VerdictBadge.jsx` — derives colour from verdict enum, never hardcoded
- [ ] `ScoreBar.jsx` — derives colour from score value (green/amber/red)
- [ ] `StatCard.jsx` — eyebrow + value (font-mono) + label
- [ ] `ReportCard.jsx` — eyebrow + title + children shell
- [ ] `DataTable.jsx` — left-aligned, hover-only rows, overflow-x-auto
- [ ] `ThreatCell.jsx` — threat level badge with semantic colour
- [ ] `ExpandableRow.jsx` — toggle open/close for table row details
- [ ] `QuestionCard.jsx` — collapsible, closed by default, all 5 fields

### Pages & Sections

- [ ] **`UploadPage.jsx`**
  - [ ] Idle state — drop zone, trust signals
  - [ ] Drag-over state — border + bg swap instantly
  - [ ] File-selected state — filename, size, Analyse button
  - [ ] Uploading state — spinner, disabled, pulse border
  - [ ] Error state — red border, message, auto-clears after 3s
  - [ ] Navigates to `/loading` immediately on upload success

- [ ] **`LoadingPage.jsx`**
  - [ ] 5 steps with done/active/pending visual states
  - [ ] Optimistic step timing (steps 1–4 advance 2–3s early)
  - [ ] Smooth progress bar (`transition-all duration-1000`)
  - [ ] Rotating insight card every 8 seconds
  - [ ] Navigates to `/report/:id` on API response

- [ ] **`ReportPage.jsx`** — sidebar + scroll layout shell
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

- [ ] Frontend connected to live backend (`VITE_API_URL` in `.env`)
- [ ] Real PDF upload → loading page → report page with live data
- [ ] Mock data (`mockReport.js`) removed from render path
- [ ] All skeleton states tested with real API latency
- [ ] All error boundaries tested with malformed data

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

*None yet — add issues here as they are discovered.*

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
