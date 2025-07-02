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
  // Log the data for debugging
  console.log('MacrosBarGraph data:', data);

  // Use the max calories from the data for scaling
  const maxCalories = Math.max(
    ...data.map((d) => d.calories || 0),
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
      <View className="flex-1 flex-row items-end" style={{ height: 110, marginLeft: 0, marginRight: 20 }}>
        {data.map((day) => {
          // Calculate macro heights based on their kcal contribution
          const proteinCals = day.protein * 4;
          const carbsCals = day.carbs * 4;
          const fatCals = day.fat * 9;
          const totalCals = day.calories || proteinCals + carbsCals + fatCals;
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
      {/* X Axis */}
      <View style={{ position: 'absolute', left: 0, right: 20, bottom: 0, height: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        {data.map((day) => (
          <Text key={day.date} style={{ color: '#fff', fontSize: 12, width: 24, textAlign: 'center' }}>
            {new Date(day.date).toLocaleDateString(undefined, { weekday: 'short' })}
          </Text>
        ))}
      </View>
      {/* Y Axis on right */}
      <View style={{ position: 'absolute', right: 0, top: 0, bottom: 20, width: 20, zIndex: 2, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, justifyContent: 'space-between', height: 110 }}>
          {[...LANDMARKS].reverse().map((lm, idx) => (
            <View key={lm} style={{ flexDirection: 'row', alignItems: 'center', height: idx === LANDMARKS.length - 1 ? undefined : 110 / (LANDMARKS.length - 1) }}>
              <Text style={{ color: '#fff', fontSize: 10, width: 24, textAlign: 'left' }}>{lm}</Text>
              <View style={{ width: 1, height: 1, backgroundColor: '#fff', marginLeft: 2 }} />
            </View>
          ))}
        </View>
        {/* Y axis line */}
        <View style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 2, backgroundColor: '#fff', borderRadius: 1 }} />
      </View>
      {/* Y Axis grid lines (for grid lines only, behind bars) */}
      <View
        className="justify-between items-start pl-1"
        style={{ height: 110, opacity: 0.2, position: 'absolute', left: 0, right: 20, top: 0, pointerEvents: 'none' }}
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
              style={{ height: 1, backgroundColor: "#ccc", width: '100%' }}
            />
          </View>
        ))}
      </View>
    </View>
  );
};

export default MacrosBarGraph;
