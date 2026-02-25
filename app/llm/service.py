from __future__ import annotations

from app.config import settings
from app.llm.providers.base import LLMProvider, LLMResponse
from app.llm.providers.ollama import OllamaProvider
from app.llm.providers.stub import StubProvider


def provider_or_stub() -> LLMProvider:
    key = settings.llm_provider.strip().lower()
    if key == "ollama":
        return OllamaProvider()
    return StubProvider()


def generate_with_fallback(
    prompt: str,
    *,
    temperature: float = 0.2,
    max_tokens: int = 220,
) -> LLMResponse:
    primary = provider_or_stub()
    try:
        return primary.generate(prompt, temperature=temperature, max_tokens=max_tokens)
    except Exception:
        fallback = StubProvider()
        return fallback.generate(prompt, temperature=temperature, max_tokens=max_tokens)
