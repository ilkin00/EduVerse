import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

// Matematik sembolleri
const mathSymbols = [
  { symbol: 'x²', insert: 'x^2', label: 'Üs' },
  { symbol: 'x³', insert: 'x^3', label: 'Küp' },
  { symbol: '√', insert: '√()', label: 'Karekök' },
  { symbol: '∛', insert: '∛()', label: 'Küpkök' },
  { symbol: 'π', insert: 'π', label: 'Pi' },
  { symbol: '∞', insert: '∞', label: 'Sonsuz' },
  { symbol: '∑', insert: '∑', label: 'Toplam' },
  { symbol: '∫', insert: '∫', label: 'İntegral' },
  { symbol: '∂', insert: '∂', label: 'Kısmi' },
  { symbol: '∇', insert: '∇', label: 'Nabla' },
  { symbol: '∈', insert: '∈', label: 'Elemanı' },
  { symbol: '∉', insert: '∉', label: 'Elemanı Değil' },
  { symbol: '⊂', insert: '⊂', label: 'Alt Küme' },
  { symbol: '⊃', insert: '⊃', label: 'Üst Küme' },
  { symbol: '∩', insert: '∩', label: 'Kesişim' },
  { symbol: '∪', insert: '∪', label: 'Birleşim' },
];

// Fizik sembolleri
const physicsSymbols = [
  { symbol: 'α', insert: 'α', label: 'Alfa' },
  { symbol: 'β', insert: 'β', label: 'Beta' },
  { symbol: 'γ', insert: 'γ', label: 'Gama' },
  { symbol: 'Δ', insert: 'Δ', label: 'Delta' },
  { symbol: 'θ', insert: 'θ', label: 'Teta' },
  { symbol: 'λ', insert: 'λ', label: 'Lambda' },
  { symbol: 'μ', insert: 'μ', label: 'Mi' },
  { symbol: 'σ', insert: 'σ', label: 'Sigma' },
  { symbol: 'ω', insert: 'ω', label: 'Omega' },
  { symbol: 'Ω', insert: 'Ω', label: 'Omega (büyük)' },
  { symbol: 'ℏ', insert: 'ℏ', label: 'Planck' },
  { symbol: 'Å', insert: 'Å', label: 'Angstrom' },
];

// Kimya sembolleri
const chemSymbols = [
  { symbol: '→', insert: '→', label: 'Tepkime' },
  { symbol: '⇌', insert: '⇌', label: 'Denge' },
  { symbol: '↑', insert: '↑', label: 'Gaz çıkışı' },
  { symbol: '↓', insert: '↓', label: 'Çökelme' },
  { symbol: '°C', insert: '°C', label: 'Derece' },
  { symbol: '∆', insert: '∆', label: 'Isı' },
  { symbol: 'H₂O', insert: 'H₂O', label: 'Su' },
  { symbol: 'CO₂', insert: 'CO₂', label: 'Karbondioksit' },
  { symbol: 'Na⁺', insert: 'Na⁺', label: 'Sodyum iyon' },
  { symbol: 'Cl⁻', insert: 'Cl⁻', label: 'Klor iyon' },
];

