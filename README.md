## 📚 **EDUVERSE - GÜNCEL README.md**

```markdown
# 📚 EduVerse - AI-Powered Learning Platform

<div align="center">
  <img src="https://img.shields.io/badge/version-3.0.0-blue.svg" alt="Version 3.0.0">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/React_Native-0.76-61dafb.svg" alt="React Native">
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688.svg" alt="FastAPI">
  <img src="https://img.shields.io/badge/PostgreSQL-15-336791.svg" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Docker-✓-2496ED.svg" alt="Docker">
  <img src="https://img.shields.io/badge/WebSocket-✓-FF6B6B.svg" alt="WebSocket">
</div>

<p align="center">
  <b>A comprehensive, open-source learning ecosystem powered by artificial intelligence, designed for university students</b>
</p>

<p align="center">
  <a href="#-about-the-project">About</a> •
  <a href="#-key-features">Features</a> •
  <a href="#-technology-stack">Tech Stack</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-api-documentation">API</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

## 🎯 About the Project

**EduVerse** is a comprehensive ecosystem designed to consolidate all learning needs into a single platform. It combines note-taking, AI-powered study assistance, real-time collaborative study rooms, file sharing, and push notifications to transform the educational experience.

### 🌟 Vision
To create the most comprehensive, open-source, community-driven, and AI-powered learning platform that reaches students globally, breaking down educational barriers and fostering collaborative learning.

### 🎓 Target Audience
- **University Students** - Lecture notes, group studies, exam preparation
- **High School Students** - University preparation, subject revision
- **Educators** - Class management, assignment tracking
- **Study Groups** - Collaborative projects, brainstorming sessions

---

## ✨ Key Features

### ✅ **Completed Features**

#### 🔐 **User Management**
- [x] JWT-based registration and login system
- [x] Profile viewing and editing with avatar support
- [x] Secure session management
- [x] Persistent sessions with AsyncStorage
- [x] Password change functionality
- [x] Account deletion option

#### 📝 **Notes System**
- [x] Rich text note creation with formatting
- [x] **Drawing notes** - Freehand drawing, color selection, brush size
- [x] **Audio notes** - Voice recording and playback
- [x] Note listing and filtering (by type)
- [x] Edit and delete functionality
- [x] Automatic timestamps
- [x] Category-based filtering (Text/Drawing/Audio)
- [x] Note thumbnails for drawings

#### 🤖 **AI Assistant (Mistral/Mixtral)**
- [x] OpenRouter API integration (Mixtral 8x7B)
- [x] General conversation assistant
- [x] Step-by-step math problem solving
- [x] Topic explanations (elementary to university level)
- [x] Quiz generation
- [x] Text summarization
- [x] Translation (multiple languages)
- [x] Flashcard creation
- [x] Code assistance and debugging
- [x] Model selection support (Mixtral 8x7B, Mistral 7B)
- [x] Real-time response generation

#### 👥 **Friendship System**
- [x] Send/accept/reject friend requests
- [x] Friend list with online status indicators
- [x] Search users by username or name
- [x] Block/unblock users
- [x] View friend profiles

#### 💬 **Private Messaging**
- [x] Real-time messaging via WebSocket
- [x] Message history with pagination
- [x] Read receipts (seen status)
- [x] Online/offline status indicators
- [x] Typing indicators
- [x] File sharing in chats

#### 🎥 **Collaborative Study Rooms**
- [x] Room listing and search
- [x] Room creation (public/private/study)
- [x] Real-time text chat (WebSocket)
- [x] Live participant list with updates
- [x] Join and leave functionality
- [x] Room descriptions and max participants

#### 📁 **File Management**
- [x] File upload (images, documents, audio, video)
- [x] File listing and download
- [x] File deletion
- [x] Thumbnail generation for images
- [x] File association with notes

#### 🔔 **Push Notifications** (NEW)
- [x] Expo Notifications integration
- [x] Push token registration
- [x] New message notifications
- [x] Friend request notifications
- [x] Room invite notifications
- [x] AI task completion notifications
- [x] Notification list screen
- [x] Mark as read / Mark all read
- [x] Delete notifications

#### ⚙️ **User Settings**
- [x] Profile editing (name, email, bio)
- [x] Avatar upload
- [x] Password change
- [x] Notification preferences
- [x] Privacy settings (profile visibility, last seen)
- [x] Appearance settings (theme, language)
- [x] Storage management
- [x] Cache clearing
- [x] Data export
- [x] Session management

#### 🌍 **Multi-language Support**
- [x] Turkish (TR)
- [x] Russian (RU)
- [x] English (EN)
- [x] Persistent language preference (AsyncStorage)
- [x] Real-time language switching across all screens

#### 📱 **Mobile Interface**
- [x] Modern minimalist design
- [x] Dark mode support
- [x] Fully responsive layout
- [x] Smooth animations
- [x] Bottom tab navigation
- [x] Glassmorphism effects
- [x] Pull-to-refresh functionality
- [x] Loading states and skeletons

### 🚧 **In Development**

#### ⏳ **Coming Soon**
- [ ] Voice/Video calls (WebRTC integration)
- [ ] Offline mode with sync
- [ ] Group chats in rooms
- [ ] Calendar integration
- [ ] Subscription system (free/premium/pro)
- [ ] Analytics dashboard
- [ ] Desktop app (Electron/Tauri)

---

## 🏗️ Technology Stack

### 🖥️ **Backend (FastAPI)**
```
🐍 Python 3.11+          → Core language
⚡ FastAPI 0.115+         → Web framework
🐘 PostgreSQL 15          → Primary database
🔥 Redis 7                → Cache & session management
🐳 Docker                → Containerization
🔐 JWT                   → Authentication
🌐 OpenRouter API        → AI integration (Mistral/Mixtral)
📡 WebSocket             → Real-time communication
📧 Firebase Cloud Messaging → Push notifications
🔧 Alembic               → Database migrations
```

### 📱 **Frontend (React Native)**
```
⚛️ React Native 0.76     → Mobile framework
📦 Expo 52               → Development platform
🧭 React Navigation 6    → Screen navigation
🎨 React Native Paper    → UI components
📡 Axios                 → HTTP requests
🔌 WebSocket (Native)    → Real-time communication
💾 AsyncStorage          → Local data storage
🌍 i18n-js + expo-localization → Multi-language
📸 Expo Vector Icons     → Icon library
🎤 Expo AV               → Audio recording/playback
✏️ React Native Skia     → Drawing canvas
🔔 Expo Notifications    → Push notifications
📷 Expo Image Picker     → Image selection
📁 Expo FileSystem       → File operations
```

### ☁️ **DevOps & Infrastructure**
```
🐳 Docker & Docker Compose → Container orchestration
🌐 Nginx                → Reverse proxy
🔒 Let's Encrypt        → SSL certificates
🛡️ nftables             → Firewall
🚀 EAS Build            → APK compilation
📦 Git & GitHub         → Version control
```

---

## 🚀 Quick Start

### 📋 Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis 7+
- Expo CLI
- Android Studio / Xcode (optional)

### 🔧 Installation Steps

#### 1. Clone the repository
```bash
git clone https://github.com/yourusername/eduverse.git
cd eduverse
```

#### 2. Backend setup
```bash
cd backend

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database and API keys

# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend setup
```bash
cd frontend/mobile

# Install dependencies
npm install

# Create environment file
echo "API_URL=http://localhost:8000/api/v1" > .env
echo "WS_URL=ws://localhost:8000" >> .env

# Install push notification packages
npm install expo-device expo-notifications

# Start the application
npx expo start --web
# For mobile
npx expo start --tunnel
```

### 🐳 One-command Docker Setup
```bash
# Start the entire project with Docker
docker-compose up -d

# Backend: http://localhost:8000
# Frontend (web): http://localhost:3000
# Adminer (DB): http://localhost:8080
```

---

## 📊 API Documentation

API documentation is available at `http://localhost:8000/docs` (Swagger UI).

### 🔑 Main Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| **Auth** |
| POST | `/api/v1/auth/register` | User registration | ❌ |
| POST | `/api/v1/auth/login` | User login | ❌ |
| GET | `/api/v1/auth/me` | Profile information | ✅ |
| PUT | `/api/v1/auth/me` | Update profile | ✅ |
| POST | `/api/v1/auth/change-password` | Change password | ✅ |
| POST | `/api/v1/auth/upload-avatar` | Upload avatar | ✅ |
| **Notes** |
| GET | `/api/v1/notes/` | List all notes | ✅ |
| POST | `/api/v1/notes/` | Create a new note | ✅ |
| PUT | `/api/v1/notes/{id}` | Update a note | ✅ |
| DELETE | `/api/v1/notes/{id}` | Delete a note | ✅ |
| **Rooms** |
| GET | `/api/v1/rooms/` | List all rooms | ✅ |
| POST | `/api/v1/rooms/` | Create a new room | ✅ |
| POST | `/api/v1/rooms/{id}/join` | Join a room | ✅ |
| WebSocket | `/api/v1/rooms/ws/{id}` | Chat connection | ✅ |
| **Friends** |
| GET | `/api/v1/friends/` | List friends | ✅ |
| POST | `/api/v1/friends/request/{id}` | Send friend request | ✅ |
| POST | `/api/v1/friends/accept/{id}` | Accept request | ✅ |
| POST | `/api/v1/friends/reject/{id}` | Reject request | ✅ |
| DELETE | `/api/v1/friends/{id}` | Remove friend | ✅ |
| GET | `/api/v1/friends/search` | Search users | ✅ |
| **Chat** |
| GET | `/api/v1/chats/` | Get chat list | ✅ |
| GET | `/api/v1/chats/{user_id}` | Get message history | ✅ |
| POST | `/api/v1/chats/{user_id}` | Send message | ✅ |
| WebSocket | `/api/v1/ws/chat` | Real-time chat | ✅ |
| **AI** |
| POST | `/api/v1/ai/chat` | AI chat | ✅ |
| POST | `/api/v1/ai/explain` | Topic explanation | ✅ |
| POST | `/api/v1/ai/solve-math` | Math problem solving | ✅ |
| POST | `/api/v1/ai/summarize` | Text summarization | ✅ |
| POST | `/api/v1/ai/generate-quiz` | Quiz generation | ✅ |
| POST | `/api/v1/ai/translate` | Translation | ✅ |
| POST | `/api/v1/ai/flashcards` | Flashcard creation | ✅ |
| POST | `/api/v1/ai/code-assist` | Code assistance | ✅ |
| **Files** |
| POST | `/api/v1/files/upload` | Upload a file | ✅ |
| GET | `/api/v1/files/` | List user files | ✅ |
| DELETE | `/api/v1/files/{id}` | Delete a file | ✅ |
| GET | `/api/v1/files/download/{id}` | Download file | ✅ |
| **Settings** |
| GET | `/api/v1/settings/` | Get settings | ✅ |
| PUT | `/api/v1/settings/` | Update settings | ✅ |
| GET | `/api/v1/settings/notifications` | Get notification settings | ✅ |
| PUT | `/api/v1/settings/notifications` | Update notification settings | ✅ |
| GET | `/api/v1/settings/privacy` | Get privacy settings | ✅ |
| PUT | `/api/v1/settings/privacy` | Update privacy settings | ✅ |
| GET | `/api/v1/settings/appearance` | Get appearance settings | ✅ |
| PUT | `/api/v1/settings/appearance` | Update appearance settings | ✅ |
| **Notifications** |
| POST | `/api/v1/notifications/tokens` | Register push token | ✅ |
| DELETE | `/api/v1/notifications/tokens/{token}` | Unregister push token | ✅ |
| GET | `/api/v1/notifications/` | Get notifications | ✅ |
| PUT | `/api/v1/notifications/read` | Mark as read | ✅ |
| DELETE | `/api/v1/notifications/{id}` | Delete notification | ✅ |
| **Storage** |
| GET | `/api/v1/storage/usage` | Get storage usage | ✅ |
| POST | `/api/v1/storage/clear-cache` | Clear cache | ✅ |
| GET | `/api/v1/storage/export` | Export user data | ✅ |

