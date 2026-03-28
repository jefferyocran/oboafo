"""
Ingest the 1992 Constitution of Ghana PDF into constitution.json.

Downloads the PDF, extracts text, splits by article, and outputs
structured JSON ready for FAISS embedding.

Usage:
    cd backend
    python scripts/ingest_pdf.py
    # Uses data/1992-constitution-of-ghana.pdf if present; otherwise downloads from audit.gov.gh and saves it there.

    # Or use another file:
    python scripts/ingest_pdf.py --file path/to/constitution.pdf

Requirements:
    pip install pymupdf requests
"""

import re
import json
import sys
import argparse
from pathlib import Path

PDF_URL = "https://audit.gov.gh/files/publications/The_1992_Constitution_of_the_Republic_of_Ghana635603143.pdf"
DATA_DIR = Path(__file__).parent.parent / "data"
LOCAL_PDF_PATH = DATA_DIR / "1992-constitution-of-ghana.pdf"
OUTPUT_PATH = DATA_DIR / "constitution.json"


def download_pdf(url: str) -> bytes:
    import requests
    print(f"Downloading constitution PDF from:\n  {url}")
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    print(f"Downloaded {len(resp.content) / 1024:.0f} KB")
    return resp.content


def extract_text(pdf_bytes: bytes) -> str:
    import fitz  # PyMuPDF
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages = []
    for page in doc:
        pages.append(page.get_text())
    return "\n".join(pages)


def _main_constitution_body(full_text: str) -> str:
    """
    The official Ghana PDF (audit.gov.gh) uses numbered headings like \"14.\\n(1) ...\",
    not \"Article 14\". Cross-references such as \"article 71 of this Constitution\" must not
    be treated as article boundaries.
    """
    start_m = re.search(r"1\.\s*\n\s*\(1\)\s*The Sovereignty", full_text)
    if not start_m:
        raise ValueError(
            "Could not find start of constitution body (Article 1 / sovereignty clause). "
            "PDF may be wrong or image-only."
        )
    start = start_m.start()
    rest = full_text[start:]
    end_m = re.search(
        r"\n\s*FIRST\s+SCHEDULE\s*\n\s*TRANSITIONAL\s+PROVISIONS",
        rest,
        re.IGNORECASE,
    )
    if not end_m:
        return rest
    return rest[: end_m.start()]


def _infer_title(block: str, number_int: int) -> str:
    """Short label from first substantive line after the 'N.' line."""
    lines = [ln.strip() for ln in block.split("\n") if ln.strip()]
    for ln in lines[:6]:
        if re.match(r"^\d{1,3}\.\s*$", ln):
            continue
        # Drop bare clause markers
        if re.match(r"^\(\d+\)\s*$", ln):
            continue
        t = re.sub(r"^\(\d+\)\s*", "", ln)
        t = re.sub(r"\s+", " ", t).strip()
        if len(t) < 15:
            continue
        return (t[:180] + "…") if len(t) > 180 else t
    return f"Article {number_int}"


def parse_articles(full_text: str) -> list[dict]:
    """
    Split the constitution text into article-level chunks.

    Each chunk has:
        article_number  — e.g. \"Article 14\"
        title           — first line / clause snippet as label
        chapter         — e.g. \"Chapter 5\"
        tags            — list of keyword strings
        text            — full article text (including the \"N.\" heading line)
    """
    chunks: list[dict] = []

    body = _main_constitution_body(full_text)
    # Line contains only an article number and a dot (e.g. \"14.\" or \"14. \")
    marker = re.compile(r"(?m)^\s*(\d{1,3})\.\s*$")
    matches = list(marker.finditer(body))
    if len(matches) < 10:
        print(
            "WARNING: Few article markers found; PDF layout may differ. "
            "Falling back to legacy 'Article N' scan."
        )
        return _parse_articles_legacy(full_text)

    for i, match in enumerate(matches):
        number_int = int(match.group(1))
        start = match.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(body)
        block = body[start:end].strip()
        block = re.sub(r"\n{3,}", "\n\n", block)
        block = re.sub(r" {2,}", " ", block)

        if len(block) < 50:
            continue

        article_number = f"Article {number_int}"
        title = _infer_title(block, number_int)
        chapter = _guess_chapter(number_int)
        tags = _generate_tags(number_int, title, block)

        chunks.append(
            {
                "article_number": article_number,
                "title": title,
                "chapter": chapter,
                "tags": tags,
                "text": block,
            }
        )

    # Same article number can appear twice in this PDF (duplicate headings); keep the longer text.
    by_num: dict[int, dict] = {}
    for ch in chunks:
        n = int(str(ch["article_number"]).replace("Article ", "").strip())
        prev = by_num.get(n)
        if prev is None or len(ch["text"]) > len(prev["text"]):
            by_num[n] = ch
    chunks = sorted(by_num.values(), key=lambda c: int(c["article_number"].split()[-1]))

    print(f"Parsed {len(chunks)} articles (numbered-heading PDF layout)")
    return chunks


