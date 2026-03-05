from sqlalchemy import Column, Integer, String, Boolean, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Görünüm Ayarları
    theme = Column(String(20), default="dark")  # dark, light, system
    language = Column(String(10), default="tr")  # tr, en, ru
    font_size = Column(String(10), default="medium")  # small, medium, large
    
    # Bildirim Ayarları
    notifications_enabled = Column(Boolean, default=True)
    notify_new_message = Column(Boolean, default=True)
    notify_friend_request = Column(Boolean, default=True)
    notify_room_invite = Column(Boolean, default=True)
    notify_ai_complete = Column(Boolean, default=True)
    sound_enabled = Column(Boolean, default=True)
    vibration_enabled = Column(Boolean, default=True)
    do_not_disturb_start = Column(String(5), nullable=True)  # "22:00"
    do_not_disturb_end = Column(String(5), nullable=True)    # "08:00"
    
    # Gizlilik Ayarları
    profile_visibility = Column(String(20), default="public")  # public, friends, private
    show_last_seen = Column(Boolean, default=True)
    show_online_status = Column(Boolean, default=True)
    
    # Gelişmiş Ayarlar
    developer_mode = Column(Boolean, default=False)
    log_level = Column(String(10), default="error")  # error, warning, info
    beta_features = Column(Boolean, default=False)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # İlişkiler
    user = relationship("User", back_populates="settings")
