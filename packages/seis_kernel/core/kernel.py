# SEIS Kernel - Core Platform Engine

"""
SEIS Kernel, çoklu platform desteği sunan merkezi bir çekirdek modüldür.
Capabilities, Router ve Plugin mimarisini içerir.
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from enum import Enum


class PlatformType(Enum):
    """Desteklenen platform tipleri."""
    WEB = "web"
    DESKTOP = "desktop"
    MOBILE = "mobile"
    CLI = "cli"
    EDGE = "edge"


@dataclass
class Capability:
    """Bir yetenek tanımını temsil eder."""
    name: str
    version: str
    required_permissions: List[str]
    description: str
    
    def is_compatible(self, platform: PlatformType) -> bool:
        """Platform ile uyumluluğu kontrol et."""
        # Basit implementasyon - genişletilebilir
        return True


class Router:
    """
    İstekleri ilgili işleyicilere yönlendiren merkezi router.
    Performans için keyword indexing kullanır.
    """
    
    def __init__(self):
        self._routes: Dict[str, Any] = {}
        self._keyword_index: Dict[str, List[str]] = {}  # O(1) lookup için
        
    def register(self, path: str, handler: Any, keywords: Optional[List[str]] = None):
        """Route kaydı yap."""
        self._routes[path] = handler
        
        # Keyword indexing
        if keywords:
            for keyword in keywords:
                keyword_lower = keyword.lower()
                if keyword_lower not in self._keyword_index:
                    self._keyword_index[keyword_lower] = []
                self._keyword_index[keyword_lower].append(path)
    
    def resolve(self, path: str, context: Optional[Dict] = None) -> Optional[Any]:
        """Path'e uygun handler'ı bul."""
        if path in self._routes:
            return self._routes[path]
        
        # Keyword-based fallback lookup
        if context and 'keywords' in context:
            for keyword in context['keywords']:
                if keyword in self._keyword_index:
                    matching_paths = self._keyword_index[keyword]
                    if matching_paths:
                        return self._routes.get(matching_paths[0])
        
        return None
    
    def get_all_routes(self) -> List[str]:
        """Kayıtlı tüm route'ları döndür."""
        return list(self._routes.keys())


class PluginManager:
    """
    Plugin yönetimi için merkezi sınıf.
    Plugin lifecycle'ı yönetir (load, unload, enable, disable).
    """
    
    def __init__(self):
        self._plugins: Dict[str, Any] = {}
        self._plugin_states: Dict[str, bool] = {}
    
    def register_plugin(self, name: str, plugin: Any):
        """Plugin kaydet."""
        self._plugins[name] = plugin
        self._plugin_states[name] = False  # Default: disabled
    
    def enable_plugin(self, name: str) -> bool:
        """Plugin'i aktif et."""
        if name not in self._plugins:
            return False
        
        plugin = self._plugins[name]
        if hasattr(plugin, 'on_enable'):
            plugin.on_enable()
        
        self._plugin_states[name] = True
        return True
    
    def disable_plugin(self, name: str) -> bool:
        """Plugin'i devre dışı bırak."""
        if name not in self._plugins:
            return False
        
        plugin = self._plugins[name]
        if hasattr(plugin, 'on_disable'):
            plugin.on_disable()
        
        self._plugin_states[name] = False
        return True
    
    def get_active_plugins(self) -> List[str]:
        """Aktif plugin'leri listele."""
        return [name for name, state in self._plugin_states.items() if state]
    
    def unload_plugin(self, name: str) -> bool:
        """Plugin'i bellekten kaldır."""
        if name not in self._plugins:
            return False
        
        plugin = self._plugins[name]
        if hasattr(plugin, 'on_unload'):
            plugin.on_unload()
        
        del self._plugins[name]
        del self._plugin_states[name]
        return True


class SEISKernel:
    """
    Ana SEIS Kernel sınıfı.
    Tüm alt sistemleri koordine eder.
    """
    
    def __init__(self):
        self.router = Router()
        self.plugin_manager = PluginManager()
        self.capabilities: List[Capability] = []
        self._initialized = False
    
    def initialize(self):
        """Kernel'ı başlat."""
        if self._initialized:
            return
        
        # Varsayılan yetenekleri yükle
        self._load_default_capabilities()
        
        # Router'ı yapılandır
        self._setup_routes()
        
        self._initialized = True
    
    def _load_default_capabilities(self):
        """Varsayılan yetenekleri yükle."""
        defaults = [
            Capability(
                name="core_routing",
                version="1.0.0",
                required_permissions=["read", "write"],
                description="Temel yönlendirme yeteneği"
            ),
            Capability(
                name="plugin_system",
                version="1.0.0",
                required_permissions=["manage_plugins"],
                description="Plugin yönetim sistemi"
            )
        ]
        self.capabilities.extend(defaults)
    
    def _setup_routes(self):
        """Varsayılan route'ları ayarla."""
        def health_check():
            return {"status": "healthy", "version": "1.0.0"}
        
        self.router.register("/health", health_check, keywords=["status", "health"])
    
    def execute(self, path: str, **kwargs) -> Any:
        """Bir route'u çalıştır."""
        if not self._initialized:
            self.initialize()
        
        handler = self.router.resolve(path, kwargs.get('context'))
        if handler:
            return handler(**kwargs)
        
        raise ValueError(f"No handler found for path: {path}")
    
    def get_status(self) -> Dict[str, Any]:
        """Kernel durumunu döndür."""
        return {
            "initialized": self._initialized,
            "capabilities_count": len(self.capabilities),
            "active_plugins": self.plugin_manager.get_active_plugins(),
            "routes_count": len(self.router.get_all_routes())
        }


# Örnek kullanım
if __name__ == "__main__":
    kernel = SEISKernel()
    kernel.initialize()
    
    print("Kernel Status:", kernel.get_status())
    
    result = kernel.execute("/health")
    print("Health Check:", result)
