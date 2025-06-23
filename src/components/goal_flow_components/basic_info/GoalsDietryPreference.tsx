import React from 'react'
import { View, Text } from 'react-native'
import QuestionSelector from '../QuestionSelector';
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';

export const GoalsDietryPreference: React.FC = () => {
    const dietryPreference = useGoalsFlowStore((state) => state.dietryPreference);
    const setDietryPreference = useGoalsFlowStore((state) => state.setDietryPreference);

    return (
        <View className="flex-1 h-full">
            <View className="flex-col items-start w-full mt-4">
                <Text className='font-general-sans-semibold text-3xl font-600 mb-10 tracking-[0]'>Dietry preference</Text>
                    <QuestionSelector icon={IMAGE_CONSTANTS.vegetarianIcon} selected={dietryPreference === 'Vegetarian'} onPress={() => setDietryPreference('Vegetarian')} text="Vegetarian" />
                    <QuestionSelector icon={IMAGE_CONSTANTS.ketoIcon} selected={dietryPreference === 'Keto'} onPress={() => setDietryPreference('Keto')} text="Keto" />
                    <QuestionSelector icon={IMAGE_CONSTANTS.pescatarianIcon} selected={dietryPreference === 'Pescetarian'} onPress={() => setDietryPreference('Pescetarian')} text="Pescetarian" />
                    <QuestionSelector icon={IMAGE_CONSTANTS.balanceIcon} selected={dietryPreference === 'Balanced'} onPress={() => setDietryPreference('Balanced')} text="Balanced" />
            </View>
        </View>
    )
}
