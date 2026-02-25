import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import { NoteTypes } from '../../../models/NoteModel';

export default function TextNoteEditor({ route, navigation }) {
  const { t } = useLanguage();
  const { noteId, initialTitle, initialContent } = route.params || {};
  
  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (noteId) {
      loadNote();
    }
  }, []);

  const loadNote = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/notes/${noteId}`);
      setTitle(response.data.title);
      setContent(response.data.content || '');
    } catch (error) {
      Alert.alert('Hata', 'Not yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const saveNote = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Başlık giriniz');
      return;
    }

    setSaving(true);
    try {
      if (noteId) {
        await api.put(`/notes/${noteId}`, {
          title,
          content,
          note_type: NoteTypes.TEXT
        });
      } else {
        await api.post('/notes/', {
          title,
          content,
          note_type: NoteTypes.TEXT
        });
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Hata', 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
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
          {noteId ? 'Not Düzenle' : 'Yeni Not'}
        </Text>
        <TouchableOpacity onPress={saveNote} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="#6366F1" />
          ) : (
            <Ionicons name="checkmark" size={24} color="#6366F1" />
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
        
        <TextInput
          style={styles.contentInput}
          multiline
          value={content}
          onChangeText={setContent}
          placeholder="Notunuzu yazın..."
          placeholderTextColor="#666"
          textAlignVertical="top"
        />
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
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  contentInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 400,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    textAlignVertical: 'top',
  },
});
