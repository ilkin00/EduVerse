import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useLanguage } from '../../context/LanguageContext';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { settings, loading } = useSettings();
  const { t } = useLanguage();

  const handleLogout = () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkış yapmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Çıkış Yap', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const settingSections = [
    {
      title: '👤 Hesap',
      data: [
        { 
          id: 'profile', 
          icon: 'person-outline', 
          label: 'Profil Bilgileri', 
          screen: 'ProfileSettings',
          color: '#6366F1'
        },
        { 
          id: 'password', 
          icon: 'lock-closed-outline', 
          label: 'Şifre Değiştir', 
          screen: 'ChangePassword',
          color: '#8B5CF6'
        },
      ]
    },
    {
      title: '🔔 Bildirimler',
      data: [
        { 
          id: 'notifications', 
          icon: 'notifications-outline', 
          label: 'Bildirim Ayarları', 
          screen: 'NotificationSettings',
          color: '#10B981',
          badge: settings?.notifications_enabled ? 'Açık' : 'Kapalı'
        },
      ]
    },
    {
      title: '🔒 Gizlilik',
      data: [
        { 
          id: 'privacy', 
          icon: 'eye-off-outline', 
          label: 'Gizlilik Ayarları', 
          screen: 'PrivacySettings',
          color: '#EC4899',
          badge: settings?.profile_visibility === 'public' ? 'Herkese Açık' : 'Özel'
        },
      ]
    },
    {
      title: '🎨 Görünüm',
      data: [
        { 
          id: 'appearance', 
          icon: 'color-palette-outline', 
          label: 'Tema ve Dil', 
          screen: 'AppearanceSettings',
          color: '#F59E0B',
          badge: settings?.language === 'tr' ? 'Türkçe' : settings?.language === 'en' ? 'English' : 'Русский'
        },
      ]
    },
    {
      title: '📊 Depolama',
      data: [
        { 
          id: 'storage', 
          icon: 'cloud-outline', 
          label: 'Depolama Yönetimi', 
          screen: 'StorageSettings',
          color: '#3B82F6'
        },
      ]
    },
    {
      title: '📞 Destek',
      data: [
        { 
          id: 'about', 
          icon: 'information-circle-outline', 
          label: 'Hakkında', 
          screen: 'AboutScreen',
          color: '#6B7280'
        },
      ]
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('settings.title')}</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Profil Özet Kartı */}
      <TouchableOpacity 
        style={styles.profileCard}
        onPress={() => navigation.navigate('ProfileSettings')}
      >
        <View style={styles.profileAvatar}>
          <Text style={styles.profileInitial}>
            {user?.full_name?.charAt(0) || user?.username?.charAt(0) || '?'}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.full_name || user?.username}</Text>
          <Text style={styles.profileEmail}>{user?.email}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#666" />
      </TouchableOpacity>

      {/* Ayarlar Listesi */}
      <ScrollView style={styles.content}>
        {settingSections.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.data.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.settingItem}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <View style={[styles.itemIcon, { backgroundColor: `${item.color}20` }]}>
                    <Ionicons name={item.icon} size={22} color={item.color} />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    {item.badge && (
                      <Text style={styles.itemBadge}>{item.badge}</Text>
                    )}
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#666" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Çıkış Butonu */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Çıkış Yap</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>EduVerse v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    margin: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInitial: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    color: '#888',
    fontSize: 14,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemLabel: {
    color: '#fff',
    fontSize: 16,
    flex: 1,
  },
  itemBadge: {
    color: '#888',
    fontSize: 14,
    marginRight: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 30,
  },
});
