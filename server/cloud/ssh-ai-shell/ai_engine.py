"""AI engine with provider abstraction, RAG + tools and persistence-safe output."""

from __future__ import annotations

import json
from typing import Generator

from config import (
    AI_PROVIDER,
    OPENAI_API_KEY,
    OPENAI_MODEL,
    ANTHROPIC_API_KEY,
    ANTHROPIC_MODEL,
    LOCAL_MODEL_NAME,
    LOCAL_MODEL_URL,
    MAX_TOOL_ITERATIONS,
)
from rag import search as rag_search
from tools import TOOL_DEFINITIONS, execute_tool


class AIEngine:
    def __init__(self, provider: str | None = None, model: str | None = None):
        self.provider = (provider or AI_PROVIDER).lower()
        self.model = model or (
            OPENAI_MODEL if self.provider == "openai" else
            ANTHROPIC_MODEL if self.provider == "anthropic" else
            LOCAL_MODEL_NAME
        )
        self.client = None

        if self.provider in {"openai", "local"}:
            try:
                self.client = self._openai_client(
                    OPENAI_API_KEY if self.provider == "openai" else "not-needed",
                    local=(self.provider == "local"),
                )
            except Exception:
                self.client = None

    def _openai_client(self, api_key: str, local: bool = False):
        from openai import OpenAI

        if local:
            return OpenAI(base_url=LOCAL_MODEL_URL, api_key=api_key)
        return OpenAI(api_key=api_key)

    def chat(self, messages: list[dict], user_input: str, **kwargs) -> str:
        return "".join(self.stream(messages + [{"role": "user", "content": user_input}], **kwargs))

    def stream(
        self,
        messages: list[dict],
        username: str = "",
        use_tools: bool = True,
        use_rag: bool = True,
        system_prompt: str = "",
    ) -> Generator[str, None, None]:
        prompt_messages = self._with_system_rag(messages, system_prompt=system_prompt, use_rag=use_rag)

        if self.provider in {"openai", "local"}:
            yield from self._stream_openai(prompt_messages, use_tools=use_tools)
            return

        if self.provider == "anthropic":
            yield from self._stream_anthropic(prompt_messages, system_prompt=system_prompt)
            return

        yield "[ERROR] Bilinmeyen AI sağlayıcısı."

    def _with_system_rag(self, messages: list[dict], *, system_prompt: str, use_rag: bool) -> list[dict]:
        prompt = [dict(m) for m in messages]

        if not prompt or prompt[0].get("role") != "system":
            prompt.insert(0, {"role": "system", "content": system_prompt or "Sen SSH-AI asistanısın."})

        if use_rag:
            query = ""
            for msg in reversed(prompt):
                if msg.get("role") == "user":
                    query = msg.get("content", "")
                    break
            if query:
                hits = rag_search(str(query), k=3)
                if hits:
                    context = "\n\n".join(f"[{h['source']}]\n{h['text']}" for h in hits)
                    prompt.insert(1, {"role": "system", "content": "[RAG BAĞLAMI]\n" + context})

        return prompt

    def _stream_openai(self, messages: list[dict], use_tools: bool = True) -> Generator[str, None, None]:
        if not self.client:
            yield "[API ERROR] OpenAI client başlatılamadı."
            return

        current = list(messages)
        iterations = 0

        while iterations < MAX_TOOL_ITERATIONS:
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=current,
                    temperature=0.7,
                    tools=TOOL_DEFINITIONS if use_tools else [],
                    tool_choice="auto" if use_tools else "none",
                )
            except Exception as exc:
                yield f"[API ERROR] {exc}"
                return

            if not response.choices:
                return

            assistant_msg = response.choices[0].message
            tool_calls = list(getattr(assistant_msg, "tool_calls", []) or [])
            content = assistant_msg.content or ""

            if tool_calls:
                if content:
                    yield f"{content}\n"

                for call in tool_calls:
                    func_name = getattr(call.function, "name", "")
                    raw_args = getattr(call.function, "arguments", "{}")
                    try:
                        args = json.loads(raw_args)
                    except json.JSONDecodeError:
                        args = {"_raw": raw_args}

                    yield f"[tool:{func_name}] Çalıştırılıyor...\n"
                    tool_output = execute_tool(func_name, args)
                    yield f"{tool_output}\n"

                    tc = {
                        "id": getattr(call, "id", ""),
                        "type": "function",
                        "function": {
                            "name": func_name,
                            "arguments": raw_args,
                        },
                    }
                    current.append({"role": "assistant", "content": content, "tool_calls": [tc]})
                    current.append({"role": "tool", "tool_call_id": tc["id"], "name": func_name, "content": str(tool_output)})

                iterations += 1
                continue

            if content:
                yield content
            return

        yield "[WARNING] Tool iteration limit reached."

    def _stream_anthropic(self, messages: list[dict], system_prompt: str = "") -> Generator[str, None, None]:
        if not ANTHROPIC_API_KEY:
            yield "[API ERROR] ANTHROPIC_API_KEY missing."
            return

        try:
            from anthropic import Anthropic
        except Exception:
            yield "[API ERROR] anthropic package unavailable."
            return

        sys_prompt = messages[0].get("content") if messages else (system_prompt or "")
        user_messages = [m for m in messages if m.get("role") in {"user", "assistant"}]
        try:
            response = Anthropic(api_key=ANTHROPIC_API_KEY).messages.create(
                model=self.model,
                system=sys_prompt,
                max_tokens=1024,
                messages=user_messages,
            )
            if response.content:
                yield response.content[0].text
        except Exception as exc:
            yield f"[API ERROR] {exc}"
