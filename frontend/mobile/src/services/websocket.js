import AsyncStorage from '@react-native-async-storage/async-storage';

const SOCKET_URL = 'http://localhost:8000';

let socket = null;

export const initWebSocket = async (userId, onMessage) => {
  try {
    const token = await AsyncStorage.getItem('@token');
    
    socket = new WebSocket(`${SOCKET_URL}/api/v1/ws/chat?token=${token}`);
    
    socket.onopen = () => {
      console.log('✅ WebSocket bağlandı');
    };
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📩 Mesaj geldi:', data);
      
      if (data.type === 'private_message') {
        onMessage(data);
      } else if (data.type === 'user_status') {
        console.log('👤 Kullanıcı durumu:', data);
      } else if (data.type === 'typing') {
        console.log('✍️ Yazıyor:', data);
      }
    };
    
    socket.onerror = (error) => {
      console.log('🔴 WebSocket hatası:', error);
    };
    
    socket.onclose = () => {
      console.log('❌ WebSocket bağlantısı kapandı');
      setTimeout(() => {
        if (!socket || socket.readyState === WebSocket.CLOSED) {
          initWebSocket(userId, onMessage);
        }
      }, 5000);
    };
    
    return true;
  } catch (error) {
    console.log('WebSocket bağlantı hatası:', error);
    return false;
  }
};

export const sendPrivateMessage = (receiverId, content) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const message = {
      type: 'private_message',
      receiver_id: receiverId,
      content: content,
      timestamp: new Date().toISOString()
    };
    socket.send(JSON.stringify(message));
  }
};

export const sendTyping = (receiverId, isTyping) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    const message = {
      type: 'typing',
      receiver_id: receiverId,
      is_typing: isTyping
    };
    socket.send(JSON.stringify(message));
  }
};

export const closeWebSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

export const getSocket = () => socket;
