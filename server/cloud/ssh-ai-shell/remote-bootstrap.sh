#!/usr/bin/env bash
set -euo pipefail

TARGET_HOST="${SEIS_SSH_HOST:-}"
TARGET_USER="${SEIS_SSH_USER:-root}"
TARGET_PORT="${SEIS_SSH_PORT:-22}"
IDENTITY_FILE="${SEIS_SSH_IDENTITY_FILE:-$HOME/.ssh/id_ed25519_seis_codex}"
PUBLIC_KEY_PATH="${SEIS_CLOUD_PUBLIC_KEY_PATH:-$HOME/.ssh/id_ed25519_seis_codex.pub}"

# Optional direct-cloud target metadata (for SEIS-SSH alias mode)
DIRECT_CLOUD_HOST="${SEIS_CLOUD_DIRECT_HOST:-}"
DIRECT_CLOUD_PUBLIC_IP="${SEIS_CLOUD_PUBLIC_IP:-}"
DIRECT_CLOUD_PROVIDER="${SEIS_CLOUD_PROVIDER:-}"
DIRECT_CLOUD_PROJECT="${SEIS_CLOUD_PROJECT:-}"
LOCAL_PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
CLEANUP_REMOTE="true"
APPLY_SEIS_ALIAS="0"
HOST_CHECK_TIMEOUT="6"
POSITIONAL_ARGS=()
RESOLVED_DIRECT_TARGET_HOST=""

resolve_public_key_path() {
  local candidate="$1"
  if [[ -z "$candidate" ]]; then
    return 1
  fi

  if [[ "$candidate" == *.pub ]]; then
    [[ -f "$candidate" ]] || return 1
    printf '%s' "$candidate"
    return 0
  fi

  local paired="${candidate}.pub"
  if [[ -f "$paired" ]]; then
    echo "[INFO] Public key path provided as private key, using paired public key: ${paired}" >&2
    printf '%s' "$paired"
    return 0
  fi

  return 1
}

normalize_lookup_key() {
  local value="$1"
  echo "$(echo "$value" | tr '[:lower:]' '[:upper:]' | sed 's/[^A-Z0-9_]/_/g')"
}

resolve_direct_target_host() {
  local explicit="$1"
  local public_ip="$2"
  local provider="$3"
  local project="$4"

  if [[ -n "$explicit" ]]; then
    printf '%s' "$explicit"
    return 0
  fi

  if [[ -n "$public_ip" ]]; then
    printf '%s' "$public_ip"
    return 0
  fi

  if [[ -n "$provider" && -n "$project" ]]; then
    local env_key
    local normalized_provider
    local normalized_project
    normalized_provider="$(normalize_lookup_key "$provider")"
    normalized_project="$(normalize_lookup_key "$project")"
    env_key="SEIS_CLOUD_${normalized_provider}_${normalized_project}_HOST"
    if [[ -n "${!env_key-}" ]]; then
      printf '%s' "${!env_key}"
      return 0
    fi
  fi

  return 1
}

log_direct_target_plan() {
  if [[ -z "$RESOLVED_DIRECT_TARGET_HOST" ]]; then
    echo "[WARN] Direct-cloud hedefi belirlenemedi, SEIS-SSH direct-cloud switch bu adımda atlanıyor."
    return 0
  fi

  echo "[INFO] Direct-cloud hedef planı:"
  echo "       host: ${RESOLVED_DIRECT_TARGET_HOST}"
  if [[ -n "$DIRECT_CLOUD_PUBLIC_IP" ]]; then
    echo "       public-ip: ${DIRECT_CLOUD_PUBLIC_IP}"
  fi
  if [[ -n "$DIRECT_CLOUD_PROVIDER" || -n "$DIRECT_CLOUD_PROJECT" ]]; then
    echo "       provider/project: ${DIRECT_CLOUD_PROVIDER}/${DIRECT_CLOUD_PROJECT}"
  fi
}

probe_host_port() {
  local host="$1"
  local port="$2"
  local timeout="$3"

  if command -v nc >/dev/null 2>&1; then
    nc -z -w "$timeout" "$host" "$port" >/dev/null 2>&1
    return $?
  fi

  python3 - <<'PY' "$host" "$port" "$timeout" >/dev/null 2>&1
import socket
import sys

host = sys.argv[1]
port = int(sys.argv[2])
timeout = float(sys.argv[3])

sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.settimeout(timeout)
sock.connect((host, port))
sock.close()
PY
  return $?
}

