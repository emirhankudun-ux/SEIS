# Troubleshooting Guide

## Cloud SSH Toolkit - Sorun Giderme Rehberi

### 1. Bağlantı Sorunları

#### "Connection refused" hatası

**Nedenler:**
- SSH servisi çalışmıyor
- Firewall portu engelliyor
- Yanlış port numarası

**Çözüm:**
```bash
# SSH servisini kontrol et
systemctl status sshd
# veya
systemctl status ssh

# Servisi başlat
sudo systemctl start sshd
sudo systemctl enable sshd

# Port dinleniyor mu kontrol et
sudo netstat -tulpn | grep :22
# veya
sudo ss -tulpn | grep :22

# Firewall kurallarını kontrol et
sudo ufw status
# veya
sudo firewall-cmd --list-all
```

#### "Connection timed out" hatası

**Nedenler:**
- Güvenlik grubu/firewall erişimi engelliyor
- IP adresi yanlış
- Network sorunları

**Çözüm:**
```bash
# Cloud security group kontrolü
# AWS:
aws ec2 describe-security-groups --group-ids sg-xxxxx

# GCP:
gcloud compute firewall-rules list

# Azure:
az network nsg rule list --resource-group <rg> --nsg-name <nsg>

# Ping testi
ping -c 4 <server-ip>

# Port testi
telnet <server-ip> 22
# veya
nc -zv <server-ip> 22
```

#### "Permission denied (publickey)" hatası

**Nedenler:**
- SSH anahtarı yanlış
- Anahtar izinleri hatalı
- authorized_keys dosyası yok

**Çözüm:**
```bash
# Anahtar izinlerini kontrol et
chmod 700 ~/.ssh
chmod 600 ~/.ssh/id_ed25519
chmod 644 ~/.ssh/id_ed25519.pub

# Sunucuda authorized_keys kontrolü
ssh user@server "cat ~/.ssh/authorized_keys"

# Debug modda bağlan
ssh -vvv -i ~/.ssh/id_ed25519 user@server
```

### 2. SSH Servis Sorunları

#### SSH servisi başlamıyor

```bash
# Logları kontrol et
sudo journalctl -u sshd -n 50
# veya
sudo tail -f /var/log/auth.log

# Yapılandırma syntax kontrolü
sudo sshd -t

# Port çakışması kontrolü
sudo lsof -i :22

# Alternatif portta başlat
sudo /usr/sbin/sshd -p 2222
```

#### SSH yapılandırma hataları

```bash
# Hatalı satırı bul
sudo sshd -t -f /etc/ssh/sshd_config

# Yedekten geri al
sudo cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### 3. Fail2Ban Sorunları

#### Fail2Ban çalışmıyor

```bash
# Durum kontrolü
sudo systemctl status fail2ban

# Logları kontrol et
sudo tail -f /var/log/fail2ban.log

# Test ban
sudo fail2ban-client set sshd banip <test-ip>

# Jail durumunu kontrol et
sudo fail2ban-client status sshd

# Yeniden başlat
sudo systemctl restart fail2ban
```

#### Yanlış pozitif banlar

```bash
# IP'un ban durumunu kontrol et
sudo fail2ban-client get sshd banned

# IP'un banını kaldır
sudo fail2ban-client set sshd unbanip <ip-address>

# Whitelist'e ekle
echo "ignoreip = 127.0.0.1/8 ::1 <your-ip>" | sudo tee -a /etc/fail2ban/jail.local
sudo systemctl restart fail2ban
```

### 4. Firewall Sorunları

#### UFW sorunları

```bash
# Durum kontrolü
sudo ufw status verbose

# Logları kontrol et
sudo tail -f /var/log/ufw.log

# Reset ve yeniden yapılandır
sudo ufw reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw enable

# Rule silme
sudo ufw delete allow 22/tcp
```

#### Firewalld sorunları

```bash
# Durum kontrolü
sudo firewall-cmd --state

# Aktif zone ve kurallar
sudo firewall-cmd --get-active-zones
sudo firewall-cmd --list-all

# Servis ekleme
sudo firewall-cmd --permanent --add-service=ssh
sudo firewall-cmd --reload

# Port ekleme
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --reload
```

### 5. Performans Sorunları

#### Yüksek CPU kullanımı

```bash
# Prosesleri kontrol et
top
htop

# SSH bağlantılarını kontrol et
who
w

# Şüpheli aktiviteler
last
lastb

