import React from 'react';
import { View, Text, Switch, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';

const heightsFt = [3, 4, 5, 6, 7, 8, 9];
const heightsIn = Array.from({ length: 12 }, (_, i) => i);
const heightsCm = Array.from({ length: 121 }, (_, i) => 100 + i); // 100cm to 220cm
const weightsLb = Array.from({ length: 321 }, (_, i) => 80 + i); // 80lb to 400lb
const weightsKg = Array.from({ length: 221 }, (_, i) => 30 + i); // 30kg to 250kg

export const GoalBodyMetricsWeight = () => {
  const {
    weight_unit_preference, setWeightUnitPreference,
    heightFt, setHeightFt,
    heightIn, setHeightIn,
    heightCm, setHeightCm,
    weightLb, setWeightLb,
    weightKg, setWeightKg,
  } = useGoalsFlowStore();

  return (
    <View className="flex-1 bg-white px-4">
      <Text className="text-3xl font-bold mt-4">Weight metrics</Text>
      <Text className="text-base text-gray-500 mb-6">This will be used to calibrate your custom plan</Text>
      {/* Unit Switch */}
      <View className="flex-row items-center justify-center mb-6">
        <Text className={`text-lg mr-2 ${weight_unit_preference === 'imperial' ? 'text-black font-semibold' : 'font-normal text-textMediumGrey'}`}>Imperial</Text>
        <Switch
          value={weight_unit_preference === 'metric'}
          onValueChange={v => setWeightUnitPreference(v ? 'metric' : 'imperial')}
          trackColor={{ false: '', true: '#ccc' }}
          thumbColor={weight_unit_preference === 'metric' ? '#f4f3f4' : '#f4f3f4'}
        />
        <Text className={`text-lg ml-2 ${weight_unit_preference === 'metric' ? 'text-black font-semibold' : 'font-normal text-textMediumGrey'}`}>Metric</Text>
      </View>
      {/* Height & Weight Pickers */}
      {weight_unit_preference === 'imperial' ? (
        <View className="flex-row justify-between ml-5">
          {/* <View className="flex-1 items-center">
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
          </View> */}
          <View className="flex-1 items-center">
            <Text className="text-base font-medium mb-2">Weight</Text>
            <View className={`${Platform.OS === 'ios' ? '' : 'border-b-2 border-blue-500'} mx-2`}>
            <Picker
              selectedValue={weightLb}
              style={{ width: 120, height: 50, color: 'black' }}
              itemStyle={{ fontSize: 18, color: 'black' }}
              onValueChange={setWeightLb}
            >
              <Picker.Item label="lb" value={null} style={{color: 'black'}} />
              {weightsLb.map(lb => (
                <Picker.Item key={lb} label={`${lb} lb`} style={{color: 'black'}} value={lb} />
              ))}
            </Picker>
            <Text style={{width: '100%', height: 60, position: 'absolute', bottom: 0, left: 0}}>{' '}</Text>
            </View>
          </View>
        </View>
      ) : (
        <View className="flex-row justify-between">
          <View className="flex-1 items-center">
            <Text className="text-base font-medium mb-2">Weight</Text>
            <View className={`${Platform.OS === 'ios' ? '' : 'border-b-2 border-blue-500'} mx-2 pb-2`}>
            <Picker
              selectedValue={weightKg}
              style={{ width: 120, height: 50, color: 'black' }}
              itemStyle={{ fontSize: 18, color: 'black' }}
              onValueChange={setWeightKg}
              
            >
              <Picker.Item label="kg" value={null} style={{color: 'black'}} />
              {weightsKg.map(kg => (
                <Picker.Item key={kg} label={`${kg} kg`} style={{color: 'black'}} value={kg} />
              ))}
            </Picker>
            <Text style={{width: '100%', height: 60, position: 'absolute', bottom: 0, left: 0}}>{' '}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};