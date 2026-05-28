"""AI/ML API provider — OpenAI Chat Completions compatible.

Strategy: strict response_format=json_schema mode with a schema sanitized
for OpenAI's strict-mode requirements. The schema travels in
response_format (not in the system prompt) so the model sees a clean,
focused instruction. OpenAI enforces the shape; the gateway's repair
loop is fallback for the rare drift.

OpenAI strict mode rules we must satisfy:
  - additionalProperties: false on every object
  - every property must appear in required[]
  - no value-constraint keywords: minimum, maximum, minLength, maxLength,
    pattern, format, minItems, maxItems, multipleOf, exclusive*, default
"""

from __future__ import annotations

import json
from typing import Any

import httpx
from pydantic import BaseModel

from app.ai.providers.base import (
    NonRetryableError,
    Provider,
    ProviderResult,
    RetryableError,
)
from app.core.config import settings


_STRIP_KEYS: frozenset[str] = frozenset(
    {
        "minimum",
        "maximum",
        "exclusiveMinimum",
        "exclusiveMaximum",
        "minLength",
        "maxLength",
        "pattern",
        "format",
        "minItems",
        "maxItems",
        "multipleOf",
        "uniqueItems",
        "default",
    }
)


def _sanitize_for_openai_strict(node: Any) -> Any:
    """Walk a JSON-schema dict, remove keywords OpenAI strict mode rejects,
    and enforce additionalProperties=false + all-required on every object.

    Constraints removed at this layer are re-asserted by the gateway's
    Pydantic validation step after the response arrives — so strictness
    is preserved end-to-end, just relocated."""
    if isinstance(node, dict):
        cleaned: dict[str, Any] = {}
        for k, v in node.items():
            if k in _STRIP_KEYS:
                continue
            cleaned[k] = _sanitize_for_openai_strict(v)
        if cleaned.get("type") == "object" and "properties" in cleaned:
            cleaned["additionalProperties"] = False
            cleaned["required"] = list(cleaned["properties"].keys())
        return cleaned
    if isinstance(node, list):
        return [_sanitize_for_openai_strict(x) for x in node]
    return node


class AIMLProvider(Provider):
    name = "aiml"

    async def chat_structured(
        self,
        *,
        model: str,
        system_prompt: str,
        user_prompt: str,
        schema: type[BaseModel],
        timeout_seconds: int = 60,
    ) -> ProviderResult:
        url = f"{str(settings.AIML_BASE_URL).rstrip('/')}/chat/completions"
        sanitized_schema = _sanitize_for_openai_strict(schema.model_json_schema())
        body = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "response_format": {
                "type": "json_schema",
                "json_schema": {
                    "name": "misaki_structured",
                    "strict": True,
                    "schema": sanitized_schema,
                },
            },
            "temperature": 0,
        }
        headers = {
            "Authorization": f"Bearer {settings.AIML_API_KEY.get_secret_value()}",
            "Content-Type": "application/json",
            "User-Agent": "misaki/0.3 (+hackathon)",
        }
        try:
            async with httpx.AsyncClient(timeout=timeout_seconds) as c:
                r = await c.post(url, headers=headers, json=body)
        except (httpx.TimeoutException, httpx.NetworkError) as exc:
            raise RetryableError(str(exc)) from exc

        if r.status_code == 429 or 500 <= r.status_code < 600:
            raise RetryableError(f"aiml HTTP {r.status_code}: {r.text[:500]}")
        if r.status_code >= 400:
            raise NonRetryableError(f"aiml HTTP {r.status_code}: {r.text[:500]}")

        data = r.json()
        content = data["choices"][0]["message"]["content"]
        usage = data.get("usage") or {}
        return ProviderResult(
            raw_json=json.loads(content),
            input_tokens=int(usage.get("prompt_tokens", 0)),
            output_tokens=int(usage.get("completion_tokens", 0)),
        )
