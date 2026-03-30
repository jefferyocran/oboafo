"""
POST /api/tts — Text-to-speech via Ghana NLP Khaya ``/tts/v1/synthesize``; returns raw audio (typically WAV).
"""
import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response

from app.models.schemas import TtsRequest
from app.services import khaya

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/tts")
async def synthesize_speech(request: TtsRequest) -> Response:
    if not khaya.is_api_key_configured():
        raise HTTPException(
            status_code=503,
            detail="Khaya API key not configured on the server.",
        )
    text = request.text.strip()
    if not text:
        raise HTTPException(status_code=422, detail="Text is empty.")
    lang = request.language.value
    try:
        audio, media_type = await khaya.text_to_speech(text, lang)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    except Exception as e:
        logger.warning("Khaya TTS failed: %s", e)
        raise HTTPException(status_code=502, detail=f"TTS service error: {e}") from e
    if not audio:
        raise HTTPException(status_code=502, detail="TTS returned empty audio.")
    return Response(content=audio, media_type=media_type)
