import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredData();
  }, []);

  const loadStoredData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@user');
      const storedToken = await AsyncStorage.getItem('@token');
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        api.defaults.headers.Authorization = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.log('Error loading stored data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      console.log('Login attempt:', username);
      
      // FormData kullan (multipart/form-data)
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      
      const response = await api.post('/auth/login', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('Login response:', response.data);
      
      const { access_token } = response.data;
      
      if (!access_token) {
        return { success: false, error: 'Token alınamadı' };
      }
      
      // Token'ı kaydet
      await AsyncStorage.setItem('@token', access_token);
      api.defaults.headers.Authorization = `Bearer ${access_token}`;
      
      // Kullanıcı bilgisini al
      try {
        const userResponse = await api.get('/auth/me');
        console.log('User response:', userResponse.data);
        
        const userData = userResponse.data;
        await AsyncStorage.setItem('@user', JSON.stringify(userData));
        setUser(userData);
        
        return { success: true };
      } catch (userError) {
        console.log('User info error:', userError);
        // Token var ama user bilgisi yoksa da başarılı say
        return { success: true };
      }
    } catch (error) {
      console.log('Login error:', error.response?.data || error.message);
      
      let errorMessage = 'Giriş başarısız';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { 
        success: false, 
        error: errorMessage 
      };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('@token');
    await AsyncStorage.removeItem('@user');
    api.defaults.headers.Authorization = null;
    setUser(null);
  };

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return { success: true, data: response.data };
    } catch (error) {
      console.log('Register error:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Kayıt başarısız' 
      };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      register,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
