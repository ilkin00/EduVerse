FROM node:18-alpine

# Çalışma dizinini oluştur
WORKDIR /app

# package.json dosyalarını kopyala
COPY package*.json ./

# Bağımlılıkları yükle (npm ci yerine npm install)
RUN npm install --production && npm cache clean --force

# Uygulama dosyalarını kopyala
COPY . .

# SQLite database için klasör oluştur
RUN mkdir -p /app/data && chmod 777 /app/data

# Port tanımla
EXPOSE 3500

# Sağlık kontrolü
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/latest', (r) => {r.statusCode === 200 ? process.exit(0) : process.exit(1)})"

# Uygulamayı başlat
CMD ["node", "server.js"]
