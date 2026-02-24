import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API URL - backend IP'n
const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    console.log(`🌐 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    
    const token = await AsyncStorage.getItem('@token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token eklendi');
    }
    
    if (config.data instanceof FormData) {
      console.log('📤 FormData gönderiliyor');
    } else if (config.data) {
      console.log('📤 Data:', config.data);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log(`❌ ${error.response?.status} ${error.config?.url}`);
    console.log('Hata detayı:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
