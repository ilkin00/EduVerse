import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';

export default function AboutScreen({ navigation }) {
  const appVersion = Application.nativeApplicationVersion || '1.0.0';

  const openLink = async (url) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Hata', 'Bağlantı açılamadı');
    }
  };

  const infoItems = [
    {
      icon: 'information-circle',
      label: 'Versiyon',
      value: `v${appVersion}`,
      color: '#6366F1',
    },
    {
      icon: 'build',
      label: 'Build',
      value: Application.nativeBuildVersion || '1',
      color: '#10B981',
    },
    {
      icon: 'calendar',
      label: 'Son Güncelleme',
      value: 'Mart 2025',
      color: '#8B5CF6',
    },
  ];

  const links = [
    {
      icon: 'document-text',
      label: 'Kullanım Koşulları',
      url: 'https://eduverse.app/terms',
    },
    {
      icon: 'lock-closed',
      label: 'Gizlilik Politikası',
      url: 'https://eduverse.app/privacy',
    },
    {
      icon: 'mail',
      label: 'Bize Ulaşın',
      url: 'mailto:destek@eduverse.app',
    },
    {
      icon: 'logo-github',
      label: 'GitHub',
      url: 'https://github.com/eduverse',
    },
    {
      icon: 'globe',
      label: 'Website',
      url: 'https://eduverse.app',
    },
  ];

  const team = [
    { name: 'EduVerse Ekibi', role: 'Geliştirici' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hakkında</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Ionicons name="school" size={60} color="#6366F1" />
          </View>
          <Text style={styles.appName}>EduVerse</Text>
          <Text style={styles.appSlogan}>Öğrenmenin Yeni Dünyası</Text>
        </View>

        {/* Versiyon Bilgileri */}
        <View style={styles.infoGrid}>
          {infoItems.map((item, index) => (
            <View key={index} style={styles.infoCard}>
              <Ionicons name={item.icon} size={28} color={item.color} />
              <Text style={styles.infoValue}>{item.value}</Text>
              <Text style={styles.infoLabel}>{item.label}</Text>
            </View>
          ))}
        </View>

        {/* Açıklama */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>EduVerse Hakkında</Text>
          <Text style={styles.descriptionText}>
            EduVerse, üniversite öğrencileri için geliştirilmiş, 
            yapay zeka destekli, açık kaynak ve kapsamlı bir öğrenme platformudur. 
            Öğrencilerin ders notlarını alabileceği, yapay zeka ile ders çalışabileceği, 
            arkadaşlarıyla gerçek zamanlı sohbet edebileceği ve dosya paylaşabileceği 
            bir ekosistemdir.
          </Text>
        </View>

        {/* Bağlantılar */}
        <View style={styles.linksCard}>
          {links.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.linkItem,
                index < links.length - 1 && styles.linkBorder
              ]}
              onPress={() => openLink(link.url)}
            >
              <View style={styles.linkLeft}>
                <Ionicons name={link.icon} size={22} color="#6366F1" />
                <Text style={styles.linkText}>{link.label}</Text>
              </View>
              <Ionicons name="open-outline" size={20} color="#666" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Takım */}
        <View style={styles.teamCard}>
          <Text style={styles.teamTitle}>Geliştirici Ekibi</Text>
          {team.map((member, index) => (
            <View key={index} style={styles.teamItem}>
              <View style={styles.teamAvatar}>
                <Text style={styles.teamInitial}>{member.name.charAt(0)}</Text>
              </View>
              <View style={styles.teamInfo}>
                <Text style={styles.teamName}>{member.name}</Text>
                <Text style={styles.teamRole}>{member.role}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Lisans */}
        <View style={styles.licenseCard}>
          <Text style={styles.licenseTitle}>Açık Kaynak Lisansı</Text>
          <Text style={styles.licenseText}>
            Bu proje MIT lisansı ile lisanslanmıştır. Herkes katkıda bulunabilir, 
            kullanabilir ve geliştirebilir.
          </Text>
          <TouchableOpacity 
            style={styles.licenseButton}
            onPress={() => openLink('https://opensource.org/licenses/MIT')}
          >
            <Text style={styles.licenseButtonText}>MIT Lisansı</Text>
            <Ionicons name="open-outline" size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {/* Telif Hakkı */}
        <Text style={styles.copyright}>
          © 2025 EduVerse. Tüm hakları saklıdır.
        </Text>
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
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(99,102,241,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  appSlogan: {
    color: '#888',
    fontSize: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  infoLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
  },
  descriptionCard: {
    backgroundColor: '#1A1A2E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  descriptionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  descriptionText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
  },
  linksCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  linkBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  linkLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkText: {
    color: '#fff',
    fontSize: 16,
  },
  teamCard: {
    backgroundColor: '#1A1A2E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  teamTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  teamInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  teamRole: {
    color: '#888',
    fontSize: 14,
    marginTop: 2,
  },
  licenseCard: {
    backgroundColor: '#1A1A2E',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  licenseTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  licenseText: {
    color: '#888',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  licenseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
  },
  licenseButtonText: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '500',
  },
  copyright: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 30,
  },
});
