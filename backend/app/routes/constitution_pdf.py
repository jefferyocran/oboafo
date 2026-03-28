"""
Serve the bundled 1992 Constitution PDF (same file as in backend/data/).
"""
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

router = APIRouter()

_BACKEND_ROOT = Path(__file__).resolve().parent.parent.parent
PDF_PATH = _BACKEND_ROOT / "data" / "1992-constitution-of-ghana.pdf"
PDF_FILENAME = "1992-constitution-of-ghana.pdf"


@router.get("/constitution/pdf")
async def constitution_pdf():
    if not PDF_PATH.is_file():
        raise HTTPException(
            status_code=404,
            detail="Constitution PDF missing. Place 1992-constitution-of-ghana.pdf in backend/data/.",
        )
    return FileResponse(
        path=PDF_PATH,
        media_type="application/pdf",
        filename=PDF_FILENAME,
    )
