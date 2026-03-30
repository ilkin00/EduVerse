from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import router as api_router
from app.core.database import engine, Base
from app.middleware import RateLimitMiddleware
import json
from urllib.parse import parse_qs
import jwt

# Veritabanı tablolarını oluştur
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Rate Limit Middleware (YENİ)
app.add_middleware(RateLimitMiddleware)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8081",
        "http://localhost:19000",
        "http://localhost:19001",
        "http://localhost:19002",
        "https://app.eduvers.site",
        "http://app.eduvers.site",
        "https://eduvers.site",
        "http://eduvers.site",
        "https://api.eduvers.site",
        "http://api.eduvers.site",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,
)

# API router'ını ekle
app.include_router(api_router, prefix=settings.API_V1_STR)

# WebSocket bağlantılarını tut
active_connections = {}

JWT_SECRET = settings.SECRET_KEY
JWT_ALGORITHM = "HS256"

def decode_token(token: str):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("user_id")
    except Exception as e:
        print(f"🔴 Token decode hatası: {e}")
        return None

@app.websocket("/api/v1/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    user_id = None

    try:
        query_string = websocket.scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token = params.get('token', [None])[0]

        if token:
            user_id = decode_token(token)
            if not user_id:
                await websocket.close(code=1008)
                return
            
            if user_id not in active_connections:
                active_connections[user_id] = []
            active_connections[user_id].append(websocket)
            print(f"✅ WebSocket bağlandı: {user_id}")

        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            print(f"📩 Mesaj alındı: {message}")

            if message["type"] == "private_message":
                receiver_id = message["receiver_id"]
                if receiver_id in active_connections:
                    for conn in active_connections[receiver_id]:
                        await conn.send_json({
                            "type": "private_message",
                            "sender_id": user_id,
                            "content": message["content"],
                            "timestamp": message.get("timestamp")
                        })
                    print(f"📤 Mesaj iletildi: {receiver_id}")

            elif message["type"] == "typing":
                receiver_id = message["receiver_id"]
                if receiver_id in active_connections:
                    for conn in active_connections[receiver_id]:
                        await conn.send_json({
                            "type": "typing",
                            "sender_id": user_id,
                            "is_typing": message.get("is_typing")
                        })

            elif message["type"] == "mark_read":
                sender_id = message["sender_id"]
                if sender_id in active_connections:
                    for conn in active_connections[sender_id]:
                        await conn.send_json({
                            "type": "read_receipt",
                            "reader_id": user_id,
                            "message_ids": message.get("message_ids")
                        })

    except WebSocketDisconnect:
        if user_id and user_id in active_connections:
            active_connections[user_id] = [c for c in active_connections[user_id] if c != websocket]
            if not active_connections[user_id]:
                del active_connections[user_id]
            print(f"❌ WebSocket ayrıldı: {user_id}")

    except Exception as e:
        print(f"🔴 WebSocket hatası: {e}")
        if user_id and user_id in active_connections:
            active_connections[user_id] = [c for c in active_connections[user_id] if c != websocket]
            if not active_connections[user_id]:
                del active_connections[user_id]

@app.get("/")
def root():
    return {
        "message": "EduVerse API'ye hoş geldiniz!",
        "version": settings.VERSION,
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}
