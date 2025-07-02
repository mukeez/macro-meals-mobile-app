import React from "react";
import { View, Dimensions } from "react-native";
import { StackedBarChart } from "react-native-chart-kit";

type MacroData = {
  day: number; // 0 (Mon) to 6 (Sun)
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
};

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MyChart({ data }: { data: MacroData[] }) {
  const screenWidth = Dimensions.get('window').width;
  const padding = 10; // Horizontal padding
  const chartWidth = screenWidth - (padding * 2);

  // Transform data for react-native-chart-kit format
  const chartData = {
    labels: data.map(d => {
      // Handle day mapping properly - day should be 1=Mon, 2=Tue, ..., 7=Sun
      const dayIndex = d.day - 1; // Convert 1-7 to 0-6 array index
      return dayLabels[dayIndex] || `Day${d.day}`;
    }),
    legend: ['Protein', 'Carbs', 'Fat', 'Calories'],
    data: data.map(d => [d.protein, d.carbs, d.fat, d.calories]),
    barColors: ['#7E54D9', '#FFC008', '#E283E0', '#FFFFFF'],
  };

  const chartConfig = {
    backgroundColor: '#009688',
    backgroundGradientFrom: '#009688',
    backgroundGradientTo: '#009688',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White color for grid lines
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`, // White labels
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
      fill: '#ffffff', // White labels
    },
    propsForHorizontalLabels: {
      fontSize: 11,
      fontWeight: '600',
      fill: '#ffffff', // White x-axis labels
    },
    propsForVerticalLabels: {
      fontSize: 11,
      fontWeight: '600',
      fill: '#ffffff', // White y-axis labels
    },
    formatYLabel: (value: string) => `${value}g`,
    barPercentage: 1, // Reduced to center bars better
  };

  return (
    <View className="flex-1 w-full" style={{ paddingHorizontal: padding }}>
      <StackedBarChart
        data={chartData}
        width={chartWidth}
        height={250}
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