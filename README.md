<div align="center">

# DealLens

**AI-powered investment co-pilot that fact-checks startup pitch decks in real time.**

[![Live Demo](https://img.shields.io/badge/Live_Demo-deallens.onrender.com-2563EB?style=flat-square)](https://deallens-8fqc.onrender.com/)
[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini API](https://img.shields.io/badge/Gemini_API-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)

</div>

---

## What is DealLens?

Investors and analysts spend hours manually verifying claims in pitch decks — market sizes, competitor landscapes, founder backgrounds. DealLens automates this.

Upload a pitch deck, and DealLens extracts every verifiable claim, cross-references it against live market data using agentic search, and delivers a structured due diligence report — in minutes, not days.

---

## Features

- **Claim Extraction** — Automatically identifies and isolates verifiable claims from uploaded pitch decks
- **Agentic Web Research** — Independently searches the web to validate founders, competitors, and market figures
- **Live Market Cross-referencing** — Checks stated metrics against real-time data sources
- **Due Diligence Dashboard** — Presents findings in a clean, structured report with confidence scores
- **Real-time Updates** — Supabase-powered live dashboard that reflects research progress as it happens

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS |
| Backend | Node.js, Express |
| AI / Agents | Gemini API, Agentic Search Workflows |
| Database | Supabase (Postgres + Realtime) |
| Deployment | Render |

---

## How it Works

```
Upload Pitch Deck
      ↓
Claim Extraction (Gemini API)
      ↓
Agentic Research (Web + Market Data)
      ↓
Cross-verification & Confidence Scoring
      ↓
Structured Due Diligence Report
```

---

## Getting Started

```bash
# Clone the repo
git clone https://github.com/mois-khan/deallens.git
cd deallens

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your Gemini API key and Supabase credentials

# Run locally
npm run dev
```

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_key
SERPER_API_KEY=your_serper_key
CRUNCHBASE_API_KEY=your_crunchbase_key
```

---

## Live Demo

Try it at **[deallens-8fqc.onrender.com/](https://deallens-8fqc.onrender.com/)**

> Note: Hosted on Render's free tier — first load may take 30–60 seconds to spin up.

---

## About

Built by [Md. Mois Khan](https://moiskhan.dev) — a CS student at MREM, Hyderabad, building AI systems that solve real-world problems.

[![Portfolio](https://img.shields.io/badge/Portfolio-moiskhan.dev-2563EB?style=flat-square)](https://moiskhan.dev)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-mois--khan-0A66C2?style=flat-square&logo=linkedin)](https://linkedin.com/in/mois-khan)
