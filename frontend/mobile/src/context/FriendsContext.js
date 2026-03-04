import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const FriendsContext = createContext({});

export const useFriends = () => useContext(FriendsContext);

export const FriendsProvider = ({ children }) => {
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const loadFriendRequests = useCallback(async () => {
    if (!user) return;
    try {
      console.log('📨 Arkadaşlık istekleri yükleniyor...');
      const response = await api.get('/friends/requests');
      console.log('📨 Gelen istekler:', response.data);
      setFriendRequests(response.data);
    } catch (error) {
      console.log('❌ İstekler yüklenemedi:', error.response?.data || error.message);
    }
  }, [user]);

  const loadFriends = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      console.log('👥 Arkadaşlar yükleniyor...');
      const response = await api.get('/friends/');
      console.log('👥 Arkadaşlar:', response.data);
      setFriends(response.data);
    } catch (error) {
      console.log('❌ Arkadaşlar yüklenemedi:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const sendFriendRequest = async (userId) => {
    try {
      console.log(`📤 Arkadaşlık isteği gönderiliyor: ${userId}`);
      const response = await api.post(`/friends/request/${userId}`);
      console.log('✅ İstek gönderildi:', response.data);
      return { success: true };
    } catch (error) {
      console.log('❌ İstek gönderilemedi:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'İstek gönderilemedi' 
      };
    }
  };

  const acceptRequest = async (requestId) => {
    try {
      console.log(`✅ İstek kabul ediliyor: ${requestId}`);
      const response = await api.post(`/friends/accept/${requestId}`);
      console.log('✅ Kabul cevabı:', response.data);
      
      // Listeleri yenile
      await loadFriends();
      await loadFriendRequests();
      
      return { success: true };
    } catch (error) {
      console.log('❌ İstek kabul edilemedi:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'İstek kabul edilemedi' 
      };
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      console.log(`❌ İstek reddediliyor: ${requestId}`);
      const response = await api.post(`/friends/reject/${requestId}`);
      console.log('❌ Reddetme cevabı:', response.data);
      
      // Listeleri yenile
      await loadFriendRequests();
      
      return { success: true };
    } catch (error) {
      console.log('❌ İstek reddedilemedi:', error.response?.data || error.message);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'İstek reddedilemedi' 
      };
    }
  };

  const searchUsers = async (query) => {
    try {
      console.log(`🔍 Kullanıcı aranıyor: ${query}`);
      const response = await api.get(`/friends/search?q=${query}`);
      console.log('🔍 Arama sonuçları:', response.data);
      return response.data;
    } catch (error) {
      console.log('❌ Arama hatası:', error.response?.data || error.message);
      return [];
    }
  };

  useEffect(() => {
    if (user) {
      loadFriends();
      loadFriendRequests();
    }
  }, [user, loadFriends, loadFriendRequests]);

  return (
    <FriendsContext.Provider value={{
      friends,
      friendRequests,
      loading,
      loadFriends,
      loadFriendRequests,
      sendFriendRequest,
      acceptRequest,
      rejectRequest,
      searchUsers,
    }}>
      {children}
    </FriendsContext.Provider>
  );
};
