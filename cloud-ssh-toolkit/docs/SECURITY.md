# Security Best Practices Guide

## Cloud SSH Sunucuları için Güvenlik En İyi Pratikleri

### 1. SSH Yapılandırması

#### Güvenli sshd_config

```bash
# /etc/ssh/sshd_config

# Sadece Protocol 2 kullan
Protocol 2

# Root girişini devre dışı bırak
PermitRootLogin no

# Parola girişini devre dışı bırak (sadece anahtar)
PasswordAuthentication no
PubkeyAuthentication yes

# Maksimum deneme sayısı
MaxAuthTries 3
MaxSessions 5

# Timeout ayarları
ClientAliveInterval 300
ClientAliveCountMax 2
LoginGraceTime 60

# Güvenlik
StrictModes yes
IgnoreRhosts yes
HostbasedAuthentication no
PermitEmptyPasswords no

# X11 ve Port Yönlendirme
X11Forwarding no
AllowTcpForwarding no
AllowAgentForwarding no
PermitTunnel no

# Detaylı logging
LogLevel VERBOSE
SyslogFacility AUTH
```

### 2. SSH Anahtarı Yönetimi

#### Güçlü Anahtar Oluştur

```bash
# ED25519 (Önerilen)
ssh-keygen -t ed25519 -a 100 -f ~/.ssh/id_ed25519 -C "comment"

# RSA (4096 bit minimum)
ssh-keygen -t rsa -b 4096 -a 100 -f ~/.ssh/id_rsa -C "comment"
```

#### Anahtar Koruma

```bash
# Doğru izinler
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub
chmod 600 ~/.ssh/authorized_keys
```

### 3. Fail2Ban Yapılandırması

#### Gelişmiş jail.local

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = auto
usedns = warn
logencoding = auto
enabled = false
mode = normal
ignoreip = 127.0.0.1/8 ::1

# E-posta bildirimleri
destemail = admin@example.com
sender = fail2ban@example.com
mta = sendmail

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 3600
action = %(action_mwl)s

[sshd-ddos]
enabled = true
port = ssh
filter = sshd-ddos
logpath = /var/log/auth.log
maxretry = 6
bantime = 7200
action = %(action_mwl)s
```

### 4. Firewall Kuralları

#### UFW (Ubuntu/Debian)

```bash
# Varsayılan politikalar
ufw default deny incoming
ufw default allow outgoing

# SSH (varsayılan veya özel port)
ufw allow 22/tcp comment 'SSH'
# veya
ufw allow 2222/tcp comment 'SSH Custom'

# Web sunucusu (opsiyonel)
ufw allow 80/tcp comment 'HTTP'
ufw allow 443/tcp comment 'HTTPS'

# Belirli IP'lerden erişim
ufw allow from 192.168.1.0/24 to any port 22 proto tcp

# Rate limiting
ufw limit 22/tcp

# Aktif et
ufw enable
```

#### Firewalld (CentOS/RHEL/Fedora)

```bash
# SSH servisi ekle
firewall-cmd --permanent --add-service=ssh

# Özel port
firewall-cmd --permanent --add-port=2222/tcp

# HTTP/HTTPS
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https

# IP bazlı kısıtlama
firewall-cmd --permanent --add-rich-rule='rule family="ipv4" source address="192.168.1.0/24" port port="22" protocol="tcp" accept'

# Reload
firewall-cmd --reload
```

### 5. Sistem Sertleştirme

#### Kernel Parametreleri

```bash
# /etc/sysctl.d/99-security.conf

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

# IPv6 (kullanılmıyorsa devre dışı)
net.ipv6.conf.all.disable_ipv6 = 1
net.ipv6.conf.default.disable_ipv6 = 1

# Kernel hardening
kernel.randomize_va_space = 2
kernel.exec-shield = 1
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 2

# Uygula
sysctl -p /etc/sysctl.d/99-security.conf
```

### 6. Kullanıcı Yönetimi

#### Yeni Kullanıcı Oluştur

```bash
# Kullanıcı oluştur
useradd -m -s /bin/bash newuser

