"""
RAG (Retrieval-Augmented Generation) pipeline.

Steps:
1. Embed the user query with sentence-transformers (MiniLM) and search FAISS
2. Optionally BM25 over the same chunks; merge rankings with reciprocal rank fusion (RRF)
3. Trigger-based query expansion adds legal vocabulary for informal questions (police, arrest, etc.)
4. Send top-k retrieved articles + query to the LLM; parse AskResponse

Env (optional):
    RAG_TOP_K — final chunks sent to the LLM (default 4)
    RAG_HYBRID — BM25+RRF (default true; set 0 to disable)
    RAG_RETRIEVAL_POOL — FAISS/BM25 candidate pool before fusion (default max(32, TOP_K*8))
    RAG_RRF_K — RRF constant k (default 60)
    RAG_FAISS_PROBE — cap FAISS neighbors per query (default: pool)

Setup (run once after ingest):
    python -m app.services.rag --build
"""

import asyncio
import json
import os
import re
from datetime import datetime, timezone
from pathlib import Path

import numpy as np

from app.models.schemas import AskResponse, RagStatsMtimes, RagStatsPaths, RagStatsResponse, RagStatsRetrieval
from app.services import llm

DATA_DIR = Path(__file__).parent.parent.parent / "data"
CONSTITUTION_PATH = DATA_DIR / "constitution.json"
FAISS_INDEX_PATH = DATA_DIR / "faiss_index" / "index.faiss"
FAISS_META_PATH = DATA_DIR / "faiss_index" / "metadata.json"

EMBEDDING_MODEL = "all-MiniLM-L6-v2"
# Fewer chunks → smaller LLM prompt (helps low org TPM limits, e.g. 10k input tokens/min).
TOP_K = int(os.getenv("RAG_TOP_K", "4"))


def _env_bool(name: str, default: bool) -> bool:
    v = (os.getenv(name) or "").strip().lower()
    if not v:
        return default
    return v not in ("0", "false", "no", "off")


# Wider candidate pool before RRF; FAISS + BM25 merge, then cut to TOP_K.
RETRIEVAL_POOL = int(os.getenv("RAG_RETRIEVAL_POOL", str(max(TOP_K * 8, 32))))
RRF_K = int(os.getenv("RAG_RRF_K", "60"))
HYBRID_BM25 = _env_bool("RAG_HYBRID", True)

# Lazy-loaded globals
_faiss_index = None
_metadata: list[dict] = []
_sentence_model = None
_embed_lock = asyncio.Lock()
_bm25: object | None = None
_bm25_corpus_len: int = -1

# Signals that warmup() has completed; query() awaits this before proceeding.
_warmup_event: asyncio.Event | None = None


def _get_warmup_event() -> asyncio.Event:
    global _warmup_event
    if _warmup_event is None:
        _warmup_event = asyncio.Event()
    return _warmup_event

# (regex, expansion phrase) — boosts Chapter 5 / common user phrasing → legal vocabulary + article hints.
_QUERY_EXPANSION_RULES: list[tuple[re.Pattern[str], str]] = [
    (
        re.compile(
            r"\b(police|cop(s)?|officer|arrest|arrested|detain|detention|custody|handcuff|taken\s+away)\b",
            re.I,
        ),
        "Article 14 15 personal liberty dignity lawful arrest brought before court fair trial procedure",
    ),
    (
        re.compile(
            r"\b(search|seizure|raid|warrant|enter\s+(my\s+)?(house|home|room)|broke\s+in)\b",
            re.I,
        ),
        "Article 14 18 search seizure property home residence privacy",
    ),
    (
        re.compile(r"\b(child|children|minor|juvenile|my\s+kids?|under\s+18)\b", re.I),
        "Article 15 28 dignity rights welfare juvenile treatment custody",
    ),
    (
        re.compile(
            r"\b(free\s+speech|speak|protest|demonstrat|assembly|gathering|press|journalist|media)\b",
            re.I,
        ),
        "Article 21 freedom speech expression assembly association",
    ),
    (
        re.compile(r"\b(vote|voting|election|electoral|register\s+to\s+vote|ballot)\b", re.I),
        "Article 42 45 representation parliament election political party",
    ),
    (
        re.compile(r"\b(land|property|evict|landlord|tenant|stool|compensation|acquisition)\b", re.I),
        "Article 20 257 property land acquisition compensation",
    ),
    (
        re.compile(
            r"\b(work|job|fired|dismiss|employ|wage|salary|labour|labor|union|trade\s+union)\b",
            re.I,
        ),
        "Article 24 work employment trade union association",
    ),
    (
        re.compile(
            r"\b(chraj|human\s+rights\s+commission|administrative\s+justice|complaint\s+against|"
            r"oath\s+of\s+office|public\s+officer\s+misconduct|corruption)\b",
            re.I,
        ),
        "Article 218 Commission Human Rights Administrative Justice investigate complaint",
    ),
    (
        re.compile(r"\b(detain|restriction|restrict|without\s+trial|habeas)\b", re.I),
        "Article 14 19 personal liberty restricted detained court forty-eight hours",
    ),
]


