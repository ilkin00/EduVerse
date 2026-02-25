import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(2);
  const [paperType, setPaperType] = useState('blank');
  const [paperColor, setPaperColor] = useState('#ffffff');
  const [saving, setSaving] = useState(false);
  
  const canvasRef = useRef(null);

  const saveNote = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Başlık giriniz');
      return;
    }

    setSaving(true);
    try {
      // Önce sadece metin notu olarak kaydet (test için)
      const noteContent = JSON.stringify({
        type: 'drawing',
        strokes: strokes,
        paperType,
        paperColor,
      });

      if (noteId) {
        await api.put(`/notes/${noteId}`, {
          title,
          content: noteContent,
          note_type: NoteTypes.DRAWING
        });
      } else {
        await api.post('/notes/', {
          title,
          content: noteContent,
          note_type: NoteTypes.DRAWING
        });
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
