# 📚 EduVerse - AI-Powered Learning Platform

<div align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-blue.svg" alt="Version 2.0.0">
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="MIT License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/React_Native-0.76-61dafb.svg" alt="React Native">
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688.svg" alt="FastAPI">
  <img src="https://img.shields.io/badge/PostgreSQL-14-336791.svg" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Docker-✓-2496ED.svg" alt="Docker">
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

**EduVerse** is a comprehensive ecosystem designed to consolidate all learning needs into a single platform. It combines note-taking, AI-powered study assistance, real-time collaborative study rooms, and file sharing capabilities to transform the educational experience.

### 🌟 Vision
To create the most comprehensive, open-source, community-driven, and AI-powered learning platform that reaches students globally, breaking down educational barriers and fostering collaborative learning.

### 🎓 Target Audience
- **University Students** - Lecture notes, group studies, exam preparation
- **High School Students** - University preparation, subject revision
- **Educators** - Class management, assignment tracking, student progress monitoring
- **Study Groups** - Collaborative projects, brainstorming sessions, resource sharing

---

## ✨ Key Features

### ✅ **Completed Features**

#### 🔐 **User Management**
- [x] JWT-based registration and login system
- [x] Profile viewing and editing
- [x] Secure session management
- [x] Persistent sessions with AsyncStorage

#### 📝 **Notes System**
- [x] Rich text note creation
- [x] Note listing and filtering
- [x] Edit and delete functionality
- [x] Automatic timestamps
- [x] Category-based filtering (Text/Drawing/Audio)

#### 🤖 **AI Assistant**
- [x] OpenRouter API integration (Mistral 7B)
- [x] General conversation assistant
- [x] Step-by-step math problem solving
- [x] Topic explanations (elementary to university level)
- [x] Model selection support (Mistral, Gemini, Dolphin)
- [x] Real-time response generation

#### 🎥 **Collaborative Study Rooms**
- [x] Room listing and search
- [x] Room creation (public/private/study)
- [x] Real-time text chat (WebSocket)
- [x] Live participant list with updates
- [x] Join and leave functionality

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

---

## 🏗️ Technology Stack

### 🖥️ **Backend (FastAPI)**
```
🐍 Python 3.10+          → Core language
⚡ FastAPI               → Web framework
🐘 PostgreSQL            → Primary database
🔥 Redis                 → Cache & session management
🐳 Docker                → Containerization
🔐 JWT                   → Authentication
🌐 OpenRouter API        → AI integration
📡 WebSocket             → Real-time communication
```

### 📱 **Frontend (React Native)**
```
⚛️ React Native 0.76     → Mobile framework
📦 Expo 52               → Development platform
🧭 React Navigation       → Screen navigation
🎨 React Native Paper     → UI components
📡 Axios                 → HTTP requests
🔌 Socket.io-client      → WebSocket client
💾 AsyncStorage          → Local data storage
🌍 i18n-js               → Multi-language support
📸 Expo Vector Icons     → Icon library
```

---

## 🚀 Quick Start

### 📋 Prerequisites
- Node.js 18+
- Python 3.10+
- Docker & Docker Compose
- PostgreSQL 14+
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

# Start PostgreSQL and Redis with Docker
docker-compose up -d

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
cp .env.example .env
# Edit .env file (set API_URL etc.)

# Start the application (web)
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
```

---

## 📊 API Documentation

API documentation is available at `http://localhost:8000/docs` (Swagger UI).

### 🔑 Main Endpoints

| Method | Endpoint | Description | Authorization |
|--------|----------|-------------|---------------|
| **Auth** |
| POST | `/api/v1/auth/register` | User registration | ❌ |
| POST | `/api/v1/auth/login` | User login | ❌ |
| GET | `/api/v1/auth/me` | Profile information | ✅ |
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
| **Files** |
| POST | `/api/v1/files/upload` | Upload a file | ✅ |
| GET | `/api/v1/files/` | List user files | ✅ |
| DELETE | `/api/v1/files/{id}` | Delete a file | ✅ |
| **AI** |
| POST | `/api/v1/ai/chat` | AI chat | ✅ |
| POST | `/api/v1/ai/explain` | Topic explanation | ✅ |
| POST | `/api/v1/ai/solve-math` | Math problem solving | ✅ |
| POST | `/api/v1/ai/generate-quiz` | Quiz generation | ✅ |
| POST | `/api/v1/ai/code-assist` | Code assistance | ✅ |

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
# or
yarn test
```

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
# or
cd android && ./gradlew assembleRelease
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

- **Website:** [eduverse.app](https://eduverse.app)
- **GitHub:** [github.com/eduverse](https://github.com/eduverse)
- **Discord:** [EduVerse Community](https://discord.gg/eduverse)
- **Email:** hello@eduverse.app

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
| 📅 Last Updated | February 2026 |

---

## 🙏 Acknowledgments

- **FastAPI** team for the excellent framework
- **React Native** community
- **OpenRouter** team for free AI API access
- All **contributors** and **users**

---

<div align="center">
  <sub>Built with ❤️ for students, by students</sub>
  <br>
  <sub>© 2026 EduVerse. All rights reserved.</sub>
  <br>
  <a href="https://github.com/eduverse/eduverse">
    <img src="https://img.shields.io/github/stars/eduverse/eduverse?style=social" alt="GitHub Stars">
  </a>
</div>

---

**⭐ If you like this project, don't forget to give it a star!** ⭐
