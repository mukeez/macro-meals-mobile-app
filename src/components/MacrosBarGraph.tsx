import React from "react";
import { View, Text } from "react-native";

const LANDMARKS = [0, 500, 1000, 1500];

const MacrosBarGraph = ({
  data,
  macroColors,
}: {
  data: any[];
  macroColors: Record<string, string>;
}) => {
  const maxCalories = Math.max(
    ...data.map((d) => d.protein * 4 + d.carbs * 4 + d.fat * 9),
    1500
  );

  return (
    <View
      className="flex-row items-end"
      style={{
        minHeight: 150,
        position: "relative",
      }}
    >
      {/* Bars + labels */}
      <View className="flex-1 flex-row items-end" style={{ height: 110 }}>
        {data.map((day) => {
          const proteinCals = day.protein * 4;
          const carbsCals = day.carbs * 4;
          const fatCals = day.fat * 9;
          const totalCals = proteinCals + carbsCals + fatCals;
          const totalBarHeight =
            maxCalories > 0 ? (totalCals / maxCalories) * 110 : 0;
          const proteinHeight = totalBarHeight * (proteinCals / totalCals);
          const carbsHeight = totalBarHeight * (carbsCals / totalCals);
          const fatHeight = totalBarHeight * (fatCals / totalCals);

          return (
            <View key={day.date} className="flex-1 items-center mx-0.5">
              <View className="items-center justify-end">
                <View
                  className="flex-col-reverse overflow-hidden rounded-t-lg"
                  style={{
                    width: 24,
                    height: 110,
                  }}
                >
                  <View
                    className="w-full"
                    style={{
                      height: fatHeight,
                      backgroundColor: macroColors.fat,
                    }}
                  />
                  <View
                    className="w-full"
                    style={{
                      height: carbsHeight,
                      backgroundColor: macroColors.carbs,
                    }}
                  />
                  <View
                    className="w-full"
                    style={{
                      height: proteinHeight,
                      backgroundColor: macroColors.protein,
                    }}
                  />
                </View>
                <Text className="text-xs text-white mt-1">
                  {new Date(day.date).toLocaleDateString(undefined, {
                    weekday: "short",
                  })}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      {/* Y Axis on right, aligned with bars */}
      <View
        className="justify-between items-start pl-1"
        style={{ height: 110 }}
      >
        {[...LANDMARKS].reverse().map((lm, idx) => (
          <View
            key={lm}
            className="flex-row items-center relative"
            style={{
              height:
                idx === LANDMARKS.length - 1
                  ? undefined
                  : 110 / (LANDMARKS.length - 1),
            }}
          >
            <View
              className="mr-1"
              style={{ height: 1, backgroundColor: "#ccc", width: 8 }}
            />
            <Text className="text-[10px] text-white w-7 text-left">{lm}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default MacrosBarGraph;
