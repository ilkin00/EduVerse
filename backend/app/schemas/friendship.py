from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class FriendshipStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    blocked = "blocked"

class FriendUserSchema(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    is_active: bool
    
    class Config:
        from_attributes = True

class FriendshipResponse(BaseModel):
    id: int
    user_id: int
    friend_id: int
    status: FriendshipStatus
    requester_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class FriendWithStatusSchema(BaseModel):
    user: FriendUserSchema
    friendship_id: int
    status: FriendshipStatus
    created_at: datetime
    is_requester: bool

class FriendshipRequestSchema(BaseModel):
    id: int
    user: FriendUserSchema
    created_at: datetime
    
    class Config:
        from_attributes = True

class BlockResponseSchema(BaseModel):
    id: int
    blocked_user: FriendUserSchema
    created_at: datetime
    
    class Config:
        from_attributes = True

class FriendStatusResponse(BaseModel):
    status: str  # none, pending_sent, pending_received, friends, blocked_by_me, blocked_me
    friendship_id: Optional[int] = None
