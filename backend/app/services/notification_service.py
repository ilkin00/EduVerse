from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.schemas.notification import NotificationCreate
from typing import List, Optional

class NotificationService:
    
    @staticmethod
    def create_notification(db: Session, user_id: int, type: str, title: str, body: str, data: dict = None) -> Notification:
        """Yeni bildirim oluştur"""
        notification = Notification(
            user_id=user_id,
            type=type,
            title=title,
            body=body,
            data=data or {}
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification
    
    @staticmethod
    def get_user_notifications(db: Session, user_id: int, skip: int = 0, limit: int = 50) -> List[Notification]:
        """Kullanıcının bildirimlerini getir"""
        return db.query(Notification).filter(
            Notification.user_id == user_id
        ).order_by(Notification.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        """Okunmamış bildirim sayısını getir"""
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
    
    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: int) -> Optional[Notification]:
        """Bildirimi okundu olarak işaretle"""
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            notification.is_read = True
            db.commit()
            db.refresh(notification)
        
        return notification
    
    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        """Tüm bildirimleri okundu işaretle"""
        result = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).update({"is_read": True})
        db.commit()
        return result
    
    @staticmethod
    def delete_notification(db: Session, notification_id: int, user_id: int) -> bool:
        """Bildirimi sil"""
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            db.delete(notification)
            db.commit()
            return True
        return False
    
    @staticmethod
    def create_friend_request_notification(db: Session, to_user_id: int, from_username: str):
        """Arkadaşlık isteği bildirimi oluştur"""
        return NotificationService.create_notification(
            db=db,
            user_id=to_user_id,
            type="friend_request",
            title="Yeni arkadaşlık isteği",
            body=f"{from_username} size arkadaşlık isteği gönderdi",
            data={"from_user": from_username}
        )
    
    @staticmethod
    def create_message_notification(db: Session, to_user_id: int, from_username: str, message_preview: str):
        """Yeni mesaj bildirimi oluştur"""
        return NotificationService.create_notification(
            db=db,
            user_id=to_user_id,
            type="message",
            title="Yeni mesaj",
            body=f"{from_username}: {message_preview[:50]}",
            data={"from_user": from_username, "message_preview": message_preview[:50]}
        )
    
    @staticmethod
    def create_room_invite_notification(db: Session, to_user_id: int, from_username: str, room_name: str, room_id: int):
        """Oda daveti bildirimi oluştur"""
        return NotificationService.create_notification(
            db=db,
            user_id=to_user_id,
            type="room_invite",
            title="Oda daveti",
            body=f"{from_username} sizi '{room_name}' odasına davet etti",
            data={"from_user": from_username, "room_name": room_name, "room_id": room_id}
        )
    
    @staticmethod
    def create_mention_notification(db: Session, to_user_id: int, from_username: str, room_name: str):
        """Etiketlenme bildirimi oluştur"""
        return NotificationService.create_notification(
            db=db,
            user_id=to_user_id,
            type="mention",
            title="Birisi sizi etiketledi",
            body=f"{from_username} sizi '{room_name}' odasında etiketledi",
            data={"from_user": from_username, "room_name": room_name}
        )
