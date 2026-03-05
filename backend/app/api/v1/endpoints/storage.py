from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api import deps
from app.models.user import User
from app.models.note import Note
from app.models.file import File
import os
import shutil
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/usage")
def get_storage_usage(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Depolama kullanımını getir"""
    
    # Notların sayısı ve boyutu
    notes = db.query(Note).filter(Note.user_id == current_user.id).all()
    notes_count = len(notes)
    
    # Dosyaların sayısı ve boyutu
    files = db.query(File).filter(File.user_id == current_user.id).all()
    files_count = len(files)
    files_size = sum(f.file_size for f in files if f.file_size)
    
    # Varsayılan depolama limiti (100 MB)
    storage_limit = 100 * 1024 * 1024  # 100 MB in bytes
    
    return {
        "used": files_size,
        "limit": storage_limit,
        "percentage": (files_size / storage_limit) * 100 if storage_limit > 0 else 0,
        "notes_count": notes_count,
        "files_count": files_count,
        "files_size": files_size,
        "last_updated": datetime.utcnow().isoformat()
    }

@router.post("/clear-cache")
def clear_cache(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Önbelleği temizle"""
    
    # Geçici dosyaları temizle
    temp_dir = f"/tmp/eduverse/{current_user.id}"
    if os.path.exists(temp_dir):
        shutil.rmtree(temp_dir)
    
    # 30 günden eski dosyaları temizle (opsiyonel)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    old_files = db.query(File).filter(
        File.user_id == current_user.id,
        File.created_at < thirty_days_ago,
        File.note_id == None  # Not'a bağlı olmayan dosyalar
    ).all()
    
    for file in old_files:
        if os.path.exists(file.file_path):
            os.remove(file.file_path)
        db.delete(file)
    
    db.commit()
    
    return {"message": "Önbellek temizlendi", "cleaned_files": len(old_files)}

@router.get("/export")
def export_user_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Kullanıcı verilerini dışa aktar"""
    
    # Notları getir
    notes = db.query(Note).filter(Note.user_id == current_user.id).all()
    
    # Dosyaları getir
    files = db.query(File).filter(File.user_id == current_user.id).all()
    
    # Arkadaşlık bilgileri
    from app.models.friendship import Friendship
    friendships = db.query(Friendship).filter(
        (Friendship.user_id == current_user.id) | (Friendship.friend_id == current_user.id)
    ).all()
    
    # Export verisi
    export_data = {
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "full_name": current_user.full_name,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None
        },
        "notes": [
            {
                "id": n.id,
                "title": n.title,
                "note_type": n.note_type,
                "created_at": n.created_at.isoformat() if n.created_at else None
            } for n in notes
        ],
        "files": [
            {
                "id": f.id,
                "filename": f.filename,
                "file_size": f.file_size,
                "created_at": f.created_at.isoformat() if f.created_at else None
            } for f in files
        ],
        "friends_count": len(friendships),
        "exported_at": datetime.utcnow().isoformat()
    }
    
    return export_data

@router.delete("/all-notes", status_code=200)
def delete_all_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Tüm notları sil (tehlikeli işlem)"""
    
    # Notları bul
    notes = db.query(Note).filter(Note.user_id == current_user.id).all()
    note_ids = [n.id for n in notes]
    
    # Notlara ait dosyaları bul ve sil
    files = db.query(File).filter(File.note_id.in_(note_ids)).all()
    for file in files:
        if os.path.exists(file.file_path):
            os.remove(file.file_path)
        db.delete(file)
    
    # Notları sil
    for note in notes:
        db.delete(note)
    
    db.commit()
    
    return {"message": f"{len(notes)} not silindi", "deleted_count": len(notes)}
