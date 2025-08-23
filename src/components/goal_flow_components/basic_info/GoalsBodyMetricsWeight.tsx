import React from 'react';
import { View, Text, Switch, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';

 // 100cm to 220cm
const weightsLb = Array.from({ length: 321 }, (_, i) => 80 + i); // 80lb to 400lb
const weightsKg = Array.from({ length: 221 }, (_, i) => 30 + i); // 30kg to 250kg

export const GoalBodyMetricsWeight = () => {
  const {
    weight_unit_preference, setWeightUnitPreference,
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
          trackColor={{ false: '#009688', true: '#009688' }}
          thumbColor="#ffffff"
          ios_backgroundColor="#009688"
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
            <View className={`${Platform.OS === 'ios' ? '' : 'border-b border-gray-100'}`}>
            <Picker
              selectedValue={weightLb}
              style={{ 
                width: 120, 
                height: 60, 
                color: '#000000',
                backgroundColor: '#FFFFFF',
                borderWidth: Platform.OS === 'android' ? 1 : 0,
                borderColor: Platform.OS === 'android' ? '#6b7280' : 'transparent',
                borderRadius: Platform.OS === 'android' ? 4 : 0
              }}
              itemStyle={{ fontSize: 18, color: '#000000' }}
              onValueChange={setWeightLb}
              dropdownIconColor={Platform.OS === 'android' ? '#6b7280' : undefined}
              mode={Platform.OS === 'android' ? 'dialog' : undefined}
            >
              <Picker.Item label="lb" value={null} style={{color: '#000000'}} />
              {weightsLb.map(lb => (
                <Picker.Item key={lb} label={`${lb} lb`} style={{color: '#000000'}} value={lb} />
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
            <View className={`${Platform.OS === 'ios' ? '' : 'border-b border-gray-100'}`}>
            <Picker
              selectedValue={weightKg}
              style={{ 
                width: 140, 
                height: 60, 
                color: '#000000',
                backgroundColor: '#FFFFFF',
                borderWidth: Platform.OS === 'android' ? 1 : 0,
                borderColor: Platform.OS === 'android' ? '#6b7280' : 'transparent',
                borderRadius: Platform.OS === 'android' ? 4 : 0
              }}
              itemStyle={{ fontSize: 18, color: '#000000' }}
              onValueChange={setWeightKg}
              dropdownIconColor={Platform.OS === 'android' ? '#6b7280' : undefined}
              mode={Platform.OS === 'android' ? 'dialog' : undefined}
            >
              <Picker.Item label="kg" value={null} style={{color: '#000000'}} />
              {weightsKg.map(kg => (
                <Picker.Item key={kg} label={`${kg} kg`} style={{color: '#000000'}} value={kg} />
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