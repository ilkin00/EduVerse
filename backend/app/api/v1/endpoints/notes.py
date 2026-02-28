from jose import JWTError, jwt
from app.core.config import settings
from fastapi import APIRouter, Depends, HTTPException, status, Query, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.core.database import get_db
from app.models.user import User
from app.models.note import Note
from app.models.file import File  # ⭐ YENİ IMPORT
from app.schemas.note import NoteCreate, NoteUpdate, NoteResponse, NoteType, DrawingValidationResponse
from app.api.v1.endpoints.auth import oauth2_scheme
from app.services.file_service import base64_validator

router = APIRouter()

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Geçersiz token",
                headers={"WWW-Authenticate": "Bearer"},
            )
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Geçersiz token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Kullanıcı bulunamadı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

@router.get("/", response_model=List[NoteResponse])
def read_notes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    note_type: Optional[NoteType] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kullanıcının notlarını listele (opsiyonel tip filtresi ile)"""
    query = db.query(Note).filter(Note.user_id == current_user.id)
    
    if note_type:
        query = query.filter(Note.note_type == note_type)
    
    notes = query.order_by(Note.created_at.desc()).offset(skip).limit(limit).all()
    return notes

@router.post("/", response_model=NoteResponse)
def create_note(
    note: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Yeni not oluştur"""
    
    # Drawing notu için base64 validation
    if note.note_type == NoteType.DRAWING and note.content:
        is_valid, img_format, size_kb = base64_validator.validate_base64(note.content)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Geçersiz base64 resim. Format: {img_format}, Boyut: {size_kb:.2f}KB"
            )
    
    db_note = Note(
        **note.model_dump(),
        user_id=current_user.id
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

# ⭐ YENİ: Sesli not oluşturma endpoint'i
@router.post("/audio", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
def create_audio_note(
    title: str = Form(...),
    file_id: int = Form(...),
    duration: int = Form(...),
    is_public: bool = Form(False),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Sesli not oluştur (önceden yüklenmiş dosya ile)
    - Önce /files/upload ile dosya yüklenir
    - Sonra bu endpoint ile not oluşturulur
    """
    # Dosya kontrolü
    file_record = db.query(File).filter(
        File.id == file_id,
        File.user_id == current_user.id
    ).first()
    
    if not file_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dosya bulunamadı"
        )
    
    # Metadata oluştur
    metadata = {
        "fileId": file_id,
        "duration": duration,
        "fileName": file_record.filename,
        "fileSize": file_record.file_size,
        "mimeType": file_record.mime_type
    }
    
    # Notu oluştur
    db_note = Note(
        title=title,
        content=json.dumps(metadata),
        note_type=NoteType.AUDIO,
        is_public=is_public,
        user_id=current_user.id
    )
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    
    return db_note

@router.get("/{note_id}", response_model=NoteResponse)
def read_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Not detayını getir"""
    note = db.query(Note).filter(
        Note.id == note_id, 
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Not bulunamadı")
    return note

@router.put("/{note_id}", response_model=NoteResponse)
def update_note(
    note_id: int,
    note_update: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Not güncelle"""
    note = db.query(Note).filter(
        Note.id == note_id, 
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Not bulunamadı")
    
    # Eğer drawing notu ve content güncelleniyorsa
    if note.note_type == NoteType.DRAWING and note_update.content:
        is_valid, img_format, size_kb = base64_validator.validate_base64(note_update.content)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Geçersiz base64 resim. Format: {img_format}, Boyut: {size_kb:.2f}KB"
            )
    
    for key, value in note_update.model_dump(exclude_unset=True).items():
        setattr(note, key, value)
    
    db.commit()
    db.refresh(note)
    return note

@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Not sil"""
    note = db.query(Note).filter(
        Note.id == note_id, 
        Note.user_id == current_user.id
    ).first()
    
    if not note:
        raise HTTPException(status_code=404, detail="Not bulunamadı")
    
    db.delete(note)
    db.commit()
    return None

# Drawing validation endpoint
@router.post("/validate-drawing", response_model=DrawingValidationResponse)
def validate_drawing(
    data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Base64 drawing verisini validate et
    """
    base64_data = data.get("data", "")
    if not base64_data:
        return DrawingValidationResponse(valid=False, error="Veri boş")
    
    is_valid, img_format, size_kb = base64_validator.validate_base64(base64_data)
    
    if is_valid:
        info = base64_validator.get_image_info(base64_data)
        return DrawingValidationResponse(
            valid=True,
            format=img_format,
            size_kb=size_kb
        )
    else:
        return DrawingValidationResponse(
            valid=False,
            error=f"Geçersiz format: {img_format}"
        )
