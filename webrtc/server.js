const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use('/api/', limiter);
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || [] }));
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket'], // polling kapalı - daha hızlı
  pingTimeout: 60000,
  pingInterval: 25000,
  maxHttpBufferSize: 1e4, // 10KB - küçük mesajlar
  allowEIO3: false
});

// Memory-leak free storage (WeakMap ile - otomatik GC)
const rooms = new Map();
const userSockets = new WeakMap(); // WeakMap - automatic cleanup
const connectionTimestamps = new Map();

// Connection limit
const MAX_CONNECTIONS = 500;
const MAX_ROOM_SIZE = 20;

console.log('🎥 Optimized WebRTC Signaling Server starting...');

io.use((socket, next) => {
  // Authentication middleware
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }
  
  // Token validation (JWT decode)
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'temp_secret');
    socket.userId = decoded.userId;
    socket.userName = decoded.userName;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

io.on('connection', (socket) => {
  // Connection limit check
  if (io.engine.clientsCount > MAX_CONNECTIONS) {
    socket.emit('error', { message: 'Server full' });
    socket.disconnect();
    return;
  }
  
  console.log(`🔌 Connected: ${socket.userName} (${socket.userId})`);
  connectionTimestamps.set(socket.id, Date.now());
  
  // Join room with validation
  socket.on('join-call', (data) => {
    const { roomId } = data;
    
    // Room size limit
    if (rooms.has(roomId) && rooms.get(roomId).size >= MAX_ROOM_SIZE) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }
    
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);
    
    // Auto-cleanup timer (30 minutes)
    setTimeout(() => {
      if (rooms.has(roomId) && rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
        console.log(`🧹 Cleaned empty room: ${roomId}`);
      }
    }, 30 * 60 * 1000);
    
    // Send existing users
    const otherUsers = Array.from(rooms.get(roomId))
      .filter(id => id !== socket.id)
      .map(id => ({
        userId: io.sockets.sockets.get(id)?.userId,
        userName: io.sockets.sockets.get(id)?.userName
      }))
      .filter(u => u.userId);
    
    if (otherUsers.length > 0) {
      socket.emit('existing-users', otherUsers);
    }
    
    socket.to(roomId).emit('user-joined', {
      userId: socket.userId,
      userName: socket.userName
    });
    
    console.log(`📍 ${socket.userName} joined room ${roomId} (${rooms.get(roomId).size} users)`);
  });
  
  // WebRTC signaling with validation
  socket.on('signal', (data) => {
    const { to, signal } = data;
    
    if (!to || !signal) {
      socket.emit('error', { message: 'Invalid signal data' });
      return;
    }
    
    const targetSocket = io.sockets.sockets.get(to);
    if (targetSocket) {
      targetSocket.emit('signal', {
        from: socket.id,
        signal: signal
      });
    }
  });
  
  socket.on('leave-call', ({ roomId }) => {
    if (roomId && rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
      socket.leave(roomId);
      
      socket.to(roomId).emit('user-left', {
        userId: socket.userId,
        userName: socket.userName
      });
      
      console.log(`👋 ${socket.userName} left room ${roomId}`);
    }
  });
  
  socket.on('disconnect', () => {
    const duration = Date.now() - (connectionTimestamps.get(socket.id) || Date.now());
    console.log(`❌ Disconnected: ${socket.userName} (${socket.userId}) - lasted ${Math.floor(duration/1000)}s`);
    
    // Cleanup - remove from all rooms
    rooms.forEach((participants, roomId) => {
      if (participants.has(socket.id)) {
        participants.delete(socket.id);
        socket.to(roomId).emit('user-left', {
          userId: socket.userId,
          userName: socket.userName
        });
        
        if (participants.size === 0) {
          setTimeout(() => {
            if (rooms.has(roomId) && rooms.get(roomId).size === 0) {
              rooms.delete(roomId);
            }
          }, 60000); // 1 minute delay before deleting empty room
        }
      }
    });
    
    connectionTimestamps.delete(socket.id);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    connections: io.engine.clientsCount,
    rooms: rooms.size,
    memory: process.memoryUsage()
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    active_connections: io.engine.clientsCount,
    active_rooms: rooms.size,
    total_users: userSockets.length
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎥 Optimized WebRTC Server running on port ${PORT}`);
  console.log(`Memory limit: ${MAX_CONNECTIONS} connections max`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  io.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});
