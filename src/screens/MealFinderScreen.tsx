import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Alert, TextInput, Dimensions } from 'react-native';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { CircularProgress } from '../components/CircularProgress';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';
import { useNavigation } from '@react-navigation/native';
import { locationService } from '../services/locationService';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { Modalize } from 'react-native-modalize';
import useStore from '../store/useStore';
import { API_CONSTANTS } from '../constants/api_constants';
import { mealService } from '../services/mealService';
import { Meal } from '../types';


interface MacroData {
  label: 'Protein' | 'Carbs' | 'Fat';
  value: number;
  color: string;
}

interface MockLocation {
  label: string;
  description: string;
  latitude?: number;
  longitude?: number;
}

const mockLocations: MockLocation[] = [
    {
        label: 'Eiffel Tower',
        description: 'Champ de Mars, Paris, France',
        latitude: 48.8584,
        longitude: 2.2945,
      },
      {
        label: 'Sydney Opera House',
        description: 'Bennelong Point, Sydney NSW, Australia',
        latitude: -33.8568,
        longitude: 151.2153,
      },
      {
        label: 'Shibuya Crossing',
        description: 'Shibuya City, Tokyo, Japan',
        latitude: 35.6595,
        longitude: 139.7005,
      },
      {
        label: 'Table Mountain',
        description: 'Cape Town, South Africa',
        latitude: -33.9628,
        longitude: 18.4098,
      },
  {
    label: 'Kakum National Park',
    description: 'Rainforest canopy walkway, Central Region, Ghana',
    latitude: 5.4107,
    longitude: -1.2732,
  },
  {
    label: 'Cape Coast Castle',
    description: 'Historic slave castle, Cape Coast, Ghana',
    latitude: 5.1036,
    longitude: -1.2466,
  },
  {
    label: 'Kwame Nkrumah Mausoleum',
    description: 'Memorial park, Accra, Ghana',
    latitude: 5.5560,
    longitude: -0.1969,
  },
  {
    label: 'Labadi Beach',
    description: 'Popular beach, Accra, Ghana',
    latitude: 5.5586,
    longitude: -0.1635,
  },
  {
    label: 'Kumasi Central Market',
    description: 'Large open-air market, Kumasi, Ghana',
    latitude: 6.6930,
    longitude: -1.6244,
  },
  {
    label: 'Lake Bosomtwe',
    description: 'Crater lake, Ashanti Region, Ghana',
    latitude: 6.5053,
    longitude: -1.4187,
  },
  {
    label: 'Independence Arch',
    description: 'Iconic monument, Accra, Ghana',
    latitude: 5.5502,
    longitude: -0.1921,
  },
  {
    label: 'Elmina Castle',
    description: 'Historic castle, Elmina, Ghana',
    latitude: 5.0847,
    longitude: -1.3509,
  },
  {
    label: 'Mole National Park',
    description: 'Wildlife reserve, Northern Region, Ghana',
    latitude: 9.7036,
    longitude: -1.8032,
  },
  {
    label: 'Wli Waterfalls',
    description: 'Tallest waterfall in Ghana, Volta Region',
    latitude: 7.1306,
    longitude: 0.5736,
  },
];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const defaultMacroData: MacroData[] = [
  { label: 'Protein', value: 0, color: '#6C5CE7' },
  { label: 'Carbs', value: 0, color: '#FFC107' },
  { label: 'Fat', value: 0, color: '#FF69B4' },
];

const macroTypeToPreferenceKey = {
  'Protein': 'protein_target',
  'Carbs': 'carbs_target',
  'Fat': 'fat_target',
} as const;

const MealFinderScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'MealFinderScreen'>>();
  const storePreferences = useStore((state) => state.preferences);
  const macrosPreferences = useStore((state) => state.macrosPreferences);
  const todayProgress = useStore((state) => state.todayProgress) || { protein: 0, carbs: 0, fat: 0, calories: 0 };
  const [loading, setLoading] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(false);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string>('Getting location...');
  const [locationLoading, setLocationLoading] = useState<boolean>(true);
  const [selectedLocation, setSelectedLocation] = useState<string>('Getting location...');
  const [search, setSearch] = useState<string>('');
  const [filteredLocations, setFilteredLocations] = useState<MockLocation[]>(mockLocations);
  const modalizeRef = useRef<Modalize>(null);
  const token = useStore((state) => state.token);
  const [macroData, setMacroData] = useState<MacroData[]>(defaultMacroData);

  useEffect(() => {
    const fetchLocationAndSuggestions = async () => {
      setInitializing(true);
      try {
        // 1. Get location
        const hasPermission = await locationService.requestPermissions();
        if (!hasPermission) {
          Alert.alert(
            'Location Permission Required',
            'Location access is needed to find nearby meals. Please enable location services in your device settings.',
            [
              {
                text: 'Go Back',
                onPress: () => navigation.goBack(),
                style: 'cancel',
              },
              {
                text: 'Settings',
                onPress: () => navigation.goBack(),
              },
            ]
          );
          setInitializing(false);
          return;
        }
        const location = await locationService.getCurrentLocation();
        if (location) {
          const address = await locationService.reverseGeocode(
            location.coords.latitude,
            location.coords.longitude
          );
          const shortAddress = address.split(',')[0].trim();
          setCurrentLocation(address);
          setSelectedLocation(shortAddress);

          // Skip if no coordinates
          if (typeof location.coords.latitude !== 'number' || typeof location.coords.longitude !== 'number') {
            setError('Location coordinates not available');
            setLocationLoading(false);
            return;
          }

          // 2. Fetch meal suggestions
          const requestBody = {
            calories: storePreferences?.calories || 0,
            carbs: storePreferences?.carbs || 0,
            dietary_preference: storePreferences?.dietary_preference || '',
            dietary_restrictions: storePreferences?.dietary_restrictions || [],
            fat: storePreferences?.fat || 0,
            latitude: location.coords.latitude,
            location: address,
            longitude: location.coords.longitude,
            protein: storePreferences?.protein || 0,
          };
          setLocationLoading(true);
          try {
            const suggestedMeals = await mealService.suggestAiMeals(requestBody);
            const mealList: Meal[] = suggestedMeals.map((meal: any) => ({
              id: meal.id || String(Math.random()),
              name: meal.name,
              macros: {
                calories: meal.macros.calories,
                carbs: meal.macros.carbs,
                fat: meal.macros.fat,
                protein: meal.macros.protein,
              },
              restaurant: {
                name: meal.restaurant.name,
                location: meal.restaurant.location,
              },
              imageUrl: meal.imageUrl,
              description: meal.description || '',
              price: meal.price,
              distance: meal.distance,
              date: new Date().toISOString(),
              mealType: meal.meal_type || 'lunch',
            }));
            setMeals(mealList);
            setError(null);
          } catch (apiError: any) {
            console.error('API Error:', apiError);
            setError('Failed to fetch meal suggestions.');
            setMeals([]);
          } finally {
            setLocationLoading(false);
          }
        } else {
          setCurrentLocation('Location unavailable');
          setSelectedLocation('Location unavailable');
          setMeals([]);
        }
      } catch (error) {
        console.error('Location Error:', error);
        setCurrentLocation('Location unavailable');
        setSelectedLocation('Location unavailable');
        setMeals([]);
      } finally {
        setInitializing(false);
      }
    };
    fetchLocationAndSuggestions();
  }, []);

  useEffect(() => {
    setFilteredLocations(
      search.trim() === ''
        ? mockLocations
        : mockLocations.filter(loc =>
            loc.label.toLowerCase().includes(search.toLowerCase()) ||
            loc.description.toLowerCase().includes(search.toLowerCase())
          )
    );
  }, [search]);

  const openLocationSheet = useCallback(() => {
    modalizeRef.current?.open();
  }, []);

  const closeLocationSheet = useCallback(() => {
    modalizeRef.current?.close();
  }, []);

  const handleSelectCurrentLocation = async () => {
    closeLocationSheet();
    setLocationLoading(true);
    // await handleLocationPermission();
    setLocationLoading(false);
  };

  const handleSelectMockLocation = async (location: MockLocation) => {
    setSelectedLocation(location.label);
    closeLocationSheet();
    setLocationLoading(true);

    // Skip if no coordinates
    if (typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        setError('Location coordinates not available');
        setLocationLoading(false);
        return;
    }

    const requestBody = {
        calories: storePreferences?.calories || 0,
        carbs: storePreferences?.carbs || 0,
        dietary_preference: storePreferences?.dietary_preference || '',
        dietary_restrictions: storePreferences?.dietary_restrictions || [],
        fat: storePreferences?.fat || 0,
        latitude: location.latitude,
        location: location.label,
        longitude: location.longitude,
        protein: storePreferences?.protein || 0,
    };

    try {
      const suggestedMeals = await mealService.suggestAiMeals(requestBody);
      const mealList: Meal[] = suggestedMeals.map((meal: any) => ({
        id: meal.id || String(Math.random()),
        name: meal.name,
        macros: {
          calories: meal.macros.calories,
          carbs: meal.macros.carbs,
          fat: meal.macros.fat,
          protein: meal.macros.protein,
        },
        restaurant: {
          name: meal.restaurant.name,
          location: meal.restaurant.location,
        },
        imageUrl: meal.imageUrl,
        description: meal.description || '',
        price: meal.price,
        distance: meal.distance,
        date: new Date().toISOString(),
        mealType: meal.meal_type || 'lunch',
      }));
      setMeals(mealList);
      setError(null);
    } catch (apiError: any) {
      console.error('API Error:', apiError);
      setError('Failed to fetch meal suggestions.');
      setMeals([]);
    } finally {
      setLocationLoading(false);
    }
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

  if (initializing || locationLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#19a28f" />
      </View>
    );
  }

  return (
    <CustomSafeAreaView edges={['left', 'right']} paddingOverride={{bottom: -100}}  className="flex-1">
      <View className="flex-1 bg-grey">
        {/* Header */}
        <View className="flex-row bg-white items-center justify-between px-5 pt-4 pb-5">
          <TouchableOpacity onPress={() => navigation.goBack()} className="w-8 h-8 rounded-full justify-center items-center bg-[#F5F5F5]">
            <Text className="text-[22px]">‹</Text>
          </TouchableOpacity>
          <Text className="text-[20px] font-semibold text-[#222] text-center">Meal Finder</Text>
          <View style={{ width: 32 }} />
        </View>
        {loading ? (
          <ActivityIndicator size="large" color="#19a28f" className="flex items-center justify-center h-full" />
        ) : (
            <View className="flex-1">

            <ScrollView className="pb-8">
                <View className="flex-row items-center mt-4 mb-5 px-5 gap-2">
                <Image source={IMAGE_CONSTANTS.locationGray} className="w-[40px] h-[40px] rounded-full" />
                <TouchableOpacity onPress={openLocationSheet} className="flex-col flex-1" activeOpacity={0.7}>
                    <Text className="text-sm font-medium text-[#222]">Current location</Text>
                    <View className="flex-row items-center">
                    <Text className="text-base font-semibold text-[#222] mr-1">{selectedLocation}</Text>
                    <Ionicons name="chevron-down" size={18} color="#222" />
                    </View>
                    {locationLoading && <ActivityIndicator size="small" color="#19a28f" />}
                </TouchableOpacity>
                </View>
                {/* Macros Donut Row */}
                <View className="flex-col items-start bg-white mt-3 px-5 pt-3 pb-10 mb-4">
                <Text className="text-base text-black mt-2 text-center mb-4 font-medium">Remaining today</Text>
                <View className="flex-row w-full justify-between items-center">
                    {macroData.map((macro) => (
                    <View key={macro.label}>
                        <View className="h-[100px] w-[100px] relative">
                        <CircularProgress
                            size={100}
                            strokeWidth={12}
                            textSize={16}
                            consumed={macro.value + 'g'}
                            total={macrosPreferences[macroTypeToPreferenceKey[macro.label]] || 100}
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

                <Text className="text-base font-medium text-[#222] mx-5 my-5">Nearby Suggestions</Text>
                {error && <Text className="text-red-500 text-center mt-6">{error}</Text>}
                {!loading && !error && meals.length === 0 && (
                <Text className="text-center text-[#888] mt-6">No nearby meal suggestions found.</Text>
                )}
                {!loading && !error && meals.map((meal, idx) => (
                <TouchableOpacity 
                    key={idx} 
                    onPress={() => navigation.navigate('MealFinderBreakdownScreen', { meal })}
                    className="flex-row bg-white rounded-xl mx-5 mb-4 px-3 py-5 shadow-sm"
                >
                    <View className="flex-row items-center justify-center bg-cornflowerBlue h-[48px] w-[48px] rounded-full mr-2.5">
                        <Image source={meal.imageUrl ? { uri: String(meal.imageUrl) } : IMAGE_CONSTANTS.restaurantIcon} className="w-[20px] h-[20px] rounded-full" />
                    </View>
                    
                    <View className="flex-1 gap-1">
                        {/* <View className="flex-row items-start justify-between">
                            <Text className="text-sm font-medium text-[#222] flex-1 mr-2" numberOfLines={2}>{meal.name}</Text>
                            <View className="flex items-center justify-center py-1 px-1.5 rounded-[100px] bg-primary flex-shrink-0">
                                <Text className="text-xs text-white text-center font-medium">90% match</Text>
                            </View>
                        </View> */}

                        <View className="flex-row items-center gap-3 flex-wrap">
                            <Text className="text-sm font-normal text-[#222] flex-shrink flex-wrap" style={{ flexWrap: 'wrap', flexShrink: 1 }}>{meal.name}</Text>
                            {/* <View className="w-[4px] h-[4px] rounded-full bg-[#253238]"></View> */}
                            <Text className="text-sm font-normal text-[#222] flex-shrink flex-wrap" style={{ flexWrap: 'wrap', flexShrink: 1 }}>{meal.restaurant.name}</Text>
                            <Text className="text-sm font-normal text-[#222] flex-shrink flex-wrap" style={{ flexWrap: 'wrap', flexShrink: 1 }}>{meal.restaurant.location.split(',').slice(0, -1).join(',')}</Text>
                        </View>
                        
                        <View className="flex-row items-center gap-2 mt-1">
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
                    </View>
                </TouchableOpacity>
                ))}
             
            </ScrollView>
            <Modalize
                ref={modalizeRef}
                modalHeight={SCREEN_HEIGHT * 0.6}
                handlePosition="inside"
                withHandle={true}
                modalStyle={{
                    backgroundColor: '#fff',
                    padding: 0,
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    margin: 0,
                }}
                >
                <View className="px-5 pt-2 pb-5">
                    <Text className="font-semibold text-lg mt-8 mb-4">Delivery address</Text>
                    <View className="flex-row items-center mb-4 bg-gray-100 rounded-lg px-3">
                    <Ionicons name="search" size={18} color="#888" style={{ marginRight: 6 }} />
                    <TextInput
                        placeholder="Enter a new address"
                        value={search}
                        onChangeText={setSearch}
                        className="flex-1 h-[48px] rounded-2xl text-base text-[#222]"
                        placeholderTextColor="#888"
                    />
                    </View>
                    <TouchableOpacity onPress={handleSelectCurrentLocation} className="flex-row items-center mb-5">
                        <Image source={IMAGE_CONSTANTS.nearbyLocationIcon} className="w-[14px] h-[14px] rounded-full" />
                        <Text className="text-primary ml-3 font-medium underline">Use your current location</Text>
                    </TouchableOpacity>
                    {filteredLocations.map((loc, idx) => (
                    <React.Fragment key={idx}>
                        <TouchableOpacity onPress={() => handleSelectMockLocation(loc)} className="flex-row items-center">
                        <Image source={IMAGE_CONSTANTS.locationIcon} className="w-[32px] h-[32px] mr-4 rounded-full" />
                        <View>
                            <Text className="text-sm font-medium text-[#222]">{loc.label}</Text>
                            <Text className="text-mediumGrey text-xs">{loc.description}</Text>
                        </View>
                        </TouchableOpacity>
                        {idx !== filteredLocations.length - 1 && (
                            <View className="h-px bg-gray-200 my-5" />
                        )}
                    </React.Fragment>
                    ))}
                </View>
                </Modalize>
          </View>
        )}
      </View>
    </CustomSafeAreaView>
  );
};

export default MealFinderScreen; 