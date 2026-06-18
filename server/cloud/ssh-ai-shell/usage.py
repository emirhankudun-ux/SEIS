"""Usage accounting and token cost estimate."""

from __future__ import annotations

import json
import threading
from datetime import date, datetime

from config import DATA_DIR, OPENAI_MODEL


_lock = threading.Lock()

PRICING = {
    "gpt-4o-mini": {"in": 0.00015, "out": 0.0006},
    "gpt-4o": {"in": 0.0025, "out": 0.01},
    "gpt-4-turbo": {"in": 0.01, "out": 0.03},
    "gpt-3.5-turbo": {"in": 0.0005, "out": 0.0015},
    "claude-3-5-sonnet": {"in": 0.003, "out": 0.015},
}


def estimate_tokens(text: str) -> int:
    """Rough token estimate. ~4 chars per token."""
    return max(1, len(text) // 4)


def record(username: str, prompt_tokens: int, completion_tokens: int, model: str = OPENAI_MODEL) -> dict:
    pricing = PRICING.get(model, PRICING["gpt-4o-mini"])
    cost = (prompt_tokens / 1000) * pricing["in"] + (completion_tokens / 1000) * pricing["out"]
    today = date.today().isoformat()
    log_file = DATA_DIR / "usage" / f"{today}.jsonl"

    entry = {
        "ts": datetime.now().isoformat(),
        "user": username,
        "model": model,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": prompt_tokens + completion_tokens,
        "cost_usd": round(cost, 6),
    }
    with _lock:
        with log_file.open("a", encoding="utf-8") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    return entry


def user_summary(username: str) -> dict:
    today = date.today().isoformat()
    log_file = DATA_DIR / "usage" / f"{today}.jsonl"
    summary = {"requests": 0, "tokens": 0, "cost": 0.0}
    if not log_file.exists():
        return summary

    for line in log_file.read_text(encoding="utf-8").splitlines():
        try:
            item = json.loads(line)
        except json.JSONDecodeError:
            continue
        if item.get("user") != username:
            continue
        summary["requests"] += 1
        summary["tokens"] += item.get("total_tokens", 0)
        summary["cost"] += item.get("cost_usd", 0.0)

    summary["cost"] = round(summary["cost"], 6)
    return summary
