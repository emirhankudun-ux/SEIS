# SSH Sunucusu Cloud Deployment Rehberi

## 📋 Genel Bakış

SSH sunucunuz cloud üzerinde çalışacak şekilde hazırlandı. Aşağıdaki adımları takip ederek gerçek bir cloud sunucusuna deploy edebilirsiniz.

## 🚀 Deploy Seçenekleri

### 1. AWS EC2 (Önerilen)

#### Gereksinimler:
- AWS hesabı
- AWS CLI kurulu ve yapılandırılmış (`aws configure`)

#### Otomatik Deploy:
```bash
cd /workspace
python3 deploy_ssh_server.py
```

#### Manuel Deploy:
1. **AWS Console** üzerinden EC2 instance oluşturun:
   - AMI: Amazon Linux 2 veya Ubuntu 22.04
   - Instance Type: t2.micro (Free Tier)
   - Key Pair: Yeni oluşturun veya mevcut kullanın
   
2. **Security Group** ayarları:
   - Port 22 (SSH) - Tüm dünya
   - Port 80 (HTTP) - Tüm dünya
   - Port 443 (HTTPS) - Tüm dünya

3. **Instance'a bağlanın**:
```bash
ssh -i your-key.pem ec2-user@<public-ip>
```

4. **Setup scriptini çalıştırın**:
```bash
scp setup_ssh_server.sh ec2-user@<public-ip>:~/
ssh -i your-key.pem ec2-user@<public-ip>
chmod +x setup_ssh_server.sh
sudo ./setup_ssh_server.sh
```

### 2. Google Cloud Platform (GCP)

```bash
# GCP CLI ile
gcloud compute instances create ssh-server \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --machine-type=e2-micro \
  --tags=http-server,https-server \
  --metadata-from-file startup-script=setup_ssh_server.sh
```

### 3. Microsoft Azure

```bash
# Azure CLI ile
az vm create \
  --resource-group ssh-rg \
  --name ssh-server \
  --image Ubuntu2204 \
  --size Standard_B1s \
  --admin-username azureuser \
  --generate-ssh-keys
```

## 🔐 Güvenlik Ayarları

Deploy sonrası kontrol edilecekler:

1. **SSH Anahtar Doğrulama**: ✅ Aktif
2. **Root Girişi**: ❌ Devre Dışı
3. **Parola Girişi**: ❌ Devre Dışı
4. **Fail2Ban**: ✅ Aktif (Brute force koruması)
5. **Firewall**: ✅ Yapılandırıldı

## 📊 Bağlantı Bilgileri

Deployment sonrası bilgiler `deployment_info.json` dosyasında saklanır:

```json
{
  "provider": "AWS",
  "instance_id": "i-xxxxxxxxx",
  "public_ip": "xx.xxx.xxx.xxx",
  "key_file": "ssh-server-key.pem"
}
```

## 🔧 Bağlantı Komutu

```bash
ssh -i ssh-server-key.pem ec2-user@<public-ip>
```

## 📝 Önemli Notlar

- ⚠️ **Maliyet**: t2.micro instance Free Tier kapsamında (750 saat/ay)
- ⚠️ **Güvenlik**: Private key dosyasını (.pem) güvenli saklayın
- ⚠️ **Backup**: Önemli veriler için düzenli yedek alın
- ⚠️ **Monitoring**: CloudWatch veya benzeri araçlarla izleme yapın

## 🛠️ Sorun Giderme

### Bağlantı Hatası:
```bash
# Security Group kurallarını kontrol edin
# Firewall durumunu kontrol edin
ssh -v -i key.pem user@ip
```

### Disk Dolu:
```bash
df -h
sudo journalctl --vacuum-time=1d
```

### Servis Durumu:
```bash
systemctl status sshd
systemctl status fail2ban
systemctl status firewalld
```

## 📞 Destek

Sorularınız için deployment loglarını inceleyin veya cloud provider dokümantasyonuna başvurun.

---
**Oluşturulma Tarihi**: $(date)
**Versiyon**: 1.0
