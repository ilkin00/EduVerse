import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import DrawingCanvas from './canvas/DrawingCanvas';
import Toolbar from './components/Toolbar';
import { NoteTypes } from '../../../models/NoteModel';

export default function DrawingNoteEditor({ route, navigation }) {
  const { t } = useLanguage();
  const { noteId, initialTitle } = route.params || {};
  
  const [title, setTitle] = useState(initialTitle || '');
  const [strokes, setStrokes] = useState([]);
  const [loading, setLoading] = useState(!!noteId);
  const [base64Image, setBase64Image] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(2);
  const [paperType, setPaperType] = useState('blank');
  const [paperColor, setPaperColor] = useState('#ffffff');
  const [saving, setSaving] = useState(false);
  
  const canvasRef = useRef(null);

  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, [noteId]);

  const loadNote = async () => {
    try {
      console.log('📥 Not yükleniyor:', noteId);
      const response = await api.get(`/notes/${noteId}`);
      const note = response.data;
      
      setTitle(note.title);
      
      // Base64 varsa gösterim moduna geç
      if (note.content && note.content.length > 100) {
        setBase64Image(note.content);
        setShowPreview(true); // Önizleme modunda göster
        console.log('🖼️ Base64 yüklendi, boyut:', Math.round(note.content.length / 1024), 'KB');
      }
      
      console.log('✅ Not yüklendi');
      
    } catch (error) {
      console.error('❌ Not yüklenemedi:', error);
      Alert.alert('Hata', 'Not yüklenemedi');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultTitle = () => {
    const date = new Date();
    const formattedDate = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`;
    const formattedTime = `${date.getHours()}:${date.getMinutes()}`;
    return `Çizim ${formattedDate} ${formattedTime}`;
  };

  const getCanvasAsBase64 = async () => {
    try {
      if (!canvasRef.current) {
        console.error('❌ Canvas ref boş!');
        return null;
      }

      const base64 = await captureRef(canvasRef, {
        format: 'png',
        quality: 1,
        result: 'base64',
      });

      console.log(`✅ Base64 alındı, boyut: ${Math.round(base64.length / 1024)} KB`);
      return base64;
    } catch (error) {
      console.error('❌ Base64 hatası:', error);
      return null;
    }
  };

  const saveNote = async () => {
    const finalTitle = title.trim() || generateDefaultTitle();
    
    setSaving(true);
    try {
      const base64Image = await getCanvasAsBase64();
      
      if (!base64Image) {
        Alert.alert('Hata', 'Resim kodu alınamadı');
        return;
      }

      const requestData = {
        title: finalTitle,
        content: base64Image,
        note_type: NoteTypes.DRAWING
      };

      if (noteId) {
        await api.put(`/notes/${noteId}`, requestData);
      } else {
        await api.post('/notes/', requestData);
      }

      Alert.alert('Başarılı', 'Çizim kaydedildi!');
      navigation.goBack();
      
    } catch (error) {
      console.error('❌ Kayıt hatası:', error);
      Alert.alert('Hata', 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Not yükleniyor...</Text>
      </View>
    );
  }

  // Önizleme modu (kayıtlı çizimi göster)
  if (showPreview && base64Image) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>{title}</Text>
          
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={() => setShowPreview(false)}>
              <Ionicons name="create-outline" size={24} color="#6366F1" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.previewContainer}>
          <Image 
            source={{ uri: `data:image/png;base64,${base64Image}` }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  // Çizim modu
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TextInput
          style={styles.titleInput}
          placeholder="Başlık"
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
        />
        
        <TouchableOpacity onPress={saveNote} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : (
            <Ionicons name="checkmark" size={28} color="#6366F1" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.canvasContainer} ref={canvasRef} collapsable={false}>
        <DrawingCanvas
          strokes={strokes}
          onStrokesChange={setStrokes}
          penColor={currentColor}
          penWidth={penWidth}
          paperType={paperType}
          paperColor={paperColor}
          editable={true}
        />
      </View>

      <Toolbar
        onSelectTool={setCurrentTool}
        onSelectColor={setCurrentColor}
        onSelectPaper={setPaperType}
        onInsertSymbol={(symbol) => {}}
        currentTool={currentTool}
        currentColor={currentColor}
      />
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
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1A1A2E',
  },
  headerTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  titleInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginHorizontal: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  previewContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
});
