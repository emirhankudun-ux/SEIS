FROM python:3.11-slim

WORKDIR /app

# Sistem bağımlılıklarını kur
RUN apt-get update && apt-get install -y \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Bağımlılıkları kopyala ve kur
COPY server/cloud/ssh-ai-shell/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install fastapi uvicorn pydantic

# Tüm projeyi kopyala
COPY . .

# Çalışma dizinini ayarla
WORKDIR /app/server/cloud/ssh-ai-shell

# Portu aç
EXPOSE 8000

# API sunucusunu başlat
CMD ["python", "api.py"]
