import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import api from './api';
import { NoteStatus } from '../models/NoteModel';

const DRAFTS_KEY = '@eduverse_drafts';
const DRAWINGS_DIR = `${FileSystem.documentDirectory}drawings/`;

// Local storage servisi
class NoteStorageService {
  constructor() {
    this.init();
  }

  // Klasörleri oluştur
  async init() {
    try {
      const dirInfo = await FileSystem.getInfoAsync(DRAWINGS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(DRAWINGS_DIR, { intermediates: true });
      }
    } catch (error) {
      console.log('Dizin oluşturma hatası:', error);
    }
  }

  // ============== LOCAL İŞLEMLER (Taslaklar) ==============

  // Taslak kaydet (local)
  async saveDraft(note) {
    try {
      const key = `${DRAFTS_KEY}_${note.id || Date.now()}`;
      
      // Not verisini JSON olarak kaydet
      await AsyncStorage.setItem(key, JSON.stringify({
        ...note,
        savedAt: new Date().toISOString(),
        isLocal: true
      }));
      
      return { success: true, key };
    } catch (error) {
      console.error('Taslak kaydetme hatası:', error);
      return { success: false, error };
    }
  }

  // Taslakları listele (local)
  async getDrafts() {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const draftKeys = keys.filter(key => key.startsWith(DRAFTS_KEY));
      const drafts = await AsyncStorage.multiGet(draftKeys);
      
      return drafts.map(([key, value]) => {
        try {
          return {
            ...JSON.parse(value),
            key,
            isDraft: true
          };
        } catch (e) {
          return null;
        }
      }).filter(Boolean).sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    } catch (error) {
      console.error('Taslakları getirme hatası:', error);
      return [];
    }
  }

  // Taslak sil (local)
  async deleteDraft(key) {
    try {
      await AsyncStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      console.error('Taslak silme hatası:', error);
      return { success: false, error };
    }
  }

  // ============== API İŞLEMLER (Yayınlananlar) ==============

  // Not yayınla (API'ye kaydet)
  async publishNote(note) {
    try {
      const response = await api.post('/notes/', {
        title: note.title,
        content: note.content || '',
        note_type: note.noteType || 'text'
      });
      
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Yayınlama hatası:', error);
      return { success: false, error };
    }
  }

  // Yayınlanmış notları getir (API'den)
  async getPublishedNotes() {
    try {
      const response = await api.get('/notes/');
      return response.data.map(note => ({
        ...note,
        isPublished: true,
        isDraft: false
      }));
    } catch (error) {
      console.error('Notları getirme hatası:', error);
      return [];
    }
  }

  // ============== HİBRİT LİSTELEME ==============

  // Tüm notları getir (local drafts + API published)
  async getAllNotes() {
    try {
      const [drafts, published] = await Promise.all([
        this.getDrafts(),
        this.getPublishedNotes().catch(() => [])
      ]);
      
      // Tüm notları birleştir ve tarihe göre sırala
      return [...drafts, ...published].sort((a, b) => {
        const dateA = new Date(a.savedAt || a.updated_at || a.created_at || 0);
        const dateB = new Date(b.savedAt || b.updated_at || b.created_at || 0);
        return dateB - dateA;
      });
    } catch (error) {
      console.error('Notları birleştirme hatası:', error);
      return [];
    }
  }

  // ============== SENKRONİZASYON ==============

  // Local'deki tüm taslakları API'ya yükle
  async syncDrafts() {
    try {
      const drafts = await this.getDrafts();
      const results = [];
      
      for (const draft of drafts) {
        try {
          const result = await this.publishNote(draft);
          if (result.success) {
            await this.deleteDraft(draft.key);
          }
          results.push({ draft: draft.title, success: result.success });
        } catch (error) {
          results.push({ draft: draft.title, success: false, error });
        }
      }
      
      return results;
    } catch (error) {
      console.error('Senkronizasyon hatası:', error);
      return [];
    }
  }
}

export default new NoteStorageService();
