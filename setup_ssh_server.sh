#!/bin/bash
# SSH Server Setup Script for Cloud VMs
# Compatible with Amazon Linux, Ubuntu, CentOS

set -e

echo "🚀 SSH Sunucusu Kurulum Başlatılıyor..."
echo "========================================"

# Sistem güncellemesi
echo "📦 Sistem güncelleniyor..."
if command -v yum &> /dev/null; then
    sudo yum update -y
elif command -v apt &> /dev/null; then
    sudo apt update && sudo apt upgrade -y
fi

# Temel araçların kurulumu
echo "🛠️ Temel araçlar yükleniyor..."
if command -v yum &> /dev/null; then
    sudo yum install -y git curl wget htop net-tools vim unzip
elif command -v apt &> /dev/null; then
    sudo apt install -y git curl wget htop net-tools vim unzip
fi

# SSH yapılandırması
echo "🔐 SSH yapılandırması sağlanıyor..."
sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

# Root girişini kapat
sudo sed -i 's/^#PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/^PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config

# Parola doğrulamayı kapat (sadece anahtar)
sudo sed -i 's/^#PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo sed -i 's/^PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config

# PubKey authentication açık emin ol
sudo sed -i 's/^#PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sudo sed -i 's/^PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config

# SSH servisini yeniden başlat
sudo systemctl restart sshd || sudo systemctl restart ssh

echo "✓ SSH yapılandırması tamamlandı"

# Fail2Ban kurulumu (Brute force koruması)
echo "🛡️ Fail2Ban yükleniyor..."
if command -v yum &> /dev/null; then
    sudo yum install -y epel-release
    sudo yum install -y fail2ban
elif command -v apt &> /dev/null; then
    sudo apt install -y fail2ban
fi

sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Fail2Ban SSH jail yapılandırması
sudo cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 7200
EOF

# Amazon Linux için log path düzeltmesi
if [ -f /var/log/secure ]; then
    sudo sed -i 's|/var/log/auth.log|/var/log/secure|g' /etc/fail2ban/jail.local
fi

sudo systemctl restart fail2ban
echo "✓ Fail2Ban aktif ve çalışıyor"

# Firewall yapılandırması
echo "🔥 Firewall yapılandırılıyor..."
if command -v firewall-cmd &> /dev/null; then
    # firewalld (CentOS/Amazon Linux)
    sudo systemctl enable firewalld
    sudo systemctl start firewalld
    sudo firewall-cmd --permanent --add-service=ssh
    sudo firewall-cmd --permanent --add-service=http
    sudo firewall-cmd --permanent --add-service=https
    sudo firewall-cmd --reload
elif command -v ufw &> /dev/null; then
    # ufw (Ubuntu/Debian)
    sudo ufw --force enable
    sudo ufw allow ssh
    sudo ufw allow http
    sudo ufw allow https
    echo "ufw enabled" | sudo tee /etc/ufw/user.rules > /dev/null
fi

echo "✓ Firewall yapılandırıldı (Port 22, 80, 443 açık)"

# Nginx web sunucusu (opsiyonel)
echo "🌐 Nginx yükleniyor..."
if command -v yum &> /dev/null; then
    sudo yum install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
elif command -v apt &> /dev/null; then
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
fi

echo "✓ Nginx çalışıyor"

# Docker kurulumu (opsiyonel ama önerilen)
echo "🐳 Docker yükleniyor..."
if ! command -v docker &> /dev/null; then
    if command -v yum &> /dev/null; then
        sudo yum install -y docker
        sudo systemctl enable docker
        sudo systemctl start docker
    elif command -v apt &> /dev/null; then
        sudo apt install -y docker.io
        sudo systemctl enable docker
        sudo systemctl start docker
    fi
    echo "✓ Docker kuruldu"
else
    echo "✓ Docker zaten kurulu"
fi

# Kullanıcı grubuna ekle
sudo usermod -aG docker $USER 2>/dev/null || true

# Son kontroller
echo ""
echo "========================================"
echo "✅ KURULUM TAMAMLANDI!"
echo "========================================"
echo ""
echo "Servis Durumları:"
systemctl is-active sshd 2>/dev/null || systemctl is-active ssh 2>/dev/null || echo "SSH: Bilinmiyor"
systemctl is-active fail2ban 2>/dev/null || echo "Fail2Ban: Bilinmiyor"
systemctl is-active nginx 2>/dev/null || echo "Nginx: Bilinmiyor"
systemctl is-active docker 2>/dev/null || echo "Docker: Bilinmiyor"
echo ""
echo "Açık Portlar: 22 (SSH), 80 (HTTP), 443 (HTTPS)"
echo ""
echo "⚠️ ÖNEMLİ: Bu oturumu kapattıktan sonra sadece SSH anahtarı ile bağlanabilirsiniz."
echo "   Anahtarınızı eklemeyi unutmayın!"
echo ""
