"""
Vercel serverless entry: single ASGI app, all routes rewritten here (see vercel.json).
"""

from app.main import app

__all__ = ["app"]
