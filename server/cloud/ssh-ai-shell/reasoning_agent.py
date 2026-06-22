"""Reasoning agent for multi-step planning and execution."""

from __future__ import annotations

import json
from typing import Generator
from ai_engine import AIEngine

class ReasoningAgent:
    def __init__(self, engine: AIEngine):
        self.engine = engine
        self.system_prompt = """Sen SEIS AGI sisteminin Muhakeme Çekirdeğisin. 
Karmaşık görevleri yerine getirirken şu adımları izle:
1. ANALİZ: Kullanıcının ne istediğini tam olarak anla.
2. PLANLAMA: Görevi küçük, yönetilebilir adımlara böl.
3. UYGULAMA: Her adımı sırayla araçları kullanarak gerçekleştir.
4. KONTROL: Çıktıları kontrol et, hata varsa düzelt.
5. RAPORLAMA: Sonucu kullanıcıya sun.

Düşüncelerini <thought> etiketleri içinde belirt."""

    def process(self, user_input: str) -> Generator[str, None, None]:
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": user_input}
        ]
        
        # İlk düşünce ve planlama aşaması
        yield from self.engine.stream(messages, use_tools=True)
