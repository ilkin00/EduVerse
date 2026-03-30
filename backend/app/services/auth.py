from datetime import datetime, timedelta
from typing import Optional
import uuid
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.user import User
from app.models.session import UserSession
from app.schemas.user import UserCreate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
        user = db.query(User).filter(User.username == username).first()
        if not user or not AuthService.verify_password(password, user.hashed_password):
            return None
        return user
    
    @staticmethod
    def create_user(db: Session, user: UserCreate) -> User:
        db_user = User(
            email=user.email,
            username=user.username,
            full_name=user.full_name,
            hashed_password=AuthService.get_password_hash(user.password)
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def create_refresh_token(db: Session, user_id: int, device_name: str = None, ip_address: str = None) -> str:
        """Yeni refresh token oluştur"""
        session_token = str(uuid.uuid4())
        expires_at = datetime.utcnow() + timedelta(days=7)
        
        user_session = UserSession(
            user_id=user_id,
            session_token=session_token,
            device_name=device_name,
            ip_address=ip_address,
            device_type="web",
            expires_at=expires_at
        )
        db.add(user_session)
        db.commit()
        return session_token
    
    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> Optional[str]:
        """Refresh token ile yeni access token oluştur"""
        session = db.query(UserSession).filter(
            UserSession.session_token == refresh_token,
            UserSession.is_active == True,
            UserSession.expires_at > datetime.utcnow()
        ).first()
        
        if not session:
            return None
        
        session.last_active = datetime.utcnow()
        db.commit()
        
        user = db.query(User).filter(User.id == session.user_id).first()
        if not user:
            return None
        
        return AuthService.create_access_token(data={"sub": user.username})
    
    @staticmethod
    def revoke_refresh_token(db: Session, refresh_token: str):
        """Refresh token'ı iptal et (çıkış yapınca)"""
        session = db.query(UserSession).filter(
            UserSession.session_token == refresh_token
        ).first()
        
        if session:
            session.is_active = False
            db.commit()
    
    @staticmethod
    def revoke_all_user_sessions(db: Session, user_id: int):
        """Kullanıcının tüm oturumlarını iptal et"""
        db.query(UserSession).filter(
            UserSession.user_id == user_id,
            UserSession.is_active == True
        ).update({"is_active": False})
        db.commit()
