"""Simple token bucket for per-user request limits."""

from __future__ import annotations

import json
import time
from pathlib import Path
from threading import Lock

from config import DATA_DIR, RATE_LIMIT_PER_MIN, RATE_LIMIT_PER_HOUR

_lock = Lock()
_STATE_FILE = DATA_DIR / "rate_state.json"


def _load() -> dict:
    if not _STATE_FILE.exists():
        return {}
    try:
        return json.loads(_STATE_FILE.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return {}


def _save(state: dict) -> None:
    _STATE_FILE.write_text(json.dumps(state), encoding="utf-8")


def check(username: str) -> tuple[bool, str]:
    now = time.time()
    with _lock:
        state = _load()
        profile = state.setdefault(username, {"minute": [], "hour": []})

        profile["minute"] = [t for t in profile["minute"] if now - t < 60]
        profile["hour"] = [t for t in profile["hour"] if now - t < 3600]

        if len(profile["minute"]) >= RATE_LIMIT_PER_MIN:
            return False, f"Limit reached: {RATE_LIMIT_PER_MIN} per minute."
        if len(profile["hour"]) >= RATE_LIMIT_PER_HOUR:
            return False, f"Limit reached: {RATE_LIMIT_PER_HOUR} per hour."

        profile["minute"].append(now)
        profile["hour"].append(now)
        _save(state)
        return True, "OK"


def reset(username: str) -> None:
    with _lock:
        state = _load()
        if username in state:
            del state[username]
            _save(state)
