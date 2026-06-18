"""Docker plugin for controlled container/compose visibility."""

from sandbox import run

PLUGIN_NAME = "docker"

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "docker_ps",
            "description": "Çalışan ve durmuş container listesi gösterir.",
            "parameters": {"type": "object", "properties": {}, "required": []},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "docker_logs",
            "description": "Belirtilen container loglarını getirir.",
            "parameters": {
                "type": "object",
                "properties": {
                    "container": {"type": "string"},
                    "lines": {"type": "integer", "default": 80},
                },
                "required": ["container"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "docker_rm",
            "description": "Container'ı kaldırır (force=false).",
            "parameters": {
                "type": "object",
                "properties": {
                    "container": {"type": "string"},
                    "force": {"type": "boolean", "default": False},
                },
                "required": ["container"],
            },
        },
    },
]


def execute(name: str, args: dict) -> str:
    if name == "docker_ps":
        r = run("docker ps -a --format '{{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Names}}'")
        return r["stdout"] or "(container yok)"

    if name == "docker_logs":
        container = str(args.get("container", "")).strip()
        if not container:
            return "[docker] container adı gerekli."
        lines = int(args.get("lines", 80))
        r = run(f"docker logs --tail {max(1, lines)} {container}")
        return r["stdout"] or r["stderr"] or "(çıktı yok)"

    if name == "docker_rm":
        container = str(args.get("container", "")).strip()
        force = bool(args.get("force", False))
        if not container:
            return "[docker] container adı gerekli."
        flag = " -f" if force else ""
        r = run(f"docker rm{flag} {container}")
        return r["stdout"] or r["stderr"] or "(çıktı yok)"

    return f"[docker_plugin] Bilinmeyen araç: {name}"
