import AsyncStorage from '@react-native-async-storage/async-storage';
import { WS_URL } from '@env';  // .env'den al

console.log('🌍 WebSocket URL:', WS_URL);  // Doğru geldiğini kontrol et

let chatSocket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;

export const initChatWebSocket = async (userId, onMessage) => {
  try {
    const token = await AsyncStorage.getItem('@token');
    
    if (chatSocket) {
      chatSocket.close();
    }
    
    chatSocket = new WebSocket(`${WS_URL}/api/v1/ws/chat?token=${token}`);
    
    chatSocket.onopen = () => {
      console.log('✅ WebSocket bağlandı');
      reconnectAttempts = 0;
    };
    
    chatSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📩 WebSocket mesajı:', data);
      
      if (data.type === 'private_message') {
        onMessage(data);
      }
    };
    
    chatSocket.onerror = (error) => {
      console.log('🔴 WebSocket hatası:', error);
    };
    
    chatSocket.onclose = () => {
      console.log('❌ WebSocket bağlantısı kapandı');
      
      if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        setTimeout(() => initChatWebSocket(userId, onMessage), 3000);
      }
    };
    
    return true;
  } catch (error) {
    console.log('WebSocket bağlantı hatası:', error);
    return false;
  }
};

export const sendPrivateMessage = (receiverId, content) => {
  if (chatSocket && chatSocket.readyState === WebSocket.OPEN) {
    chatSocket.send(JSON.stringify({
      type: 'private_message',
      receiver_id: receiverId,
      content: content,
      timestamp: new Date().toISOString()
    }));
  }
};

export const closeWebSocket = () => {
  if (chatSocket) {
    chatSocket.close();
    chatSocket = null;
  }
};
