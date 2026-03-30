import os
from contextlib import asynccontextmanager

import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes import ask, constitution_pdf, crisis, rag_stats, transcribe, translate_reply, translate_text, tts

load_dotenv()


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.services import rag

    if os.getenv("VERCEL"):
        # Start warmup in background so /health responds immediately.
        # query() will await _get_warmup_event() and block until this finishes.
        asyncio.create_task(rag.warmup_async())
        yield
        return

    await asyncio.to_thread(rag.warmup)
    rag._get_warmup_event().set()
    yield


app = FastAPI(
    title="Ghana Constitutional Rights API",
    description="Legal guidance API powered by RAG over the 1992 Constitution of Ghana",
    version="1.0.0",
    lifespan=lifespan,
)

_extra_origins = [o.strip() for o in (os.getenv("CORS_EXTRA_ORIGINS") or "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:4173",
        "https://ghana-rights.vercel.app",
        "https://oboafo.onrender.com",
        "https://oboafo.netlify.app",
        *_extra_origins,
    ],
    allow_origin_regex=r"https://([a-z0-9-]+\.)*vercel\.app",
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ask.router, prefix="/api")
app.include_router(rag_stats.router, prefix="/api")
app.include_router(constitution_pdf.router, prefix="/api")
app.include_router(crisis.router, prefix="/api")
app.include_router(transcribe.router, prefix="/api")
app.include_router(tts.router, prefix="/api")
app.include_router(translate_reply.router, prefix="/api")
app.include_router(translate_text.router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Ghana Rights API"}


# Run with: uvicorn app.main:app --reload
