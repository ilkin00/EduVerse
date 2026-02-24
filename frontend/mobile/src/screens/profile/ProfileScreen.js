import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import LanguageSelector from '../../components/LanguageSelector';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { language, availableLanguages, t } = useLanguage();
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

  // Dil dosyalarının yüklendiğinden emin ol
  useEffect(() => {
    if (t) {
      setTranslationsLoaded(true);
    }
  }, [t]);

  const currentLanguage = availableLanguages.find(lang => lang.code === language) || availableLanguages[0];

  const handleLogout = async () => {
    Alert.alert(
      t ? t('auth.logout') : 'Çıkış',
      'Çıkış yapmak istediğinize emin misiniz?',
      [
        { text: t ? t('common.cancel') : 'İptal', style: 'cancel' },
        {
          text: t ? t('auth.logout') : 'Çıkış',
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  // Çeviriler yüklenene kadar bekle
  if (!translationsLoaded) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  const menuItems = [
    {
      icon: 'language-outline',
      title: t('profile.language'),
      value: currentLanguage?.flag + ' ' + currentLanguage?.name,
      onPress: () => setShowLanguageSelector(true),
      color: '#6366F1',
    },
    {
      icon: 'moon-outline',
      title: t('profile.theme'),
      value: t('profile.dark_mode'),
      onPress: () => {},
      color: '#8B5CF6',
    },
    {
      icon: 'notifications-outline',
      title: t('profile.notifications'),
      onPress: () => {},
      color: '#10B981',
    },
    {
      icon: 'lock-closed-outline',
      title: t('profile.privacy'),
      onPress: () => {},
      color: '#F59E0B',
    },
    {
      icon: 'help-circle-outline',
      title: t('profile.help'),
      onPress: () => {},
      color: '#3B82F6',
    },
    {
      icon: 'information-circle-outline',
      title: t('profile.about'),
      onPress: () => {},
      color: '#6B7280',
    },
    {
      icon: 'log-out-outline',
      title: t('auth.logout'),
      onPress: handleLogout,
      color: '#EF4444',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.fullName?.charAt(0) || 'U'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.fullName || 'Kullanıcı'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>156</Text>
          <Text style={styles.statLabel}>{t('notes.title')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>42</Text>
          <Text style={styles.statLabel}>{t('ai.quiz')}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>28</Text>
          <Text style={styles.statLabel}>{t('rooms.participants')}</Text>
        </View>
      </View>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
              <Ionicons name={item.icon} size={22} color={item.color} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              {item.value && (
                <Text style={styles.menuValue}>{item.value}</Text>
              )}
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.version}>EduVerse v1.0.0</Text>

      <LanguageSelector
        visible={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0F',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#1A1A2E',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    color: '#888',
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    paddingVertical: 20,
    marginTop: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
  },
  menuContainer: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    color: '#fff',
    fontSize: 16,
  },
  menuValue: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  version: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
});
