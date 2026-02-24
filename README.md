# 📚 EduVerse - Yapay Zeka Destekli Öğrenme Platformu

<div align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-blue.svg" alt="Version 2.0.0">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/React_Native-0.76-61dafb.svg" alt="React Native">
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688.svg" alt="FastAPI">
</div>

<p align="center">
  <b>Üniversite öğrencileri için geliştirilmiş, yapay zeka destekli, açık kaynak ve kapsamlı öğrenme ekosistemi</b>
</p>

<p align="center">
  <a href="#-proje-hakkında">Proje Hakkında</a> •
  <a href="#-mevcut-özellikler">Özellikler</a> •
  <a href="#-teknoloji-altyapısı">Teknoloji</a> •
  <a href="#-hızlı-başlangıç">Başlangıç</a> •
  <a href="#-ekran-görüntüleri">Ekranlar</a> •
  <a href="#-katkıda-bulunma">Katkı</a>
</p>

---

## 🎯 Proje Hakkında

**EduVerse**, öğrencilerin tüm öğrenme ihtiyaçlarını tek bir platformda toplamayı hedefleyen kapsamlı bir ekosistemdir. Not alma, yapay zeka destekli ders çalışma, gerçek zamanlı işbirlikli çalışma odaları ve dosya paylaşımı gibi özellikleri bir arada sunar.

### 🌟 Vizyon
Türkiye'den başlayarak Rusya ve dünyaya açılan, tamamen açık kaynak, topluluk odaklı ve yapay zeka destekli en kapsamlı öğrenme platformunu oluşturmak.

### 🎓 Hedef Kitle
- **Üniversite öğrencileri** - Ders notları, grup çalışmaları, sınav hazırlığı
- **Lise öğrencileri** - Üniversite hazırlık, ders tekrarı
- **Öğretim üyeleri** - Sınıf yönetimi, ödev takibi
- **Çalışma grupları** - Ortak projeler, beyin fırtınası

---

## ✨ Mevcut Özellikler

### ✅ **Tamamlanan Özellikler**

#### 🔐 **Kullanıcı Yönetimi**
- [x] Kayıt ve giriş sistemi (JWT tabanlı)
- [x] Profil görüntüleme ve düzenleme
- [x] Güvenli oturum yönetimi
- [x] AsyncStorage ile kalıcı oturum

#### 📝 **Notlar Sistemi**
- [x] Zengin metin notları oluşturma
- [x] Notları listeleme, filtreleme
- [x] Not düzenleme ve silme
- [x] Otomatik zaman damgası
- [x] Kategori bazlı filtreleme (Metin/Ses/Çizim)

#### 🤖 **Yapay Zeka Asistanı**
- [x] OpenRouter API entegrasyonu (Mistral 7B)
- [x] Genel sohbet asistanı
- [x] Matematik problemi çözme
- [x] Konu anlatımı (ilkokul'dan üniversite'ye)
- [x] Model seçme desteği (Mistral, Gemini, Dolphin)
- [x] Gerçek zamanlı cevap üretimi

#### 🎥 **Çalışma Odaları**
- [x] Oda listeleme ve arama
- [x] Oda oluşturma (public/private/study)
- [x] Gerçek zamanlı metin sohbeti (WebSocket)
- [x] Katılımcı listesi ve anlık güncelleme
- [x] Odaya katılma ve ayrılma

#### 🌍 **Çoklu Dil Desteği**
- [x] Türkçe (TR)
- [x] Rusça (RU) 
- [x] İngilizce (EN)
- [x] Kalıcı dil seçimi (AsyncStorage)
- [x] Tüm sayfalarda anlık dil değişimi

#### 📱 **Mobil Arayüz**
- [x] Modern ve minimalist tasarım
- [x] Koyu tema (Dark mode)
- [x] Responsive tasarım
- [x] Smooth animasyonlar
- [x] Bottom tab navigasyon
- [x] Glassmorphism efektleri

---

## 🚧 **Geliştirilme Aşamasındaki Özellikler**

### 🔄 **Sıradaki Hedefler**

