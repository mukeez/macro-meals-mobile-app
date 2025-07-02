import React from "react";
import { View, Text } from "react-native";

const macroNames = {
  calories: "Calories",
  carbs: "Carbs",
  fat: "Fat",
  protein: "Protein",
};

const MacroLegend = ({
  macroColors,
  small = false,
}: {
  macroColors: Record<string, string>;
  small?: boolean;
}) => (
  <View className="flex-row justify-between mb-2">
    {Object.entries(macroNames).map(([key, label]) => (
      <View
        key={key}
        className={`flex-row items-center mr-2 ${
          small ? "space-x-1" : "space-x-1.5"
        }`}
      >
        <View
          className={`${
            small
              ? "w-[14px] h-[14px] rounded-[2px]"
              : "w-[18px] h-[18px] rounded-[2px]"
          } mr-1`}
          style={{
            backgroundColor: macroColors[key],
          }}
        />
        <Text
          className={`text-white font-medium ${
            small ? "text-sm" : "text-[13px]"
          } mr-[2px]`}
        >
          {label}
        </Text>
      </View>
    ))}
  </View>
);

export default MacroLegend;
