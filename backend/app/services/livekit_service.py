from livekit import api
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

class LiveKitService:
    def __init__(self):
        self.api_key = settings.LIVEKIT_API_KEY
        self.api_secret = settings.LIVEKIT_API_SECRET
        self.livekit_url = settings.LIVEKIT_URL
    
    def create_token(
        self,
        room_name: str,
        participant_identity: str,
        participant_name: str = None,
        is_teacher: bool = False,
        ttl: int = 3600
    ) -> str:
        """
        LiveKit için token oluşturur (GÜNCEL API)
        """
        try:
            # LiveKit 1.0+ API - VideoGrant ile
            video_grant = api.VideoGrant(
                room_join=True,
                room=room_name,
                can_publish=True,
                can_subscribe=True,
                can_publish_data=is_teacher,
                can_update_own_metadata=is_teacher
            )
            
            # AccessToken oluştur (yeni API)
            token = api.AccessToken(
                api_key=self.api_key,
                api_secret=self.api_secret,
                grant=video_grant,
                identity=participant_identity,
                name=participant_name or participant_identity,
                ttl=ttl
            )
            
            jwt_token = token.to_jwt()
            logger.info(f"✅ Token created for {participant_identity} in room {room_name}")
            return jwt_token
            
        except Exception as e:
            logger.error(f"❌ Token creation failed: {e}")
            # Alternatif yöntemi dene
            try:
                return self.create_token_alternative(room_name, participant_identity, participant_name, is_teacher, ttl)
            except:
                raise e
    
    def create_token_alternative(
        self,
        room_name: str,
        participant_identity: str,
        participant_name: str = None,
        is_teacher: bool = False,
        ttl: int = 3600
    ) -> str:
        """Alternatif token oluşturma (eski API uyumlu)"""
        import jwt
        import time
        import uuid
        
        now = int(time.time())
        
        payload = {
            "iss": self.api_key,
            "sub": participant_identity,
            "exp": now + ttl,
            "nbf": now,
            "iat": now,
            "jti": str(uuid.uuid4()),
            "name": participant_name or participant_identity,
            "video": {
                "room": room_name,
                "roomJoin": True,
                "canPublish": True,
                "canSubscribe": True,
                "canPublishData": is_teacher,
                "canUpdateOwnMetadata": is_teacher
            }
        }
        
        token = jwt.encode(payload, self.api_secret, algorithm="HS256")
        logger.info(f"✅ Alternative token created for {participant_identity}")
        return token
    
    def create_room_token(self, room_name: str, user_id: int, user_name: str, role: str) -> str:
        """Room bazlı token oluşturur"""
        is_teacher = (role == "teacher" or role == "instructor")
        return self.create_token(
            room_name=room_name,
            participant_identity=str(user_id),
            participant_name=user_name,
            is_teacher=is_teacher
        )

livekit_service = LiveKitService()
