import sys
import os

# Mevcut dizini path'e ekle
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai_engine import AIEngine
from reasoning_agent import ReasoningAgent

def test_intelligence():
    print("--- SEIS Yeni Zeka Testi Başlatılıyor ---")
    
    # Not: API anahtarları eksikse bu test gerçek bir API çağrısı yapamaz 
    # ancak kodun bütünlüğünü kontrol eder.
    engine = AIEngine(provider="openai", model="gpt-4o")
    agent = ReasoningAgent(engine)
    
    test_input = "Proje içindeki ARCHITECTURE.md dosyasını oku ve bana sistemin katmanlarını özetle."
    
    print(f"Test Girdisi: {test_input}")
    print("Not: Bu bir simülasyondur, API anahtarı olmadan gerçek çıktı üretilmez.")
    
    # Kodun import hatalarını kontrol etmek için basit bir örnek
    if hasattr(agent, 'process'):
        print("[BAŞARILI] ReasoningAgent yüklendi ve process metoduna sahip.")
    
    if os.path.exists('tools.py'):
        print("[BAŞARILI] tools.py dosyası mevcut.")

if __name__ == "__main__":
    test_intelligence()
