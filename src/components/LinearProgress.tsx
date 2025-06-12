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
  width = 94,
  height = 6,
  progress,
  color,
  backgroundColor = '#eee',
}: LinearProgressProps) {
  const percentage = Math.min(100, progress);

  return (
    <View style={[styles.container, { width, height, backgroundColor }]}>
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