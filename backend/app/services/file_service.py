import os
import base64
import aiofiles
from pathlib import Path
from fastapi import UploadFile, HTTPException
from PIL import Image
import uuid
import imghdr
from io import BytesIO
from typing import Optional, Tuple

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
MAX_BASE64_SIZE = 10 * 1024 * 1024  # 10 MB (base64)

def get_file_type(filename: str) -> str:
    """Dosya uzantısına göre tip belirle"""
    ext = os.path.splitext(filename)[1].lower()
    
    for file_type, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return file_type
    return "other"

class Base64Validator:
    """Base64 resim validator"""
    
    @staticmethod
    def validate_base64(base64_string: str) -> Tuple[bool, Optional[str], Optional[float]]:
        """
        Base64 string'i validate et
        Returns: (is_valid, format, size_kb)
        """
        try:
            # data:image/png;base64, kısmını temizle
            if ',' in base64_string:
                header, data = base64_string.split(',', 1)
                # Format kontrolü
                if 'image' in header:
                    img_format = header.split(';')[0].split('/')[-1]
                else:
                    img_format = 'png'
            else:
                data = base64_string
                img_format = 'png'
            
            # Decode et
            image_data = base64.b64decode(data)
            
            # Boyut kontrolü
            size_kb = len(image_data) / 1024
            if size_kb > (MAX_BASE64_SIZE / 1024):
                return False, None, size_kb
            
            # Format kontrolü
            detected_format = imghdr.what(None, h=image_data)
            if detected_format not in ['png', 'jpeg', 'gif', 'webp']:
                return False, detected_format, size_kb
            
            return True, detected_format or img_format, size_kb
            
        except Exception as e:
            print(f"Base64 validation error: {e}")
            return False, None, 0
    
    @staticmethod
    def get_image_info(base64_string: str) -> dict:
        """Base64 resim hakkında bilgi döndür"""
        try:
            if ',' in base64_string:
                header, data = base64_string.split(',', 1)
            else:
                data = base64_string
            
            image_data = base64.b64decode(data)
            size_kb = len(image_data) / 1024
            
            # PIL ile açmayı dene
            try:
                img = Image.open(BytesIO(image_data))
                width, height = img.size
                img_format = img.format.lower()
            except:
                width, height = 0, 0
                img_format = imghdr.what(None, h=image_data)
            
            return {
                "size_kb": round(size_kb, 2),
                "size_mb": round(size_kb / 1024, 2),
                "format": img_format,
                "width": width,
                "height": height,
                "is_base64": True
            }
        except Exception as e:
            return {"error": str(e)}

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

# Singleton instance
base64_validator = Base64Validator()
file_service = FileService()
