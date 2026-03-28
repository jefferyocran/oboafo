"""
LLM wrapper — supports Claude (Anthropic) and GPT (OpenAI).
Set LLM_PROVIDER="claude" or "openai" in .env.
"""

import os

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "claude").lower()

SYSTEM_PROMPT = """You are a Ghanaian constitutional rights advisor. Your role is to help ordinary Ghanaians understand their rights under the 1992 Constitution of Ghana.

RULES:
1. Only cite constitutional articles that are explicitly provided in the context below.
2. If you are unsure or the answer is not in the provided articles, say so clearly.
3. Always cite the specific Article number (e.g., "Article 14(2)").
4. Explain rights in simple, plain language that a non-lawyer can understand.
5. Always end with a clear, practical action step the person can take.
6. Always add the disclaimer: "This is guidance, not legal advice. Consult a qualified lawyer for legal matters."
7. Be concise — aim for 150-250 words.

You are NOT a lawyer. You are a knowledgeable guide helping citizens understand their rights."""


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
    articles_text = "\n\n".join(
        f"[{a.get('article_number', 'Unknown')}] {a.get('title', '')}\n{a.get('text', '')}"
        for a in context_articles
    )

    user_prompt = f"""Relevant constitutional articles:
---
{articles_text}
---

User question: {query}

Please explain the user's rights based on the articles above."""

    if LLM_PROVIDER == "claude":
        return await _claude_complete(user_prompt)
    else:
        return await _openai_complete(user_prompt)


async def _claude_complete(user_prompt: str) -> str:
    import anthropic

    api_key = os.getenv("ANTHROPIC_API_KEY")
    client = anthropic.AsyncAnthropic(api_key=api_key)

    message = await client.messages.create(
        model="claude-opus-4-6",
        max_tokens=512,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )
    return message.content[0].text  # type: ignore[index]


async def _openai_complete(user_prompt: str) -> str:
    from openai import AsyncOpenAI

    api_key = os.getenv("OPENAI_API_KEY")
    client = AsyncOpenAI(api_key=api_key)

    response = await client.chat.completions.create(
        model="gpt-4o",
        max_tokens=512,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
    )
    return response.choices[0].message.content or ""
