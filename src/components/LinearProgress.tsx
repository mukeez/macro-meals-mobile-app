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
  // Ensure progress is between 0 and 100
  const percentage = Math.min(Math.max(progress, 0), 100);

  return (
    <View 
      className="rounded-lg overflow-hidden"
      style={{ 
        width: width, 
        height, 
        backgroundColor, 
        flex: width ? undefined : 1 
      }}
    >
      {percentage > 0 && (
        <View
          className="rounded-lg"
          style={{
            width: width ? (width * (percentage / 100)) : `${percentage}%`,
            height,
            backgroundColor: color,
            minWidth: 1, // Ensure minimum visibility
          }}
        />
      )}
    </View>
  );
} 