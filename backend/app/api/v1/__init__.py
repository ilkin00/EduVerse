from fastapi import APIRouter
from app.api.v1.endpoints import auth, notes, rooms, files, ai, friends, chat, settings, storage

router = APIRouter()
router.include_router(auth.router, prefix="/auth", tags=["authentication"])
router.include_router(notes.router, prefix="/notes", tags=["notes"])
router.include_router(rooms.router, prefix="/rooms", tags=["rooms"])
router.include_router(files.router, prefix="/files", tags=["files"])
router.include_router(ai.router, prefix="/ai", tags=["ai"])
router.include_router(friends.router, prefix="/friends", tags=["friends"])
router.include_router(chat.router, prefix="/chats", tags=["chat"])
router.include_router(settings.router, prefix="/settings", tags=["settings"])  # YENİ
router.include_router(storage.router, prefix="/storage", tags=["storage"])      # YENİ
