import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSettings } from '../../context/SettingsContext';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function NotificationSettings({ navigation }) {
  const { settings, updateNotificationSettings, loading } = useSettings();
  const [notifications, setNotifications] = useState({
    enabled: true,
    new_message: true,
    friend_request: true,
    room_invite: true,
    ai_complete: true,
    sound: true,
    vibration: true,
    do_not_disturb: null,
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dndStart, setDndStart] = useState('22:00');
  const [dndEnd, setDndEnd] = useState('08:00');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setNotifications({
        enabled: settings.notifications_enabled ?? true,
        new_message: settings.notify_new_message ?? true,
        friend_request: settings.notify_friend_request ?? true,
        room_invite: settings.notify_room_invite ?? true,
        ai_complete: settings.notify_ai_complete ?? true,
        sound: settings.sound_enabled ?? true,
        vibration: settings.vibration_enabled ?? true,
        do_not_disturb: settings.do_not_disturb_start ? {
          start: settings.do_not_disturb_start,
          end: settings.do_not_disturb_end,
        } : null,
      });
      
      if (settings.do_not_disturb_start) {
        setDndStart(settings.do_not_disturb_start);
        setDndEnd(settings.do_not_disturb_end);
      }
    }
  }, [settings]);

  const toggleSwitch = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDND = () => {
    if (notifications.do_not_disturb) {
      setNotifications(prev => ({ ...prev, do_not_disturb: null }));
    } else {
      setNotifications(prev => ({
        ...prev,
        do_not_disturb: { start: dndStart, end: dndEnd }
      }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateNotificationSettings({
        enabled: notifications.enabled,
        new_message: notifications.new_message,
        friend_request: notifications.friend_request,
        room_invite: notifications.room_invite,
        ai_complete: notifications.ai_complete,
        sound: notifications.sound,
        vibration: notifications.vibration,
        do_not_disturb: notifications.do_not_disturb,
      });

      if (result.success) {
        Alert.alert('Başarılı', 'Bildirim ayarları güncellendi');
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
        <Text style={styles.headerTitle}>Bildirim Ayarları</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : (
            <Text style={styles.saveButton}>Kaydet</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Ana Bildirim Switch */}
        <View style={styles.section}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications-outline" size={24} color="#6366F1" />
              <View style={styles.settingText}>
                <Text style={styles.settingTitle}>Tüm Bildirimler</Text>
                <Text style={styles.settingDescription}>
                  Tüm bildirimleri aç/kapat
                </Text>
              </View>
            </View>
            <Switch
              value={notifications.enabled}
              onValueChange={() => toggleSwitch('enabled')}
              trackColor={{ false: '#333', true: '#6366F1' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {notifications.enabled && (
          <>
            {/* Bildirim Tipleri */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bildirim Tipleri</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="chatbubble-outline" size={22} color="#10B981" />
                  <Text style={styles.settingTitle}>Yeni Mesaj</Text>
                </View>
                <Switch
                  value={notifications.new_message}
                  onValueChange={() => toggleSwitch('new_message')}
                  trackColor={{ false: '#333', true: '#10B981' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="person-add-outline" size={22} color="#8B5CF6" />
                  <Text style={styles.settingTitle}>Arkadaşlık İsteği</Text>
                </View>
                <Switch
                  value={notifications.friend_request}
                  onValueChange={() => toggleSwitch('friend_request')}
                  trackColor={{ false: '#333', true: '#8B5CF6' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="videocam-outline" size={22} color="#EC4899" />
                  <Text style={styles.settingTitle}>Oda Davetleri</Text>
                </View>
                <Switch
                  value={notifications.room_invite}
                  onValueChange={() => toggleSwitch('room_invite')}
                  trackColor={{ false: '#333', true: '#EC4899' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="flash-outline" size={22} color="#F59E0B" />
                  <Text style={styles.settingTitle}>AI İşlem Tamamlandı</Text>
                </View>
                <Switch
                  value={notifications.ai_complete}
                  onValueChange={() => toggleSwitch('ai_complete')}
                  trackColor={{ false: '#333', true: '#F59E0B' }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* Uyarı Şekli */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Uyarı Şekli</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="volume-high-outline" size={22} color="#3B82F6" />
                  <Text style={styles.settingTitle}>Sesli Uyarı</Text>
                </View>
                <Switch
                  value={notifications.sound}
                  onValueChange={() => toggleSwitch('sound')}
                  trackColor={{ false: '#333', true: '#3B82F6' }}
                  thumbColor="#fff"
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="phone-portrait-outline" size={22} color="#3B82F6" />
                  <Text style={styles.settingTitle}>Titreşim</Text>
                </View>
                <Switch
                  value={notifications.vibration}
                  onValueChange={() => toggleSwitch('vibration')}
                  trackColor={{ false: '#333', true: '#3B82F6' }}
                  thumbColor="#fff"
                />
              </View>
            </View>

            {/* Rahatsız Etme Modu */}
            <View style={styles.section}>
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Ionicons name="moon-outline" size={24} color="#8B5CF6" />
                  <View>
                    <Text style={styles.settingTitle}>Rahatsız Etme Modu</Text>
                    <Text style={styles.settingDescription}>
                      Belirli saatlerde sessiz mod
                    </Text>
                  </View>
                </View>
                <Switch
                  value={!!notifications.do_not_disturb}
                  onValueChange={toggleDND}
                  trackColor={{ false: '#333', true: '#8B5CF6' }}
                  thumbColor="#fff"
                />
              </View>

              {notifications.do_not_disturb && (
                <View style={styles.dndContainer}>
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={styles.timeLabel}>Başlangıç</Text>
                    <Text style={styles.timeValue}>{dndStart}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.timeButton}>
                    <Text style={styles.timeLabel}>Bitiş</Text>
                    <Text style={styles.timeValue}>{dndEnd}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </>
        )}
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
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
    textTransform: 'uppercase',
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
  settingText: {
    flex: 1,
  },
  settingTitle: {
    color: '#fff',
    fontSize: 16,
  },
  settingDescription: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  dndContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  timeButton: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  timeLabel: {
    color: '#888',
    fontSize: 12,
    marginBottom: 4,
  },
  timeValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
