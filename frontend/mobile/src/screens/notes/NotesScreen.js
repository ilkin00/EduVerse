import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';

export default function NotesScreen({ navigation }) {
  const { t } = useLanguage();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notes/');
      setNotes(response.data);
    } catch (error) {
      Alert.alert(t('common.error'), t('notes.load_error'));
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    Alert.alert(
      t('notes.delete_note'),
      t('notes.confirm_delete'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/notes/${id}`);
              setNotes(notes.filter(note => note.id !== id));
            } catch (error) {
              Alert.alert(t('common.error'), t('notes.delete_error'));
            }
          },
        },
      ]
    );
  };

  const getFilteredNotes = () => {
    if (filter === 'all') return notes;
    return notes.filter(note => note.note_type === filter);
  };

  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return t('notes.just_now');
    if (diff < 3600) return t('notes.minutes_ago', { count: Math.floor(diff / 60) });
    if (diff < 86400) return t('notes.hours_ago', { count: Math.floor(diff / 3600) });
    return t('notes.days_ago', { count: Math.floor(diff / 86400) });
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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('notes.title')}</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('NoteEditor')}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
            {t('notes.filter_all')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'text' && styles.filterButtonActive]}
          onPress={() => setFilter('text')}
        >
          <Text style={[styles.filterText, filter === 'text' && styles.filterTextActive]}>
            {t('notes.filter_text')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'drawing' && styles.filterButtonActive]}
          onPress={() => setFilter('drawing')}
        >
          <Text style={[styles.filterText, filter === 'drawing' && styles.filterTextActive]}>
            {t('notes.filter_drawing')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, filter === 'audio' && styles.filterButtonActive]}
          onPress={() => setFilter('audio')}
        >
          <Text style={[styles.filterText, filter === 'audio' && styles.filterTextActive]}>
            {t('notes.filter_audio')}
          </Text>
        </TouchableOpacity>
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
              <Text style={styles.emptyText}>{t('notes.empty')}</Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => navigation.navigate('NoteEditor')}
              >
                <Text style={styles.emptyButtonText}>{t('notes.create_first')}</Text>
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