| Özellik | Durum | Hedef Tarih |
|---------|-------|-------------|
| **Gelişmiş Not Editörü** (Word benzeri, LaTeX, tablo) | ⏳ Planlama | Mart 2026 |
| **Video/Sesli Görüşme** (WebRTC) | ⏳ Araştırma | Nisan 2026 |
| **Dosya Yükleme ve Yönetimi** | ⏳ Planlama | Mayıs 2026 |
| **Offline Mod** (Hive/SQLite) | ⏳ Planlama | Haziran 2026 |
| **Push Bildirimler** | ⏳ Araştırma | Temmuz 2026 |
| **Arkadaşlık Sistemi** | ⏳ Planlama | Ağustos 2026 |

---

## 🏗️ Teknoloji Altyapısı

### 🖥️ **Backend (FastAPI)**
```
🐍 Python 3.10+          → Ana dil
⚡ FastAPI               → Web framework
🐘 PostgreSQL            → Ana veritabanı
🔥 Redis                 → Cache & session
🐳 Docker                → Containerization
🔐 JWT                   → Authentication
🌐 OpenRouter API        → AI entegrasyonu
📡 WebSocket             → Gerçek zamanlı iletişim
```

### 📱 **Frontend (React Native)**
```
⚛️ React Native 0.76     → Mobil framework
📦 Expo 52               → Geliştirme platformu
🧭 React Navigation       → Sayfa yönlendirme
🎨 React Native Paper     → UI componentler
📡 Axios                 → API istekleri
🔌 Socket.io-client      → WebSocket bağlantısı
💾 AsyncStorage          → Yerel veri depolama
🌍 i18n-js               → Çoklu dil desteği
📸 Expo Vector Icons     → İkonlar
```

---

## 🚀 Hızlı Başlangıç

### 📋 Gereksinimler
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- PostgreSQL 14+
- Redis 7+
- Expo CLI
- Android Studio / Xcode (opsiyonel)

### 🔧 Kurulum Adımları

#### 1. Repoyu klonlayın
```bash
git clone https://github.com/yourusername/eduverse.git
cd eduverse
```

#### 2. Backend kurulumu
```bash
cd backend

# Python virtual environment oluştur
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Bağımlılıkları yükle
pip install -r requirements.txt

# Docker ile PostgreSQL ve Redis'i başlat
docker-compose up -d

# Veritabanını migrate et
alembic upgrade head

# Backend'i başlat
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend kurulumu
```bash
cd frontend/mobile

# Bağımlılıkları yükle
npm install
# veya
yarn install

# Environment dosyasını oluştur
cp .env.example .env
# .env dosyasını düzenle (API_URL vs.)

# Uygulamayı başlat (web)
npx expo start --web

# veya mobil için
npx expo start --tunnel
```

### 🐳 Docker ile Tek Komutta Kurulum
```bash
# Tüm projeyi Docker ile ayağa kaldır
docker-compose up -d

# Backend: http://localhost:8000
# Frontend (web): http://localhost:3000
```

---

## 📸 Ekran Görüntüleri

<div align="center">
  <img src="https://via.placeholder.com/300x600.png?text=Login+Screen" width="200" alt="Login Screen">
  <img src="https://via.placeholder.com/300x600.png?text=Home+Screen" width="200" alt="Home Screen">
  <img src="https://via.placeholder.com/300x600.png?text=Notes+Screen" width="200" alt="Notes Screen">
  <img src="https://via.placeholder.com/300x600.png?text=AI+Chat" width="200" alt="AI Chat">
</div>

<div align="center">
  <img src="https://via.placeholder.com/300x600.png?text=Rooms+Screen" width="200" alt="Rooms Screen">
  <img src="https://via.placeholder.com/300x600.png?text=Room+Chat" width="200" alt="Room Chat">
  <img src="https://via.placeholder.com/300x600.png?text=Profile+Screen" width="200" alt="Profile Screen">
  <img src="https://via.placeholder.com/300x600.png?text=Language+Select" width="200" alt="Language Select">
</div>

---

## 📊 API Dökümantasyonu

API dökümantasyonuna `http://localhost:8000/docs` adresinden erişebilirsiniz (Swagger UI).

### 🔑 Ana Endpoint'ler

