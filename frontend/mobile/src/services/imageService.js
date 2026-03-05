import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

// Base64 boyutunu optimize et
export const optimizeBase64 = async (base64, maxWidth = 1024, maxHeight = 1024, quality = 0.8) => {
  try {
    console.log(`🖼️ Base64 optimize ediliyor: ${Math.round(base64.length / 1024)} KB`);
    
    // Base64'ü geçici dosyaya kaydet
    const tempUri = `${FileSystem.cacheDirectory}temp_image_${Date.now()}.jpg`;
    await FileSystem.writeAsStringAsync(tempUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Resmi manipüle et
    const manipulated = await ImageManipulator.manipulateAsync(
      tempUri,
      [{ resize: { width: maxWidth, height: maxHeight } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
    );

    // Base64'e çevir
    const optimizedBase64 = await FileSystem.readAsStringAsync(manipulated.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Geçici dosyayı temizle
    await FileSystem.deleteAsync(tempUri, { idempotent: true });
    await FileSystem.deleteAsync(manipulated.uri, { idempotent: true });

    console.log(`✅ Optimize edildi: ${Math.round(optimizedBase64.length / 1024)} KB (${Math.round((1 - optimizedBase64.length / base64.length) * 100)}% küçüldü)`);
    
    return optimizedBase64;
  } catch (error) {
    console.error('❌ Base64 optimize hatası:', error);
    return base64; // Hata durumunda orijinali döndür
  }
};

// Base64 boyutunu hesapla
export const getBase64Size = (base64) => {
  const sizeInBytes = Math.round((base64.length * 3) / 4); // Base64 -> byte
  const sizeInKB = Math.round(sizeInBytes / 1024);
  return { bytes: sizeInBytes, kb: sizeInKB };
};

// Base64'i kontrol et (çok büyükse uyar)
export const validateBase64Size = (base64, maxSizeKB = 1024) => {
  const { kb } = getBase64Size(base64);
  if (kb > maxSizeKB) {
    console.warn(`⚠️ Base64 çok büyük: ${kb} KB (max: ${maxSizeKB} KB)`);
    return false;
  }
  return true;
};

// Çizim verisini base64'e çevir (vektör çizim için)
export const drawingToBase64 = (strokes, width, height, backgroundColor = '#ffffff') => {
  try {
    // SVG oluştur
    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<rect width="100%" height="100%" fill="${backgroundColor}"/>`;
    
    strokes.forEach((stroke, index) => {
      svg += `<path 
        d="${stroke.path}" 
        stroke="${stroke.color}" 
        stroke-width="${stroke.width}" 
        fill="none" 
        stroke-linecap="round" 
        stroke-linejoin="round"
      />`;
    });
    
    svg += '</svg>';
    
    // SVG'yi base64'e çevir
    const base64 = btoa(svg);
    return `data:image/svg+xml;base64,${base64}`;
  } catch (error) {
    console.error('❌ SVG base64 hatası:', error);
    return null;
  }
};

// Çizim verisini sıkıştır (küçültülmüş versiyon)
export const compressDrawingData = (strokes, maxStrokes = 100) => {
  if (strokes.length <= maxStrokes) return strokes;
  
  // Çok fazla stroke varsa, örnekle
  const step = Math.ceil(strokes.length / maxStrokes);
  const compressed = [];
  
  for (let i = 0; i < strokes.length; i += step) {
    compressed.push(strokes[i]);
  }
  
  console.log(`📊 Çizim sıkıştırıldı: ${strokes.length} -> ${compressed.length} stroke`);
  return compressed;
};

// Taslak otomatik kaydetme
export const autoSaveDraft = async (key, data) => {
  try {
    const draftKey = `@draft_${key}`;
    const jsonData = JSON.stringify({
      ...data,
      timestamp: Date.now(),
    });
    
    await FileSystem.writeAsStringAsync(
      `${FileSystem.documentDirectory}${draftKey}.json`,
      jsonData
    );
    
    console.log(`💾 Taslak otomatik kaydedildi: ${key}`);
    return true;
  } catch (error) {
    console.error('❌ Taslak kaydetme hatası:', error);
    return false;
  }
};

// Taslak yükle
export const loadDraft = async (key) => {
  try {
    const draftKey = `@draft_${key}`;
    const jsonData = await FileSystem.readAsStringAsync(
      `${FileSystem.documentDirectory}${draftKey}.json`
    );
    
    return JSON.parse(jsonData);
  } catch (error) {
    return null;
  }
};

// Eski taslakları temizle (24 saatten eski)
export const cleanOldDrafts = async () => {
  try {
    const files = await FileSystem.readDirectoryAsync(FileSystem.documentDirectory);
    const draftFiles = files.filter(f => f.startsWith('@draft_'));
    
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    for (const file of draftFiles) {
      const content = await FileSystem.readAsStringAsync(
        `${FileSystem.documentDirectory}${file}`
      );
      const data = JSON.parse(content);
      
      if (now - data.timestamp > oneDay) {
        await FileSystem.deleteAsync(`${FileSystem.documentDirectory}${file}`);
        console.log(`🧹 Eski taslak silindi: ${file}`);
      }
    }
  } catch (error) {
    console.error('Taslak temizleme hatası:', error);
  }
};
