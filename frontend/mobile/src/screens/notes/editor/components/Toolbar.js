import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../../../context/LanguageContext';

const Toolbar = ({ 
  onSelectTool,
  onSelectColor,
  onSelectPaper,
  onInsertSymbol,
  currentTool = 'pen',
  currentColor = '#000000',
}) => {
  const { t } = useLanguage();
  const [showMathSymbols, setShowMathSymbols] = useState(false);
  const [showPhysicsSymbols, setShowPhysicsSymbols] = useState(false);
  const [showChemistrySymbols, setShowChemistrySymbols] = useState(false);

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008000', '#800000', '#008080',
  ];

  const mathSymbols = [
    '²', '³', '√', '∛', '∜', 'π', '∞', '∑', '∫',
    '∂', '∇', '∈', '∉', '⊂', '⊃', '∪', '∩', '→',
    '←', '⇌', 'α', 'β', 'γ', 'θ', 'λ', 'μ', 'σ', 'ω',
    '±', '∓', '×', '÷', '≠', '≈', '≡', '≤', '≥',
  ];

  const physicsSymbols = [
    'α', 'β', 'γ', 'Δ', 'θ', 'λ', 'μ', 'σ', 'ω', 'Ω',
    'ℏ', 'Å', '°C', '°F', 'K', 'N', 'J', 'W', 'Hz',
    'C', 'V', 'Ω', 'F', 'T', 'G', 'H', 'eV', 'ly',
  ];

  const chemistrySymbols = [
    'H₂O', 'CO₂', 'CH₄', 'NH₃', 'NaCl', 'HCl',
    'H₂SO₄', 'HNO₃', 'C₆H₁₂O₆', '→', '⇌', '↑', '↓', 'Δ',
    'Na⁺', 'Cl⁻', 'SO₄²⁻', 'Fe³⁺', 'OH⁻', 'H⁺',
  ];

  const papers = [
    { id: 'blank', name: 'Boş', icon: 'square-outline' },
    { id: 'lined', name: 'Çizgili', icon: 'menu-outline' },
    { id: 'grid', name: 'Damalı', icon: 'grid-outline' },
    { id: 'dotted', name: 'Noktalı', icon: 'ellipsis-horizontal' },
  ];

  const tools = [
    { id: 'pen', name: 'Kalem', icon: 'create-outline', color: '#6366F1' },
    { id: 'highlighter', name: 'Fosforlu', icon: 'color-fill-outline', color: '#10B981' },
    { id: 'eraser', name: 'Silgi', icon: 'trash-outline', color: '#EF4444' }, // erase-outline yerine trash-outline
    { id: 'text', name: 'Yazı', icon: 'text-outline', color: '#8B5CF6' },
    { id: 'formula', name: 'Formül', icon: 'calculator-outline', color: '#EC4899' },
  ];

  const renderSymbolModal = (title, symbols, onSelect) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => onSelect(null)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => onSelect(null)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.symbolGrid}>
            {symbols.map((symbol, index) => (
              <TouchableOpacity
                key={index}
                style={styles.symbolButton}
                onPress={() => {
                  onInsertSymbol?.(symbol);
                  onSelect(null);
                }}
              >
                <Text style={styles.symbolText}>{symbol}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Ana Araç Çubuğu */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.toolbar}>
        {tools.map(tool => (
          <TouchableOpacity
            key={tool.id}
            style={[styles.toolButton, currentTool === tool.id && styles.activeTool]}
            onPress={() => onSelectTool?.(tool.id)}
          >
            <Ionicons 
              name={tool.icon} 
              size={24} 
              color={currentTool === tool.id ? tool.color : '#fff'} 
            />
            <Text style={[styles.toolText, currentTool === tool.id && { color: tool.color }]}>
              {tool.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* İkinci Araç Çubuğu */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subToolbar}>
        {/* Renk Seçici */}
        <ScrollView horizontal style={styles.colorPicker}>
          {colors.map(color => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorButton,
                { backgroundColor: color },
                currentColor === color && styles.activeColor,
              ]}
              onPress={() => onSelectColor?.(color)}
            />
          ))}
        </ScrollView>

        {/* Kağıt Seçici */}
        <ScrollView horizontal>
          {papers.map(paper => (
            <TouchableOpacity
              key={paper.id}
              style={styles.paperButton}
              onPress={() => onSelectPaper?.(paper.id)}
            >
              <Ionicons name={paper.icon} size={20} color="#fff" />
              <Text style={styles.paperText}>{paper.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>

      {/* Sembol Araç Çubuğu */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.symbolToolbar}>
        <TouchableOpacity 
          style={styles.symbolCategory}
          onPress={() => setShowMathSymbols(true)}
        >
          <Ionicons name="calculator" size={20} color="#6366F1" />
          <Text style={styles.symbolCategoryText}>Matematik</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.symbolCategory}
          onPress={() => setShowPhysicsSymbols(true)}
        >
          <Ionicons name="flash" size={20} color="#10B981" />
          <Text style={styles.symbolCategoryText}>Fizik</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.symbolCategory}
          onPress={() => setShowChemistrySymbols(true)}
        >
          <Ionicons name="flask" size={20} color="#EC4899" />
          <Text style={styles.symbolCategoryText}>Kimya</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modallar */}
      {showMathSymbols && renderSymbolModal('Matematik Sembolleri', mathSymbols, (symbol) => {
        setShowMathSymbols(false);
      })}

      {showPhysicsSymbols && renderSymbolModal('Fizik Sembolleri', physicsSymbols, (symbol) => {
        setShowPhysicsSymbols(false);
      })}

      {showChemistrySymbols && renderSymbolModal('Kimya Sembolleri', chemistrySymbols, (symbol) => {
        setShowChemistrySymbols(false);
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  toolbar: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  toolButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
    backgroundColor: '#0A0A0F',
  },
  activeTool: {
    backgroundColor: 'rgba(99,102,241,0.2)',
  },
  toolText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  subToolbar: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  colorPicker: {
    flexDirection: 'row',
    marginRight: 16,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeColor: {
    borderColor: '#fff',
  },
  paperButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  paperText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  symbolToolbar: {
    flexDirection: 'row',
    padding: 10,
  },
  symbolCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  symbolCategoryText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
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
  symbolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  symbolButton: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    backgroundColor: '#0A0A0F',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  symbolText: {
    color: '#fff',
    fontSize: 20,
  },
});

export default Toolbar;
