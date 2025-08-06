import React from 'react';
import { View, Text } from 'react-native'

import { IMAGE_CONSTANTS } from 'src/constants/imageConstants';
import { QuestionSelector } from '../QuestionSelector';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';


export const GoalsGender: React.FC = () => {
    const gender = useGoalsFlowStore((state) => state.gender);
    const setGender = useGoalsFlowStore((state)=> state.setGender);

    // const isValid = !!gender;
  return (

        <View className="flex-1 h-full">
            <View className="flex-col items-start w-full mt-4">
                <Text className='font-general-sans-semibold tracking-tighter text-3xl font-600 mb-10'>Select your gender</Text>
                <QuestionSelector icon={IMAGE_CONSTANTS.maleIcon} selected={gender === 'Male'} onPress={() => setGender('Male')} text="Male" />
                <QuestionSelector icon={IMAGE_CONSTANTS.femaleIcon} selected={gender === 'Female'} onPress={() => setGender('Female')} text="Female" />
            </View>
        </View>
  )
}

export default GoalsGender