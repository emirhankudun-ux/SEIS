"""Client-side persistence helpers with optional daemon fallback."""

from __future__ import annotations

import json
import socket
import threading
import time
from pathlib import Path
from tempfile import NamedTemporaryFile
from config import DAEMON_ENABLED, DAEMON_HOST, DAEMON_PORT, DAEMON_TOKEN, SESSIONS_DIR


_SOCK_TIMEOUT = 1.5


def _send(payload: dict) -> dict | None:
    if not DAEMON_ENABLED:
        return None

    try:
        with socket.create_connection((DAEMON_HOST, DAEMON_PORT), timeout=_SOCK_TIMEOUT) as sock:
            if DAEMON_TOKEN:
                payload = dict(payload)
                payload["token"] = DAEMON_TOKEN
            sock.sendall((json.dumps(payload) + "\n").encode("utf-8"))
            response = sock.recv(1 << 20).decode("utf-8", errors="replace").strip()
            return json.loads(response) if response else None
    except Exception:
        return None


def save_state(session_id: str, username: str, messages: list[dict], metadata: dict | None = None) -> bool:
    res = _send({
        "op": "save",
        "session_id": session_id,
        "username": username,
        "messages": messages,
        "metadata": metadata or {},
    })
    if res and res.get("ok"):
        return True

    # local fallback
    path = SESSIONS_DIR / f"{session_id}.json"
    payload = {
        "session_id": session_id,
        "username": username,
        "updated_at": metadata.get("ts", time.time()) if metadata else time.time(),
        "messages": messages,
    }
    _atomic_write_json(path, payload)
    return True


def load_state(session_id: str) -> dict | None:
    response = _send({"op": "load", "session_id": session_id})
    if response and response.get("ok"):
        return response.get("data")

    path = SESSIONS_DIR / f"{session_id}.json"
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return None


def list_user_sessions(username: str) -> list[dict]:
    response = _send({"op": "list", "username": username})
    if response and response.get("ok"):
        return response.get("sessions", [])

    sessions: list[dict] = []
    for f in sorted(SESSIONS_DIR.glob("*.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            continue
        if data.get("username") != username:
            continue
        sessions.append(data)
    sessions.sort(key=lambda item: item.get("updated_at", ""), reverse=True)
    return [
        {
            "session_id": s.get("session_id", ""),
            "updated_at": s.get("updated_at") or 0,
            "n_messages": len(s.get("messages", [])),
        }
        for s in sessions
    ]


def _atomic_write_json(path: Path, payload: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with NamedTemporaryFile("w", dir=path.parent, encoding="utf-8", delete=False) as tmp:
        tmp.write(json.dumps(payload, ensure_ascii=False, indent=2))
        tmp.flush()
        tmp_path = tmp.name
    Path(tmp_path).replace(path)


def keepalive(session_id: str) -> bool:
    response = _send({"op": "ping", "session_id": session_id})
    return bool(response and response.get("ok"))


class KeepaliveThread(threading.Thread):
    def __init__(self, session_id: str, interval: int = 30):
        super().__init__(daemon=True)
        self.session_id = session_id
        self.interval = interval
        self._stop = threading.Event()

    def run(self) -> None:  # pragma: no cover
        while not self._stop.wait(self.interval):
            keepalive(self.session_id)

    def stop(self) -> None:
        self._stop.set()
