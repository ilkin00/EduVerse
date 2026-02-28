import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import { NoteTypes } from '../../../models/NoteModel';

export default function AudioNoteEditor({ route, navigation }) {
  const { t } = useLanguage();
  const { noteId, initialTitle, initialContent } = route.params || {};
  
  const [title, setTitle] = useState(initialTitle || '');
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingUri, setRecordingUri] = useState(null);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(!!noteId);
  const [saving, setSaving] = useState(false);
  
  // Web için MediaRecorder referansı
  const [webMediaRecorder, setWebMediaRecorder] = useState(null);
  const [webAudioChunks, setWebAudioChunks] = useState([]);
  const [webAudioStream, setWebAudioStream] = useState(null);
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (noteId) {
      loadNote();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (sound) {
        sound.unloadAsync();
      }
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
      // Web'de stream'i kapat
      if (webAudioStream) {
        webAudioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const loadNote = async () => {
    try {
      console.log('📥 Sesli not yükleniyor:', noteId);
      const response = await api.get(`/notes/${noteId}`);
      const note = response.data;
      setTitle(note.title);
      
      if (note.content) {
        try {
          const content = JSON.parse(note.content);
          setUploadedFileId(content.fileId);
          setUploadedFileName(content.fileName);
          setRecordingDuration(content.duration || 0);
          console.log('✅ Sesli not yüklendi:', content);
        } catch (e) {
          console.log('İçerik parse edilemedi');
        }
      }
    } catch (error) {
      console.error('❌ Not yüklenemedi:', error);
      Alert.alert('Hata', 'Not yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  // Web için ses kaydı başlat
  const startWebRecording = async () => {
    try {
      console.log('🌐 Web kaydı başlıyor...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setWebAudioStream(stream);
      
      const mediaRecorder = new MediaRecorder(stream);
      const chunks = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordingUri(audioUrl);
        setWebAudioChunks(chunks);
        console.log('✅ Web kaydı tamamlandı');
      };
      
      mediaRecorder.start();
      setWebMediaRecorder(mediaRecorder);
      setIsRecording(true);
      setRecordingDuration(0);
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('❌ Web kayıt hatası:', error);
      Alert.alert('Hata', 'Mikrofon erişimi yok');
    }
  };

  // Web için kaydı durdur
  const stopWebRecording = () => {
    if (webMediaRecorder && webMediaRecorder.state !== 'inactive') {
      webMediaRecorder.stop();
      if (webAudioStream) {
        webAudioStream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  // Mobil için kayıt başlat
  const startMobileRecording = async () => {
    try {
      console.log('📱 Mobil kaydı başlıyor...');
      
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(recording);
      setIsRecording(true);
      setRecordingDuration(0);
      
      timerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('❌ Mobil kayıt hatası:', err);
      Alert.alert('Hata', 'Kayıt başlatılamadı');
    }
  };

  // Mobil için kaydı durdur
  const stopMobileRecording = async () => {
    if (!recording) return;
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('✅ Mobil kayıt:', fileInfo.size, 'bytes');
      
      setRecordingUri(uri);
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
    } catch (error) {
      console.error('❌ Mobil kayıt hatası:', error);
    }
  };

  // Platforma göre kayıt başlat
  const startRecording = () => {
    if (Platform.OS === 'web') {
      startWebRecording();
    } else {
      startMobileRecording();
    }
  };

  // Platforma göre kaydı durdur
  const stopRecording = () => {
    if (Platform.OS === 'web') {
      stopWebRecording();
    } else {
      stopMobileRecording();
    }
  };

  const playSound = async () => {
    try {
      if (recordingUri) {
        console.log('▶️ Yerel kayıt çalınıyor...');
        
        if (Platform.OS === 'web' && recordingUri.startsWith('blob:')) {
          // Web blob URL'si
          const audio = new Audio(recordingUri);
          audio.play();
          audio.onended = () => setIsPlaying(false);
          setIsPlaying(true);
          // Audio element'i takip etmek için state'e ekle
          // (basit çözüm)
        } else {
          const { sound } = await Audio.Sound.createAsync({ uri: recordingUri });
          setSound(sound);
          setIsPlaying(true);
          await sound.playAsync();
          
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          });
        }
        
      } else if (uploadedFileId) {
        console.log('⬇️ Sunucudan ses indiriliyor...');
        
        const { sound } = await Audio.Sound.createAsync({
          uri: `http://localhost:8000/api/v1/files/download/${uploadedFileId}`
        });
        setSound(sound);
        setIsPlaying(true);
        await sound.playAsync();
        
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('❌ Ses çalınamadı:', error);
      Alert.alert('Hata', 'Ses çalınamadı');
    }
  };

  const stopSound = async () => {
    if (Platform.OS === 'web' && recordingUri?.startsWith('blob:')) {
      // Web'de audio element'i durdur (basit)
      setIsPlaying(false);
    } else if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  // Web'de blob'u base64'e çevir
  const webBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const uploadAudio = async () => {
    if (!recordingUri) return null;
    
    setUploading(true);
    try {
      console.log('⬆️ Ses yükleniyor...');
      
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        // Web'de blob'dan dosya oluştur
        if (webAudioChunks.length > 0) {
          const audioBlob = new Blob(webAudioChunks, { type: 'audio/webm' });
          formData.append('file', audioBlob, `audio_${Date.now()}.webm`);
        } else {
          // Fallback: URL'den fetch
          const response = await fetch(recordingUri);
          const blob = await response.blob();
          formData.append('file', blob, `audio_${Date.now()}.webm`);
        }
      } else {
        // Mobil
        formData.append('file', {
          uri: recordingUri,
          type: 'audio/m4a',
          name: `audio_${Date.now()}.m4a`,
        });
      }

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Ses yüklendi:', response.data);
      return response.data;
      
    } catch (error) {
      console.error('❌ Ses yükleme hatası:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveNote = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Başlık giriniz');
      return;
    }

    if (!recordingUri && !uploadedFileId) {
      Alert.alert('Hata', 'Önce ses kaydedin');
      return;
    }

    setSaving(true);
    try {
      let fileData = null;
      
      if (recordingUri) {
        fileData = await uploadAudio();
        if (!fileData) {
          Alert.alert('Hata', 'Ses yüklenemedi');
          return;
        }
      }

      const noteContent = JSON.stringify({
        fileId: fileData?.id || uploadedFileId,
        duration: recordingDuration,
        fileName: fileData?.filename || uploadedFileName || 'audio_recording',
        fileSize: fileData?.file_size || 0,
      });

      if (noteId) {
        await api.put(`/notes/${noteId}`, {
          title,
          content: noteContent,
          note_type: NoteTypes.AUDIO
        });
      } else {
        const formData = new FormData();
        formData.append('title', title);
        formData.append('file_id', (fileData?.id || uploadedFileId).toString());
        formData.append('duration', recordingDuration.toString());
        formData.append('is_public', 'false');

        await api.post('/notes/audio', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      Alert.alert('Başarılı', 'Sesli not kaydedildi');
      navigation.goBack();
      
    } catch (error) {
      console.error('❌ Kayıt hatası:', error);
      Alert.alert('Hata', 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {noteId ? 'Sesli Not Düzenle' : 'Yeni Sesli Not'}
        </Text>
        
        <TouchableOpacity onPress={saveNote} disabled={saving || uploading}>
          {saving || uploading ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : (
            <Ionicons name="checkmark" size={28} color="#6366F1" />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="Başlık"
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.recorderContainer}>
          <Text style={styles.durationText}>
            {formatTime(recordingDuration)}
          </Text>

          <View style={styles.buttonContainer}>
            {!isRecording && !recordingUri && !uploadedFileId && (
              <TouchableOpacity
                style={[styles.recordButton, styles.startButton]}
                onPress={startRecording}
              >
                <Ionicons name="mic" size={64} color="#fff" />
                <Text style={styles.buttonText}>
                  {Platform.OS === 'web' ? 'Web Kaydı Başlat' : 'Kayda Başla'}
                </Text>
              </TouchableOpacity>
            )}

            {isRecording && (
              <TouchableOpacity
                style={[styles.recordButton, styles.stopButton]}
                onPress={stopRecording}
              >
                <Ionicons name="stop" size={64} color="#fff" />
                <Text style={styles.buttonText}>Kaydı Durdur</Text>
              </TouchableOpacity>
            )}

            {(recordingUri || uploadedFileId) && !isRecording && (
              <View style={styles.playbackContainer}>
                <TouchableOpacity
                  style={styles.playButton}
                  onPress={isPlaying ? stopSound : playSound}
                  disabled={uploading}
                >
                  <Ionicons
                    name={isPlaying ? 'pause-circle' : 'play-circle'}
                    size={80}
                    color="#6366F1"
                  />
                </TouchableOpacity>
                <Text style={styles.playbackText}>
                  {isPlaying ? 'Çalıyor...' : 'Dinle'}
                </Text>
              </View>
            )}
          </View>

          {uploading && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color="#6366F1" />
              <Text style={styles.uploadingText}>Yükleniyor...</Text>
            </View>
          )}

          {(recordingUri || uploadedFileId) && (
            <View style={styles.infoBox}>
              <Ionicons name="information-circle" size={20} color="#888" />
              <Text style={styles.infoText}>
                ✅ Ses kaydedildi ({formatTime(recordingDuration)})
              </Text>
              <Text style={styles.platformText}>
                {Platform.OS === 'web' ? '🌐 Web' : '📱 Mobil'}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.tipBox}>
          <Ionicons name="bulb-outline" size={20} color="#F59E0B" />
          <Text style={styles.tipText}>
            Web'de MediaRecorder API ile ses kaydı çalışır!
          </Text>
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  recorderContainer: {
    backgroundColor: '#1A1A2E',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  durationText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 20,
    minHeight: 150,
  },
  recordButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  startButton: {
    backgroundColor: '#EF4444',
  },
  stopButton: {
    backgroundColor: '#6366F1',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  playbackContainer: {
    alignItems: 'center',
  },
  playButton: {
    marginBottom: 8,
  },
  playbackText: {
    color: '#888',
    fontSize: 14,
  },
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  uploadingText: {
    color: '#888',
    marginLeft: 8,
  },
  infoBox: {
    alignItems: 'center',
    marginTop: 20,
    padding: 16,
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    width: '100%',
  },
  infoText: {
    color: '#888',
    marginBottom: 4,
  },
  platformText: {
    color: '#6366F1',
    fontSize: 12,
    marginTop: 4,
  },
  tipBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(245,158,11,0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  tipText: {
    color: '#F59E0B',
    marginLeft: 8,
    flex: 1,
    fontSize: 12,
  },
});
