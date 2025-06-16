import React from 'react'
import { View, Text } from 'react-native'
import QuestionSelector from '../QuestionSelector'
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants'
import { useGoalsFlowStore } from 'src/store/goalsFlowStore'

export const GoalsFitnessGoal: React.FC = () => {
    const fitnessGoal = useGoalsFlowStore((state) => state.fitnessGoal);
    const setFitnessGoal = useGoalsFlowStore((state) => state.setFitnessGoal);

    return (
        <View className="flex-1 h-full">
            <View className="flex-col items-start w-full mt-4">
                <Text className='font-general-sans-semibold tracking-tighter text-3xl font-600 mb-10'>Fitness goal</Text>
                <QuestionSelector icon={IMAGE_CONSTANTS.loseWeightIcon} selected={fitnessGoal === 'Lose weight'} onPress={() => setFitnessGoal('Lose weight')} text="Lose weight" />
                <QuestionSelector icon={IMAGE_CONSTANTS.maintainWeightIcon} selected={fitnessGoal === 'Maintain weight'} onPress={() => setFitnessGoal('Maintain weight')} text="Maintain weight" />
                <QuestionSelector icon={IMAGE_CONSTANTS.gainWeightIcon} selected={fitnessGoal === 'Gain weight'} onPress={() => setFitnessGoal('Gain weight')} text="Gain weight" />
            </View>
        </View>
    )
}