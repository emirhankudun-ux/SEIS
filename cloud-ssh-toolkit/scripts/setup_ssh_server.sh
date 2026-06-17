#!/bin/bash
# Cloud SSH Toolkit - Universal Kurulum Scripti
# Tüm Linux dağıtımları için SSH sunucu kurulum ve yapılandırma

set -e

# Renk kodları
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Log fonksiyonları
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Değişkenler
SSH_PORT=${SSH_PORT:-22}
ENABLE_FAIL2BAN=${ENABLE_FAIL2BAN:-true}
ENABLE_UFW=${ENABLE_UFW:-true}
DISABLE_ROOT_LOGIN=${DISABLE_ROOT_LOGIN:-true}
DISABLE_PASSWORD_AUTH=${DISABLE_PASSWORD_AUTH:-true}
ALLOWED_USERS=${ALLOWED_USERS:-""}
CUSTOM_SSH_PORT=${CUSTOM_SSH_PORT:-""}

# Sistem tespiti
detect_os() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        VER=$VERSION_ID
    elif type lsb_release >/dev/null 2>&1; then
        OS=$(lsb_release -si)
        VER=$(lsb_release -sr)
    else
        OS=$(uname -s)
        VER="unknown"
    fi
    
    log_info "İşletim Sistemi: $OS $VER"
}

# Paket yöneticisi tespiti
detect_package_manager() {
    if command -v apt-get >/dev/null 2>&1; then
        PKG_MANAGER="apt"
    elif command -v yum >/dev/null 2>&1; then
        PKG_MANAGER="yum"
    elif command -v dnf >/dev/null 2>&1; then
        PKG_MANAGER="dnf"
    elif command -v zypper >/dev/null 2>&1; then
        PKG_MANAGER="zypper"
    elif command -v pacman >/dev/null 2>&1; then
        PKG_MANAGER="pacman"
    else
        log_error "Desteklenmeyen paket yöneticisi"
        exit 1
    fi
    
    log_info "Paket Yöneticisi: $PKG_MANAGER"
}

# Paketleri güncelle
update_system() {
    log_info "Sistem güncelleniyor..."
    
    case $PKG_MANAGER in
        apt)
            apt-get update && apt-get upgrade -y
            ;;
        yum|dnf)
            $PKG_MANAGER update -y
            ;;
        zypper)
            zypper refresh && zypper update -y
            ;;
        pacman)
            pacman -Syu --noconfirm
            ;;
    esac
    
    log_success "Sistem güncellendi"
}

# Temel araçları yükle
install_basic_tools() {
    log_info "Temel araçlar yükleniyor..."
    
    case $PKG_MANAGER in
        apt)
            apt-get install -y curl wget git vim htop net-tools ufw fail2ban unzip tar
            ;;
        yum|dnf)
            $PKG_MANAGER install -y curl wget git vim htop net-tools fail2ban unzip tar
            systemctl enable firewalld
            systemctl start firewalld
            ;;
        zypper)
            zypper install -y curl wget git vim htop net-tools fail2ban unzip tar
            ;;
        pacman)
            pacman -S --noconfirm curl wget git vim htop net-tools fail2ban unzip tar
            ;;
    esac
    
    log_success "Temel araçlar yüklendi"
}

# SSH sunucusunu yükle ve yapılandır
setup_ssh() {
    log_info "SSH sunucusu kuruluyor..."
    
    case $PKG_MANAGER in
        apt)
            apt-get install -y openssh-server
            ;;
        yum|dnf)
            $PKG_MANAGER install -y openssh-server
            ;;
        zypper)
            zypper install -y openssh
            ;;
        pacman)
            pacman -S --noconfirm openssh
            ;;
    esac
    
    # SSH yapılandırması
    SSH_CONFIG="/etc/ssh/sshd_config"
    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
    
    # Yedek al
    cp $SSH_CONFIG ${SSH_CONFIG}.backup.$BACKUP_DATE
    log_info "SSH yapılandırması yedeklendi: ${SSH_CONFIG}.backup.$BACKUP_DATE"
    
    # Yeni yapılandırma oluştur
    cat > $SSH_CONFIG << EOF
# Cloud SSH Toolkit - Güvenli SSH Yapılandırması
# Oluşturulma Tarihi: $(date)

Port ${CUSTOM_SSH_PORT:-$SSH_PORT}
Protocol 2

# Kimlik Doğrulama
PermitRootLogin ${DISABLE_ROOT_LOGIN,,}
PasswordAuthentication ${DISABLE_PASSWORD_AUTH,,}
PubkeyAuthentication yes
ChallengeResponseAuthentication no
UsePAM yes

# Güvenlik Ayarları
MaxAuthTries 3
MaxSessions 10
LoginGraceTime 60
ClientAliveInterval 300
ClientAliveCountMax 2
StrictModes yes
IgnoreRhosts yes
HostbasedAuthentication no
PermitEmptyPasswords no
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
PermitTunnel no

