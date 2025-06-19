import { View, Text, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from 'src/types/navigation';
import BackButton from 'src/components/BackButton';
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants';
import { QuestionSelector } from '../QuestionSelector';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';


type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const GoalsGender: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const gender = useGoalsFlowStore((state) => state.gender);
    const setGender = useGoalsFlowStore((state)=> state.setGender);

    // const isValid = !!gender;

    const [selectedGender, setSelectedGender] = useState<string>('');


    
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