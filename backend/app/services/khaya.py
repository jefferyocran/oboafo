"""
Khaya AI API wrapper — Translation, ASR, TTS for Ghanaian languages.
Documentation: https://ghananlp.org/
"""

import os
import httpx

KHAYA_BASE_URL = "https://translation.ghananlp.org"
KHAYA_API_KEY = os.getenv("KHAYA_API_KEY", "")

# Khaya language code mapping
# Khaya uses codes like "tw", "ee", "ga" internally
LANG_CODES = {
    "en": "en",
    "tw": "tw",  # Akan/Twi
    "ee": "ee",  # Ewe
    "ga": "ga",  # Ga
}


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

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(
            f"{KHAYA_BASE_URL}/v1/translate",
            json={"in": text, "lang": lang_pair},
            headers={
                "Content-Type": "application/json",
                "Ocp-Apim-Subscription-Key": KHAYA_API_KEY,
            },
        )
        response.raise_for_status()
        data = response.json()

    # Khaya returns the translation in the "out" field
    # Adjust if the actual response shape differs
    if isinstance(data, str):
        return data
    if isinstance(data, dict):
        return data.get("out") or data.get("translation") or str(data)
    return str(data)


async def text_to_speech(text: str, language: str) -> bytes:
    """
    Convert text to speech audio using Khaya TTS.

    Returns:
        Audio bytes (typically MP3 or WAV).
    """
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{KHAYA_BASE_URL}/v1/tts",
            json={"text": text, "language": LANG_CODES[language]},
            headers={
                "Ocp-Apim-Subscription-Key": KHAYA_API_KEY,
            },
        )
        response.raise_for_status()
        return response.content


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
                "Ocp-Apim-Subscription-Key": KHAYA_API_KEY,
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
