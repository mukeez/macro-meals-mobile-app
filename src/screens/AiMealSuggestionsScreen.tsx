import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import useStore from '../store/useStore';
import { CircularProgress } from 'src/components/CircularProgress';

const API_URL = 'https://api.macromealsapp.com/api/v1/meals/suggest-meals';

const macroData = [
  { label: 'Carbs', value: "45g", color: '#FFD600' },
  { label: 'Fat', value: "45g", color: '#E573D7' },
  { label: 'Protein', value: "45g", color: '#6C5CE7' },
];

function DonutChart({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <View className="items-center w-[90px]">
      <View className="w-[60px] h-[60px] rounded-[30px] bg-[#F5F5F5] absolute top-0 left-[15px]" />
      <View className={`w-[60px] h-[60px] rounded-[30px] border-[6px] border-[${color}] border-r-transparent border-b-transparent absolute top-0 left-[15px]`} />
      <Text className="mt-[70px] font-bold text-base text-[#222]">{value}g</Text>
      <Text className="text-sm text-[#888] mt-0.5">{label}</Text>
    </View>
  );
}

const initialRequestBody = {
  calories: 0,
  carbs: 0,
  fat: 0,
  latitude: 0,
  location: '',
  longitude: 0,
  protein: 0,
};

const AiMealSuggestionsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMeals = async () => {
      setLoading(true);
      setError(null);
      const token = useStore((state) => state.token);

      // Create an AbortController for the timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 1 minute timeout

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify(initialRequestBody),
          signal: controller.signal, // Add the signal to the fetch request
        });
        console.log('API response status:', response.status);
        const data = await response.json();
        console.log('API response data:', data);
        if (!response.ok) throw new Error('Failed to fetch meals');
        console.log('API response data:', data);
        setMeals(data.meals || []);
      } catch (err: any) {
        console.error('API fetch error:', err);
        if (err.name === 'AbortError') {
          setError('Request timed out after 1 minute. Please try again.');
        } else {
          setError(err.message || 'Error fetching meals');
        }
      } finally {
        clearTimeout(timeoutId); // Clear the timeout
        setLoading(false);
      }
    };
    fetchMeals();
  }, []);

  return (
    <CustomSafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-8 h-8 rounded-full justify-center items-center bg-[#F5F5F5]">
            <Text className="text-[22px]">‹</Text>
          </TouchableOpacity>
          <Text className="text-[20px] font-semibold text-[#222] text-center">Suggested meals</Text>
          <View style={{ width: 32 }} />
        </View>
        <ScrollView className="pb-8">
          {/* Macros Donut Row */}
          <View className="flex-row justify-between mx-5 mt-2 mb-4">
            {macroData.map((macro) => (
              <View className="h-[100px] w-[100px] relative">
              <CircularProgress
                size={100}
                strokeWidth={8}
                consumed={Number(macro.value.split('g')[0])}
                total={Number(macro.value.split('g')[0])}
                color={macro.color}
                backgroundColor="#d0e8d1"
                label={macro.label}
              />
            </View>
            ))}
          </View>
          {/* Info Card */}
          <View className="bg-[#BEE3F8] rounded-xl mx-5 p-4 mb-[18px]">
            <Text className="text-[#222] text-[15px] text-center">
              Tailored to your preferences and macro goals, these meals are ordered for maximum effectiveness in reaching your target.
            </Text>
          </View>
          <Text className="text-base font-bold text-[#222] mx-5 mb-2.5">✨ Suggested meals</Text>
          {loading && <ActivityIndicator size="large" color="#19a28f" className="mt-8" />}
          {error && <Text className="text-red-500 text-center mt-6">{error}</Text>}
          {!loading && !error && meals.length === 0 && (
            <Text className="text-center text-[#888] mt-6">No meal suggestions found.</Text>
          )}
          {!loading && !error && meals.map((meal, idx) => (
            <View key={idx} className="flex-row items-center bg-white rounded-xl mx-5 mb-4 p-2.5 shadow-sm">
              <Image source={IMAGE_CONSTANTS.sampleFood} className="w-[60px] h-[60px] rounded-lg mr-2.5" />
              <View className="flex-1">
                <View className="bg-[#19a28f] rounded-md self-start px-1.5 py-0.5 mb-1">
                  <Text className="text-white text-[11px] font-bold">Suggested</Text>
                </View>
                <Text className="text-[15px] font-semibold text-[#222] mb-0.5">{meal.name}</Text>
                <Text className="text-xs text-[#666] mb-1">{meal.description}</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-[#19a28f] text-[13px] mr-2">🟢 {meal.macros.calories} cal</Text>
                  <Text className="text-[#FFD600] text-[13px] mr-2">🟡 {meal.macros.carbs}g</Text>
                  <Text className="text-[#E573D7] text-[13px] mr-2">🟣 {meal.macros.fat}g</Text>
                  <Text className="text-[#6C5CE7] text-[13px]">🟪 {meal.macros.protein}g</Text>
                </View>
                {meal.restaurant && (
                  <Text className="text-xs text-[#888] mt-0.5">
                    {meal.restaurant.name} • {meal.restaurant.location}
                  </Text>
                )}
              </View>
              <View className="flex-col items-center ml-2 gap-2">
                <TouchableOpacity className="p-1"><Text>👍</Text></TouchableOpacity>
                <TouchableOpacity className="p-1"><Text>👎</Text></TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </CustomSafeAreaView>
  );
};

export default AiMealSuggestionsScreen; 