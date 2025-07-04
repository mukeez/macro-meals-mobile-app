import React, { useState, useMemo } from 'react';
import { View, Text, Image } from 'react-native';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';
import CustomRuler from 'src/components/goal_flow_components/your_goal/CustomRuler';
import { MaterialIcons } from '@expo/vector-icons';
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants';

export const GoalsTargetWeight: React.FC = () => {
  const targetWeight = useGoalsFlowStore((s) => s.targetWeight);
  const setTargetWeight = useGoalsFlowStore((s) => s.setTargetWeight);
  const fitnessGoal = useGoalsFlowStore((s) => s.fitnessGoal);
  const unit = useGoalsFlowStore((s) => s.unit);
  const weightLb = useGoalsFlowStore((s) => s.weightLb);
  const weightKg = useGoalsFlowStore((s) => s.weightKg);

  // Convert previous weight to the current unit
  const previousWeight = useMemo(() => {
    if (unit === 'imperial') {
      return weightLb ?? 0;
    } else if (unit === 'metric') {
      return weightKg ?? 0;
    }
    return 0;
  }, [unit, weightLb, weightKg]);

  // Initialize weight based on unit and previous weight
  const initialWeight = useMemo(() => {
    if (targetWeight) {
      return targetWeight;
    }
    return Math.round(previousWeight) || (unit === 'imperial' ? 150 : 70);
  }, [targetWeight, previousWeight, unit]);

  const [weight, setWeight] = useState(initialWeight);

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

  // Weight ranges based on unit
  const weightRange = useMemo(() => {
    if (unit === 'imperial') {
      return { min: 80, max: 400 };
    } else {
      return { min: 35, max: 180 }; // kg range
    }
  }, [unit]);

  // Display unit
  const weightUnit = unit === 'imperial' ? 'lbs' : 'kg';

  // Save to store on change
  React.useEffect(() => {
    setTargetWeight(weight);
  }, [weight, setTargetWeight]);

  // Update weight when unit changes
  React.useEffect(() => {
    if (unit === 'imperial' && weightKg) {
      // Convert from kg to lbs
      const newWeight = Math.round(weightKg * 2.20462);
      setWeight(newWeight);
    } else if (unit === 'metric' && weightLb) {
      // Convert from lbs to kg
      const newWeight = Math.round(weightLb / 2.20462);
      setWeight(newWeight);
    }
  }, [unit, weightKg, weightLb]);

  return (
    <View className="flex-1 bg-white">
      <Text className="text-3xl font-bold mt-4">Target weight</Text>
      <Text className="text-base text-gray-500 mt-3 mb-10">You can always change it later.</Text>
      <View className="items-center mt-8">
        <Text className="text-base text-center mb-4">{fitnessGoal || 'Set your goal'}</Text>
        <Text className={`text-4xl font-semibold mb-4 ${isRed ? 'text-cinnabarRed' : 'text-black'}`}>
          {weight} {weightUnit}
        </Text>
        <View className="w-full">
          <CustomRuler
            min={weightRange.min}
            max={weightRange.max}
            initialValue={weight}
            onValueChange={setWeight}
          />
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