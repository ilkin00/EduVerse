import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

const { width } = Dimensions.get('window');
const imageSize = (width - 60) / 3;

export default function FilesScreen({ navigation }) {
  const { t } = useLanguage();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFiles();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadFiles();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      // GET /api/v1/files/ endpoint'inden tüm dosyaları al
      const response = await api.get('/files/');
      setFiles(response.data);
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      Alert.alert('Hata', 'Dosyalar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const deleteFile = async (fileId) => {
    Alert.alert(
      'Dosyayı Sil',
      'Bu dosyayı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              // DELETE /api/v1/files/{file_id}
              await api.delete(`/files/${fileId}`);
              loadFiles();
            } catch (error) {
              Alert.alert('Hata', 'Silinemedi');
            }
          },
        },
      ]
    );
  };

  const downloadFile = async (file) => {
    try {
      // GET /api/v1/files/download/{file_id}
      const fileUri = `${FileSystem.documentDirectory}${file.filename}`;
      const downloadResumable = FileSystem.createDownloadResumable(
        file.file_path,
        fileUri
      );

      const { uri } = await downloadResumable.downloadAsync();
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }
    } catch (error) {
      Alert.alert('Hata', 'İndirilemedi');
    }
  };

  const renderFile = ({ item }) => {
    const isImage = item.mime_type?.startsWith('image/');
    
    return (
      <TouchableOpacity 
        style={styles.fileCard}
        onPress={() => downloadFile(item)}
        onLongPress={() => deleteFile(item.id)}
      >
        {isImage ? (
          <Image 
            source={{ uri: item.file_path }} 
            style={styles.imageThumb}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.fileIcon}>
            <Ionicons name="document" size={40} color="#6366F1" />
          </View>
        )}
        
        <View style={styles.fileInfo}>
          <Text style={styles.fileName} numberOfLines={1}>
            {item.original_filename || item.filename}
          </Text>
          <Text style={styles.fileSize}>
            {(item.file_size / 1024).toFixed(1)} KB
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dosyalarım</Text>
        <Text style={styles.fileCount}>{files.length} dosya</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={files}
          renderItem={renderFile}
          keyExtractor={item => item.id.toString()}
          numColumns={3}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={64} color="#333" />
              <Text style={styles.emptyText}>Henüz dosya yok</Text>
            </View>
          }
        />
      )}
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
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  fileCount: {
    color: '#888',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  fileCard: {
    width: imageSize,
    marginHorizontal: 5,
    marginBottom: 10,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  imageThumb: {
    width: imageSize,
    height: imageSize,
  },
  fileIcon: {
    width: imageSize,
    height: imageSize,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
  },
  fileInfo: {
    padding: 8,
  },
  fileName: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 2,
  },
  fileSize: {
    color: '#888',
    fontSize: 10,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
  },
});
