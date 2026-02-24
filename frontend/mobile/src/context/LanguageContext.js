import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import I18n, { setLocale, getSystemLocale, t } from '../i18n/i18n';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en'); // Varsayılan İngilizce
  const [loading, setLoading] = useState(true);

  // Uygulama açıldığında kayıtlı dili yükle
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      // AsyncStorage'dan kayıtlı dili al
      const savedLang = await AsyncStorage.getItem('@language');
      
      if (savedLang) {
        // Kayıtlı dil varsa onu kullan
        console.log('Kayıtlı dil bulundu:', savedLang);
        setLocale(savedLang);
        setLanguage(savedLang);
      } else {
        // Kayıtlı dil yoksa sistem dilini kullan
        const systemLang = getSystemLocale();
        console.log('Sistem dili kullanılıyor:', systemLang);
        setLocale(systemLang);
        setLanguage(systemLang);
        // Sistem dilini de kaydet
        await AsyncStorage.setItem('@language', systemLang);
      }
    } catch (error) {
      console.log('Dil yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = async (lang) => {
    try {
      console.log('Dil değiştiriliyor:', lang);
      
      // Dil değişikliğini uygula
      setLocale(lang);
      setLanguage(lang);
      
      // AsyncStorage'a kaydet (kalıcı!)
      await AsyncStorage.setItem('@language', lang);
      
      // Tüm bileşenlerin yeniden render edilmesi için 
      // App.js'deki key'i güncellemek üzere bir event fırlat
      // Bu zaten useEffect ile language state'i değişince olacak
      
    } catch (error) {
      console.log('Dil değiştirilirken hata:', error);
    }
  };

  const availableLanguages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ];

  // translate fonksiyonu - güvenli kullanım için
  const translate = (key, options = {}) => {
    try {
      return t(key, options);
    } catch (error) {
      console.warn('Çeviri hatası:', key, error);
      return key; // Hata durumunda key'i göster
    }
  };

  return (
    <LanguageContext.Provider value={{
      language,
      loading,
      changeLanguage,
      availableLanguages,
      t: translate,
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
