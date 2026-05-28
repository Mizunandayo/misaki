from __future__ import annotations
from dataclasses import dataclass
from typing import Sequence
from app.ai.capabilities import Capability
from app.core.config import settings





@dataclass(frozen=True)
class ModelSpec:
    provider: str
    model: str
    supports_structured: bool
    input_usd_per_1k: float  
    output_usd_per_1k: float
    max_context_tokens: int




# Provider-agnostic catalog. Order = preference. The gateway iterates this
# list until one succeeds. The final entry is ALWAYS a Gemini model so the
# verified Day 2 path is never at risk.
CATALOG: dict[Capability, Sequence[ModelSpec]] = {
    Capability.FAST_CHEAP: (
        ModelSpec("aiml",   "gpt-4o-mini",    True,  0.00015, 0.0006,  128_000),
        ModelSpec("gemini", "gemini-2.5-flash", True, 0.000075, 0.0003, 1_000_000),
    ),
    Capability.DEEP_REASONING: (
        ModelSpec("aiml",   "gpt-4.1",        True,  0.0030, 0.0120,  1_000_000),
        ModelSpec("aiml",   "gpt-4o",         True,  0.0025, 0.0100,  128_000),
        ModelSpec("gemini", "gemini-2.5-pro", True,  0.00125, 0.0050, 2_000_000),
    ),
    Capability.LONG_CONTEXT: (
        ModelSpec("aiml",   "gpt-4.1",        True,  0.0030, 0.0120,  1_000_000),
        ModelSpec("gemini", "gemini-2.5-pro", True,  0.00125, 0.0050, 2_000_000),
    ),
    Capability.LONG_FORM_PROSE: (
        ModelSpec("aiml",   "gpt-4o",         True,  0.0025, 0.0100,  128_000),
        ModelSpec("gemini", "gemini-2.5-pro", True,  0.00125, 0.0050, 2_000_000),
    ),
    Capability.VISION: (
        ModelSpec("aiml",   "gpt-4o",         True,  0.0025, 0.0100,  128_000),
        ModelSpec("gemini", "gemini-2.5-pro", True,  0.00125, 0.0050, 2_000_000),
    ),
}






def resolve(cap: Capability) -> list[ModelSpec]:
    candidates = list(CATALOG[cap])
    if not settings.aiml_enabled or settings.LLM_PROVIDER == "gemini":
        candidates = [c for c in candidates if c.provider == "gemini"]
    return candidates