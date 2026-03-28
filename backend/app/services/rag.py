"""
RAG (Retrieval-Augmented Generation) pipeline.

Steps:
1. Embed the user query using OpenAI embeddings
2. Search FAISS index for top-k matching constitutional articles
3. Send retrieved articles + query to LLM
4. Parse and return structured AskResponse

Setup (run once before demo):
    python -m app.services.rag --build
"""

import os
import json
import re
from pathlib import Path

import numpy as np

from app.models.schemas import AskResponse
from app.services import llm

DATA_DIR = Path(__file__).parent.parent.parent / "data"
CONSTITUTION_PATH = DATA_DIR / "constitution.json"
FAISS_INDEX_PATH = DATA_DIR / "faiss_index" / "index.faiss"
FAISS_META_PATH = DATA_DIR / "faiss_index" / "metadata.json"

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "text-embedding-3-small")
TOP_K = 5

# Lazy-loaded globals
_faiss_index = None
_metadata: list[dict] = []


def _load_index():
    global _faiss_index, _metadata
    if _faiss_index is not None:
        return

    try:
        import faiss  # type: ignore

        _faiss_index = faiss.read_index(str(FAISS_INDEX_PATH))
        with open(FAISS_META_PATH, "r", encoding="utf-8") as f:
            _metadata = json.load(f)
    except Exception as e:
        raise RuntimeError(
            f"FAISS index not found. Run: python -m app.services.rag --build\nError: {e}"
        )


async def _embed(text: str) -> list[float]:
    """Generate embedding for a single text using OpenAI."""
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    response = await client.embeddings.create(input=text, model=EMBEDDING_MODEL)
    return response.data[0].embedding


async def retrieve(query: str, k: int = TOP_K) -> list[dict]:
    """Find the top-k most relevant constitutional articles for a query."""
    _load_index()
    import faiss  # type: ignore

    embedding = await _embed(query)
    query_vector = np.array([embedding], dtype=np.float32)

    distances, indices = _faiss_index.search(query_vector, k)  # type: ignore[union-attr]

    results = []
    for idx in indices[0]:
        if idx != -1 and idx < len(_metadata):
            results.append(_metadata[idx])
    return results


async def query(user_question: str) -> AskResponse:
    """
    Full RAG pipeline: retrieve relevant articles, then ask the LLM.
    Returns a structured AskResponse.
    """
    # Retrieve relevant constitutional articles
    articles = await retrieve(user_question)

    if not articles:
        return AskResponse(
            answer="I could not find relevant constitutional articles for your question. Please try rephrasing, or consult a lawyer directly.",
            articles_cited=[],
            action_steps=["Contact the Legal Aid Commission at 0302-664-951"],
            disclaimer="This is guidance, not legal advice. Consult a qualified lawyer for legal matters.",
        )

    # Ask LLM with retrieved context
    llm_response = await llm.complete(query=user_question, context_articles=articles)

    # Extract cited article numbers from the response
    cited = list(set(re.findall(r'Article \d+(?:\(\d+\))?(?:\([a-z]\))?', llm_response)))

    # Extract action steps (lines starting with numbers or bullet points after "action")
    action_steps: list[str] = []
    lines = llm_response.split('\n')
    in_action_section = False
    for line in lines:
        line = line.strip()
        if 'action' in line.lower() or 'what to do' in line.lower() or 'step' in line.lower():
            in_action_section = True
        if in_action_section and line and (line[0].isdigit() or line.startswith('-') or line.startswith('•')):
            cleaned = re.sub(r'^[\d\.\-•\*]\s*', '', line).strip()
            if cleaned:
                action_steps.append(cleaned)

    # If no action steps extracted, provide a default
    if not action_steps:
        action_steps = ["Consult the Legal Aid Commission for further assistance: 0302-664-951"]

    return AskResponse(
        answer=llm_response,
        articles_cited=cited,
        action_steps=action_steps,
        disclaimer="This is guidance, not legal advice. Consult a qualified lawyer for legal matters.",
    )


# --- Index builder (run once) ---

def build_index():
    """
    Build the FAISS index from constitution.json.
    Run this once before the demo: python -m app.services.rag --build
    """
    import asyncio
    import faiss  # type: ignore
    from openai import OpenAI

    print("Loading constitution chunks...")
    with open(CONSTITUTION_PATH, "r", encoding="utf-8") as f:
        chunks: list[dict] = json.load(f)

    print(f"Embedding {len(chunks)} chunks...")
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

    texts = [f"{c.get('article_number', '')} {c.get('title', '')} {c.get('text', '')}" for c in chunks]
    embeddings_response = client.embeddings.create(input=texts, model=EMBEDDING_MODEL)
    embeddings = [e.embedding for e in embeddings_response.data]

    vectors = np.array(embeddings, dtype=np.float32)
    dimension = vectors.shape[1]

    print(f"Building FAISS index (dim={dimension})...")
    index = faiss.IndexFlatL2(dimension)
    index.add(vectors)

    FAISS_INDEX_PATH.parent.mkdir(parents=True, exist_ok=True)
    faiss.write_index(index, str(FAISS_INDEX_PATH))

    with open(FAISS_META_PATH, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)

    print(f"Done! Index saved to {FAISS_INDEX_PATH}")
    print(f"Metadata saved to {FAISS_META_PATH}")


if __name__ == "__main__":
    import sys
    from dotenv import load_dotenv

    load_dotenv(Path(__file__).parent.parent.parent / ".env")

    if "--build" in sys.argv:
        build_index()
    else:
        print("Usage: python -m app.services.rag --build")
