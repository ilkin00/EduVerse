from app.core.config import settings
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api import deps
from app.services.livekit_service import livekit_service
from app.models.user import User

router = APIRouter()

class TokenRequest(BaseModel):
    room_name: str
    role: str = "student"

class TokenResponse(BaseModel):
    token: str
    room_name: str
    server_url: str
    identity: str

@router.post("/token", response_model=TokenResponse)
async def get_livekit_token(
    request: TokenRequest,
    current_user: User = Depends(deps.get_current_user),
    db: Session = Depends(deps.get_db)
):
    """
    LiveKit bağlantısı için token oluşturur
    """
    try:
        token = livekit_service.create_room_token(
            room_name=request.room_name,
            user_id=current_user.id,
            user_name=current_user.username,
            role=request.role
        )
        
        return TokenResponse(
            token=token,
            room_name=request.room_name,
            server_url=settings.LIVEKIT_WS_URL,
            identity=str(current_user.id)
        )
        
    except Exception as e:
        print(f"Hata: {e}")
        raise HTTPException(status_code=500, detail=f"Token creation failed: {str(e)}")

# TEST ENDPOINT - Auth gerektirmez
@router.post("/test-token")
async def get_test_token():
    """Test amaçlı authentication gerektirmeyen token"""
    token = livekit_service.create_token(
        room_name="test_room",
        participant_identity="test_user",
        participant_name="Test User",
        is_teacher=False
    )
    
    return {
        "token": token,
        "room_name": "test_room",
        "server_url": settings.LIVEKIT_WS_URL
    }
