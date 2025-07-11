import React, { useRef, useEffect } from 'react';
import { View, ScrollView, Text, Dimensions } from 'react-native';

interface SimpleRulerProps {
  min: number;
  max: number;
  value: number;
  onValueChange: (val: number) => void;
  segmentWidth?: number;
}

const { width } = Dimensions.get('window');

const SimpleRuler: React.FC<SimpleRulerProps> = ({
  min,
  max,
  value,
  onValueChange,
  segmentWidth = 20,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const itemCount = max - min + 1;
  const centerOffset = (width - segmentWidth) / 2;

  // Only scroll to value when it changes from outside (not from scroll)
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({
        x: (value - min) * segmentWidth,
        animated: true,
      });
    }
  }, [value, min, segmentWidth]);

  // On scroll end, update value
  const handleMomentumScrollEnd = (event: any) => {
    const x = event.nativeEvent.contentOffset.x;
    const val = Math.round(x / segmentWidth) + min;
    if (val !== value && val >= min && val <= max) {
      onValueChange(val);
    }
  };

  return (
    <View style={{ width: '100%', alignItems: 'center', position: 'relative', height: 50 }}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={segmentWidth}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: centerOffset,
          alignItems: 'center',
        }}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        scrollEventThrottle={16}
      >
        {Array.from({ length: itemCount }, (_, i) => (
          <View key={i} style={{ width: segmentWidth, alignItems: 'center' }}>
            <View style={{ height: 30, width: 2, backgroundColor: i + min === value ? '#19a28f' : '#ccc' }} />
            <Text style={{ fontSize: 12, color: i + min === value ? '#19a28f' : '#888' }}>{i + min}</Text>
          </View>
        ))}
      </ScrollView>
      {/* Center indicator */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: width / 2 - 1,
          width: 2,
          height: 40,
          backgroundColor: '#19a28f',
        }}
      />
    </View>
  );
};

export default SimpleRuler; 