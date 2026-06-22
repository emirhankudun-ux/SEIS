#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
TARGET_DIR="/opt/ssh-ai"
TARGET_BIN="/usr/local/bin/ai_shell"
ENV_DIR="/etc/ssh-ai"
ENV_FILE="$ENV_DIR/ssh-ai.env"
SSH_KEYS_DIR="/etc/ssh-ai"
SSH_KEYS_FILE="$SSH_KEYS_DIR/authorized_keys"
SSH_CONFIG_FILE="/etc/ssh/sshd_config.d/60-seis-ssh-ai.conf"
AI_USER="aiuser"
DAEMON_UNIT="/etc/systemd/system/ssh-ai.service"
BRIDGE_UNIT="/etc/systemd/system/ssh-ai-bridge.service"
LOG_DIR="/var/log/ssh-ai"
DATA_DIR="/var/lib/ssh-ai"
CALLER_HOME="$(getent passwd "${SUDO_USER:-$USER}" | cut -d: -f6 2>/dev/null || echo "$HOME")"

# Public key selection:
# - prefer explicit SEIS_CLOUD_PUBLIC_KEY_PATH
# - fallback to common repo-deployed key names in caller home
SEIS_PUBLIC_KEY_CANDIDATES=(
  "${SEIS_CLOUD_PUBLIC_KEY_PATH-}"
  "$CALLER_HOME/.ssh/id_ed25519_seis_codex.pub"
  "$CALLER_HOME/.ssh/id_ed25519_seis_codex"
  "$CALLER_HOME/.ssh/id_ed25519_github.pub"
  "$CALLER_HOME/.ssh/id_ed25519_github"
  "$CALLER_HOME/.ssh/id_ed25519.pub"
  "$CALLER_HOME/.ssh/id_ed25519"
)

if (( EUID != 0 )); then
  echo "[ERROR] Run this installer as root."
  exit 1
fi

fail() {
  echo "[ERROR] $1"
  exit 1
}

backup_file() {
  local target="$1"
  if [[ -f "$target" ]]; then
    local backup="${target}.bak.$(date +%s)"
    cp "$target" "$backup"
    echo "[INFO] Backup: $backup"
  fi
}

ensure_dir() {
  mkdir -p "$1"
}

ensure_command() {
  local bin="$1"
  if ! command -v "$bin" >/dev/null 2>&1; then
    fail "Required command not found: $bin"
  fi
}

generate_token() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 32
    return
  fi
  if command -v python3 >/dev/null 2>&1; then
    python3 - <<'PY'
import hashlib
import os
import time
print(hashlib.sha256(f"{time.time()}:{os.getpid()}:{os.urandom(16)}".encode()).hexdigest())
PY
    return
  fi
  echo "$(date +%s | sha256sum | head -c 64)"
}

ensure_key_authorization() {
  local source_key="$1"
  if [[ -f "$source_key" ]]; then
    if ! grep -Fqf "$source_key" "$SSH_KEYS_FILE" 2>/dev/null; then
      cat "$source_key" >> "$SSH_KEYS_FILE"
      echo "[INFO] Added SSH key: $source_key"
    else
      echo "[INFO] SSH key already present: $source_key"
    fi
  else
    echo "[WARN] Public key file not found: $source_key"
  fi
}

resolve_public_key_path() {
  for key in "${SEIS_PUBLIC_KEY_CANDIDATES[@]}"; do
    if [[ "$key" == *.pub ]] && [[ -n "$key" && -f "$key" ]]; then
      echo "$key"
      return 0
    fi

    if [[ -n "$key" && -f "${key}.pub" ]]; then
      echo "${key}.pub"
      return 0
    fi

  done
  return 1
}