export default function NoteEditorScreen({ route, navigation }) {
  const { noteId, initialTitle, initialContent } = route.params || {};
  const [title, setTitle] = useState(initialTitle || '');
  const [content, setContent] = useState(initialContent || '');
  const [showMathMenu, setShowMathMenu] = useState(false);
  const [showPhysicsMenu, setShowPhysicsMenu] = useState(false);
  const [showChemMenu, setShowChemMenu] = useState(false);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const inputRef = React.useRef(null);

  const insertSymbol = (symbol) => {
    const newContent = content.substring(0, selection.start) + 
                      symbol + 
                      content.substring(selection.end);
    setContent(newContent);
    
    // İmleci sembolün sonuna getir
    setTimeout(() => {
      const newPosition = selection.start + symbol.length;
      inputRef.current?.setNativeProps({
        selection: { start: newPosition, end: newPosition }
      });
    }, 100);
  };

  const insertMathTemplate = (template) => {
    let insertText = '';
    switch(template) {
      case 'fraction':
        insertText = ' \\frac{}{} ';
        break;
      case 'sqrt':
        insertText = ' \\sqrt{} ';
        break;
      case 'power':
        insertText = ' ^{} ';
        break;
      case 'index':
        insertText = ' _{} ';
        break;
      default:
        insertText = template;
    }
    insertSymbol(insertText);
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

  const renderMathMenu = () => (
    <View style={styles.menuContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <TouchableOpacity style={styles.menuItem} onPress={() => insertMathTemplate('fraction')}>
          <Text style={styles.menuItemText}>a/b</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => insertMathTemplate('sqrt')}>
          <Text style={styles.menuItemText}>√</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => insertMathTemplate('power')}>
          <Text style={styles.menuItemText}>xⁿ</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => insertMathTemplate('index')}>
          <Text style={styles.menuItemText}>xₙ</Text>
        </TouchableOpacity>
        {mathSymbols.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem}
            onPress={() => insertSymbol(item.insert)}
          >
            <Text style={styles.menuItemText}>{item.symbol}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderPhysicsMenu = () => (
    <View style={styles.menuContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {physicsSymbols.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem}
            onPress={() => insertSymbol(item.insert)}
          >
            <Text style={styles.menuItemText}>{item.symbol}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderChemMenu = () => (
    <View style={styles.menuContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {chemSymbols.map((item, index) => (
          <TouchableOpacity 
            key={index} 
            style={styles.menuItem}
            onPress={() => insertSymbol(item.insert)}
          >
            <Text style={styles.menuItemText}>{item.symbol}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Not Düzenle</Text>
        <TouchableOpacity onPress={saveNote}>
          <Ionicons name="checkmark" size={24} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {/* Toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity 
          style={[styles.toolbarButton, showMathMenu && styles.toolbarButtonActive]}
          onPress={() => {
            setShowMathMenu(!showMathMenu);
            setShowPhysicsMenu(false);
            setShowChemMenu(false);
          }}
        >
          <Ionicons name="calculator" size={20} color={showMathMenu ? '#6366F1' : '#fff'} />
          <Text style={[styles.toolbarText, showMathMenu && styles.toolbarTextActive]}>Matematik</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.toolbarButton, showPhysicsMenu && styles.toolbarButtonActive]}
          onPress={() => {
            setShowPhysicsMenu(!showPhysicsMenu);
            setShowMathMenu(false);
            setShowChemMenu(false);
          }}
        >
          <Ionicons name="flash" size={20} color={showPhysicsMenu ? '#6366F1' : '#fff'} />
          <Text style={[styles.toolbarText, showPhysicsMenu && styles.toolbarTextActive]}>Fizik</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.toolbarButton, showChemMenu && styles.toolbarButtonActive]}
          onPress={() => {
            setShowChemMenu(!showChemMenu);
            setShowMathMenu(false);
            setShowPhysicsMenu(false);
          }}
        >
          <Ionicons name="flask" size={20} color={showChemMenu ? '#6366F1' : '#fff'} />
          <Text style={[styles.toolbarText, showChemMenu && styles.toolbarTextActive]}>Kimya</Text>
        </TouchableOpacity>
      </View>

      {/* Symbol Menus */}
      {showMathMenu && renderMathMenu()}
      {showPhysicsMenu && renderPhysicsMenu()}
      {showChemMenu && renderChemMenu()}

      {/* Editor */}
      <ScrollView style={styles.editor}>
        <TextInput
          style={styles.titleInput}
          placeholder="Başlık"
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
        />
        
        <TextInput
          ref={inputRef}
          style={styles.contentInput}
          placeholder="Notunuzu yazın... (Matematik sembolleri için menüleri kullanın)"
          placeholderTextColor="#666"
          value={content}
          onChangeText={setContent}
          onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
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
  toolbar: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#0A0A0F',
  },
  toolbarButtonActive: {
    backgroundColor: 'rgba(99,102,241,0.2)',
  },
  toolbarText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 8,
  },
  toolbarTextActive: {
    color: '#6366F1',
  },
  menuContainer: {
    backgroundColor: '#1A1A2E',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#0A0A0F',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  menuItemText: {
    color: '#fff',
    fontSize: 16,
  },
  editor: {
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
