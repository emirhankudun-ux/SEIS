"""Git operations plugin."""

from sandbox import run

PLUGIN_NAME = "git"

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "git_status",
            "description": "Git durumunu göster (status, log --oneline -10, branch -a).",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "git_diff",
            "description": "Git diff göster.",
            "parameters": {
                "type": "object",
                "properties": {
                    "staged": {"type": "boolean", "default": False},
                    "file": {"type": "string", "default": ""},
                },
            },
            "required": [],
        },
    },
    {
        "type": "function",
        "function": {
            "name": "git_commit",
            "description": "Değişiklikleri commit et.",
            "parameters": {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "add_all": {"type": "boolean", "default": True},
                },
                "required": ["message"],
            },
        },
    },
]


def execute(name: str, args: dict) -> str:
    if name == "git_status":
        out = []
        for sub in ["status --short", "log --oneline -10", "branch -a"]:
            r = run(f"git {sub}")
            out.append(f"=== git {sub} ===\n{r['stdout'] or '(boş)'}")
        return "\n\n".join(out)

    if name == "git_diff":
        staged = bool(args.get("staged", False))
        file_ = str(args.get("file", "")).strip()
        cmd = "git diff --staged" if staged else "git diff"
        if file_:
            cmd += f" -- {file_}"
        r = run(cmd)
        return r["stdout"] or "(değişiklik yok)"

    if name == "git_commit":
        message = str(args.get("message", "")).strip()
        if not message:
            return "[HATA] Mesaj boş olamaz."
        if args.get("add_all", True):
            r1 = run("git add -A")
            if not r1["ok"]:
                return f"git add hatası: {r1['stderr']}"
        safe = message.replace('"', '\\\\"')
        r2 = run(f'git commit -m "{safe}"')
        return (r2["stdout"] or "") + (f"\n{r2['stderr']}" if r2["stderr"] else "")

    return f"[git_plugin] Bilinmeyen araç: {name}"
