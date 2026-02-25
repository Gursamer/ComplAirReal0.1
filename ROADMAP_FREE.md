# ComplyAI Free Investor Roadmap

This roadmap converts the product goals into a practical free-only implementation plan.

## Stack (Free Only)

- Frontend: Next.js + Tailwind + Framer Motion + Recharts
- Backend: FastAPI
- Storage: local JSON + SQLite/Postgres local
- Vector DB: Chroma (local)
- Auth: JWT
- Hosting (later): Vercel + Render free tiers
- LLM: optional, deterministic fallbacks enabled

## Current Status Snapshot

Already present:

- JWT auth endpoints (`/auth/signup`, `/auth/login`, `/auth/me`)
- Analyze API and report persistence (`/analyze`, `/reports`, `/reports/{id}`)
- Dashboard, upload, analytics, reports list, report detail, settings
- Recharts visualizations
- Framer Motion interactions
- Deterministic no-key fallback path for analysis

Missing or partial:

- Robust multi-document test coverage for pipeline accuracy
- Stronger deterministic clause parsing and risk scoring rules
- Persistent relational workspace model (users/documents/reports)
- PDF export endpoint/UI
- AI chat over analyzed document (rule-based local first)
- Multi-regulation selector (GDPR/SOC2/PCI starter rules)
- Diff UI for original vs suggested clauses
- Premium dark theme polish across product

## Phase Plan

### Phase 1: Stable Core

Goal: reliable local analysis output.

- [ ] Fix remaining pipeline edge-case bugs from sample docs
- [ ] Validate output with at least 3 sample documents
- [ ] Strengthen risk scoring heuristics with deterministic rules
- [ ] Improve clause extraction quality and normalization
- [ ] Add regression tests for scoring/extraction/report schema

Deliverable:

- CLI+API pipeline that consistently writes complete report JSON

### Phase 2: Investor UI Baseline

Goal: polished product flow.

- [x] Auth (JWT)
- [x] Dashboard + charts
- [x] Upload + analyze flow
- [x] Results view with clauses/fixes/citations
- [x] Report history list with search/filter/sort
- [ ] Tighten loading/empty/error states for every page

Deliverable:

- End-to-end user flow from signup to reviewed report

### Phase 3: Investor Demo Features

Goal: SaaS realism.

- [x] Report history views
- [x] Risk trend and category charts
- [x] PDF export (backend + frontend action)
- [x] Workspace simulation model (user -> documents -> reports)
- [ ] Premium dark theme variant and visual polish

Deliverable:

- Demo experience that feels production-oriented

### Phase 4: Advanced Free Features

Goal: depth without paid APIs.

- [x] Local rule-based chat over report/clause context
- [ ] Compliance score history chart refinements
- [ ] Original vs suggested clause comparison with highlights
- [x] Multi-regulation mode with selector and base rule packs

Deliverable:

- Higher perceived intelligence and extensibility

### Phase 5: Optional Demo Enhancers

Goal: investor-friendly packaging.

- [x] Pricing page UI (`/pricing`)
- [ ] Seed richer demo data sets for charts/reports
- [ ] Add scripted demo walkthrough notes

Deliverable:

- Narrative-ready investor demo environment

## Suggested Next Build Order

1. Add deterministic scoring/parsing tests and edge-case fixes.
2. Implement PDF export endpoint and “Export PDF” action in report page.
3. Introduce SQLite schema for users/documents/reports.
4. Add regulation selector and starter SOC2/PCI rules.
5. Add clause diff component and local chat panel.
