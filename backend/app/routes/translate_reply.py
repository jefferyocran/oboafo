"""
Re-translate an existing assistant reply (English canonical → Twi/Ewe/Ga) without re-running RAG.
"""
import logging
import asyncio

from fastapi import APIRouter, HTTPException
from app.models.schemas import Language, TranslateReplyRequest, TranslateReplyResponse
from app.services import khaya

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/translate-reply", response_model=TranslateReplyResponse)
async def translate_reply(req: TranslateReplyRequest) -> TranslateReplyResponse:
    """
    Same Khaya path as /ask step 4: turn stored English answer + steps + disclaimer into target language.
    """
    if req.target == Language.EN:
        return TranslateReplyResponse(
            answer=req.answer_english,
            action_steps=list(req.action_steps_english),
            disclaimer=req.disclaimer_english,
        )
    if not khaya.is_api_key_configured():
        raise HTTPException(
            status_code=503,
            detail="Khaya API key not configured on the server.",
        )

    tgt = req.target.value
    try:
        answer = await khaya.translate_long(req.answer_english, "en", tgt)
    except Exception as e:
        logger.warning("translate_reply answer: %s", e)
        try:
            answer = await khaya.translate(
                khaya.plain_for_translation(req.answer_english, max_chars=3500),
                "en",
                tgt,
            )
        except Exception as e2:
            logger.warning("translate_reply answer fallback: %s", e2)
            raise HTTPException(
                status_code=502,
                detail=f"Translation failed: {e2}",
            ) from e2

    steps: list[str] = []
    if req.action_steps_english:
        step_tasks = [
            khaya.translate(
                khaya.plain_for_translation(step, max_chars=1500),
                "en",
                tgt,
            )
            for step in req.action_steps_english
        ]
        translated_steps = await asyncio.gather(*step_tasks, return_exceptions=True)
        for step, translated in zip(req.action_steps_english, translated_steps):
            if isinstance(translated, Exception):
                logger.warning("translate_reply step: %s", translated)
                steps.append(step)
            else:
                steps.append(translated)

    try:
        disclaimer = await khaya.translate(
            khaya.plain_for_translation(req.disclaimer_english, max_chars=600),
            "en",
            tgt,
        )
    except Exception as e:
        logger.warning("translate_reply disclaimer: %s", e)
        disclaimer = req.disclaimer_english

    return TranslateReplyResponse(
        answer=answer,
        action_steps=steps,
        disclaimer=disclaimer,
    )