| Metot | Endpoint | Açıklama |
|-------|----------|----------|
| **Auth** |
| POST | `/api/v1/auth/login` | Kullanıcı girişi |
| POST | `/api/v1/auth/register` | Yeni kayıt |
| GET | `/api/v1/auth/me` | Profil bilgisi |
| **Notes** |
| GET | `/api/v1/notes/` | Notları listele |
| POST | `/api/v1/notes/` | Not oluştur |
| PUT | `/api/v1/notes/{id}` | Not güncelle |
| DELETE | `/api/v1/notes/{id}` | Not sil |
| **Rooms** |
| GET | `/api/v1/rooms/` | Odaları listele |
| POST | `/api/v1/rooms/` | Oda oluştur |
| POST | `/api/v1/rooms/{id}/join` | Odaya katıl |
| WebSocket | `/api/v1/rooms/ws/{id}` | Sohbet bağlantısı |
| **AI** |
| POST | `/api/v1/ai/chat` | AI sohbet |
| POST | `/api/v1/ai/explain` | Konu anlatımı |
| POST | `/api/v1/ai/solve-math` | Matematik çözümü |

Detaylı API dökümantasyonu için [API.md](API.md) dosyasına bakın.

---

## 🧪 Test

### Backend Testleri
```bash
cd backend
pytest tests/ -v
```

### Frontend Testleri
```bash
cd frontend/mobile
npm test
# veya
yarn test
```

---

## 📦 Dağıtım

### Backend (Production)
```bash
cd backend
docker build -t eduverse-backend .
docker run -p 8000:8000 eduverse-backend
```

### Frontend (APK Build)
```bash
cd frontend/mobile
# Android APK
eas build -p android --profile preview
# veya
cd android && ./gradlew assembleRelease
```

---

## 🤝 Katkıda Bulunma

EduVerse açık kaynak bir projedir ve katkılarınızı memnuniyetle karşılar!

### Nasıl Katkıda Bulunabilirsiniz?

1. 🍴 Repoyu fork edin
2. 🌿 Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. 💾 Değişikliklerinizi commit edin (`git commit -m 'feat: Add amazing feature'`)
4. 📤 Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. 🔃 Pull Request oluşturun

### 🌟 Katkıda Bulunabileceğiniz Alanlar
- 🐛 Bug fix'leri
- ✨ Yeni özellikler
- 📚 Dokümantasyon iyileştirmeleri
- 🌍 Yeni dil çevirileri
- 🎨 UI/UX iyileştirmeleri
- ⚡ Performans optimizasyonları

### 📝 Commit Mesajı Formatı
```
feat: Yeni özellik eklendi
fix: Hata düzeltildi
docs: Dokümantasyon güncellendi
style: Kod formatı düzeltildi
refactor: Kod yeniden düzenlendi
test: Testler eklendi
chore: Bakım çalışması
```

---

## 📄 Lisans

Bu proje **MIT Lisansı** ile lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

---

## 🌟 İletişim

- **Website:** [eduverse.app](https://eduverse.app) (coming soon)
- **Discord:** [EduVerse Topluluğu](https://discord.gg/eduverse)
- **Twitter:** [@eduverse_app](https://twitter.com/eduverse_app)
- **Email:** hello@eduverse.app

---

<div align="center">
  <sub>Built with ❤️ for students, by students</sub>
  <br>
  <sub>© 2026 EduVerse. All rights reserved.</sub>
</div>

---

## 📊 Proje Durumu

| Metric | Değer |
|--------|-------|
| ⭐ Stars | 0 (yeni) |
| 🍴 Forks | 0 |
| 🐛 Açık Issue | 0 |
| ✅ Kapalı Issue | 0 |
| 🔀 Pull Request | 0 |
| 👥 Katkıda Bulunanlar | 1 |
| 📅 Son Güncelleme | Şubat 2026 |

---

## 🙏 Teşekkürler

- **FastAPI** ekibine harika framework için
- **React Native** topluluğuna
- **OpenRouter** ekibine ücretsiz AI API desteği için
- Tüm **katkıda bulunanlara** ve **kullanıcılara**

---

**⭐ Repoyu beğendiyseniz yıldız vermeyi unutmayın!** ⭐
