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
import { 
  optimizeBase64, 
  validateBase64Size, 
  autoSaveDraft, 
  loadDraft,
  getBase64Size 
} from '../../../services/imageService';

const AUTOSAVE_DELAY = 3000; // 3 saniye

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
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  
  const canvasRef = useRef(null);
  const draftKey = noteId ? `note_${noteId}` : `draft_${Date.now()}`;

  // Otomatik taslak kaydetme
  useEffect(() => {
    if (strokes.length > 0 && !noteId) {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
      
      const timer = setTimeout(async () => {
        const draftData = {
          title,
          strokes,
          currentTool,
          currentColor,
          penWidth,
          paperType,
          paperColor,
        };
        await autoSaveDraft(draftKey, draftData);
      }, AUTOSAVE_DELAY);
      
      setAutoSaveTimer(timer);
    }
    
    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer);
    };
  }, [strokes, title]);

  // Taslak yükle
  useEffect(() => {
    if (!noteId) {
      loadExistingDraft();
    }
  }, []);

  const loadExistingDraft = async () => {
    const draft = await loadDraft(draftKey);
    if (draft) {
      setTitle(draft.title || '');
      setStrokes(draft.strokes || []);
      setCurrentTool(draft.currentTool || 'pen');
      setCurrentColor(draft.currentColor || '#000000');
      setPenWidth(draft.penWidth || 2);
      setPaperType(draft.paperType || 'blank');
      setPaperColor(draft.paperColor || '#ffffff');
      
      Alert.alert(
        'Taslak Bulundu',
        'Kaydedilmemiş bir taslak var. Yüklemek ister misin?',
        [
          { text: 'Hayır', style: 'cancel' },
          { text: 'Evet', onPress: () => console.log('Taslak yüklendi') }
        ]
      );
    }
  };

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
      
      if (note.content && note.content.length > 100) {
        // Base64 ise
        const { kb } = getBase64Size(note.content);
        console.log(`🖼️ Base64 yüklendi: ${kb} KB`);
        
        // Eğer çok büyükse optimize et
        if (kb > 500) {
          Alert.alert(
            'Optimizasyon',
            'Resim çok büyük, optimize edilsin mi?',
            [
              { text: 'Hayır', style: 'cancel' },
              { 
                text: 'Evet', 
                onPress: async () => {
                  const optimized = await optimizeBase64(note.content, 800, 800, 0.7);
                  setBase64Image(optimized);
                }
              }
            ]
          );
        } else {
          setBase64Image(note.content);
        }
        
        setShowPreview(true);
      } else {
        // JSON formatında çizim verisi
        try {
          const drawingData = JSON.parse(note.content);
          setStrokes(drawingData.strokes || []);
          setPaperType(drawingData.paperType || 'blank');
          setPaperColor(drawingData.paperColor || '#ffffff');
        } catch (e) {
          console.log('Çizim verisi JSON değil');
        }
      }
      
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

      const { kb } = getBase64Size(base64);
      console.log(`✅ Base64 alındı: ${kb} KB`);

      // Eğer çok büyükse otomatik optimize et
      if (kb > 1024) {
        console.log('⚡ Base64 çok büyük, optimize ediliyor...');
        return await optimizeBase64(base64, 1024, 1024, 0.8);
      }

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

      // Base64 boyutunu kontrol et
      if (!validateBase64Size(base64Image, 2048)) {
        Alert.alert(
          'Uyarı',
          'Resim çok büyük (2MB\'dan fazla). Yine de kaydedilsin mi?',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Kaydet', onPress: () => saveToServer(finalTitle, base64Image) }
          ]
        );
        return;
      }

      await saveToServer(finalTitle, base64Image);
      
    } catch (error) {
      console.error('❌ Kayıt hatası:', error);
      Alert.alert('Hata', 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const saveToServer = async (finalTitle, base64Image) => {
    const requestData = {
      title: finalTitle,
      content: base64Image,
      note_type: NoteTypes.DRAWING,
      metadata: {
        strokes: strokes.length,
        paperType,
        paperColor,
        version: '1.0'
      }
    };

    if (noteId) {
      await api.put(`/notes/${noteId}`, requestData);
    } else {
      await api.post('/notes/', requestData);
    }

    Alert.alert('Başarılı', 'Çizim kaydedildi!');
    navigation.goBack();
  };

  const undo = () => {
    setStrokes(prev => prev.slice(0, -1));
  };

  const clearCanvas = () => {
    Alert.alert(
      'Çizimi Temizle',
      'Tüm çizim silinecek. Emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Temizle', 
          style: 'destructive',
          onPress: () => setStrokes([])
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Not yükleniyor...</Text>
      </View>
    );
  }

  // Önizleme modu
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
        
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={undo} style={styles.headerButton}>
            <Ionicons name="arrow-undo" size={22} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={clearCanvas} style={styles.headerButton}>
            <Ionicons name="trash-outline" size={22} color="#FF3B30" />
          </TouchableOpacity>
          
          <TouchableOpacity onPress={saveNote} disabled={saving}>
            {saving ? (
              <ActivityIndicator size="small" color="#6366F1" />
            ) : (
              <Ionicons name="checkmark" size={28} color="#6366F1" />
            )}
          </TouchableOpacity>
        </View>
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
  headerButton: {
    padding: 4,
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
