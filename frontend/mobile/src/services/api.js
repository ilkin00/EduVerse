import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@env';  // .env'den al

console.log('🌍 API URL:', API_URL);  // Doğru geldiğini kontrol et

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
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.log(`❌ ${error.response?.status} ${error.config?.url}`);
    return Promise.reject(error);
  }
);

export default api;
