from __future__ import annotations
import time
import uuid
from typing import TypeVar
from langfuse import observe
from pydantic import BaseModel, ValidationError
from app.ai import cache as gw_cache
from app.ai import circuit_breaker as cb
from app.ai import providers as provider_registry
from app.ai.capabilities import Capability
from app.ai.catalog import ModelSpec, resolve
from app.ai.guards import UNTRUSTED_SYSTEM_RULE
from app.ai.providers.base import NonRetryableError, ProviderError, ProviderResult
from app.ai.telemetry import record_call
from app.core.logging import get_logger
from app.mcp.events import EventType, ModelTrace, publish_event





log = get_logger(__name__)

T = TypeVar("T", bound=BaseModel)

REPAIR_INSTRUCTION = (
    "Your previous response failed validation:\n{err}\n\n"
    "Return ONLY valid JSON matching the schema. No prose. No markdown fences."
)



def _estimate_cost_usd(spec: ModelSpec, p: ProviderResult) -> float:
    return (
        (p.input_tokens / 1000.0) * spec.input_usd_per_1k
        + (p.output_tokens / 1000.0) * spec.output_usd_per_1k
    )




async def _eligible(spec: ModelSpec) -> bool:
    if await cb.is_provider_tripped(spec.provider):
        return False
    if spec.provider == "aiml":
        budget = await cb.aiml_budget_remaining_usd()
        if budget <= 0:
            return False
    return True






@observe(name="gateway.reason")
async def reason(
    *,
    task: str,
    capability: Capability,
    schema: type[T],
    system_prompt: str,
    user_prompt: str,
    run_id: uuid.UUID | None = None,
    cache: bool = True,
    max_repair_attempts: int = 2,
) -> T:
    full_system = f"{UNTRUSTED_SYSTEM_RULE}\n\n{system_prompt}"
    key = gw_cache.cache_key(task, capability.value, full_system + "\n" + user_prompt)

    if cache:
        cached = await gw_cache.get(key)
        if cached is not None:
            log.info("gateway_cache_hit", task=task)
            await record_call(
                run_id=run_id,
                task=task,
                capability=capability.value,
                provider="cache",
                model="cache",
                status="ok",
                latency_ms=0,
                input_tokens=0,
                output_tokens=0,
                est_cost_usd=0.0,
                cache_hit=True,
            )
            return schema.model_validate(cached)

    candidates = resolve(capability)
    last_err: Exception | None = None

    for spec in candidates:
        if not await _eligible(spec):
            log.info("gateway_skip_ineligible", provider=spec.provider, model=spec.model)
            continue

        provider = provider_registry.get(spec.provider)

        if run_id is not None:
            await publish_event(
                run_id,
                EventType.THINK,
                {
                    "kind": "model_routing",
                    "task": task,
                    "capability": capability.value,
                    "trace": ModelTrace(
                        provider=spec.provider, model=spec.model
                    ).__dict__,
                    "text": f"Routing to {spec.model} via {spec.provider.upper()}",
                },
            )

        attempt_prompt = user_prompt
        for attempt in range(max_repair_attempts + 1):
            t0 = time.perf_counter()
            try:
                pr = await provider.chat_structured(
                    model=spec.model,
                    system_prompt=full_system,
                    user_prompt=attempt_prompt,
                    schema=schema,
                )
            except ProviderError as exc:
                latency_ms = int((time.perf_counter() - t0) * 1000)
                await record_call(
                    run_id=run_id, task=task, capability=capability.value,
                    provider=spec.provider, model=spec.model,
                    status="error", latency_ms=latency_ms,
                    input_tokens=0, output_tokens=0, est_cost_usd=0.0,
                    cache_hit=False, error_text=str(exc),
                )
                if isinstance(exc, NonRetryableError):
                    last_err = exc
                    break   # try next model in chain
                # retryable — trip this provider and try next
                await cb.trip_provider(spec.provider, seconds=300)
                last_err = exc
                break

            latency_ms = int((time.perf_counter() - t0) * 1000)
            cost = _estimate_cost_usd(spec, pr)
            if spec.provider == "aiml":
                await cb.record_aiml_spend_usd(cost)

            try:
                validated = schema.model_validate(pr.raw_json)
            except ValidationError as ve:
                await record_call(
                    run_id=run_id, task=task, capability=capability.value,
                    provider=spec.provider, model=spec.model,
                    status="retry", latency_ms=latency_ms,
                    input_tokens=pr.input_tokens, output_tokens=pr.output_tokens,
                    est_cost_usd=cost, cache_hit=False, error_text=str(ve)[:400],
                )
                if attempt == max_repair_attempts:
                    last_err = ve
                    break
                attempt_prompt = (
                    user_prompt
                    + "\n\n"
                    + REPAIR_INSTRUCTION.format(err=str(ve)[:600])
                )
                continue

            await record_call(
                run_id=run_id, task=task, capability=capability.value,
                provider=spec.provider, model=spec.model,
                status="ok", latency_ms=latency_ms,
                input_tokens=pr.input_tokens, output_tokens=pr.output_tokens,
                est_cost_usd=cost, cache_hit=False,
            )
            if cache:
                await gw_cache.put(key, validated.model_dump())
            return validated

    raise RuntimeError(
        f"All catalog candidates failed for task={task} capability={capability.value}"
    ) from last_err