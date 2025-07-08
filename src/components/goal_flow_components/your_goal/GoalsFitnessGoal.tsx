import React from 'react'
import { View, Text } from 'react-native'
import QuestionSelector from '../QuestionSelector'
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants'
import { useGoalsFlowStore } from 'src/store/goalsFlowStore'

export const GoalsFitnessGoal: React.FC = () => {
    const fitnessGoal = useGoalsFlowStore((state) => state.fitnessGoal);
    const setFitnessGoal = useGoalsFlowStore((state) => state.setFitnessGoal);
    const setTargetWeight = useGoalsFlowStore((state) => state.setTargetWeight);
    const setProgressRate = useGoalsFlowStore((state) => state.setProgressRate);
    const unit = useGoalsFlowStore((state) => state.unit);
    const weightLb = useGoalsFlowStore((state) => state.weightLb);
    const weightKg = useGoalsFlowStore((state) => state.weightKg);
    const markSubStepComplete = useGoalsFlowStore((state) => state.markSubStepComplete);

    const handleMaintainWeight = () => {
        setFitnessGoal('Maintain weight');
        // Set target weight to current weight
        const currentWeight = unit === 'imperial' ? weightLb : weightKg;
        if (currentWeight !== null) {
            setTargetWeight(currentWeight);
            // Set progress rate to 0
            setProgressRate('0.00');
            // Mark the next two substeps as complete
            markSubStepComplete(1, 1); // Mark target weight step complete
            markSubStepComplete(1, 2); // Mark progress rate step complete
        }
    };

    return (
        <View className="flex-1 h-full">
            <View className="flex-col items-start w-full mt-4">
                <Text className='font-general-sans-semibold tracking-tighter text-3xl font-600 mb-10'>Fitness goal</Text>
                <QuestionSelector icon={IMAGE_CONSTANTS.loseWeightIcon} selected={fitnessGoal === 'Lose weight'} onPress={() => setFitnessGoal('Lose weight')} text="Lose weight" />
                <QuestionSelector icon={IMAGE_CONSTANTS.maintainWeightIcon} selected={fitnessGoal === 'Maintain weight'} onPress={handleMaintainWeight} text="Maintain weight" />
                <QuestionSelector icon={IMAGE_CONSTANTS.gainWeightIcon} selected={fitnessGoal === 'Gain weight'} onPress={() => setFitnessGoal('Gain weight')} text="Gain weight" />
            </View>
        </View>
    )
}