---

## 📦 Deployment

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

# Development build
eas build -p android --profile development
```

### Linux AppImage (Desktop)
```bash
cd frontend/mobile
npm run build:web
npx tauri build
```

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend/mobile
npm test
```

---

## 🤝 Contributing

EduVerse is an open-source project and welcomes contributions!

### How to Contribute?

1. 🍴 Fork the repository
2. 🌿 Create a new branch (`git checkout -b feature/amazing-feature`)
3. 💾 Commit your changes (`git commit -m 'feat: Add amazing feature'`)
4. 📤 Push to the branch (`git push origin feature/amazing-feature`)
5. 🔃 Open a Pull Request

### 🌟 Contribution Areas
- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🌍 New language translations
- 🎨 UI/UX enhancements
- ⚡ Performance optimizations

### 📝 Commit Message Format
```
feat: Add new feature
fix: Bug fix
docs: Documentation update
style: Code formatting
refactor: Code restructuring
test: Add tests
chore: Maintenance
```

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🌟 Contact

- **Website:** [https://eduvers.site](https://eduvers.site)
- **API:** [https://api.eduvers.site](https://api.eduvers.site)
- **GitHub:** [github.com/ilkin00/EduVerse](https://github.com/ilkin00/EduVerse)

---

## 📊 Project Status

| Metric | Value |
|--------|-------|
| ⭐ Stars | 0 (new) |
| 🍴 Forks | 0 |
| 🐛 Open Issues | 0 |
| ✅ Closed Issues | 0 |
| 🔀 Pull Requests | 0 |
| 👥 Contributors | 1 |
| 📅 Last Updated | April 2026 |

---

## 🙏 Acknowledgments

- **FastAPI** team for the excellent framework
- **React Native** community
- **OpenRouter** team for free AI API access
- **Mistral AI** for the open-source language model
- All **contributors** and **users**

---

<div align="center">
  <sub>Built with ❤️ for students, by students</sub>
  <br>
  <sub>© 2026 EduVerse. All rights reserved.</sub>
  <br>
  <a href="https://github.com/ilkin00/EduVerse">
    <img src="https://img.shields.io/github/stars/ilkin00/EduVerse?style=social" alt="GitHub Stars">
  </a>
</div>

---

**⭐ If you like this project, don't forget to give it a star!** ⭐
```

Bu README artık **tüm yeni özellikleri** içeriyor:
- ✅ Push bildirimler
- ✅ Arkadaşlık sistemi
- ✅ Özel mesajlaşma
- ✅ WebSocket
- ✅ Çizim ve sesli notlar
- ✅ Tüm API endpoint'leri
- ✅ Ayarlar sistemi
- ✅ Desktop (Linux AppImage)
- ✅ Güncel tarih (Nisan 2026)

🚀
