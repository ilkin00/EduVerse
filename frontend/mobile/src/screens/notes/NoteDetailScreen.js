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
import api from '../../services/api';

export default function NoteDetailScreen({ route, navigation }) {
  const { noteId } = route.params;
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadNote();
  }, []);

  const loadNote = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/notes/${noteId}`);
      setNote(response.data);
      setTitle(response.data.title);
      setContent(response.data.content || '');
    } catch (error) {
      Alert.alert('Hata', 'Not yüklenemedi');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const updateNote = async () => {
    try {
      const response = await api.put(`/notes/${noteId}`, {
        title,
        content,
      });
      setNote(response.data);
      setEditing(false);
    } catch (error) {
      Alert.alert('Hata', 'Not güncellenemedi');
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
        <Text style={styles.headerTitle}>Not Detayı</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)}>
          <Ionicons name={editing ? "checkmark" : "create-outline"} size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {editing ? (
          <>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Başlık"
              placeholderTextColor="#666"
            />
            <TextInput
              style={styles.contentInput}
              value={content}
              onChangeText={setContent}
              placeholder="İçerik"
              placeholderTextColor="#666"
              multiline
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.saveButton} onPress={updateNote}>
              <Text style={styles.saveButtonText}>Kaydet</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.title}>{note?.title}</Text>
            {note?.content ? (
              <Text style={styles.contentText}>{note.content}</Text>
            ) : null}
          </>
        )}
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
    backgroundColor: '#0A0A0F',
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  contentText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  titleInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
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
    borderRadius: 10,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    minHeight: 200,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#6366F1',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
