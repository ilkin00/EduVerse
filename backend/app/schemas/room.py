from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime

class RoomBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    room_type: str = "public"
    max_participants: int = 10
    settings: Optional[Dict] = None

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    room_type: Optional[str] = None
    max_participants: Optional[int] = None
    settings: Optional[Dict] = None
    is_active: Optional[bool] = None

class RoomResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    room_type: str
    owner_id: int
    max_participants: int
    participant_count: int = 0
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime]
    livekit_token: Optional[str] = None  # YENİ: Oda token'ı
    livekit_url: Optional[str] = None    # YENİ: LiveKit URL
    
    class Config:
        from_attributes = True

class RoomJoinResponse(BaseModel):
    message: str
    room_id: int
    livekit_token: Optional[str] = None
    livekit_url: Optional[str] = None
    participant_count: int = 0

class RoomParticipantBase(BaseModel):
    user_id: int
    role: str = "member"

class RoomParticipantResponse(BaseModel):
    id: int
    room_id: int
    user_id: int
    username: Optional[str] = None
    role: str
    is_muted: bool
    is_banned: bool
    joined_at: datetime
    
    class Config:
        from_attributes = True

class RoleUpdate(BaseModel):
    role: str  # owner, admin, moderator, member, guest

class MuteUpdate(BaseModel):
    is_muted: bool
