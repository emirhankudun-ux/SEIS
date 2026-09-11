"""
Unit tests for SEIS Kernel core module.
Coverage: Router, PluginManager, Capability, SEISKernel
"""

import unittest
from core.kernel import (
    PlatformType, Capability, Router, 
    PluginManager, SEISKernel
)


class TestCapability(unittest.TestCase):
    """Capability sınıfı testleri."""
    
    def test_capability_creation(self):
        """Capability oluşturulması testi."""
        cap = Capability(
            name="test_cap",
            version="1.0.0",
            required_permissions=["read"],
            description="Test capability"
        )
        
        self.assertEqual(cap.name, "test_cap")
        self.assertEqual(cap.version, "1.0.0")
        self.assertEqual(len(cap.required_permissions), 1)
    
    def test_compatibility_check(self):
        """Platform uyumluluk testi."""
        cap = Capability(
            name="web_cap",
            version="1.0.0",
            required_permissions=[],
            description="Web capability"
        )
        
        # Tüm platformlar için şimdilik true dönmeli
        for platform in PlatformType:
            self.assertTrue(cap.is_compatible(platform))


class TestRouter(unittest.TestCase):
    """Router sınıfı testleri."""
    
    def test_route_registration(self):
        """Route kaydı testi."""
        router = Router()
        
        def handler():
            return "OK"
        
        router.register("/test", handler)
        self.assertIn("/test", router.get_all_routes())
    
    def test_route_resolution(self):
        """Route çözümü testi."""
        router = Router()
        
        def handler():
            return "resolved"
        
        router.register("/api/test", handler)
        resolved = router.resolve("/api/test")
        
        self.assertEqual(resolved(), "resolved")
    
    def test_keyword_indexing(self):
        """Keyword indexing testi - O(1) lookup."""
        router = Router()
        
        def search_handler():
            return "search results"
        
        router.register("/search", search_handler, keywords=["search", "find", "query"])
        
        # Keyword ile resolution
        context = {"keywords": ["find"]}
        resolved = router.resolve("/nonexistent", context)
        
        self.assertIsNotNone(resolved)
        self.assertEqual(resolved(), "search results")
    
    def test_not_found(self):
        """Bulunamayan route testi."""
        router = Router()
        result = router.resolve("/nonexistent")
        self.assertIsNone(result)


class TestPluginManager(unittest.TestCase):
    """PluginManager sınıfı testleri."""
    
    def test_plugin_registration(self):
        """Plugin kaydı testi."""
        manager = PluginManager()
        
        class DummyPlugin:
            pass
        
        manager.register_plugin("dummy", DummyPlugin())
        self.assertIn("dummy", manager._plugins)
    
    def test_plugin_enable_disable(self):
        """Plugin aktif/pasif testi."""
        manager = PluginManager()
        
        class StatefulPlugin:
            def __init__(self):
                self.enabled = False
            
            def on_enable(self):
                self.enabled = True
            
            def on_disable(self):
                self.enabled = False
        
        plugin = StatefulPlugin()
        manager.register_plugin("stateful", plugin)
        
        # Başlangıçta disabled
        self.assertEqual(len(manager.get_active_plugins()), 0)
        
        # Enable
        manager.enable_plugin("stateful")
        self.assertTrue(plugin.enabled)
        self.assertEqual(len(manager.get_active_plugins()), 1)
        
        # Disable
        manager.disable_plugin("stateful")
        self.assertFalse(plugin.enabled)
        self.assertEqual(len(manager.get_active_plugins()), 0)
    
    def test_plugin_unload(self):
        """Plugin bellekten kaldırma testi."""
        manager = PluginManager()
        
        class LifecyclePlugin:
            def __init__(self):
                self.unloaded = False
            
            def on_unload(self):
                self.unloaded = True
        
        plugin = LifecyclePlugin()
        manager.register_plugin("lifecycle", plugin)
        
        result = manager.unload_plugin("lifecycle")
        
        self.assertTrue(result)
        self.assertTrue(plugin.unloaded)
        self.assertNotIn("lifecycle", manager._plugins)
    
    def test_nonexistent_plugin_operations(self):
        """Var olmayan plugin işlemleri testi."""
        manager = PluginManager()
        
        self.assertFalse(manager.enable_plugin("nonexistent"))
        self.assertFalse(manager.disable_plugin("nonexistent"))
        self.assertFalse(manager.unload_plugin("nonexistent"))


class TestSEISKernel(unittest.TestCase):
    """SEISKernel entegrasyon testleri."""
    
    def test_kernel_initialization(self):
        """Kernel başlatma testi."""
        kernel = SEISKernel()
        kernel.initialize()
        
        status = kernel.get_status()
        
        self.assertTrue(status["initialized"])
        self.assertGreater(status["capabilities_count"], 0)
        self.assertEqual(status["routes_count"], 1)  # /health route'u
    
    def test_kernel_execute_health(self):
        """Health endpoint çalıştırma testi."""
        kernel = SEISKernel()
        result = kernel.execute("/health")
        
        self.assertEqual(result["status"], "healthy")
        self.assertEqual(result["version"], "1.0.0")
    
    def test_kernel_execute_not_found(self):
        """Bulunamayan endpoint testi."""
        kernel = SEISKernel()
        
        with self.assertRaises(ValueError):
            kernel.execute("/nonexistent")
    
    def test_double_initialization(self):
        """Çift başlatma denemesi testi."""
        kernel = SEISKernel()
        kernel.initialize()
        kernel.initialize()  # Hata vermemeli
        
        self.assertTrue(kernel._initialized)


if __name__ == "__main__":
    unittest.main()