set_env_value() {
  local file="$1"
  local key="$2"
  local value="$3"
  if grep -q "^${key}=" "$file" 2>/dev/null; then
    python3 - "$file" "$key" "$value" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
key = sys.argv[2]
value = sys.argv[3]

lines = [line.rstrip("\n") for line in path.read_text(encoding="utf-8").splitlines()]
updated = []
replaced = False
for line in lines:
    if line.startswith(f"{key}="):
        updated.append(f"{key}={value}")
        replaced = True
    else:
        updated.append(line)

if not replaced:
    updated.append(f"{key}={value}")

path.write_text("\n".join(updated) + "\n", encoding="utf-8")
PY
  else
    echo "${key}=${value}" >> "$file"
  fi
}

install_systemd_unit() {
  local source="$1"
  local destination="$2"

  if [[ -f "$source" ]]; then
    install -m 0644 "$source" "$destination"
    return
  fi

  fail "Missing systemd template: $source"
}

read_env_bool() {
  local key="$1"
  local default="$2"
  local value=""
  value=$(awk -F= -v k="$key" '$1==k {print $2; exit}' "$ENV_FILE" 2>/dev/null || true)
  echo "${value:-$default}"
}

ensure_command python3
ensure_command systemctl
ensure_command sshd

ensure_dir "$TARGET_DIR"
ensure_dir "$ENV_DIR"
ensure_dir "$SSH_KEYS_DIR"
ensure_dir "$LOG_DIR"
ensure_dir "$DATA_DIR"
ensure_dir "/etc/ssh/sshd_config.d"

touch "$SSH_KEYS_FILE"
chmod 600 "$SSH_KEYS_FILE"
chmod 700 "$SSH_KEYS_DIR"

if [[ ! -f "$ENV_FILE" ]]; then
  cat > "$ENV_FILE" <<'EOF'
AI_PROVIDER=openai
OPENAI_MODEL=gpt-4o-mini
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
LOCAL_MODEL_URL=http://localhost:11434/v1
LOCAL_MODEL_NAME=llama3.1
RATE_LIMIT_PER_MIN=20
RATE_LIMIT_PER_HOUR=200
SSH_AI_LANG=auto
SSH_AI_DATA=/var/lib/ssh-ai
DAEMON_ENABLED=1
DAEMON_HOST=127.0.0.1
DAEMON_PORT=7777
WS_BRIDGE_ENABLED=1
WS_BRIDGE_PORT=7778
SANDBOX_TIMEOUT=20
SANDBOX_MAX_OUTPUT=50000
DAEMON_TOKEN=
EOF
  echo "[INFO] Created env file: $ENV_FILE"
fi

SEIS_CLOUD_PUBLIC_KEY_PATH="${SEIS_CLOUD_PUBLIC_KEY_PATH:-}"
if [[ -z "$SEIS_CLOUD_PUBLIC_KEY_PATH" ]]; then
  if resolved_key="$(resolve_public_key_path)"; then
    SEIS_CLOUD_PUBLIC_KEY_PATH="$resolved_key"
    echo "[INFO] Auto-selected public key: $SEIS_CLOUD_PUBLIC_KEY_PATH"
  fi
fi

if [[ -n "$SEIS_CLOUD_PUBLIC_KEY_PATH" ]]; then
  set_env_value "$ENV_FILE" SEIS_CLOUD_PUBLIC_KEY_PATH "$SEIS_CLOUD_PUBLIC_KEY_PATH"
else
  echo "[WARN] No SSH public key found for auto-import. Set SEIS_CLOUD_PUBLIC_KEY_PATH and rerun if needed."
fi

chown root:root "$ENV_FILE"
chmod 600 "$ENV_FILE"

if ! grep -q '^DAEMON_TOKEN=' "$ENV_FILE"; then
  echo "DAEMON_TOKEN=$(generate_token)" >> "$ENV_FILE"
elif grep -q '^DAEMON_TOKEN=$' "$ENV_FILE"; then
  python3 - "$ENV_FILE" "$(generate_token)" <<'PY'
from pathlib import Path
import sys

