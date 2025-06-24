import React from 'react';
import { View, StyleSheet } from 'react-native';

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
  const percentage = Math.min(100, progress);

  return (
    <View style={[styles.container, { width, height, backgroundColor, flex: width ? undefined : 1 }]}>
      <View
        style={[
          styles.progress,
          {
            width: `${percentage}%`,
            height,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  progress: {
    borderRadius: 8,
  },
}); 