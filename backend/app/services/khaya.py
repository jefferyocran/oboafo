"""
Khaya AI API wrapper — Translation, ASR, TTS for Ghanaian languages.

Sign up & keys: https://translation.ghananlp.org (developer portal). **API traffic** must use the
gateway host ``translation-api.ghananlp.org`` — the portal hostname serves only the website and returns
404 for ``/v1/translate``, ``/tts/…``, etc.

- Translate: POST ``{KHAYA_BASE_URL}/v1/translate``
- TTS: POST ``{KHAYA_BASE_URL}/tts/v1/synthesize`` — JSON ``{"text", "language", "speaker_id?"}``; WAV audio.
  Optional ``KHAYA_TTS_SPEAKER_ID_TW`` / ``_EE`` / ``_GA`` or legacy ``KHAYA_TTS_SPEAKER_ID`` (only applied when the id matches that language, e.g. ``twi_*`` for ``tw``).
  Defaults: Twi ``twi_speaker_6``, Ewe ``ewe_speaker_3``.
- ASR: POST ``{KHAYA_BASE_URL}/asr/v1/transcribe`` — raw audio body, ``language`` query param

Override ``KHAYA_BASE_URL`` if Ghana NLP documents another gateway.
"""

import os
import re
import httpx

from app.services.retry_util import async_retry

# API gateway (not the portal at translation.ghananlp.org, which does not expose these routes).
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


# App language → Khaya API codes (matches official khaya SDK / portal).
LANG_CODES = {
    "en": "en",
    "tw": "tw",
    "ee": "ee",
    "ga": "gaa",
}

# Khaya TTS languages (official SDK SUPPORTED_TTS_LANGUAGES).
TTS_LANG_CODES = {
    "tw": "tw",
    "ee": "ee",
    "ga": "gaa",
    "yo": "yo",
}

# Ghana NLP /speakers voices for ``/tts/v1/synthesize`` (see GET …/tts/v1/speakers).
# ``speaker_id`` must match ``language`` (e.g. ``twi_*`` only with ``language: tw``, ``ewe_*`` with ``ee``).
DEFAULT_TTS_SPEAKER_ID_BY_API_LANG: dict[str, str] = {
    "tw": "twi_speaker_6",
    "ee": "ewe_speaker_3",
}

# Optional per-language override env names (value = portal speaker id). Keys = Khaya TTS API ``language`` code.
_TTS_SPEAKER_ENV_BY_API_LANG: dict[str, str] = {
    "tw": "KHAYA_TTS_SPEAKER_ID_TW",
    "ee": "KHAYA_TTS_SPEAKER_ID_EE",
    "gaa": "KHAYA_TTS_SPEAKER_ID_GA",
    "yo": "KHAYA_TTS_SPEAKER_ID_YO",
}


def _speaker_id_matches_api_language(speaker_id: str, tts_lang: str) -> bool:
    s = speaker_id.lower()
    if s.startswith("twi_"):
        return tts_lang == "tw"
    if s.startswith("ewe_"):
        return tts_lang == "ee"
    if s.startswith("kikuyu_"):
        return tts_lang in ("kikuyu", "ki")
    return True


def _khaya_tts_url() -> str:
    custom = (os.getenv("KHAYA_TTS_URL") or "").strip()
    if custom:
        return custom
    return f"{KHAYA_BASE_URL}/tts/v1/synthesize"


def _tts_speaker_id_for_api_language(tts_lang: str) -> str | None:
    per_env = _TTS_SPEAKER_ENV_BY_API_LANG.get(tts_lang)
    if per_env:
        raw = (os.getenv(per_env) or "").strip()
        if raw and raw not in _PLACEHOLDER_VALUES and _speaker_id_matches_api_language(raw, tts_lang):
            return raw
    for env_name in ("KHAYA_TTS_SPEAKER_ID", "KHAYA_TTS_SPEAKER"):
        raw = (os.getenv(env_name) or "").strip()
        if raw and raw not in _PLACEHOLDER_VALUES and _speaker_id_matches_api_language(raw, tts_lang):
            return raw
    return DEFAULT_TTS_SPEAKER_ID_BY_API_LANG.get(tts_lang)


