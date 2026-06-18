#!/usr/bin/env python3
"""SSH-AI entrypoint.

Designed for ForceCommand-based SSH access and daemon-backed session persistence.
"""

from __future__ import annotations

import getpass
import os
import argparse
import sys

from commands import handle_slash
from ai_engine import AIEngine
from i18n import get as i18n_get, pick
from memory import Session
from persistence import KeepaliveThread, load_state, save_state
from rate_limit import check as rate_check
from usage import estimate_tokens, record, user_summary


class C:
    RESET = "\033[0m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    MAGENTA = "\033[95m"

    @classmethod
    def disable(cls) -> None:
        for name in ("RESET", "BOLD", "DIM", "CYAN", "GREEN", "YELLOW", "RED", "MAGENTA"):
            setattr(cls, name, "")


def _banner() -> str:
    return (
        f"{C.CYAN}╔════════════════════════════════════════════════════╗\n"
        f"║             SSH-AI v0.3 • Terminal Asistanı        ║\n"
        f"╚════════════════════════════════════════════════════╝{C.RESET}"
    )


def _prompt(username: str) -> str:
    return f"{C.GREEN}┌──({username}@ssh-ai){C.RESET}\n{C.GREEN}└──▶{C.RESET} "


def _welcome(name: str, lang: str) -> str:
    prompts = i18n_get(lang)
    return prompts["welcome"].format(name=name)


def _connect_to_previous_session(username: str, session: Session, session_id: str | None = None) -> None:
    sid = (session_id or os.environ.get("SSH_AI_SESSION_ID", "")).strip()
    if not sid:
        return
    saved = load_state(sid)
    if not saved:
        return

    data = saved.get("data") if isinstance(saved, dict) and "data" in saved else saved
    messages = data.get("messages") if isinstance(data, dict) else None
    if not isinstance(messages, list):
        return
    if data.get("username") not in ("", username):
        return

    session.session_id = sid
    session.messages = messages[-len(messages):]
    session._save()


def main() -> None:
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--session-id", dest="session_id")
    parser.add_argument("--help", action="store_true")
    args, _ = parser.parse_known_args()
    if args.help:
        print("SSH-AI v0.3\nKullanım: ai_shell.py [--session-id <session-id>]")
        return

    if not sys.stdout.isatty() or os.environ.get("NO_COLOR"):
        C.disable()

    username = os.environ.get("USER") or getpass.getuser() or "anon"
    selected_lang = os.environ.get("SSH_AI_LANG", "auto")
    prompts = i18n_get(selected_lang)

    engine = AIEngine()
    engine_state = {
        "provider": engine.provider,
        "model": engine.model,
        "language": selected_lang,
    }

    session = Session(username)
    _connect_to_previous_session(username, session, args.session_id)

    keepalive = KeepaliveThread(session.session_id)
    keepalive.start()

    print(_banner())
    print(f"{C.DIM}Kullanıcı:{C.RESET} {C.BOLD}{username}{C.RESET}  {C.DIM}Session:{C.RESET} {C.DIM}{session.session_id}{C.RESET}")
    print(f"{C.DIM}Model:{C.RESET} {engine.provider}/{engine.model}")
    print(f"{C.DIM}{prompts['welcome'].format(name=username)}{C.RESET}\n")

    try:
        while True:
            try:
                user_input = input(_prompt(username)).strip()
            except (EOFError, KeyboardInterrupt):
                print(f"\n{C.DIM}{prompts['connection_closed']}{C.RESET}")
                break

            if not user_input:
                continue

            if user_input.startswith("/"):
                handled, output = handle_slash(user_input, session, engine_state)
                if not handled:
                    print(f"{C.RED}Bilinmeyen komut:{C.RESET} {user_input} (yardım: /help)")
                    continue
                if output == "__EXIT__":
                    print(f"{C.DIM}{prompts['goodbye']}{C.RESET}")
                    break
                if output:
                    print(output)
                continue

            allowed, reason = rate_check(username)
            if not allowed:
                print(prompts["rate_limited"].format(msg=reason))
                continue

            prompt_pack = pick(engine_state.get("language", "auto"), user_input)
            engine_state["language"] = os.environ.get("SSH_AI_LANG", engine_state.get("language", "auto"))

            session.add("user", user_input)
            print(f"{C.DIM}{prompt_pack['thinking']}{C.RESET}", end="\r")

            response_parts: list[str] = []
            try:
                for chunk in engine.stream(
                    session.messages,
                    username=username,
                    use_tools=True,
                    use_rag=True,
                    system_prompt=prompt_pack["system"],
                ):
                    response_parts.append(chunk)
                    if chunk:
                        print(f"{C.MAGENTA}{chunk}{C.RESET}", end="", flush=True)
            except Exception as exc:
                response_parts = [prompt_pack["error_api"].format(e=exc)]

            print()
            response = "".join(response_parts).strip() or "(boş yanıt)"
            session.add("assistant", response)

            record(
                username,
                estimate_tokens(user_input),
                estimate_tokens(response),
                model=engine.model,
            )
            usage = user_summary(username)
            print(f"{C.DIM}Usage:{C.RESET} {usage['requests']} req, {usage['tokens']} token, ~${usage['cost']}")

            save_state(session.session_id, username, session.messages, {"model": engine.model})
    finally:
        keepalive.stop()
        keepalive.join(timeout=1)


if __name__ == "__main__":
    main()
