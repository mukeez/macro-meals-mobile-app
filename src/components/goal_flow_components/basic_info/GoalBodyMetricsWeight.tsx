import React, { useEffect, useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useGoalsFlowStore } from '../../../store/goalsFlowStore';

// Validation constants
const MIN_WEIGHT_LB = 50;
const MAX_WEIGHT_LB = 500;
const MIN_WEIGHT_KG = 23; // ~50 lbs
const MAX_WEIGHT_KG = 227; // ~500 lbs

export const GoalBodyMetricsWeight = () => {
  const {
    weight_unit_preference, setWeightUnitPreference,
    weightLb,
    weightKg,
    setWeightLb,
    setWeightKg,
    markSubStepComplete,
    majorStep,
    subSteps
  } = useGoalsFlowStore();

  // Local state for validation
  const [isValid, setIsValid] = useState(false);

  // Validate inputs whenever they change
  useEffect(() => {
    if (weight_unit_preference === 'imperial') {
      setIsValid(
        weightLb !== null && 
        weightLb >= MIN_WEIGHT_LB && 
        weightLb <= MAX_WEIGHT_LB
      );
    } else {
      setIsValid(
        weightKg !== null && 
        weightKg >= MIN_WEIGHT_KG && 
        weightKg <= MAX_WEIGHT_KG
      );
    }
  }, [weight_unit_preference, weightLb, weightKg]);

  // Mark step as complete when valid
  useEffect(() => {
    if (isValid) {
      markSubStepComplete(majorStep, subSteps[majorStep]);
    }
  }, [isValid, majorStep, subSteps, markSubStepComplete]);

  const handleWeightChange = (text: string, isImperial: boolean) => {
    const num = parseInt(text);
    if (isImperial) {
      setWeightLb(isNaN(num) ? null : num);
    } else {
      setWeightKg(isNaN(num) ? null : num);
    }
  };

  return (
    <View className="flex-1 bg-white px-4">
      <Text className="text-2xl font-bold mb-6">What's your weight?</Text>
      
      {weight_unit_preference === 'imperial' ? (
        <View>
          <Text className="text-base mb-2">Pounds</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-lg"
            keyboardType="number-pad"
            value={weightLb?.toString() || ''}
            onChangeText={(text) => handleWeightChange(text, true)}
            placeholder="150"
          />
          {weightLb !== null && (weightLb < MIN_WEIGHT_LB || weightLb > MAX_WEIGHT_LB) && (
            <Text className="text-red-500 mt-2">Please enter a weight between {MIN_WEIGHT_LB} and {MAX_WEIGHT_LB} lbs</Text>
          )}
        </View>
      ) : (
        <View>
          <Text className="text-base mb-2">Kilograms</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-lg"
            keyboardType="number-pad"
            value={weightKg?.toString() || ''}
            onChangeText={(text) => handleWeightChange(text, false)}
            placeholder="68"
          />
          {weightKg !== null && (weightKg < MIN_WEIGHT_KG || weightKg > MAX_WEIGHT_KG) && (
            <Text className="text-red-500 mt-2">Please enter a weight between {MIN_WEIGHT_KG} and {MAX_WEIGHT_KG} kg</Text>
          )}
        </View>
      )}
    </View>
  );
}; 