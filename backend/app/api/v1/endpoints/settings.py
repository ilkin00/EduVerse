from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.api import deps
from app.models.user import User
from app.models.settings import UserSettings
from app.models.session import UserSession
from app.schemas.settings import (
    SettingsResponse, SettingsUpdate,
    NotificationSettings, PrivacySettings, AppearanceSettings
)
from app.schemas.session import SessionResponse, SessionListResponse
from datetime import datetime

router = APIRouter()

# ==================== KULLANICI AYARLARI ====================

@router.get("/", response_model=SettingsResponse)
def get_user_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Kullanıcı ayarlarını getir"""
    
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    if not settings:
        # Eğer ayarlar yoksa, varsayılan ayarları oluştur
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings

@router.put("/", response_model=SettingsResponse)
def update_user_settings(
    settings_update: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Kullanıcı ayarlarını güncelle"""
    
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
    
    # Sadece gönderilen alanları güncelle
    update_data = settings_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)
    
    return settings

# ==================== BİLDİRİM AYARLARI ====================

@router.get("/notifications", response_model=NotificationSettings)
def get_notification_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Bildirim ayarlarını getir"""
    
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return {
        "enabled": settings.notifications_enabled,
        "new_message": settings.notify_new_message,
        "friend_request": settings.notify_friend_request,
        "room_invite": settings.notify_room_invite,
        "ai_complete": settings.notify_ai_complete,
        "sound": settings.sound_enabled,
        "vibration": settings.vibration_enabled,
        "do_not_disturb": {
            "start": settings.do_not_disturb_start,
            "end": settings.do_not_disturb_end
        } if settings.do_not_disturb_start else None
    }

@router.put("/notifications", response_model=NotificationSettings)
def update_notification_settings(
    settings_update: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Bildirim ayarlarını güncelle"""
    
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
    
    # Bildirim alanlarını güncelle
    if "enabled" in settings_update:
        settings.notifications_enabled = settings_update["enabled"]
    if "new_message" in settings_update:
        settings.notify_new_message = settings_update["new_message"]
    if "friend_request" in settings_update:
        settings.notify_friend_request = settings_update["friend_request"]
    if "room_invite" in settings_update:
        settings.notify_room_invite = settings_update["room_invite"]
    if "ai_complete" in settings_update:
        settings.notify_ai_complete = settings_update["ai_complete"]
    if "sound" in settings_update:
        settings.sound_enabled = settings_update["sound"]
    if "vibration" in settings_update:
        settings.vibration_enabled = settings_update["vibration"]
    if "do_not_disturb" in settings_update:
        dnd = settings_update["do_not_disturb"]
        settings.do_not_disturb_start = dnd.get("start")
        settings.do_not_disturb_end = dnd.get("end")
    
    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)
    
    return {
        "enabled": settings.notifications_enabled,
        "new_message": settings.notify_new_message,
        "friend_request": settings.notify_friend_request,
        "room_invite": settings.notify_room_invite,
        "ai_complete": settings.notify_ai_complete,
        "sound": settings.sound_enabled,
        "vibration": settings.vibration_enabled,
        "do_not_disturb": {
            "start": settings.do_not_disturb_start,
            "end": settings.do_not_disturb_end
        } if settings.do_not_disturb_start else None
    }

# ==================== GİZLİLİK AYARLARI ====================

@router.get("/privacy", response_model=PrivacySettings)
def get_privacy_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Gizlilik ayarlarını getir"""
    
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return {
        "profile_visibility": settings.profile_visibility,
        "show_last_seen": settings.show_last_seen,
        "show_online_status": settings.show_online_status
    }

@router.put("/privacy", response_model=PrivacySettings)
def update_privacy_settings(
    privacy_update: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Gizlilik ayarlarını güncelle"""
    
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
    
    if "profile_visibility" in privacy_update:
        settings.profile_visibility = privacy_update["profile_visibility"]
    if "show_last_seen" in privacy_update:
        settings.show_last_seen = privacy_update["show_last_seen"]
    if "show_online_status" in privacy_update:
        settings.show_online_status = privacy_update["show_online_status"]
    
    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)
    
    return {
        "profile_visibility": settings.profile_visibility,
        "show_last_seen": settings.show_last_seen,
        "show_online_status": settings.show_online_status
    }

# ==================== GÖRÜNÜM AYARLARI ====================

@router.get("/appearance", response_model=AppearanceSettings)
def get_appearance_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Görünüm ayarlarını getir"""
    
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return {
        "theme": settings.theme,
        "language": settings.language,
        "font_size": settings.font_size
    }

@router.put("/appearance", response_model=AppearanceSettings)
def update_appearance_settings(
    appearance_update: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Görünüm ayarlarını güncelle"""
    
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    if not settings:
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
    
    if "theme" in appearance_update:
        settings.theme = appearance_update["theme"]
    if "language" in appearance_update:
        settings.language = appearance_update["language"]
    if "font_size" in appearance_update:
        settings.font_size = appearance_update["font_size"]
    
    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)
    
    return {
        "theme": settings.theme,
        "language": settings.language,
        "font_size": settings.font_size
    }

# ==================== O TURUM YÖNETİMİ ====================

@router.get("/sessions", response_model=SessionListResponse)
def get_user_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Aktif oturumları listele"""
    
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == True
    ).all()
    
    # Mevcut oturumu bul (token'dan)
    # Not: Gerçek implementasyonda token'dan session_id çözülmeli
    current_session = sessions[0] if sessions else None
    
    other_sessions = [s for s in sessions if s.id != (current_session.id if current_session else None)]
    
    return {
        "current_session": current_session,
        "other_sessions": other_sessions,
        "total_sessions": len(sessions)
    }

@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def terminate_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Belirli bir oturumu sonlandır"""
    
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Oturum bulunamadı")
    
    session.is_active = False
    db.commit()
    
    return None

@router.delete("/sessions", status_code=status.HTTP_204_NO_CONTENT)
def terminate_all_other_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Diğer tüm oturumları sonlandır (mevcut hariç)"""
    
    # Mevcut oturum hariç hepsini kapat
    # Not: Gerçek implementasyonda mevcut session_id bilinmeli
    db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.is_active == True
        # UserSession.id != current_session_id
    ).update({"is_active": False})
    
    db.commit()
    
    return None
