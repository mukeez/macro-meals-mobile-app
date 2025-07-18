import React, { useState } from 'react';
import { View, Dimensions, ActivityIndicator, Modal, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { CartesianChart, StackedBar } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';

type MacroData = {
  day: number; // 1 (Mon) to 7 (Sun) for week view, or sequential for other periods
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  date: string;
  period_label: string;
};

type TimePeriod = '1w' | '1m' | '3m' | '6m' | '1y';

const macroColors = ['#7E54D9', '#FFC008', '#E283E0', '#ffffff']; // [protein, carbs, fat, calories]

// Helper function to convert grams to calories
const convertMacrosToCalories = (protein: number, carbs: number, fat: number) => {
  return {
    protein: protein * 4, // 4 calories per gram
    carbs: carbs * 4,     // 4 calories per gram
    fat: fat * 9          // 9 calories per gram
  };
};

// Tooltip component
const MacroTooltip = ({ 
  visible, 
  data, 
  onClose 
}: { 
  visible: boolean; 
  data: { period: string; protein: number; carbs: number; fat: number; calories: number; originalProtein?: number; originalCarbs?: number; originalFat?: number } | null; 
  onClose: () => void; 
}) => {
  if (!data) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        className="flex-1 bg-black/50 justify-center items-center"
        activeOpacity={1}
        onPress={onClose}
      >
        <View className="bg-white rounded-xl p-5 m-5 min-w-[250px] shadow-lg">
          <Text className="text-lg font-bold mb-4 text-center">
            {data.period}
          </Text>
          
          <View className="mb-3">
            <View className="flex-row items-center mb-2">
              <View className="w-4 h-4 rounded mr-2" style={{ backgroundColor: macroColors[0] }} />
              <Text className="flex-1 text-base">Protein</Text>
              <Text className="text-base font-bold">{data.protein}</Text>
            </View>
            {data.originalProtein && (
              <Text className="text-xs text-gray-500 ml-6">
                ({data.originalProtein}g)
              </Text>
            )}
          </View>

          <View className="mb-3">
            <View className="flex-row items-center mb-2">
              <View className="w-4 h-4 rounded mr-2" style={{ backgroundColor: macroColors[1] }} />
              <Text className="flex-1 text-base">Carbs</Text>
              <Text className="text-base font-bold">{data.carbs}</Text>
            </View>
            {data.originalCarbs && (
              <Text className="text-xs text-gray-500 ml-6">
                ({data.originalCarbs}g)
              </Text>
            )}
          </View>

          <View className="mb-3">
            <View className="flex-row items-center mb-2">
              <View className="w-4 h-4 rounded mr-2" style={{ backgroundColor: macroColors[2] }} />
              <Text className="flex-1 text-base">Fat</Text>
              <Text className="text-base font-bold">{data.fat}</Text>
            </View>
            {data.originalFat && (
              <Text className="text-xs text-gray-500 ml-6">
                ({data.originalFat}g)
              </Text>
            )}
          </View>

          <View className="border-t border-gray-200 pt-3 mt-1">
            <View className="flex-row items-center">
              <View className="w-4 h-4 rounded mr-2" style={{ backgroundColor: macroColors[3] }} />
              <Text className="flex-1 text-base font-bold">Calories</Text>
              <Text className="text-base font-bold">{data.calories}</Text>
            </View>
          </View>

          <TouchableOpacity 
            className="bg-blue-500 p-3 rounded-lg mt-4 items-center"
            onPress={onClose}
          >
            <Text className="text-white text-base font-semibold">Close</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

export const VictoryStackedBarChart = ({ 
  data, 
  timePeriod = '1w' 
}: { 
  data: MacroData[];
  timePeriod?: TimePeriod;
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipData, setTooltipData] = useState<{ period: string; protein: number; carbs: number; fat: number; calories: number; originalProtein?: number; originalCarbs?: number; originalFat?: number } | null>(null);

  // Load the font
  const font = useFont(require('../../assets/fonts/GeneralSans-Regular.otf'), 12);

  const screenWidth = Dimensions.get('window').width;
  const padding = 10;

  // Transform data for the chart - use period_label from backend
  const getChartData = () => {
    return data.map((item, index) => {
      const calorieMacros = convertMacrosToCalories(item.protein, item.carbs, item.fat);
      return {
        x: item.period_label, // Use the period_label from backend
        protein: calorieMacros.protein,
        carbs: calorieMacros.carbs,
        fat: calorieMacros.fat,
        calories: item.calories,
        originalProtein: item.protein,
        originalCarbs: item.carbs,
        originalFat: item.fat,
        date: item.date
      };
    });
  };

  const chartData = getChartData() as Array<{
    x: string;
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
    originalProtein: number;
    originalCarbs: number;
    originalFat: number;
    date?: string;
  }>;

  // Calculate domain for y-axis - map to the highest value
  let maxValue = 0;
  
  maxValue = Math.max(
    ...data.map(d => {
      const calorieMacros = convertMacrosToCalories(d.protein, d.carbs, d.fat);
      const macroSum = calorieMacros.protein + calorieMacros.carbs + calorieMacros.fat;
      return Math.max(macroSum, d.calories);
    })
  );
  
  // Round up to nearest nice number for y-axis
  const yDomain: [number, number] = [0, Math.ceil(maxValue / 500) * 500];
  
  // Debug logging to see what data is being passed to the chart
  console.log('Chart data being passed to VictoryStackedBarChart:', chartData);
  console.log('Y-axis domain:', yDomain);

  const handleBarPress = (index: number) => {
    const dataPoint = chartData[index];
    if (dataPoint) {
      const periodLabel = dataPoint.x;
      
      setTooltipData({
        period: periodLabel,
        protein: dataPoint.protein,
        carbs: dataPoint.carbs,
        fat: dataPoint.fat,
        calories: dataPoint.calories,
        originalProtein: dataPoint.originalProtein,
        originalCarbs: dataPoint.originalCarbs,
        originalFat: dataPoint.originalFat
      });
      setTooltipVisible(true);
    }
  };

  if (!font) {
    return (
      <View className="h-[250px] px-2.5 justify-center items-center">
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  return (
    <View className="h-[250px] px-2.5">
      <CartesianChart
        data={chartData}
        xKey="x"
        yKeys={['protein', 'carbs', 'fat', 'calories']}
        padding={{ left: 10, right: 10, top: 20, bottom: 40 }}
        domainPadding={{ left: 15, right: 15 }}
        domain={{ y: yDomain }}
        xAxis={{
          lineColor: 'transparent',
          labelColor: '#ffffff',
          font,
          labelOffset: 8,
          tickCount: chartData.length
        }}
        yAxis={[{
          lineColor: '#ffffff',
          labelColor: '#ffffff',
          formatYLabel: (value) => `${value}`,
          font,
          labelOffset: 8,
          axisSide: 'right'
        }]}
      >
        {({ points, chartBounds }) => (
          <StackedBar
            points={[points.protein, points.carbs, points.fat, points.calories]}
            chartBounds={chartBounds}
            colors={macroColors}
            innerPadding={0.2}
            animate={{ type: 'spring' }}
            barOptions={({ isBottom, isTop }) => ({
              roundedCorners: isTop
                ? { topLeft: 4, topRight: 4 }
                : isBottom
                  ? { bottomLeft: 4, bottomRight: 4 }
                  : undefined
            })}
          />
        )}
      </CartesianChart>

      {/* Touch overlay for tooltips */}
      <View className="absolute inset-0 flex-row">
        {chartData.map((_, index) => (
          <TouchableWithoutFeedback
            key={index}
            onPress={() => handleBarPress(index)}
          >
            <View className="flex-1 h-full" />
          </TouchableWithoutFeedback>
        ))}
      </View>

      <MacroTooltip 
        visible={tooltipVisible} 
        data={tooltipData} 
        onClose={() => setTooltipVisible(false)} 
      />
    </View>
  );
};

export default VictoryStackedBarChart; 