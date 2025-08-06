import React, { useRef, useEffect } from 'react';
import { View, Animated, ScrollView, Dimensions, TextInput } from 'react-native';

interface CustomRulerProps {
  min: number;
  max: number;
  initialValue: number;
  value?: number;
  onValueChange?: (value: number) => void;
  segmentWidth?: number;
  segmentSpacing?: number;
  indicatorWidth?: number;
  indicatorHeight?: number;
  valueFormatter?: (value: number) => string;
}

const { width } = Dimensions.get('window');

const CustomRuler: React.FC<CustomRulerProps> = ({
  min,
  max,
  initialValue,
  value,
  onValueChange,
  segmentWidth = 1,
  segmentSpacing = 10,
  indicatorWidth = 100,
  indicatorHeight = 80,
  valueFormatter,
}) => {
  const segmentsLength = max - min + 1;
  const snapSegment = segmentWidth + segmentSpacing;
  const data = [...Array(segmentsLength).keys()].map(i => i + min);

  const scrollViewRef = useRef<ScrollView | null>(null);
  const textInputRef = useRef<TextInput | null>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const lastScrolledValue = useRef<number | null>(null);

  useEffect(() => {
    const listener = scrollX.addListener(({ value }) => {
      const val = Math.round(value / snapSegment) + min;
      if (onValueChange) onValueChange(val);
      if (textInputRef.current && valueFormatter) {
        textInputRef.current.setNativeProps({
          text: valueFormatter(val),
        });
      }
    });
    return () => scrollX.removeListener(listener);
  }, [min, onValueChange, snapSegment, valueFormatter, scrollX]);

  // Scroll to the correct value when value or initialValue changes
  useEffect(() => {
    const scrollToValue = value !== undefined ? value : initialValue;
    if (lastScrolledValue.current !== scrollToValue) {
      setTimeout(() => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({
            x: (scrollToValue - min) * snapSegment,
            y: 0,
            animated: true,
          });
          lastScrolledValue.current = scrollToValue;
        }
      }, 100);
    }
  }, [value, initialValue, min, snapSegment]);

  return (
    <View className="w-full bg-primary">
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        contentContainerStyle={{ flexDirection: 'row', alignItems: 'flex-end' }}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        snapToInterval={snapSegment}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        style={{ padding: 0, margin: 0 }}
      >
        <View style={{ width: indicatorWidth }} />
        {data.map(i => {
          const tenth = i % 10 === 0;
          return (
            <View
              key={i}
              className='bg-white'
              style={{
                width: segmentWidth,
                height: tenth ? 40 : 24,
                marginRight: i === data.length - 1 ? 0 : segmentSpacing,
              }}
            />
          );
        })}
        <View style={{ width: indicatorWidth }} />
      </Animated.ScrollView>
      <View
        className="absolute items-center justify-center"
        style={{
          left: (width - indicatorWidth) / 2,
          top: 0,
          width: indicatorWidth,
          height: indicatorHeight,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      >
        {/* <View
          className="bg-cyan-400"
          style={{
            width: segmentWidth,
            height: indicatorHeight,
          }}
        /> */}
      </View>
    </View>
  );
};

export default CustomRuler; 