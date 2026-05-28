"""Gemini provider — uses langchain's with_structured_output directly with
the real Pydantic class. Don't round-trip through JSON schema; the
conversion loses nested item types (e.g. list[AffectedOperation] collapses
to bare list, then the model fills it with strings)."""

from __future__ import annotations

from langchain_core.exceptions import OutputParserException
from pydantic import BaseModel, ValidationError

from app.ai.gemini import get_flash, get_pro
from app.ai.providers.base import (
    NonRetryableError,
    Provider,
    ProviderResult,
    RetryableError,
)


def _model_for(name: str):
    if "flash" in name:
        return get_flash()
    return get_pro()


class GeminiProvider(Provider):
    name = "gemini"

    async def chat_structured(
        self,
        *,
        model: str,
        system_prompt: str,
        user_prompt: str,
        schema: type[BaseModel],
        timeout_seconds: int = 90,
    ) -> ProviderResult:
        m = _model_for(model)
        structured = m.with_structured_output(schema, method="json_mode")
        try:
            result = await structured.ainvoke(
                [("system", system_prompt), ("human", user_prompt)]
            )
        except (TimeoutError, ConnectionError) as exc:
            raise RetryableError(str(exc)) from exc
        except (ValidationError, OutputParserException) as exc:
            raise NonRetryableError(str(exc)) from exc

        return ProviderResult(
            raw_json=result.model_dump() if isinstance(result, BaseModel) else dict(result),
            input_tokens=0,
            output_tokens=0,
        )
