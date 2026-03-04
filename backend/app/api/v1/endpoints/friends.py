from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from typing import List, Optional
from app.core.database import get_db
from app.api import deps  # YENİ
from app.models.user import User
from app.models.friendship import Friendship, FriendshipStatus
from app.models.block import Block
from app.schemas.friendship import (
    FriendWithStatusSchema, FriendshipRequestSchema,
    BlockResponseSchema, FriendStatusResponse
)

router = APIRouter()

@router.get("/", response_model=List[FriendWithStatusSchema])
def get_friends(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user),  # DÜZELTİLDİ
    search: Optional[str] = Query(None, min_length=1, max_length=50)
):
    """Arkadaş listesi"""
    current_user_id = current_user.id
    
    friendships = db.query(Friendship).filter(
        or_(
            and_(Friendship.user_id == current_user_id, Friendship.friend_id != current_user_id),
            and_(Friendship.friend_id == current_user_id, Friendship.user_id != current_user_id)
        ),
        Friendship.status == FriendshipStatus.ACCEPTED
    ).all()
    
    result = []
    for f in friendships:
        friend_id = f.friend_id if f.user_id == current_user_id else f.user_id
        friend = db.query(User).filter(User.id == friend_id).first()
        if friend:
            result.append(FriendWithStatusSchema(
                user=friend,
                friendship_id=f.id,
                status=f.status,
                created_at=f.created_at,
                is_requester=(f.requester_id == current_user_id)
            ))
    return result

@router.get("/requests", response_model=List[FriendshipRequestSchema])
def get_friend_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)  # DÜZELTİLDİ
):
    """Gelen arkadaşlık istekleri"""
    current_user_id = current_user.id
    
    requests = db.query(Friendship).filter(
        Friendship.friend_id == current_user_id,
        Friendship.status == FriendshipStatus.PENDING
    ).all()
    
    result = []
    for req in requests:
        requester = db.query(User).filter(User.id == req.requester_id).first()
        if requester:
            result.append(FriendshipRequestSchema(
                id=req.id,
                user=requester,
                created_at=req.created_at
            ))
    return result

@router.get("/requests/sent", response_model=List[FriendshipRequestSchema])
def get_sent_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)  # YENİ
):
    """Gönderilen arkadaşlık istekleri"""
    current_user_id = current_user.id
    
    requests = db.query(Friendship).filter(
        Friendship.requester_id == current_user_id,
        Friendship.status == FriendshipStatus.PENDING
    ).all()
    
    result = []
    for req in requests:
        friend_id = req.friend_id if req.user_id == current_user_id else req.user_id
        friend = db.query(User).filter(User.id == friend_id).first()
        if friend:
            result.append(FriendshipRequestSchema(
                id=req.id,
                user=friend,
                created_at=req.created_at
            ))
    return result

@router.post("/request/{user_id}", status_code=status.HTTP_201_CREATED)
def send_friend_request(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)  # DÜZELTİLDİ
):
    """Arkadaşlık isteği gönder"""
    current_user_id = current_user.id
    
    if current_user_id == user_id:
        raise HTTPException(status_code=400, detail="Kendinize istek gönderemezsiniz")
    
    # Engellenme kontrolü
    blocked = db.query(Block).filter(
        or_(
            and_(Block.user_id == current_user_id, Block.blocked_user_id == user_id),
            and_(Block.user_id == user_id, Block.blocked_user_id == current_user_id)
        )
    ).first()
    if blocked:
        raise HTTPException(status_code=400, detail="Bu kullanıcı ile arkadaşlık kuramazsınız")
    
    existing = db.query(Friendship).filter(
        or_(
            and_(Friendship.user_id == current_user_id, Friendship.friend_id == user_id),
            and_(Friendship.user_id == user_id, Friendship.friend_id == current_user_id)
        )
    ).first()
    
    if existing:
        if existing.status == FriendshipStatus.ACCEPTED:
            raise HTTPException(status_code=400, detail="Zaten arkadaşsınız")
        elif existing.status == FriendshipStatus.PENDING:
            raise HTTPException(status_code=400, detail="Zaten bekleyen istek var")
    
    friendship = Friendship(
        user_id=current_user_id,
        friend_id=user_id,
        requester_id=current_user_id,
        status=FriendshipStatus.PENDING
    )
    db.add(friendship)
    db.commit()
    return {"message": "İstek gönderildi"}

@router.post("/accept/{request_id}")
def accept_friend_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)  # DÜZELTİLDİ
):
    """İsteği kabul et"""
    current_user_id = current_user.id
    
    friendship = db.query(Friendship).filter(
        Friendship.id == request_id,
        Friendship.friend_id == current_user_id,
        Friendship.status == FriendshipStatus.PENDING
    ).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="İstek bulunamadı")
    
    friendship.status = FriendshipStatus.ACCEPTED
    db.commit()
    return {"message": "İstek kabul edildi"}

