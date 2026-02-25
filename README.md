# ComplyAI (Week 1 MVP - GDPR First)

Local CLI prototype for contract/privacy document analysis:

- Extract clauses from PDF
- Match clauses to relevant GDPR articles (RAG)
- Score risk and identify issues
- Suggest improved clause text
- Save a structured JSON report

## Roadmap

Free-only investor roadmap and implementation tracker:

- `ROADMAP_FREE.md`
- `INVESTOR_READINESS.md`
- `INVESTOR_DEMO_SCRIPT.md`

## Setup

```bash
cd complyai
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Configure `.env`:

```env
OPENAI_API_KEY=...
MODEL_TEXT=gpt-4.1-mini
MODEL_EMBED=text-embedding-3-small
CHROMA_DIR=storage/chroma
REPORT_DIR=storage/reports
SQLITE_DB_FILE=storage/workspace.db
CLAUSE_TOP_K=3
ENABLE_LLM_RISK_EXPLANATIONS=0
LLM_PROVIDER=stub
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5:1.5b
LLM_TIMEOUT_MS=20000
```

## Build GDPR index

```bash
python -m app.rag.build_index
```

## Run full analysis

```bash
python -m app.pipeline.run_pipeline --file data/samples/contracts/sample_vendor_agreement.pdf
```

## Run API (Week 3)

```bash
uvicorn app.api.main:app --host 0.0.0.0 --port 8000 --reload
```

Endpoints:

- `POST /auth/signup` -> create account + return JWT
- `POST /auth/login` -> login + return JWT
- `GET /auth/me` -> validate JWT
- `POST /analyze` (multipart upload with PDF/DOCX/TXT + optional `profile=gdpr|soc2|pci|multi` + bearer token) -> returns report JSON
- `GET /reports/{id}` -> returns stored report JSON
- `GET /reports` -> lists stored reports
- `GET /reports/{id}/export.pdf` -> exports report as PDF
- `POST /chat` (`report_id`, `question`) -> grounded answer + citations (local LLM or free stub)

Example curl:

```bash
curl -X POST "http://127.0.0.1:8000/analyze" \
  -H "Authorization: Bearer <token>" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@data/samples/contracts/sample_vendor_agreement.pdf"
```

## Smoke tests

```bash
python -m unittest app.tests.test_smoke -v
```

## Frontend investor demo (Phase 3)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

Frontend pages:

- `/` marketing landing
- `/login` and `/signup` auth pages
- `/dashboard` dashboard + charts
- `/upload` upload + analyze
- `/analytics` analytics charts
- `/reports` reports list
- `/reports/{id}` detailed report view
- `/settings` API base URL + demo settings

## Output

Report JSON is written to:

- `storage/reports/<doc_hash>.json`

Includes:

- `clauses`
- `gdpr_matches`
- `risk_scores`
- `suggested_fixes`
- `executive_summary`

## Notes

- If `OPENAI_API_KEY` is not set, the pipeline still runs using deterministic local heuristics/fallback embeddings.
- Default `LLM_PROVIDER=stub` is fully free and offline. Set `LLM_PROVIDER=ollama` for local model generation.
- `storage/chroma` is created automatically.

## Free Local LLM (Optional)

```bash
brew install ollama
ollama serve
ollama pull qwen2.5:1.5b
```

Then in `.env` set:

```env
LLM_PROVIDER=ollama
```

This keeps everything local and avoids paid API usage.
