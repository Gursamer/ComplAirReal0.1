# ComplyAI Frontend (Phase 3 Investor Demo)

Next.js web app for the ComplyAI investor demo UI.

## Stack

- Next.js (App Router + TypeScript)
- Tailwind CSS
- Recharts
- Framer Motion

## Features

- Marketing landing page
- Product dashboard with charts and recent reports
- Upload + analyze flow with staged progress animation
- Report results page with:
  - overall score + severity
  - KPI cards
  - 2 charts (category donut + top-risk bar)
  - flagged clauses accordion
  - suggested fixes with copy button
  - GDPR citations
  - JSON export
- Reports list with search/filter/sort
- Settings page (API base URL + demo theme toggle)
- Demo auth gate (mock sign-in)

## Setup

1. Start backend API in another terminal:

```bash
cd complyai
source .venv/bin/activate
uvicorn app.api.main:app --host 0.0.0.0 --port 8000 --reload
```

2. Start frontend:

```bash
cd complyai/frontend
cp .env.example .env.local
npm install
npm run dev
```

3. Open:

- http://localhost:3000

## Environment

`.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Notes

- UI has a normalization layer so backend payload variations are handled safely.
- If your backend is on a different host/port, update it on the Settings page or `.env.local`.
