"""Gemini client wrapper. flash for cheap, high-volume triage, and pro for deep reasnoning on bills that pass triage"""

from __future__ import annotations

import asyncio
from functools import lru_cache
from typing import TypeVar

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.exceptions import OutputParserException
from langfuse import observe
from pydantic import BaseModel, ValidationError

from app.core.config import settings
from app.core.logging import get_logger




log = get_logger(__name__)

T = TypeVar("T", bound=BaseModel)





@lru_cache(maxsize=1)
def get_flash() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GEMINI_API_KEY.get_secret_value(),
        temperature=0.0,
        timeout=30,
        max_retries=1,
    )


@lru_cache(maxsize=1)
def get_pro() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model="gemini-2.5-pro",
        google_api_key=settings.GEMINI_API_KEY.get_secret_value(),
        temperature=0.0,
        timeout=90,
        max_retries=1,
    )




@observe(name="gemini.structured")
async def structured_call(
    model: ChatGoogleGenerativeAI,
    *,
    schema: type[T],
    system_prompt: str,
    user_prompt: str,
    max_repair_attempts: int = 2,
) -> T:
    "Invoke Gemini with structured output enforcement."
    structured = model.with_structured_output(schema, method="json_mode")

    messages = [
        ("system", system_prompt),
        ("human", user_prompt),
    ]

    last_error: Exception | None = None
    for attempt in range(max_repair_attempts + 1):
        try:
            result = await structured.ainvoke(messages)
            if not isinstance(result, schema):
                result = schema.model_validate(result)
            return result
        except (ValidationError, OutputParserException) as exc:
            last_error = exc
            log.warning(
                "gemini_structured_repair",
                attempt=attempt + 1,
                schema=schema.__name__,
                error=str(exc)[:400],
            )
            messages = [
                ("system", system_prompt),
                ("human", user_prompt),
                (
                    "human",
                    (
                        "Your previous response failed schema validation with "
                        f"this error:\n\n{exc}\n\n"
                        "Return ONLY valid JSON matching the schema exactly. "
                        "Do not include markdown code fences, prose, or "
                        "explanation outside the JSON object."
                    ),
                ),
            ]
            await asyncio.sleep(0.5 * (attempt + 1))

    log.error("gemini_structured_failed", schema=schema.__name__)
    raise RuntimeError(
        f"Gemini structured output failed after "
        f"{max_repair_attempts + 1} attempts"
    ) from last_error