def _khaya_asr_url() -> str:
    custom = (os.getenv("KHAYA_ASR_URL") or "").strip()
    if custom:
        return custom
    return f"{KHAYA_BASE_URL}/asr/v1/transcribe"


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

    if source not in LANG_CODES:
        raise ValueError(f"Unsupported source language code: {source!r}")
    if target not in LANG_CODES:
        raise ValueError(f"Unsupported target language code: {target!r}")

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
            result = data
        elif isinstance(data, dict):
            result = data.get("out") or data.get("translation") or str(data)
        else:
            result = str(data)
        if not result or not result.strip():
            raise ValueError(f"Khaya returned an empty translation for lang pair {lang_pair!r}")
        return result

    return await async_retry(_call, label="khaya-translate")


def _tts_timeout_seconds(text_len: int) -> float:
    if os.getenv("KHAYA_TTS_TIMEOUT"):
        return float(os.environ["KHAYA_TTS_TIMEOUT"])
    # Long answers need more time for a single synthesize call.
    return min(300.0, max(45.0, 35.0 + text_len / 20.0))


async def text_to_speech(text: str, language: str) -> tuple[bytes, str]:
    """
    Convert text to speech audio using Khaya TTS.

    Returns:
        (audio_bytes, content_type), e.g. WAV ``audio/wav`` from ``/synthesize``.

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

    payload: dict[str, str] = {"text": text, "language": tts_lang}
    speaker_id = _tts_speaker_id_for_api_language(tts_lang)
    if speaker_id:
        payload["speaker_id"] = speaker_id

    headers = {
        "Content-Type": "application/json",
        "Ocp-Apim-Subscription-Key": _khaya_subscription_key(),
        "Cache-Control": "no-cache",
    }

    async def _call() -> tuple[bytes, str]:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            body = response.content
            ct = (response.headers.get("content-type") or "").split(";")[0].strip().lower()
            if body[:1] == b"{" or ct == "application/json":
                msg = "unexpected JSON from TTS"
                try:
                    data = response.json()
                    d = data.get("detail")
                    if isinstance(d, dict):
                        msg = str(d.get("message") or d.get("type") or d)
                    elif isinstance(d, str):
                        msg = d
                    else:
                        msg = str(data)[:500]
                except Exception:
                    msg = body.decode("utf-8", errors="replace")[:500]
                raise ValueError(f"Khaya TTS rejected the request: {msg}")
            if not ct or ct in ("application/octet-stream", "binary/octet-stream"):
                ct = "audio/wav" if body[:4] == b"RIFF" else "audio/mpeg"
            return body, ct

    return await async_retry(_call, label="khaya-tts")


async def speech_to_text(audio_bytes: bytes, language: str, content_type: str = "audio/wav") -> str:
    """
    Transcribe speech audio to text using Khaya ASR.

    Returns:
        Transcribed text string.
    """
    asr_url = _khaya_asr_url()
    if language not in LANG_CODES:
        raise ValueError(f"Unsupported ASR language code: {language!r}")
    asr_lang = LANG_CODES[language]

    async def _call() -> str:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                asr_url,
                params={"language": asr_lang},
                content=audio_bytes,
                headers={
                    "Content-Type": (content_type or "audio/wav"),
                    "Ocp-Apim-Subscription-Key": _khaya_subscription_key(),
                    "Cache-Control": "no-cache",
                },
            )
            response.raise_for_status()
            data = response.json()

        if isinstance(data, str):
            return data
        if isinstance(data, dict):
            return data.get("transcript") or data.get("text") or str(data)
        return str(data)

    return await async_retry(_call, label="khaya-asr")
