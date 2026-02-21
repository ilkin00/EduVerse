from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Base User
class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = None

# Create User
class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

# Update User
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    password: Optional[str] = None

# User in DB
class UserInDB(UserBase):
    id: int
    is_active: bool
    role: str
    subscription_tier: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# User Response
class UserResponse(UserInDB):
    pass

# Token
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
