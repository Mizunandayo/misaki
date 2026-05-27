"""Cosine similarity search over bills.embedding using the HNSW index."""


from __future__ import annotations
import uuid
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.logging import get_logger




log = get_logger(__name__)



async def find_precedents(
    session: AsyncSession,
    *,
    target_bill_id: uuid.UUID,
    embedding: list[float],
    k: int = 3,
) -> list[dict]:
    """
    Returns: [
      {"id": UUID, "title": str, "jurisdiction": str,
       "bill_number": str, "similarity": float},
      ...
    ]
    Highest similarity first. Cosine distance via pgvector `<=>`.
    Lower distance = higher similarity. We return `1 - distance`.
    """
    embedding_literal = "[" + ",".join(str(v) for v in embedding) + "]"

    query = text(
        """
        SELECT
          id,
          title,
          jurisdiction,
          bill_number,
          1 - (embedding <=> CAST(:emb AS vector)) AS similarity
        FROM bills
        WHERE embedding IS NOT NULL
          AND id <> :target_id
        ORDER BY embedding <=> CAST(:emb AS vector)
        LIMIT :k
        """
    )

    result = await session.execute(
        query,
        {"emb": embedding_literal, "target_id": target_bill_id, "k": k},
    )

    rows = [
        {
            "id": row.id,
            "title": row.title,
            "jurisdiction": row.jurisdiction,
            "bill_number": row.bill_number,
            "similarity": float(row.similarity),
        }
        for row in result
    ]
    log.info("precedent_search", target=str(target_bill_id), found=len(rows))
    return rows