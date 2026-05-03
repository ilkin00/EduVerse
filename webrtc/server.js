const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Aktif odalar ve kullanıcılar
const rooms = new Map();
const users = new Map();

console.log('🎥 WebRTC Signaling Server starting...');

io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);

  socket.on('register', (data) => {
    const { userId, userName } = data;
    users.set(socket.id, { userId, userName, socketId: socket.id });
    console.log(`✅ User registered: ${userName} (${userId})`);
    
    // Başarılı kayıt onayı
    socket.emit('registered', { success: true });
  });

  socket.on('join-call', (data) => {
    const { roomId, userId, userName } = data;
    
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    rooms.get(roomId).add(socket.id);
    
    // Odadaki diğer kullanıcılara bildir
    socket.to(roomId).emit('user-joined', {
      userId,
      userName,
      socketId: socket.id
    });
    
    // Katılan kişiye mevcut kullanıcıları gönder
    const otherUsers = Array.from(rooms.get(roomId))
      .filter(id => id !== socket.id)
      .map(id => users.get(id));
    
    if (otherUsers.length > 0) {
      socket.emit('existing-users', otherUsers);
    }
    
    console.log(`📞 ${userName} joined call room: ${roomId} (${rooms.get(roomId).size} participants)`);
  });

  socket.on('offer', (data) => {
    const { to, offer } = data;
    console.log(`📤 Offer from ${socket.id} to ${to}`);
    io.to(to).emit('offer', {
      from: socket.id,
      offer: offer
    });
  });

  socket.on('answer', (data) => {
    const { to, answer } = data;
    console.log(`📤 Answer from ${socket.id} to ${to}`);
    io.to(to).emit('answer', {
      from: socket.id,
      answer: answer
    });
  });

  socket.on('ice-candidate', (data) => {
    const { to, candidate } = data;
    console.log(`🧊 ICE candidate from ${socket.id} to ${to}`);
    io.to(to).emit('ice-candidate', {
      from: socket.id,
      candidate: candidate
    });
  });

  socket.on('leave-call', (data) => {
    const { roomId, userId, userName } = data;
    
    socket.leave(roomId);
    if (rooms.has(roomId)) {
      rooms.get(roomId).delete(socket.id);
      if (rooms.get(roomId).size === 0) {
        rooms.delete(roomId);
      }
    }
    
    socket.to(roomId).emit('user-left', {
      userId,
      userName
    });
    
    console.log(`📞 ${userName} left call room: ${roomId}`);
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      console.log(`❌ User disconnected: ${user.userName}`);
      users.delete(socket.id);
      
      rooms.forEach((participants, roomId) => {
        if (participants.has(socket.id)) {
          participants.delete(socket.id);
          socket.to(roomId).emit('user-left', {
            userId: user.userId,
            userName: user.userName
          });
          if (participants.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎥 WebRTC Signaling Server running on port ${PORT}`);
});
