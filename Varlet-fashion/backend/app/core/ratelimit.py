"""Small in-memory rate limit. Counts are per server process, which suits one free-tier instance."""

import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request

from app.core.config import get_settings

_hits: dict[tuple[str, str], deque[float]] = defaultdict(deque)
_lock = threading.Lock()


def reset() -> None:
    with _lock:
        _hits.clear()


def client_address(request: Request) -> str:
    """Behind a hosting proxy every connection looks the same, so ask for its header."""
    header = get_settings().client_ip_header
    forwarded = request.headers.get(header, "").strip() if header else ""
    if forwarded:
        return forwarded[:64]
    return request.client.host if request.client else "unknown"


def rate_limit(name: str, limit: int, window_seconds: int = 60):
    def dependency(request: Request) -> None:
        if not get_settings().rate_limit_enabled:
            return
        key = (name, client_address(request))
        now = time.monotonic()
        with _lock:
            hits = _hits[key]
            while hits and now - hits[0] > window_seconds:
                hits.popleft()
            if len(hits) >= limit:
                raise HTTPException(429, "Too many requests. Please wait a minute and try again.")
            hits.append(now)

    return dependency
