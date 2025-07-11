import React, { useEffect, useState } from 'react';
import { View, Text, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';

const heightsFt = [3, 4, 5, 6, 7, 8, 9];
const heightsIn = Array.from({ length: 12 }, (_, i) => i);
const heightsCm = Array.from({ length: 121 }, (_, i) => 100 + i); // 100cm to 220cm

export const GoalBodyMetricsHeight = () => {
  const {
    height_unit_preference, setHeightUnitPreference,
    heightFt, setHeightFt,
    heightIn, setHeightIn,
    heightCm, setHeightCm,
    markSubStepComplete,
    majorStep,
    subSteps
  } = useGoalsFlowStore();

  // Local state for validation
  const [isValid, setIsValid] = useState(false);

  // Validate inputs whenever they change
  useEffect(() => {
    if (height_unit_preference === 'imperial') {
      setIsValid(heightFt !== null && heightIn !== null);
      
      // Log calculated height when both feet and inches are selected
      if (heightFt !== null && heightIn !== null) {
        const calculatedHeight = heightFt + (heightIn / 12);
        const calculatedHeightRounded = parseFloat(calculatedHeight.toFixed(2));
        console.log('[GoalsFlow] Height calculation:', {
          feet: heightFt,
          inches: heightIn,
          calculatedHeightValue: calculatedHeightRounded,
          calculation: `${heightFt} + (${heightIn} / 12) = ${calculatedHeightRounded}`
        });
      }
    } else {
      setIsValid(heightCm !== null);
      
      // Log metric height when selected
      if (heightCm !== null) {
        console.log('[GoalsFlow] Height calculation (metric):', {
          heightCm: heightCm,
          calculatedHeightValue: heightCm,
          calculation: `Using heightCm directly: ${heightCm}`
        });
      }
    }
  }, [height_unit_preference, heightFt, heightIn, heightCm]);

  // Mark step as complete when valid
  useEffect(() => {
    if (isValid) {
      markSubStepComplete(majorStep, subSteps[majorStep]);
    }
  }, [isValid, majorStep, subSteps, markSubStepComplete]);

  return (
    <View className="flex-1 bg-white px-4">
      <Text className="text-3xl font-bold mt-4">Body metrics</Text>
      <Text className="text-base text-gray-500 mb-6">This will be used to calibrate your custom plan</Text>
      {/* Unit Switch */}
      <View className="flex-row items-center justify-center mb-6">
        <Text className={`text-lg mr-2 ${height_unit_preference === 'imperial' ? 'text-black font-semibold' : 'font-normal text-textMediumGrey'}`}>Imperial</Text>
        <Switch
          value={height_unit_preference === 'metric'}
          onValueChange={v => setHeightUnitPreference(v ? 'metric' : 'imperial')}
          trackColor={{ false: '', true: '#ccc' }}
          thumbColor={height_unit_preference === 'metric' ? '#ffffff' : '#f4f3f4'}
        />
        <Text className={`text-lg ml-2 ${height_unit_preference === 'metric' ? 'text-black font-semibold' : 'font-normal text-textMediumGrey'}`}>Metric</Text>
      </View>

      {/* Height Pickers */}
      {height_unit_preference === 'imperial' ? (
        <View className="flex-row justify-between ml-5">
          <View className="flex-1 items-center">
            <Text className="text-base font-medium mb-2">Height</Text>
            <View className="flex-row">
              <Picker
                selectedValue={heightFt}
                style={{ width: 100, height: 200 }}
                itemStyle={{ fontSize: 18 }}
                onValueChange={setHeightFt}
              >
                <Picker.Item label="ft" value={null} />
                {heightsFt.map(ft => (
                  <Picker.Item key={ft} label={`${ft} ft`} value={ft} />
                ))}
              </Picker>
              <Picker
                selectedValue={heightIn}
                style={{ width: 100, height: 200 }}
                itemStyle={{ fontSize: 18 }}
                onValueChange={setHeightIn}
              >
                <Picker.Item label="in" value={null} />
                {heightsIn.map(inc => (
                  <Picker.Item key={inc} label={`${inc} in`} value={inc} />
                ))}
              </Picker>
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-row justify-between">
          <View className="flex-1 items-center">
            <Text className="text-base font-medium mb-2">Height</Text>
            <Picker
              selectedValue={heightCm}
              style={{ width: 140, height: 200 }}
              itemStyle={{ fontSize: 18 }}
              onValueChange={setHeightCm}
            >
              <Picker.Item label="cm" value={null} />
              {heightsCm.map(cm => (
                <Picker.Item key={cm} label={`${cm} cm`} value={cm} />
              ))}
            </Picker>
          </View>
        </View>
      )}
    </View>
  );
};