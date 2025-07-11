import React from 'react';
import { View, Dimensions, ActivityIndicator } from 'react-native';
import { CartesianChart, StackedBar, Line } from 'victory-native';
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

// Shorter day labels for week view
const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const macroColors = ['#7E54D9', '#FFC008', '#E283E0', '#ffffff']; // [protein, carbs, fat, calories]

export const VictoryStackedBarChart = ({ 
  data, 
  timePeriod = '1w' 
}: { 
  data: MacroData[];
  timePeriod?: TimePeriod;
}) => {
  // Load the font
  const font = useFont(require('../../assets/fonts/GeneralSans-Regular.otf'), 12);

  const screenWidth = Dimensions.get('window').width;
  const padding = 10;

  // Transform data based on time period
  const getChartData = () => {
    if (timePeriod === '1w') {
      // Week view: show days
      const weekData = data.map(d => ({
        x: dayLabels[(d.day - 1) % 7],
        protein: d.protein,
        carbs: d.carbs,
        fat: d.fat,
        calories: d.calories
      }));
      console.log('Week data with values:', weekData.map(d => ({
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
      const chartData = groupedData.map((group, index) => ({
        x: getXAxisLabel(group.period, timePeriod),
        protein: group.protein,
        carbs: group.carbs,
        fat: group.fat,
        calories: group.calories
      }));
      console.log('Grouped data with values:', chartData.map(d => ({
        period: d.x,
        protein: d.protein,
        carbs: d.carbs,
        fat: d.fat,
        calories: d.calories
      })));
      return chartData;
    }
  };

  const chartData = getChartData();

  // Calculate domain for y-axis
  const maxValue = Math.max(
    ...data.map(d => d.protein + d.carbs + d.fat)
  );
  const yDomain: [number, number] = [0, Math.ceil(maxValue / 50) * 50]; // Round to nearest 50

  if (!font) {
    return (
      <View style={{ height: 250, paddingHorizontal: padding, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  return (
    <View style={{ height: 250, paddingHorizontal: padding }}>
      <CartesianChart
        data={chartData}
        xKey="x"
        yKeys={['protein', 'carbs', 'fat', 'calories']}
        padding={{ left: 5, right: 5, top: 20, bottom: 30 }}
        domainPadding={{ left: 20, right: 20 }}
        domain={{ y: yDomain }}
        xAxis={{
          lineColor: 'transparent',
          labelColor: '#ffffff',
          font,
          labelOffset: 8,
          tickCount: chartData.length // Ensure we only show labels for actual data points
        }}
        yAxis={[{
          lineColor: '#ffffff',
          labelColor: '#ffffff',
          formatYLabel: (value) => `${value}g`,
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
            innerPadding={0.25}
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

  data.forEach(item => {
    const date = new Date(item.date);
    
    // Skip data outside the time period
    if (date < startDate) {
      return;
    }

    let periodKey: string;

    switch (timePeriod) {
      case '1m':
        // Group by week (W1, W2, W3, W4)
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