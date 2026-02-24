import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

export default function NotesScreen({ navigation }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tümü');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notes/');
      setNotes(response.data);
    } catch (error) {
      Alert.alert('Hata', 'Notlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    Alert.alert(
      'Notu Sil',
      'Bu notu silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/notes/${id}`);
              setNotes(notes.filter(note => note.id !== id));
            } catch (error) {
              Alert.alert('Hata', 'Not silinemedi');
            }
          },
        },
      ]
    );
  };

  const getFilteredNotes = () => {
    if (filter === 'Tümü') return notes;
    return notes.filter(note => note.note_type === filter.toLowerCase());
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Az önce';
    if (diff < 3600) return `${Math.floor(diff / 60)} dakika önce`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} saat önce`;
    return `${Math.floor(diff / 86400)} gün önce`;
  };

  const renderNote = ({ item }) => (
    <TouchableOpacity 
      style={styles.noteCard}
      onPress={() => navigation.navigate('NoteEditor', {
        noteId: item.id,
        initialTitle: item.title,
        initialContent: item.content,
      })}
    >
      <View style={styles.noteIcon}>
        <Ionicons name="document-text" size={24} color="#6366F1" />
      </View>
      
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle}>{item.title}</Text>
        {item.content ? (
          <Text style={styles.notePreview} numberOfLines={2}>
            {item.content.replace(/\\[a-z]+{}/g, '')}
          </Text>
        ) : null}
        <Text style={styles.noteTime}>{getTimeAgo(item.updated_at || item.created_at)}</Text>
      </View>

      <TouchableOpacity 
        style={styles.noteMenu}
        onPress={() => deleteNote(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFilterButton = (label) => (
    <TouchableOpacity
      style={[styles.filterButton, filter === label && styles.filterButtonActive]}
      onPress={() => setFilter(label)}
    >
      <Text style={[styles.filterText, filter === label && styles.filterTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notlarım</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('NoteEditor')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('Tümü')}
        {renderFilterButton('Metin')}
        {renderFilterButton('Çizim')}
        {renderFilterButton('Ses')}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366F1" />
        </View>
      ) : (
        <FlatList
          data={getFilteredNotes()}
          renderItem={renderNote}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color="#333" />
              <Text style={styles.emptyText}>Henüz not eklenmemiş</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => navigation.navigate('NoteEditor')}
              >
                <Text style={styles.emptyButtonText}>Yeni Not Oluştur</Text>
              </TouchableOpacity>
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
  addButton: {
    width: 48,
    height: 48,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  filterButtonActive: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  filterText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  noteIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(99,102,241,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notePreview: {
    color: '#888',
    fontSize: 14,
    marginBottom: 8,
  },
  noteTime: {
    color: '#666',
    fontSize: 12,
  },
  noteMenu: {
    padding: 8,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  emptyButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
