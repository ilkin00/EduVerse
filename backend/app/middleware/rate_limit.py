from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict, Tuple
import time
from collections import defaultdict
import redis
from app.core.config import settings

# Redis bağlantısı (opsiyonel, yoksa memory kullan)
try:
    redis_client = redis.Redis(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        decode_responses=True
    )
    REDIS_AVAILABLE = redis_client.ping()
except:
    REDIS_AVAILABLE = False
    print("⚠️ Redis bağlantısı yok, rate limiting memory'de çalışacak")

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app):
        super().__init__(app)
        # Rate limit ayarları
        self.default_limit = 60  # dakikada 60 istek
        self.premium_limit = 300  # Premium kullanıcı için 300 istek/dk
        self.window = 60  # 60 saniye
        
        # Memory storage (Redis yoksa)
        self.memory_storage: Dict[str, list] = defaultdict(list)
    
    def _get_client_id(self, request: Request) -> str:
        """İstemciyi tanımlamak için IP + Token (varsa)"""
        client_ip = request.client.host if request.client else "unknown"
        
        # Authorization header'dan token al
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            return f"{client_ip}:{token[:20]}"
        
        return client_ip
    
    def _is_premium_user(self, request: Request) -> bool:
        """Kullanıcının premium olup olmadığını kontrol et"""
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return False
        
        token = auth_header.split(" ")[1]
        try:
            from jose import jwt
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            username = payload.get("sub")
            
            if username:
                from app.core.database import SessionLocal
                from app.models.user import User
                db = SessionLocal()
                user = db.query(User).filter(User.username == username).first()
                db.close()
                
                if user and user.subscription_tier in ["premium", "pro", "edu"]:
                    return True
        except:
            pass
        return False
    
    def _check_rate_limit_redis(self, key: str, limit: int) -> Tuple[bool, int]:
        """Redis ile rate limit kontrolü"""
        current = redis_client.get(key)
        if current is None:
            redis_client.setex(key, self.window, 1)
            return True, limit - 1
        
        current_count = int(current)
        if current_count >= limit:
            ttl = redis_client.ttl(key)
            return False, ttl
        
        redis_client.incr(key)
        return True, limit - (current_count + 1)
    
    def _check_rate_limit_memory(self, key: str, limit: int) -> Tuple[bool, int]:
        """Memory ile rate limit kontrolü"""
        now = time.time()
        requests = self.memory_storage[key]
        
        # Süresi geçmiş istekleri temizle
        self.memory_storage[key] = [t for t in requests if now - t < self.window]
        
        if len(self.memory_storage[key]) >= limit:
            oldest = self.memory_storage[key][0]
            wait_time = int(self.window - (now - oldest))
            return False, wait_time
        
        self.memory_storage[key].append(now)
        remaining = limit - len(self.memory_storage[key])
        return True, remaining
    
    async def dispatch(self, request: Request, call_next):
        # Özel endpoint'leri rate limit dışı bırak
        excluded_paths = ["/health", "/docs", "/openapi.json", "/redoc"]
        if request.url.path in excluded_paths:
            return await call_next(request)
        
        client_id = self._get_client_id(request)
        is_premium = self._is_premium_user(request)
        limit = self.premium_limit if is_premium else self.default_limit
        
        # Redis veya memory kullan
        if REDIS_AVAILABLE:
            key = f"rate_limit:{client_id}"
            allowed, remaining_or_wait = self._check_rate_limit_redis(key, limit)
        else:
            allowed, remaining_or_wait = self._check_rate_limit_memory(client_id, limit)
        
        if not allowed:
            raise HTTPException(
                status_code=429,
                detail=f"Too many requests. Please try again in {remaining_or_wait} seconds."
            )
        
        # Response header'ları ekle
        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit)
        response.headers["X-RateLimit-Remaining"] = str(remaining_or_wait)
        response.headers["X-RateLimit-Reset"] = str(self.window)
        
        return response
