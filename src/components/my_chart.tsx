import React from "react";
import { View, Dimensions, Text } from "react-native";
import { StackedBarChart } from "react-native-chart-kit";

type MacroData = {
  day: number; // 1 (Mon) to 7 (Sun)
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  date: string;
};

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MyChart({ data }: { data: MacroData[] }) {
  const screenWidth = Dimensions.get('window').width;
  const padding = 10; // Horizontal padding
  const chartWidth = screenWidth - (padding * 2);

  // Transform data for react-native-chart-kit format
  const chartData = {
    labels: data.map(d => {
      const dayIndex = ((d.day - 1) % 7); // Ensure it's 0-6 range
      return dayLabels[dayIndex] || `Day${d.day}`;
    }),
    legend: ['Protein', 'Carbs', 'Fat'],
    data: data.map(d => [d.protein, d.carbs, d.fat]),
    barColors: ['#7E54D9', '#FFC008', '#E283E0'],
  };

  const chartConfig = {
    backgroundColor: '#009688',
    backgroundGradientFrom: '#009688',
    backgroundGradientTo: '#009688',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: '#e3e3e3',
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
      fill: '#ffffff',
    },
    formatYLabel: (value: string) => `${value}g`,
    barPercentage: 0.8,
  };

  // If all values are zero, show a minimum height
  const hasData = data.some(d => d.protein > 0 || d.carbs > 0 || d.fat > 0);
  const minHeight = hasData ? 250 : 150;

  return (
    <View className="flex-1 w-full" style={{ paddingHorizontal: padding }}>
      <StackedBarChart
        data={chartData}
        width={chartWidth}
        height={minHeight}
        chartConfig={chartConfig}
        style={{
          marginVertical: 0,
          borderRadius: 0,
        }}
        withHorizontalLabels={true}
        withVerticalLabels={true}
        fromZero={true}
        segments={4}
        hideLegend={true}
      />
    </View>
  );
}