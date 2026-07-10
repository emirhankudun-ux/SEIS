"""Tool orchestration: built-in + plugin tools."""

from __future__ import annotations

import json
import os

from plugin_loader import all_definitions, dispatch, list_tools as plugin_tools
from rag import search as rag_search
from sandbox import run


BUILTIN_TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "shell_command",
            "description": "İzinli komutları sandbox içinde çalıştır.",
            "parameters": {
                "type": "object",
                "properties": {
                    "command": {"type": "string", "description": "Çalıştırılacak komut"},
                    "cwd": {"type": "string", "default": ""},
                },
                "required": ["command"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "rag_lookup",
            "description": "Doküman tabanında sorgu arar ve en alakalı snippetleri döndürür.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string"},
                    "k": {"type": "integer", "default": 3},
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "read_file",
            "description": "Belirtilen dosyanın içeriğini okur.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Dosya yolu"},
                },
                "required": ["path"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "write_file",
            "description": "Belirtilen dosyaya içerik yazar.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Dosya yolu"},
                    "content": {"type": "string", "description": "Yazılacak içerik"},
                },
                "required": ["path", "content"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_directory",
            "description": "Belirtilen dizindeki dosyaları listeler.",
            "parameters": {
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Dizin yolu", "default": "."},
                },
            },
        },
    }
]


def _plugin_definitions() -> list[dict]:
    try:
        return all_definitions()
    except Exception:
        return []


TOOL_DEFINITIONS = BUILTIN_TOOL_DEFINITIONS + _plugin_definitions()


def execute_tool(name: str, arguments: dict) -> str:
    if name == "shell_command":
        command = str(arguments.get("command", "")).strip()
        if not command:
            return "Komut boş."
        result = run(command, cwd=arguments.get("cwd") or None)
        return result.get("stdout") if result.get("stdout") else result.get("stderr", "")

    if name == "rag_lookup":
        query = str(arguments.get("query", "")).strip()
        if not query:
            return "Sorgu boş."
        k = int(arguments.get("k", 3))
        hits = rag_search(query, k=k)
        return json.dumps(hits, ensure_ascii=False, indent=2)

    if name == "read_file":
        path = arguments.get("path")
        try:
            with open(path, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            return f"Hata: {str(e)}"

    if name == "write_file":
        path = arguments.get("path")
        content = arguments.get("content")
        try:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            with open(path, 'w', encoding='utf-8') as f:
                f.write(content)
            return f"Başarıyla yazıldı: {path}"
        except Exception as e:
            return f"Hata: {str(e)}"

    if name == "list_directory":
        path = arguments.get("path", ".")
        try:
            files = os.listdir(path)
            return "\n".join(files)
        except Exception as e:
            return f"Hata: {str(e)}"

    if name in plugin_tools():
        return dispatch(name, arguments)

    return f"Araç bulunamadı: {name}"
