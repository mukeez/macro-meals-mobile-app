import React from "react";
import { View, Text } from "react-native";

const macroColors = {
  protein: "#7E54D9",
  carbs: "#FFC008",
  fat: "#E283E0",
};

const macroLabels = [
  { key: "carbs", label: "Carbs" },
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
        <Text className="text-black text-base">Macro</Text>
      </View>
      <View className="flex-1" />
      <View className="w-14 items-end">
        <Text className="text-[13px] text-[#4F4F4F]">Avg</Text>
      </View>
      <View className="w-14 items-end">
        <Text className="text-[13px] font-bold text-[#1C5897]">Goal</Text>
      </View>
    </View>
    {macroLabels.map((macro) => (
      <View key={macro.key} className="flex-row items-center mb-3 px-2">
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
        <View className="w-14 items-end">
          <Text className="text-[14px] font-medium text-[#4F4F4F]">
            {avg[macro.key as keyof typeof avg]}%
          </Text>
        </View>
        <View className="w-14 items-end">
          <Text className="text-[14px] font-bold text-[#1C5897]">
            {goal[macro.key as keyof typeof goal]}%
          </Text>
        </View>
      </View>
    ))}
  </View>
);

export default MacroTableSection;
