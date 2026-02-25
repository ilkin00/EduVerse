import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';
import DrawingCanvas from './canvas/DrawingCanvas';
import Toolbar from './components/Toolbar';
import noteStorageService from '../../../services/noteStorageService';
import api from '../../../services/api';
import { NoteTypes, NoteStatus } from '../../../models/NoteModel';

export default function AdvancedNoteEditor({ route, navigation }) {
  const { t } = useLanguage();
  const { 
    noteId, 
    initialTitle, 
    initialContent, 
    noteType = NoteTypes.TEXT,
    isDraft = false,
    draftKey = null 
  } = route.params || {};
  
  const [title, setTitle] = useState(initialTitle || '');
  const [textContent, setTextContent] = useState('');
  const [strokes, setStrokes] = useState([]);
  const [currentTool, setCurrentTool] = useState('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [penWidth, setPenWidth] = useState(2);
  const [paperType, setPaperType] = useState('blank');
  const [paperColor, setPaperColor] = useState('#ffffff');
  const [activeTab, setActiveTab] = useState(noteType === NoteTypes.DRAWING ? 'drawing' : 'text');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const canvasRef = useRef(null);

  const isDraftMode = isDraft || !noteId;

  useEffect(() => {
    if (noteId && !isDraft) {
      loadPublishedNote();
    }
  }, []);

  const loadPublishedNote = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/notes/${noteId}`);
      const note = response.data;
      
      setTitle(note.title);
      
      if (note.note_type === NoteTypes.DRAWING) {
        setActiveTab('drawing');
        try {
          const drawingData = JSON.parse(note.content);
          setStrokes(drawingData.strokes || []);
          setPaperType(drawingData.paperType || 'blank');
          setPaperColor(drawingData.paperColor || '#ffffff');
        } catch (e) {
          setTextContent(note.content);
        }
      } else {
        setTextContent(note.content || '');
      }
    } catch (error) {
      Alert.alert('Hata', 'Not yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const saveAsDraft = async () => {
    setSaving(true);
    try {
      const noteData = {
        id: noteId || Date.now(),
        title,
        noteType: activeTab === 'drawing' ? NoteTypes.DRAWING : NoteTypes.TEXT,
        content: activeTab === 'drawing' ? JSON.stringify({ strokes, paperType, paperColor }) : textContent,
        createdAt: new Date().toISOString()
      };
      
      const result = await noteStorageService.saveDraft(noteData);
      
      if (result.success) {
        Alert.alert(
          'Başarılı', 
          'Taslak kaydedildi',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Hata', 'Taslak kaydedilemedi');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir sorun oluştu');
    } finally {
      setSaving(false);
    }
  };

  const publishNote = async () => {
    setSaving(true);
    try {
      const noteData = {
        title,
        note_type: activeTab === 'drawing' ? NoteTypes.DRAWING : NoteTypes.TEXT,
        content: activeTab === 'drawing' ? JSON.stringify({ strokes, paperType, paperColor }) : textContent,
      };
      
      const result = await noteStorageService.publishNote(noteData);
      
      if (result.success) {
        Alert.alert(
          'Başarılı', 
          'Not yayınlandı',
          [{ text: 'Tamam', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Hata', 'Yayınlama başarısız');
      }
    } catch (error) {
      Alert.alert('Hata', 'Bir sorun oluştu');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    Alert.alert(
      'Kaydet',
      'Nasıl kaydetmek istersin?',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Taslak (Cihaza kaydet)', 
          onPress: saveAsDraft 
        },
        { 
          text: 'Yayınla (Buluta kaydet)', 
          onPress: publishNote 
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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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
        
        <TouchableOpacity 
          onPress={handleSave}
          disabled={saving}
          style={styles.saveButton}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : (
            <Ionicons name="save" size={24} color="#6366F1" />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'text' && styles.activeTab]}
          onPress={() => setActiveTab('text')}
        >
          <Ionicons name="document-text" size={20} color={activeTab === 'text' ? '#6366F1' : '#888'} />
          <Text style={[styles.tabText, activeTab === 'text' && styles.activeTabText]}>Metin</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'drawing' && styles.activeTab]}
          onPress={() => setActiveTab('drawing')}
        >
          <Ionicons name="brush" size={20} color={activeTab === 'drawing' ? '#6366F1' : '#888'} />
          <Text style={[styles.tabText, activeTab === 'drawing' && styles.activeTabText]}>Çizim</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'text' ? (
        <ScrollView style={styles.textContainer}>
          <TextInput
            style={styles.textInput}
            multiline
            value={textContent}
            onChangeText={setTextContent}
            placeholder="Notunuzu yazın..."
            placeholderTextColor="#666"
            textAlignVertical="top"
          />
        </ScrollView>
      ) : (
        <>
          <View style={styles.canvasContainer} ref={canvasRef}>
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
            onInsertSymbol={(symbol) => {
              console.log('Symbol:', symbol);
            }}
            currentTool={currentTool}
            currentColor={currentColor}
          />
        </>
      )}
    </KeyboardAvoidingView>
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
  saveButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    padding: 8,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(99,102,241,0.2)',
  },
  tabText: {
    color: '#888',
    fontSize: 14,
    marginLeft: 8,
  },
  activeTabText: {
    color: '#6366F1',
    fontWeight: 'bold',
  },
  textContainer: {
    flex: 1,
    padding: 20,
  },
  textInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  canvasContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
