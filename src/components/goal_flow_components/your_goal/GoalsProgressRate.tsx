import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants';

export const GoalsProgressRate: React.FC = () => {
  const progressRate = useGoalsFlowStore((s) => s.progressRate); // number
  const setProgressRate = useGoalsFlowStore((s) => s.setProgressRate);
  const weight_unit_preference = useGoalsFlowStore((s) => s.weight_unit_preference);
  const weightLb = useGoalsFlowStore((s) => s.weightLb);
  const weightKg = useGoalsFlowStore((s) => s.weightKg);
  const targetWeight = useGoalsFlowStore((s) => s.targetWeight);
  const fitnessGoal = useGoalsFlowStore((s) => s.fitnessGoal);

  // Get current weight based on unit
  const currentWeight = weight_unit_preference === 'imperial' ? (weightLb || 0) : (weightKg || 0);
  
  // Calculate weight difference
  const weightDifference = Math.abs((targetWeight || 0) - currentWeight);

  // Get recommended rate based on fitness goal
  const getRecommendedRate = () => {
    if (fitnessGoal === 'Lose weight') {
      return weight_unit_preference === 'imperial' ? 1.0 : 0.45; // 1 lb or 0.45 kg per week
    } else if (fitnessGoal === 'Gain weight') {
      return weight_unit_preference === 'imperial' ? 0.5 : 0.23; // 0.5 lb or 0.23 kg per week
    }
    return 0;
  };

  // Default value if not set, otherwise use recommended rate
  const value = typeof progressRate === 'number' && progressRate > 0 ? progressRate : getRecommendedRate();

  // For Android: use local state for slider value
  const [sliderValue, setSliderValue] = useState(value);
  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  const didSetInitial = useRef(false);
  useEffect(() => {
    if (!didSetInitial.current && (!progressRate || progressRate === 0)) {
      setProgressRate(getRecommendedRate());
      didSetInitial.current = true;
    }
  }, []);

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
  const weightUnit = weight_unit_preference === 'imperial' ? 'lbs' : 'kg';

  // Rate sign based on fitness goal
  const rateSign = fitnessGoal === 'Lose weight' ? '-' : '+';

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
          {Platform.OS === 'android' ? (
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={weight_unit_preference === 'imperial' ? 3.0 : 1.36} // 3 lbs or 1.36 kg
              step={0.01}
              value={sliderValue}
              minimumTrackTintColor={trackColor}
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor={trackColor}
              thumbImage={IMAGE_CONSTANTS.checkPrimary}
              onValueChange={val => setSliderValue(Math.round(val * 100) / 100)}
              onSlidingComplete={val => setProgressRate(Math.round(val * 100) / 100)}
            />
          ) : (
            <Slider
              style={{ width: '100%', height: 40 }}
              minimumValue={0}
              maximumValue={weight_unit_preference === 'imperial' ? 3.0 : 1.36}
              step={0.01}
              value={value}
              minimumTrackTintColor={trackColor}
              maximumTrackTintColor="#E0E0E0"
              thumbTintColor={trackColor}
              thumbImage={IMAGE_CONSTANTS.checkPrimary}
              onValueChange={setProgressRate}
            />
          )}
        </View>
        
        {/* Rate display */}
        <Text className="text-base font-normal text-black text-center mb-2">
          {rateSign}{(Platform.OS === 'android' ? sliderValue : value).toFixed(2)} {weightUnit} / week
        </Text>
        <Text className="text-base text-black text-center mb-4">
          {rateSign}{monthly} {weightUnit} / month
        </Text>
      </View>
    </View>
  );
};