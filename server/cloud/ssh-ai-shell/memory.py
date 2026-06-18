"""Conversation memory persistence for SSH-AI sessions."""

from __future__ import annotations

import json
from datetime import datetime
import uuid

from config import MAX_HISTORY, HISTORY_DIR, SESSIONS_DIR


class Session:
    def __init__(self, username: str, session_id: str | None = None):
        self.username = username
        self.session_id = session_id or self._new_session_id()
        self.messages: list[dict] = []
        self.created_at = datetime.now().isoformat()

        # Always keep both history and sessions store in sync.
        self.file_path = SESSIONS_DIR / f"{self.session_id}.json"
        if self.file_path.exists():
            self._load_from_disk()
        else:
            self._ensure_file()

    def _new_session_id(self) -> str:
        return f"{self.username}-{datetime.now().strftime('%Y%m%d-%H%M%S')}-{uuid.uuid4().hex[:6]}"

    def _ensure_file(self) -> None:
        self._save()

    def _load_from_disk(self) -> None:
        try:
            payload = json.loads(self.file_path.read_text(encoding="utf-8"))
            self.messages = payload.get("messages", [])[-MAX_HISTORY:]
            self.created_at = payload.get("created_at", self.created_at)
            self.username = payload.get("username", self.username)
        except Exception:
            self.messages = []
            self.created_at = datetime.now().isoformat()

    def add(self, role: str, content: str, **extra) -> None:
        self.messages.append({"role": role, "content": content, **extra})
        if len(self.messages) > MAX_HISTORY:
            self.messages = self.messages[-MAX_HISTORY:]
        self._save()

    def reset(self) -> None:
        self.messages = []
        self._save()

    def _save(self) -> None:
        payload = {
            "session_id": self.session_id,
            "username": self.username,
            "created_at": self.created_at,
            "updated_at": datetime.now().isoformat(),
            "messages": self.messages,
        }
        self.file_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
        # Keep legacy mirror directory for previous code paths
        (HISTORY_DIR / f"{self.session_id}.json").write_text(
            json.dumps(payload, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
