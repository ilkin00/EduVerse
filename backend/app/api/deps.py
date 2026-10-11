from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from app.core.database import SessionLocal
from app.core.config import settings
from app.models.user import User
from app.api.v1.endpoints.auth import get_current_user as auth_get_current_user

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/auth/login")


def get_db() -> Generator:
    """
    Sync database session dependency (mevcut endpoint'ler için)
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# auth.py'deki get_current_user'ı re-export et
get_current_user = auth_get_current_user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """Aktif kullanıcı kontrolü"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    return current_user


def decode_token(token: str) -> int | None:
    """
    JWT token'dan user_id'yi çıkar (username -> user.id).
    WebSocket için gerekli.
    """
    if not token:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        username = payload.get("sub")
        if not username:
            return None

        db: Session = SessionLocal()
        try:
            user = db.query(User).filter(User.username == username).first()
            return user.id if user else None
        finally:
            db.close()
    except JWTError:
        return None
