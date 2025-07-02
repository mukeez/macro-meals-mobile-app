import React from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants';

export const GoalsProgressRate: React.FC = () => {
  const progressRate = useGoalsFlowStore((s) => s.progressRate);
  const setProgressRate = useGoalsFlowStore((s) => s.setProgressRate);
  const unit = useGoalsFlowStore((s) => s.unit);
  const weightLb = useGoalsFlowStore((s) => s.weightLb);
  const weightKg = useGoalsFlowStore((s) => s.weightKg);
  const targetWeight = useGoalsFlowStore((s) => s.targetWeight);
  const fitnessGoal = useGoalsFlowStore((s) => s.fitnessGoal);

  // Get current weight based on unit
  const currentWeight = unit === 'imperial' ? (weightLb || 0) : (weightKg || 0);
  
  // Calculate weight difference
  const weightDifference = Math.abs((targetWeight || 0) - currentWeight);

  // Default value if not set
  const value = progressRate ? parseFloat(progressRate) : 0.0;

  // Calculate monthly rate
  const weekly = value;
  const monthly = (weekly * 4).toFixed(2);

  // Determine if the rate is unreasonable
  const isUnreasonableRate = () => {
    const timeToGoal = weightDifference / value; // weeks to reach goal
    
    // If they want to reach goal in less than 4 weeks, that's usually too fast
    if (timeToGoal < 4 && weightDifference > 10) {
      return true;
    }
    
    // Standard rate limits
    if (fitnessGoal === 'Lose weight' && value > 2.0) {
      return true;
    }
    if (fitnessGoal === 'Gain weight' && value > 1.0) {
      return true;
    }
    
    return false;
  };

  const unreasonable = isUnreasonableRate();
  
  // Dynamic colors and text based on rate
  const trackColor = unreasonable ? "#E53835" : "#009688";
  const textColor = unreasonable ? "#E53835" : "#01675B";
  const rateText = unreasonable ? "Faster (be careful)" : "Standard (Recommended)";
  
  // Weight unit for display
  const weightUnit = unit === 'imperial' ? 'lbs' : 'kg';

  return (
    <View className="flex-1 bg-white px-4 pt-2">
      {/* Title */}
      <Text className="text-3xl font-bold mt-4">At what rate do you want to achieve this goal?</Text>
      <View className="flex-1 items-center justify-center w-full">
        <Text 
          className="text-[20px] font-semibold mb-1 text-center"
          style={{ color: textColor }}
        >
          {rateText}
        </Text>
        
        {/* Slider */}
        <View className="items-center w-full mb-4">
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={0}
            maximumValue={3.0}
            step={0.01}
            value={value}
            minimumTrackTintColor={trackColor}
            maximumTrackTintColor="#E0E0E0"
            thumbTintColor={trackColor}
            thumbImage={IMAGE_CONSTANTS.checkPrimary}
            onValueChange={(val: number) => setProgressRate(val.toFixed(2))}
          />
        </View>
        
        {/* Rate display */}
        <Text className="text-base font-normal text-black text-center mb-2">
          +{value.toFixed(2)} {weightUnit} / week
        </Text>
        <Text className="text-base text-black text-center mb-4">
          +{monthly} {weightUnit} / month
        </Text>
      </View>
    </View>
  );
};