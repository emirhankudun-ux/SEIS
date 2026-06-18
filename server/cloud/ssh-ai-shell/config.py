"""Central configuration for SSH-AI v0.3."""

import os
from pathlib import Path

# ==== AI provider selection ====
AI_PROVIDER = os.getenv("AI_PROVIDER", "openai").strip().lower()
if AI_PROVIDER not in {"openai", "anthropic", "local"}:
    AI_PROVIDER = "openai"

# OpenAI
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

# Anthropic
ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-3-5-sonnet-20241022")

# OpenAI-compatible local model endpoint
LOCAL_MODEL_URL = os.getenv("LOCAL_MODEL_URL", "http://localhost:11434/v1")
LOCAL_MODEL_NAME = os.getenv("LOCAL_MODEL_NAME", "llama3.1")

# Compatibility for older OLLAMA-based snippets
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.1")

# ==== UI/Language ====
LANGUAGE = os.getenv("SSH_AI_LANG", "auto")  # tr | en | auto

# ==== Conversation/engine ====
MAX_HISTORY = 30
MAX_TOOL_ITERATIONS = 5

# ==== Rate limiting ====
RATE_LIMIT_PER_MIN = int(os.getenv("RATE_LIMIT_PER_MIN", "20"))
RATE_LIMIT_PER_HOUR = int(os.getenv("RATE_LIMIT_PER_HOUR", "200"))

# ==== Persistence (background daemon) ====
DAEMON_ENABLED = os.getenv("DAEMON_ENABLED", "1") == "1"
DAEMON_HOST = os.getenv("DAEMON_HOST", "127.0.0.1")
DAEMON_PORT = int(os.getenv("DAEMON_PORT", "7777"))
DAEMON_TOKEN = os.getenv("DAEMON_TOKEN", "")

# ==== WebSocket bridge ====
WS_BRIDGE_ENABLED = os.getenv("WS_BRIDGE_ENABLED", "1") == "1"
WS_BRIDGE_PORT = int(os.getenv("WS_BRIDGE_PORT", "7778"))

# ==== Plugins ====
PLUGINS_DIR = Path(__file__).parent / "plugins"

# ==== Sandboxed shell ====
SANDBOX_ENABLED = os.getenv("SANDBOX_ENABLED", "1") == "1"
SANDBOX_TIMEOUT = int(os.getenv("SANDBOX_TIMEOUT", "20"))
SANDBOX_MAX_OUTPUT = int(os.getenv("SANDBOX_MAX_OUTPUT", "50000"))
SANDBOX_WORKDIR = os.getenv("SANDBOX_WORKDIR", "/tmp/ssh-ai-sandbox")

# ==== Data directories ====
DATA_DIR = Path(os.getenv("SSH_AI_DATA", str(Path.home() / ".ssh_ai")))
DATA_DIR.mkdir(parents=True, exist_ok=True)
for sub in ("history", "sessions", "docs", "vectors", "usage", "plugins_state"):
    (DATA_DIR / sub).mkdir(exist_ok=True)

HISTORY_DIR = DATA_DIR / "history"
SESSIONS_DIR = DATA_DIR / "sessions"
USAGE_DIR = DATA_DIR / "usage"
VECTORS_DIR = DATA_DIR / "vectors"
DOCS_DIR = DATA_DIR / "docs"
PLUGINS_STATE_DIR = DATA_DIR / "plugins_state"

# Fine-tune artifacts
FINE_TUNE_DIR = Path(__file__).parent / "fine_tune"
FINE_TUNE_DIR.mkdir(parents=True, exist_ok=True)

# Whitelist for shell commands (safe, no destructive/system-critical commands)
SAFE_SHELL_COMMANDS = {
    "ls",
    "cat",
    "pwd",
    "echo",
    "head",
    "tail",
    "wc",
    "git",
    "grep",
    "find",
    "tree",
    "date",
    "whoami",
    "uname",
    "df",
    "du",
    "ps",
    "which",
    "env",
    "history",
    "top",
    "curl",
    "wget",
    "docker",
    "git",
}
