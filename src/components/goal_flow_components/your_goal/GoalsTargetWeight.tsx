import React from 'react';
import { View, Text } from 'react-native';
import { RulerPicker } from 'react-native-ruler-picker';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';

export const GoalsTargetWeight: React.FC = () => {
  const targetWeight = useGoalsFlowStore((s) => s.targetWeight);
  const setTargetWeight = useGoalsFlowStore((s) => s.setTargetWeight);

  return (
    <View className="flex-1 bg-white px-4">
      <Text className="text-3xl font-bold mt-4">Target weight</Text>
      <Text className="text-base text-gray-500 mb-6">You can always change it later.</Text>
      <View className="items-center mt-8">
        <Text className="text-base text-center mb-2">Gain weight</Text>
        {/* <Text className="text-3xl font-bold text-center mb-4">{targetWeight ? `${targetWeight} lbs` : '-- lbs'}</Text> */}
       <View className='w-full bg-primary mt-[50px]'>
       <RulerPicker
          min={80}
          max={400}
          step={1}
          fractionDigits={0}
          initialValue={targetWeight || 180}
          onValueChangeEnd={(value) => setTargetWeight(Number(value))}
          unit="lbs"
          width={300}
          height={100}
          indicatorColor="#ffffff"
          indicatorHeight={60}
          //backgroundColor="#fff"
          //textColor="#222"
          shortStepHeight={20}
          longStepHeight={40}
        />
       </View>
      </View>
    </View>
  );
};