from sqlalchemy.orm import Session
from app.models.achievement import Achievement, UserAchievement, UserStats
from app.models.user import User
from typing import List, Optional
from datetime import datetime, date

class GamificationService:
    
    XP_PER_LEVEL = 100
    
    @staticmethod
    def get_or_create_stats(db: Session, user_id: int) -> UserStats:
        """Kullanıcı istatistiklerini getir veya oluştur"""
        stats = db.query(UserStats).filter(UserStats.user_id == user_id).first()
        if not stats:
            stats = UserStats(user_id=user_id)
            db.add(stats)
            db.commit()
            db.refresh(stats)
        return stats
    
    @staticmethod
    def calculate_level(xp: int) -> int:
        """XP'ye göre seviye hesapla"""
        return 1 + (xp // GamificationService.XP_PER_LEVEL)
    
    @staticmethod
    def calculate_xp_to_next_level(xp: int) -> int:
        """Bir sonraki seviye için gereken XP"""
        current_level = GamificationService.calculate_level(xp)
        next_level_xp = current_level * GamificationService.XP_PER_LEVEL
        return next_level_xp - xp
    
    @staticmethod
    def add_xp(db: Session, user_id: int, amount: int) -> Optional[int]:
        """XP ekle ve seviye atlamasını kontrol et"""
        stats = GamificationService.get_or_create_stats(db, user_id)
        old_level = stats.level
        
        stats.total_xp += amount
        stats.level = GamificationService.calculate_level(stats.total_xp)
        
        db.commit()
        
        if stats.level > old_level:
            return stats.level
        return None
    
    @staticmethod
    def check_achievements(db: Session, user_id: int, stats: UserStats) -> List[Achievement]:
        """Kullanıcının kazanabileceği başarımları kontrol et"""
        all_achievements = db.query(Achievement).all()
        earned_ids = [ua.achievement_id for ua in db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()]
        
        new_achievements = []
        
        for ach in all_achievements:
            if ach.id in earned_ids:
                continue
            
            condition_met = False
            
            if ach.condition_type == "note_count" and stats.total_notes >= ach.condition_value:
                condition_met = True
            elif ach.condition_type == "friend_count" and stats.total_friends >= ach.condition_value:
                condition_met = True
            elif ach.condition_type == "message_count" and stats.total_messages >= ach.condition_value:
                condition_met = True
            elif ach.condition_type == "room_created" and stats.total_rooms_created >= ach.condition_value:
                condition_met = True
            elif ach.condition_type == "login_days" and stats.total_login_days >= ach.condition_value:
                condition_met = True
            
            if condition_met:
                user_ach = UserAchievement(user_id=user_id, achievement_id=ach.id)
                db.add(user_ach)
                GamificationService.add_xp(db, user_id, ach.xp_reward)
                new_achievements.append(ach)
        
        if new_achievements:
            db.commit()
        
        return new_achievements
    
    @staticmethod
    def increment_note_count(db: Session, user_id: int):
        """Not sayısını artır"""
        stats = GamificationService.get_or_create_stats(db, user_id)
        stats.total_notes += 1
        db.commit()
        return GamificationService.check_achievements(db, user_id, stats)
    
    @staticmethod
    def increment_message_count(db: Session, user_id: int):
        """Mesaj sayısını artır"""
        stats = GamificationService.get_or_create_stats(db, user_id)
        stats.total_messages += 1
        db.commit()
        return GamificationService.check_achievements(db, user_id, stats)
    
    @staticmethod
    def increment_friend_count(db: Session, user_id: int):
        """Arkadaş sayısını artır"""
        stats = GamificationService.get_or_create_stats(db, user_id)
        stats.total_friends += 1
        db.commit()
        return GamificationService.check_achievements(db, user_id, stats)
    
    @staticmethod
    def increment_room_created(db: Session, user_id: int):
        """Oluşturulan oda sayısını artır"""
        stats = GamificationService.get_or_create_stats(db, user_id)
        stats.total_rooms_created += 1
        db.commit()
        return GamificationService.check_achievements(db, user_id, stats)
    
    @staticmethod
    def record_login(db: Session, user_id: int):
        """Giriş yapma gününü kaydet"""
        stats = GamificationService.get_or_create_stats(db, user_id)
        today = datetime.now().date()
        
        if stats.last_login_date:
            last_date = stats.last_login_date.date() if hasattr(stats.last_login_date, 'date') else stats.last_login_date
            if last_date != today:
                stats.total_login_days += 1
        else:
            stats.total_login_days = 1
        
        stats.last_login_date = datetime.now()
        db.commit()
        return GamificationService.check_achievements(db, user_id, stats)
