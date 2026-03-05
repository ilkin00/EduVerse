import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';

export default function PrivacySettings({ navigation }) {
  const { settings, updatePrivacySettings, loading } = useSettings();
  const [privacy, setPrivacy] = useState({
    profile_visibility: 'public',
    show_last_seen: true,
    show_online_status: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setPrivacy({
        profile_visibility: settings.profile_visibility || 'public',
        show_last_seen: settings.show_last_seen ?? true,
        show_online_status: settings.show_online_status ?? true,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updatePrivacySettings(privacy);
      if (result.success) {
        Alert.alert('Başarılı', 'Gizlilik ayarları güncellendi');
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

  const visibilityOptions = [
    { id: 'public', label: 'Herkese Açık', desc: 'Herkes profilinizi görebilir', icon: 'globe-outline' },
    { id: 'friends', label: 'Sadece Arkadaşlar', desc: 'Sadece arkadaşlarınız görebilir', icon: 'people-outline' },
    { id: 'private', label: 'Gizli', desc: 'Profiliniz gizli', icon: 'lock-closed-outline' },
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
        <Text style={styles.headerTitle}>Gizlilik Ayarları</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : (
            <Text style={styles.saveButton}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Profil Görünürlüğü */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profil Görünürlüğü</Text>
          <Text style={styles.sectionDesc}>
            Profilinizi kimlerin görebileceğini seçin
          </Text>

          {visibilityOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.optionCard,
                privacy.profile_visibility === option.id && styles.optionCardSelected,
              ]}
              onPress={() => setPrivacy({ ...privacy, profile_visibility: option.id })}
            >
              <View style={styles.optionLeft}>
                <View style={[
                  styles.optionIcon,
                  { backgroundColor: privacy.profile_visibility === option.id ? '#6366F1' : '#333' }
                ]}>
                  <Ionicons name={option.icon} size={20} color="#fff" />
                </View>
                <View>
                  <Text style={styles.optionTitle}>{option.label}</Text>
                  <Text style={styles.optionDesc}>{option.desc}</Text>
                </View>
              </View>
              {privacy.profile_visibility === option.id && (
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Çevrimiçi Durumu */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Çevrimiçi Durumu</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="time-outline" size={22} color="#10B981" />
              <View>
                <Text style={styles.settingTitle}>Son Görülme</Text>
                <Text style={styles.settingDesc}>
                  Son görülme zamanınızı göster
                </Text>
              </View>
            </View>
            <Switch
              value={privacy.show_last_seen}
              onValueChange={(value) => setPrivacy({ ...privacy, show_last_seen: value })}
              trackColor={{ false: '#333', true: '#10B981' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="radio-outline" size={22} color="#8B5CF6" />
              <View>
                <Text style={styles.settingTitle}>Çevrimiçi Durumu</Text>
                <Text style={styles.settingDesc}>
                  Çevrimiçi/çevrimdışı durumunuzu göster
                </Text>
              </View>
            </View>
            <Switch
              value={privacy.show_online_status}
              onValueChange={(value) => setPrivacy({ ...privacy, show_online_status: value })}
              trackColor={{ false: '#333', true: '#8B5CF6' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Veri Politikası */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veri Politikası</Text>
          
          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Veri Politikamız</Text>
            <Ionicons name="open-outline" size={20} color="#6366F1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>KVKK Aydınlatma Metni</Text>
            <Ionicons name="open-outline" size={20} color="#6366F1" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <Text style={styles.linkText}>Çerez Politikası</Text>
            <Ionicons name="open-outline" size={20} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {/* Veri İndir/Sil */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verileriniz</Text>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Bilgi', 'Verileriniz hazırlanıyor...')}
          >
            <Ionicons name="download-outline" size={20} color="#6366F1" />
            <Text style={styles.actionText}>Verilerimi İndir</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]}
            onPress={() => {
              Alert.alert(
                'Hesabı Sil',
                'Hesabınızı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
                [
                  { text: 'İptal', style: 'cancel' },
                  { 
                    text: 'Sil', 
                    style: 'destructive',
                    onPress: () => Alert.alert('Bilgi', 'Hesap silme işlemi başlatıldı')
                  }
                ]
              );
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text style={[styles.actionText, styles.dangerText]}>Hesabımı Sil</Text>
          </TouchableOpacity>
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
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTitle: {
    color: '#fff',
    fontSize: 16,
  },
  settingDesc: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  linkText: {
    color: '#6366F1',
    fontSize: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99,102,241,0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  dangerButton: {
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  actionText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '500',
  },
  dangerText: {
    color: '#EF4444',
  },
});
