import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import BackButton from 'src/components/BackButton'
import { MacroCircle } from 'src/components/MacroCircle'

const macroData = [
  { type: 'Carbs', value: 167, color: '#FFC107' },
  { type: 'Fat', value: 55.67, color: '#E283E0' },
  { type: 'Protein', value: 125, color: '#A59DFE' },
]

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

export const GoalsPersonalizedPlan: React.FC = () => {
  return (
    <View className="flex-1 bg-white px-4 pt-2">
      {/* Header */}
      {/* Title & Description */}
      <Text className="text-3xl font-bold mt-2 mb-2">Your personalized plan</Text>
      <Text className="text-base text-gray-500 mb-6">Based on your information, we've calculated your ideal daily macronutrient targets to help you reach your goals</Text>
      {/* Macro Targets */}
      <Text className="text-lg font-semibold mb-2">Daily macro targets:</Text>
      <View className="flex-row items-center justify-between mb-6">
        {macroData.map((macro) => (
          <MacroCircle
            size={100}
            key={macro.type}
            type={macro.type}
            value={macro.value}
            progress={100}
            color={macro.color}
          />
        ))}
      </View>
      {/* Info Text */}
      <Text className="text-base text-gray-500 mb-2">
        These targets are specifically designed to support your fitness journey. Following this nutrition plan, you will <Text className="text-primary font-semibold">[lose/gain] [XX] kg</Text> by <Text className="text-primary font-semibold">[Month]</Text>.
      </Text>
      <Text className="text-base text-gray-500 mb-8">Ready to start tracking your personalized plan?</Text>
      {/* Confirm Button */}
    </View>
  )
}