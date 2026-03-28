import logging

from fastapi import APIRouter, HTTPException
from app.models.schemas import AskRequest, AskResponse, Language
from app.services import rag, khaya

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/ask", response_model=AskResponse)
async def ask_question(request: AskRequest) -> AskResponse:
    """
    AI-powered constitutional law query via RAG pipeline.

    Flow:
    1. If not English, translate input to English via Khaya AI
    2. Embed query → FAISS search → retrieve top constitutional articles
    3. Send articles + query to LLM → get plain-language answer
    4. If not English, translate response back via Khaya AI
    5. Return structured AskResponse
    """
    user_message = request.message
    original_language = request.language

    # Step 1: Translate to English if needed
    if original_language != Language.EN:
        try:
            user_message = await khaya.translate(
                text=user_message,
                source=original_language.value,
                target="en",
            )
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Translation service error: {e}")

    # Step 2 & 3: RAG retrieval + LLM (English + original text retrieval when multilingual)
    retrieval_aliases: list[str] = []
    if original_language != Language.EN:
        raw = (request.message or "").strip()
        if raw:
            retrieval_aliases.append(raw)

    try:
        result = await rag.query(user_message, retrieval_aliases=retrieval_aliases or None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG pipeline error: {e}")

    answer_english = result.answer
    action_steps_english = list(result.action_steps)
    disclaimer_english = result.disclaimer

    # Step 4: Translate answer back if needed (chunked — long markdown replies often break Khaya)
    if original_language != Language.EN:
        tgt = original_language.value
        try:
            result.answer = await khaya.translate_long(result.answer, "en", tgt)
        except Exception as e:
            logger.warning("Khaya translate_long (answer): %s", e)
            try:
                result.answer = await khaya.translate(
                    khaya.plain_for_translation(result.answer, max_chars=3500),
                    "en",
                    tgt,
                )
            except Exception as e2:
                logger.warning("Khaya translate (answer fallback): %s", e2)
                result.answer = (
                    "[Translation unavailable — English response]\n\n" + result.answer
                )

        new_steps: list[str] = []
        for step in result.action_steps:
            try:
                new_steps.append(
                    await khaya.translate(
                        khaya.plain_for_translation(step, max_chars=1500),
                        "en",
                        tgt,
                    )
                )
            except Exception as e:
                logger.warning("Khaya translate (action_step): %s", e)
                new_steps.append(step)
        result.action_steps = new_steps

    return AskResponse(
        answer=result.answer,
        articles_cited=result.articles_cited,
        action_steps=result.action_steps,
        disclaimer=result.disclaimer,
        answer_english=answer_english,
        action_steps_english=action_steps_english,
        disclaimer_english=disclaimer_english,
    )
