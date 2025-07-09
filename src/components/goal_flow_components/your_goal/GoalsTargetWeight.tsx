import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';
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

  const [weight, setWeight] = useState(initialWeight);
  const [inputValue, setInputValue] = useState(initialWeight.toString());
  const [isEditing, setIsEditing] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  // Weight ranges based on unit
  const weightRange = useMemo(() => {
    if (weight_unit_preference === 'imperial') {
      return { min: 80, max: 400 };
    } else {
      return { min: 35, max: 180 }; // kg range
    }
  }, [weight_unit_preference]);

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

  // Save to store on change
  React.useEffect(() => {
    if (weight >= weightRange.min) {
      setTargetWeight(weight);
    }
  }, [weight, setTargetWeight]);

  // Handle input change with debounce
  const handleInputChange = (text: string) => {
    setInputValue(text);
    
    // Clear any existing timeout
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      const numValue = parseInt(text, 10);
      if (!isNaN(numValue) && numValue >= weightRange.min && numValue <= weightRange.max) {
        setWeight(numValue);
      }
    }, 2000); // 2 second delay

    setDebounceTimeout(timeout);
  };

  // Handle input blur
  const handleInputBlur = () => {
    setIsEditing(false);
    const numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < weightRange.min || numValue > weightRange.max) {
      setInputValue(weight.toString());
    }
  };

  return (
    <View className="flex-1 bg-white">
      <Text className="text-3xl font-bold mt-4">Target weight</Text>
      <Text className="text-base text-gray-500 mt-3 mb-10">You can always change it later.</Text>
      <View className="items-center mt-8">
        <Text className="text-base text-center mb-4">{fitnessGoal || 'Set your goal'}</Text>
        <TouchableOpacity 
          onPress={() => setIsEditing(true)}
          className="flex-row items-center justify-center"
        >
          {isEditing ? (
            <TextInput
              className={`text-4xl font-semibold mb-4 ${isRed ? 'text-cinnabarRed' : 'text-black'}`}
              value={inputValue}
              onChangeText={handleInputChange}
              onBlur={handleInputBlur}
              keyboardType="numeric"
              autoFocus
              selectTextOnFocus
              maxLength={3}
            />
          ) : (
            <Text className={`text-4xl font-semibold mb-4 ${isRed ? 'text-cinnabarRed' : 'text-black'}`}>
              {weight} {weightUnit}
            </Text>
          )}
        </TouchableOpacity>
        <View className="w-full">
          {weight >= weightRange.min && (
            <CustomRuler
              min={weightRange.min}
              max={weightRange.max}
              initialValue={weight}
              onValueChange={setWeight}
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
  );
};