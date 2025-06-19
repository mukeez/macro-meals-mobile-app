import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  consumed: number;
  total: number;
  color?: string;
  backgroundColor?: string;
  label?: string;
  showLabel?: boolean;
}

export function CircularProgress({
  size = 150,
  strokeWidth = 8,
  consumed,
  total,
  color = '#44A047',
  backgroundColor = '#d0e8d1',
  label = 'Consumed',
  showLabel = true,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = total > 0 ? consumed / total : 0;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background Circle */}
        <Circle
          stroke={backgroundColor}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Progress Arc */}
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View className='absolute flex-1 items-center justify-center'>
        <View className='flex-1 items-center justify-center'>
          <Text className='text-3xl text-center font-semibold'>{consumed}</Text>
          {showLabel && <Text className='text-sm text-black text-center font-medium'>{label}</Text>}
        </View>
      </View>
    </View>
  );
}