# SEIS Kernel

**Core Platform Engine for Multi-Platform Support**

SEIS Kernel, web, desktop, mobile, CLI ve edge platformları için merkezi bir çekirdek modüldür. Router, Plugin Manager ve Capability sistemlerini içerir.

## 🚀 Özellikler

- **Router**: Keyword indexing ile O(1) route çözümü
- **Plugin Manager**: Dinamik plugin yükleme/boşaltma
- **Capability System**: Platform bazlı yetenek yönetimi
- **Type Safe**: Tam tip hinting desteği
- **Test Coverage**: %100 unit test coverage

## 📦 Kurulum

```bash
pip install seis-kernel
```

Geliştirme için:

```bash
pip install -e ".[dev]"
```

## 💡 Kullanım

### Temel Kullanım

```python
from core.kernel import SEISKernel

kernel = SEISKernel()
kernel.initialize()

# Health check
result = kernel.execute("/health")
print(result)  # {"status": "healthy", "version": "1.0.0"}

# Durum bilgisi
status = kernel.get_status()
print(status)
```

### Custom Route Ekleme

```python
from core.kernel import Router

router = Router()

def my_handler(**kwargs):
    return {"message": "Hello World"}

router.register("/api/hello", my_handler, keywords=["greeting", "hello"])

# Keyword-based lookup
context = {"keywords": ["greeting"]}
handler = router.resolve("/api/hello", context)
```

### Plugin Yönetimi

```python
from core.kernel import PluginManager

manager = PluginManager()

class MyPlugin:
    def on_enable(self):
        print("Plugin enabled")
    
    def on_disable(self):
        print("Plugin disabled")
    
    def on_unload(self):
        print("Plugin unloaded")

plugin = MyPlugin()
manager.register_plugin("my_plugin", plugin)

manager.enable_plugin("my_plugin")
manager.disable_plugin("my_plugin")
manager.unload_plugin("my_plugin")
```

## 🧪 Test

```bash
cd packages/seis_kernel
python -m unittest discover -s tests -v
```

## 📁 Yapı

```
packages/seis_kernel/
├── core/
│   ├── kernel.py          # Ana kernel modülü
│   └── __init__.py
├── tests/
│   ├── test_kernel.py     # Unit testler
│   └── __init__.py
├── pyproject.toml         # Package metadata
└── README.md
```

## 🔧 Geliştirme

### Kod Formatlama

```bash
black core/ tests/
flake8 core/ tests/
mypy core/
```

### Pre-commit Hooks (Önerilen)

```bash
pip install pre-commit
pre-commit install
```

## 📊 Performans

- **Route Resolution**: O(1) keyword indexing
- **Plugin Operations**: O(1) lookup
- **Memory Footprint**: Minimal (~500KB base)

## 🔒 Güvenlik

- Input sanitization
- Permission-based capability system
- Type safety enforcement

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

MIT License - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🌐 Bağlantılar

- [Ana Proje](https://github.com/emirhankudun-ux/seis)
- [Dokümantasyon](https://docs.seis.io)
- [Issue Tracker](https://github.com/emirhankudun-ux/seis/issues)
