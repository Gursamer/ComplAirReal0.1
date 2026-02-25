from __future__ import annotations

from dataclasses import dataclass


@dataclass
class LLMResponse:
    text: str
    provider: str


class LLMProvider:
    name: str = "base"

    def generate(self, prompt: str, *, temperature: float = 0.2, max_tokens: int = 220) -> LLMResponse:
        raise NotImplementedError
