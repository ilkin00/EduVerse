from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import Optional, List
import os
from app.core.database import get_db
from app.models.user import User
from app.models.file import File as FileModel
from app.models.note import Note
from app.schemas.file import FileResponse, FileCreate
from app.api.v1.endpoints.auth import get_current_user
from app.services.file_service import FileService, UPLOAD_DIR
from fastapi.responses import FileResponse as FastAPIFileResponse
import shutil

router = APIRouter()

@router.post("/upload", response_model=FileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    note_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dosya yükle"""
    
    # Dosya adı kontrolü
    if not file.filename:
        raise HTTPException(status_code=400, detail="Dosya adı boş olamaz")
    
    # Note kontrolü (eğer note_id verilmişse)
    if note_id:
        note = db.query(Note).filter(Note.id == note_id).first()
        if not note:
            raise HTTPException(status_code=404, detail="Not bulunamadı")
        if note.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Bu nota dosya ekleme yetkiniz yok")
    
    # Dosyayı kaydet
    try:
        file_info = await FileService.save_upload_file(file, current_user.id)
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dosya kaydedilemedi: {str(e)}")
    
    # Veritabanına kaydet
    db_file = FileModel(
        filename=file_info["filename"],
        original_filename=file_info["original_filename"],
        file_path=file_info["file_path"],
        file_size=file_info["file_size"],
        mime_type=file_info["mime_type"],
        file_type=file_info["file_type"],
        note_id=note_id,
        user_id=current_user.id
    )
    
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    return db_file

@router.get("/", response_model=List[FileResponse])
def get_my_files(
    skip: int = 0,
    limit: int = 100,
    file_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kullanıcının dosyalarını listele"""
    query = db.query(FileModel).filter(FileModel.user_id == current_user.id)
    
    if file_type:
        query = query.filter(FileModel.file_type == file_type)
    
    files = query.order_by(FileModel.created_at.desc()).offset(skip).limit(limit).all()
    return files

@router.get("/note/{note_id}", response_model=List[FileResponse])
def get_note_files(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Nota ait dosyaları listele"""
    note = db.query(Note).filter(Note.id == note_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Not bulunamadı")
    
    # Yetki kontrolü
    if note.user_id != current_user.id and not note.is_public:
        raise HTTPException(status_code=403, detail="Bu notu görüntüleme yetkiniz yok")
    
    files = db.query(FileModel).filter(FileModel.note_id == note_id).all()
    return files

@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dosya sil"""
    file = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="Dosya bulunamadı")
    
    # Yetki kontrolü
    if file.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu dosyayı silme yetkiniz yok")
    
    # Fiziksel dosyayı sil
    FileService.delete_file(file.file_path)
    
    # Veritabanından sil
    db.delete(file)
    db.commit()
    
    return None

@router.get("/download/{file_id}")
async def download_file(
    file_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Dosya indir"""
    
    file = db.query(FileModel).filter(FileModel.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="Dosya bulunamadı")
    
    # Yetki kontrolü
    if file.user_id != current_user.id:
        # Not üzerinden kontrol et
        if file.note_id:
            note = db.query(Note).filter(Note.id == file.note_id).first()
            if not note or (note.user_id != current_user.id and not note.is_public):
                raise HTTPException(status_code=403, detail="Bu dosyayı indirme yetkiniz yok")
        else:
            raise HTTPException(status_code=403, detail="Bu dosyayı indirme yetkiniz yok")
    
    if not os.path.exists(file.file_path):
        raise HTTPException(status_code=404, detail="Dosya fiziksel olarak bulunamadı")
    
    return FastAPIFileResponse(
        path=file.file_path,
        filename=file.original_filename,
        media_type="application/octet-stream"
    )
