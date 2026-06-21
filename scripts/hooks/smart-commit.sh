#!/bin/bash

# SEIS Smart Commit Hook
# Kod değişikliklerini analiz eder ve V14 standartlarına uygun commit mesajı önerir/oluşturur.

set -euo pipefail

echo "🤖 SEIS Smart Commit: Analiz ediliyor..."

# Değişen dosyaları al
CHANGED_FILES=$(git diff --cached --name-only)

# Basit analiz kuralları
HAS_SECURITY=false
HAS_DESIGN=false
HAS_DOCS=false
HAS_CODE=false

for file in $CHANGED_FILES; do
    if [[ $file == *"security"* ]] || [[ $file == *".env"* ]] || [[ $file == *"secret"* ]]; then
        HAS_SECURITY=true
    elif [[ $file == *".css"* ]] || [[ $file == *"design"* ]] || [[ $file == *"style"* ]]; then
        HAS_DESIGN=true
    elif [[ $file == *".md"* ]] || [[ $file == *"docs/"* ]]; then
        HAS_DOCS=true
    else
        HAS_CODE=true
    fi
done

# Mesaj Tipini Belirle
TYPE="feat"
SCOPE="core"

if [ "$HAS_SECURITY" = true ]; then
    TYPE="security"
    SCOPE="guardian"
elif [ "$HAS_DESIGN" = true ]; then
    TYPE="design"
    SCOPE="ui"
elif [ "$HAS_DOCS" = true ]; then
    TYPE="docs"
    SCOPE="knowledge"
fi

# Commit Mesajını Oluştur (İlk satır değişen dosya sayısına göre)
FILE_COUNT=$(echo "$CHANGED_FILES" | wc -l | tr -d ' ')
SUBJECT="$TYPE($SCOPE): SEIS sistem güncellemesi ($FILE_COUNT dosya)"

echo "✅ Önerilen Commit Mesajı:"
echo "-------------------------"
echo "$SUBJECT"
echo ""
echo "Detaylı analiz tamamlandı. İşlem devam ediyor..."

# Gerçek commit işlemini iptal etmiyoruz, sadece logluyoruz.
# Gerçek senaryoda bu script commit-msg hook'u olarak çalıştırılır ve mesajı değiştirir.
exit 0
