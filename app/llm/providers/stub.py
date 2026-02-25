from __future__ import annotations

from app.llm.providers.base import LLMProvider, LLMResponse


class StubProvider(LLMProvider):
    name = "stub"

    def generate(self, prompt: str, *, temperature: float = 0.2, max_tokens: int = 220) -> LLMResponse:
        # Deterministic fallback output used when local model is unavailable.
        lines = [
            "Use precise, auditable language with explicit obligations and time bounds.",
            "Include breach notification, security controls, and controller/processor duties where relevant.",
            "Preserve business meaning while tightening enforceability.",
        ]
        return LLMResponse(text=" ".join(lines), provider=self.name)
