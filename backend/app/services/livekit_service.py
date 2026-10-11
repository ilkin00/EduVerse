from livekit import api
from app.core.config import settings
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


class LiveKitService:
    def __init__(self):
        self.api_key = settings.LIVEKIT_API_KEY
        self.api_secret = settings.LIVEKIT_API_SECRET
        self._token_cache = {}
        self._cache_ttl = 300  # 5 dakika

    def create_token(
        self,
        room_name: str,
        participant_identity: str,
        participant_name: str = None,
        is_teacher: bool = False,
        ttl: int = 3600,
    ) -> str:
        """Optimized token generation with caching"""

        # Cache key
        cache_key = f"{room_name}:{participant_identity}:{is_teacher}"

        # Cache kontrolü
        if cache_key in self._token_cache:
            token_data, expiry = self._token_cache[cache_key]
            if datetime.now() < expiry:
                logger.info(f"Token cache hit for {participant_identity}")
                return token_data

        # Video grant - sadece kesin çalışan alanlar
        video_grant = api.VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=is_teacher,
            can_subscribe=True,
            can_publish_data=is_teacher,
        )

        # Token üret
        token = api.AccessToken(
            self.api_key,
            self.api_secret,
        )
        token.with_identity(participant_identity[:64])
        token.with_name((participant_name or participant_identity)[:64])
        token.with_grants(video_grant)
        token.with_ttl(timedelta(seconds=min(ttl, 7200)))

        jwt_token = token.to_jwt()

        # Cache'e kaydet
        self._token_cache[cache_key] = (
            jwt_token,
            datetime.now() + timedelta(seconds=self._cache_ttl),
        )

        # Cache temizliği
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