# Logging
SyslogFacility AUTH
LogLevel VERBOSE

# Banner
Banner /etc/ssh/banner

# SFTP
Subsystem sftp /usr/lib/openssh/sftp-server

EOF

    # İzin verilen kullanıcılar
    if [ -n "$ALLOWED_USERS" ]; then
        echo "AllowUsers $ALLOWED_USERS" >> $SSH_CONFIG
    fi
    
    # Banner oluştur
    cat > /etc/ssh/banner << 'EOF'
╔════════════════════════════════════════════════════════╗
║           YETKİSİZ ERİŞİM YASAKTIR                     ║
║                                                        ║
║ Bu sistem sadece yetkili kullanıcılar içindir.         ║
║ Tüm aktiviteler kayıt altına alınmaktadır.             ║
╚════════════════════════════════════════════════════════╝
EOF
    
    # SSH anahtar dizinini oluştur
    mkdir -p /etc/ssh/authorized_keys
    chmod 700 /etc/ssh/authorized_keys
    
    # SSH servisini yeniden başlat
    systemctl restart sshd
    systemctl enable sshd
    
    log_success "SSH sunucusu kuruldu ve yapılandırıldı"
}

# Fail2Ban yapılandırması
setup_fail2ban() {
    if [ "$ENABLE_FAIL2BAN" != "true" ]; then
        log_info "Fail2Ban atlandı"
        return
    fi
    
    log_info "Fail2Ban yapılandırılıyor..."
    
    # Jail.local oluştur
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = auto

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600

[sshd-ddos]
enabled = true
port = ssh
filter = sshd-ddos
logpath = /var/log/auth.log
maxretry = 6
bantime = 7200
EOF
    
    # systemd servisini aktif et
    systemctl restart fail2ban
    systemctl enable fail2ban
    
    log_success "Fail2Ban yapılandırıldı"
}

# Firewall yapılandırması
setup_firewall() {
    if [ "$ENABLE_UFW" != "true" ]; then
        log_info "Firewall yapılandırması atlandı"
        return
    fi
    
    log_info "Firewall yapılandırılıyor..."
    
    case $OS in
        *"Ubuntu"*|*"Debian"*)
            ufw --force reset
            ufw default deny incoming
            ufw default allow outgoing
            ufw allow ${CUSTOM_SSH_PORT:-$SSH_PORT}/tcp comment 'SSH'
            ufw allow 80/tcp comment 'HTTP'
            ufw allow 443/tcp comment 'HTTPS'
            ufw --force enable
            ;;
        *"CentOS"*|*"Red Hat"*|*"Fedora"*)
            firewall-cmd --permanent --add-service=ssh
            firewall-cmd --permanent --add-service=http
            firewall-cmd --permanent --add-service=https
            firewall-cmd --reload
            ;;
        *)
            log_warning "Firewall yapılandırması bu işletim sistemi için otomatik değil"
            ;;
    esac
    
    log_success "Firewall yapılandırıldı"
}

# SSH anahtarı oluştur
generate_ssh_key() {
    log_info "SSH anahtarı oluşturuluyor..."
    
    SSH_KEY_DIR="$HOME/.ssh"
    mkdir -p $SSH_KEY_DIR
    chmod 700 $SSH_KEY_DIR
    
    # Mevcut anahtarı kontrol et
    if [ -f "$SSH_KEY_DIR/id_ed25519" ]; then
        log_warning "Mevcut SSH anahtarı bulundu, yeni anahtar oluşturulmadı"
        return
    fi
    
    # ED25519 anahtarı oluştur
    ssh-keygen -t ed25519 -f "$SSH_KEY_DIR/id_ed25519" -N "" -C "cloud-ssh-toolkit"
    
    # Yetkilendirilmiş anahtarları ayarla
    cat $SSH_KEY_DIR/id_ed25519.pub >> $SSH_KEY_DIR/authorized_keys
    chmod 600 $SSH_KEY_DIR/authorized_keys
    chmod 600 $SSH_KEY_DIR/id_ed25519
    chmod 644 $SSH_KEY_DIR/id_ed25519.pub
    
    log_success "SSH anahtarı oluşturuldu: $SSH_KEY_DIR/id_ed25519"
    log_info "Public key: $SSH_KEY_DIR/id_ed25519.pub"
}

# Sistem optimizasyonu
optimize_system() {
    log_info "Sistem optimize ediliyor..."
    
    # Sysctl ayarları
    cat > /etc/sysctl.d/99-cloud-ssh.conf << 'EOF'
# Network security
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1

# Kernel hardening
kernel.randomize_va_space = 2
kernel.exec-shield = 1
EOF
    
    # Sysctl ayarlarını uygula
    sysctl -p /etc/sysctl.d/99-cloud-ssh.conf
    
    log_success "Sistem optimize edildi"
}

