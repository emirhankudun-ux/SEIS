"""Slash command handling for SSH-AI v0.3."""

from __future__ import annotations

import os
import shlex
import time

import sandbox
from config import SAFE_SHELL_COMMANDS
from persistence import list_user_sessions, load_state
from memory import Session


def handle_slash(user_input: str, session: Session, engine_var: dict) -> tuple[bool, str]:
    parts = shlex.split(user_input)
    if not parts:
        return True, ""

    cmd = parts[0].lower()
    args = parts[1:]

    if cmd in ("/exit", "/quit"):
        return True, "__EXIT__"
    if cmd == "/help":
        return True, _help()
    if cmd == "/clear":
        os.system("clear" if os.name != "nt" else "cls")
        return True, ""
    if cmd == "/reset":
        session.reset()
        return True, "Konuşma sıfırlandı."
    if cmd == "/history":
        return True, _history(session)
    if cmd == "/model":
        return True, f"Sağlayıcı: {engine_var.get('provider')}, Model: {engine_var.get('model')}"
    if cmd == "/usage":
        from usage import user_summary
        summary = user_summary(session.username)
        return True, f"📊 Bugün: {summary['requests']} istek, {summary['tokens']} token, ~${summary['cost']}"
    if cmd == "/index":
        from rag import index_all
        index_all()
        return True, "RAG indeksleme tamamlandı."
    if cmd == "/plugins":
        from plugin_loader import list_tools
        tools = list_tools()
        return True, "🔌 Yüklü plugin araçları ({}):\n  {}".format(len(tools), "\n  ".join(tools) if tools else "Yok")
    if cmd == "/sessions":
        return True, _list_sessions(session.username)
    if cmd == "/resume":
        return True, _resume(session, args)
    if cmd == "/lang":
        return True, _set_lang(args, engine_var)
    if cmd == "/shell":
        if not args:
            return True, "Kullanım: /shell <komut>"
        result = sandbox.run(" ".join(args))
        return True, result.get("stdout") or result.get("stderr") or f"(rc={result.get('code')})"

    if cmd.startswith("/") and len(cmd) > 1 and cmd[1:] in SAFE_SHELL_COMMANDS:
        result = sandbox.run(user_input[1:])
        return True, result.get("stdout") or result.get("stderr") or f"(rc={result.get('code')})"

    return False, ""


def _help() -> str:
    return """
📚 SSH-AI v0.3 Komutları:

Temel:
  /help, /exit, /clear, /reset, /history, /model, /usage

Veri & RAG:
  /index         RAG dökümanlarını indeksle
  /plugins       Yüklü plugin araçlarını listele
  /sessions      Kayıtlı oturumlarını listele
  /resume <id>   Eski oturuma dön
  /lang tr|en|auto  Dil modunu değiştir

Shell:
  /shell <cmd>   Sandbox'lı shell komutu
  /<cmd>         Kısayol: /ls, /cat, /git, /grep ...
"""


def _history(session: Session) -> str:
    if not session.messages:
        return "Henüz mesaj yok."
    lines: list[str] = []
    for msg in session.messages[-20:]:
        role = "Sen" if msg["role"] == "user" else "AI"
        lines.append(f"[{role}] {str(msg['content'])[:220].replace(chr(10), ' ')}")
    return "\n".join(lines)


def _list_sessions(username: str) -> str:
    sessions = list_user_sessions(username)
    if not sessions:
        return "Kayıtlı oturum yok."
    lines = ["📂 Kayıtlı oturumlar:"]
    for item in sessions[:15]:
        ts = item.get("updated_at")
        if isinstance(ts, (int, float)):
            ts_text = time.strftime("%Y-%m-%d %H:%M", time.localtime(ts))
        else:
            ts_text = "?"
        lines.append(f"  {item.get('session_id')}  ({item.get('n_messages', 0)} mesaj, {ts_text})")
    return "\n".join(lines)


def _resume(session: Session, args: list[str]) -> str:
    if not args:
        return "Kullanım: /resume <session_id>"
    session_id = args[0].strip()
    data = load_state(session_id)
    if not data:
        return f"Oturum bulunamadı: {session_id}"

    messages = data.get("messages", [])
    if not isinstance(messages, list):
        return f"Geçersiz oturum verisi: {session_id}"

    session.session_id = session_id
    session.messages = messages
    session._save()
    return f"✅ Oturum yüklendi: {session_id} ({len(messages)} mesaj)"


def _set_lang(args: list[str], engine_var: dict) -> str:
    if not args:
        return f"Aktif dil: {engine_var.get('language', 'tr')}. Kullanım: /lang tr|en|auto"
    lang = args[0].lower()
    if lang not in {"tr", "en", "auto"}:
        return "Geçersiz dil. /lang tr|en|auto"
    os.environ["SSH_AI_LANG"] = lang
    engine_var["language"] = lang
    return f"✅ Dil: {lang}"
