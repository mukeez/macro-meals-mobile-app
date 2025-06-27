import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import MacroLegend from "src/components/MacroLegend";
import MacrosBarGraph from "src/components/MacrosBarGraph";
import MacroTableSection from "src/components/MacroTableSection";
import CustomSafeAreaView from "src/components/CustomSafeAreaView";
import { useProgressStore } from "src/store/useProgressStore";

const macroColors = {
  protein: "#7E54D9",
  carbs: "#FFC008",
  fat: "#E283E0",
  calories: "#44A047",
};

const dateRanges = [
  { label: "1w", value: "1w" },
  { label: "1m", value: "1m" },
  { label: "3m", value: "3m" },
  { label: "6m", value: "6m" },
  { label: "1y", value: "1y" },
  { label: "All", value: "all" },
];

const ProgressScreen = () => {
  const { data, loading, selectedRange, setSelectedRange, fetchData } =
    useProgressStore();

  useEffect(() => {
    fetchData(selectedRange);
  }, [selectedRange, fetchData]);

  const macroBarData =
    data?.daily_macros?.map((day) => ({
      date: day.date,
      protein: day.protein,
      carbs: day.carbs,
      fat: day.fat,
      calories: day.calories,
    })) || [];

  const avgCalories =
    macroBarData.length > 0
      ? Math.round(
          macroBarData.reduce((sum, d) => sum + (d.calories || 0), 0) /
            macroBarData.length
        )
      : 0;

  let dateRange = "";
  if (data?.start_date && data?.end_date) {
    const format = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    dateRange = `${format(data.start_date)} - ${format(data.end_date)}`;
  }

  const avg = data?.average_macros || { protein: 0, carbs: 0, fat: 0 };
  const goal = data?.target_macros || { protein: 0, carbs: 0, fat: 0 };

  return (
    <CustomSafeAreaView className="flex-1 bg-white">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 56 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-[#009688] pb-2">
          <Text className="text-white text-xl font-bold text-center p-5 mb-2">
            Progress
          </Text>
          <View className="px-5">
            <MacroLegend macroColors={macroColors} small />
            <View className="mt-2 mb-6">
              <Text className="text-white text-[11px] font-medium mb-[1px]">
                Avg calories
              </Text>
              <Text className="text-white text-[28px] font-bold mb-[1px]">
                {loading ? <ActivityIndicator color="#fff" /> : avgCalories}
              </Text>
              <Text className="text-white text-[10px]">{dateRange}</Text>
            </View>
          </View>
          <View className="py-4 mb-7 min-h-[160px]">
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <MacrosBarGraph data={macroBarData} macroColors={macroColors} />
            )}
          </View>
          <View className="flex-row justify-center mb-7 px-2">
            {dateRanges.map((r) => (
              <TouchableOpacity
                key={r.value}
                onPress={() => setSelectedRange(r.value)}
                className={`
                  px-4 py-1 mx-3 rounded-full bg-white
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
        </View>
        {/* Cards */}
        <View className="bg-white flex-row p-4 my-2 z-10">
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
        <View className="flex-1 pb-6">
          <MacroTableSection avg={avg} goal={goal} />
        </View>
      </ScrollView>
    </CustomSafeAreaView>
  );
};

export default ProgressScreen;
