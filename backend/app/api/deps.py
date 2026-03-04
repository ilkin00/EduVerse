from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user as auth_get_current_user

# OAuth2 scheme - auth.py'deki ile aynı
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")

def get_db() -> Generator:
    """
    Database session dependency
    """
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

# auth.py'deki get_current_user'ı re-export et
get_current_user = auth_get_current_user

# Aktif kullanıcı kontrolü
def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Aktif kullanıcı kontrolü
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user
