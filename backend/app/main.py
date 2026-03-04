from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1 import router as api_router
from app.core.database import engine, Base
import json
from urllib.parse import parse_qs

# Veritabanı tablolarını oluştur (sadece geliştirme için)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Production'da kısıtla
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API router'ını ekle
app.include_router(api_router, prefix=settings.API_V1_STR)

# WebSocket bağlantılarını tut
active_connections = {}

@app.websocket("/api/v1/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    user_id = None
    
    try:
        # Token'dan user_id al (query parametresinden)
        query_string = websocket.scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token = params.get('token', [None])[0]
        
        # Token'dan user_id çöz (basit versiyon - gerçek projede JWT decode yap)
        # Şimdilik token son 3 karakteri user_id olarak kullanalım (geçici)
        if token:
            # Bu kısım geçici - gerçek JWT decode sonra eklenecek
            user_id = 8  # Şimdilik sabit ID
            active_connections[user_id] = websocket
            print(f"✅ WebSocket bağlandı: {user_id}")
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            print(f"📩 Mesaj alındı: {message}")
            
            if message["type"] == "private_message":
                receiver_id = message["receiver_id"]
                if receiver_id in active_connections:
                    await active_connections[receiver_id].send_json({
                        "type": "private_message",
                        "sender_id": user_id,
                        "content": message["content"],
                        "timestamp": message.get("timestamp")
                    })
                    print(f"📤 Mesaj iletildi: {receiver_id}")
            
            elif message["type"] == "typing":
                receiver_id = message["receiver_id"]
                if receiver_id in active_connections:
                    await active_connections[receiver_id].send_json({
                        "type": "typing",
                        "sender_id": user_id,
                        "is_typing": message.get("is_typing")
                    })
            
            elif message["type"] == "mark_read":
                sender_id = message["sender_id"]
                if sender_id in active_connections:
                    await active_connections[sender_id].send_json({
                        "type": "read_receipt",
                        "reader_id": user_id,
                        "message_ids": message.get("message_ids")
                    })
                    
    except WebSocketDisconnect:
        if user_id and user_id in active_connections:
            del active_connections[user_id]
            print(f"❌ WebSocket ayrıldı: {user_id}")
    except Exception as e:
        print(f"🔴 WebSocket hatası: {e}")
        if user_id and user_id in active_connections:
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
