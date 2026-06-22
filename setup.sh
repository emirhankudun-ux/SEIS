#!/bin/bash

set -u

echo "--- SEIS AGI Kurulum Sihirbazı ---"

# Python kontrolü
if ! command -v python3 &> /dev/null
then
    echo "Hata: Python3 yüklü değil."
    exit
fi

# Sanal ortam oluştur
echo "Sanal ortam oluşturuluyor..."
python3 -m venv venv
source venv/bin/activate

# Bağımlılıkları kur
echo "Bağımlılıklar kuruluyor..."
pip install -r server/cloud/ssh-ai-shell/requirements.txt
pip install fastapi uvicorn pydantic

# Config dosyasını kontrol et
if [ ! -f server/cloud/ssh-ai-shell/config.py ]; then
    echo "Config dosyası oluşturuluyor..."
    cp server/cloud/ssh-ai-shell/config.py.example server/cloud/ssh-ai-shell/config.py 2>/dev/null || echo "Lütfen config.py dosyasını manuel yapılandırın."
fi

echo "--- Kurulum Tamamlandı ---"
echo "SEIS'i başlatmak için: python3 server/cloud/ssh-ai-shell/api.py"
