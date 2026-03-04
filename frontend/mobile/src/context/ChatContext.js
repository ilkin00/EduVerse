import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { initWebSocket, closeWebSocket, sendPrivateMessage } from '../services/websocket';

const ChatContext = createContext({});

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chatList, setChatList] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({});
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();
  const wsConnected = useRef(false);

  const loadChatList = async () => {
    if (!user) return;
    try {
      const response = await api.get('/chats/');
      setChatList(response.data);
    } catch (error) {
      console.log('Sohbet listesi yüklenemedi:', error);
    }
  };

  const loadMessages = async (userId) => {
    if (!user) return;
    try {
      const response = await api.get(`/chats/${userId}`);
      setMessages(prev => ({ ...prev, [userId]: response.data }));
      return response.data;
    } catch (error) {
      console.log('Mesajlar yüklenemedi:', error);
      return [];
    }
  };

  const sendMessage = async (receiverId, content, type = 'text', fileUrl = null) => {
    try {
      const response = await api.post(`/chats/${receiverId}`, {
        content,
        message_type: type,
        file_url: fileUrl
      });
      
      if (wsConnected.current) {
        sendPrivateMessage(receiverId, content);
      }
      
      const newMessage = response.data;
      setMessages(prev => ({
        ...prev,
        [receiverId]: [newMessage, ...(prev[receiverId] || [])]
      }));
      
      return { success: true, message: newMessage };
    } catch (error) {
      return { success: false, error: 'Mesaj gönderilemedi' };
    }
  };

  const markAsRead = async (messageId) => {
    try {
      await api.put(`/chats/read/${messageId}`);
    } catch (error) {
      console.log('Okundu işaretlenemedi:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await api.get('/chats/unread/count');
      setUnreadCount(response.data.count);
    } catch (error) {
      console.log('Okunmamış sayısı alınamadı:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    const setupWebSocket = async () => {
      wsConnected.current = await initWebSocket(user.id, (data) => {
        if (data.type === 'private_message') {
          setMessages(prev => ({
            ...prev,
            [data.sender_id]: [{
              id: Date.now(),
              sender_id: data.sender_id,
              content: data.content,
              created_at: data.timestamp,
              is_read: false
            }, ...(prev[data.sender_id] || [])]
          }));
          loadUnreadCount();
          loadChatList();
        }
      });
    };

    setupWebSocket();
    loadChatList();
    loadUnreadCount();

    const interval = setInterval(loadUnreadCount, 30000);
    
    return () => {
      clearInterval(interval);
      closeWebSocket();
      wsConnected.current = false;
    };
  }, [user]);

  return (
    <ChatContext.Provider value={{
      chatList,
      messages,
      activeChat,
      unreadCount,
      setActiveChat,
      loadChatList,
      loadMessages,
      sendMessage,
      markAsRead,
      loadUnreadCount,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
