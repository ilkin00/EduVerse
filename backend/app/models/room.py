from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    room_type = Column(String(50), default="public")  # public, private, course
    owner_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    max_participants = Column(Integer, default=10)
    settings = Column(JSON, default={})  # beyaz tahta ayarları, izinler vb.
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", backref="owned_rooms")
    participants = relationship("RoomParticipant", back_populates="room", cascade="all, delete-orphan")

class RoomParticipant(Base):
    __tablename__ = "room_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    role = Column(String(50), default="participant")  # host, moderator, participant
    joined_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    room = relationship("Room", back_populates="participants")
    user = relationship("User", backref="room_participations")