usage() {
  cat <<'USAGE'
Usage:
  ./remote-bootstrap.sh <host> [user] [port] [identity-file] [public-key-path]
  ./remote-bootstrap.sh --host-check-timeout 8 <host> <user> <port>
  ./remote-bootstrap.sh <host> [user] [port] [identity-file] [public-key-path] --apply-seis-ssh-alias
  ./remote-bootstrap.sh --host <host> --user <user> --port <port> --identity-file <file> --public-key <file> --apply-seis-ssh-alias
  ./remote-bootstrap.sh <host> --direct-host <public-host> --direct-provider digitalocean --direct-project seis-prod --direct-user root --apply-seis-ssh-alias
  ./remote-bootstrap.sh <host> --direct-public-ip 203.0.113.10 --apply-seis-ssh-alias

Examples:
  ./remote-bootstrap.sh 21.0.3.171 root 22
  ./remote-bootstrap.sh 21.0.3.171 root 22 ~/.ssh/id_ed25519_seis_codex ~/.ssh/id_ed25519_seis_codex.pub
  ./remote-bootstrap.sh 21.0.3.171 root 22 --apply-seis-ssh-alias
USAGE
}

if [[ $# -gt 0 ]]; then
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --host)
        TARGET_HOST="$2"
        shift 2
        ;;
      --user)
        TARGET_USER="$2"
        shift 2
        ;;
      --port)
        TARGET_PORT="$2"
        shift 2
        ;;
      --direct-host)
        DIRECT_CLOUD_HOST="$2"
        shift 2
        ;;
      --direct-public-ip)
        DIRECT_CLOUD_PUBLIC_IP="$2"
        shift 2
        ;;
      --public-ip)
        DIRECT_CLOUD_PUBLIC_IP="$2"
        shift 2
        ;;
      --provider|--direct-provider)
        DIRECT_CLOUD_PROVIDER="$2"
        shift 2
        ;;
      --project|--direct-project)
        DIRECT_CLOUD_PROJECT="$2"
        shift 2
        ;;
      --identity-file)
        IDENTITY_FILE="$2"
        shift 2
        ;;
      --host-check-timeout)
        HOST_CHECK_TIMEOUT="$2"
        shift 2
        ;;
      --public-key)
        PUBLIC_KEY_PATH="$2"
        shift 2
        ;;
      --apply-seis-ssh-alias)
        APPLY_SEIS_ALIAS="1"
        shift
        ;;
      --no-cleanup)
        CLEANUP_REMOTE="false"
        shift
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      --*)
        echo "[ERROR] Unknown option: $1"
        usage
        exit 1
        ;;
      *)
        POSITIONAL_ARGS+=("$1")
        shift
        ;;
    esac
  done
fi

