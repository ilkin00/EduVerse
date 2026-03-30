from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json
from app.core.database import get_db
from app.core.config import settings
from app.models.user import User
from app.models.room import Room, RoomParticipant
from app.schemas.room import RoomCreate, RoomUpdate, RoomResponse, RoomParticipantResponse, RoleUpdate, MuteUpdate
from app.api.v1.endpoints.auth import get_current_user, oauth2_scheme

router = APIRouter()

def get_user_role(room_id: int, user_id: int, db: Session) -> str:
    """Kullanıcının odadaki rolünü döndür"""
    participant = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == user_id
    ).first()
    return participant.role if participant else "guest"

# WebSocket manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, List[WebSocket]] = {}
    
    async def connect(self, websocket: WebSocket, room_id: int):
        await websocket.accept()
        if room_id not in self.active_connections:
            self.active_connections[room_id] = []
        self.active_connections[room_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, room_id: int):
        if room_id in self.active_connections:
            self.active_connections[room_id].remove(websocket)
    
    async def broadcast(self, message: dict, room_id: int):
        if room_id in self.active_connections:
            for connection in self.active_connections[room_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass

manager = ConnectionManager()

# ============ REST API Endpoints ============

@router.get("/", response_model=List[RoomResponse])
def read_rooms(
    skip: int = 0,
    limit: int = 100,
    room_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Odaları listele"""
    query = db.query(Room).filter(Room.is_active == True)
    if room_type:
        query = query.filter(Room.room_type == room_type)
    
    rooms = query.offset(skip).limit(limit).all()
    
    for room in rooms:
        room.participant_count = db.query(RoomParticipant).filter(
            RoomParticipant.room_id == room.id,
            RoomParticipant.is_banned == False
        ).count()
    
    return rooms

@router.post("/", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    room: RoomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Yeni oda oluştur"""
    db_room = Room(
        **room.model_dump(),
        owner_id=current_user.id
    )
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    
    participant = RoomParticipant(
        room_id=db_room.id,
        user_id=current_user.id,
        role="owner"
    )
    db.add(participant)
    db.commit()
    
    db_room.participant_count = 1
    return db_room

@router.get("/{room_id}", response_model=RoomResponse)
def read_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Oda detayı"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")
    
    room.participant_count = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.is_banned == False
    ).count()
    return room

@router.put("/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    room_update: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Oda güncelle"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")
    
    user_role = get_user_role(room_id, current_user.id, db)
    if user_role not in ["owner", "admin"]:
        raise HTTPException(status_code=403, detail="Bu odayı güncelleme yetkiniz yok")
    
    for key, value in room_update.model_dump(exclude_unset=True).items():
        setattr(room, key, value)
    
    db.commit()
    db.refresh(room)
    return room

@router.delete("/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Oda sil - Sadece owner silebilir"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")
    
    if room.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu odayı silme yetkiniz yok")
    
    db.delete(room)
    db.commit()

@router.post("/{room_id}/join")
def join_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Odaya katıl"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")
    
    if not room.is_active:
        raise HTTPException(status_code=400, detail="Bu oda aktif değil")
    
    banned = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == current_user.id,
        RoomParticipant.is_banned == True
    ).first()
    if banned:
        raise HTTPException(status_code=403, detail="Bu odadan engellendiniz")
    
    current_count = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.is_banned == False
    ).count()
    if current_count >= room.max_participants:
        raise HTTPException(status_code=400, detail="Oda maksimum kapasiteye ulaştı")
    
    existing = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == current_user.id
    ).first()
    
    if not existing:
        participant = RoomParticipant(
            room_id=room_id,
            user_id=current_user.id,
            role="member"
        )
        db.add(participant)
        db.commit()
        return {"message": "Odaya katıldınız", "room_id": room_id}
    else:
        return {"message": "Zaten bu odadasınız", "room_id": room_id}

@router.post("/{room_id}/leave")
def leave_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Odadan ayrıl"""
    participant = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == current_user.id
    ).first()
    
    if participant:
        if participant.role == "owner":
            new_owner = db.query(RoomParticipant).filter(
                RoomParticipant.room_id == room_id,
                RoomParticipant.user_id != current_user.id,
                RoomParticipant.is_banned == False
            ).first()
            
            if new_owner:
                new_owner.role = "owner"
        
        db.delete(participant)
        db.commit()
        return {"message": "Odadan ayrıldınız"}
    
    return {"message": "Zaten odada değilsiniz"}

@router.get("/{room_id}/participants", response_model=List[RoomParticipantResponse])
def get_participants(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Odadaki katılımcıları listele"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")
    
    participants = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.is_banned == False
    ).all()
    
    for p in participants:
        user = db.query(User).filter(User.id == p.user_id).first()
        p.username = user.username if user else None
    
    return participants

@router.put("/{room_id}/role/{user_id}")
def update_user_role(
    room_id: int,
    user_id: int,
    role_update: RoleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kullanıcının rolünü değiştir"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")
    
    user_role = get_user_role(room_id, current_user.id, db)
    
    if user_role == "owner":
        pass
    elif user_role == "admin" and role_update.role in ["moderator", "member", "guest"]:
        pass
    else:
        raise HTTPException(status_code=403, detail="Rol değiştirme yetkiniz yok")
    
    target = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == user_id
    ).first()
    
    if not target:
        raise HTTPException(status_code=404, detail="Kullanıcı odada bulunamadı")
    
    target.role = role_update.role
    db.commit()
    
    return {"message": f"Kullanıcı rolü {role_update.role} olarak güncellendi"}

@router.post("/{room_id}/kick/{user_id}")
def kick_user(
    room_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kullanıcıyı odadan at"""
    user_role = get_user_role(room_id, current_user.id, db)
    if user_role not in ["owner", "admin"]:
        raise HTTPException(status_code=403, detail="Kullanıcı atma yetkiniz yok")
    
    target = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == user_id
    ).first()
    
    if not target:
        raise HTTPException(status_code=404, detail="Kullanıcı odada bulunamadı")
    
    if target.role == "owner":
        raise HTTPException(status_code=403, detail="Oda sahibini atamazsınız")
    
    db.delete(target)
    db.commit()
    
    return {"message": "Kullanıcı odadan atıldı"}

