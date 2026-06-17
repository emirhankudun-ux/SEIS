# Cloud SSH Toolkit

🚀 **Tüm büyük cloud sağlayıcıları için profesyonel SSH sunucu kurulum ve yönetim aracı**

## Özellikler

### 🌐 Çoklu Cloud Desteği
- **AWS** (Amazon Web Services)
- **GCP** (Google Cloud Platform)
- **Azure** (Microsoft Azure)
- **DigitalOcean**
- **Vultr**
- **Hetzner**

### 🔒 Güvenlik
- SSH anahtar doğrulaması (ED25519)
- Root girişi devre dışı
- Parola girişi devre dışı
- Fail2Ban brute force koruması
- UFW/Firewalld güvenlik duvarı
- Özel SSH port desteği
- Kullanıcı bazlı erişim kontrolü
- Sistem sertleştirme (hardening)
- Güvenlik denetimi ve tarama

### 🛠️ Yönetim Araçları
- Otomatik sunucu oluşturma
- Tek tıkla dağıtım
- Gerçek zamanlı izleme
- Yedekleme sistemleri
- Sağlık kontrolleri
- Log yönetimi
- Performans metrikleri

### 📦 Kurulum
- Tüm Linux dağıtımları desteği (Ubuntu, Debian, CentOS, RHEL, Fedora, openSUSE, Arch)
- Otomatik paket yöneticisi tespiti
- Tek komutla tam kurulum
- Özelleştirilebilir yapılandırma

## Hızlı Başlangıç

### 1. Temel Kurulum

```bash
# Script'i çalıştırılabilir yap
chmod +x scripts/setup_ssh_server.sh

# Temel kurulum (root olarak)
sudo ./scripts/setup_ssh_server.sh
```

### 2. Özelleştirilmiş Kurulum

```bash
# Özel SSH portu ile
sudo ./scripts/setup_ssh_server.sh --ssh-port 2222

# Belirli kullanıcılarla
sudo ./scripts/setup_ssh_server.sh --allow-users "admin deploy"

# Fail2Ban olmadan
sudo ./scripts/setup_ssh_server.sh --no-fail2ban

# Tam özelleştirme
sudo ./scripts/setup_ssh_server.sh \
  --ssh-port 2222 \
  --allow-users "admin deploy" \
  --no-firewall \
  --enable-root
```

### 3. Python Yönetim Aracı

```bash
# Yardımı görüntüle
python3 cloud_ssh_manager.py --help

# Yeni sunucu oluştur
python3 cloud_ssh_manager.py create --provider aws --region us-east-1

# Güvenlik yapılandırması
python3 cloud_ssh_manager.py configure --hardening full --enable-fail2ban --enable-ufw

# Dağıtım
python3 cloud_ssh_manager.py deploy --provider gcp --project my-project --auto-confirm

# İzleme
python3 cloud_ssh_manager.py monitor --realtime --logs --metrics

# Yedekleme
python3 cloud_ssh_manager.py backup --full --destination /backup/location

# Güvenlik taraması
python3 cloud_ssh_manager.py security --scan --audit --fix
```

## Cloud Sağlayıcı Özel Scriptleri

Her cloud sağlayıcı için özel deployment scriptleri:

```bash
# AWS
./scripts/create_aws.sh

# Google Cloud
./scripts/create_gcp.sh

# Azure
./scripts/create_azure.sh

# DigitalOcean
./scripts/create_digitalocean.sh

# Vultr
./scripts/create_vultr.sh

# Hetzner
./scripts/create_hetzner.sh
```

## Yapılandırma Dosyaları

### SSH Yapılandırması (`configs/sshd_config`)
- Güvenli varsayılan ayarlar
- Özelleştirilebilir parametreler
- Banner desteği

### Fail2Ban Yapılandırması (`configs/fail2ban/jail.local`)
- Brute force koruması
- Özelleştirilebilir ban süreleri
- Çoklu servis desteği

### Firewall Kuralları (`configs/firewall/rules.conf`)
- Port bazlı kurallar
- IP whitelist/blacklist
- Rate limiting

## Modüller

Toolkit çeşitli modüllerle genişletilebilir:

```
modules/
├── aws_module.py      # AWS entegrasyonu
├── gcp_module.py      # Google Cloud entegrasyonu
├── azure_module.py    # Azure entegrasyonu
├── monitoring.py      # İzleme modülü
├── backup.py          # Yedekleme modülü
└── security.py        # Güvenlik modülü
```

## Dokümantasyon

Detaylı dokümantasyon için `docs/` dizinine bakın:

- `docs/AWS_GUIDE.md` - AWS kurulum rehberi
- `docs/GCP_GUIDE.md` - Google Cloud kurulum rehberi
- `docs/AZURE_GUIDE.md` - Azure kurulum rehberi
- `docs/SECURITY.md` - Güvenlik en iyi pratikleri
- `docs/TROUBLESHOOTING.md` - Sorun giderme

## Gereksinimler

- **İşletim Sistemi**: Linux (Ubuntu 18.04+, Debian 10+, CentOS 7+, RHEL 7+, Fedora 30+, openSUSE, Arch)
- **Python**: 3.6+
- **Bash**: 4.0+
- **Root/Sudo Erişimi**: Gerekli

## Güvenlik En İyi Pratikleri

1. **SSH Anahtarı Kullanın**: Parola yerine her zaman SSH anahtarı kullanın
2. **Fail2Ban Aktif Tutun**: Brute force saldırılarına karşı koruma sağlar
3. **Firewall Yapılandırın**: Sadece gerekli portları açın
4. **Düzenli Güncellemeler**: Sistemi düzenli olarak güncelleyin
5. **Logları İzleyin**: Şüpheli aktiviteleri takip edin
6. **Yedek Alın**: Önemli verileri düzenli yedekleyin

## API Entegrasyonu

Toolkit, cloud sağlayıcıların API'leri ile entegre çalışabilir:

```python
from modules.aws_module import AWSManager

aws = AWSManager(api_key='your-key', secret='your-secret')
instance = aws.create_instance(
    region='us-east-1',
    instance_type='t2.micro',
    name='my-ssh-server'
)
```

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## Destek

Sorularınız için:
- GitHub Issues açın
- Dokümantasyonu kontrol edin
- Topluluk forumlarını ziyaret edin

## Changelog

### v1.0.0
- İlk sürüm
- 6 cloud sağlayıcı desteği
- Tam güvenlik hardening
- Otomatik kurulum
- İzleme ve yedekleme

---

**Cloud SSH Toolkit** © 2024 - Güvenli ve kolay cloud SSH yönetimi
