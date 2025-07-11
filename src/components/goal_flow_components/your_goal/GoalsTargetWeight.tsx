import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Image, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';
import CustomRuler from 'src/components/goal_flow_components/your_goal/CustomRuler';
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants';

export const GoalsTargetWeight: React.FC = () => {
  const targetWeight = useGoalsFlowStore((s) => s.targetWeight);
  const setTargetWeight = useGoalsFlowStore((s) => s.setTargetWeight);
  const fitnessGoal = useGoalsFlowStore((s) => s.fitnessGoal);
  const weight_unit_preference = useGoalsFlowStore((s) => s.weight_unit_preference);
  const weightLb = useGoalsFlowStore((s) => s.weightLb);
  const weightKg = useGoalsFlowStore((s) => s.weightKg);

  // Convert previous weight to the current unit
  const previousWeight = useMemo(() => {
    if (weight_unit_preference === 'imperial') {
      return weightLb ?? 0;
    } else if (weight_unit_preference === 'metric') {
      return weightKg ?? 0;
    }
    return 0;
  }, [weight_unit_preference, weightLb, weightKg]);

  // Initialize weight based on unit and previous weight
  const initialWeight = useMemo(() => {
    if (targetWeight) {
      return targetWeight;
    }
    return Math.round(previousWeight) || (weight_unit_preference === 'imperial' ? 150 : 70);
  }, [targetWeight, previousWeight, weight_unit_preference]);

  // Weight ranges based on unit
  const weightRange = useMemo(() => {
    if (weight_unit_preference === 'imperial') {
      return { min: 80, max: 400 };
    } else {
      return { min: 35, max: 180 }; // kg range
    }
  }, [weight_unit_preference]);

  // State for weight and input value
  const [weight, setWeight] = useState(initialWeight);
  const [inputValue, setInputValue] = useState(initialWeight.toString());

  // Keep store in sync
  useEffect(() => {
    if (weight >= weightRange.min) {
      setTargetWeight(weight);
    }
  }, [weight, setTargetWeight]);

  // Determine if the weight text should be red
  const isRed = useMemo(() => {
    if (fitnessGoal === 'Gain weight' && weight < previousWeight) {
      return true;
    }
    if (fitnessGoal === 'Lose weight' && weight > previousWeight) {
      return true;
    }
    return false;
  }, [fitnessGoal, weight, previousWeight]);

  // Display unit
  const weightUnit = weight_unit_preference === 'imperial' ? 'lbs' : 'kg';

  // Handle input change
  const handleInputChange = (text: string) => {
    setInputValue(text);
    const numValue = parseInt(text, 10);
    if (!isNaN(numValue) && numValue >= weightRange.min && numValue <= weightRange.max) {
      setWeight(numValue);
    }
  };

  // Handle input blur (reset to valid weight if invalid)
  const handleInputBlur = () => {
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < weightRange.min || numValue > weightRange.max) {
      setInputValue(weight.toString());
    }
  };

  // Disabled ruler handler
  const handleRulerChange = () => {};

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-white">
        <Text className="text-3xl font-bold mt-4">Target weight</Text>
        <Text className="text-base text-gray-500 mt-3 mb-10">You can always change it later.</Text>
        <View className="items-center mt-8">
          <Text className="text-base text-center mb-4">{fitnessGoal || 'Set your goal'}</Text>
          <View className="flex-row items-center justify-center">
            <TextInput
              className={`text-4xl font-semibold mb-4 text-center ${isRed ? 'text-cinnabarRed' : 'text-black'}`}
              value={inputValue}
              onChangeText={handleInputChange}
              onBlur={handleInputBlur}
              keyboardType="numeric"
              maxLength={3}
              style={{ minWidth: 80 }}
            />
            <Text className="text-2xl font-semibold mb-4 ml-0">{weightUnit}</Text>
          </View>
          <View className="w-full mt-4" style={{ pointerEvents: 'none' }}>
            {weight >= weightRange.min && (
              <CustomRuler
                min={weightRange.min}
                max={weightRange.max}
                initialValue={weight}
                onValueChange={handleRulerChange}
              />
            )}
          </View>
          {isRed && (
            <View className="flex-row items-center mt-2">
              <Image source={IMAGE_CONSTANTS.warningIcon} className="w-[16px] h-[16px] mr-1" />
              <Text className="text-red-500 text-sm">
                {fitnessGoal === 'Gain weight'
                  ? 'You chose a goal of gaining weight.'
                  : fitnessGoal === 'Lose weight'
                  ? 'You chose a goal of losing weight.'
                  : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};