def _get_model():
    """Load sentence-transformers model once and reuse."""
    global _sentence_model
    if _sentence_model is None:
        from sentence_transformers import SentenceTransformer  # type: ignore
        print(f"Loading embedding model '{EMBEDDING_MODEL}'...")
        _sentence_model = SentenceTransformer(EMBEDDING_MODEL)
    return _sentence_model


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


def warmup() -> None:
    """
    Load sentence-transformers model + FAISS once per process.
    Called at app startup so the first /api/ask does not cold-load MiniLM (see terminal log).
    """
    import logging

    log = logging.getLogger(__name__)
    log.info("RAG warmup: loading embedding model %r and FAISS index…", EMBEDDING_MODEL)
    _get_model()
    _load_index()
    if HYBRID_BM25:
        _ensure_bm25()
    log.info("RAG warmup: ready (%s metadata rows).", len(_metadata))
    print(f"RAG warmup: {EMBEDDING_MODEL!r} + FAISS cached in memory ({len(_metadata)} chunks).")


async def warmup_async() -> None:
    """Run warmup in a background thread and signal readiness (used on Vercel)."""
    await asyncio.to_thread(warmup)
    _get_warmup_event().set()


def _encode_one(text: str) -> list[float]:
    model = _get_model()
    return model.encode(text, show_progress_bar=False).tolist()


async def _embed(text: str) -> list[float]:
    """Serialize embedding work so concurrent /api/ask calls don't corrupt MiniLM state."""
    async with _embed_lock:
        return await asyncio.to_thread(_encode_one, text)


def _tokenize(s: str) -> list[str]:
    return [t for t in re.findall(r"[a-z0-9]+", (s or "").lower()) if len(t) > 1]


def _chunk_bm25_text(chunk: dict) -> str:
    tags = chunk.get("tags") or []
    tag_s = " ".join(str(t) for t in tags) if isinstance(tags, list) else str(tags)
    parts = [
        str(chunk.get("article_number") or ""),
        str(chunk.get("title") or ""),
        str(chunk.get("chapter") or ""),
        tag_s,
        str(chunk.get("text") or ""),
    ]
    return " ".join(p for p in parts if p)


def _query_expansion_strings(queries: list[str]) -> list[str]:
    combined = " ".join(queries).strip()
    if not combined:
        return []
    out: list[str] = []
    seen_lower: set[str] = set()
    for pat, phrase in _QUERY_EXPANSION_RULES:
        if not pat.search(combined):
            continue
        key = phrase.lower()
        if key not in seen_lower:
            seen_lower.add(key)
            out.append(phrase)
    return out


def _ensure_bm25() -> None:
    global _bm25, _bm25_corpus_len
    _load_index()
    n = len(_metadata)
    if n == 0:
        return
    if _bm25 is not None and _bm25_corpus_len == n:
        return
    try:
        from rank_bm25 import BM25Okapi  # type: ignore[import-untyped]
    except ImportError:
        _bm25 = None
        _bm25_corpus_len = -1
        return

    tokenized = [_tokenize(_chunk_bm25_text(c)) for c in _metadata]
    tokenized = [t if t else ["empty"] for t in tokenized]
    _bm25 = BM25Okapi(tokenized)
    _bm25_corpus_len = n


def _rrf_fuse_rankings(ranked_lists: list[list[int]], k_rrf: int) -> list[int]:
    scores: dict[int, float] = {}
    for ranks in ranked_lists:
        if not ranks:
            continue
        for pos, doc_id in enumerate(ranks):
            scores[doc_id] = scores.get(doc_id, 0.0) + 1.0 / (k_rrf + pos + 1)
    return sorted(scores.keys(), key=lambda d: (-scores[d], d))


def _mtime_iso(path: Path) -> str | None:
    if not path.is_file():
        return None
    ts = path.stat().st_mtime
    return datetime.fromtimestamp(ts, tz=timezone.utc).isoformat()


