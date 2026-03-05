from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SessionBase(BaseModel):
    device_name: Optional[str] = None
    device_type: Optional[str] = None
    ip_address: Optional[str] = None
    location: Optional[str] = None

class SessionResponse(SessionBase):
    id: int
    user_id: int
    is_active: bool
    last_active: datetime
    created_at: datetime
    expires_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SessionListResponse(BaseModel):
    current_session: SessionResponse
    other_sessions: list[SessionResponse]
    total_sessions: int
