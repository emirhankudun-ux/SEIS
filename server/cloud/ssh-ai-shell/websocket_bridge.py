"""Simple WebSocket bridge between terminal apps and SSH-AI session state."""

from __future__ import annotations

import asyncio
import json
import time

from config import WS_BRIDGE_ENABLED, WS_BRIDGE_PORT

try:
    from websockets.server import serve
except Exception:
    print("websockets paketi yüklü değil. pip install websockets")
    raise


if not WS_BRIDGE_ENABLED:
    print("[WS] Bridge disabled via WS_BRIDGE_ENABLED=0")
    raise SystemExit(0)

BRIDGE_STATE: dict[str, dict] = {}


async def handle_client(ws):
    sid = None
    print(f"[WS] Connected: {ws.remote_address}")
    try:
        async for raw in ws:
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await ws.send(json.dumps({"error": "bad json"}))
                continue

            op = msg.get("op")
            if op == "register":
                sid = msg.get("session_id", f"ws-{int(time.time())}")
                BRIDGE_STATE[sid] = {"ws": ws, "last": time.time(), "buffer": []}
                await ws.send(json.dumps({"ok": True, "session_id": sid}))
            elif op == "message":
                if sid and sid in BRIDGE_STATE:
                    BRIDGE_STATE[sid]["buffer"].append(msg)
                    BRIDGE_STATE[sid]["last"] = time.time()
                    await ws.send(json.dumps({"ok": True, "queued": True}))
                else:
                    await ws.send(json.dumps({"ok": False, "error": "register first"}))
            elif op == "ping":
                await ws.send(json.dumps({"ok": True, "pong": True, "ts": time.time()}))
            else:
                await ws.send(json.dumps({"error": f"unknown op: {op}"}))
    except Exception:
        pass
    finally:
        if sid and sid in BRIDGE_STATE:
            BRIDGE_STATE[sid]["ws"] = None
            print(f"[WS] Disconnected: {sid}")


async def main() -> None:  # pragma: no cover
    print(f"[WS] Listening on ws://0.0.0.0:{WS_BRIDGE_PORT}")
    async with serve(handle_client, "0.0.0.0", WS_BRIDGE_PORT, max_size=10_000_000, ping_interval=20):
        await asyncio.Future()


if __name__ == "__main__":
    asyncio.run(main())
