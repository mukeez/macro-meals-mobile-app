import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Image, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants';

// Weight arrays for picker
const weightsLb = Array.from({ length: 321 }, (_, i) => i + 80); // 80-400 lbs
const weightsKg = Array.from({ length: 146 }, (_, i) => i + 35); // 35-180 kg

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

  // State for weight
  const [weight, setWeight] = useState(initialWeight);

  // Keep store in sync
  useEffect(() => {
    setTargetWeight(weight);
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

  // Handle weight change
  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-white">
        <Text className="text-3xl font-bold mt-4">Target weight</Text>
        <Text className="text-base text-gray-500 mt-3 mb-10">You can always change it later.</Text>
        <View className="items-center mt-8">
          <Text className="text-base text-center mb-4">{fitnessGoal || 'Set your goal'}</Text>
          <View className="flex-row items-center justify-center">
            <Text className={`text-4xl font-semibold mb-4 text-center ${isRed ? 'text-cinnabarRed' : 'text-black'}`}>
              {weight}
            </Text>
            <Text className="text-2xl font-semibold mb-4 ml-2">{weightUnit}</Text>
          </View>
          <View className="items-center">
            {weight_unit_preference === 'imperial' ? (
              <View className="border-b-2 border-blue-500 mx-2">
                <Picker
                  selectedValue={weight}
                  style={{ width: 120, height: 50 }}
                  itemStyle={{ fontSize: 18 }}
                  onValueChange={handleWeightChange}
                >
                  <Picker.Item label="Select weight" value={null} />
                  {weightsLb.map(lb => (
                    <Picker.Item key={lb} label={`${lb} lb`} value={lb} />
                  ))}
                </Picker>
              </View>
            ) : (
              <View className="border-b-2 border-blue-500 mx-2">
                <Picker
                  selectedValue={weight}
                  style={{ width: 120, height: 50 }}
                  itemStyle={{ fontSize: 18 }}
                  onValueChange={handleWeightChange}
                >
                  <Picker.Item label="Select weight" value={null} />
                  {weightsKg.map(kg => (
                    <Picker.Item key={kg} label={`${kg} kg`} value={kg} />
                  ))}
                </Picker>
              </View>
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