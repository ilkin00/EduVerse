import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import { NoteTypes } from '../../models/NoteModel';

export default function NotesScreen({ navigation }) {
  const { t } = useLanguage();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('all');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadNotes();
    
    const unsubscribe = navigation.addListener('focus', () => {
      loadNotes();
    });
    
    return unsubscribe;
  }, [navigation]);

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
              loadNotes();
            } catch (error) {
              Alert.alert('Hata', 'Silinemedi');
            }
          },
        },
      ]
    );
  };

  const getFilteredNotes = () => {
    if (selectedType === 'all') return notes;
    return notes.filter(note => note.note_type === selectedType);
  };

  const getNoteIcon = (noteType) => {
    switch (noteType) {
      case NoteTypes.TEXT: return 'document-text';
      case NoteTypes.DRAWING: return 'brush';
      case NoteTypes.AUDIO: return 'mic';
      default: return 'document';
    }
  };

  const getNoteColor = (noteType) => {
    switch (noteType) {
      case NoteTypes.TEXT: return '#6366F1';
      case NoteTypes.DRAWING: return '#8B5CF6';
      case NoteTypes.AUDIO: return '#EC4899';
      default: return '#6366F1';
    }
  };

  const renderNote = ({ item }) => (
    <TouchableOpacity 
      style={styles.noteCard}
      onPress={() => {
        if (item.note_type === NoteTypes.TEXT) {
          navigation.navigate('NoteEditor', {
            noteId: item.id,
            initialTitle: item.title,
            initialContent: item.content,
          });
        } else if (item.note_type === NoteTypes.DRAWING) {
          navigation.navigate('DrawingEditor', {
            noteId: item.id,
            initialTitle: item.title,
            drawingData: item.content,
          });
        }
      }}
    >
      <View style={[styles.noteIcon, { backgroundColor: `${getNoteColor(item.note_type)}20` }]}>
        <Ionicons name={getNoteIcon(item.note_type)} size={24} color={getNoteColor(item.note_type)} />
      </View>
      
      <View style={styles.noteContent}>
        <Text style={styles.noteTitle}>{item.title || 'Başlıksız'}</Text>
        <Text style={styles.notePreview} numberOfLines={2}>
          {item.note_type === NoteTypes.DRAWING ? '✏️ Çizim notu' : (item.content || '')}
        </Text>
        <Text style={styles.noteTime}>
          {new Date(item.updated_at || item.created_at).toLocaleDateString()}
        </Text>
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notlarım</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tip Seçici Butonlar */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, selectedType === 'all' && styles.typeButtonActive]}
          onPress={() => setSelectedType('all')}
        >
          <Ionicons name="apps" size={20} color={selectedType === 'all' ? '#6366F1' : '#888'} />
          <Text style={[styles.typeText, selectedType === 'all' && styles.typeTextActive]}>Tümü</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, selectedType === NoteTypes.TEXT && styles.typeButtonActive]}
          onPress={() => setSelectedType(NoteTypes.TEXT)}
        >
          <Ionicons name="document-text" size={20} color={selectedType === NoteTypes.TEXT ? '#6366F1' : '#888'} />
          <Text style={[styles.typeText, selectedType === NoteTypes.TEXT && styles.typeTextActive]}>Metin</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, selectedType === NoteTypes.DRAWING && styles.typeButtonActive]}
          onPress={() => setSelectedType(NoteTypes.DRAWING)}
        >
          <Ionicons name="brush" size={20} color={selectedType === NoteTypes.DRAWING ? '#8B5CF6' : '#888'} />
          <Text style={[styles.typeText, selectedType === NoteTypes.DRAWING && styles.typeTextActive]}>Çizim</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, selectedType === NoteTypes.AUDIO && styles.typeButtonActive]}
          onPress={() => setSelectedType(NoteTypes.AUDIO)}
        >
          <Ionicons name="mic" size={20} color={selectedType === NoteTypes.AUDIO ? '#EC4899' : '#888'} />
          <Text style={[styles.typeText, selectedType === NoteTypes.AUDIO && styles.typeTextActive]}>Ses</Text>
        </TouchableOpacity>
      </View>

      {/* Not Listesi */}
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
            </View>
          }
        />
      )}

      {/* Seçenek Menüsü */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Not Türü Seç</Text>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('NoteEditor', { noteType: NoteTypes.TEXT });
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#6366F120' }]}>
                <Ionicons name="document-text" size={24} color="#6366F1" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Metin Notu</Text>
                <Text style={styles.menuDescription}>Zengin metin düzenleyici ile not al</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                navigation.navigate('DrawingEditor', { noteType: NoteTypes.DRAWING });
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#8B5CF620' }]}>
                <Ionicons name="brush" size={24} color="#8B5CF6" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Çizim Notu</Text>
                <Text style={styles.menuDescription}>El yazısı, şekil, diyagram çiz</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                // Ses notu sayfası henüz yok
                Alert.alert('Bilgi', 'Sesli not yakında eklenecek');
              }}
            >
              <View style={[styles.menuIcon, { backgroundColor: '#EC489920' }]}>
                <Ionicons name="mic" size={24} color="#EC4899" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Sesli Not</Text>
                <Text style={styles.menuDescription}>Ses kaydı al ve not ekle</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={() => setMenuVisible(false)}
            >
              <Text style={styles.cancelButtonText}>İptal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  typeSelector: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 4,
    borderRadius: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 4,
  },
  typeButtonActive: {
    backgroundColor: 'rgba(99,102,241,0.2)',
  },
  typeText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
  },
  typeTextActive: {
    color: '#6366F1',
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
  },
  // Modal stilleri
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuDescription: {
    color: '#888',
    fontSize: 12,
  },
  cancelButton: {
    marginTop: 10,
    padding: 16,
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