def rag_stats() -> RagStatsResponse:
    """Lightweight diagnostics: index size, embedding model id, data file mtimes."""
    global _metadata

    chunks_memory: int | None = None
    if _faiss_index is not None:
        chunks_memory = len(_metadata)
    chunks_disk: int | None = None
    if FAISS_META_PATH.is_file():
        try:
            with open(FAISS_META_PATH, "r", encoding="utf-8") as f:
                chunks_disk = len(json.load(f))
        except (json.JSONDecodeError, OSError):
            chunks_disk = None

    top_k = TOP_K
    per_q = int(os.getenv("RAG_TOP_K_PER_QUERY", str(max(top_k, 3))))

    return RagStatsResponse(
        embedding_model=EMBEDDING_MODEL,
        chunks_loaded_in_memory=chunks_memory,
        chunks_in_faiss_metadata=chunks_disk,
        constitution_json_exists=CONSTITUTION_PATH.is_file(),
        paths=RagStatsPaths(
            constitution_json=str(CONSTITUTION_PATH.resolve()),
            faiss_index=str(FAISS_INDEX_PATH.resolve()),
            faiss_metadata=str(FAISS_META_PATH.resolve()),
        ),
        mtimes_utc=RagStatsMtimes(
            constitution_json=_mtime_iso(CONSTITUTION_PATH),
            faiss_index=_mtime_iso(FAISS_INDEX_PATH),
            faiss_metadata=_mtime_iso(FAISS_META_PATH),
        ),
        retrieval=RagStatsRetrieval(
            RAG_TOP_K=top_k,
            RAG_TOP_K_PER_QUERY=per_q,
            RAG_HYBRID=HYBRID_BM25,
            RAG_RETRIEVAL_POOL=RETRIEVAL_POOL,
            RAG_RRF_K=RRF_K,
        ),
    )


async def retrieve(queries: str | list[str], k: int | None = None) -> list[dict]:
    """
    Retrieve top-k chunks: MiniLM (FAISS) + optional BM25, fused with RRF.
    Pass multiple query strings (e.g. English + original Twi). Trigger-based query
    expansion adds legal vocabulary so informal questions still embed and match lexically.
    """
    k = k if k is not None else TOP_K
    _load_index()
    import faiss  # type: ignore

    if isinstance(queries, str):
        qs = [queries]
    else:
        qs = [q.strip() for q in queries if q and str(q).strip()]
    if not qs:
        return []

    expansions = _query_expansion_strings(qs)
    all_qs: list[str] = []
    seen_q: set[str] = set()
    for q in qs + expansions:
        key = q.lower()
        if key not in seen_q:
            seen_q.add(key)
            all_qs.append(q)

    pool = min(RETRIEVAL_POOL, max(1, len(_metadata)))
    # Widen FAISS search for hybrid; cap only if RAG_FAISS_PROBE is set (legacy cost control).
    faiss_probe = int(os.getenv("RAG_FAISS_PROBE", str(pool)))
    n_probe = min(max(1, faiss_probe), max(1, len(_metadata)))

    best_faiss_rank: dict[int, int] = {}
    for q in all_qs:
        embedding = await _embed(q[:3000])
        query_vector = np.array([embedding], dtype=np.float32)
        _, indices = _faiss_index.search(query_vector, n_probe)  # type: ignore[union-attr]
        for rank, idx in enumerate(indices[0]):
            idx = int(idx)
            if idx < 0 or idx >= len(_metadata):
                continue
            r = rank + 1
            prev = best_faiss_rank.get(idx)
            if prev is None or r < prev:
                best_faiss_rank[idx] = r

    faiss_order = sorted(best_faiss_rank.keys(), key=lambda i: best_faiss_rank[i])

    use_hybrid = HYBRID_BM25 and len(_metadata) > 0
    if use_hybrid:
        _ensure_bm25()

    if not use_hybrid or _bm25 is None:
        return [_metadata[i] for i in faiss_order[:k]]

    qtext = " ".join(all_qs)
    tokens = _tokenize(qtext)
    bm25_order: list[int] = []
    if tokens:
        scores = _bm25.get_scores(tokens)  # type: ignore[union-attr]
        order = np.argsort(-np.asarray(scores, dtype=np.float64))[:pool]
        bm25_order = [int(x) for x in order.tolist()]

    fused = _rrf_fuse_rankings([faiss_order, bm25_order], RRF_K)
    fused = [i for i in fused if 0 <= i < len(_metadata)]
    return [_metadata[i] for i in fused[:k]]


def _numeric_article_ids_from_chunks(articles: list[dict]) -> set[str]:
    ids: set[str] = set()
    for a in articles:
        an = a.get("article_number", "") or ""
        m = re.search(r"(\d+)", an)
        if m:
            ids.add(m.group(1))
    return ids


