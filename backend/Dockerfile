FROM python:3.11-slim

WORKDIR /app

# Sistem bağımlılıklarını kur (libmagic dahil)
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libmagic1 \
    libmagic-dev \
    libjpeg-dev \
    zlib1g-dev \
    && rm -rf /var/lib/apt/lists/*

# Python bağımlılıklarını kopyala ve kur
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Uygulama kodunu kopyala
COPY . .

# Uploads dizinini oluştur
RUN mkdir -p uploads/{images,documents,audio,video} && \
    chmod -R 755 uploads

# Port
EXPOSE 8000

# Uygulamayı çalıştır
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
