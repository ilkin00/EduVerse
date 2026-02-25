import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  PanResponder,
  Dimensions,
} from 'react-native';
import { Svg, Path, G } from 'react-native-svg';

const DrawingCanvas = ({ 
  strokes = [], 
  onStrokesChange,
  penColor = '#000000',
  penWidth = 2,
  paperType = 'blank',
  paperColor = '#ffffff',
}) => {
  const [currentStrokes, setCurrentStrokes] = useState(strokes);
  const [currentPath, setCurrentPath] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      const { locationX, locationY } = evt.nativeEvent;
      setIsDrawing(true);
      setCurrentPath(`M${locationX},${locationY}`);
    },
    onPanResponderMove: (evt) => {
      if (!isDrawing) return;
      const { locationX, locationY } = evt.nativeEvent;
      setCurrentPath(prev => `${prev} L${locationX},${locationY}`);
    },
    onPanResponderRelease: () => {
      if (currentPath) {
        const newStroke = {
          path: currentPath,
          color: penColor,
          width: penWidth,
        };
        const updatedStrokes = [...currentStrokes, newStroke];
        setCurrentStrokes(updatedStrokes);
        onStrokesChange?.(updatedStrokes);
        setCurrentPath('');
      }
      setIsDrawing(false);
    },
  });

  const renderPaper = () => {
    const { width, height } = Dimensions.get('window');
    
    if (paperType === 'grid') {
      const gridSize = 20;
      const lines = [];
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
      const lines = [];
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
      <Svg style={styles.canvas}>
        {/* Arkaplan kağıt deseni */}
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
