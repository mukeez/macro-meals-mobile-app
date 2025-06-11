import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";

interface MealItemProps {
  label: string; // e.g. "Breakfast", "Lunch", "Dinner"
  emoji: string; // e.g. "🍳"
  mealName: string;
  imageUrl: string;
  loggedTime: string; // e.g. "08:30 AM"
  mode: string; // e.g. "Manual", "Scan", etc.
  onAddFood?: () => void;
}

export const MealItem: React.FC<MealItemProps> = ({
  label,
  emoji,
  mealName,
  imageUrl,
  loggedTime,
  mode,
  onAddFood,
}) => {
  return (
    <View className="bg-gray-200 w-full">
      {/* Header: Meal label and emoji */}
      <View className="flex-row items-center px-5 pt-5">
        <Text className="text-2xl mr-3">{emoji}</Text>
        <Text className="text-lg font-semibold capitalize">{label}</Text>
      </View>

      {/* Image and info row */}
      <View className="flex-row items-center px-5 mt-4">
        <Image
          source={{ uri: imageUrl }}
          className="w-20 h-20 rounded-lg"
          resizeMode="cover"
        />
        <View className="flex-1 ml-4 justify-center">
          <Text className="text-base font-bold mb-1" numberOfLines={1}>
            {mealName}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-xs text-gray-500">{loggedTime}</Text>
            <Text className="mx-2 text-xs text-gray-400">•</Text>
            <Text className="text-xs text-gray-500">{mode}</Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View className="border-b border-gray-200 my-5 mx-5" />

      {/* Add Food Button/Link */}
      <TouchableOpacity
        activeOpacity={onAddFood ? 0.7 : 1}
        onPress={onAddFood}
        className="px-5 pb-5"
      >
        <Text className="text-[#01675B] font-bold text-sm">+ ADD FOOD</Text>
      </TouchableOpacity>
    </View>
  );
};
