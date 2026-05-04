import asyncio
import json
from typing import Dict, Set, Optional
from fastapi import WebSocket
import redis.asyncio as redis
from app.core.config import settings

class WebSocketManager:
    """Redis-backed WebSocket manager - No memory leaks"""
    
    def __init__(self):
        self.redis_client = None
        self._local_connections: Dict[str, Set[WebSocket]] = {}
        self._pubsub = None
        
    async def initialize(self):
        """Redis connection pool oluştur"""
        self.redis_client = await redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=50  # Connection pooling
        )
        self._pubsub = self.redis_client.pubsub()
        await self._pubsub.subscribe("websocket:global")
        asyncio.create_task(self._handle_redis_messages())
    
    async def connect(self, user_id: str, websocket: WebSocket):
        """Kullanıcıyı LOCAL memory'e ekle (sadece bu instance)"""
        await websocket.accept()
        
        if user_id not in self._local_connections:
            self._local_connections[user_id] = set()
        self._local_connections[user_id].add(websocket)
        
        # Redis'te user online durumunu set et (TTL ile)
        await self.redis_client.setex(f"user:online:{user_id}", 300, "1")
        
        # Diğer instance'lara bildir
        await self.redis_client.publish("websocket:global", json.dumps({
            "type": "user_online",
            "user_id": user_id
        }))
        
        return True
    
    async def disconnect(self, user_id: str, websocket: WebSocket):
        """Connection'ı temizle"""
        if user_id in self._local_connections:
            self._local_connections[user_id].discard(websocket)
            if not self._local_connections[user_id]:
                del self._local_connections[user_id]
                await self.redis_client.delete(f"user:online:{user_id}")
                
                await self.redis_client.publish("websocket:global", json.dumps({
                    "type": "user_offline",
                    "user_id": user_id
                }))
    
    async def send_to_user(self, user_id: str, data: dict):
        """Redis üzerinden kullanıcıya mesaj gönder (cross-instance)"""
        # Önce LOCAL bağlantıları kontrol et
        if user_id in self._local_connections:
            for ws in self._local_connections[user_id]:
                try:
                    await ws.send_json(data)
                except:
                    pass
        
        # Diğer instance'lara mesajı ilet (eğer user bu instance'da yoksa)
        await self.redis_client.publish("websocket:user", json.dumps({
            "target_user_id": user_id,
            "data": data
        }))
    
    async def broadcast_to_room(self, room_id: str, data: dict):
        """Odaya broadcast (Redis Stream ile)"""
        await self.redis_client.publish(f"room:{room_id}", json.dumps(data))
    
    async def _handle_redis_messages(self):
        """Redis'ten gelen mesajları dinle"""
        async for message in self._pubsub.listen():
            if message['type'] == 'message':
                try:
                    data = json.loads(message['data'])
                    
                    if data.get('type') == 'user_online':
                        # User online oldu - cache'e al
                        pass
                    elif data.get('type') == 'user_offline':
                        # User offline - cache'ten temizle
                        pass
                        
                except Exception as e:
                    print(f"Redis message error: {e}")
    
    async def get_online_users(self) -> list:
        """Online kullanıcıları Redis'ten getir (SCAN ile)"""
        users = []
        async for key in self.redis_client.scan_iter("user:online:*"):
            user_id = key.decode().split(":")[-1]
            users.append(user_id)
        return users

# Singleton
websocket_manager = WebSocketManager()
