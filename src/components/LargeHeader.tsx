import React from "react";
import { View, Text } from "react-native";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Category emoji mapping
const macroEmojis = [
  { key: "protein", emoji: "🍗" },
  { key: "carbs", emoji: "🍚" },
  { key: "fat", emoji: "🥑" },
  { key: "calories", emoji: "🔥" },
];

// Compact emoji progress bar for single line
const EmojiProgressBar = ({
  percent,
  emoji,
  color,
}: {
  percent: number;
  emoji: string;
  color: string;
}) => (
  <View className="flex-1 mx-1">
    {/* Top row: emoji left, percentage centered */}
    <View className="flex-row items-center justify-between mb-1">
      {/* Left-aligned emoji */}
      <View className="bg-gray-100 rounded-full w-8 h-8 items-center justify-center shadow">
        <Text className="text-lg">{emoji}</Text>
      </View>

      {/* Spacer to push percentage to center */}
      <View className="flex-1 items-center -ml-8">
        <Text className="text-[10px] font-semibold text-gray-800">
          {percent}%
        </Text>
      </View>
    </View>

    {/* Progress bar */}
    <View className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
      <View
        className="h-1 rounded-full"
        style={{
          width: `${percent}%`,
          backgroundColor: color,
        }}
      />
    </View>
  </View>
);

interface LargeHeaderProps {
  onPrevDay?: () => void;
  onNextDay?: () => void;
  onFilterPress?: () => void;
  title?: string;
  caloriesRemaining?: number;
  macrosPercentages?: {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
  };
}

const macroColors = {
  protein: "#7E54D9",
  carbs: "#FFC008",
  fat: "#E283E0",
  calories: "#44A047",
};

const LargeHeader: React.FC<LargeHeaderProps> = ({
  onPrevDay,
  onNextDay,
  onFilterPress,
  title = "Today",
  caloriesRemaining = 0,
  macrosPercentages = {
    protein: 80,
    carbs: 50,
    fat: 30,
    calories: 60,
  },
}) => (
  <View className="bg-[#009688] pt-12 pb-10 px-4">
    <View className="flex-row items-center">
      <TouchableOpacity onPress={onPrevDay} className="p-2">
        <Ionicons name="chevron-back" size={28} color="#fff" />
      </TouchableOpacity>

      <View className="flex-1 flex-row justify-center items-center">
        <Text className="text-white text-xl font-bold">{title}</Text>
      </View>

      <TouchableOpacity onPress={onNextDay} className="p-2">
        <Ionicons name="chevron-forward" size={28} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={onFilterPress} className="ml-4 p-2">
        <Ionicons name="filter" size={24} color="#fff" />
      </TouchableOpacity>
    </View>

    {/* Calories Remaining Box */}
    <View className="mt-6 [bg-#01675B]rounded-2xl px-5 py-4 shadow-md">
      <Text className="text-xs font-semibold text-gray-700 mb-1">
        Calories Remaining: {caloriesRemaining}
      </Text>
      {/* Inline Emoji Progress Bars */}
      <View className="flex-row items-end justify-between mt-1">
        {macroEmojis.map((macro) => (
          <EmojiProgressBar
            key={macro.key}
            percent={
              macrosPercentages[macro.key as keyof typeof macrosPercentages]
            }
            emoji={macro.emoji}
            color={macroColors[macro.key as keyof typeof macroColors]}
          />
        ))}
      </View>
    </View>
  </View>
);

export default LargeHeader;
