from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Base Settings
class SettingsBase(BaseModel):
    # Görünüm
    theme: str = "dark"
    language: str = "tr"
    font_size: str = "medium"
    
    # Bildirimler
    notifications_enabled: bool = True
    notify_new_message: bool = True
    notify_friend_request: bool = True
    notify_room_invite: bool = True
    notify_ai_complete: bool = True
    sound_enabled: bool = True
    vibration_enabled: bool = True
    do_not_disturb_start: Optional[str] = None
    do_not_disturb_end: Optional[str] = None
    
    # Gizlilik
    profile_visibility: str = "public"
    show_last_seen: bool = True
    show_online_status: bool = True
    
    # Gelişmiş
    developer_mode: bool = False
    log_level: str = "error"
    beta_features: bool = False

class SettingsUpdate(BaseModel):
    theme: Optional[str] = None
    language: Optional[str] = None
    font_size: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    notify_new_message: Optional[bool] = None
    notify_friend_request: Optional[bool] = None
    notify_room_invite: Optional[bool] = None
    notify_ai_complete: Optional[bool] = None
    sound_enabled: Optional[bool] = None
    vibration_enabled: Optional[bool] = None
    do_not_disturb_start: Optional[str] = None
    do_not_disturb_end: Optional[str] = None
    profile_visibility: Optional[str] = None
    show_last_seen: Optional[bool] = None
    show_online_status: Optional[bool] = None
    developer_mode: Optional[bool] = None
    log_level: Optional[str] = None
    beta_features: Optional[bool] = None

class SettingsResponse(SettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Notification Settings
class NotificationSettings(BaseModel):
    enabled: bool
    new_message: bool
    friend_request: bool
    room_invite: bool
    ai_complete: bool
    sound: bool
    vibration: bool
    do_not_disturb: Optional[dict] = None

# Privacy Settings
class PrivacySettings(BaseModel):
    profile_visibility: str
    show_last_seen: bool
    show_online_status: bool

# Appearance Settings
class AppearanceSettings(BaseModel):
    theme: str
    language: str
    font_size: str