@router.post("/reject/{request_id}")
def reject_friend_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)  # DÜZELTİLDİ
):
    """İsteği reddet"""
    current_user_id = current_user.id
    
    friendship = db.query(Friendship).filter(
        Friendship.id == request_id,
        Friendship.friend_id == current_user_id,
        Friendship.status == FriendshipStatus.PENDING
    ).first()
    if not friendship:
        raise HTTPException(status_code=404, detail="İstek bulunamadı")
    
    friendship.status = FriendshipStatus.REJECTED
    db.commit()
    return {"message": "İstek reddedildi"}

@router.post("/block/{user_id}")
def block_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)  # DÜZELTİLDİ
):
    """Kullanıcıyı engelle"""
    current_user_id = current_user.id
    
    if current_user_id == user_id:
        raise HTTPException(status_code=400, detail="Kendinizi engelleyemezsiniz")
    
    existing = db.query(Block).filter(
        Block.user_id == current_user_id,
        Block.blocked_user_id == user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Zaten engellenmiş")
    
    # Varsa arkadaşlığı sil
    friendship = db.query(Friendship).filter(
        or_(
            and_(Friendship.user_id == current_user_id, Friendship.friend_id == user_id),
            and_(Friendship.user_id == user_id, Friendship.friend_id == current_user_id)
        )
    ).first()
    if friendship:
        db.delete(friendship)
    
    block = Block(user_id=current_user_id, blocked_user_id=user_id)
    db.add(block)
    db.commit()
    return {"message": "Kullanıcı engellendi"}

@router.post("/unblock/{user_id}")
def unblock_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)  # DÜZELTİLDİ
):
    """Engeli kaldır"""
    current_user_id = current_user.id
    
    block = db.query(Block).filter(
        Block.user_id == current_user_id,
        Block.blocked_user_id == user_id
    ).first()
    if not block:
        raise HTTPException(status_code=404, detail="Engel bulunamadı")
    
    db.delete(block)
    db.commit()
    return {"message": "Engel kaldırıldı"}

@router.get("/search")
def search_users(
    q: str = Query(..., min_length=2),
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)  # DÜZELTİLDİ
):
    """Kullanıcı ara"""
    current_user_id = current_user.id
    
    users = db.query(User).filter(
        User.id != current_user_id,
        User.is_active == True,
        or_(
            User.username.ilike(f"%{q}%"),
            User.full_name.ilike(f"%{q}%")
        )
    ).limit(20).all()
    
    result = []
    for user in users:
        friendship = db.query(Friendship).filter(
            or_(
                and_(Friendship.user_id == current_user_id, Friendship.friend_id == user.id),
                and_(Friendship.user_id == user.id, Friendship.friend_id == current_user_id)
            )
        ).first()
        
        blocked = db.query(Block).filter(
            or_(
                and_(Block.user_id == current_user_id, Block.blocked_user_id == user.id),
                and_(Block.user_id == user.id, Block.blocked_user_id == current_user_id)
            )
        ).first()
        
        result.append({
            "user": user,
            "friendship_status": friendship.status if friendship else None,
            "is_blocked": blocked is not None
        })
    return result

@router.get("/status/{user_id}", response_model=FriendStatusResponse)
def get_friend_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(deps.get_current_user)  # DÜZELTİLDİ
):
    """Arkadaşlık durumu"""
    current_user_id = current_user.id
    
    if current_user_id == user_id:
        return {"status": "self"}
    
    friendship = db.query(Friendship).filter(
        or_(
            and_(Friendship.user_id == current_user_id, Friendship.friend_id == user_id),
            and_(Friendship.user_id == user_id, Friendship.friend_id == current_user_id)
        )
    ).first()
    
    blocked_by_me = db.query(Block).filter(
        Block.user_id == current_user_id,
        Block.blocked_user_id == user_id
    ).first()
    
    blocked_me = db.query(Block).filter(
        Block.user_id == user_id,
        Block.blocked_user_id == current_user_id
    ).first()
    
    if blocked_by_me:
        return {"status": "blocked_by_me"}
    if blocked_me:
        return {"status": "blocked_me"}
    if friendship:
        if friendship.status == FriendshipStatus.ACCEPTED:
            return {"status": "friends", "friendship_id": friendship.id}
        elif friendship.status == FriendshipStatus.PENDING:
            is_requester = (friendship.requester_id == current_user_id)
            return {
                "status": "pending_sent" if is_requester else "pending_received",
                "friendship_id": friendship.id
            }
    return {"status": "none"}
