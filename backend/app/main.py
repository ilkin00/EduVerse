from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import settings
from app.api.v1 import router as api_router
from app.core.database import engine, AsyncSessionLocal
from app.services.websocket_manager import websocket_manager
import json

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup & shutdown events"""
    # Startup
    await websocket_manager.initialize()
    print("✅ WebSocket Manager initialized with Redis")
    
    yield
    
    # Shutdown - Cleanup
    await engine.dispose()
    await websocket_manager.redis_client.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
    # Memory optimization
    default_response_class=ORJSONResponse,  # pip install orjson
)

# CORSMiddleware (optimize)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    max_age=600,  # Preflight cache
)

# API router
app.include_router(api_router, prefix=settings.API_V1_STR)

# === OPTİMİZE WEBSOCKET ===
@app.websocket("/api/v1/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    user_id = None
    token = websocket.query_params.get("token")
    
    # Token validate
    from app.api.deps import decode_token
    user_id = decode_token(token)
    if not user_id:
        await websocket.close(code=1008)
        return
    
    try:
        await websocket_manager.connect(user_id, websocket)
        
        while True:
            # Non-blocking receive with timeout
            data = await asyncio.wait_for(websocket.receive_text(), timeout=60.0)
            message = json.loads(data)
            
            # Route message
            if message["type"] == "private_message":
                await websocket_manager.send_to_user(
                    message["receiver_id"],
                    {
                        "type": "private_message",
                        "sender_id": user_id,
                        "content": message["content"][:1000],  # Truncate
                        "timestamp": message.get("timestamp")
                    }
                )
            elif message["type"] == "typing":
                await websocket_manager.send_to_user(
                    message["receiver_id"],
                    {
                        "type": "typing",
                        "sender_id": user_id,
                        "is_typing": message.get("is_typing", False)
                    }
                )
                
    except asyncio.TimeoutError:
        print(f"WebSocket timeout for user {user_id}")
    except WebSocketDisconnect:
        await websocket_manager.disconnect(user_id, websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket_manager.disconnect(user_id, websocket)
