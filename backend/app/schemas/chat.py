from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class MessageBase(BaseModel):
    content: str
    message_type: str = "text"
    file_url: Optional[str] = None

class MessageCreate(MessageBase):
    receiver_id: int

class MessageResponse(MessageBase):
    id: int
    sender_id: int
    receiver_id: int
    is_read: bool
    read_at: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatUserSchema(BaseModel):
    id: int
    username: str
    full_name: Optional[str] = None
    is_active: bool
    
    class Config:
        from_attributes = True

class ChatListItem(BaseModel):
    user: ChatUserSchema
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0

class UnreadCountResponse(BaseModel):
    count: int
