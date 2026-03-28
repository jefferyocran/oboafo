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

    async def _warmup() -> None:
        try:
            await asyncio.to_thread(rag.warmup)
        except Exception as e:
            import logging
            logging.getLogger(__name__).error("RAG warmup failed: %s", e)

    # Run warmup in background so uvicorn binds the port immediately.
    # Render kills the process if the port isn't open within the startup timeout.
    asyncio.create_task(_warmup())
    yield


app = FastAPI(
    title="Ghana Constitutional Rights API",
    description="Legal guidance API powered by RAG over the 1992 Constitution of Ghana",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:4173",   # Vite preview
        "https://ghana-rights.vercel.app",  # Vercel deployment
        "https://oboafo.onrender.com",      # Render backend (same-origin)
        "https://oboafo.netlify.app",       # Netlify deployment
    ],
    allow_credentials=True,
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