# Network trafiği
iftop
nethogs
```

#### Bellek sorunları

```bash
# Bellek kullanımı
free -h

# Swap kullanımı
swapon --show

# OOM killer logları
dmesg | grep -i "out of memory"
```

### 6. Cloud Spesifik Sorunlar

#### AWS EC2

```bash
# Instance durumu
aws ec2 describe-instance-status --instance-ids i-xxxxx

# System log
aws ec2 get-console-output --instance-id i-xxxxx

# Security group kontrolü
aws ec2 describe-security-groups --group-ids sg-xxxxx

# Session Manager ile bağlantı (SSH yoksa)
aws ssm start-session --target i-xxxxx
```

#### Google Cloud

```bash
# Instance durumu
gcloud compute instances describe <instance-name> --zone <zone>

# Serial console
gcloud compute instances get-serial-port-output <instance-name> --zone <zone>

# SSH debug
gcloud compute ssh <instance-name> --zone <zone> --troubleshoot
```

#### Azure

```bash
# VM durumu
az vm show -d -g <rg> -n <vm-name>

# Boot diagnostics
az vm boot-diagnostics get-boot-log -g <rg> -n <vm-name>

# Run Command ile komut çalıştır
az vm run-command invoke -g <rg> -n <vm-name> --command-id RunShellScript --scripts "systemctl status sshd"
```

### 7. Kurtarma İşlemleri

#### Kayıp SSH anahtarı

**Cloud Console üzerinden kurtarma:**

AWS:
```bash
# EC2 Instance Connect kullan
aws ec2-instance-connect send-ssh-public-key \
  --instance-id i-xxxxx \
  --availability-zone us-east-1a \
  --instance-os-user ubuntu \
  --ssh-public-key file://~/.ssh/id_ed25519.pub
```

GCP:
```bash
# Metadata üzerinden anahtar ekle
gcloud compute instances add-metadata <instance> \
  --metadata ssh-keys="username:$(cat ~/.ssh/id_ed25519.pub)" \
  --zone <zone>
```

Azure:
```bash
# VM User Update
az vm user update \
  -g <rg> -n <vm-name> \
  --username azureuser \
  --ssh-key-value ~/.ssh/id_ed25519.pub
```

#### Acil durum erişimi

1. Cloud provider console'a giriş yapın
2. Serial console özelliğini aktif edin
3. Recovery mode'da başlatın
4. Root filesystem'i mount edin
5. SSH yapılandırmasını düzeltin
6. Yeniden başlatın

### 8. Log Analizi

#### Önemli log dosyaları

```bash
# Authentication logs
/var/log/auth.log          # Debian/Ubuntu
/var/log/secure            # CentOS/RHEL

# System logs
/var/log/syslog           # Debian/Ubuntu
/var/log/messages         # CentOS/RHEL

# Fail2Ban logs
/var/log/fail2ban.log

# Kernel logs
dmesg
/var/log/kern.log
```

#### Log arama örnekleri

```bash
# Başarısız login denemeleri
grep "Failed password" /var/log/auth.log

# Başarılı logins
grep "Accepted" /var/log/auth.log

# Ban events
grep "Ban" /var/log/fail2ban.log

# SSH servis restarts
grep -i "sshd" /var/log/syslog | grep -i "restart"
```

### 9. Yaygın Hata Mesajları

| Hata | Çözüm |
|------|-------|
| Host key verification failed | `ssh-keygen -R <host>` |
| No matching key exchange algorithm | SSH client güncelle veya `-oKexAlgorithms=+diffie-hellman-group1-sha1` |
| Connection closed by remote host | Server loglarını kontrol et, resource kullanımına bak |
| Too many authentication failures | `ssh -o IdentitiesOnly=yes` kullan |
| Agent has no identities | `ssh-add ~/.ssh/id_ed25519` |

### 10. Yardım Alma

#### Diagnostic bilgi toplama

```bash
# Sistem bilgisi
uname -a
cat /etc/os-release

# Network bilgisi
ip addr show
ip route show
netstat -tulpn

# SSH versiyonu
ssh -V
sshd -V

# Son hatalar
dmesg | tail -50
journalctl -xe --no-pager | tail -100
```

Bu bilgileri GitHub Issues açarken paylaşın.

---

**İpucu**: Sorun giderme sırasında her zaman en son yapılan değişikliklerden başlayın ve değişiklikleri geri alarak test edin.
