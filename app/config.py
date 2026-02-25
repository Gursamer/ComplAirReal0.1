from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


def _load_dotenv_if_present(path: str = ".env") -> None:
    env_path = Path(path)
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        raw = line.strip()
        if not raw or raw.startswith("#") or "=" not in raw:
            continue
        key, value = raw.split("=", 1)
        key = key.strip()
        value = value.strip().strip("'\"")
        if key and key not in os.environ:
            os.environ[key] = value


@dataclass
class Settings:
    openai_api_key: str
    model_text: str
    model_embed: str
    chroma_dir: str
    report_dir: str
    clause_top_k: int
    enable_llm_risk_explanations: bool
    auth_secret: str
    auth_users_file: str
    sqlite_db_file: str
    llm_provider: str
    ollama_url: str
    ollama_model: str
    llm_timeout_ms: int

    @property
    def chroma_path(self) -> Path:
        return Path(self.chroma_dir)

    @property
    def report_path(self) -> Path:
        return Path(self.report_dir)

    @property
    def auth_users_path(self) -> Path:
        return Path(self.auth_users_file)

    @property
    def sqlite_db_path(self) -> Path:
        return Path(self.sqlite_db_file)


_load_dotenv_if_present()

_raw_top_k = os.environ.get("CLAUSE_TOP_K", "3")
try:
    _parsed_top_k = int(_raw_top_k)
except ValueError:
    _parsed_top_k = 3

_raw_llm_explain = os.environ.get("ENABLE_LLM_RISK_EXPLANATIONS", "0").strip().lower()
_parsed_llm_explain = _raw_llm_explain in {"1", "true", "yes", "on"}

settings = Settings(
    openai_api_key=os.environ.get("OPENAI_API_KEY", ""),
    model_text=os.environ.get("MODEL_TEXT", "gpt-4.1-mini"),
    model_embed=os.environ.get("MODEL_EMBED", "text-embedding-3-small"),
    chroma_dir=os.environ.get("CHROMA_DIR", "storage/chroma"),
    report_dir=os.environ.get("REPORT_DIR", "storage/reports"),
    clause_top_k=max(1, _parsed_top_k),
    enable_llm_risk_explanations=_parsed_llm_explain,
    auth_secret=os.environ.get("AUTH_SECRET", "change-me-for-production"),
    auth_users_file=os.environ.get("AUTH_USERS_FILE", "storage/auth/users.json"),
    sqlite_db_file=os.environ.get("SQLITE_DB_FILE", "storage/workspace.db"),
    llm_provider=os.environ.get("LLM_PROVIDER", "stub"),
    ollama_url=os.environ.get("OLLAMA_URL", "http://127.0.0.1:11434"),
    ollama_model=os.environ.get("OLLAMA_MODEL", "qwen2.5:1.5b"),
    llm_timeout_ms=max(1000, int(os.environ.get("LLM_TIMEOUT_MS", "20000"))),
)
