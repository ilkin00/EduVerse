import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

// Web için direkt DOM editörü
const WebRichEditor = ({ onChange, initialContent }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (Platform.OS === 'web' && editorRef.current) {
      // Web'de contentEditable div oluştur
      const editor = editorRef.current;
      editor.innerHTML = initialContent || '';
      
      editor.addEventListener('input', (e) => {
        onChange(e.target.innerHTML);
      });
    }
  }, []);

  if (Platform.OS !== 'web') return null;

  return (
    <div
      ref={editorRef}
      style={{
        minHeight: 400,
        padding: 16,
        backgroundColor: '#1A1A2E',
        color: 'white',
        fontSize: 16,
        lineHeight: 1.6,
        borderRadius: 12,
        border: '1px solid rgba(255,255,255,0.1)',
        outline: 'none',
        overflowY: 'auto',
      }}
      contentEditable
      suppressContentEditableWarning
    />
  );
};

// Native için TextInput
const NativeEditor = ({ onChange, initialContent }) => {
  const [text, setText] = useState(initialContent || '');

  return (
    <TextInput
      style={styles.nativeEditor}
      multiline
      value={text}
      onChangeText={(newText) => {
        setText(newText);
        onChange(newText);
      }}
      placeholder="Notunuzu yazın..."
      placeholderTextColor="#666"
      textAlignVertical="top"
    />
  );
};

