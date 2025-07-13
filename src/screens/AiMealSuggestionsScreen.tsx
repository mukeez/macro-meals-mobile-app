import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import useStore from '../store/useStore';
import { CircularProgress } from 'src/components/CircularProgress';
import { mealService } from '../services/mealService';
import { useMixpanel } from '@macro-meals/mixpanel';

type RootStackParamList = {
  AddMeal: { analyzedData?: any };
  AISuggestedMealsDetailsScreen: { meal: any };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'AddMeal'>;

interface MacroData {
  label: 'Protein' | 'Carbs' | 'Fat';
  value: number;
  color: string;
}

const macroTypeToPreferenceKey = {
  'Protein': 'protein_target',
  'Carbs': 'carbs_target',
  'Fat': 'fat_target',
} as const;

const defaultMacroData: MacroData[] = [
  { label: 'Protein', value: 0, color: '#6C5CE7' },
  { label: 'Carbs', value: 0, color: '#FFC107' },
  { label: 'Fat', value: 0, color: '#FF69B4' },
];

const AiMealSuggestionsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<any>(null);
  const macrosPreferences = useStore((state) => state.macrosPreferences);
  const todayProgress = useStore((state) => state.todayProgress) || { protein: 0, carbs: 0, fat: 0, calories: 0 };
  const [macroData, setMacroData] = useState<MacroData[]>(defaultMacroData);
  const mixpanel = useMixpanel();

  const trackAIMealSuggestedViewed = async () => {
    if (!mixpanel) return;
    
    const signupTime = mixpanel.getSuperProperty('signup_time');
    const properties: Record<string, any> = {};

    const firstAISuggestionViewed = mixpanel.getSuperProperty('first_ai_meal_suggested_viewed');
    if (!firstAISuggestionViewed) {
      const now = new Date();
      const timeToFirstSuggestion = signupTime ? 
        (now.getTime() - new Date(signupTime).getTime()) / 1000 : 0;
      properties.time_to_first_ai_meal_suggestion_seconds = timeToFirstSuggestion;
      mixpanel.register({ first_ai_meal_suggested_viewed: true });
    }

    mixpanel.track({
      name: 'ai_meal_suggested_viewed',
      properties
    });
  };

  const handleMealSelect = (meal: any) => {
    navigation.navigate('AISuggestedMealsDetailsScreen', { meal });
  };

  // Update macroData when todayProgress changes
  useEffect(() => {
    if (todayProgress) {
      setMacroData([
        { label: 'Protein', value: todayProgress.protein || 0, color: '#6C5CE7' },
        { label: 'Carbs', value: todayProgress.carbs || 0, color: '#FFC107' },
        { label: 'Fat', value: todayProgress.fat || 0, color: '#FF69B4' },
      ]);
    }
  }, [todayProgress]);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await mealService.getAiMealSuggestions();
        setMeals(result.meals);
        setPreferences(result.preferences);
        
        // Track AI meal suggestions viewed
        if (result.meals && result.meals.length > 0) {
          await trackAIMealSuggestedViewed();
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch meal suggestions');
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  useEffect(() => {
    // Fetch latest daily macro progress from API on mount
    const fetchProgress = async () => {
      try {
        const progressData = await mealService.getDailyProgress();
        setMacroData([
          { label: 'Protein', value: progressData.logged_macros.protein || 0, color: '#6C5CE7' },
          { label: 'Carbs', value: progressData.logged_macros.carbs || 0, color: '#FFC107' },
          { label: 'Fat', value: progressData.logged_macros.fat || 0, color: '#FF69B4' },
        ]);
      } catch (error) {
        setMacroData(defaultMacroData);
      }
    };
    fetchProgress();
  }, []);

  return (
    <CustomSafeAreaView edges={['left', 'right']} className="flex-1">
      <View className="flex-1 bg-gray">
        {/* Header */}
        <View className="flex-row bg-white items-center justify-between px-5 pt-4 pb-5 mb-5">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-8 h-8 rounded-full justify-center items-center bg-[#F5F5F5]">
            <Text className="text-[22px]">‹</Text>
          </TouchableOpacity>
          <Text className="text-[20px] font-semibold text-[#222] text-center">Suggested meals</Text>
          <View style={{ width: 32 }} />
        </View>
        <ScrollView className="pb-8">
            {/* Macros Donut Row */}
            <View className="flex-col bg-white items-start mt-3 px-5 pt-3 pb-10 mb-4">
              <Text className="text-lg text-black mt-2 text-center mb-3 font-medium">Remaining today</Text>
              <View className="flex-row w-full justify-between items-center">
                {macroData.map((macro, index) => {
                  const target = macrosPreferences?.[macroTypeToPreferenceKey[macro.label]] || 0;
                  const consumed = macro.value;
                  const remaining = Math.max(0, target - consumed);
                  // Match MealFinderScreen: donut shows remaining, empties as you consume
                  return (
                    <View key={`${macro.label}-${index}`}>
                      <View className="h-[100px] w-[100px] relative">
                        <CircularProgress
                          size={100}
                          strokeWidth={12}
                          textSize={16}
                          consumed={`${remaining}g`}
                          total={target}
                          color={macro.color}
                          backgroundColor="#d0e8d1"
                          label={macro.label}
                          showLabel={false}
                        />
                        <Text className="text-sm text-black mt-2 text-center font-medium">{macro.label}</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
           
            {/* Info Card */}
            <View className="bg-[#0088D140]  flex-row px-8 mt-5 justify-center items-center rounded-xl mx-5 p-4 mb-[18px]">
              <Image source={IMAGE_CONSTANTS.magicWandAltIcon} className="w-[32px] h-[32px] ml-2 mr-3" />
              <Text className="text-[#222] text-[15px] text-left">
                Tailored to your preferences and macro goals, these meals are ordered for maximum effectiveness in reaching your target.
              </Text>
            </View>
            <Text className="text-base font-bold text-[#222] mx-5 mb-2.5">✨ Suggested meals</Text>
            {loading ? (
              <View className="flex items-center justify-center py-8">
                <ActivityIndicator size="large" color="#19a28f" />
                <Text className="text-[#888] mt-2">Finding meal suggestions...</Text>
              </View>
            ) : (
              <>
                {error ? (
                  <View className="flex items-center justify-center py-8">
                    <Image source={IMAGE_CONSTANTS.warningIcon} className="w-[48px] h-[48px] mb-3 opacity-50" />
                    <Text className="text-[#888] text-center text-base">Unable to load meal suggestions</Text>
                    <Text className="text-[#888] text-center text-sm mt-1">Please check your connection and try again</Text>
                    <TouchableOpacity 
                      onPress={() => window.location.reload()} 
                      className="mt-4 px-6 py-2 bg-primaryLight rounded-full"
                    >
                      <Text className="text-white font-medium">Retry</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    {meals.length === 0 && (
                      <Text className="text-center text-[#888] mt-6">No meal suggestions found.</Text>
                    )}
                    {meals.map((meal, idx) => (
              <TouchableOpacity 
                key={idx} 
                className="flex-row bg-white rounded-xl mx-5 mb-4 p-2.5 shadow-sm"
                onPress={() => handleMealSelect(meal)}
              >
                <Image source={IMAGE_CONSTANTS.sampleFood} className="w-[90px] h-[90px] rounded-lg mr-2.5" />
                <View className='absolute flex items-center justify-center ml-2 py-1 px-1 rounded-lg bg-primary mt-3 left-2 top-2'>
                    <Text className='text-[10px] text-white text-center font-medium'>High in protein</Text>
                  </View>
                <View className="flex-col flex-1 w-full">
                  <View className='right-2 flex-row items-center justify-between w-full'>
                  <View></View>
                      <View className='flex-row items-center gap-4'>
                        <View className='flex-row items-center justify-center h-[24px] w-[24px] bg-grey rounded-full'>
                        <Image source={IMAGE_CONSTANTS.likeIcon} className="w-[14px] h-[14px] bg-white rounded-full" />
                        </View>
                        
                        <View className='flex-row items-center justify-center h-[24px] w-[24px] bg-grey rounded-full'>
                        <Image source={IMAGE_CONSTANTS.dislikeIcon} className="w-[14px] h-[14px] bg-white rounded-full" />
                        </View>
                      </View>
                  </View>
                  <Text className="text-sm font-medium text-[#222] mb-0.5">{meal.name}</Text>
                  <Text className="text-sm font-semibold text-[#222] mb-0.5">{meal.restaurant.name}</Text>
                  <View className="flex-row items-center gap-2 mt-2">
                        <View className="flex-row items-center justify-center gap-1">
                            <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-kryptoniteGreen rounded-full">
                              <Image
                                source={IMAGE_CONSTANTS.caloriesIcon}
                                className="w-[8px] h-[8px] object-fill"
                              />
                            </View>
                            <Text className="text-xs text-black text-center font-medium">
                              {meal.macros.calories} cal
                            </Text>
                    </View>
                    <View className="flex-row items-center gap-1">
                          <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-amber rounded-full">
                            <Text className="text-white text-[10px] text-center font-medium">
                              C
                            </Text>
                          </View>
                          <Text className="text-xs text-textMediumGrey text-center font-medium">
                            {meal.macros.carbs}g
                          </Text>
                        </View>

                        <View className="flex-row items-center gap-1">
                          <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-lavenderPink rounded-full">
                            <Text className="text-white text-[10px] text-center font-medium">
                              F
                            </Text>
                          </View>
                          <Text className="text-xs text-textMediumGrey text-center font-medium">
                            {meal.macros.fat}g
                          </Text>
                        </View>

                        <View className="flex-row items-center gap-1">
                          <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-gloomyPurple rounded-full">
                            <Text className="text-white text-[10px] text-center font-medium">
                              P
                            </Text>
                          </View>
                          <Text className="text-xs text-textMediumGrey text-center font-medium">
                            {meal.macros.protein}g
                          </Text>
                        </View>
                  </View>
                  {/* {meal.restaurant && (
                    <Text className="text-xs text-[#888] mt-0.5">
                      {meal.restaurant.name} • {meal.restaurant.location}
                    </Text>
                  )} */}
                </View>
              </TouchableOpacity>
                ))}
                    </>
                  )}
                  </>
                )}
          </ScrollView>
      </View>
    </CustomSafeAreaView>
  );
};

export default AiMealSuggestionsScreen; 