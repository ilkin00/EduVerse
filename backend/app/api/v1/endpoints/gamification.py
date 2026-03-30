from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.user import User
from app.models.achievement import Achievement, UserAchievement
from app.schemas.achievement import (
    AchievementResponse, UserAchievementResponse, 
    UserStatsResponse, LevelUpResponse
)
from app.services.gamification_service import GamificationService
from app.api.v1.endpoints.auth import get_current_user

router = APIRouter()

@router.get("/stats", response_model=UserStatsResponse)
def get_user_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kullanıcı istatistiklerini getir"""
    stats = GamificationService.get_or_create_stats(db, current_user.id)
    
    return UserStatsResponse(
        user_id=stats.user_id,
        total_xp=stats.total_xp,
        level=stats.level,
        total_notes=stats.total_notes,
        total_messages=stats.total_messages,
        total_friends=stats.total_friends,
        total_rooms_created=stats.total_rooms_created,
        total_login_days=stats.total_login_days,
        next_level_xp=GamificationService.calculate_level(stats.total_xp) * GamificationService.XP_PER_LEVEL,
        xp_to_next_level=GamificationService.calculate_xp_to_next_level(stats.total_xp)
    )

@router.get("/achievements", response_model=List[AchievementResponse])
def get_all_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Tüm başarımları listele"""
    achievements = db.query(Achievement).all()
    return achievements

@router.get("/my-achievements", response_model=List[UserAchievementResponse])
def get_my_achievements(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kullanıcının kazandığı başarımları listele"""
    user_achievements = db.query(UserAchievement).filter(
        UserAchievement.user_id == current_user.id
    ).all()
    
    result = []
    for ua in user_achievements:
        ach = db.query(Achievement).filter(Achievement.id == ua.achievement_id).first()
        if ach:
            result.append(UserAchievementResponse(
                id=ua.id,
                user_id=ua.user_id,
                achievement_id=ach.id,
                achievement_name=ach.name,
                achievement_description=ach.description,
                badge_icon=ach.badge_icon,
                xp_reward=ach.xp_reward,
                earned_at=ua.earned_at
            ))
    
    return result

@router.get("/leaderboard")
def get_leaderboard(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Liderlik tablosu (XP bazlı)"""
    stats = db.query(UserStats).order_by(UserStats.total_xp.desc()).limit(limit).all()
    
    result = []
    for idx, stat in enumerate(stats):
        user = db.query(User).filter(User.id == stat.user_id).first()
        if user:
            result.append({
                "rank": idx + 1,
                "user_id": user.id,
                "username": user.username,
                "avatar": user.avatar,
                "total_xp": stat.total_xp,
                "level": stat.level
            })
    
    return result
