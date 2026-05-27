from __future__ import annotations
from functools import lru_cache
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langfuse import observe
from app.core.config import settings
from app.core.logging import get_logger



log = get_logger(__name__)

EMBEDDING_DIM = 768
MAX_TEXT_CHARS = 30_000




@lru_cache(maxsize=1)
def get_embedder() -> GoogleGenerativeAIEmbeddings:
    # gemini-embedding-001 is the current production model. Default dim
    # is 3072 — we truncate to 768 via output_dimensionality to match
    # the pgvector column. The model normalizes truncated vectors.
    return GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=settings.GEMINI_API_KEY.get_secret_value(),
        output_dimensionality=EMBEDDING_DIM,
    )


@observe(name="embedding.compute")
async def compute_embedding(text: str) -> list[float]:
    """
    Returns a 768-dim float vector. Text is truncated at 30k chars —
    the API hard limit is ~36k but we leave headroom for tokenization.
    """
    if not text or not text.strip():
        raise ValueError("Cannot embed empty text")

    embedder = get_embedder()
    truncated = text[:MAX_TEXT_CHARS]
    vector = await embedder.aembed_query(truncated)

    if len(vector) != EMBEDDING_DIM:
        raise RuntimeError(
            f"Expected {EMBEDDING_DIM}-dim embedding, got {len(vector)}"
        )
    return vector