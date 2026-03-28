from fastapi import APIRouter, HTTPException
from app.models.schemas import AskRequest, AskResponse, Language
from app.services import rag, khaya

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

    # Step 2 & 3: RAG retrieval + LLM reasoning
    try:
        result = await rag.query(user_message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG pipeline error: {e}")

    # Step 4: Translate answer back if needed
    if original_language != Language.EN:
        try:
            result.answer = await khaya.translate(
                text=result.answer,
                source="en",
                target=original_language.value,
            )
            result.action_steps = [
                await khaya.translate(text=step, source="en", target=original_language.value)
                for step in result.action_steps
            ]
        except Exception:
            # Translation failed — return English response with a note
            result.answer = f"[Translation unavailable — English response]\n\n{result.answer}"

    return result
