import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsContext = createContext({});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const { user } = useAuth();
  const { changeLanguage } = useLanguage();
  
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [storage, setStorage] = useState(null);

  // Ayarları yükle
  const loadSettings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await api.get('/settings/');
      setSettings(response.data);
      
      // Dil ayarını senkronize et
      if (response.data.language) {
        await changeLanguage(response.data.language);
        await AsyncStorage.setItem('@language', response.data.language);
      }
      
    } catch (error) {
      console.log('❌ Ayarlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ayarları güncelle
  const updateSettings = async (updates) => {
    try {
      const response = await api.put('/settings/', updates);
      setSettings(response.data);
      
      // Dil değiştiyse senkronize et
      if (updates.language) {
        await changeLanguage(updates.language);
        await AsyncStorage.setItem('@language', updates.language);
      }
      
      return { success: true };
    } catch (error) {
      console.log('❌ Ayarlar güncellenemedi:', error);
      return { success: false, error: error.response?.data?.detail };
    }
  };

  // Bildirim ayarlarını güncelle
  const updateNotificationSettings = async (notificationSettings) => {
    try {
      const response = await api.put('/settings/notifications', notificationSettings);
      setSettings(prev => ({ ...prev, ...response.data }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail };
    }
  };

  // Gizlilik ayarlarını güncelle
  const updatePrivacySettings = async (privacySettings) => {
    try {
      const response = await api.put('/settings/privacy', privacySettings);
      setSettings(prev => ({ ...prev, ...response.data }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail };
    }
  };

  // Görünüm ayarlarını güncelle
  const updateAppearanceSettings = async (appearanceSettings) => {
    try {
      const response = await api.put('/settings/appearance', appearanceSettings);
      setSettings(prev => ({ ...prev, ...response.data }));
      
      // Dil değiştiyse
      if (appearanceSettings.language) {
        await changeLanguage(appearanceSettings.language);
        await AsyncStorage.setItem('@language', appearanceSettings.language);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail };
    }
  };

  // Oturumları listele
  const loadSessions = async () => {
    try {
      const response = await api.get('/settings/sessions');
      setSessions(response.data);
    } catch (error) {
      console.log('❌ Oturumlar yüklenemedi:', error);
    }
  };

  // Oturum sonlandır
  const terminateSession = async (sessionId) => {
    try {
      await api.delete(`/settings/sessions/${sessionId}`);
      await loadSessions();
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  // Tüm oturumları sonlandır (mevcut hariç)
  const terminateAllOtherSessions = async () => {
    try {
      await api.delete('/settings/sessions');
      await loadSessions();
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  };

  // Depolama kullanımını getir
  const loadStorage = async () => {
    try {
      const response = await api.get('/storage/usage');
      setStorage(response.data);
    } catch (error) {
      console.log('❌ Depolama bilgisi alınamadı:', error);
    }
  };

  // Önbellek temizle
  const clearCache = async () => {
    try {
      const response = await api.post('/storage/clear-cache');
      await loadStorage();
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false };
    }
  };

  // Verileri dışa aktar
  const exportData = async () => {
    try {
      const response = await api.get('/storage/export');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false };
    }
  };

  // Tüm notları sil
  const deleteAllNotes = async () => {
    try {
      const response = await api.delete('/storage/all-notes');
      return { success: true, message: response.data.message };
    } catch (error) {
      return { success: false };
    }
  };

  // İlk yükleme
  useEffect(() => {
    if (user) {
      loadSettings();
      loadSessions();
      loadStorage();
    }
  }, [user]);

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      sessions,
      storage,
      updateSettings,
      updateNotificationSettings,
      updatePrivacySettings,
      updateAppearanceSettings,
      loadSessions,
      terminateSession,
      terminateAllOtherSessions,
      loadStorage,
      clearCache,
      exportData,
      deleteAllNotes,
    }}>
      {children}
    </SettingsContext.Provider>
  );
};
