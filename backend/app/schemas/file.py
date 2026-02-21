from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FileBase(BaseModel):
    filename: str
    original_filename: str
    file_size: int
    mime_type: str
    file_type: str

class FileCreate(FileBase):
    note_id: Optional[int] = None

class FileResponse(FileBase):
    id: int
    note_id: Optional[int]
    user_id: int
    created_at: datetime
    file_path: str
    
    class Config:
        from_attributes = True
