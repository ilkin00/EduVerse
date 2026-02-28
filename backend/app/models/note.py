from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.sql import func
from app.core.database import Base

class Note(Base):
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=True)  # Metin, Base64 veya JSON metadata
    note_type = Column(String(20), nullable=False, default="text")  # text, drawing, audio
    is_public = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Index'ler
    __table_args__ = (
        Index('idx_notes_user_id', 'user_id'),
        Index('idx_notes_type', 'note_type'),
        Index('idx_notes_created', 'created_at'),
    )
    
    @property
    def is_audio(self):
        return self.note_type == "audio"
    
    @property
    def audio_metadata(self):
        """Ses notu metadata'sını döndür"""
        if self.is_audio and self.content:
            try:
                import json
                return json.loads(self.content)
            except:
                return None
        return None
