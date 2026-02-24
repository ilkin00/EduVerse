import I18n from 'react-native-i18n';
import * as Localization from 'expo-localization';

// Dil dosyalarını import et
import tr from './locales/tr.json';
import ru from './locales/ru.json';
import en from './locales/en.json';

I18n.fallbacks = true;
I18n.translations = {
  tr,
  ru,
  en,
};

// Mevcut dili belirle
const locale = Localization.locale;
I18n.locale = locale.substring(0, 2); // 'tr-TR' -> 'tr', 'ru-RU' -> 'ru'

// Yardımcı fonksiyonlar
export const getSystemLocale = () => I18n.locale;

export const setLocale = (locale) => {
  I18n.locale = locale;
};

// translate fonksiyonunu doğrudan export et
export const t = (key, options = {}) => {
  return I18n.t(key, options);
};

export default I18n;
