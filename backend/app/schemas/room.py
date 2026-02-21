from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Base Room
class RoomBase(BaseModel):
    name: str
    description: Optional[str] = None
    room_type: str = "public"
    max_participants: int = 10
    settings: dict = {}

# Create Room
class RoomCreate(RoomBase):
    pass

# Update Room
class RoomUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    max_participants: Optional[int] = None
    settings: Optional[dict] = None
    is_active: Optional[bool] = None

# Room in DB
class RoomInDB(RoomBase):
    id: int
    owner_id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Room Response
class RoomResponse(RoomInDB):
    participant_count: int = 0

# Participant
class RoomParticipantBase(BaseModel):
    user_id: int
    role: str = "participant"

class RoomParticipantResponse(RoomParticipantBase):
    id: int
    room_id: int
    joined_at: datetime
    username: Optional[str] = None
    
    class Config:
        from_attributes = True
