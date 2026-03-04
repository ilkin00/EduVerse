from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc
from typing import List
from app.core.database import get_db
from app.api import deps
from app.models.user import User
from app.models.message import Message
from app.models.block import Block
from app.schemas.chat import (
    MessageResponse, MessageCreate, ChatListItem, UnreadCountResponse
)
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[ChatListItem])
def get_chat_list(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Sohbet listesi"""
    current_user_id = current_user.id
    
    # Mesajlaşılan kullanıcıları bul
    sent = db.query(Message.receiver_id).filter(Message.sender_id == current_user_id).distinct()
    received = db.query(Message.sender_id).filter(Message.receiver_id == current_user_id).distinct()
    user_ids = set([r[0] for r in sent.all()] + [r[0] for r in received.all()])
    
    result = []
    for uid in user_ids:
        # Engellenme kontrolü
        blocked = db.query(Block).filter(
            or_(
                and_(Block.user_id == current_user_id, Block.blocked_user_id == uid),
                and_(Block.user_id == uid, Block.blocked_user_id == current_user_id)
            )
        ).first()
        if blocked:
            continue
        
        user = db.query(User).filter(User.id == uid).first()
        if not user:
            continue
        
        last_msg = db.query(Message).filter(
            or_(
                and_(Message.sender_id == current_user_id, Message.receiver_id == uid),
                and_(Message.sender_id == uid, Message.receiver_id == current_user_id)
            )
        ).order_by(desc(Message.created_at)).first()
        
        unread = db.query(Message).filter(
            Message.sender_id == uid,
            Message.receiver_id == current_user_id,
            Message.is_read == False
        ).count()
        
        result.append(ChatListItem(
            user=user,
            last_message=last_msg.content if last_msg else None,
            last_message_time=last_msg.created_at if last_msg else None,
            unread_count=unread
        ))
    
    return result

@router.get("/{user_id}", response_model=List[MessageResponse])
def get_chat_history(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    Mesaj geçmişi - EN ESKİDEN EN YENİYE sıralı
    (FlatList'te ters çevirmeye gerek yok, direkt göster)
    """
    current_user_id = current_user.id
    
    # Engellenme kontrolü
    blocked = db.query(Block).filter(
        or_(
            and_(Block.user_id == current_user_id, Block.blocked_user_id == user_id),
            and_(Block.user_id == user_id, Block.blocked_user_id == current_user_id)
        )
    ).first()
    if blocked:
        raise HTTPException(status_code=403, detail="Bu kullanıcı ile mesajlaşamazsınız")
    
    # ASC sıralama - en eskiden en yeniye (altta yeni mesajlar)
    messages = db.query(Message).filter(
        or_(
            and_(Message.sender_id == current_user_id, Message.receiver_id == user_id),
            and_(Message.sender_id == user_id, Message.receiver_id == current_user_id)
        )
    ).order_by(asc(Message.created_at)).offset(offset).limit(limit).all()  # ASC!
    
    return messages

@router.post("/{user_id}", response_model=MessageResponse)
def send_message(
    user_id: int,
    message: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Mesaj gönder"""
    current_user_id = current_user.id
    
    # Engellenme kontrolü
    blocked = db.query(Block).filter(
        or_(
            and_(Block.user_id == current_user_id, Block.blocked_user_id == user_id),
            and_(Block.user_id == user_id, Block.blocked_user_id == current_user_id)
        )
    ).first()
    if blocked:
        raise HTTPException(status_code=403, detail="Bu kullanıcıya mesaj gönderemezsiniz")
    
    new_msg = Message(
        sender_id=current_user_id,
        receiver_id=user_id,
        content=message.content,
        message_type=message.message_type,
        file_url=message.file_url
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    return new_msg

@router.put("/read/{message_id}")
def mark_as_read(
    message_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Mesajı okundu işaretle"""
    current_user_id = current_user.id
    
    message = db.query(Message).filter(
        Message.id == message_id,
        Message.receiver_id == current_user_id
    ).first()
    if not message:
        raise HTTPException(status_code=404, detail="Mesaj bulunamadı")
    
    message.is_read = True
    message.read_at = datetime.utcnow()
    db.commit()
    return {"message": "Okundu işaretlendi"}

@router.get("/unread/count", response_model=UnreadCountResponse)
def get_unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)
):
    """Okunmamış mesaj sayısı"""
    current_user_id = current_user.id
    
    count = db.query(Message).filter(
        Message.receiver_id == current_user_id,
        Message.is_read == False
    ).count()
    return {"count": count}
