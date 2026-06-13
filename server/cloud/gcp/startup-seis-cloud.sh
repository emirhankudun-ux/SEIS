#!/usr/bin/env bash
set -euo pipefail

metadata_attr_bootstrap() {
  curl -fsS \
    -H "Metadata-Flavor: Google" \
    "http://metadata.google.internal/computeMetadata/v1/instance/attributes/$1" \
    2>/dev/null || true
}

SEIS_ROOT="${SEIS_ROOT:-/opt/seis}"
CODEX_INSTALL_URL="${CODEX_INSTALL_URL:-https://chatgpt.com/codex/install.sh}"

valid_seis_user() {
  local user
  user="$1"

  if [[ ! "${user}" =~ ^[a-z_][a-z0-9_-]{0,31}$ ]]; then
    return 1
  fi

  case "${user}" in
    root|daemon|bin|sys|sync|games|man|lp|mail|news|uucp|proxy|www-data|backup|list|irc|gnats|nobody)
      return 1
      ;;
  esac

  return 0
}

export DEBIAN_FRONTEND=noninteractive

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

SEIS_USER="${SEIS_USER:-$(metadata_attr_bootstrap seis-user)}"
SEIS_USER="${SEIS_USER:-seis}"
if ! valid_seis_user "${SEIS_USER}"; then
  echo "Invalid SEIS user metadata '${SEIS_USER}', falling back to seis." >&2
  SEIS_USER="seis"
fi
SEIS_HOME="/home/${SEIS_USER}"

if ! id "${SEIS_USER}" >/dev/null 2>&1; then
  useradd --create-home --shell /bin/bash --groups sudo "${SEIS_USER}"
fi

install -d -m 0755 "${SEIS_ROOT}" "${SEIS_ROOT}/releases" "${SEIS_ROOT}/current"
chown -R "${SEIS_USER}:${SEIS_USER}" "${SEIS_ROOT}"

install -d -m 0700 "${SEIS_HOME}/.ssh"
touch "${SEIS_HOME}/.ssh/authorized_keys"
chmod 0600 "${SEIS_HOME}/.ssh/authorized_keys"
chown -R "${SEIS_USER}:${SEIS_USER}" "${SEIS_HOME}/.ssh"

sudo -H -u "${SEIS_USER}" env CODEX_NON_INTERACTIVE=1 bash -lc "curl -fsSL '${CODEX_INSTALL_URL}' | sh"

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

metadata_attr() {
  metadata_attr_bootstrap "$1"
}

setup_wireguard() {
  local vpn_mode wg_dir wg_port wg_server_address wg_subnet wg_peers private_key

  vpn_mode="$(metadata_attr seis-vpn)"
  if [ "${vpn_mode:-wireguard}" = "none" ]; then
    echo "SEIS_WIREGUARD_SKIPPED=1"
    return
  fi

  wg_dir="/etc/wireguard"
  wg_port="$(metadata_attr seis-wg-port)"
  wg_port="${wg_port:-51820}"
  wg_server_address="$(metadata_attr seis-wg-server-address)"
  wg_server_address="${wg_server_address:-10.44.0.1/24}"
  wg_subnet="$(metadata_attr seis-wg-subnet)"
  wg_subnet="${wg_subnet:-10.44.0.0/24}"
  wg_peers="$(metadata_attr seis-wg-peers)"

  install -d -m 0700 "${wg_dir}"
  if [ ! -f "${wg_dir}/server.key" ]; then
    umask 077
    wg genkey | tee "${wg_dir}/server.key" | wg pubkey > "${wg_dir}/server.pub"
  fi

  private_key="$(cat "${wg_dir}/server.key")"

  cat > "${wg_dir}/wg0.conf" <<WG
[Interface]
Address = ${wg_server_address}
ListenPort = ${wg_port}
PrivateKey = ${private_key}
SaveConfig = false
WG

  if [ -n "${wg_peers}" ]; then
    IFS=';' read -ra peer_entries <<< "${wg_peers}"
    for peer in "${peer_entries[@]}"; do
      add_wireguard_peer "${peer}" "${wg_dir}/wg0.conf"
    done
  fi

  install -d -m 0755 "${SEIS_ROOT}/vpn"
  cp "${wg_dir}/server.pub" "${SEIS_ROOT}/vpn/wireguard-server-public.key"
  cat > "${SEIS_ROOT}/vpn/wireguard-readme.txt" <<VPN
SEIS WireGuard team/workplace cloud VPN is ready.

Server address: ${wg_server_address}
VPN subnet: ${wg_subnet}
Port: ${wg_port}/udp
Server public key: $(cat "${wg_dir}/server.pub")

Add approved workplace/team peers through instance metadata key seis-wg-peers using:
name|publicKey|10.44.0.x/32;name2|publicKey2|10.44.0.y/32
VPN

  chown -R "${SEIS_USER}:${SEIS_USER}" "${SEIS_ROOT}/vpn"
  systemctl enable wg-quick@wg0
  systemctl restart wg-quick@wg0
  echo "SEIS_WIREGUARD_READY=1"
}

add_wireguard_peer() {
  local raw peer_name peer_key peer_ip config_file
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

  if ! valid_peer_address "${peer_ip}"; then
    echo "Skipping invalid WireGuard peer address for peer: ${peer_name}" >&2
    return
  fi

  cat >> "${config_file}" <<WG

# peer: ${peer_name}
[Peer]
PublicKey = ${peer_key}
AllowedIPs = ${peer_ip}
WG
}

valid_peer_address() {
  local address ip prefix first second third octet octet_value
  address="$1"
  ip="${address%/*}"
  prefix="${address##*/}"

  if [ "${prefix}" != "32" ]; then
    return 1
  fi

  IFS='.' read -r first second third octet <<< "${ip}"
  if [ "${first:-}" != "10" ] || [ "${second:-}" != "44" ] || [ "${third:-}" != "0" ]; then
    return 1
  fi

  case "${octet:-}" in
    ''|*[!0-9]*) return 1 ;;
  esac
  if [ "${#octet}" -gt 3 ]; then
    return 1
  fi

  octet_value=$((10#${octet}))
  [ "${octet_value}" -ge 2 ] && [ "${octet_value}" -le 254 ]
}

setup_wireguard

cat > /etc/motd <<'MOTD'
SEIS cloud server is ready.

Use SSH key authentication only. Approved workplace/team WireGuard peers can
reach the host through the VPN address, and Codex remote-control can be started
after authentication.
MOTD

echo "SEIS_REMOTE_HOST_READY=1"
