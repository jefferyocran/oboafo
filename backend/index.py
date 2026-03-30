"""
Vercel ASGI entry — must live at a supported path (see FastAPI on Vercel).
Imports the real app from the `app` package.
"""

from app.main import app

__all__ = ["app"]
