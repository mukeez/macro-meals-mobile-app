import React from "react";
import { View, Text } from "react-native";

const macroColors = {
  protein: "#7E54D9",
  carbs: "#FFC008",
  fat: "#E283E0",
};

const macroLabels = [
  { key: "carbs", label: "Carbohydrates" },
  { key: "fat", label: "Fat" },
  { key: "protein", label: "Protein" },
];

const LABEL_COL_WIDTH = 110;

const MacroTableSection = ({
  avg,
  goal,
}: {
  avg: { protein: number; carbs: number; fat: number };
  goal: { protein: number; carbs: number; fat: number };
}) => (
  <View className="rounded-2xl mt-4 mx-3 py-4 bg-white">
    <View className="flex-row items-center mb-3 px-2">
      <View
        className="flex-row items-center"
        style={{ width: LABEL_COL_WIDTH }}
      >
        <Text className="text-black text-base font-medium">Macro</Text>
      </View>
      <View className="flex-1" />
      <View className="w-16 items-center">
        <Text className="text-base font-medium">Avg</Text>
      </View>
      <View className="w-16 items-center">
        <Text className="text-base font-medium">Goal</Text>
      </View>
    </View>
    {macroLabels.map((macro) => (
      <View key={macro.key} className="flex-row items-center mb-5 px-2">
        <View
          className="flex-row items-center"
          style={{ width: LABEL_COL_WIDTH }}
        >
          <View
            className="w-[14px] h-[14px] rounded-[4px] mr-2"
            style={{
              backgroundColor:
                macroColors[macro.key as keyof typeof macroColors],
            }}
          />
          <Text className="text-black text-[15px] font-medium">
            {macro.label}
          </Text>
        </View>
        <View className="flex-1" />
        <View className="w-16 items-center">
          <Text className="text-sm font-normal text-[#4F4F4F]">
            {avg[macro.key as keyof typeof avg]}%
          </Text>
        </View>
        <View className="w-16 items-center">
          <Text className="text-sm font-normal text-[#1C5897]">
            {goal[macro.key as keyof typeof goal]}%
          </Text>
        </View>
      </View>
    ))}
  </View>
);

export default MacroTableSection;
