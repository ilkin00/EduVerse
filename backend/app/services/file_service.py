import os
import aiofiles
from pathlib import Path
from fastapi import UploadFile, HTTPException
from PIL import Image
import uuid

UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Alt klasörler
IMAGES_DIR = UPLOAD_DIR / "images"
DOCUMENTS_DIR = UPLOAD_DIR / "documents"
AUDIO_DIR = UPLOAD_DIR / "audio"
VIDEO_DIR = UPLOAD_DIR / "video"
OTHER_DIR = UPLOAD_DIR / "other"

for dir_path in [IMAGES_DIR, DOCUMENTS_DIR, AUDIO_DIR, VIDEO_DIR, OTHER_DIR]:
    dir_path.mkdir(exist_ok=True)

# Desteklenen dosya uzantıları
ALLOWED_EXTENSIONS = {
    'image': ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'],
    'document': ['.pdf', '.doc', '.docx', '.txt', '.md', '.rtf', '.xls', '.xlsx', '.ppt', '.pptx', '.json', '.xml', '.csv'],
    'audio': ['.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac'],
    'video': ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.flv']
}

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB

def get_file_type(filename: str) -> str:
    """Dosya uzantısına göre tip belirle"""
    ext = os.path.splitext(filename)[1].lower()
    
    for file_type, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return file_type
    return "other"

class FileService:
    @staticmethod
    async def save_upload_file(upload_file: UploadFile, user_id: int) -> dict:
        # Dosya adı kontrolü
        if not upload_file.filename:
            raise HTTPException(status_code=400, detail="Dosya adı boş olamaz")
        
        # Dosya boyutu kontrolü
        try:
            content = await upload_file.read()
            file_size = len(content)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Dosya okunamadı: {str(e)}")
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400, 
                detail=f"Dosya çok büyük. Maksimum: {MAX_FILE_SIZE/1024/1024:.0f}MB"
            )
        
        if file_size == 0:
            raise HTTPException(status_code=400, detail="Dosya boş")
        
        # Dosya tipini belirle
        file_type = get_file_type(upload_file.filename)
        file_ext = os.path.splitext(upload_file.filename)[1].lower()
        
        # Benzersiz dosya adı oluştur
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        
        # Klasör seç
        if file_type == 'image':
            save_dir = IMAGES_DIR
        elif file_type == 'document':
            save_dir = DOCUMENTS_DIR
        elif file_type == 'audio':
            save_dir = AUDIO_DIR
        elif file_type == 'video':
            save_dir = VIDEO_DIR
        else:
            save_dir = OTHER_DIR
        
        # Kullanıcıya özel alt klasör
        user_dir = save_dir / str(user_id)
        user_dir.mkdir(exist_ok=True)
        
        # Dosyayı kaydet
        file_path = user_dir / unique_filename
        try:
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(content)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Dosya kaydedilemedi: {str(e)}")
        
        # Resimse thumbnail oluştur
        thumbnail_path = None
        if file_type == 'image':
            try:
                img = Image.open(file_path)
                # Çok büyük resimleri küçült
                img.thumbnail((300, 300))
                thumb_dir = user_dir / "thumbnails"
                thumb_dir.mkdir(exist_ok=True)
                thumb_path = thumb_dir / f"thumb_{unique_filename}"
                img.save(thumb_path, optimize=True, quality=85)
                thumbnail_path = str(thumb_path)
            except Exception as e:
                print(f"Thumbnail oluşturulamadı: {e}")
        
        return {
            "filename": unique_filename,
            "original_filename": upload_file.filename,
            "file_path": str(file_path),
            "file_size": file_size,
            "mime_type": file_type,
            "file_type": file_type,
            "thumbnail_path": thumbnail_path
        }
    
    @staticmethod
    def delete_file(file_path: str):
        """Dosyayı sil"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                
                # Thumbnail varsa sil
                file_dir = os.path.dirname(file_path)
                filename = os.path.basename(file_path)
                thumb_path = os.path.join(file_dir, "thumbnails", f"thumb_{filename}")
                
                if os.path.exists(thumb_path):
                    os.remove(thumb_path)
                    
                return True
        except Exception as e:
            print(f"Dosya silinemedi: {e}")
        return False