if [[ ${#POSITIONAL_ARGS[@]} -ge 1 && -z "$TARGET_HOST" ]]; then
  TARGET_HOST="${POSITIONAL_ARGS[0]}"
fi
if [[ ${#POSITIONAL_ARGS[@]} -ge 2 ]]; then
  TARGET_USER="${POSITIONAL_ARGS[1]}"
fi
if [[ ${#POSITIONAL_ARGS[@]} -ge 3 && "${POSITIONAL_ARGS[2]}" =~ ^[0-9]+$ ]]; then
  TARGET_PORT="${POSITIONAL_ARGS[2]}"
fi
if [[ ${#POSITIONAL_ARGS[@]} -ge 4 ]]; then
  IDENTITY_FILE="${POSITIONAL_ARGS[3]}"
fi
if [[ ${#POSITIONAL_ARGS[@]} -ge 5 ]]; then
  PUBLIC_KEY_PATH="${POSITIONAL_ARGS[4]}"
fi
if [[ ${#POSITIONAL_ARGS[@]} -gt 5 ]]; then
  echo "[ERROR] Too many positional arguments."
  usage
  exit 1
fi

if [[ -z "$TARGET_HOST" ]]; then
  echo "[ERROR] TARGET_HOST not set."
  usage
  exit 1
fi

if [[ ! -f "$IDENTITY_FILE" ]]; then
  echo "[ERROR] Identity file not found: $IDENTITY_FILE"
  exit 1
fi
if ! [[ "$TARGET_PORT" =~ ^[0-9]+$ ]] || (( TARGET_PORT < 1 || TARGET_PORT > 65535 )); then
  echo "[ERROR] Invalid port: $TARGET_PORT"
  exit 1
fi

if ! [[ "$HOST_CHECK_TIMEOUT" =~ ^[0-9]+$ ]] || (( HOST_CHECK_TIMEOUT < 1 || HOST_CHECK_TIMEOUT > 120 )); then
  echo "[ERROR] Invalid --host-check-timeout: $HOST_CHECK_TIMEOUT"
  exit 1
fi

if ! probe_host_port "$TARGET_HOST" "$TARGET_PORT" "$HOST_CHECK_TIMEOUT"; then
  echo "[ERROR] Target SSH endpoint unreachable: ${TARGET_HOST}:${TARGET_PORT}"
  echo "       Check firewall/security group, public IP binding, and sshd listening state."
  exit 1
fi

RESOLVED_DIRECT_TARGET_HOST="$(resolve_direct_target_host "$DIRECT_CLOUD_HOST" "$DIRECT_CLOUD_PUBLIC_IP" "$DIRECT_CLOUD_PROVIDER" "$DIRECT_CLOUD_PROJECT" || true)"
RESOLVED_PUBLIC_KEY="$(resolve_public_key_path "$PUBLIC_KEY_PATH" || true)"
if [[ -z "$RESOLVED_PUBLIC_KEY" ]]; then
  echo "[WARN] Public key not found: $PUBLIC_KEY_PATH"
  echo "      Continuing with SSH key import skipped on first boot."
  echo "      Set SEIS_CLOUD_PUBLIC_KEY_PATH later and run install.sh again if needed."
else
  PUBLIC_KEY_PATH="$RESOLVED_PUBLIC_KEY"
fi

TMP_REMOTE_DIR="/tmp/ssh-ai-shell"
REMOTE_PUBLIC_KEY=""

cat <<MSG
[INFO] Bootstrap plan:
  target: ${TARGET_USER}@${TARGET_HOST}:${TARGET_PORT}
  direct-cloud target: ${RESOLVED_DIRECT_TARGET_HOST:-<not-set>}
  identity: ${IDENTITY_FILE}
  source: ${LOCAL_PROJECT_DIR}
  remote staging: ${TMP_REMOTE_DIR}
MSG
log_direct_target_plan

scp -i "$IDENTITY_FILE" -o StrictHostKeyChecking=accept-new -P "$TARGET_PORT" -r "$LOCAL_PROJECT_DIR" "${TARGET_USER}@${TARGET_HOST}:${TMP_REMOTE_DIR}"
if [[ -f "$PUBLIC_KEY_PATH" ]]; then
  REMOTE_PUBLIC_KEY="/tmp/ssh-ai-cloud.pub"
  scp -i "$IDENTITY_FILE" -o StrictHostKeyChecking=accept-new -P "$TARGET_PORT" "$PUBLIC_KEY_PATH" "${TARGET_USER}@${TARGET_HOST}:${REMOTE_PUBLIC_KEY}"
  echo "[INFO] Public key staged on remote: ${REMOTE_PUBLIC_KEY}"
fi

ssh -i "$IDENTITY_FILE" -o StrictHostKeyChecking=accept-new -p "$TARGET_PORT" "${TARGET_USER}@${TARGET_HOST}" <<EOFSSH
set -euo pipefail
cd "${TMP_REMOTE_DIR}"
if [[ -f "$REMOTE_PUBLIC_KEY" ]]; then
  export SEIS_CLOUD_PUBLIC_KEY_PATH="$REMOTE_PUBLIC_KEY"
fi
sudo ./install.sh
sudo systemctl status sshd || true
if [[ "$CLEANUP_REMOTE" == "true" ]]; then
  rm -rf "${TMP_REMOTE_DIR}" "${REMOTE_PUBLIC_KEY}"
fi
EOFSSH

cat <<MSG
[OK] Remote bootstrap completed.
  host: ${TARGET_HOST}
  user: ${TARGET_USER}
  port: ${TARGET_PORT}
MSG

if [[ "$APPLY_SEIS_ALIAS" == "1" ]]; then
  REPO_ROOT="$(cd "${LOCAL_PROJECT_DIR}/../../.." && pwd)"
  if [[ -f "$REPO_ROOT/package.json" ]] && command -v npm >/dev/null 2>&1; then
    SWITCH_ARGS=()
    if [[ -n "$RESOLVED_DIRECT_TARGET_HOST" ]]; then
      SWITCH_ARGS+=(--direct-host "$RESOLVED_DIRECT_TARGET_HOST")
    elif [[ -n "$DIRECT_CLOUD_PUBLIC_IP" ]]; then
      SWITCH_ARGS+=(--public-ip "$DIRECT_CLOUD_PUBLIC_IP")
    else
      if [[ -n "$DIRECT_CLOUD_PROVIDER" ]]; then
        SWITCH_ARGS+=(--provider "$DIRECT_CLOUD_PROVIDER")
      fi
      if [[ -n "$DIRECT_CLOUD_PROJECT" ]]; then
        SWITCH_ARGS+=(--project "$DIRECT_CLOUD_PROJECT")
      fi
    fi
    if [[ -n "$TARGET_USER" ]]; then
      SWITCH_ARGS+=(--direct-user "$TARGET_USER")
    fi
    if [[ -n "$TARGET_PORT" ]]; then
      SWITCH_ARGS+=(--direct-port "$TARGET_PORT")
    fi
    npm run cloud:ssh:direct-cloud:switch -- "${SWITCH_ARGS[@]}" --apply
    npm run check:seis-ssh-picker-compatibility -- --require-picker-compatible
  else
    echo "[WARN] npm not available or repo root/package.json missing. Run switch command manually after this step."
  fi
else
  echo "[INFO] Optional next step: set mobile/desktop alias to direct-cloud transport once SSH is reachable."
  if [[ "$TARGET_PORT" == "22" ]]; then
    if [[ -n "$RESOLVED_DIRECT_TARGET_HOST" ]]; then
      echo "npm run cloud:ssh:direct-cloud:switch -- --direct-host ${RESOLVED_DIRECT_TARGET_HOST} --direct-user ${TARGET_USER} --apply"
    elif [[ -n "$DIRECT_CLOUD_PUBLIC_IP" ]]; then
      echo "npm run cloud:ssh:direct-cloud:switch -- --public-ip ${DIRECT_CLOUD_PUBLIC_IP} --direct-user ${TARGET_USER} --apply"
    elif [[ -n "$DIRECT_CLOUD_PROVIDER" || -n "$DIRECT_CLOUD_PROJECT" ]]; then
      echo -n "npm run cloud:ssh:direct-cloud:switch --"
      if [[ -n "$DIRECT_CLOUD_PROVIDER" ]]; then echo -n " --provider ${DIRECT_CLOUD_PROVIDER}"; fi
      if [[ -n "$DIRECT_CLOUD_PROJECT" ]]; then echo -n " --project ${DIRECT_CLOUD_PROJECT}"; fi
      echo " --direct-user ${TARGET_USER} --apply"
    else
      echo "npm run cloud:ssh:direct-cloud:switch -- --direct-host ${TARGET_HOST} --direct-user ${TARGET_USER} --apply"
    fi
  else
    if [[ -n "$RESOLVED_DIRECT_TARGET_HOST" ]]; then
      echo "npm run cloud:ssh:direct-cloud:switch -- --direct-host ${RESOLVED_DIRECT_TARGET_HOST} --direct-user ${TARGET_USER} --direct-port ${TARGET_PORT} --apply"
    elif [[ -n "$DIRECT_CLOUD_PUBLIC_IP" ]]; then
      echo "npm run cloud:ssh:direct-cloud:switch -- --public-ip ${DIRECT_CLOUD_PUBLIC_IP} --direct-user ${TARGET_USER} --direct-port ${TARGET_PORT} --apply"
    elif [[ -n "$DIRECT_CLOUD_PROVIDER" || -n "$DIRECT_CLOUD_PROJECT" ]]; then
      echo -n "npm run cloud:ssh:direct-cloud:switch --"
      if [[ -n "$DIRECT_CLOUD_PROVIDER" ]]; then echo -n " --provider ${DIRECT_CLOUD_PROVIDER}"; fi
      if [[ -n "$DIRECT_CLOUD_PROJECT" ]]; then echo -n " --project ${DIRECT_CLOUD_PROJECT}"; fi
      echo " --direct-user ${TARGET_USER} --direct-port ${TARGET_PORT} --apply"
    else
      echo "npm run cloud:ssh:direct-cloud:switch -- --direct-host ${TARGET_HOST} --direct-user ${TARGET_USER} --direct-port ${TARGET_PORT} --apply"
    fi
  fi
  echo "npm run check:seis-ssh-picker-compatibility -- --require-picker-compatible"
fi
