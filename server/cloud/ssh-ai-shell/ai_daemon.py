"""Background daemon that stores SSH session states."""

from __future__ import annotations

import json
import socketserver
import threading
import time
from pathlib import Path
from tempfile import NamedTemporaryFile

from config import DAEMON_HOST, DAEMON_PORT, DAEMON_TOKEN, SESSIONS_DIR

LOCK = threading.Lock()


class SessionStore:
    def __init__(self, base_dir: Path):
        self.base_dir = base_dir
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _path(self, session_id: str) -> Path:
        return self.base_dir / f"{session_id}.json"

    def save(self, payload: dict) -> None:
        session_id = payload.get("session_id", "")
        if not session_id:
            raise ValueError("session_id required")
        with LOCK:
            data = {
                "session_id": session_id,
                "username": payload.get("username", ""),
                "updated_at": payload.get("ts", time.time()),
                "messages": payload.get("messages", []),
                "metadata": payload.get("metadata", {}),
            }
            self._atomic_write_json(self._path(session_id), data)

    @staticmethod
    def _atomic_write_json(path: Path, payload: dict) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        with NamedTemporaryFile("w", dir=path.parent, encoding="utf-8", delete=False) as tmp:
            tmp.write(json.dumps(payload, ensure_ascii=False, indent=2))
            tmp.flush()
            tmp_path = tmp.name
        Path(tmp_path).replace(path)

    def load(self, session_id: str) -> dict:
        path = self._path(session_id)
        if not path.exists():
            return {}
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            return {}

    def list(self, username: str) -> list[dict]:
        sessions: list[dict] = []
        with LOCK:
            for path in self.base_dir.glob("*.json"):
                try:
                    data = json.loads(path.read_text(encoding="utf-8"))
                except Exception:
                    continue
                if not username or data.get("username") == username:
                    sessions.append(data)
        sessions.sort(key=lambda item: item.get("updated_at", 0), reverse=True)
        return [
            {
                "session_id": item.get("session_id", "unknown"),
                "username": item.get("username", ""),
                "updated_at": item.get("updated_at", 0),
                "n_messages": len(item.get("messages", [])),
            }
            for item in sessions
        ]


STORE = SessionStore(SESSIONS_DIR)


def authorized(payload: dict) -> bool:
    if not DAEMON_TOKEN:
        return True
    return payload.get("token") == DAEMON_TOKEN


class Handler(socketserver.StreamRequestHandler):
    def handle(self) -> None:  # pragma: no cover
        line = self.rfile.readline().decode("utf-8", errors="replace").strip()
        if not line:
            return
        try:
            payload = json.loads(line)
        except json.JSONDecodeError:
            self.wfile.write(b'{"ok":false,"error":"invalid json"}\n')
            return

        if not authorized(payload):
            self.wfile.write(b'{"ok":false,"error":"unauthorized"}\n')
            return

        op = payload.get("op")
        if op == "save":
            try:
                STORE.save(payload)
                self.wfile.write(b'{"ok":true}\n')
            except Exception as exc:
                self.wfile.write(json.dumps({"ok": False, "error": str(exc)}).encode("utf-8") + b"\n")
        elif op == "load":
            session_id = payload.get("session_id", "")
            data = STORE.load(session_id)
            if data:
                self.wfile.write(json.dumps({"ok": True, "data": data}).encode("utf-8") + b"\n")
            else:
                self.wfile.write(b'{"ok":false,"error":"not found"}\n')
        elif op == "list":
            username = payload.get("username", "")
            sessions = STORE.list(username)
            self.wfile.write(json.dumps({"ok": True, "sessions": sessions}).encode("utf-8") + b"\n")
        elif op == "ping":
            self.wfile.write(json.dumps({"ok": True, "pong": True}).encode("utf-8") + b"\n")
        else:
            self.wfile.write(json.dumps({"ok": False, "error": f"unsupported op: {op}"}).encode("utf-8") + b"\n")


def main() -> None:  # pragma: no cover
    with socketserver.ThreadingTCPServer((DAEMON_HOST, DAEMON_PORT), Handler) as server:
        print(f"[daemon] running on {DAEMON_HOST}:{DAEMON_PORT}")
        server.serve_forever()


if __name__ == "__main__":
    main()
