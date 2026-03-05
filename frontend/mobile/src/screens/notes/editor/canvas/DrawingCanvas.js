import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Svg, Path, G, Rect, Circle, Line } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Performans için maksimum stroke sayısı
const MAX_STROKES = 500;

const DrawingCanvas = ({ 
  strokes = [], 
  onStrokesChange,
  penColor = '#000000',
  penWidth = 2,
  paperType = 'blank',
  paperColor = '#ffffff',
  editable = true,
  width = SCREEN_WIDTH,
  height = SCREEN_HEIGHT * 0.6,
}) => {
  const [currentStrokes, setCurrentStrokes] = useState(strokes);
  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState(null);
  const [points, setPoints] = useState([]);
  const [simplifiedStrokes, setSimplifiedStrokes] = useState(strokes);
  
  const pathHistory = useRef([]);
  const renderCount = useRef(0);

  // Stroke'ları optimize et (çok fazla varsa)
  useEffect(() => {
    if (strokes.length > MAX_STROKES) {
      console.log(`⚠️ Çok fazla stroke (${strokes.length}), optimize ediliyor...`);
      const simplified = strokes.filter((_, index) => index % 2 === 0);
      setSimplifiedStrokes(simplified);
    } else {
      setSimplifiedStrokes(strokes);
    }
    setCurrentStrokes(strokes);
  }, [strokes]);

  // Noktaları basitleştir (Douglas-Peucker algoritması)
  const simplifyPoints = (points, tolerance = 2) => {
    if (points.length < 3) return points;
    
    const result = [];
    result.push(points[0]);
    
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];
      
      // Açıyı hesapla
      const angle = Math.abs(
        Math.atan2(next.y - prev.y, next.x - prev.x) -
        Math.atan2(curr.y - prev.y, curr.x - prev.x)
      );
      
      // Açı büyükse veya mesafe fazlaysa noktayı koru
      if (angle > 0.1 || 
          Math.abs(curr.x - prev.x) > tolerance || 
          Math.abs(curr.y - prev.y) > tolerance) {
        result.push(curr);
      }
    }
    
    result.push(points[points.length - 1]);
    return result;
  };

  // Path'i optimize et
  const optimizePath = useCallback((pathString) => {
    // Gereksiz noktaları temizle
    return pathString.replace(/(L[^L]+){10,}/g, (match) => {
      const points = match.slice(1).split('L').map(p => {
        const [x, y] = p.split(',').map(Number);
        return { x, y };
      });
      
      const simplified = simplifyPoints(points);
      return simplified.map(p => `L${p.x},${p.y}`).join('');
    });
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => editable,
    onMoveShouldSetPanResponder: () => editable,
    onPanResponderGrant: (evt) => {
      if (!editable) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      console.log('✏️ Çizim başladı');
      
      setIsDrawing(true);
      setLastPoint({ x: locationX, y: locationY });
      setPoints([{ x: locationX, y: locationY }]);
      setCurrentPath(`M${locationX},${locationY}`);
    },
    
    onPanResponderMove: (evt) => {
      if (!editable || !isDrawing) return;
      
      const { locationX, locationY } = evt.nativeEvent;
      
      // Noktaları topla
      setPoints(prev => [...prev, { x: locationX, y: locationY }]);
      
      // Her 2 noktada bir path'e ekle (performans için)
      if (points.length % 2 === 0) {
        setCurrentPath(prev => `${prev} L${locationX},${locationY}`);
        setLastPoint({ x: locationX, y: locationY });
      }
    },
    
    onPanResponderRelease: () => {
      if (!editable) return;
      
      if (currentPath && points.length > 1) {
        // Noktaları optimize et
        const optimizedPoints = simplifyPoints(points, 3);
        
        // Yeni path oluştur
        let optimizedPath = `M${optimizedPoints[0].x},${optimizedPoints[0].y}`;
        for (let i = 1; i < optimizedPoints.length; i++) {
          optimizedPath += ` L${optimizedPoints[i].x},${optimizedPoints[i].y}`;
        }
        
        const newStroke = {
          path: optimizedPath,
          color: penColor,
          width: penWidth,
          timestamp: Date.now(),
        };
        
        const updatedStrokes = [...currentStrokes, newStroke];
        
        // Maksimum stroke sayısını kontrol et
        if (updatedStrokes.length > MAX_STROKES) {
          console.log('⚠️ Maksimum stroke sayısı aşıldı, eski stroklar siliniyor...');
          updatedStrokes.splice(0, updatedStrokes.length - MAX_STROKES);
        }
        
        setCurrentStrokes(updatedStrokes);
        onStrokesChange?.(updatedStrokes);
        
        // Geçmişe kaydet
        pathHistory.current.push(updatedStrokes);
        if (pathHistory.current.length > 20) {
          pathHistory.current.shift();
        }
      }
      
      setIsDrawing(false);
      setCurrentPath('');
      setPoints([]);
      setLastPoint(null);
    },
  });

  // Kağıt desenini render et
  const renderPaper = useMemo(() => {
    const lines = [];
    
    if (paperType === 'grid') {
      const gridSize = 20;
      // Dikey çizgiler
      for (let i = 0; i < width; i += gridSize) {
        lines.push(
          <Line
            key={`v${i}`}
            x1={i}
            y1={0}
            x2={i}
            y2={height}
            stroke="#e0e0e0"
            strokeWidth="0.5"
          />
        );
      }
      // Yatay çizgiler
      for (let i = 0; i < height; i += gridSize) {
        lines.push(
          <Line
            key={`h${i}`}
            x1={0}
            y1={i}
            x2={width}
            y2={i}
            stroke="#e0e0e0"
            strokeWidth="0.5"
          />
        );
      }
    } else if (paperType === 'lined') {
      const lineHeight = 20;
      for (let i = lineHeight; i < height; i += lineHeight) {
        lines.push(
          <Line
            key={`l${i}`}
            x1={0}
            y1={i}
            x2={width}
            y2={i}
            stroke="#b0b0ff"
            strokeWidth="1"
          />
        );
      }
    } else if (paperType === 'dotted') {
      const dotSpacing = 20;
      for (let x = dotSpacing; x < width; x += dotSpacing) {
        for (let y = dotSpacing; y < height; y += dotSpacing) {
          lines.push(
            <Circle
              key={`d${x},${y}`}
              cx={x}
              cy={y}
              r={1}
              fill="#e0e0e0"
            />
          );
        }
      }
    }
    
    return lines;
  }, [paperType, width, height]);

  // Stroke sayacı
  const strokeCount = currentStrokes.length + (currentPath ? 1 : 0);
  const isNearLimit = strokeCount > MAX_STROKES * 0.8;

  return (
    <View 
      style={[styles.container, { backgroundColor: paperColor }]}
      {...panResponder.panHandlers}
    >
      <Svg style={styles.canvas} width={width} height={height}>
        {/* Arkaplan */}
        <Rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill={paperColor}
        />
        
        {/* Kağıt deseni */}
        <G>
          {renderPaper}
        </G>
        
        {/* Önceki çizimler */}
        {simplifiedStrokes.map((stroke, index) => (
          <Path
            key={`stroke-${index}-${stroke.timestamp || index}`}
            d={stroke.path}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        
        {/* Anlık çizim */}
        {currentPath ? (
          <Path
            d={currentPath}
            stroke={penColor}
            strokeWidth={penWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </Svg>
      
      {/* Stroke limit uyarısı */}
      {isNearLimit && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ Çok fazla çizim ({strokeCount}/{MAX_STROKES})
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
  },
  warningContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 59, 48, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  warningText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default DrawingCanvas;
