# Google Cloud Platform (GCP) Deployment Guide

## GCP ile SSH Sunucu Kurulumu

### Önkoşullar

1. Google Cloud hesabı
2. gcloud CLI kurulu ve yapılandırılmış
3. Proje ID'si

### gcloud CLI Kurulumu

```bash
# Ubuntu/Debian
echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | sudo tee -a /etc/apt/sources.list.d/google-cloud-sdk.list
curl https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo apt-key --keyring /usr/share/keyrings/cloud.google.gpg add -
sudo apt-get update && sudo apt-get install google-cloud-cli

# Yapılandırma
gcloud init
```

### Otomatik Dağıtım

```bash
# GCP için özel script
./scripts/create_gcp.sh --project my-project --zone us-central1-a
```

### Manuel Dağıtım Adımları

#### 1. SSH Anahtarı Oluştur

```bash
ssh-keygen -t ed25519 -f ~/.ssh/gcp-ssh-key -C "username" -N ""
```

#### 2. Firewall Kuralı Oluştur

```bash
gcloud compute firewall-rules create allow-ssh \
  --project my-project \
  --allow tcp:22 \
  --source-ranges 0.0.0.0/0 \
  --description "Allow SSH access"
```

#### 3. VM Instance Oluştur

```bash
gcloud compute instances create ssh-server \
  --project my-project \
  --zone us-central1-a \
  --machine-type e2-micro \
  --network-interface subnet=default \
  --metadata ssh-keys="username:$(cat ~/.ssh/gcp-ssh-key.pub)" \
  --boot-disk-size 10GB \
  --boot-disk-type pd-standard \
  --image-family debian-11 \
  --image-project debian-cloud
```

#### 4. External IP Al

```bash
EXTERNAL_IP=$(gcloud compute instances describe ssh-server \
  --project my-project \
  --zone us-central1-a \
  --format='get(networkInterfaces[0].accessConfigs[0].natIP)')
```

#### 5. Kurulum Scriptini Çalıştır

```bash
scp -i ~/.ssh/gcp-ssh-key scripts/setup_ssh_server.sh username@$EXTERNAL_IP:/tmp/
ssh -i ~/.ssh/gcp-ssh-key username@$EXTERNAL_IP "sudo /tmp/setup_ssh_server.sh"
```

### Python Manager ile Dağıtım

```bash
python3 cloud_ssh_manager.py deploy --provider gcp --project my-project --auto-confirm
```

### Maliyet Optimizasyonu

- **Preemptible VMs**: %80'e varan tasarruf
- **Committed Use Discounts**: Uzun vadeli taahhütler
- **Auto Scaling**: İhtiyaca göre ölçekleme
- **Sustained Use Discounts**: Otomatik indirimler

### Güvenlik En İyi Pratikleri

1. VPC içinde dağıtın
2. Firewall kurallarını sıkılaştırın
3. Service Account kullanın
4. Cloud Monitoring ile izleyin
5. OS Login özelliğini aktif edin

### Sorun Giderme

```bash
# Instance durumunu kontrol et
gcloud compute instances describe ssh-server --zone us-central1-a

# Serial console loglarını görüntüle
gcloud compute instances get-serial-port-output ssh-server --zone us-central1-a

# Bağlantı sorunları için
gcloud compute ssh ssh-server --zone us-central1-a --troubleshoot
```

### GCP Özel Özellikler

#### OS Login

```bash
# OS Login'i aktif et
gcloud compute instances add-metadata ssh-server \
  --metadata enable-oslogin=TRUE \
  --zone us-central1-a
```

#### Identity-Aware Proxy

```bash
# IAP üzerinden bağlan
gcloud compute ssh ssh-server \
  --project my-project \
  --zone us-central1-a \
  --tunnel-through-iap
```

---

Devamı `docs/GCP_ADVANCED.md` dosyasında...
