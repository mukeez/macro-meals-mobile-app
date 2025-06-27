import React from 'react';
import { View } from 'react-native';

interface LinearProgressProps {
  width?: number;
  height?: number;
  progress: number;
  color: string;
  backgroundColor?: string;
}

export function LinearProgress({
  width,
  height = 6,
  progress,
  color,
  backgroundColor = '#eee',
}: LinearProgressProps) {
  const percentage = progress;

  return (
    <View 
      className="rounded-lg overflow-hidden"
      style={{ 
        width: width || 100, 
        height, 
        backgroundColor, 
        flex: width ? undefined : 1 
      }}
    >
      <View
        className="rounded-lg"
        style={{
          width: `${percentage}%`,
          height,
          backgroundColor: color,
          minWidth: 1, // Ensure minimum visibility
        }}
      />
    </View>
  );
} 