def _parse_articles_legacy(full_text: str) -> list[dict]:
    """Older PDFs that use explicit 'Article N — Title' lines at column start."""
    chunks = []

    article_pattern = re.compile(
        r"(?:^|\n)\s*(Article\s+(\d+))\s*[\.\-–]?\s*([^\n]*)\n",
        re.MULTILINE | re.IGNORECASE,
    )

    matches = list(article_pattern.finditer(full_text))

    for i, match in enumerate(matches):
        article_number = match.group(1).strip()
        number_int = int(match.group(2))
        title = match.group(3).strip()

        start = match.end()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(full_text)
        body = full_text[start:end].strip()

        body = re.sub(r"\n{3,}", "\n\n", body)
        body = re.sub(r" {2,}", " ", body)

        if len(body) < 50:
            continue

        chapter = _guess_chapter(number_int)
        tags = _generate_tags(number_int, title, body)

        chunks.append(
            {
                "article_number": article_number,
                "title": title,
                "chapter": chapter,
                "tags": tags,
                "text": body,
            }
        )

    print(f"Parsed {len(chunks)} articles (legacy Article-word layout)")
    return chunks


def _guess_chapter(number: int) -> str:
    """Map article number to chapter name."""
    ranges = [
        (1,   1,   "Chapter 1 — The Republic"),
        (2,   4,   "Chapter 2 — Territories of Ghana"),
        (5,   11,  "Chapter 3 — Citizenship"),
        (12,  33,  "Chapter 5 — Fundamental Human Rights and Freedoms"),
        (34,  41,  "Chapter 6 — The Directive Principles of State Policy"),
        (42,  56,  "Chapter 7 — Representation of the People"),
        (57,  91,  "Chapter 8 — The Executive"),
        (92,  124, "Chapter 9 — The Legislature"),
        (125, 157, "Chapter 10 — The Judicature"),
        (158, 171, "Chapter 11 — Finance"),
        (172, 200, "Chapter 12 — Public Services"),
        (201, 230, "Chapter 13 — Lands and Natural Resources"),
        (231, 296, "Chapter 14 — Chieftaincy"),
    ]
    for lo, hi, name in ranges:
        if lo <= number <= hi:
            return name
    return "Other"


def _generate_tags(number: int, title: str, body: str) -> list[str]:
    """Generate keyword tags from article content."""
    all_text = (title + " " + body).lower()
    tag_map = {
        "arrest": ["arrest", "arrested", "detention", "detain"],
        "search": ["search", "seizure", "warrant"],
        "liberty": ["liberty", "freedom", "free"],
        "dignity": ["dignity", "torture", "cruel", "inhumane"],
        "property": ["property", "land", "acquisition", "compensation"],
        "employment": ["work", "worker", "employ", "labour", "wage"],
        "speech": ["speech", "expression", "press", "media"],
        "assembly": ["assembly", "procession", "demonstration"],
        "association": ["association", "union", "trade union"],
        "equality": ["equality", "discrimination", "equal"],
        "fair trial": ["trial", "court", "innocent", "presumed"],
        "voting": ["vote", "voting", "election", "elect"],
        "health": ["health", "medical", "hospital"],
        "education": ["education", "school", "learn"],
        "children": ["child", "children", "minor"],
        "privacy": ["privacy", "private", "home", "correspondence"],
        "religion": ["religion", "religious", "belief", "conscience"],
        "movement": ["movement", "travel", "reside", "enter", "leave"],
    }
    tags = []
    for tag, keywords in tag_map.items():
        if any(kw in all_text for kw in keywords):
            tags.append(tag)
    return tags or ["general"]


def save(chunks: list[dict]) -> None:
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)
    print(f"Saved {len(chunks)} chunks -> {OUTPUT_PATH}")
    print("\nNext step: python -m app.services.rag --build")


def main():
    parser = argparse.ArgumentParser(description="Ingest Ghana Constitution PDF")
    parser.add_argument("--file", help="Path to local PDF file (skip download)", default=None)
    parser.add_argument("--url", help="PDF URL to download", default=PDF_URL)
    args = parser.parse_args()

    if args.file:
        pdf_bytes = Path(args.file).read_bytes()
        print(f"Using local file: {args.file}")
    elif LOCAL_PDF_PATH.is_file():
        pdf_bytes = LOCAL_PDF_PATH.read_bytes()
        print(f"Using bundled PDF: {LOCAL_PDF_PATH}")
    else:
        pdf_bytes = download_pdf(args.url)
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        LOCAL_PDF_PATH.write_bytes(pdf_bytes)
        print(f"Saved PDF for offline use -> {LOCAL_PDF_PATH}")

    text   = extract_text(pdf_bytes)
    chunks = parse_articles(text)

    if not chunks:
        print("WARNING: No articles parsed. The PDF may be scanned/image-based.")
        print("Try a text-based PDF or use OCR pre-processing.")
        sys.exit(1)

    save(chunks)


if __name__ == "__main__":
    main()
