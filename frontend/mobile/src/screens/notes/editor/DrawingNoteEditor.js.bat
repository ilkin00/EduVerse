
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import DrawingCanvas from './canvas/DrawingCanvas';
import Toolbar from './components/Toolbar';
import { NoteTypes } from '../../../models/NoteModel';

export default function DrawingNoteEditor({ route, navigation }) {
  const { t } = useLanguage();
  const { noteId, initialTitle, initialDrawing } = route.params || {};
  
  const [title, setTitle] = useState(initialTitle || '');
  const [strokes, setStrokes] = useState(initialDrawing?.strokes || []);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(2);
  const [paperType, setPaperType] = useState(initialDrawing?.paperType || 'blank');
  const [paperColor, setPaperColor] = useState(initialDrawing?.paperColor || '#ffffff');
  const [saving, setSaving] = useState(false);
  const [currentNoteId, setCurrentNoteId] = useState(noteId || null);
  const [fileId, setFileId] = useState(initialDrawing?.fileId || null);
  
  const canvasRef = useRef(null);

  // Eğer düzenleme modundaysak ve fileId varsa resmi göstermek için
  useEffect(() => {
    if (initialDrawing?.fileUrl) {
      // Resim yükleme işlemi (opsiyonel)
    }
  }, []);

  // 1. Adım: Not oluştur (eğer yeni notsa)
  const createNote = async () => {
    try {
      const response = await api.post('http://127.0.0.1:8000/api/v1/notes/', {
        title: title || 'Çizim Notu',
        content: JSON.stringify({
          type: 'drawing',
          status: 'pending',
          strokes: strokes,
          paperType: paperType,
          paperColor: paperColor,
        }),
        note_type: NoteTypes.DRAWING
      });
      return response.data.id;
    } catch (error) {
      console.error('Not oluşturma hatası:', error);
      return null;
    }
  };

  // 2. Adım: Resmi yükle
  const uploadDrawingToFiles = async (noteId) => {
    try {
      if (!canvasRef.current) {
        throw new Error('Canvas bulunamadı');
      }

      // Canvas'ı PNG olarak yakala
      const uri = await captureRef(canvasRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      console.log('PNG oluşturuldu:', uri);

      // FormData oluştur
      const formData = new FormData();
      
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append('file', blob, `drawing_${Date.now()}.png`);
      } else {
        formData.append('file', {
          uri: uri,
          type: 'image/png',
          name: `drawing_${Date.now()}.png`,
        });
      }
      
      // note_id'yi formData'ya ekle
      formData.append('note_id', noteId.toString());

      // Files API'ye yükle
      const uploadResponse = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Yükleme başarılı:', uploadResponse.data);
      
      // Geçici dosyayı temizle
      await FileSystem.deleteAsync(uri);

      return uploadResponse.data;
    } catch (error) {
      console.error('PNG yükleme hatası:', error);
      return null;
    }
  };

  // 3. Adım: Notu güncelle (fileId ile)
  const updateNoteWithFile = async (noteId, fileData) => {
    try {
      const drawingContent = JSON.stringify({
        type: 'drawing',
        fileId: fileData.id,
        fileName: fileData.filename,
        fileUrl: fileData.file_path,
        strokes: strokes,
        paperType: paperType,
        paperColor: paperColor,
      });

      await api.put(`/notes/${noteId}`, {
        title: title,
        content: drawingContent,
        note_type: NoteTypes.DRAWING
      });

      return true;
    } catch (error) {
      console.error('Not güncelleme hatası:', error);
      return false;
    }
  };

  const saveNote = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Başlık giriniz');
      return;
    }

    setSaving(true);
    try {
      let noteIdToUse = currentNoteId;

      // 1. Yeni notsa oluştur
      if (!noteIdToUse) {
        noteIdToUse = await createNote();
        if (!noteIdToUse) {
          Alert.alert('Hata', 'Not oluşturulamadı');
          return;
        }
        setCurrentNoteId(noteIdToUse);
      }

      // 2. Resmi yükle
      const fileData = await uploadDrawingToFiles(noteIdToUse);
      if (!fileData) {
        Alert.alert('Hata', 'Çizim yüklenemedi');
        return;
      }

      // 3. Notu güncelle
      const updated = await updateNoteWithFile(noteIdToUse, fileData);
      if (!updated) {
        Alert.alert('Hata', 'Not güncellenemedi');
        return;
      }

      Alert.alert('Başarılı', 'Çizim kaydedildi');
      navigation.goBack();
    } catch (error) {
      console.error('Kayıt hatası:', error);
      Alert.alert('Hata', 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
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
            <Ionicons name="checkmark" size={24} color="#6366F1" />
          )}
        </TouchableOpacity>
      </View>

      {/* Canvas */}
      <View style={styles.canvasContainer} ref={canvasRef} collapsable={false}>
        <DrawingCanvas
          strokes={strokes}
          onStrokesChange={setStrokes}
          penColor={currentColor}
          penWidth={penWidth}
          paperType={paperType}
          paperColor={paperColor}
        />
      </View>

      {/* Toolbar */}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#1A1A2E',
  },
  titleInput: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 12,
    padding: 0,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
