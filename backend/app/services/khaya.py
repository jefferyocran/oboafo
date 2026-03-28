"""
Khaya AI API wrapper — Translation, ASR, TTS for Ghanaian languages.
Documentation: https://ghananlp.org/

TTS uses ``{KHAYA_BASE_URL}/tts/v1/tts`` (override with ``KHAYA_TTS_URL``). English is not a Khaya TTS language.
"""

import os
import re
import httpx

from app.services.retry_util import async_retry

# API gateway (Azure APIM). Translation uses /v1/translate; TTS uses /tts/v1/tts (Khaya SDK).
KHAYA_BASE_URL = os.getenv("KHAYA_BASE_URL", "https://translation-api.ghananlp.org").rstrip("/")

_PLACEHOLDER_VALUES = frozenset({"", "your_khaya_api_key_here"})


def _khaya_subscription_key() -> str:
    """
    Azure API Management provides Primary and Secondary keys for the same subscription;
    either authenticates identically. Primary is the default; Secondary is for key rotation.

    Precedence: KHAYA_API_KEY (explicit), then KHAYA_PRIMARY_KEY, then KHAYA_SECONDARY_KEY.
    Put the portal "Primary" value in KHAYA_API_KEY for clarity, or rely on KHAYA_PRIMARY_KEY alone.
    """
    for env_name in ("KHAYA_API_KEY", "KHAYA_PRIMARY_KEY", "KHAYA_SECONDARY_KEY"):
        raw = os.getenv(env_name, "")
        val = raw.strip()
        if val and val not in _PLACEHOLDER_VALUES:
            return val
    return ""


def is_api_key_configured() -> bool:
    return bool(_khaya_subscription_key())


# Khaya language code mapping
# Khaya uses codes like "tw", "ee", "ga" internally
LANG_CODES = {
    "en": "en",
    "tw": "tw",  # Akan/Twi
    "ee": "ee",  # Ewe
    "ga": "ga",  # Ga (translation pairs often use gaa)
}

# Khaya TTS supports tw, gaa, dag, ee, yo — not English (see Khaya SDK constants).
TTS_LANG_CODES = {
    "tw": "tw",
    "ee": "ee",
    "ga": "gaa",
}


def _khaya_tts_url() -> str:
    custom = (os.getenv("KHAYA_TTS_URL") or "").strip()
    if custom:
        return custom
    return f"{KHAYA_BASE_URL}/tts/v1/tts"


def plain_for_translation(text: str, max_chars: int = 12000) -> str:
    """Strip markdown/noise so Khaya is less likely to reject or garble long replies."""
    if not text:
        return text
    t = text.replace("**", "").replace("__", "")
    t = re.sub(r"\*{1,2}", "", t)
    t = re.sub(r"(?m)^\s*[-•*]{1,4}\s+", "", t)
    t = re.sub(r"\n{3,}", "\n\n", t).strip()
    if len(t) > max_chars:
        t = t[: max_chars - 1].rstrip() + "…"
    return t


def _translation_chunks(text: str, max_chunk: int) -> list[str]:
    if not text.strip():
        return []
    if len(text) <= max_chunk:
        return [text]
    chunks: list[str] = []
    buf: list[str] = []
    size = 0
    for para in re.split(r"\n\s*\n", text):
        p = para.strip()
        if not p:
            continue
        add = len(p) + (2 if buf else 0)
        if size + add > max_chunk and buf:
            chunks.append("\n\n".join(buf))
            buf = [p]
            size = len(p)
        else:
            buf.append(p)
            size += add
    if buf:
        chunks.append("\n\n".join(buf))
    out: list[str] = []
    for c in chunks:
        if len(c) <= max_chunk:
            out.append(c)
        else:
            for i in range(0, len(c), max_chunk):
                out.append(c[i : i + max_chunk])
    return out


