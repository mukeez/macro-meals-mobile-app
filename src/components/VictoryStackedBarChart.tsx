import React, { useState } from 'react';
import { View, Dimensions, ActivityIndicator, Modal, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { CartesianChart, StackedBar } from 'victory-native';
import { useFont } from '@shopify/react-native-skia';

type MacroData = {
  day: number; // 1 (Mon) to 7 (Sun) for week view
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  date: string;
};

type TimePeriod = '1w' | '1m' | '3m' | '6m' | '1y';

// Day labels for week view
const dayLabels = ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'];

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

  // Transform data based on time period
  const getChartData = () => {
    if (timePeriod === '1w') {
      // Week view: show days
      // Create a complete week array with all 7 days
      const weekData = Array.from({ length: 7 }, (_, index) => {
        // Find data for this day of the week (1-7)
        const dayData = data.find(d => d.day === index + 1);
        
        if (dayData) {
          const calorieMacros = convertMacrosToCalories(dayData.protein, dayData.carbs, dayData.fat);
          return {
            x: dayLabels[index],
            protein: calorieMacros.protein,
            carbs: calorieMacros.carbs,
            fat: calorieMacros.fat,
            calories: dayData.calories,
            originalProtein: dayData.protein,
            originalCarbs: dayData.carbs,
            originalFat: dayData.fat,
            date: dayData.date
          };
        } else {
          // Return zero data for missing days
          return {
            x: dayLabels[index],
            protein: 0,
            carbs: 0,
            fat: 0,
            calories: 0,
            originalProtein: 0,
            originalCarbs: 0,
            originalFat: 0,
            date: ''
          };
        }
      });
      
      console.log('Week data with calorie values:', weekData.map(d => ({
        day: d.x,
        protein: d.protein,
        carbs: d.carbs,
        fat: d.fat,
        calories: d.calories
      })));
      return weekData;
    } else {
      // Month/Quarter/Year view: show weeks or months
      const groupedData = groupDataByPeriod(data, timePeriod);
      const chartData = groupedData.map((group, index) => {
        const calorieMacros = convertMacrosToCalories(group.protein, group.carbs, group.fat);
        return {
          x: getXAxisLabel(group.period, timePeriod),
          protein: calorieMacros.protein,
          carbs: calorieMacros.carbs,
          fat: calorieMacros.fat,
          calories: group.calories,
          originalProtein: group.protein,
          originalCarbs: group.carbs,
          originalFat: group.fat,
          period: group.period
        };
      });
      console.log('Grouped data with calorie values:', chartData.map(d => ({
        period: d.x,
        protein: d.protein,
        carbs: d.carbs,
        fat: d.fat,
        calories: d.calories
      })));
      return chartData;
    }
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
    period?: string;
  }>;

  // Calculate domain for y-axis - map to the highest value
  let maxValue = 0;
  
  if (timePeriod === '1w') {
    // For week view, use individual day data
    maxValue = Math.max(
      ...data.map(d => {
        const calorieMacros = convertMacrosToCalories(d.protein, d.carbs, d.fat);
        const macroSum = calorieMacros.protein + calorieMacros.carbs + calorieMacros.fat;
        return Math.max(macroSum, d.calories);
      })
    );
  } else {
    // For month/quarter/year view, use grouped data
    const groupedData = groupDataByPeriod(data, timePeriod);
    maxValue = Math.max(
      ...groupedData.map(group => {
        const calorieMacros = convertMacrosToCalories(group.protein, group.carbs, group.fat);
        const macroSum = calorieMacros.protein + calorieMacros.carbs + calorieMacros.fat;
        return Math.max(macroSum, group.calories);
      })
    );
  }
  
  // Round up to nearest nice number for y-axis
  const yDomain: [number, number] = [0, Math.ceil(maxValue / 500) * 500];
  
  // Debug logging to see what data is being passed to the chart
  console.log('Chart data being passed to VictoryStackedBarChart:', chartData);
  console.log('Y-axis domain:', yDomain);

  const handleBarPress = (index: number) => {
    const dataPoint = chartData[index];
    if (dataPoint) {
      const periodLabel = timePeriod === '1w' && 'date' in dataPoint 
        ? `${dataPoint.x} (${dataPoint.date})` 
        : dataPoint.x;
      
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

// Helper function to group data by time period
const groupDataByPeriod = (data: MacroData[], timePeriod: TimePeriod) => {
  const groups: { [key: string]: { protein: number; carbs: number; fat: number; calories: number; period: string } } = {};

  // Get the current date and calculate the start date based on time period
  const now = new Date();
  let startDate: Date;

  switch (timePeriod) {
    case '1m':
      startDate = new Date(now.getFullYear(), now.getMonth(), 1); // Start of current month
      break;
    case '3m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1); // 3 months ago
      break;
    case '6m':
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1); // 6 months ago
      break;
    case '1y':
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1); // 1 year ago
      break;
    default:
      startDate = new Date(0); // All data
  }

  // Initialize all expected periods for 1m view
  if (timePeriod === '1m') {
    // Initialize all 4-5 weeks of the month
    for (let week = 1; week <= 5; week++) {
      const periodKey = `W${week}`;
      groups[periodKey] = { protein: 0, carbs: 0, fat: 0, calories: 0, period: periodKey };
    }
  }

  data.forEach(item => {
    const date = new Date(item.date);
    
    // Skip data outside the time period
    if (date < startDate) {
      return;
    }

    let periodKey: string;

    switch (timePeriod) {
      case '1m':
        // Group by week (W1, W2, W3, W4, W5)
        const weekOfMonth = Math.ceil(date.getDate() / 7);
        periodKey = `W${weekOfMonth}`;
        break;
      case '3m':
      case '6m':
        // Group by month (Jan, Feb, Mar, etc.)
        periodKey = date.toLocaleDateString('en-US', { month: 'short' });
        break;
      case '1y':
        // Group by quarter (Q1, Q2, Q3, Q4)
        const quarter = Math.ceil((date.getMonth() + 1) / 3);
        periodKey = `Q${quarter}`;
        break;
      default:
        periodKey = item.date;
    }

    if (!groups[periodKey]) {
      groups[periodKey] = { protein: 0, carbs: 0, fat: 0, calories: 0, period: periodKey };
    }

    groups[periodKey].protein += item.protein;
    groups[periodKey].carbs += item.carbs;
    groups[periodKey].fat += item.fat;
    groups[periodKey].calories += item.calories;
  });

  // Sort the groups by date for proper ordering
  const sortedGroups = Object.values(groups).sort((a, b) => {
    if (timePeriod === '1m') {
      // For weeks, sort by week number
      const weekA = parseInt(a.period.replace('W', ''));
      const weekB = parseInt(b.period.replace('W', ''));
      return weekA - weekB;
    } else if (timePeriod === '3m' || timePeriod === '6m') {
      // For months, sort by month order
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthA = months.indexOf(a.period);
      const monthB = months.indexOf(b.period);
      return monthA - monthB;
    } else if (timePeriod === '1y') {
      // For quarters, sort by quarter number
      const quarterA = parseInt(a.period.replace('Q', ''));
      const quarterB = parseInt(b.period.replace('Q', ''));
      return quarterA - quarterB;
    }
    return 0;
  });

  return sortedGroups;
};

// Helper function to get x-axis labels
const getXAxisLabel = (period: string, timePeriod: TimePeriod) => {
  
  if (!period) {
    return 'Unknown';
  }
  
  switch (timePeriod) {
    case '1m':
      return period; // W1, W2, W3, W4
    case '3m':
    case '6m':
      return period; // Jan, Feb, Mar, etc.
    case '1y':
      return period; // Q1, Q2, Q3, Q4
    default:
      return period;
  }
};

export default VictoryStackedBarChart; 