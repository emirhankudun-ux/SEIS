#!/usr/bin/env bash
set -euo pipefail

SEIS_USER="${SEIS_USER:-seis}"
SEIS_HOME="/home/${SEIS_USER}"
SEIS_ROOT="${SEIS_ROOT:-/opt/seis}"
CODEX_INSTALL_URL="${CODEX_INSTALL_URL:-https://chatgpt.com/codex/install.sh}"
SEIS_WG_PORT="${SEIS_WG_PORT:-51820}"
SEIS_WG_SERVER_ADDRESS="${SEIS_WG_SERVER_ADDRESS:-10.44.0.1/24}"
SEIS_WG_SUBNET="${SEIS_WG_SUBNET:-10.44.0.0/24}"
SEIS_WG_PEERS="${SEIS_WG_PEERS:-}"
VALID_WG_PEER_COUNT=0

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root or through sudo." >&2
  exit 1
fi

valid_seis_user() {
  local value
  value="$1"
  [[ "${value}" =~ ^[a-z_][a-z0-9_-]{0,31}$ ]] || return 1
  case "${value}" in
    root|daemon|bin|sys|sync|games|man|lp|mail|news|uucp|proxy|www-data|backup|list|irc|gnats|nobody|systemd-*)
      return 1
      ;;
  esac
}

if ! valid_seis_user "${SEIS_USER}"; then
  echo "Invalid SEIS_USER. Use a non-root Linux username such as 'seis'." >&2
  exit 1
fi

SEIS_HOME="/home/${SEIS_USER}"

if [ -z "${SEIS_WG_PEERS}" ]; then
  echo "SEIS_WG_PEERS is required for a workplace/team VPN cloud host." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive

if ! command -v apt-get >/dev/null 2>&1; then
  echo "This installer currently supports Debian/Ubuntu hosts with apt-get." >&2
  exit 1
fi

apt-get update
apt-get install -y --no-install-recommends \
  ca-certificates \
  curl \
  git \
  iptables \
  iproute2 \
  openssh-server \
  rsync \
  sudo \
  unzip \
  wireguard

if ! id "${SEIS_USER}" >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash --groups sudo "${SEIS_USER}"
fi

install -d -m 0755 "${SEIS_ROOT}" "${SEIS_ROOT}/releases" "${SEIS_ROOT}/current"
chown -R "${SEIS_USER}:${SEIS_USER}" "${SEIS_ROOT}"

install -d -m 0700 "${SEIS_HOME}/.ssh"
touch "${SEIS_HOME}/.ssh/authorized_keys"
chmod 0600 "${SEIS_HOME}/.ssh/authorized_keys"
chown -R "${SEIS_USER}:${SEIS_USER}" "${SEIS_HOME}/.ssh"

sudo -H -u "${SEIS_USER}" bash -lc "CODEX_NON_INTERACTIVE=1 curl -fsSL '${CODEX_INSTALL_URL}' | sh"

cat > "${SEIS_HOME}/.profile" <<'PROFILE'
if [ -d "$HOME/.local/bin" ]; then
  case ":$PATH:" in
    *":$HOME/.local/bin:"*) ;;
    *) export PATH="$HOME/.local/bin:$PATH" ;;
  esac
fi
PROFILE

cat > /etc/ssh/sshd_config.d/90-seis-cloud.conf <<SSHD
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
PubkeyAuthentication yes
X11Forwarding no
AllowUsers ${SEIS_USER}
SSHD

systemctl enable ssh
systemctl restart ssh

add_wireguard_peer() {
  local raw peer_name peer_key peer_ip config_file peer_octet
  raw="${1//$'\r'/}"
  raw="${raw//$'\n'/}"
  config_file="$2"

  IFS='|' read -r peer_name peer_key peer_ip <<< "${raw}"

  if [[ ! "${peer_name}" =~ ^[A-Za-z0-9_.-]+$ ]]; then
    echo "Skipping invalid WireGuard peer name: ${peer_name}" >&2
    return
  fi

  if [[ ! "${peer_key}" =~ ^[A-Za-z0-9+/=]{40,60}$ ]]; then
    echo "Skipping invalid WireGuard public key for peer: ${peer_name}" >&2
    return
  fi

  if [[ ! "${peer_ip}" =~ ^10\.44\.0\.([0-9]{1,3})/32$ ]]; then
    echo "Skipping invalid WireGuard peer address for peer: ${peer_name}" >&2
    return
  fi
  peer_octet="${BASH_REMATCH[1]}"
  if [ "$((10#${peer_octet}))" -lt 2 ] || [ "$((10#${peer_octet}))" -gt 254 ]; then
    echo "Skipping out-of-range WireGuard peer address for peer: ${peer_name}" >&2
    return
  fi

  cat >> "${config_file}" <<WG

# peer: ${peer_name}
[Peer]
PublicKey = ${peer_key}
AllowedIPs = ${peer_ip}
WG
  VALID_WG_PEER_COUNT=$((VALID_WG_PEER_COUNT + 1))
}

setup_wireguard() {
  local wg_dir private_key
  wg_dir="/etc/wireguard"

  install -d -m 0700 "${wg_dir}"
  if [ ! -f "${wg_dir}/server.key" ]; then
    umask 077
    wg genkey | tee "${wg_dir}/server.key" | wg pubkey > "${wg_dir}/server.pub"
  fi

  private_key="$(cat "${wg_dir}/server.key")"

  cat > "${wg_dir}/wg0.conf" <<WG
[Interface]
Address = ${SEIS_WG_SERVER_ADDRESS}
ListenPort = ${SEIS_WG_PORT}
PrivateKey = ${private_key}
SaveConfig = false
WG

  IFS=';' read -ra peer_entries <<< "${SEIS_WG_PEERS}"
  for peer in "${peer_entries[@]}"; do
    add_wireguard_peer "${peer}" "${wg_dir}/wg0.conf"
  done
  if [ "${VALID_WG_PEER_COUNT}" -eq 0 ]; then
    echo "No valid WireGuard peers were configured; refusing to start wg0." >&2
    exit 1
  fi

  install -d -m 0755 "${SEIS_ROOT}/vpn"
  cp "${wg_dir}/server.pub" "${SEIS_ROOT}/vpn/wireguard-server-public.key"
  cat > "${SEIS_ROOT}/vpn/wireguard-readme.txt" <<VPN
SEIS WireGuard team/workplace cloud VPN is ready.

Server address: ${SEIS_WG_SERVER_ADDRESS}
VPN subnet: ${SEIS_WG_SUBNET}
Port: ${SEIS_WG_PORT}/udp
Server public key: $(cat "${wg_dir}/server.pub")
VPN

  chown -R "${SEIS_USER}:${SEIS_USER}" "${SEIS_ROOT}/vpn"
  systemctl enable wg-quick@wg0
  systemctl restart wg-quick@wg0
}

setup_wireguard

cat > /etc/motd <<'MOTD'
SEIS cloud server is ready.

Use SSH key authentication only. Approved workplace/team WireGuard peers can
reach the host through the VPN address, and Codex remote-control can be started
after authentication.
MOTD

echo "SEIS_REMOTE_HOST_READY=1"