path = Path(sys.argv[1])
token = sys.argv[2].strip()
lines = path.read_text().splitlines()
updated = []
replaced = False
for line in lines:
  if line.startswith("DAEMON_TOKEN="):
    updated.append(f"DAEMON_TOKEN={token}")
    replaced = True
  else:
    updated.append(line)
if not replaced:
  updated.append(f"DAEMON_TOKEN={token}")
path.write_text("\n".join(updated) + "\n", encoding="utf-8")
PY
fi
chmod 600 "$ENV_FILE"

backup_file "$SSH_KEYS_FILE"
if [[ -n "$SEIS_CLOUD_PUBLIC_KEY_PATH" ]]; then
  ensure_key_authorization "$SEIS_CLOUD_PUBLIC_KEY_PATH"
else
  echo "[INFO] No public key imported automatically."
  echo "      Set SEIS_CLOUD_PUBLIC_KEY_PATH and rerun install for automatic key provisioning."
fi

cat > "$TARGET_BIN" <<'TARGET_BIN_EOF'
#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="/etc/ssh-ai/ssh-ai.env"
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck disable=SC1090
  source "$ENV_FILE"
fi

exec /opt/ssh-ai/venv/bin/python3 /opt/ssh-ai/ai_shell.py "$@"
TARGET_BIN_EOF
chmod +x "$TARGET_BIN"

if ! id -u "$AI_USER" >/dev/null 2>&1; then
  useradd -m -s /usr/sbin/nologin "$AI_USER"
  echo "[INFO] Created user: $AI_USER"
else
  usermod -s /usr/sbin/nologin "$AI_USER" || true
fi
chown "$AI_USER:$AI_USER" "$SSH_KEYS_FILE"

cp -r "$PROJECT_ROOT"/* "$TARGET_DIR"/
python3 -m venv "$TARGET_DIR/venv" >/dev/null
"$TARGET_DIR/venv/bin/pip" install -r "$TARGET_DIR/requirements.txt" >/dev/null

chown -R "$AI_USER:$AI_USER" "$TARGET_DIR"
chown -R "$AI_USER:$AI_USER" "$LOG_DIR"
chown -R "$AI_USER:$AI_USER" "$DATA_DIR"

cat > "$SSH_CONFIG_FILE" <<EOF
Match User $AI_USER
    ForceCommand $TARGET_BIN
    PasswordAuthentication no
    KbdInteractiveAuthentication no
    PubkeyAuthentication yes
    AuthenticationMethods publickey
    AllowTcpForwarding no
    X11Forwarding no
    PermitTTY yes
    AllowAgentForwarding no
    GatewayPorts no
    PermitOpen none
    PermitTunnel no
    AuthorizedKeysFile /etc/ssh-ai/authorized_keys
EOF

backup_file "$DAEMON_UNIT"
install_systemd_unit "$PROJECT_ROOT/systemd/ssh-ai.service" "$DAEMON_UNIT"

if [[ -f "$PROJECT_ROOT/systemd/ssh-ai-bridge.service" ]]; then
  backup_file "$BRIDGE_UNIT"
  install_systemd_unit "$PROJECT_ROOT/systemd/ssh-ai-bridge.service" "$BRIDGE_UNIT"
fi

systemctl daemon-reload
systemctl enable --now ssh-ai

BRIDGE_ENABLED="$(read_env_bool "WS_BRIDGE_ENABLED" "1")"
if [[ "$BRIDGE_ENABLED" == "1" ]]; then
  systemctl enable --now ssh-ai-bridge
else
  systemctl disable --now ssh-ai-bridge || true
fi

systemctl restart sshd || true

echo "[INFO] Install complete."
echo "  - SSH user: $AI_USER"
echo "  - Env file: $ENV_FILE"
echo "  - SSH keys: $SSH_KEYS_FILE"
echo "  - SSH match: $SSH_CONFIG_FILE"
echo "  - Daemon: systemctl status ssh-ai"
echo "  - Bridge: systemctl status ssh-ai-bridge"