# SSH anahtarı ekle
mkdir -p /home/newuser/.ssh
cat id_ed25519.pub >> /home/newuser/.ssh/authorized_keys
chown -R newuser:newuser /home/newuser/.ssh
chmod 700 /home/newuser/.ssh
chmod 600 /home/newuser/.ssh/authorized_keys

# Sudo yetkisi ver
usermod -aG sudo newuser  # Debian/Ubuntu
# veya
usermod -aG wheel newuser  # CentOS/RHEL
```

#### Yetkisiz Kullanıcıları Kaldır

```bash
# Kullanıcı listesi
cut -f1 -d: /etc/passwd

# Gereksiz kullanıcıları kaldır
userdel --remove olduser
```

### 7. Log Yönetimi ve İzleme

#### Merkezi Logging

```bash
# Rsyslog yapılandırması
# /etc/rsyslog.d/10-remote.conf

# Uzak syslog sunucusuna gönder
*.* @syslog-server.example.com:514

# Restart
systemctl restart rsyslog
```

#### Log Rotation

```bash
# /etc/logrotate.d/sshd
/var/log/auth.log {
    rotate 12
    weekly
    missingok
    notifempty
    compress
    delaycompress
    postrotate
        systemctl kill -s HUP rsyslog.service
    endscript
}
```

### 8. Düzenli Güvenlik Kontrolleri

#### Otomatik Güncellemeler

```bash
# Ubuntu/Debian
apt-get install unattended-upgrades
dpkg-reconfigure --priority=low unattended-upgrades

# CentOS/RHEL
yum install yum-cron
systemctl enable yum-cron
systemctl start yum-cron
```

#### Güvenlik Taraması

```bash
# Açık portları kontrol et
netstat -tulpn | grep LISTEN
# veya
ss -tulpn | grep LISTEN

# Başarısız login denemeleri
grep "Failed password" /var/log/auth.log | wc -l

# Aktif SSH oturumları
who
w

# Son logins
last
lastb
```

### 9. Yedekleme Stratejisi

#### Otomatik Yedekleme Scripti

```bash
#!/bin/bash
# /usr/local/bin/backup-ssh.sh

BACKUP_DIR="/backup/ssh"
DATE=$(date +%Y%m%d_%H%M%S)

# Yedeklenecek dosyalar
FILES=(
    "/etc/ssh/sshd_config"
    "/etc/ssh/authorized_keys"
    "/etc/fail2ban/jail.local"
    "/etc/ufw/user.rules"
)

# Yedek al
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        cp "$file" "$BACKUP_DIR/$(basename $file).$DATE"
    fi
done

# Eski yedekleri temizle (30 günden eski)
find $BACKUP_DIR -type f -mtime +30 -delete
```

### 10. Acil Durum Planı

#### Kurtarma Konsolu

- Cloud sağlayıcınızın serial console özelliğini aktif edin
- Recovery mode erişimini test edin
- Backup SSH anahtarlarını güvenli saklayın

#### Access Recovery

```bash
# Cloud console üzerinden SSH anahtarı sıfırlama
# AWS: EC2 Instance Connect veya Session Manager
# GCP: OS Login veya Serial Console
# Azure: Run Command veya Serial Console
```

### 11. Compliance ve Audit

#### Audit Logging

```bash
# Auditd kurulumu
apt-get install auditd  # Debian/Ubuntu
yum install audit       # CentOS/RHEL

# SSH erişimini izle
auditctl -w /etc/ssh/sshd_config -k ssh_config
auditctl -w /var/log/auth.log -k auth_log
```

### 12. Güvenlik Kontrol Listesi

- [ ] SSH anahtar doğrulaması aktif
- [ ] Root girişi devre dışı
- [ ] Parola girişi devre dışı
- [ ] Fail2Ban kurulu ve aktif
- [ ] Firewall yapılandırılmış
- [ ] Özel SSH portu (opsiyonel)
- [ ] Kullanıcı erişimi kısıtlanmış
- [ ] Sistem güncellemeleri otomatik
- [ ] Log izleme aktif
- [ ] Yedekleme sistemi kurulu
- [ ] Kernel parametreleri sertleştirilmiş
- [ ] Audit logging aktif

---

**Not**: Bu rehber genel güvenlik önerileri içerir. Spesifik gereksinimleriniz için ek önlemler almanız gerekebilir.
