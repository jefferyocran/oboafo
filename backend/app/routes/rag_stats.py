from fastapi import APIRouter

from app.models.schemas import RagStatsResponse
from app.services import rag

router = APIRouter()


@router.get("/rag/stats", response_model=RagStatsResponse)
async def get_rag_stats() -> RagStatsResponse:
    """Chunk count, MiniLM model id, file paths and mtimes for the FAISS index."""
    return rag.rag_stats()
