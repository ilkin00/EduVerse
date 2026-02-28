import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Svg, Path, G, Rect } from 'react-native-svg';

const DrawingCanvas = ({ 
  strokes = [], 
  onStrokesChange,
  penColor = '#000000',
  penWidth = 2,
  paperType = 'blank',
  paperColor = '#ffffff',
  editable = true,
}) => {
  const [currentStrokes, setCurrentStrokes] = useState(strokes);
  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  
  const { width, height } = Dimensions.get('window');

  useEffect(() => {
    console.log('🎨 Canvas strokes güncellendi:', strokes.length);
    setCurrentStrokes(strokes);
  }, [strokes]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => editable,
    onMoveShouldSetPanResponder: () => editable,
    onPanResponderGrant: (evt) => {
      if (!editable) return;
      const { locationX, locationY } = evt.nativeEvent;
      console.log('✏️ Çizim başladı:', locationX, locationY);
      setIsDrawing(true);
      setCurrentPath(`M${locationX},${locationY}`);
    },
    onPanResponderMove: (evt) => {
      if (!editable || !isDrawing) return;
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath(prev => `${prev} L${locationX},${locationY}`);
    },
    onPanResponderRelease: () => {
      if (!editable) return;
      if (currentPath) {
        const newStroke = {
          path: currentPath,
          color: penColor,
          width: penWidth,
        };
        const updatedStrokes = [...currentStrokes, newStroke];
        console.log('✅ Çizim bitti, toplam stroke:', updatedStrokes.length);
        setCurrentStrokes(updatedStrokes);
        onStrokesChange?.(updatedStrokes);
        setCurrentPath('');
      }
      setIsDrawing(false);
    },
  });

  const renderPaper = () => {
    const lines = [];
    
    if (paperType === 'grid') {
      const gridSize = 20;
      for (let i = 0; i < width; i += gridSize) {
        lines.push(
          <Path
            key={`v${i}`}
            d={`M${i},0 L${i},${height}`}
            stroke="#e0e0e0"
            strokeWidth="0.5"
            fill="none"
          />
        );
      }
      for (let i = 0; i < height; i += gridSize) {
        lines.push(
          <Path
            key={`h${i}`}
            d={`M0,${i} L${width},${i}`}
            stroke="#e0e0e0"
            strokeWidth="0.5"
            fill="none"
          />
        );
      }
      return lines;
    }
    
    if (paperType === 'lined') {
      const lineHeight = 20;
      for (let i = lineHeight; i < height; i += lineHeight) {
        lines.push(
          <Path
            key={`l${i}`}
            d={`M0,${i} L${width},${i}`}
            stroke="#b0b0ff"
            strokeWidth="1"
            fill="none"
          />
        );
      }
      return lines;
    }
    
    return null;
  };

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
          {renderPaper()}
        </G>
        
        {/* Önceki çizimler */}
        {currentStrokes.map((stroke, index) => (
          <Path
            key={index}
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
});

export default DrawingCanvas;
