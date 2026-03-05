import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Slider,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Toolbar = ({ 
  // Araç seçimi
  onSelectTool,
  onSelectColor,
  onSelectWidth,
  onSelectPaper,
  onInsertSymbol,
  
  // Düzenleme
  onUndo,
  onRedo,
  onClear,
  
  // Aktif değerler
  currentTool = 'pen',
  currentColor = '#000000',
  currentWidth = 2,
}) => {
  
  // Modal state'leri
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showWidthPicker, setShowWidthPicker] = useState(false);
  const [showMathSymbols, setShowMathSymbols] = useState(false);
  const [showPhysicsSymbols, setShowPhysicsSymbols] = useState(false);
  const [showChemistrySymbols, setShowChemistrySymbols] = useState(false);

  // Renk paleti
  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008000', '#800000', '#008080',
    '#6366F1', '#10B981', '#EC4899', '#8B5CF6',
    '#F59E0B', '#EF4444', '#3B82F6', '#14B8A6',
  ];

  // Fırça boyutları
  const brushSizes = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20];

  // Matematik sembolleri
  const mathSymbols = [
    '²', '³', '√', '∛', '∜', 'π', '∞', '∑', '∫',
    '∂', '∇', '∈', '∉', '⊂', '⊃', '∪', '∩', '→',
    '←', '⇌', 'α', 'β', 'γ', 'θ', 'λ', 'μ', 'σ', 'ω',
    '±', '∓', '×', '÷', '≠', '≈', '≡', '≤', '≥',
  ];

  // Fizik sembolleri
  const physicsSymbols = [
    'α', 'β', 'γ', 'Δ', 'θ', 'λ', 'μ', 'σ', 'ω', 'Ω',
    'ℏ', 'Å', '°C', '°F', 'K', 'N', 'J', 'W', 'Hz',
    'C', 'V', 'Ω', 'F', 'T', 'G', 'H', 'eV', 'ly',
  ];

  // Kimya sembolleri
  const chemistrySymbols = [
    'H₂O', 'CO₂', 'CH₄', 'NH₃', 'NaCl', 'HCl',
    'H₂SO₄', 'HNO₃', 'C₆H₁₂O₆', '→', '⇌', '↑', '↓', 'Δ',
    'Na⁺', 'Cl⁻', 'SO₄²⁻', 'Fe³⁺', 'OH⁻', 'H⁺',
  ];

  // Kağıt tipleri
  const papers = [
    { id: 'blank', name: 'Boş', icon: 'square-outline' },
    { id: 'lined', name: 'Çizgili', icon: 'menu-outline' },
    { id: 'grid', name: 'Kareli', icon: 'grid-outline' },
    { id: 'dotted', name: 'Noktalı', icon: 'ellipsis-horizontal' },
  ];

  // Araçlar
  const tools = [
    { id: 'pen', name: 'Kalem', icon: 'create-outline', color: '#6366F1' },
    { id: 'highlighter', name: 'Fosforlu', icon: 'color-fill-outline', color: '#10B981' },
    { id: 'eraser', name: 'Silgi', icon: 'trash-outline', color: '#EF4444' },
    { id: 'text', name: 'Yazı', icon: 'text-outline', color: '#8B5CF6' },
  ];

  // Tool seçildiğinde
  const handleToolSelect = (toolId) => {
    console.log('🛠️ Araç seçildi:', toolId);
    
    if (toolId === 'eraser') {
      // Silgi seçildiyse rengi beyaz yap
      onSelectColor?.('#FFFFFF');
    } else if (toolId === 'highlighter') {
      // Fosforlu kalem seçildiyse sarı yap
      onSelectColor?.('#FFFF00');
    } else if (toolId === 'pen') {
      // Normal kalem seçildiyse siyah yap
      onSelectColor?.('#000000');
    }
    
    onSelectTool?.(toolId);
  };

  // Renk seçildiğinde
  const handleColorSelect = (color) => {
    console.log('🎨 Renk seçildi:', color);
    onSelectColor?.(color);
    
    // Renk seçildiğinde otomatik olarak kalem moduna geç
    if (currentTool !== 'pen') {
      onSelectTool?.('pen');
    }
    
    setShowColorPicker(false);
  };

  // Fırça boyutu seçildiğinde
  const handleWidthSelect = (width) => {
    console.log('✏️ Fırça boyutu:', width);
    onSelectWidth?.(width);
    setShowWidthPicker(false);
  };

  // Sembol eklendiğinde
  const handleSymbolInsert = (symbol) => {
    console.log('🔣 Sembol eklendi:', symbol);
    onInsertSymbol?.(symbol);
  };

  // Kağıt tipi seçildiğinde
  const handlePaperSelect = (paperId) => {
    console.log('📄 Kağıt tipi:', paperId);
    onSelectPaper?.(paperId);
  };

  // Silgi aktif mi kontrol et
  const isEraserActive = currentTool === 'eraser';
  const isHighlighterActive = currentTool === 'highlighter';

  // Renk seçici modal
  const renderColorPicker = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showColorPicker}
      onRequestClose={() => setShowColorPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Renk Seç</Text>
            <TouchableOpacity onPress={() => setShowColorPicker(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.colorGrid}>
            {colors.map((color, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.colorItem,
                  { backgroundColor: color },
                  currentColor === color && styles.activeColor,
                ]}
                onPress={() => handleColorSelect(color)}
              >
                {currentColor === color && (
                  <Ionicons name="checkmark" size={20} color="#fff" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  // Fırça boyutu seçici
  const renderWidthPicker = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showWidthPicker}
      onRequestClose={() => setShowWidthPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Fırça Boyutu</Text>
            <TouchableOpacity onPress={() => setShowWidthPicker(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.widthContainer}>
            <View style={styles.widthPreview}>
              <View 
                style={[
                  styles.widthPreviewLine, 
                  { 
                    width: currentWidth * 4,
                    height: currentWidth * 4,
                    borderRadius: currentWidth * 2,
                    backgroundColor: isEraserActive ? '#FFF' : currentColor,
                  }
                ]} 
              />
            </View>
            
            <Slider
              style={styles.widthSlider}
              minimumValue={2}
              maximumValue={20}
              step={1}
              value={currentWidth}
              onValueChange={onSelectWidth}
              minimumTrackTintColor="#6366F1"
              maximumTrackTintColor="#333"
              thumbTintColor="#6366F1"
            />
            
            <Text style={styles.widthValue}>{currentWidth} px</Text>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.widthOptions}>
                {brushSizes.map((size, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.widthOption,
                      currentWidth === size && styles.activeWidthOption,
                    ]}
                    onPress={() => handleWidthSelect(size)}
                  >
                    <View 
                      style={[
                        styles.widthOptionDot,
                        { 
                          width: size * 1.5, 
                          height: size * 1.5, 
                          borderRadius: size,
                          backgroundColor: isEraserActive ? '#FFF' : currentColor,
                        }
                      ]} 
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );

  // Sembol modalı
  const renderSymbolModal = (title, symbols, setVisible) => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={true}
      onRequestClose={() => setVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          
          <ScrollView contentContainerStyle={styles.symbolGrid}>
            {symbols.map((symbol, index) => (
              <TouchableOpacity
                key={index}
                style={styles.symbolButton}
                onPress={() => {
                  handleSymbolInsert(symbol);
                  setVisible(false);
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
            style={[
              styles.toolButton, 
              currentTool === tool.id && styles.activeTool,
              tool.id === 'eraser' && isEraserActive && styles.eraserActive,
            ]}
            onPress={() => handleToolSelect(tool.id)}
          >
            <Ionicons 
              name={tool.icon} 
              size={22} 
              color={currentTool === tool.id ? tool.color : '#fff'} 
            />
            <Text style={[
              styles.toolText, 
              currentTool === tool.id && { color: tool.color }
            ]}>
              {tool.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* İkinci Araç Çubuğu */}
      <View style={styles.secondToolbar}>
        {/* Renk ve fırça boyutu */}
        <View style={styles.toolGroup}>
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowColorPicker(true)}
          >
            <View style={[styles.colorPreview, { backgroundColor: currentColor }]} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton}
            onPress={() => setShowWidthPicker(true)}
          >
            <View 
              style={[
                styles.widthPreviewIcon,
                { 
                  width: currentWidth * 2,
                  height: currentWidth * 2,
                  borderRadius: currentWidth,
                  backgroundColor: isEraserActive ? '#FFF' : currentColor,
                }
              ]} 
            />
          </TouchableOpacity>
        </View>

        {/* Kağıt seçici */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.toolGroup}>
            {papers.map(paper => (
              <TouchableOpacity
                key={paper.id}
                style={styles.iconButton}
                onPress={() => handlePaperSelect(paper.id)}
              >
                <Ionicons name={paper.icon} size={18} color="#fff" />
                <Text style={styles.iconText}>{paper.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Düzenleme butonları */}
        <View style={styles.toolGroup}>
          <TouchableOpacity style={styles.iconButton} onPress={onUndo}>
            <Ionicons name="arrow-undo" size={18} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={onRedo}>
            <Ionicons name="arrow-redo" size={18} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.iconButton} onPress={onClear}>
            <Ionicons name="trash-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sembol Araç Çubuğu */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.symbolToolbar}>
        <TouchableOpacity 
          style={styles.symbolCategory}
          onPress={() => setShowMathSymbols(true)}
        >
          <Ionicons name="calculator" size={16} color="#6366F1" />
          <Text style={styles.symbolCategoryText}>Matematik</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.symbolCategory}
          onPress={() => setShowPhysicsSymbols(true)}
        >
          <Ionicons name="flash" size={16} color="#10B981" />
          <Text style={styles.symbolCategoryText}>Fizik</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.symbolCategory}
          onPress={() => setShowChemistrySymbols(true)}
        >
          <Ionicons name="flask" size={16} color="#EC4899" />
          <Text style={styles.symbolCategoryText}>Kimya</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Modallar */}
      {showColorPicker && renderColorPicker()}
      {showWidthPicker && renderWidthPicker()}
      
      {showMathSymbols && renderSymbolModal('Matematik Sembolleri', mathSymbols, setShowMathSymbols)}
      {showPhysicsSymbols && renderSymbolModal('Fizik Sembolleri', physicsSymbols, setShowPhysicsSymbols)}
      {showChemistrySymbols && renderSymbolModal('Kimya Sembolleri', chemistrySymbols, setShowChemistrySymbols)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A2E',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 8,
  },
  toolbar: {
    flexDirection: 'row',
    padding: 8,
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
  eraserActive: {
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
  toolText: {
    color: '#fff',
    fontSize: 11,
    marginTop: 4,
  },
  secondToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  toolGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  iconText: {
    color: '#fff',
    fontSize: 11,
  },
  colorPreview: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  widthPreviewIcon: {
    backgroundColor: '#fff',
  },
  symbolToolbar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  symbolCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0F',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 4,
  },
  symbolCategoryText: {
    color: '#fff',
    fontSize: 11,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
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
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 20,
  },
  colorItem: {
    width: 44,
    height: 44,
    borderRadius: 22,
    margin: 6,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  activeColor: {
    borderWidth: 3,
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  widthContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  widthPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  widthPreviewLine: {
    backgroundColor: '#6366F1',
  },
  widthSlider: {
    width: '100%',
    height: 40,
    marginBottom: 20,
  },
  widthValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  widthOptions: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    gap: 10,
  },
  widthOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0A0A0F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeWidthOption: {
    borderColor: '#6366F1',
  },
  widthOptionDot: {
    backgroundColor: '#fff',
  },
  symbolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 20,
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
    fontSize: 18,
  },
});

export default Toolbar;
