"""Web utility plugin."""

from __future__ import annotations

import urllib.request

from config import SSH_AI_USER_AGENT

PLUGIN_NAME = "web"

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "http_get",
            "description": "URL'den ham içerik çekme. Sadece GET.",
            "parameters": {
                "type": "object",
                "properties": {
                    "url": {"type": "string"},
                    "max_chars": {"type": "integer", "default": 5000},
                },
                "required": ["url"],
            },
        },
    }
]


def execute(name: str, args: dict) -> str:
    if name != "http_get":
        return f"[web] Bilinmeyen araç: {name}"

    url = str(args.get("url", "")).strip()
    if not url.startswith(("http://", "https://")):
        return "[HATA] Geçersiz URL"

    try:
        req = urllib.request.Request(url, headers={"User-Agent": SSH_AI_USER_AGENT})
        with urllib.request.urlopen(req, timeout=15) as response:
            data = response.read().decode("utf-8", errors="replace")
        max_chars = int(args.get("max_chars", 5000))
        return data[:max_chars] + ("\n...[kırpıldı]" if len(data) > max_chars else "")
    except Exception as exc:  # pragma: no cover
        return f"[HATA] {exc}"
