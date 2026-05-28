"""Quick read of the model_calls telemetry table.

Usage:
    uv run python -m scripts.check_telemetry              # last 15 minutes
    uv run python -m scripts.check_telemetry 60           # last 60 minutes
"""

from __future__ import annotations

import asyncio
import sys

from sqlalchemy import text

from app.db.session import session_scope


async def main(window_minutes: int) -> None:
    sql = text(
        """
        SELECT provider,
               model,
               status,
               COUNT(*)                                 AS n,
               ROUND(AVG(latency_ms))::int             AS avg_ms,
               ROUND(SUM(est_cost_usd)::numeric, 5)    AS total_usd,
               SUM(input_tokens)                       AS in_tok,
               SUM(output_tokens)                      AS out_tok
          FROM model_calls
         WHERE occurred_at > NOW() - make_interval(mins => :m)
         GROUP BY provider, model, status
         ORDER BY n DESC
        """
    )
    async with session_scope() as session:
        rows = (await session.execute(sql, {"m": window_minutes})).mappings().all()

    if not rows:
        print(f"No model_calls in the last {window_minutes} minutes.")
        return

    print(f"{'provider':<10} {'model':<22} {'status':<8} {'n':>4} "
          f"{'avg_ms':>8} {'total_usd':>10} {'in_tok':>8} {'out_tok':>8}")
    print("-" * 90)
    for r in rows:
        print(
            f"{r['provider']:<10} {r['model']:<22} {r['status']:<8} "
            f"{r['n']:>4} {r['avg_ms']:>8} "
            f"{str(r['total_usd']):>10} "
            f"{r['in_tok']:>8} {r['out_tok']:>8}"
        )


if __name__ == "__main__":
    minutes = int(sys.argv[1]) if len(sys.argv) > 1 else 15
    asyncio.run(main(minutes))
