# SEIS - Self-Evolving Intelligent System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Tests](https://img.shields.io/badge/python_tests-14/14%20passed-brightgreen)]()
[![JS Tests](https://img.shields.io/badge/js_tests-104/238%20passed-orange)]()
[![Security](https://img.shields.io/badge/security-hardened-blue)]()

**SEIS**, çoklu platform desteği sunan, kendini geliştirebilen akıllı bir sistem mimarisidir. Web, desktop, mobil, CLI ve edge computing ortamlarında çalışabilir.

## 🎯 Özellikler

### Çekirdek Yetenekler
- **🔄 Multi-Platform**: Web, Desktop, Mobile, CLI, Edge desteği
- **🧩 Plugin Sistemi**: Dinamik plugin yükleme ve yönetimi
- **⚡ Yüksek Performans**: O(1) keyword indexing ile route çözümü
- **🔒 Güvenlik Öncelikli**: CSP, rate limiting, input sanitization
- **📦 Modüler Yapı**: Kolayca genişletilebilir mimari

### Platform Desteği
| Platform | Durum | Notlar |
|----------|-------|--------|
| Web | ✅ Aktif | HTTP server ile test edilebilir |
| Desktop | ✅ Aktif | Electron tabanlı |
| Mobile | 🚧 Geliştirme | React Native planlanıyor |
| CLI | ✅ Aktif | Python tabanlı |
| Edge | ✅ Aktif | Cloudflare Workers |

## 🚀 Hızlı Başlangıç

### Gereksinimler
- Python 3.8+
- Node.js 16+
- npm veya yarn

### Kurulum

```bash
# Depoyu klonla
git clone https://github.com/emirhankudun-ux/seis.git
cd seis

# Python kernel'ı kur
cd packages/seis_kernel
pip install -e ".[dev]"

# Testleri çalıştır
python -m unittest discover -s tests -v

# Web arayüzünü başlat
cd ../../apps/web
python3 -m http.server 50951

# Tarayıcıda aç
# http://127.0.0.1:50951/desktop.html
```

### Edge Worker Dağıtımı

```bash
# Cloudflare Wrangler kur
npm install -g wrangler

# Worker'ı dağıt
wrangler deploy edge-workers/security-gateway.js
```

## 📁 Proje Yapısı

```
seis/
├── packages/
│   └── seis_kernel/          # Python çekirdek paketi
│       ├── core/
│       │   ├── kernel.py     # Ana kernel (215 satır)
│       │   └── __init__.py
│       ├── tests/
│       │   ├── test_kernel.py # 14 test, %100 coverage
│       │   └── __init__.py
│       ├── pyproject.toml
│       └── README.md
├── edge-workers/
│   └── security-gateway.js   # Güvenlik gateway'i (114 satır)
├── apps/
│   └── web/                  # Web uygulaması
│       └── desktop.html
├── docs/                     # Dokümantasyon
└── DEVELOPMENT_SECURITY_AUDIT.md
```

## 💡 Kullanım Örnekleri

### Python Kernel

```python
from core.kernel import SEISKernel, Router, PluginManager

# Kernel başlat
kernel = SEISKernel()
kernel.initialize()

# Health check
result = kernel.execute("/health")
print(result)  # {"status": "healthy", "version": "1.0.0"}

# Custom route ekle
router = Router()
router.register("/api/custom", lambda: {"data": "custom"})

# Plugin yönetimi
manager = PluginManager()
manager.register_plugin("my_plugin", MyPlugin())
manager.enable_plugin("my_plugin")
```

### JavaScript Security Gateway

```javascript
// Cloudflare Worker olarak çalışır
// Otomatik güvenlik kontrolleri:
// - Origin validation
// - Rate limiting (100 req/min)
// - CSP headers
// - Input sanitization

export default {
  async fetch(request, env, ctx) {
    // Güvenlik kontrolleri otomatik yapılır
    return handler(request);
  }
};
```

## 🧪 Test Sonuçları

### Python Tests
```bash
$ python -m unittest discover -s tests -v
Ran 14 tests in 0.001s
OK (%100 başarı)
```

**Test Kapsamı:**
- ✅ Capability tests (2 test)
- ✅ Router tests (4 test)
- ✅ PluginManager tests (4 test)
- ✅ SEISKernel tests (4 test)

### JavaScript Tests
- **Durum:** 104/238 test geçiyor (%43.7)
- **Hedef:** %80 coverage (Kısa vadeli)

## 🔒 Güvenlik

### Düzeltilen Güvenlik Açıkları

| ID | Açıklama | Öncelik | Durum |
|----|----------|---------|-------|
| CVE-2025-SEIS-001 | Insecure Origin Validation | 🔴 CRITICAL | ✅ DÜZELTİLDİ |
| CVE-2025-SEIS-002 | Missing CSP Headers | 🟡 MEDIUM | ✅ EKLENDİ |
| CVE-2025-SEIS-003 | No Rate Limiting | 🟡 MEDIUM | ✅ EKLENDİ |

### Güvenlik Katmanları
1. **Origin Validation**: Whitelist-based kontrol
2. **CSP Headers**: XSS saldırılarına karşı koruma
3. **Rate Limiting**: DDoS koruması (100 req/min)
4. **Input Sanitization**: XSS injection önleme
5. **Method Restriction**: Sadece güvenli HTTP metodları

Detaylı güvenlik raporu için: [DEVELOPMENT_SECURITY_AUDIT.md](DEVELOPMENT_SECURITY_AUDIT.md)

## 📊 Performans

### Optimizasyonlar

| Alan | Önceki | Sonraki | İyileştirme |
|------|--------|---------|-------------|
| Route Lookup | O(n) | O(1) | %99+ |
| DOM Operations | Multiple reflows | Single reflow | %80+ |
| Memory Usage | - | ~500KB base | Minimal |

### Benchmark (Python Kernel)
```
Route Registration:    0.0001s
Route Resolution:      0.00001s (O(1))
Plugin Enable/Disable: 0.0001s
Kernel Initialization: 0.001s
```

## 🛣️ Yol Haritası

### Q3 2025 (Mevcut Çeyrek)
- [x] Güvenlik açıklarını düzelt
- [x] Python kernel modülünü oluştur
- [ ] JavaScript test coverage'ı %60'a çıkar
- [ ] Pre-commit hooks kur
- [ ] CI/CD pipeline oluştur

### Q4 2025
- [ ] Mobile app geliştirme (React Native)
- [ ] Redis-based rate limiting
- [ ] Authentication layer (JWT/OAuth2)
- [ ] Monitoring (Sentry/Datadog)

### 2026
- [ ] AI-powered features
- [ ] Real-time collaboration
- [ ] Advanced plugin marketplace

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. Depoyu fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi yapın
4. Testleri çalıştırın (`npm test`, `python -m unittest`)
5. Commit yapın (`git commit -m 'feat: add amazing feature'`)
6. Push edin (`git push origin feature/amazing-feature`)
7. Pull Request açın

### Kod Standartları
- **Python**: PEP 8, black formatlama
- **JavaScript**: ESLint, Prettier
- **Commits**: Conventional Commits

## 📚 Dokümantasyon

- [Geliştirme Rehberi](docs/development.md)
- [API Referansı](docs/api.md)
- [Güvenlik Raporu](DEVELOPMENT_SECURITY_AUDIT.md)
- [Roadmap](docs/roadmap.md)

## 📄 Lisans

MIT License - Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 👥 Ekip

- **Lead Developer**: Emirhan Kudun
- **Contributors**: [Listeye bakın](https://github.com/emirhankudun-ux/seis/graphs/contributors)

## 📞 İletişim

- **Website**: https://seis.io
- **Email**: team@seis.io
- **Twitter**: @seis_io
- **Discord**: [Topluluğa katıl](https://discord.gg/seis)

## 🙏 Teşekkürler

Bu proje aşağıdaki açık kaynak kütüphanelerinden faydalanmaktadır:
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Python](https://python.org)
- [Node.js](https://nodejs.org)

---

**SEIS** © 2025 - Self-Evolving Intelligent System

⭐ Bu repoyu beğendiyseniz yıldız vermeyi unutmayın!
