from livekit import api
from app.core.config import settings
import logging
from functools import lru_cache
from datetime import datetime, timedelta
import asyncio

logger = logging.getLogger(__name__)

class LiveKitService:
    def __init__(self):
        self.api_key = settings.LIVEKIT_API_KEY
        self.api_secret = settings.LIVEKIT_API_SECRET
        self._token_cache = {}  # Simple TTL cache
        self._cache_ttl = 300  # 5 minutes
    
    def create_token(self, room_name: str, participant_identity: str, 
                     participant_name: str = None, is_teacher: bool = False, 
                     ttl: int = 3600) -> str:
        """Optimized token generation with caching"""
        
        # Cache key oluştur
        cache_key = f"{room_name}:{participant_identity}:{is_teacher}"
        
        # Cache kontrolü
        if cache_key in self._token_cache:
            token_data, expiry = self._token_cache[cache_key]
            if datetime.now() < expiry:
                logger.info(f"Token cache hit for {participant_identity}")
                return token_data
        
        # Token üret (compact permissions)
        video_grant = api.VideoGrant(
            room_join=True,
            room=room_name,
            can_publish=is_teacher,        # Sadece teacher publish yapabilir
            can_subscribe=True,
            can_publish_data=is_teacher,
            can_update_own_metadata=False,  # Disable metadata to save memory
            can_ingress=False,              # Ingress kapalı
            can_recording=False,            # Recording kapalı (memory save)
            can_list_rooms=False            # Room list kapalı
        )
        
        token = api.AccessToken(
            api_key=self.api_key,
            api_secret=self.api_secret,
            grant=video_grant,
            identity=participant_identity[:64],  # Identity truncate
            name=(participant_name or participant_identity)[:64],
            ttl=min(ttl, 7200)  # Max 2 hours
        )
        
        jwt_token = token.to_jwt()
        
        # Cache'e kaydet (5 dk)
        self._token_cache[cache_key] = (jwt_token, datetime.now() + timedelta(seconds=self._cache_ttl))
        
        # Clean old cache (her 100 token'da bir)
        if len(self._token_cache) > 100:
            self._clean_cache()
        
        return jwt_token
    
    def _clean_cache(self):
        """Expired tokenları temizle"""
        now = datetime.now()
        expired = [k for k, (_, exp) in self._token_cache.items() if now >= exp]
        for k in expired:
            del self._token_cache[k]

livekit_service = LiveKitService()
