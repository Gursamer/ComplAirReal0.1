# ComplyAI Frontend (Phase 3 Investor Demo)

Next.js web app for the ComplyAI investor demo UI.

Design system + motion roadmap:

- `DESIGN_SYSTEM.md`

## Stack

- Next.js (App Router + TypeScript)
- Tailwind CSS
- Recharts
- Framer Motion

## Features

- Marketing landing page
- Investor brief page (`/investor`)
- Product dashboard with charts and recent reports
- Upload + analyze flow with staged progress animation
  - profile selector: GDPR / SOC 2 / PCI DSS / Multi
- Report results page with:
  - overall score + severity
  - KPI cards
  - 2 charts (category donut + top-risk bar)
  - flagged clauses accordion
  - suggested fixes with copy button
  - GDPR citations
  - JSON export
  - PDF export
  - offline AI copilot chat panel with citation-aware responses
- Reports list with search/filter/sort
- Settings page (API base URL + demo theme toggle)
- Real JWT auth flow (signup/login/logout)
- Chat panel uses backend `/chat` when available, then falls back to local demo responder

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

4. Create an account:

- Visit `/signup`, create user, then enter dashboard.

## Environment

`.env.local`

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## Notes

- UI has a normalization layer so backend payload variations are handled safely.
- If your backend is on a different host/port, update it on the Settings page or `.env.local`.
- Auth users are stored locally via backend `AUTH_USERS_FILE` (default `storage/auth/users.json`).
