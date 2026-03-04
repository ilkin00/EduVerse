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
      await api.post(`/friends/accept/${requestId}`);
      await loadFriends();
      await loadFriendRequests();
      return { success: true };
    } catch (error) {
      console.log('❌ İstek kabul edilemedi:', error);
      return { success: false, error: 'İstek kabul edilemedi' };
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      console.log(`❌ İstek reddediliyor: ${requestId}`);
      await api.post(`/friends/reject/${requestId}`);
      await loadFriendRequests();
      return { success: true };
    } catch (error) {
      console.log('❌ İstek reddedilemedi:', error);
      return { success: false, error: 'İstek reddedilemedi' };
    }
  };

  // YENİ: searchUsers fonksiyonu
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

  // Polling: Her 10 saniyede bir istekleri kontrol et
  useEffect(() => {
    if (!user) return;

    // İlk yükleme
    loadFriends();
    loadFriendRequests();

    // Periyodik kontrol
    const interval = setInterval(() => {
      console.log('🔄 İstekler periyodik kontrol ediliyor...');
      loadFriendRequests();
    }, 10000);

    return () => clearInterval(interval);
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
      searchUsers, // YENİ: eklendi
    }}>
      {children}
    </FriendsContext.Provider>
  );
};