@router.post("/{room_id}/ban/{user_id}")
def ban_user(
    room_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kullanıcıyı odadan engelle"""
    user_role = get_user_role(room_id, current_user.id, db)
    if user_role not in ["owner", "admin"]:
        raise HTTPException(status_code=403, detail="Kullanıcı engelleme yetkiniz yok")
    
    target = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == user_id
    ).first()
    
    if not target:
        raise HTTPException(status_code=404, detail="Kullanıcı odada bulunamadı")
    
    if target.role == "owner":
        raise HTTPException(status_code=403, detail="Oda sahibini engelleyemezsiniz")
    
    target.is_banned = True
    db.commit()
    
    return {"message": "Kullanıcı engellendi"}

@router.post("/{room_id}/unban/{user_id}")
def unban_user(
    room_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kullanıcının engelini kaldır"""
    user_role = get_user_role(room_id, current_user.id, db)
    if user_role not in ["owner", "admin"]:
        raise HTTPException(status_code=403, detail="Engel kaldırma yetkiniz yok")
    
    target = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == user_id,
        RoomParticipant.is_banned == True
    ).first()
    
    if not target:
        raise HTTPException(status_code=404, detail="Engellenmiş kullanıcı bulunamadı")
    
    target.is_banned = False
    db.commit()
    
    return {"message": "Kullanıcının engeli kaldırıldı"}

@router.post("/{room_id}/mute/{user_id}")
def mute_user(
    room_id: int,
    user_id: int,
    mute_update: MuteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kullanıcıyı sustur"""
    user_role = get_user_role(room_id, current_user.id, db)
    if user_role not in ["owner", "admin", "moderator"]:
        raise HTTPException(status_code=403, detail="Kullanıcı susturma yetkiniz yok")
    
    target = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == user_id
    ).first()
    
    if not target:
        raise HTTPException(status_code=404, detail="Kullanıcı odada bulunamadı")
    
    if target.role in ["owner", "admin"] and user_role != "owner":
        raise HTTPException(status_code=403, detail="Bu kullanıcıyı susturamazsınız")
    
    target.is_muted = mute_update.is_muted
    db.commit()
    
    status_text = "susturuldu" if mute_update.is_muted else "susturması kaldırıldı"
    return {"message": f"Kullanıcı {status_text}"}

@router.post("/{room_id}/transfer/{user_id}")
def transfer_ownership(
    room_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Oda sahipliğini devret"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")
    
    if room.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Sadece oda sahibi devredebilir")
    
    target = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == user_id
    ).first()
    
    if not target:
        raise HTTPException(status_code=404, detail="Kullanıcı odada bulunamadı")
    
    old_owner = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == current_user.id
    ).first()
    old_owner.role = "member"
    
    target.role = "owner"
    room.owner_id = user_id
    
    db.commit()
    
    return {"message": "Oda sahipliği devredildi"}

# ============ WebSocket ============

@router.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: int,
    token: str,
    db: Session = Depends(get_db)
):
    await manager.connect(websocket, room_id)
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username = payload.get("sub")
        user = db.query(User).filter(User.username == username).first()
        
        if not user:
            await websocket.close(code=1008)
            return
        
        user_role = get_user_role(room_id, user.id, db)
        
        await manager.broadcast({
            "type": "system",
            "message": f"{username} odaya katıldı",
            "user": username,
            "role": user_role,
            "timestamp": str(datetime.utcnow())
        }, room_id)
        
    except Exception as e:
        print(f"WebSocket auth hatası: {e}")
        await websocket.close(code=1008)
        return
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "chat":
                participant = db.query(RoomParticipant).filter(
                    RoomParticipant.room_id == room_id,
                    RoomParticipant.user_id == user.id
                ).first()
                
                if participant and participant.is_muted:
                    await websocket.send_json({
                        "type": "error",
                        "message": "Bu odada susturuldunuz, mesaj gönderemezsiniz"
                    })
                    continue
                
                await manager.broadcast({
                    "type": "chat",
                    "user": username,
                    "message": message["message"],
                    "role": user_role,
                    "timestamp": str(datetime.utcnow())
                }, room_id)
            
            elif message["type"] == "draw":
                await manager.broadcast({
                    "type": "draw",
                    "data": message["data"],
                    "user": username,
                    "timestamp": str(datetime.utcnow())
                }, room_id)
            
            elif message["type"] == "cursor":
                await manager.broadcast({
                    "type": "cursor",
                    "user": username,
                    "x": message["x"],
                    "y": message["y"]
                }, room_id)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast({
            "type": "system",
            "message": f"{username} odadan ayrıldı",
            "user": username,
            "timestamp": str(datetime.utcnow())
        }, room_id)
