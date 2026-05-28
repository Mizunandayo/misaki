from __future__ import annotations
import abc
from dataclasses import dataclass
from typing import Any

from pydantic import BaseModel





class ProviderError(Exception):
    """Base provider exception."""
    retryable: bool = False


class RetryableError(ProviderError):
    retryable = True


class NonRetryableError(ProviderError):
    retryable = False


@dataclass
class ProviderResult:
    raw_json: dict[str, Any]
    input_tokens: int
    output_tokens: int


class Provider(abc.ABC):
    name: str

    @abc.abstractmethod
    async def chat_structured(
        self,
        *,
        model: str,
        system_prompt: str,
        user_prompt: str,
        schema: type[BaseModel],
        timeout_seconds: int = 60,
    ) -> ProviderResult: ...