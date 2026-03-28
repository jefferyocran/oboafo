"""Small async retry helper for transient API failures (429, 5xx, timeouts)."""

from __future__ import annotations

import asyncio
import logging
import os
import random
from collections.abc import Awaitable, Callable
from typing import TypeVar

import httpx

logger = logging.getLogger(__name__)

T = TypeVar("T")


def _attempts() -> int:
    return max(1, min(8, int(os.getenv("API_RETRY_ATTEMPTS", "4"))))


def _base_delay() -> float:
    return max(0.1, float(os.getenv("API_RETRY_BASE_DELAY", "0.75")))


def _transient_http(exc: BaseException) -> bool:
    if isinstance(exc, httpx.HTTPStatusError):
        return exc.response.status_code in (408, 409, 425, 429, 500, 502, 503, 504)
    if isinstance(exc, httpx.RequestError):
        return True
    return False


def _transient_anthropic(exc: BaseException) -> bool:
    name = type(exc).__name__
    if any(x in name for x in ("RateLimit", "Overloaded", "APIConnection", "InternalServer")):
        return True
    msg = str(exc).lower()
    if "429" in msg or "rate_limit" in msg or "overloaded" in msg or "timeout" in msg:
        return True
    return False


def _transient_openai(exc: BaseException) -> bool:
    name = type(exc).__name__
    if "RateLimit" in name or "APIConnection" in name:
        return True
    msg = str(exc).lower()
    return "429" in msg or "503" in msg or "timeout" in msg


def is_transient_error(exc: BaseException) -> bool:
    if _transient_http(exc):
        return True
    if _transient_anthropic(exc):
        return True
    if _transient_openai(exc):
        return True
    return False


def _format_exception_for_log(exc: BaseException) -> str:
    """httpx (and others) often leave str(exc) empty; still log something actionable."""
    msg = str(exc).strip()
    if msg:
        return msg
    parts: list[str] = [type(exc).__name__]
    if isinstance(exc, httpx.HTTPStatusError):
        parts.append(f"status={exc.response.status_code}")
        try:
            body = (exc.response.text or "").strip().replace("\n", " ")[:180]
            if body:
                parts.append(f"body={body}")
        except Exception:
            pass
    elif isinstance(exc, httpx.RequestError):
        parts.append(f"request={exc.request.url!s}" if exc.request else "no-request")
    return " ".join(parts)


async def async_retry(
    op: Callable[[], Awaitable[T]],
    *,
    label: str = "request",
) -> T:
    """Run ``op`` with exponential backoff + jitter on transient errors."""
    attempts = _attempts()
    base = _base_delay()
    last: BaseException | None = None
    for i in range(attempts):
        try:
            return await op()
        except Exception as e:
            last = e
            if i == attempts - 1 or not is_transient_error(e):
                raise
            wait = min(30.0, base * (2**i) + random.uniform(0, 0.35))
            logger.warning(
                "%s transient error (attempt %s/%s): %s — retry in %.2fs",
                label,
                i + 1,
                attempts,
                _format_exception_for_log(e),
                wait,
            )
            await asyncio.sleep(wait)
    assert last is not None
    raise last
