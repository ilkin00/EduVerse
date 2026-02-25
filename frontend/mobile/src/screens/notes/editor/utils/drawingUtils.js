import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { captureRef } from 'react-native-view-shot';

// Canvas'ı PNG olarak kaydet
export const saveDrawingAsPNG = async (viewRef, filename) => {
  try {
    const uri = await captureRef(viewRef, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });
    
    const newUri = `${FileSystem.documentDirectory}${filename}.png`;
    await FileSystem.moveAsync({
      from: uri,
      to: newUri
    });
    
    return newUri;
  } catch (error) {
    console.error('PNG kaydetme hatası:', error);
    return null;
  }
};

// Canvas'ı SVG olarak kaydet (vektör)
export const saveDrawingAsSVG = (strokes, width, height) => {
  try {
    let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    strokes.forEach((stroke, index) => {
      svgContent += `<path 
        d="${stroke.path}" 
        stroke="${stroke.color}" 
        stroke-width="${stroke.width}" 
        fill="none" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />`;
    });
    
    svgContent += '</svg>';
    return svgContent;
  } catch (error) {
    console.error('SVG kaydetme hatası:', error);
    return null;
  }
};

// Taslak kaydet (çizim verisi + PNG)
export const saveDraft = async (viewRef, drawingData, noteId) => {
  try {
    // PNG olarak kaydet (önizleme için)
    const pngUri = await saveDrawingAsPNG(viewRef, `draft_${noteId}_preview`);
    
    // Çizim verisini JSON olarak kaydet (düzenleme için)
    const drawingJson = JSON.stringify(drawingData);
    const jsonUri = `${FileSystem.documentDirectory}draft_${noteId}_data.json`;
    await FileSystem.writeAsStringAsync(jsonUri, drawingJson);
    
    return {
      pngUri,
      jsonUri,
      drawingData: drawingJson
    };
  } catch (error) {
    console.error('Taslak kaydetme hatası:', error);
    return null;
  }
};

// Taslak yükle
export const loadDraft = async (noteId) => {
  try {
    const jsonUri = `${FileSystem.documentDirectory}draft_${noteId}_data.json`;
    const jsonContent = await FileSystem.readAsStringAsync(jsonUri);
    return JSON.parse(jsonContent);
  } catch (error) {
    console.error('Taslak yükleme hatası:', error);
    return null;
  }
};

// Paylaş
export const shareDrawing = async (uri) => {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
  }
};
