"""Türkçe / İngilizce sistem promptları ve dil yönetimi."""
from __future__ import annotations

from config import LANGUAGE


PROMPTS = {
    "tr": {
        "system": """Sen SSH-AI adında gelişmiş bir terminal yapay zeka asistanısın.\nGörevlerin:\n- Kullanıcıya kod yazma, debugging ve açıklama konusunda yardım etmek\n- Dosya işlemleri, shell komutları, git ve web araçlarını etkin kullanmak\n- Kısa, net, terminal dostu cevaplar vermek\n- Kod örneklerini ```dil kodu``` bloklarında vermek\n- Kullanıcı Türkçe yazıyorsa Türkçe, İngilizce yazıyorsa İngilizce cevap ver\n- Tool sonuçlarını yorumla, ham çıktıyı olduğu gibi yapıştırma""",
        "welcome": "Merhaba {name}! Ben senin terminal asistanınım. Bir şey sor veya /help yaz.",
        "thinking": "... düşünüyorum ...",
        "tool_running": "🔧 [{name}] çalıştırılıyor...",
        "goodbye": "Görüşürüz!",
        "rate_limited": "⛔ {msg}",
        "connection_closed": "Bağlantı kapatıldı.",
        "max_iterations": "Maksimum tool iterasyonu aşıldı.",
        "error_api": "[API HATA] {e}",
        "error_tool": "[ARAÇ HATA] {e}",
    },
    "en": {
        "system": """You are SSH-AI, an advanced terminal AI assistant.\nYour tasks:\n- Help the user with coding, debugging and explanations\n- Use file, shell, git and web tools effectively\n- Give short, clear, terminal-friendly answers\n- Always wrap code in ```lang\ncode\n``` blocks\n- Reply in the same language as the user\n- Interpret tool results, don't paste raw output""",
        "welcome": "Hello {name}! I'm your terminal assistant. Ask me something or type /help.",
        "thinking": "... thinking ...",
        "tool_running": "🔧 [{name}] running...",
        "goodbye": "Goodbye!",
        "rate_limited": "⛔ {msg}",
        "connection_closed": "Connection closed.",
        "max_iterations": "Max tool iterations reached.",
        "error_api": "[API ERROR] {e}",
        "error_tool": "[TOOL ERROR] {e}",
    },
}


def detect_lang(text: str) -> str:
    """Çok basit TR/EN dil algılama."""
    tr_markers = {"ş", "ğ", "ı", "ç", "ö", "ü", "Ş", "Ğ", "İ", "Ç", "Ö", "Ü"}
    tr_common = {"ve", "ile", "için", "ama", "bir", "bu", "şu", "ben", "sen", "nasıl", "nedir", "ne"}
    lower = text.lower()
    if any(c in lower for c in tr_markers):
        return "tr"
    words = set(lower.split())
    if words & tr_common:
        return "tr"
    return "en"


def get(language: str | None = None) -> dict:
    """Dil paketini getir."""
    lang = (language or LANGUAGE or "tr").lower()
    if lang == "auto":
        lang = "tr"
    return PROMPTS.get(lang, PROMPTS["tr"])


def pick(language: str | None, text: str) -> dict:
    """auto modunda metinden dil seçerek prompt setini döndür."""
    lang = (language or LANGUAGE or "tr").lower()
    if lang == "auto":
        lang = detect_lang(text)
    return PROMPTS.get(lang, PROMPTS["tr"])
