import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import useStore from '../store/useStore';
import { CircularProgress } from 'src/components/CircularProgress';

type RootStackParamList = {
  AddMeal: { analyzedData?: any };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'AddMeal'>;

const API_URL = 'https://api.macromealsapp.com/api/v1/meals/suggest-meals';
const PREFERENCES_URL = 'https://api.macromealsapp.com/api/v1/user/preferences';

const defaultPreferences = {
  calorie_target: 2000,
  carbs_target: 200,
  fat_target: 70,
  protein_target: 150,
  dietary_restrictions: [],
  disliked_ingredients: [],
  favorite_cuisines: []
};

const macroData = [
  { label: 'Carbs', value: 45, color: '#FFD600' },
  { label: 'Fat', value: 45, color: '#E573D7' },
  { label: 'Protein', value: 45, color: '#6C5CE7' },
];

const initialRequestBody = {
  calories: 0,
  carbs: 0,
  fat: 0,
  latitude: 0,
  location: '',
  longitude: 0,
  protein: 0,
};

const generateDummyMeals = () => {
  return [
    {
      name: "Grilled Chicken Salad",
      description: "Fresh mixed greens with grilled chicken breast, cherry tomatoes, and balsamic vinaigrette",
      macros: {
        calories: 450,
        carbs: 15,
        fat: 22,
        protein: 45
      },
      restaurant: {
        name: "Healthy Bites",
        location: "2.3 miles away"
      }
    },
    {
      name: "Salmon Quinoa Bowl",
      description: "Pan-seared salmon with quinoa, roasted vegetables, and lemon herb sauce",
      macros: {
        calories: 580,
        carbs: 45,
        fat: 28,
        protein: 38
      },
      restaurant: {
        name: "Ocean Fresh",
        location: "1.5 miles away"
      }
    },
    {
      name: "Turkey Avocado Wrap",
      description: "Whole grain wrap with turkey, avocado, spinach, and hummus",
      macros: {
        calories: 420,
        carbs: 35,
        fat: 18,
        protein: 32
      },
      restaurant: {
        name: "Wrap & Roll",
        location: "0.8 miles away"
      }
    },
    {
      name: "Greek Yogurt Parfait",
      description: "Greek yogurt with mixed berries, granola, and honey",
      macros: {
        calories: 320,
        carbs: 42,
        fat: 12,
        protein: 24
      },
      restaurant: {
        name: "Morning Delights",
        location: "1.2 miles away"
      }
    },
    {
      name: "Vegetable Stir Fry",
      description: "Mixed vegetables with tofu in a light soy-ginger sauce",
      macros: {
        calories: 380,
        carbs: 48,
        fat: 15,
        protein: 22
      },
      restaurant: {
        name: "Asian Fusion",
        location: "3.1 miles away"
      }
    }
  ];
};

const AiMealSuggestionsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [meals, setMeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const token = useStore((state) => state.token);

  const handleMealSelect = (meal: any) => {
    navigation.navigate('AddMeal', {
      analyzedData: {
        name: meal.name,
        calories: meal.macros.calories,
        protein: meal.macros.protein,
        carbs: meal.macros.carbs,
        fat: meal.macros.fat,
        quantity: 1
      }
    });
  };

  // useEffect(() => {
  //   // Set dummy data
  //   setMeals(generateDummyMeals());
  // }, []);

  useEffect(() => {
    console.log('Component mounted, preparing to fetch meals...');
    
    const fetchPreferences = async () => {
      try {
        console.log('Fetching preferences...');
        const response = await fetch(PREFERENCES_URL, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 404) {
          console.log('No preferences found, using default values');
          return defaultPreferences;
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch preferences: ${response.status}`);
        }

        const preferences = await response.json();
        console.log('Preferences fetched:', preferences);
        return preferences;
      } catch (err) {
        console.error('Error fetching preferences:', err);
        console.log('Using default preferences due to error');
        return defaultPreferences;
      }
    };

    const fetchMeals = async () => {
      console.log('fetchMeals function called');
      try {
        console.log('Setting loading state...');
        setLoading(true);
        setError(null);
        console.log('Token status:', token ? 'Token exists' : 'No token');

        // First fetch preferences
        const preferences = await fetchPreferences();
        console.log('Using preferences:', preferences);
        
        // Update initialRequestBody with preferences data
        const requestBody = {
          ...initialRequestBody,
          calories: preferences.calorie_target,
          carbs: preferences.carbs_target,
          fat: preferences.fat_target,
          protein: preferences.protein_target,
        };

        // Update macroData with actual values
        macroData[0].value = preferences.carbs_target;
        macroData[1].value = preferences.fat_target;
        macroData[2].value = preferences.protein_target;

        // Create an AbortController for the timeout
        console.log('Creating AbortController...');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.log('Request timeout reached after 1 minute');
          controller.abort();
        }, 60000); // 1 minute timeout

        try {
          console.log('Starting API request to:', API_URL);
          console.log('Request body:', JSON.stringify(requestBody, null, 2));
          
          const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json', 
              'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          });
          
          console.log('API response status:', response.status);
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const data = await response.json();
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
          clearTimeout(timeoutId);
          setLoading(false);
        }
      } catch (err: any) {
        console.error('Error in fetchMeals:', err);
        setError(err.message || 'Error fetching meals');
        setLoading(false);
      }
    };

    fetchMeals();
  }, [token]);

  return (
    <CustomSafeAreaView edges={['left', 'right']} className="flex-1">
      <View className="flex-1 bg-grey">
        {/* Header */}
        <View className="flex-row bg-white items-center justify-between px-5 pt-4 pb-5">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-8 h-8 rounded-full justify-center items-center bg-[#F5F5F5]">
            <Text className="text-[22px]">‹</Text>
          </TouchableOpacity>
          <Text className="text-[20px] font-semibold text-[#222] text-center">Suggested meals</Text>
          <View style={{ width: 32 }} />
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#19a28f" className="flex items-center justify-center h-full" />
        ) : (
          <ScrollView className="pb-8">
            {/* Macros Donut Row */}
            <View className="flex-col items-start bg-white mt-3 px-5 pt-3 pb-10 mb-4">
              <Text className="text-lg text-black mt-2 text-center mb-2 font-medium">Remaining today</Text>
              <View className="flex-row w-full justify-between items-center">

              {macroData.map((macro) => (
                <View>
                  <View className="h-[100px] w-[100px] relative" key={macro.label}>
                    <CircularProgress
                      size={100}
                      strokeWidth={8}
                      consumed={macro.value}
                      total={macro.value}
                      color={macro.color}
                      backgroundColor="#d0e8d1"
                      label={macro.label}
                      showLabel={false}
                    />
                    <Text className="text-sm text-black mt-2 text-center font-medium">{macro.label}</Text>
                </View>
                </View>
              ))}
              </View>
            </View>
           
            {/* Info Card */}
            <View className="bg-[#0088D140] flex-row px-8 mt-5 justify-center items-center rounded-xl mx-5 p-4 mb-[18px]">
              <Image source={IMAGE_CONSTANTS.wandIcon} className="w-[32px] h-[32px] mr-2" />
              <Text className="text-[#222] text-[15px] text-left">
                Tailored to your preferences and macro goals, these meals are ordered for maximum effectiveness in reaching your target.
              </Text>
            </View>
            <Text className="text-base font-bold text-[#222] mx-5 mb-2.5">✨ Suggested meals</Text>
            {error && <Text className="text-red-500 text-center mt-6">{error}</Text>}
            {!loading && !error && meals.length === 0 && (
              <Text className="text-center text-[#888] mt-6">No meal suggestions found.</Text>
            )}
            {!loading && !error && meals.map((meal, idx) => (
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
          </ScrollView>
        )}
      </View>
    </CustomSafeAreaView>
  );
};

export default AiMealSuggestionsScreen; 