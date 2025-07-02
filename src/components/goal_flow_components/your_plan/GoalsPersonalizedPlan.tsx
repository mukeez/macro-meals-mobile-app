import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import BackButton from 'src/components/BackButton'
import { MacroCircle } from 'src/components/MacroCircle'

const SegmentedProgressBar = ({ current, total }: { current: number; total: number }) => (
  <View className="flex-row items-center w-full mt-4 mb-8 px-2">
    {Array.from({ length: total }).map((_, idx) => (
      <View
        key={idx}
        className={`flex-1 h-2 mx-1 rounded-full ${idx <= current ? 'bg-primary' : 'bg-gray-200'}`}
      />
    ))}
  </View>
)

export const GoalsPersonalizedPlan: React.FC<{ 
  isLoading: boolean, 
  macroData: any, 
  calorieTarget?: number,
  macroCalculationResponse?: any 
}> = ({ isLoading, macroData, calorieTarget, macroCalculationResponse }) => {
  console.log('MACRO DATA', macroData);
  console.log('MACRO CALCULATION RESPONSE', macroCalculationResponse);

  // Helper function to format the estimated date
  const formatEstimatedDate = (dateString: string) => {
    if (!dateString) return 'your target date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Get goal type text
  const getGoalTypeText = () => {
    if (!macroCalculationResponse?.goal_type) return 'achieve your goals';
    switch (macroCalculationResponse.goal_type) {
      case 'lose':
        return 'lose weight';
      case 'gain':
        return 'gain weight';
      case 'maintain':
        return 'maintain your weight';
      default:
        return 'achieve your goals';
    }
  };

  // Get weight change text
  const getWeightChangeText = () => {
    if (!macroCalculationResponse?.goal_type || macroCalculationResponse.goal_type === 'maintain') {
      return 'maintain your current weight';
    }
    
    // For lose/gain goals, we can use the target_weight or calculate from deficit_surplus
    if (macroCalculationResponse.target_weight) {
      const unit = macroCalculationResponse.unit_preference === 'imperial' ? 'lbs' : 'kg';
      const goalType = macroCalculationResponse.goal_type === 'lose' ? 'lose' : 'gain';
      const formattedWeight = Number(macroCalculationResponse.target_weight).toFixed(2);
      return `${goalType} ${formattedWeight} ${unit}`;
    }
    
    return 'achieve your target weight';
  };

  return (
    
    <View className="flex-1 bg-white pt-2">
      {/* Header */}
      {/* Title & Description */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center bg-white px-4 pt-2">
          <ActivityIndicator size="large" color="#19a28f" />
          <Text className="text-base text-gray-500 mt-4 text-center">Calculating your personalized macro targets...</Text>
        </View>
      ) : (
      <View>
    
      <Text className="text-3xl font-bold mt-2 mb-2">Your personalized plan</Text>
      <Text className="text-base text-gray-500 mb-6">Based on your information, we've calculated your ideal daily macronutrient targets to help you reach your goals</Text>
      {/* Calorie Target */}
      {calorieTarget !== undefined && (
        <Text className="text-lg font-bold mb-2 text-primary">Daily Calories: {calorieTarget} kcal</Text>
      )}
      {/* Macro Targets */}
      <Text className="text-lg font-semibold mb-8">Daily macro targets:</Text>
      <View className="flex-row items-center mx-6 justify-between mb-6">
        {macroData.map((macro: any) => (
          <MacroCircle
            size={100}
            key={macro.type}
            type={macro.type}
            value={macro.value}
            progress={100}
            strokeWidth={3}
            color={macro.color}
          />
        ))}
      </View>
      {/* Info Text */}
      {macroCalculationResponse && (
        <Text className="text-base text-gray-500 mb-2 leading-6 tracking-widest">
          These targets are specifically designed to support your fitness journey. Following this nutrition plan, you will <Text className="text-primary font-semibold">{getWeightChangeText()}</Text> by <Text className="text-primary font-semibold">{formatEstimatedDate(macroCalculationResponse?.time_to_goal?.estimated_date)}</Text>.
        </Text>
      )}
      <Text className="text-base text-gray-500 mb-8 mt-4 leading-6 tracking-widest">Ready to start tracking your personalized plan?</Text>
      {/* Confirm Button */}
      </View>
      )}
    </View>
  )
}