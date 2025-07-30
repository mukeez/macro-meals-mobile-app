import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, Image, TouchableWithoutFeedback, Keyboard, Platform, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants';

// Weight arrays for picker
const weightsLb = Array.from({ length: 321 }, (_, i) => i + 80); // 80-400 lbs
const weightsKg = Array.from({ length: 146 }, (_, i) => i + 35); // 35-180 kg

// Responsive dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 360;
const isLargeScreen = screenWidth > 600;

// Responsive picker dimensions
const getPickerWidth = (unit: 'imperial' | 'metric') => {
  if (isSmallScreen) {
    return unit === 'imperial' ? 100 : 120;
  } else if (isLargeScreen) {
    return unit === 'imperial' ? 140 : 160;
  } else {
    return unit === 'imperial' ? 120 : 140;
  }
};

const getPickerHeight = () => {
  if (isSmallScreen) {
    return 50;
  } else if (isLargeScreen) {
    return 70;
  } else {
    return 60;
  }
};

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
        <Text className="text-base text-gray-500 mt-3 mb-6">You can always change it later.</Text>
        <View className="items-center mt-8">
          <Text className="text-base text-center mb-4">{fitnessGoal || 'Set your goal'}</Text>
          <View className="flex-row items-center justify-center mb-0">
            <Text className={`text-4xl font-semibold text-center ${isRed ? 'text-cinnabarRed' : 'text-black'}`}>
              {weight}
            </Text>
            <Text className="text-2xl font-semibold ml-2">{weightUnit}</Text>
          </View>
          {Platform.OS === 'ios' && isRed && (
            <View className="flex-row items-center justify-center mt-2 mb-2">
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
          <View className={`items-center ${Platform.OS === 'android' ? '-mt-16' : ''}`}>
            {weight_unit_preference === 'imperial' ? (
              <View className={`${Platform.OS === 'ios' ? '' : 'border-b border-gray-100'}`}>
                <Picker
                  selectedValue={weight}
                  style={{ 
                    width: getPickerWidth('imperial'), 
                    height: getPickerHeight(), 
                    color: 'transparent',
                    backgroundColor: 'transparent',
                    borderWidth: Platform.OS === 'android' ? 1 : 0,
                    borderColor: Platform.OS === 'android' ? '#6b7280' : 'transparent',
                    borderRadius: Platform.OS === 'android' ? 4 : 0
                  }}
                  itemStyle={{ fontSize: 18, color: Platform.OS === 'android' ? 'white' : 'black' }}
                  onValueChange={handleWeightChange}
                  dropdownIconColor={Platform.OS === 'android' ? '#6b7280' : undefined}
                >
                  <Picker.Item label="" value={null} style={{color: Platform.OS === 'android' ? 'white' : 'black'}} />
                  {weightsLb.map(lb => (
                    <Picker.Item key={lb} label={`${lb} lb`} style={{color: Platform.OS === 'android' ? 'white' : 'black'}} value={lb} />
                  ))}
                </Picker>
              </View>
            ) : (
              <View className={`${Platform.OS === 'ios' ? '' : 'border-b border-gray-100'}`}>
                <Picker
                  selectedValue={weight}
                  style={{ 
                    width: getPickerWidth('metric'), 
                    height: getPickerHeight(), 
                    color: 'transparent',
                    backgroundColor: 'transparent',
                    borderWidth: Platform.OS === 'android' ? 1 : 0,
                    borderColor: Platform.OS === 'android' ? '#6b7280' : 'transparent',
                    borderRadius: Platform.OS === 'android' ? 4 : 0
                  }}
                  itemStyle={{ fontSize: 18, color: Platform.OS === 'android' ? 'white' : 'black' }}
                  onValueChange={handleWeightChange}
                  dropdownIconColor={Platform.OS === 'android' ? '#6b7280' : undefined}
                >
                  <Picker.Item label="" value={null} style={{color: Platform.OS === 'android' ? 'white' : 'black'}} />
                  {weightsKg.map(kg => (
                    <Picker.Item key={kg} label={`${kg} kg`} style={{color: Platform.OS === 'android' ? 'white' : 'black'}} value={kg} />
                  ))}
                </Picker>
              </View>
            )}
          </View>
          {Platform.OS === 'android' && isRed && (
            <View className="flex-row items-center justify-center mt-2">
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