// Formula ekleme modalı
const FormulaModal = ({ visible, onClose, onInsert }) => {
  const [formula, setFormula] = useState('');

  const templates = [
    { name: 'Kesir', latex: '\\frac{a}{b}', preview: 'a/b' },
    { name: 'Karekök', latex: '\\sqrt{x}', preview: '√x' },
    { name: 'Üs', latex: 'x^{2}', preview: 'x²' },
    { name: 'İndis', latex: 'x_{i}', preview: 'xᵢ' },
    { name: 'İntegral', latex: '∫', preview: '∫' },
    { name: 'Toplam', latex: '∑', preview: '∑' },
    { name: 'Pi', latex: 'π', preview: 'π' },
    { name: 'Theta', latex: 'θ', preview: 'θ' },
    { name: 'Delta', latex: 'Δ', preview: 'Δ' },
    { name: 'Alpha', latex: 'α', preview: 'α' },
    { name: 'Beta', latex: 'β', preview: 'β' },
    { name: 'Gamma', latex: 'γ', preview: 'γ' },
    { name: 'Sigma', latex: 'σ', preview: 'σ' },
    { name: 'Omega', latex: 'ω', preview: 'ω' },
    { name: 'Ok', latex: '→', preview: '→' },
    { name: 'Denge', latex: '⇌', preview: '⇌' },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Formül Ekle</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.templateList}>
            {templates.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.templateItem}
                onPress={() => {
                  onInsert(item.latex);
                  onClose();
                }}
              >
                <View style={styles.templatePreview}>
                  <Text style={styles.templatePreviewText}>{item.preview}</Text>
                </View>
                <Text style={styles.templateName}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.customFormula}>
            <TextInput
              style={styles.formulaInput}
              placeholder="Özel formül yaz"
              placeholderTextColor="#666"
              value={formula}
              onChangeText={setFormula}
            />
            <TouchableOpacity
              style={styles.insertButton}
              onPress={() => {
                if (formula) {
                  onInsert(formula);
                  setFormula('');
                  onClose();
                }
              }}
            >
              <Text style={styles.insertButtonText}>Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function ProNoteEditor({ route, navigation }) {
  const { noteId, initialTitle, initialContent } = route.params || {};
  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [showFormulaModal, setShowFormulaModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Hızlı matematik sembolleri
  const mathSymbols = [
    { symbol: '²', insert: '^2', label: 'Kare' },
    { symbol: '³', insert: '^3', label: 'Küp' },
    { symbol: '√', insert: '√', label: 'Karekök' },
    { symbol: 'π', insert: 'π', label: 'Pi' },
    { symbol: '∞', insert: '∞', label: 'Sonsuz' },
    { symbol: '∑', insert: '∑', label: 'Toplam' },
    { symbol: '∫', insert: '∫', label: 'İntegral' },
    { symbol: '∂', insert: '∂', label: 'Kısmi' },
    { symbol: '∇', insert: '∇', label: 'Nabla' },
    { symbol: '∈', insert: '∈', label: 'Elemanı' },
    { symbol: '⊂', insert: '⊂', label: 'Alt Küme' },
    { symbol: '∪', insert: '∪', label: 'Birleşim' },
    { symbol: '∩', insert: '∩', label: 'Kesişim' },
    { symbol: '→', insert: '→', label: 'Sağ ok' },
    { symbol: '⇌', insert: '⇌', label: 'Denge' },
    { symbol: 'α', insert: 'α', label: 'Alfa' },
    { symbol: 'β', insert: 'β', label: 'Beta' },
    { symbol: 'γ', insert: 'γ', label: 'Gama' },
    { symbol: 'θ', insert: 'θ', label: 'Teta' },
  ];

  const insertMath = (symbol) => {
    setContent(prev => prev + ' ' + symbol + ' ');
  };

  const saveNote = async () => {
    if (!title.trim()) {
      Alert.alert('Hata', 'Başlık giriniz');
      return;
    }

    try {
      if (noteId) {
        await api.put(`/notes/${noteId}`, { title, content });
      } else {
        await api.post('/notes/', { title, content, note_type: 'text' });
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Hata', 'Not kaydedilemedi');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {noteId ? 'Not Düzenle' : 'Yeni Not'}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setShowPreview(!showPreview)} style={styles.headerButton}>
            <Ionicons name={showPreview ? 'eye-off' : 'eye'} size={24} color="#6366F1" />
          </TouchableOpacity>
          <TouchableOpacity onPress={saveNote} style={styles.headerButton}>
            <Ionicons name="checkmark" size={24} color="#6366F1" />
          </TouchableOpacity>
        </View>
      </View>

      <TextInput
        style={styles.titleInput}
        placeholder="Başlık"
        placeholderTextColor="#666"
        value={title}
        onChangeText={setTitle}
      />

      {showPreview ? (
        <ScrollView style={styles.preview}>
          <Text style={styles.previewTitle}>{title}</Text>
          <Text style={styles.previewContent}>{content}</Text>
        </ScrollView>
      ) : (
        <>
          {/* Matematik sembolleri toolbar */}
          <ScrollView horizontal style={styles.mathToolbar}>
            <TouchableOpacity 
              style={styles.mathToolbarButton}
              onPress={() => setShowFormulaModal(true)}
            >
              <Ionicons name="add-circle" size={24} color="#6366F1" />
              <Text style={styles.mathToolbarText}>Formül</Text>
            </TouchableOpacity>
            
            {mathSymbols.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.mathToolbarButton}
                onPress={() => insertMath(item.insert)}
              >
                <Text style={styles.mathToolbarSymbol}>{item.symbol}</Text>
                <Text style={styles.mathToolbarText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Platforma göre editor seçimi */}
          {Platform.OS === 'web' ? (
            <View style={styles.webEditorContainer}>
              <WebRichEditor 
                onChange={setContent}
                initialContent={content}
              />
            </View>
          ) : (
            <View style={styles.nativeEditorContainer}>
              <NativeEditor 
                onChange={setContent}
                initialContent={content}
              />
            </View>
          )}
        </>
      )}

      {/* Formül ekleme modalı */}
      <FormulaModal
        visible={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        onInsert={insertMath}
      />
    </KeyboardAvoidingView>
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
    backgroundColor: '#1A1A2E',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  titleInput: {
    backgroundColor: '#1A1A2E',
    padding: 16,
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  mathToolbar: {
    backgroundColor: '#1A1A2E',
    paddingVertical: 10,
    paddingHorizontal: 16,
    maxHeight: 80,
  },
  mathToolbarButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    width: 60,
  },
  mathToolbarSymbol: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  mathToolbarText: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
  },
  webEditorContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#1A1A2E',
    margin: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  nativeEditorContainer: {
    flex: 1,
    padding: 16,
  },
  nativeEditor: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    textAlignVertical: 'top',
  },
  preview: {
    flex: 1,
    padding: 20,
  },
  previewTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  previewContent: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#1A1A2E',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  templateList: {
    maxHeight: 300,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  templatePreview: {
    width: 60,
    backgroundColor: '#0A0A0F',
    padding: 8,
    borderRadius: 8,
    marginRight: 12,
  },
  templatePreviewText: {
    color: '#6366F1',
    fontSize: 14,
    textAlign: 'center',
  },
  templateName: {
    color: '#fff',
    fontSize: 14,
  },
  customFormula: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  formulaInput: {
    flex: 1,
    backgroundColor: '#0A0A0F',
    borderRadius: 8,
    padding: 12,
    color: '#fff',
    fontSize: 14,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  insertButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
  },
  insertButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
