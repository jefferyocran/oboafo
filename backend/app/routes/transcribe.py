"""
POST /api/transcribe — Speech-to-Text via Khaya ASR.
Accepts audio/wav bytes, returns transcribed text.
"""
from fastapi import APIRouter, UploadFile, File, Query, HTTPException
from app.services import khaya

router = APIRouter()


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Query(default="en"),
):
    if not khaya.is_api_key_configured():
        raise HTTPException(
            status_code=503,
            detail="Khaya API key not configured on the server.",
        )
    audio_bytes = await audio.read()
    if not audio_bytes:
        raise HTTPException(status_code=422, detail="Audio file is empty.")
    try:
        text = await khaya.speech_to_text(
            audio_bytes,
            language,
            content_type=audio.content_type or "audio/wav",
        )
        return {"transcript": text}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ASR service error: {e}") from e