def _filter_citations_to_retrieved(llm_text: str, allowed_nums: set[str]) -> list[str]:
    """Drop hallucinated 'Article N' cites that are not in the retrieved set."""
    if not allowed_nums:
        return []
    found = re.findall(r"Article \d+(?:\(\d+\))?(?:\([a-z]\))?", llm_text, flags=re.IGNORECASE)
    seen: set[str] = set()
    norm: list[str] = []
    for cite in found:
        m = re.search(r"Article (\d+)", cite, re.IGNORECASE)
        if not m or m.group(1) not in allowed_nums:
            continue
        key = cite.lower()
        if key in seen:
            continue
        seen.add(key)
        norm.append(re.sub(r"^article", "Article", cite, flags=re.I))
    return norm


def _is_substantive_action_step(text: str) -> bool:
    t = (text or "").strip()
    if len(t) < 10:
        return False
    if re.fullmatch(r"[\s\-\*•\d.]+", t):
        return False
    if set(t) <= {"-", "—", "–", "*", "•", " "}:
        return False
    return True


def _extract_action_steps(llm_response: str) -> list[str]:
    steps: list[str] = []

    m = re.search(
        r"(?:Practical )?Action(?:\s+step)?\s*:\s*(.+?)(?:\n\n|\n[A-Z#]|\Z)",
        llm_response,
        re.IGNORECASE | re.DOTALL,
    )
    if m:
        one = re.sub(r"\s+", " ", m.group(1).strip())
        if _is_substantive_action_step(one):
            steps.append(one)

    if not steps:
        in_action = False
        for line in llm_response.split("\n"):
            line = line.strip()
            if re.match(r"^(Practical )?action|what to do|steps?\s*:", line, re.I):
                in_action = True
                continue
            if in_action and line and (line[0].isdigit() or line.startswith(("-", "•", "*"))):
                cleaned = re.sub(r"^[\d\).\-\*•]+\s*", "", line).strip()
                if _is_substantive_action_step(cleaned):
                    steps.append(cleaned)

    if not steps:
        return ["Contact the Legal Aid Commission for further assistance: 0302-664-951"]
    return steps[:3]


async def query(user_question: str, retrieval_aliases: list[str] | None = None) -> AskResponse:
    """
    Full RAG pipeline: retrieve relevant articles, then ask the LLM.
    Returns a structured AskResponse.
    """
    event = _get_warmup_event()
    if not event.is_set():
        await event.wait()

    queries = [user_question.strip()]
    if retrieval_aliases:
        for alt in retrieval_aliases:
            alt = (alt or "").strip()
            if alt and alt not in queries and alt.lower() != user_question.strip().lower():
                queries.append(alt)

    articles = await retrieve(queries)

    if not articles:
        disc = "This is guidance, not legal advice. Consult a qualified lawyer for legal matters."
        fallback = "I could not find relevant constitutional articles for your question. Please try rephrasing, or consult a lawyer directly."
        steps = ["Contact the Legal Aid Commission at 0302-664-951"]
        return AskResponse(
            answer=fallback,
            articles_cited=[],
            action_steps=steps,
            disclaimer=disc,
            answer_english=fallback,
            action_steps_english=list(steps),
            disclaimer_english=disc,
        )

    # Ask LLM with retrieved context
    llm_response = await llm.complete(query=user_question, context_articles=articles)

    allowed_nums = _numeric_article_ids_from_chunks(articles)
    cited = _filter_citations_to_retrieved(llm_response, allowed_nums)

    action_steps = _extract_action_steps(llm_response)

    disc = "This is guidance, not legal advice. Consult a qualified lawyer for legal matters."
    return AskResponse(
        answer=llm_response,
        articles_cited=cited,
        action_steps=action_steps,
        disclaimer=disc,
        answer_english=llm_response,
        action_steps_english=list(action_steps),
        disclaimer_english=disc,
    )


# --- Index builder (run once) ---

def build_index():
    """
    Build the FAISS index from constitution.json.
    Run this once before the demo: python -m app.services.rag --build
    Uses sentence-transformers locally — no API key required.
    """
    import faiss  # type: ignore

    print("Loading constitution chunks...")
    with open(CONSTITUTION_PATH, "r", encoding="utf-8") as f:
        chunks: list[dict] = json.load(f)

    print(f"Embedding {len(chunks)} chunks with '{EMBEDDING_MODEL}'...")
    model = _get_model()
    def _embed_text(c: dict) -> str:
        tags = c.get("tags") or []
        tag_part = " ".join(str(t) for t in tags) if isinstance(tags, list) else str(tags)
        return " ".join(
            [
                str(c.get("article_number", "") or ""),
                str(c.get("title", "") or ""),
                tag_part,
                str(c.get("text", "") or ""),
            ]
        ).strip()

    texts = [_embed_text(c) for c in chunks]
    embeddings = model.encode(texts, show_progress_bar=True)

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
