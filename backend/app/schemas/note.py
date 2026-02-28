from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class NoteType(str, Enum):
    TEXT = "text"
    DRAWING = "drawing"
    AUDIO = "audio"
    HANDWRITING = "handwriting"
    IMAGE = "image"

# Base Note
class NoteBase(BaseModel):
    title: str
    content: Optional[str] = None
    note_type: NoteType = NoteType.TEXT
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

# Drawing için validation response
class DrawingValidationResponse(BaseModel):
    valid: bool
    format: Optional[str] = None
    size_kb: Optional[float] = None
    error: Optional[str] = None

# Audio Note için metadata schema
class AudioMetadata(BaseModel):
    file_id: int
    duration: int  # saniye
    file_name: str
    file_size: int
    mime_type: str = "audio/m4a"
