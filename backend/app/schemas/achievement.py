from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AchievementBase(BaseModel):
    name: str
    description: str
    badge_icon: Optional[str] = None
    xp_reward: int = 10
    condition_type: str
    condition_value: int

class AchievementResponse(AchievementBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserAchievementResponse(BaseModel):
    id: int
    user_id: int
    achievement_id: int
    achievement_name: str
    achievement_description: str
    badge_icon: Optional[str]
    xp_reward: int
    earned_at: datetime
    
    class Config:
        from_attributes = True

class UserStatsResponse(BaseModel):
    user_id: int
    total_xp: int
    level: int
    total_notes: int
    total_messages: int
    total_friends: int
    total_rooms_created: int
    total_login_days: int
    next_level_xp: int
    xp_to_next_level: int
    
    class Config:
        from_attributes = True

class LevelUpResponse(BaseModel):
    old_level: int
    new_level: int
    message: str
