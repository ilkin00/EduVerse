import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';

export default function AppearanceSettings({ navigation }) {
  const { settings, updateAppearanceSettings, loading } = useSettings();
  const { language: currentLang, changeLanguage, availableLanguages } = useLanguage();
  
  const [appearance, setAppearance] = useState({
    theme: 'dark',
    language: 'tr',
    font_size: 'medium',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setAppearance({
        theme: settings.theme || 'dark',
        language: settings.language || currentLang || 'tr',
        font_size: settings.font_size || 'medium',
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateAppearanceSettings(appearance);
      if (result.success) {
        Alert.alert('Başarılı', 'Görünüm ayarları güncellendi');
        navigation.goBack();
      } else {
        Alert.alert('Hata', result.error || 'Güncellenemedi');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir sorun oluştu');
    } finally {
      setSaving(false);
    }
  };

  const themes = [
    { id: 'dark', label: 'Karanlık', icon: 'moon', desc: 'Göz yormayan koyu tema' },
    { id: 'light', label: 'Aydınlık', icon: 'sunny', desc: 'Parlak ve canlı tema' },
    { id: 'system', label: 'Sistem', icon: 'phone-portrait', desc: 'Sistem ayarlarını takip et' },
  ];

  const fontSizes = [
    { id: 'small', label: 'Küçük', size: 14 },
    { id: 'medium', label: 'Orta', size: 16 },
    { id: 'large', label: 'Büyük', size: 18 },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Görünüm Ayarları</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : (
            <Text style={styles.saveButton}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Tema Seçimi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tema</Text>
          <Text style={styles.sectionDesc}>Uygulama temasını seçin</Text>

          {themes.map((theme) => (
            <TouchableOpacity
              key={theme.id}
              style={[
                styles.optionCard,
                appearance.theme === theme.id && styles.optionCardSelected,
              ]}
              onPress={() => setAppearance({ ...appearance, theme: theme.id })}
            >
              <View style={styles.optionLeft}>
                <View style={[
                  styles.optionIcon,
                  { backgroundColor: appearance.theme === theme.id ? '#6366F1' : '#333' }
                ]}>
                  <Ionicons name={theme.icon} size={20} color="#fff" />
                </View>
                <View>
                  <Text style={styles.optionTitle}>{theme.label}</Text>
                  <Text style={styles.optionDesc}>{theme.desc}</Text>
                </View>
              </View>
              {appearance.theme === theme.id && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Dil Seçimi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dil</Text>
          <Text style={styles.sectionDesc}>Uygulama dilini seçin</Text>

          {availableLanguages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.optionCard,
                appearance.language === lang.code && styles.optionCardSelected,
              ]}
              onPress={() => setAppearance({ ...appearance, language: lang.code })}
            >
              <View style={styles.optionLeft}>
                <View style={[
                  styles.optionIcon,
                  { backgroundColor: appearance.language === lang.code ? '#6366F1' : '#333' }
                ]}>
                  <Text style={styles.flagText}>{lang.flag}</Text>
                </View>
                <View>
                  <Text style={styles.optionTitle}>{lang.name}</Text>
                  <Text style={styles.optionDesc}>{lang.code.toUpperCase()}</Text>
                </View>
              </View>
              {appearance.language === lang.code && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Yazı Boyutu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yazı Boyutu</Text>
          <Text style={styles.sectionDesc}>Metin boyutunu ayarlayın</Text>

          {fontSizes.map((size) => (
            <TouchableOpacity
              key={size.id}
              style={[
                styles.optionCard,
                appearance.font_size === size.id && styles.optionCardSelected,
              ]}
              onPress={() => setAppearance({ ...appearance, font_size: size.id })}
            >
              <View style={styles.optionLeft}>
                <View style={[
                  styles.optionIcon,
                  { backgroundColor: appearance.font_size === size.id ? '#6366F1' : '#333' }
                ]}>
                  <Ionicons name="text" size={20} color="#fff" />
                </View>
                <View>
                  <Text style={[styles.optionTitle, { fontSize: size.size }]}>
                    {size.label}
                  </Text>
                  <Text style={styles.optionDesc}>
                    Örnek metin boyutu
                  </Text>
                </View>
              </View>
              {appearance.font_size === size.id && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Önizleme */}
        <View style={[styles.previewSection, { backgroundColor: appearance.theme === 'dark' ? '#1A1A2E' : '#fff' }]}>
          <Text style={[styles.previewTitle, { color: appearance.theme === 'dark' ? '#fff' : '#000' }]}>
            Önizleme
          </Text>
          
          <View style={styles.previewCard}>
            <Text style={[
              styles.previewText,
              { 
                fontSize: fontSizes.find(f => f.id === appearance.font_size)?.size || 16,
                color: appearance.theme === 'dark' ? '#fff' : '#000'
              }
            ]}>
              Bu bir örnek metindir. Yazı boyutunu ve temayı test edebilirsiniz.
            </Text>
            
            <View style={styles.previewBadge}>
              <Ionicons name="chatbubble" size={16} color="#6366F1" />
              <Text style={styles.previewBadgeText}>AI Asistan</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1A1A2E',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  saveButton: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionDesc: {
    color: '#888',
    fontSize: 14,
    marginBottom: 16,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0A0A0F',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  optionCardSelected: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99,102,241,0.1)',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  optionDesc: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  flagText: {
    fontSize: 20,
  },
  previewSection: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewCard: {
    backgroundColor: '#0A0A0F',
    padding: 16,
    borderRadius: 8,
  },
  previewText: {
    marginBottom: 12,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(99,102,241,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  previewBadgeText: {
    color: '#6366F1',
    fontSize: 12,
    fontWeight: '600',
  },
});