# Sağlık kontrolü
health_check() {
    log_info "Sağlık kontrolü yapılıyor..."
    
    checks_passed=0
    total_checks=5
    
    # SSH servisi kontrolü
    if systemctl is-active --quiet sshd || systemctl is-active --quiet ssh; then
        log_success "✓ SSH servisi çalışıyor"
        ((checks_passed++))
    else
        log_error "✗ SSH servisi çalışmıyor"
    fi
    
    # Fail2Ban kontrolü
    if systemctl is-active --quiet fail2ban; then
        log_success "✓ Fail2Ban çalışıyor"
        ((checks_passed++))
    else
        log_warning "✗ Fail2Ban çalışmıyor"
    fi
    
    # Firewall kontrolü
    if command -v ufw >/dev/null 2>&1 && ufw status | grep -q "Status: active"; then
        log_success "✓ UFW aktif"
        ((checks_passed++))
    elif command -v firewall-cmd >/dev/null 2>&1 && firewall-cmd --state | grep -q "running"; then
        log_success "✓ Firewalld aktif"
        ((checks_passed++))
    else
        log_warning "✗ Firewall aktif değil"
    fi
    
    # SSH anahtarı kontrolü
    if [ -f "$HOME/.ssh/id_ed25519" ]; then
        log_success "✓ SSH anahtarı mevcut"
        ((checks_passed++))
    else
        log_warning "✗ SSH anahtarı bulunamadı"
    fi
    
    # Root login kontrolü
    if grep -q "PermitRootLogin no" /etc/ssh/sshd_config; then
        log_success "✓ Root girişi devre dışı"
        ((checks_passed++))
    else
        log_warning "✗ Root girişi hala aktif olabilir"
    fi
    
    log_info "Sağlık kontrolü tamamlandı: $checks_passed/$total_checks başarılı"
    
    if [ $checks_passed -eq $total_checks ]; then
        log_success "Tüm kontroller başarılı!"
    else
        log_warning "Bazı kontroller başarısız oldu, manuel kontrol önerilir"
    fi
}

# Yardım mesajı
show_help() {
    cat << EOF
Cloud SSH Toolkit - Kurulum Scripti

Kullanım: $0 [seçenekler]

Seçenekler:
  --no-fail2ban     Fail2Ban kurulumunu atla
  --no-firewall     Firewall kurulumunu atla
  --enable-root     Root girişine izin ver
  --enable-password Parola girişine izin ver
  --ssh-port PORT   Özel SSH portu belirle
  --allow-users LIST Kullanıcı listesi (boşlukla ayrılmış)
  --skip-update     Sistem güncellemesini atla
  --help            Bu yardım mesajını göster

Örnekler:
  $0 --ssh-port 2222 --allow-users "admin deploy"
  $0 --no-fail2ban --enable-root
  $0 --ssh-port 2222 --no-firewall

EOF
}

# Ana fonksiyon
main() {
    echo "╔════════════════════════════════════════════════════════╗"
    echo "║        Cloud SSH Toolkit - Kurulum Scripti             ║"
    echo "╚════════════════════════════════════════════════════════╝"
    echo
    
    # Parametreleri işle
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-fail2ban)
                ENABLE_FAIL2BAN=false
                shift
                ;;
            --no-firewall)
                ENABLE_UFW=false
                shift
                ;;
            --enable-root)
                DISABLE_ROOT_LOGIN=false
                shift
                ;;
            --enable-password)
                DISABLE_PASSWORD_AUTH=false
                shift
                ;;
            --ssh-port)
                CUSTOM_SSH_PORT="$2"
                shift 2
                ;;
            --allow-users)
                ALLOWED_USERS="$2"
                shift 2
                ;;
            --skip-update)
                SKIP_UPDATE=true
                shift
                ;;
            --help)
                show_help
                exit 0
                ;;
            *)
                log_error "Bilinmeyen seçenek: $1"
                show_help
                exit 1
                ;;
        esac
    done
    
    # Root kontrolü
    if [ "$EUID" -ne 0 ]; then 
        log_error "Bu script root olarak çalıştırılmalıdır"
        exit 1
    fi
    
    # Adımları çalıştır
    detect_os
    detect_package_manager
    
    if [ "$SKIP_UPDATE" != "true" ]; then
        update_system
    fi
    
    install_basic_tools
    setup_ssh
    generate_ssh_key
    
    if [ "$ENABLE_FAIL2BAN" = "true" ]; then
        setup_fail2ban
    fi
    
    if [ "$ENABLE_UFW" = "true" ]; then
        setup_firewall
    fi
    
    optimize_system
    health_check
    
    echo
    log_success "Kurulum başarıyla tamamlandı!"
    log_info "SSH Public Key: $HOME/.ssh/id_ed25519.pub"
    log_info "Bağlanmak için: ssh -i $HOME/.ssh/id_ed25519 user@your-server-ip"
}

# Script'i çalıştır
main "$@"
