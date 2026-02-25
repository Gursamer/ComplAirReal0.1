from __future__ import annotations

import json
from urllib.error import URLError
from urllib.request import Request, urlopen

from app.config import settings
from app.llm.providers.base import LLMProvider, LLMResponse


class OllamaProvider(LLMProvider):
    name = "ollama"

    def generate(self, prompt: str, *, temperature: float = 0.2, max_tokens: int = 220) -> LLMResponse:
        endpoint = settings.ollama_url.rstrip("/") + "/api/generate"
        payload = {
            "model": settings.ollama_model,
            "prompt": prompt,
            "stream": False,
            "options": {
                "temperature": max(0.0, float(temperature)),
                "num_predict": max(60, int(max_tokens)),
            },
        }
        body = json.dumps(payload).encode("utf-8")
        req = Request(endpoint, data=body, headers={"Content-Type": "application/json"}, method="POST")
        timeout_secs = max(5, int(settings.llm_timeout_ms / 1000))
        try:
            with urlopen(req, timeout=timeout_secs) as response:
                raw = response.read().decode("utf-8")
        except URLError as exc:
            raise RuntimeError(f"Ollama connection failed: {exc}") from exc
        except Exception as exc:
            raise RuntimeError(f"Ollama request failed: {exc}") from exc

        try:
            data = json.loads(raw)
        except Exception as exc:
            raise RuntimeError("Invalid Ollama response payload") from exc

        text = str(data.get("response", "")).strip()
        if not text:
            raise RuntimeError("Ollama returned empty text")
        return LLMResponse(text=text, provider=self.name)
