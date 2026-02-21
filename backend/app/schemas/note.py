from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Base Note
class NoteBase(BaseModel):
    title: str
    content: Optional[str] = None
    note_type: str = "text"
    is_public: bool = False

# Create Note
class NoteCreate(NoteBase):
    pass

# Update Note
class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_public: Optional[bool] = None

# Note in DB
class NoteInDB(NoteBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Note Response
class NoteResponse(NoteInDB):
    pass
