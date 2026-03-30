"""
Translate arbitrary short text (user messages) between en/tw/ee/ga via Khaya.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import Language, TranslateTextRequest, TranslateTextResponse
from app.services import khaya

router = APIRouter()

_LONG_USER_TEXT = 700


@router.post("/translate-text", response_model=TranslateTextResponse)
async def translate_text(req: TranslateTextRequest) -> TranslateTextResponse:
    if not khaya.is_api_key_configured():
        raise HTTPException(
            status_code=503,
            detail="Khaya API key not configured on the server.",
        )
    text = (req.text or "").strip()
    if not text:
        return TranslateTextResponse(text="")
    if req.source == req.target:
        return TranslateTextResponse(text=text)

    src, tgt = req.source.value, req.target.value
    try:
        if len(text) > _LONG_USER_TEXT:
            out = await khaya.translate_long(text, src, tgt)
        else:
            out = await khaya.translate(text, src, tgt)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Translation failed: {e}") from e
    return TranslateTextResponse(text=out or text)
