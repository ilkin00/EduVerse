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
    
    console.log(`💾 PNG kaydedildi: ${newUri}`);
    return newUri;
  } catch (error) {
    console.error('PNG kaydetme hatası:', error);
    return null;
  }
};

// Canvas'ı SVG olarak kaydet (vektör)
export const saveDrawingAsSVG = (strokes, width, height, backgroundColor = '#ffffff') => {
  try {
    let svgContent = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    
    // Arkaplan
    svgContent += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`;
    
    // Stroklar
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
    
    console.log(`💾 SVG oluşturuldu: ${Math.round(svgContent.length / 1024)} KB`);
    return svgContent;
  } catch (error) {
    console.error('SVG kaydetme hatası:', error);
    return null;
  }
};

// Canvas'ı PDF olarak kaydet
export const saveDrawingAsPDF = async (viewRef, strokes, title) => {
  try {
    // Önce PNG olarak kaydet
    const pngUri = await saveDrawingAsPNG(viewRef, `temp_${Date.now()}`);
    
    // PDF oluştur (basit HTML ile)
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${title}</title>
        <style>
          body { margin: 0; padding: 20px; }
          img { width: 100%; height: auto; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <img src="file://${pngUri}" />
        <p>Oluşturulma: ${new Date().toLocaleString()}</p>
      </body>
      </html>
    `;
    
    const pdfUri = `${FileSystem.documentDirectory}${title}.pdf`;
    await FileSystem.writeAsStringAsync(pdfUri, html);
    
    console.log(`💾 PDF kaydedildi: ${pdfUri}`);
    return pdfUri;
  } catch (error) {
    console.error('PDF kaydetme hatası:', error);
    return null;
  }
};

// Taslak kaydet (çizim verisi + PNG)
export const saveDraft = async (viewRef, drawingData, noteId) => {
  try {
    // PNG olarak kaydet (önizleme için)
    const pngUri = await saveDrawingAsPNG(viewRef, `draft_${noteId}_preview`);
    
    // Çizim verisini JSON olarak kaydet (düzenleme için)
    const drawingJson = JSON.stringify({
      ...drawingData,
      timestamp: Date.now(),
    });
    
    const jsonUri = `${FileSystem.documentDirectory}draft_${noteId}_data.json`;
    await FileSystem.writeAsStringAsync(jsonUri, drawingJson);
    
    console.log(`💾 Taslak kaydedildi: ${noteId}`);
    
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

// Taslak sil
export const deleteDraft = async (noteId) => {
  try {
    const jsonUri = `${FileSystem.documentDirectory}draft_${noteId}_data.json`;
    const pngUri = `${FileSystem.documentDirectory}draft_${noteId}_preview.png`;
    
    await FileSystem.deleteAsync(jsonUri, { idempotent: true });
    await FileSystem.deleteAsync(pngUri, { idempotent: true });
    
    console.log(`🗑️ Taslak silindi: ${noteId}`);
    return true;
  } catch (error) {
    console.error('Taslak silme hatası:', error);
    return false;
  }
};

// Paylaş
export const shareDrawing = async (uri) => {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri);
    return true;
  } else {
    console.log('Paylaşım desteklenmiyor');
    return false;
  }
};

// Çizimi temizle (nokta azaltma)
export const simplifyDrawing = (strokes, tolerance = 2) => {
  return strokes.map(stroke => {
    const points = stroke.path.split(/[ML]/).filter(p => p.trim()).map(p => {
      const [x, y] = p.split(',').map(Number);
      return { x, y };
    });
    
    if (points.length < 3) return stroke;
    
    const simplified = [];
    simplified.push(points[0]);
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      const angle = Math.abs(
        Math.atan2(next.y - prev.y, next.x - prev.x) -
        Math.atan2(curr.y - prev.y, curr.x - prev.x)
      );
      
      if (angle > 0.1 || 
          Math.abs(curr.x - prev.x) > tolerance || 
          Math.abs(curr.y - prev.y) > tolerance) {
        simplified.push(curr);
      }
    }
    
    simplified.push(points[points.length - 1]);
    
    // Yeni path oluştur
    let newPath = `M${simplified[0].x},${simplified[0].y}`;
    for (let i = 1; i < simplified.length; i++) {
      newPath += ` L${simplified[i].x},${simplified[i].y}`;
    }
    
    return {
      ...stroke,
      path: newPath,
    };
  });
};

// Çizim verisini sıkıştır (küçültülmüş versiyon)
export const compressDrawing = (strokes, maxStrokes = 100) => {
  if (strokes.length <= maxStrokes) return strokes;
  
  const step = Math.ceil(strokes.length / maxStrokes);
  const compressed = [];
  
  for (let i = 0; i < strokes.length; i += step) {
    compressed.push(strokes[i]);
  }
  
  console.log(`📊 Çizim sıkıştırıldı: ${strokes.length} -> ${compressed.length} stroke`);
  return compressed;
};
