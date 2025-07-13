import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import MacroLegend from "src/components/MacroLegend";
import MacroTableSection from "src/components/MacroTableSection";
import CustomSafeAreaView from "src/components/CustomSafeAreaView";
import { useProgressStore } from "src/store/useProgressStore";
import VictoryStackedBarChart from "src/components/VictoryStackedBarChart";

const macroColors = {
  calories: "#ffffff",
  carbs: "#FFC008",
  fat: "#E283E0",
  protein: "#7E54D9",
};

const dateRanges = [
  { label: "1w", value: "1w" },
  { label: "1m", value: "1m" },
  { label: "3m", value: "3m" },
  { label: "6m", value: "6m" },
  { label: "1y", value: "1y" },

];

interface MacroBarData {
  day: number;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
  date: string;
}

const ProgressScreen = () => {
  const { data, loading, selectedRange, setSelectedRange, fetchDataByPeriod } =
    useProgressStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log(`ProgressScreen: Fetching data for period: ${selectedRange}`);
    fetchDataByPeriod(selectedRange);
  }, [selectedRange, fetchDataByPeriod]);

  const onRefresh = useCallback(async () => {
    console.log(`ProgressScreen: Refreshing data for period: ${selectedRange}`);
    setRefreshing(true);
    await fetchDataByPeriod(selectedRange);
    setRefreshing(false);
  }, [fetchDataByPeriod, selectedRange]);

  // Process real API data only - no dummy data fallback
  let macroBarData: MacroBarData[] = [];
  let hasNonZeroData = false;
  
  try {
    if (data && Array.isArray(data.daily_macros) && data.daily_macros.length > 0) {
      // Filter out future dates
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      macroBarData = data.daily_macros
        .filter(dayData => {
          const date = new Date(dayData.date);
          date.setHours(0, 0, 0, 0);
          return date <= today;
        })
        .map(dayData => {
          const date = new Date(dayData.date);
          return {
            day: date.getDay() + 1, // Convert 0-6 (Sun-Sat) to 1-7 (Mon-Sun)
            protein: Number(dayData.protein) || 0,
            carbs: Number(dayData.carbs) || 0,
            fat: Number(dayData.fat) || 0,
            calories: Number(dayData.calories) || 0,
            date: dayData.date,
          };
        })
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Check if we have any non-zero values
      hasNonZeroData = macroBarData.some(day => 
        day.protein > 0 || day.carbs > 0 || day.fat > 0 || day.calories > 0
      );
    }
  } catch (err) {
    console.error('Error processing macro data:', err);
    macroBarData = [];
  }

  const avgCalories = data?.average_macros?.calories
    ? Math.round(Number(data.average_macros.calories))
    : 0;

  const avg = data?.average_macros 
    ? {
        protein: Math.round(Number(data.average_macros.protein)) || 0,
        carbs: Math.round(Number(data.average_macros.carbs)) || 0,
        fat: Math.round(Number(data.average_macros.fat)) || 0
      }
    : { protein: 0, carbs: 0, fat: 0 };

  const goal = data?.target_macros 
    ? {
        protein: Math.round(Number(data.target_macros.protein)) || 0,
        carbs: Math.round(Number(data.target_macros.carbs)) || 0,
        fat: Math.round(Number(data.target_macros.fat)) || 0
      }
    : { protein: 0, carbs: 0, fat: 0 };

  // Format date range for display
  let dateRange = "";
  if (data?.start_date && data?.end_date) {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    dateRange = `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
  }

  return (
    <ScrollView className="bg-white"
      contentContainerStyle={{ paddingBottom: 56 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" colors={["#fff"]} />
      }
    >
      <View className="bg-primaryLight pb-8">
        <Text className="mt-16 text-white text-xl font-bold text-center p-5">
          Progress
        </Text>
        <View className="px-12">
          <MacroLegend macroColors={macroColors} small />
        </View>
        <View className="pl-5 mt-4 mb-6">
          <Text className="text-white text-xs font-medium mb-[1px]">
            Avg calories
          </Text>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View className="flex-row items-baseline mt-1">
              <Text className="text-white text-2xl font-semibold mb-[1px]">
                {avgCalories}
              </Text>
              <Text className="text-white text-sm font-medium"> kcal</Text>
            </View>
          )}
          <Text className="text-white text-[10px]">{dateRange}</Text>
        </View>
        <View className="x-5">
          {loading ? (
            <View className="flex-1 h-[250px] my-2 justify-center items-center">
              <ActivityIndicator color="#fff" size="large" />
              <Text className="text-white text-base mt-2">Loading data...</Text>
            </View>
          ) : !hasNonZeroData ? (
            <View className="flex-1 h-[250px] my-2 justify-center items-center">
              <Text className="text-white text-sm text-center">
                No macro data available for this period.{"\n"}Log your meals to see your progress!
              </Text>
            </View>
          ) : (
            <VictoryStackedBarChart data={macroBarData} timePeriod={selectedRange as any} />
          )}
        </View>
        <View className="flex-row justify-center mb-7 px-2">
          {dateRanges.map((r) => (
            <TouchableOpacity
              key={r.value}
              onPress={() => setSelectedRange(r.value)}
              className={`
                px-4 py-1.5 mx-3 rounded-full bg-white
                ${selectedRange === r.value ? "opacity-100" : "opacity-70"}
              `}
              activeOpacity={0.8}
            >
              <Text className="text-black text-xs font-semibold">
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overlapping Cards */}
        <View className="absolute bottom-[-40px] left-0 right-0">
          <View className="flex-row px-4" style={{ transform: [{ translateY: 50 }] }}>
            <View className="flex-1 bg-[#C4E7E3] mx-1 rounded-2xl items-center py-6 shadow-lg">
              <View
                className="w-12 h-12 rounded-full justify-center items-center mb-3"
                style={{ backgroundColor: "#253238" }}
              >
                <FontAwesome5 name="trophy" size={22} color="white" />
              </View>
              <Text className="text-sm text-black text-center">
                {data?.target_macros?.calories || "-"} cal
              </Text>
              <Text className="text-xs opacity-65 text-black text-center">
                Net goal
              </Text>
            </View>

            <View className="flex-1 bg-[#C4E7E3] mx-1 rounded-2xl items-center py-6 shadow-lg">
              <View
                className="w-12 h-12 rounded-full justify-center items-center mb-3"
                style={{ backgroundColor: "#253238" }}
              >
                <FontAwesome5 name="fire" size={22} color="white" />
              </View>
              <Text className="text-sm text-black text-center">
                {avgCalories} cal
              </Text>
              <Text className="text-xs opacity-65 text-black text-center">
                Net daily avg.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className="mt-[80px]">
        <MacroTableSection avg={avg} goal={goal} />
      </View>
    </ScrollView>
  );
};

export default ProgressScreen;
