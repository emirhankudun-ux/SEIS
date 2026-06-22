#!/usr/bin/env bash
set -euo pipefail

SEIS_REMOTE_USER="${SEIS_REMOTE_USER:-aiuser}"
SEIS_REPO_URL="${SEIS_REPO_URL:-git@github.com:emirhankudun-ux/SEIS.git}"
SEIS_REPO_DIR="${SEIS_REPO_DIR:-/opt/seis/SEIS}"
SEIS_ENV_DIR="${SEIS_ENV_DIR:-/etc/seis}"
SEIS_ENV_FILE="${SEIS_ENV_FILE:-$SEIS_ENV_DIR/ssh-ai.env}"
SEIS_SSH_PORT="${SEIS_SSH_PORT:-22}"
SEIS_PASSWORD_AUTH="${SEIS_PASSWORD_AUTH:-no}"
SEIS_PERMIT_ROOT_LOGIN="${SEIS_PERMIT_ROOT_LOGIN:-prohibit-password}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root on the direct-cloud VM." >&2
  exit 1
fi

install_packages() {
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update
    DEBIAN_FRONTEND=noninteractive apt-get install -y \
      ca-certificates curl git openssh-server python3 python3-venv nodejs npm
  elif command -v dnf >/dev/null 2>&1; then
    dnf install -y ca-certificates curl git openssh-server python3 nodejs npm
  elif command -v apk >/dev/null 2>&1; then
    apk add --no-cache ca-certificates curl git openssh python3 nodejs npm
  else
    echo "Unsupported package manager. Install git, openssh-server, python3, nodejs, and npm manually." >&2
  fi
}

create_user() {
  if ! id "${SEIS_REMOTE_USER}" >/dev/null 2>&1; then
    useradd -m -s /bin/bash "${SEIS_REMOTE_USER}"
  fi

  install -d -m 700 -o "${SEIS_REMOTE_USER}" -g "${SEIS_REMOTE_USER}" "/home/${SEIS_REMOTE_USER}/.ssh"

  if [[ -n "${SEIS_AUTHORIZED_KEY:-}" ]]; then
    touch "/home/${SEIS_REMOTE_USER}/.ssh/authorized_keys"
    grep -qxF "${SEIS_AUTHORIZED_KEY}" "/home/${SEIS_REMOTE_USER}/.ssh/authorized_keys" \
      || echo "${SEIS_AUTHORIZED_KEY}" >> "/home/${SEIS_REMOTE_USER}/.ssh/authorized_keys"
    chown "${SEIS_REMOTE_USER}:${SEIS_REMOTE_USER}" "/home/${SEIS_REMOTE_USER}/.ssh/authorized_keys"
    chmod 600 "/home/${SEIS_REMOTE_USER}/.ssh/authorized_keys"
  else
    echo "SEIS_AUTHORIZED_KEY is empty; add an SSH public key before disabling password access." >&2
  fi
}

configure_sshd() {
  install -d -m 755 /etc/ssh/sshd_config.d
  cat > /etc/ssh/sshd_config.d/99-seis-mobile-direct-cloud.conf <<EOF
Port ${SEIS_SSH_PORT}
PubkeyAuthentication yes
PasswordAuthentication ${SEIS_PASSWORD_AUTH}
PermitRootLogin ${SEIS_PERMIT_ROOT_LOGIN}
ClientAliveInterval 60
ClientAliveCountMax 3
X11Forwarding no
AllowTcpForwarding no
EOF

  sshd -t
  systemctl enable --now ssh || systemctl enable --now sshd
  systemctl restart ssh || systemctl restart sshd
}

prepare_repo() {
  install -d -m 755 "$(dirname "${SEIS_REPO_DIR}")"

  if [[ -d "${SEIS_REPO_DIR}/.git" ]]; then
    git -C "${SEIS_REPO_DIR}" fetch origin main
    git -C "${SEIS_REPO_DIR}" checkout main
    git -C "${SEIS_REPO_DIR}" pull --ff-only origin main
  else
    git clone "${SEIS_REPO_URL}" "${SEIS_REPO_DIR}"
  fi

  chown -R "${SEIS_REMOTE_USER}:${SEIS_REMOTE_USER}" "${SEIS_REPO_DIR}"
}

prepare_env() {
  install -d -m 700 "${SEIS_ENV_DIR}"
  if [[ ! -f "${SEIS_ENV_FILE}" ]]; then
    cat > "${SEIS_ENV_FILE}" <<'EOF'
# SEIS SSH mobile runtime environment.
# Keep real secrets on the VM only. Never commit this file.
AI_PROVIDER=ollama
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
OLLAMA_HOST=http://127.0.0.1:11434
SEIS_REMOTE_MODE=direct-cloud
EOF
  fi
  chmod 600 "${SEIS_ENV_FILE}"
}

install_profile_helpers() {
  cat > /etc/profile.d/seis-mobile-direct-cloud.sh <<EOF
export SEIS_REPO_DIR="${SEIS_REPO_DIR}"
alias seis='cd "${SEIS_REPO_DIR}"'
alias seis-status='cd "${SEIS_REPO_DIR}" && git status --short'
alias seis-mobile-profile='cd "${SEIS_REPO_DIR}" && npm run cloud:ssh:mobile-direct:profile'
EOF
  chmod 644 /etc/profile.d/seis-mobile-direct-cloud.sh
}

install_readiness_service() {
  cat > /etc/systemd/system/seis-ssh-mobile-ready.service <<EOF
[Unit]
Description=SEIS SSH mobile direct-cloud readiness marker
After=network-online.target ssh.service sshd.service
Wants=network-online.target

[Service]
Type=oneshot
User=${SEIS_REMOTE_USER}
WorkingDirectory=${SEIS_REPO_DIR}
EnvironmentFile=-${SEIS_ENV_FILE}
ExecStart=/bin/sh -lc 'mkdir -p "$HOME/.seis" && date -Iseconds > "$HOME/.seis/mobile-direct-cloud-ready" && git status --short >/dev/null'
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF

  systemctl daemon-reload
  systemctl enable --now seis-ssh-mobile-ready.service
}

install_packages
create_user
prepare_env
prepare_repo
configure_sshd
install_profile_helpers
install_readiness_service

cat <<EOF
SEIS SSH mobile direct-cloud bootstrap complete.

Next local steps:
  export SEIS_SSH_HOST=<public-ip-or-dns>
  export SEIS_SSH_USER=${SEIS_REMOTE_USER}
  npm run cloud:ssh:mobile-direct:profile
  ssh SEIS-SSH

Secrets stay on the VM in ${SEIS_ENV_FILE}; do not commit private keys or API keys.
EOF
