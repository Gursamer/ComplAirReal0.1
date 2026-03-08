# ComplyAI

ComplyAI is a local-first compliance analysis app for contracts and policies.
It can:

- parse PDF/DOCX/TXT documents
- extract clause-like sections
- match clauses to GDPR (and profile-based SOC2/PCI controls)
- score risk with deterministic rules
- propose safer rewrite suggestions
- produce JSON/PDF reports
- answer report-grounded chat questions with citations

The project includes a FastAPI backend and a Next.js frontend investor demo.

## Architecture

High-level components:

- `frontend/`: Next.js App Router UI (upload, reports, dashboard, chat)
- `app/api/`: FastAPI routes (`/analyze`, `/reports`, `/chat`, `/auth`)
- `app/pipeline/`: analysis pipeline (extract -> match -> score -> suggest -> report)
- `app/rag/`: regulation chunking + index build
- `app/utils/`: text extraction/cleanup, hashing, embeddings, auth helpers
- `app/storage/`: SQLite persistence helpers
- `data/regulations/`: GDPR source text and generated chunks
- `storage/`: generated reports, vector index fallback, sqlite db, auth user file

## End-to-End Flow

When a user uploads a file from `/upload`:

1. Frontend sends `POST /analyze` with multipart file + profile (`gdpr|soc2|pci|multi`).
2. Backend extracts text:
   - PDF via `pypdf` with fallback raw decode
   - DOCX via `word/document.xml` parse
   - TXT via UTF-8 decode
3. Pipeline runs:
   - normalize text
   - split into clause-like blocks
   - build clause objects (`C001`, `C002`, ...)
   - retrieve regulation matches (RAG for GDPR, keyword controls for SOC2/PCI)
   - compute clause risk scores/severity
   - generate suggested fixes via LLM provider abstraction
   - compute executive summary
4. Report JSON is saved to `storage/reports/<document_hash>.json`.
5. Report metadata is upserted into SQLite (`storage/workspace.db`).
6. Frontend loads the report, normalizes payload shape, and renders charts/sections.
7. Chat panel calls `/chat`; if unavailable, frontend falls back to local demo responder.

## Core Technologies and Concepts

- FastAPI, Pydantic, multipart uploads
- Next.js 14 (App Router) + TypeScript + Tailwind + Recharts + Framer Motion
- JWT auth (HMAC SHA-256), PBKDF2 password hashing
- SQLite schema + upsert patterns
- Text preprocessing and rule-based clause segmentation
- RAG fundamentals:
  - legal text chunking
  - embedding generation
  - cosine similarity ranking
  - top-k retrieval
- Hybrid matching strategy:
  - semantic retrieval for GDPR
  - keyword scoring for SOC2/PCI controls
- Deterministic risk heuristics + severity thresholds
- LLM provider abstraction (`stub` and `ollama`) with safe fallback behavior

## Backend Quick Start

```bash
cd complyai
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Example `.env`:

```env
OPENAI_API_KEY=
MODEL_TEXT=gpt-4.1-mini
MODEL_EMBED=text-embedding-3-small
CHROMA_DIR=storage/chroma
REPORT_DIR=storage/reports
SQLITE_DB_FILE=storage/workspace.db
AUTH_USERS_FILE=storage/auth/users.json
AUTH_SECRET=change-me-for-production
CLAUSE_TOP_K=3
ENABLE_LLM_RISK_EXPLANATIONS=0
LLM_PROVIDER=stub
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:1.5b
LLM_TIMEOUT_MS=20000
```

Build regulation index:

```bash
python -m app.rag.build_index
```

Run API:

```bash
uvicorn app.api.main:app --host 0.0.0.0 --port 8000 --reload
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

## Frontend Quick Start

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Default URL: `http://localhost:3000`

Set API base in `frontend/.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

## API Endpoints

- `POST /auth/signup`: create account, return JWT
- `POST /auth/login`: login, return JWT
- `GET /auth/me`: validate JWT
- `POST /analyze`: upload file and return report payload
- `GET /reports`: list reports
- `GET /reports/{id}`: fetch one report JSON
- `GET /reports/{id}/export.pdf`: export PDF report
- `POST /chat`: report-grounded Q&A + citations

Analyze example:

```bash
curl -X POST "http://127.0.0.1:8000/analyze" \
  -H "Authorization: Bearer <token>" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "profile=gdpr" \
  -F "file=@data/samples/contracts/sample_vendor_agreement.pdf"
```

## Output and Persistence

- report files: `storage/reports/<doc_hash>.json`
- vector index / fallback artifacts: `storage/chroma/`
- sqlite workspace db: `storage/workspace.db`
- legacy/local auth users file: `storage/auth/users.json`

Report payload includes:

- `clauses`
- `gdpr_matches`
- `risk_scores`
- `suggested_fixes`
- `executive_summary`
- `analysis_profile`
- `regulations`

## Testing

Smoke test:

```bash
python -m unittest app.tests.test_smoke -v
```

Validates:

- clause extraction returns expected structure
- RAG matching returns at least one hit per clause
- report schema shape is intact

## Known Current Behavior

- Backend auth is implemented.
- Frontend auth helpers are implemented.
- Current `/login` and `/signup` routes redirect to `/dashboard` in this demo branch.

## Optional: Free Local LLM via Ollama

```bash
brew install ollama
ollama serve
ollama pull qwen2.5:1.5b
```

Then set in `.env`:

```env
LLM_PROVIDER=ollama
```

If Ollama is unavailable, generation falls back to deterministic `stub` responses.

## Roadmap Docs

- `ROADMAP_FREE.md`
- `INVESTOR_READINESS.md`
- `INVESTOR_DEMO_SCRIPT.md`
