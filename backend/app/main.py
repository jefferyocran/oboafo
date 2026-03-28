from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from app.routes import ask, crisis

load_dotenv()

app = FastAPI(
    title="Ghana Constitutional Rights API",
    description="Legal guidance API powered by RAG over the 1992 Constitution of Ghana",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:4173",   # Vite preview
        "https://ghana-rights.vercel.app",  # Production (update as needed)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ask.router, prefix="/api")
app.include_router(crisis.router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Ghana Rights API"}


# Run with: uvicorn app.main:app --reload
