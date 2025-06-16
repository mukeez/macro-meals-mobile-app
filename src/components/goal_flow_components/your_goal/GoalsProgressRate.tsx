import React from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants';

export const GoalsProgressRate: React.FC = () => {
  // Let's assume the rate is in lbs/week, range 0.5 to 3.0
  const progressRate = useGoalsFlowStore((s) => s.progressRate);
  const setProgressRate = useGoalsFlowStore((s) => s.setProgressRate);

  // Default value if not set
  const value = progressRate ? parseFloat(progressRate) : 2.0;

  // Calculate monthly rate
  const weekly = value;
  const monthly = (weekly * 4).toFixed(2);

  return (
    <View className="flex-1 bg-white px-4 pt-2">
      {/* Title */}
      <Text className="text-3xl font-bold mt-4">Progress rate</Text>
      <View className="flex-1 items-center justify-center w-full">
        <Text className="text-[20px] font-semibold text-primary mb-1 text-center">Standard (Recommended)</Text>
        {/* Slider */}
        <View className="items-center w-full mb-4">
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0.5}
            maximumValue={3.0}
            step={0.01}
            value={value}
            minimumTrackTintColor="#009688"
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor="#009688"
            thumbImage={IMAGE_CONSTANTS.checkPrimary}
            onValueChange={(val: number) => setProgressRate(val.toFixed(2))}
          />
          {/* <Text className="text-lg font-semibold text-[#35695A] mt-2">{value.toFixed(2)} lbs / week</Text> */}
        </View>
        {/* Info */}
        <Text className="text-base font-normal text-black text-center mb-2">+{value.toFixed(2)} lbs / week</Text>
        <Text className="text-base text-black text-center">+{monthly} lbs / month</Text>
      </View>
    </View>
  );
};