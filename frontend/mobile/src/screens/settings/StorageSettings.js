import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { useSettings } from '../../context/SettingsContext';
import api from '../../services/api';

export default function StorageSettings({ navigation }) {
  const { storage, loadStorage, clearCache, exportData, deleteAllNotes } = useSettings();
  const [loading, setLoading] = useState(false);
  const [cacheSize, setCacheSize] = useState('0 B');

  useEffect(() => {
    loadStorage();
    calculateCacheSize();
  }, []);

  const calculateCacheSize = async () => {
    try {
      const cacheDir = `${FileSystem.cacheDirectory}eduverse/`;
      const dirInfo = await FileSystem.getInfoAsync(cacheDir);
      
      if (dirInfo.exists) {
        const files = await FileSystem.readDirectoryAsync(cacheDir);
        let totalSize = 0;
        
        for (const file of files) {
          const fileInfo = await FileSystem.getInfoAsync(`${cacheDir}${file}`);
          totalSize += fileInfo.size || 0;
        }
        
        setCacheSize(formatBytes(totalSize));
      }
    } catch (error) {
      console.log('Cache boyutu hesaplanamadı:', error);
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Önbelleği Temizle',
      'Geçici dosyalar silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Temizle',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await clearCache();
              if (result.success) {
                await calculateCacheSize();
                Alert.alert('Başarılı', result.message || 'Önbellek temizlendi');
              } else {
                Alert.alert('Hata', 'Önbellek temizlenemedi');
              }
            } catch (error) {
              Alert.alert('Hata', 'Bir sorun oluştu');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const result = await exportData();
      if (result.success) {
        const jsonData = JSON.stringify(result.data, null, 2);
        
        await Share.share({
          title: 'EduVerse Veri Dışa Aktarımı',
          message: jsonData,
        });
      } else {
        Alert.alert('Hata', 'Veriler dışa aktarılamadı');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAllNotes = async () => {
    Alert.alert(
      'Tüm Notları Sil',
      'Bu işlem geri alınamaz! Tüm notlarınız silinecek. Emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Hepsini Sil',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              const result = await deleteAllNotes();
              if (result.success) {
                await loadStorage();
                Alert.alert('Başarılı', result.message || 'Notlar silindi');
              } else {
                Alert.alert('Hata', 'Notlar silinemedi');
              }
            } catch (error) {
              Alert.alert('Hata', 'Bir sorun oluştu');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
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
        <Text style={styles.headerTitle}>Depolama Yönetimi</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Depolama Kullanımı */}
        <View style={styles.storageCard}>
          <Text style={styles.storageTitle}>Depolama Kullanımı</Text>
          
          <View style={styles.storageBar}>
            <View 
              style={[
                styles.storageFill, 
                { width: `${Math.min(storage?.percentage || 0, 100)}%` }
              ]} 
            />
          </View>

          <View style={styles.storageInfo}>
            <Text style={styles.storageText}>
              Kullanılan: {formatBytes(storage?.used || 0)}
            </Text>
            <Text style={styles.storageText}>
              Toplam: {formatBytes(storage?.limit || 100 * 1024 * 1024)}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="document-text" size={24} color="#6366F1" />
              <Text style={styles.statNumber}>{storage?.notes_count || 0}</Text>
              <Text style={styles.statLabel}>Not</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="images" size={24} color="#8B5CF6" />
              <Text style={styles.statNumber}>{storage?.files_count || 0}</Text>
              <Text style={styles.statLabel}>Dosya</Text>
            </View>
            
            <View style={styles.statItem}>
              <Ionicons name="archive" size={24} color="#EC4899" />
              <Text style={styles.statNumber}>{cacheSize}</Text>
              <Text style={styles.statLabel}>Önbellek</Text>
            </View>
          </View>
        </View>

        {/* İşlemler */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Depolama İşlemleri</Text>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleClearCache}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10B981' }]}>
              <Ionicons name="trash-bin" size={20} color="#fff" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Önbelleği Temizle</Text>
              <Text style={styles.actionDesc}>Geçici dosyaları sil ({cacheSize})</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleExportData}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#6366F1' }]}>
              <Ionicons name="download" size={20} color="#fff" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>Verileri Dışa Aktar</Text>
              <Text style={styles.actionDesc}>Tüm verilerinizi JSON olarak indirin</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Yedekleme */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Otomatik Yedekleme</Text>

          <View style={styles.infoBox}>
            <Ionicons name="cloud-outline" size={32} color="#666" />
            <Text style={styles.infoTitle}>Yedekleme Kapalı</Text>
            <Text style={styles.infoDesc}>
              Otomatik yedekleme özelliği yakında geliyor!
            </Text>
          </View>
        </View>

        {/* Tehlikeli İşlemler */}
        <View style={[styles.section, styles.dangerSection]}>
          <Text style={styles.sectionTitle}>Tehlikeli Bölge</Text>

          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={handleDeleteAllNotes}
          >
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text style={styles.dangerButtonText}>Tüm Notları Sil</Text>
          </TouchableOpacity>

          <Text style={styles.dangerHint}>
            Bu işlem geri alınamaz! Tüm notlarınız kalıcı olarak silinecektir.
          </Text>
        </View>

        <Text style={styles.lastUpdated}>
          Son güncelleme: {storage?.last_updated ? new Date(storage.last_updated).toLocaleString('tr-TR') : 'Bilinmiyor'}
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
  content: {
    flex: 1,
    padding: 20,
  },
  storageCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  storageTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  storageBar: {
    height: 8,
    backgroundColor: '#333',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  storageFill: {
    height: 8,
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  storageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  storageText: {
    color: '#888',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#888',
    fontSize: 12,
    marginTop: 4,
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
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  actionDesc: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  infoBox: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#0A0A0F',
    borderRadius: 8,
  },
  infoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  infoDesc: {
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  dangerSection: {
    borderColor: '#EF4444',
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239,68,68,0.1)',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  dangerButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  dangerHint: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
  },
  lastUpdated: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 30,
  },
});
