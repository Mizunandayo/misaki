"""Direct AI/ML API probe — bypasses the gateway to see the FULL upstream
error body. Tries three increasingly conservative request shapes:

  1. response_format = json_schema (strict) — what the gateway uses
  2. response_format = json_object — looser JSON mode
  3. No response_format at all — plain chat completion

Whichever one succeeds tells us what the gateway needs to use."""

from __future__ import annotations

import asyncio
import json
from typing import Any

import httpx

from app.core.config import settings


SIMPLE_SCHEMA = {
    "type": "object",
    "properties": {
        "passes": {"type": "boolean"},
        "reason": {"type": "string"},
        "confidence": {"type": "integer"},
    },
    "required": ["passes", "reason", "confidence"],
    "additionalProperties": False,
}


async def call(model: str, body: dict[str, Any], label: str) -> None:
    url = f"{str(settings.AIML_BASE_URL).rstrip('/')}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.AIML_API_KEY.get_secret_value()}",
        "Content-Type": "application/json",
        "User-Agent": "misaki/0.3 (probe)",
    }
    print(f"\n--- {label} | model={model} ---")
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(url, headers=headers, json=body)
        print(f"HTTP {r.status_code}")
        print("Response body:")
        try:
            print(json.dumps(r.json(), indent=2)[:2000])
        except Exception:
            print(r.text[:2000])
    except Exception as exc:
        print(f"Transport error: {exc}")


def base_messages():
    return [
        {
            "role": "system",
            "content": (
                "Return ONLY a JSON object with EXACTLY these keys: "
                "passes (boolean true), reason (string 'probe ok'), "
                "confidence (integer 100)."
            ),
        },
        {"role": "user", "content": "Probe."},
    ]


async def main() -> None:
    if not settings.aiml_enabled:
        print("AIML_API_KEY is empty — set it in .env first.")
        return

    print(f"Base URL: {settings.AIML_BASE_URL}")
    print(f"Key length: {len(settings.AIML_API_KEY.get_secret_value())}")

    # Test each model the catalog points at.
    for model in ("gpt-4o-mini", "gpt-4.1", "gpt-4o"):
        # 1. Strict JSON schema (what the gateway sends today)
        await call(
            model,
            {
                "model": model,
                "messages": base_messages(),
                "response_format": {
                    "type": "json_schema",
                    "json_schema": {
                        "name": "probe",
                        "strict": True,
                        "schema": SIMPLE_SCHEMA,
                    },
                },
                "temperature": 0,
            },
            label="strict json_schema",
        )

        # 2. Loose json_object mode
        await call(
            model,
            {
                "model": model,
                "messages": base_messages(),
                "response_format": {"type": "json_object"},
                "temperature": 0,
            },
            label="json_object",
        )

        # 3. No response_format at all — bare chat completion
        await call(
            model,
            {
                "model": model,
                "messages": base_messages(),
                "temperature": 0,
            },
            label="no response_format",
        )


if __name__ == "__main__":
    asyncio.run(main())
