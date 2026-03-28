"""
POST /api/transcribe — Speech-to-Text via Khaya ASR.
Accepts audio/wav bytes, returns transcribed text.
"""
from fastapi import APIRouter, UploadFile, File, Query
from fastapi.responses import JSONResponse
from app.services import khaya

router = APIRouter()


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: str = Query(default="en"),
):
    audio_bytes = await audio.read()
    try:
        text = await khaya.speech_to_text(audio_bytes, language)
        return {"transcript": text}
    except Exception as e:
        return JSONResponse(status_code=502, content={"error": str(e)})