def _translate_timeout_seconds(text_len: int) -> float:
    if os.getenv("KHAYA_TRANSLATE_TIMEOUT"):
        return float(os.environ["KHAYA_TRANSLATE_TIMEOUT"])
    return min(120.0, max(25.0, 20.0 + text_len / 35.0))


async def translate_long(text: str, source: str, target: str) -> str:
    """
    Translate long assistant replies (e.g. en→tw) in smaller chunks.
    Full paragraphs in one Khaya call often time out or error.
    """
    plain = plain_for_translation(text)
    max_chunk = max(400, int(os.getenv("KHAYA_TRANSLATE_CHUNK_CHARS", "1000")))
    parts = _translation_chunks(plain, max_chunk)
    if not parts:
        return text
    out: list[str] = []
    for chunk in parts:
        if not chunk.strip():
            continue
        out.append(await translate(chunk, source, target))
    return "\n\n".join(out) if out else text


async def translate(text: str, source: str, target: str) -> str:
    """
    Translate text between English and a Ghanaian language.

    Args:
        text: The text to translate.
        source: Source language code ("en", "tw", "ee", "ga").
        target: Target language code ("en", "tw", "ee", "ga").

    Returns:
        Translated text string.
    """
    if source == target:
        return text

    lang_pair = f"{LANG_CODES[source]}-{LANG_CODES[target]}"
    timeout = _translate_timeout_seconds(len(text))

    async def _call() -> str:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                f"{KHAYA_BASE_URL}/v1/translate",
                json={"in": text, "lang": lang_pair},
                headers={
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": _khaya_subscription_key(),
                },
            )
            response.raise_for_status()
            data = response.json()
        if isinstance(data, str):
            return data
        if isinstance(data, dict):
            return data.get("out") or data.get("translation") or str(data)
        return str(data)

    return await async_retry(_call, label="khaya-translate")


def _tts_timeout_seconds(text_len: int) -> float:
    if os.getenv("KHAYA_TTS_TIMEOUT"):
        return float(os.environ["KHAYA_TTS_TIMEOUT"])
    return min(120.0, max(30.0, 25.0 + text_len / 40.0))


async def text_to_speech(text: str, language: str) -> tuple[bytes, str]:
    """
    Convert text to speech audio using Khaya TTS.

    Returns:
        (audio_bytes, content_type), e.g. (b"...", "audio/mpeg").

    Raises:
        ValueError: if ``language`` is ``en`` (no Khaya English TTS) or unsupported for TTS.
    """
    if language == "en":
        raise ValueError("Khaya TTS does not provide an English voice; use Web Speech on the client.")
    tts_lang = TTS_LANG_CODES.get(language)
    if not tts_lang:
        raise ValueError(f"Unsupported TTS language code: {language!r}")

    timeout = _tts_timeout_seconds(len(text))
    url = _khaya_tts_url()

    async def _call() -> tuple[bytes, str]:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(
                url,
                json={"text": text, "language": tts_lang},
                headers={
                    "Content-Type": "application/json",
                    "Ocp-Apim-Subscription-Key": _khaya_subscription_key(),
                },
            )
            response.raise_for_status()
            ct = (response.headers.get("content-type") or "audio/mpeg").split(";")[0].strip()
            return response.content, ct

    return await async_retry(_call, label="khaya-tts")


async def speech_to_text(audio_bytes: bytes, language: str) -> str:
    """
    Transcribe speech audio to text using Khaya ASR.

    Returns:
        Transcribed text string.
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{KHAYA_BASE_URL}/v1/asr",
            content=audio_bytes,
            headers={
                "Content-Type": "audio/wav",
                "Ocp-Apim-Subscription-Key": _khaya_subscription_key(),
                "language": LANG_CODES[language],
            },
        )
        response.raise_for_status()
        data = response.json()

    if isinstance(data, str):
        return data
    if isinstance(data, dict):
        return data.get("transcript") or data.get("text") or str(data)
    return str(data)
