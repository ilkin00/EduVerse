from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import json
from app.core.database import get_db
from app.models.user import User
from app.models.room import Room, RoomParticipant
from app.schemas.room import RoomCreate, RoomUpdate, RoomResponse, RoomParticipantResponse
from app.api.v1.endpoints.auth import get_current_user, oauth2_scheme

router = APIRouter()

# WebSocket bağlantılarını yönetmek için
class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, List[WebSocket]] = {}  # room_id -> [websockets]
    
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

# REST API Endpoints
@router.get("/", response_model=List[RoomResponse])
def read_rooms(
    skip: int = 0,
    limit: int = 100,
    room_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Odaları listele"""
    query = db.query(Room)
    if room_type:
        query = query.filter(Room.room_type == room_type)
    
    rooms = query.offset(skip).limit(limit).all()
    
    # Katılımcı sayılarını ekle
    for room in rooms:
        room.participant_count = db.query(RoomParticipant).filter(RoomParticipant.room_id == room.id).count()
    
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
    
    # Sahibi otomatik olarak katılımcı ekle
    participant = RoomParticipant(
        room_id=db_room.id,
        user_id=current_user.id,
        role="host"
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
    
    room.participant_count = db.query(RoomParticipant).filter(RoomParticipant.room_id == room_id).count()
    return room

@router.put("/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    room_update: RoomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Oda güncelle - Sadece sahibi veya host güncelleyebilir"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")
    
    # Yetki kontrolü - sadece oda sahibi güncelleyebilir
    if room.owner_id != current_user.id:
        # Host kontrolü
        host = db.query(RoomParticipant).filter(
            RoomParticipant.room_id == room_id,
            RoomParticipant.user_id == current_user.id,
            RoomParticipant.role == "host"
        ).first()
        
        if not host:
            raise HTTPException(status_code=403, detail="Bu odayı güncelleme yetkiniz yok")
    
    # Güncelle
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
    """Oda sil - Sadece sahibi silebilir"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")
    
    # Yetki kontrolü - sadece oda sahibi silebilir
    if room.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu odayı silme yetkiniz yok")
    
    db.delete(room)
    db.commit()
    return None

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
    
    # Maksimum katılımcı kontrolü
    current_count = db.query(RoomParticipant).filter(RoomParticipant.room_id == room_id).count()
    if current_count >= room.max_participants:
        raise HTTPException(status_code=400, detail="Oda maksimum kapasiteye ulaştı")
    
    # Zaten katılmış mı kontrol et
    existing = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == current_user.id
    ).first()
    
    if not existing:
        participant = RoomParticipant(
            room_id=room_id,
            user_id=current_user.id
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
        # Host ayrılıyorsa, başka birini host yap
        if participant.role == "host":
            # Başka bir katılımcı bul
            other_participant = db.query(RoomParticipant).filter(
                RoomParticipant.room_id == room_id,
                RoomParticipant.user_id != current_user.id
            ).first()
            
            if other_participant:
                other_participant.role = "host"
        
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
    
    participants = db.query(RoomParticipant).filter(RoomParticipant.room_id == room_id).all()
    
    # Kullanıcı adlarını ekle
    for p in participants:
        user = db.query(User).filter(User.id == p.user_id).first()
        p.username = user.username if user else None
    
    return participants

@router.post("/{room_id}/promote/{user_id}")
def promote_participant(
    room_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Katılımcıyı host yap - Sadece oda sahibi yapabilir"""
    room = db.query(Room).filter(Room.id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Oda bulunamadı")
    
    # Yetki kontrolü - sadece oda sahibi
    if room.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Bu işlem için yetkiniz yok")
    
    participant = db.query(RoomParticipant).filter(
        RoomParticipant.room_id == room_id,
        RoomParticipant.user_id == user_id
    ).first()
    
    if not participant:
        raise HTTPException(status_code=404, detail="Katılımcı bulunamadı")
    
    participant.role = "host"
    db.commit()
    
    return {"message": "Kullanıcı host yapıldı"}

# WebSocket endpoint
@router.websocket("/ws/{room_id}")
async def websocket_endpoint(
    websocket: WebSocket,
    room_id: int,
    token: str
):
    await manager.connect(websocket, room_id)
    try:
        # Hoşgeldin mesajı
        await manager.broadcast({
            "type": "system",
            "message": "Yeni bir kullanıcı bağlandı",
            "timestamp": str(datetime.utcnow())
        }, room_id)
        
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Mesaj tipine göre işle
            if message["type"] == "chat":
                await manager.broadcast({
                    "type": "chat",
                    "user": message.get("user", "Anonim"),
                    "message": message["message"],
                    "timestamp": str(datetime.utcnow())
                }, room_id)
            
            elif message["type"] == "draw":
                # Beyaz tahta çizimleri
                await manager.broadcast({
                    "type": "draw",
                    "data": message["data"],
                    "timestamp": str(datetime.utcnow())
                }, room_id)
            
            elif message["type"] == "cursor":
                # İmleç pozisyonları
                await manager.broadcast({
                    "type": "cursor",
                    "user": message.get("user", "Anonim"),
                    "x": message["x"],
                    "y": message["y"]
                }, room_id)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, room_id)
        await manager.broadcast({
            "type": "system",
            "message": "Bir kullanıcı ayrıldı",
            "timestamp": str(datetime.utcnow())
        }, room_id)
