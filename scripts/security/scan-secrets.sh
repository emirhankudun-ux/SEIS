#!/bin/bash

# SEIS Secret Scanner
# GitLeaks kullanarak hassas verileri tarar.
# V14 Güvenlik Standardı: "Asla sırları commit etme."

set -euo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🛡️  SEIS Guardian: Gizli Anahtar Taraması Başlatılıyor..."

# GitLeaks kurulu mu kontrol et
if ! command -v gitleaks &> /dev/null; then
    echo -e "${YELLOW}⚠️  gitleaks bulunamadı. Yükleniyor...${NC}"
    # Basit kurulum (Linux/Mac için)
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        wget -q https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_linux_amd64.tar.gz
        tar -xzf gitleaks_linux_amd64.tar.gz
        sudo mv gitleaks /usr/local/bin/
        rm gitleaks_linux_amd64.tar.gz
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install gitleaks || true
    else
        echo -e "${RED}❌ Otomatik kurulum desteklenmiyor. Lütfen manuel yükleyin: https://github.com/gitleaks/gitleaks${NC}"
    fi
    if ! command -v gitleaks &> /dev/null; then
        echo -e "${RED}❌ gitleaks hâlâ bulunamadı; gizli anahtar taraması doğrulanamadı.${NC}"
        exit 1
    else
        echo -e "${GREEN}✅ gitleaks yüklendi.${NC}"
    fi
fi

# Taramayı Çalıştır
echo "🔍 Tüm geçmiş ve staged dosyalar taranıyor..."

if gitleaks detect --source . --config .gitleaks.toml --verbose --exit-code 2; then
    echo -e "${GREEN}✅ Tebrikler! Hiçbir gizli anahtar veya hassas veri bulunamadı.${NC}"
    echo "🎉 SEIS Güvenlik Standardı: PASSED"
    exit 0
else
    echo -e "${RED}🚨 KRİTİK UYARI: Potansiyel gizli anahtarlar veya hassas veriler tespit edildi!${NC}"
    echo -e "${YELLOW}⚠️  Commit işlemi engellendi. Lütfen ilgili dosyaları temizleyin.${NC}"
    echo ""
    echo "Çözüm önerileri:"
    echo "1. İlgili dosyayı .gitignore'a ekleyin."
    echo "2. Hassas veriyi koddan çıkarıp Environment Variable kullanın."
    echo "3. Geçmişi temizlemek için 'git filter-branch' veya 'BFG Repo-Cleaner' kullanın."
    exit 2
fi
