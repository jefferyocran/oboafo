"""
LLM wrapper — supports Claude (Anthropic) and GPT (OpenAI).
Set LLM_PROVIDER="claude" or "openai" in .env.

Prompt/context kept compact to stay under low org input TPM limits (e.g. 10k/min).
Override: LLM_MAX_ARTICLE_CHARS, LLM_CONTEXT_MAX_CHARS, RAG_TOP_K (in rag.py).
"""

import os

from app.services.retry_util import async_retry

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "claude").lower()

# Sonnet is the default: lower cost and higher TPM limits than Opus for RAG Q&A.
CLAUDE_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")

# Strict grounding reduces "generic CHRAJ / Article 70" answers when excerpts are about something else.
SYSTEM_PROMPT = (
    "You help Ghanaians understand the 1992 Constitution using ONLY the excerpt block the user gives you.\n"
    "Rules:\n"
    "1) Cite ONLY articles listed under ALLOWED_CITATIONS and only if those excerpts actually support your point.\n"
    "2) Do NOT cite Article 70, CHRAJ, commissions, or complaint bodies unless that exact article or body appears "
    "in the excerpt text (not just because it sounds related).\n"
    "3) If excerpts do not clearly answer the question, say so briefly and suggest rephrasing or speaking to a lawyer. "
    "Do not invent connections to police stops, arrest, or searches unless those topics appear in the excerpts.\n"
    "4) Include exactly ONE short practical action in the main answer (one sentence). "
    "Do not add a separate numbered 'What to do' list.\n"
    "5) End with this exact sentence on its own line: "
    "This is guidance, not legal advice. Consult a qualified lawyer for legal matters.\n"
    "6) Max ~220 words. Plain language. Use **bold** only for article labels if helpful."
)


def _truncate(text: str, max_chars: int) -> str:
    text = (text or "").strip()
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 1].rstrip() + "…"


def _allowed_citations_header(articles: list[dict]) -> str:
    labels: list[str] = []
    for a in articles:
        num = (a.get("article_number") or "").strip()
        title = (a.get("title") or "").strip()
        if num and title:
            labels.append(f"{num} ({title})")
        elif num:
            labels.append(num)
    return "; ".join(labels) if labels else "(no article labels — say excerpts are insufficient)"


def _compact_articles_for_prompt(articles: list[dict]) -> str:
    """Limit article bodies so bundled input stays under tight API TPM caps."""
    per = max(400, int(os.getenv("LLM_MAX_ARTICLE_CHARS", "1000")))
    total_cap = max(per, int(os.getenv("LLM_CONTEXT_MAX_CHARS", "4500")))
    parts: list[str] = []
    used = 0
    for a in articles:
        head = f"{a.get('article_number', '?')}: {a.get('title', '')}".strip()
        body = _truncate(a.get("text", ""), per)
        block = f"{head}\n{body}"
        if used + len(block) + 2 > total_cap:
            room = total_cap - used - 2
            if room < 120:
                break
            block = _truncate(block, room)
        parts.append(block)
        used += len(block) + 2
    return "\n\n".join(parts)


async def complete(query: str, context_articles: list[dict]) -> str:
    """
    Generate a constitutional rights explanation using the LLM.

    Args:
        query: The user's question in English.
        context_articles: List of relevant constitutional articles from FAISS retrieval.
                          Each item has keys: "article_number", "title", "text".

    Returns:
        LLM-generated response string.
    """
    articles_text = _compact_articles_for_prompt(context_articles)
    q = _truncate(query, int(os.getenv("LLM_MAX_QUERY_CHARS", "500")))
    allowed = _allowed_citations_header(context_articles)

    user_prompt = (
        f"ALLOWED_CITATIONS (you may cite ONLY these articles, and only if the excerpts support it):\n{allowed}\n\n"
        f"EXCERPTS:\n{articles_text}\n\n"
        f"QUESTION (English):\n{q}\n\n"
        "Answer from the excerpts only. If they are off-topic or too thin, say that honestly."
    )

    if LLM_PROVIDER == "claude":
        return await _claude_complete(user_prompt)
    else:
        return await _openai_complete(user_prompt)


def _claude_message_text(message: object) -> str:
    """Normalize Anthropic SDK message content across versions."""
    content = getattr(message, "content", None) or []
    parts: list[str] = []
    for block in content:
        text = getattr(block, "text", None)
        if text:
            parts.append(text)
    return "".join(parts).strip()


async def _claude_complete(user_prompt: str) -> str:
    import anthropic

    api_key = (os.getenv("ANTHROPIC_API_KEY") or "").strip()
    if not api_key:
        raise ValueError(
            "ANTHROPIC_API_KEY is missing. Set it in backend/.env and restart uvicorn."
        )

    client = anthropic.AsyncAnthropic(api_key=api_key)

    async def _call():
        return await client.messages.create(
            model=CLAUDE_MODEL,
            max_tokens=min(512, int(os.getenv("LLM_MAX_OUTPUT_TOKENS", "384"))),
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}],
        )

    message = await async_retry(_call, label="anthropic-messages")
    out = _claude_message_text(message)
    if not out:
        raise RuntimeError("Claude returned an empty message.")
    return out


async def _openai_complete(user_prompt: str) -> str:
    from openai import AsyncOpenAI

    api_key = os.getenv("OPENAI_API_KEY")
    timeout = float(os.getenv("LLM_OPENAI_TIMEOUT", "50"))
    client = AsyncOpenAI(api_key=api_key, timeout=timeout)

    async def _call():
        return await client.chat.completions.create(
            model="gpt-4o",
            max_tokens=min(512, int(os.getenv("LLM_MAX_OUTPUT_TOKENS", "384"))),
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )

    response = await async_retry(_call, label="openai-chat")
    return response.choices[0].message.content or ""
