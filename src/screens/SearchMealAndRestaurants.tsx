import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { RemainingTodayView } from '../components/meal_finder_components/RemainingTodayView';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';
import { locationService } from '../services/locationService';
import { mealService } from '../services/mealService';
import useStore from '../store/useStore';
import { Meal } from '../types';
import { RootStackParamList } from '../types/navigation';

interface MacroData {
  label: 'Protein' | 'Carbs' | 'Fat';
  value: number;
  color: string;
}

type TabType = 'restaurants' | 'meals';

const CUISINE_OPTIONS = [
  { label: 'Italian', value: 'italian' },
  { label: 'Mexican', value: 'mexican' },
  { label: 'American', value: 'american' },
  { label: 'African', value: 'african' },
];

const defaultMacroData: MacroData[] = [
  { label: 'Protein', value: 0, color: '#6C5CE7' },
  { label: 'Carbs', value: 0, color: '#FFC107' },
  { label: 'Fat', value: 0, color: '#FF69B4' },
];

const SearchMealAndRestaurants: React.FC = () => {
  const navigation =
    useNavigation<
      NativeStackNavigationProp<RootStackParamList, 'SearchMealAndRestaurants'>
    >();
  const macrosPreferences = useStore(state => state.macrosPreferences);
  const [activeTab, setActiveTab] = useState<TabType>('restaurants');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [macroData, setMacroData] = useState<MacroData[]>(defaultMacroData);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [tempSelectedCuisines, setTempSelectedCuisines] = useState<string[]>(
    []
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [searchResults, setSearchResults] = useState<Meal[]>([]);
  const [searchLoading, setSearchLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [currentLocationCoords, setCurrentLocationCoords] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const { mealService } = await import('../services/mealService');
        const token = useStore.getState().token;
        if (!token) {
          return;
        }

        const progressData = await mealService.getDailyProgress();

        const consumedValues = {
          protein: progressData.logged_macros.protein || 0,
          carbs: progressData.logged_macros.carbs || 0,
          fat: progressData.logged_macros.fat || 0,
        };

        setMacroData([
          { label: 'Protein', value: consumedValues.protein, color: '#6C5CE7' },
          { label: 'Carbs', value: consumedValues.carbs, color: '#FFC107' },
          { label: 'Fat', value: consumedValues.fat, color: '#FF69B4' },
        ]);
      } catch (error) {
        console.error('Error fetching progress:', error);
        setMacroData([
          { label: 'Protein', value: 0, color: '#6C5CE7' },
          { label: 'Carbs', value: 0, color: '#FFC107' },
          { label: 'Fat', value: 0, color: '#FF69B4' },
        ]);
      }
    };

    fetchProgress();
  }, []);

  // Get current location on mount
  useEffect(() => {
    const getLocation = async () => {
      try {
        const hasPermission = await locationService.requestPermissions();
        if (!hasPermission) {
          return;
        }
        const location = await locationService.getCurrentLocation();
        if (location) {
          setCurrentLocationCoords({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        }
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };
    getLocation();
  }, []);

  // Clear search when switching tabs
  useEffect(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, [activeTab]);

  // Search when query or filters change
  useEffect(() => {
    const search = async () => {
      const hasQuery = searchQuery.trim().length > 0;
      const hasFilters = selectedCuisines.length > 0;

      if (!hasQuery && !hasFilters) {
        setSearchResults([]);
        setSearchError(null);
        return;
      }

      if (!currentLocationCoords) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      setSearchError(null);

      try {
        const mapPinsResponse = await mealService.getMapPins(
          currentLocationCoords.latitude,
          currentLocationCoords.longitude,
          hasQuery ? searchQuery : undefined,
          selectedCuisines
        );
        const pins = mapPinsResponse.pins || [];

        if (activeTab === 'restaurants') {
          const restaurantList: Meal[] = pins.map((pin: any) => ({
            id: pin.id || pin.google_place_id || String(Math.random()),
            name: pin.name || '',
            macros: {
              calories: pin.top_meal?.macros?.calories || 0,
              carbs: pin.top_meal?.macros?.carbs || 0,
              fat: pin.top_meal?.macros?.fat || 0,
              protein: pin.top_meal?.macros?.protein || 0,
            },
            restaurant: {
              name: pin.name || '',
              location: pin.address || '',
            },
            imageUrl: pin.photo_url || undefined,
            description: pin.top_meal?.description || '',
            price: pin.price_level || undefined,
            distance: pin.distance_km ? pin.distance_km * 0.621371 : undefined,
            date: new Date().toISOString(),
            mealType: 'lunch',
            matchScore: pin.top_meal?.match_score || 0,
            latitude: pin.latitude,
            longitude: pin.longitude,
            rating: pin.rating || undefined,
            cuisineTypes: pin.cuisine_types || [],
          }));
          setSearchResults(restaurantList);
        } else {
          const mealList: Meal[] = pins.map((pin: any) => ({
            id: pin.id || pin.google_place_id || String(Math.random()),
            name: pin.top_meal?.name || '',
            macros: {
              calories: pin.top_meal?.macros?.calories || 0,
              carbs: pin.top_meal?.macros?.carbs || 0,
              fat: pin.top_meal?.macros?.fat || 0,
              protein: pin.top_meal?.macros?.protein || 0,
            },
            restaurant: {
              name: pin.name || '',
              location: pin.address || '',
            },
            imageUrl: pin.photo_url || undefined,
            description: pin.top_meal?.description || '',
            price: pin.price_level || undefined,
            distance: pin.distance_km ? pin.distance_km * 0.621371 : undefined,
            date: new Date().toISOString(),
            mealType: 'lunch',
            matchScore: pin.top_meal?.match_score || 0,
            latitude: pin.latitude,
            longitude: pin.longitude,
            rating: pin.rating || undefined,
            cuisineTypes: pin.cuisine_types || [],
          }));
          setSearchResults(mealList);
        }
      } catch (error: any) {
        console.error('Search error:', error);
        setSearchError('Failed to search. Please try again.');
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      search();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, currentLocationCoords, activeTab, selectedCuisines]);

  // Star Rating Component
  const renderStarRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <View className="flex-row items-center gap-0.5">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, index) => (
          <Ionicons
            key={`full-${index}`}
            name="star"
            size={14}
            color="#FFD700"
            style={{ marginRight: -2 }}
          />
        ))}
        {/* Half star */}
        {hasHalfStar && (
          <Ionicons
            key="half"
            name="star-half"
            size={14}
            color="#FFD700"
            style={{ marginRight: -2 }}
          />
        )}
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, index) => (
          <Ionicons
            key={`empty-${index}`}
            name="star-outline"
            size={14}
            color="#FFD700"
            style={{ marginRight: -2 }}
          />
        ))}
      </View>
    );
  };

  const showFilterSheet = () => {
    setTempSelectedCuisines(selectedCuisines);
    setModalVisible(true);
  };

  const handleCuisineToggle = (value: string) => {
    setTempSelectedCuisines(prev =>
      prev.includes(value)
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const applyCuisineFilters = () => {
    setSelectedCuisines(tempSelectedCuisines);
    setModalVisible(false);
  };

  const resetCuisineFilters = () => {
    setTempSelectedCuisines([]);
    setSelectedCuisines([]);
    setModalVisible(false);
  };

  const renderRestaurantItem = (meal: Meal) => (
    <TouchableOpacity
      key={meal.id}
      className="flex-row bg-white rounded-xl mb-4 px-4 py-4 shadow-sm"
    >
      <View className="flex-row items-center justify-center bg-cornflowerBlue h-[48px] w-[48px] rounded-full mr-3 flex-shrink-0">
        <Image
          source={
            meal.imageUrl
              ? { uri: String(meal.imageUrl) }
              : IMAGE_CONSTANTS.restaurantIcon
          }
          className="w-[20px] h-[20px] rounded-none"
          style={{ borderRadius: 0 }}
        />
      </View>

      <View className="flex-1 gap-1 pr-2">
        <View className="flex-col justify-start">
          <View className="flex-row mb-2 items-baseline justify-between">
            <Text
              className="text-sm font-medium text-[#222] mb-1 flex-1 mr-2"
              numberOfLines={2}
            >
              {meal.restaurant.name}
            </Text>
            {meal.matchScore && meal.matchScore > 0 && (
              <View className="bg-primary flex-row items-center justify-center rounded-2xl px-2.5 py-1.5 flex-shrink-0">
                <Text className="text-xs font-medium text-white">
                  {meal.matchScore}% match
                </Text>
              </View>
            )}
          </View>
          <Text
            className="text-sm font-normal text-[#4F4F4F] mb-2"
            numberOfLines={1}
          >
            {meal.restaurant.location}
          </Text>
          <View className="flex-row items-center gap-2">
            {/* Star Rating */}
            {meal.rating ? (
              renderStarRating(meal.rating)
            ) : (
              <View className="flex-row items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Ionicons
                    key={star}
                    name="star-outline"
                    size={14}
                    color="#FFD700"
                    style={{ marginRight: -2 }}
                  />
                ))}
              </View>
            )}
            {/* Rating Number */}
            <Text className="text-sm font-normal text-[#222]">
              {meal.rating ? meal.rating.toFixed(1) : 'N/A'}
            </Text>
            {/* Round Dot Separator */}
            <View className="w-1 h-1 bg-[#666] rounded-full mx-1" />
            {/* Distance */}
            <Text className="text-sm font-normal text-[#666]">
              {meal.distance ? `${meal.distance.toFixed(1)} mi` : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderMealItem = (meal: Meal) => (
    <TouchableOpacity
      key={meal.id}
      onPress={() => navigation.navigate('MealFinderBreakdownScreen', { meal })}
      className="flex-row bg-white rounded-xl mb-4 px-4 py-4 shadow-sm"
    >
      <View className="flex-row items-center justify-center bg-cornflowerBlue h-[48px] w-[48px] rounded-full mr-3 flex-shrink-0">
        <Image
          source={
            meal.imageUrl
              ? { uri: String(meal.imageUrl) }
              : IMAGE_CONSTANTS.restaurantIcon
          }
          className="w-[20px] h-[20px] rounded-none"
          style={{ borderRadius: 0 }}
        />
      </View>

      <View className="flex-1 gap-1 pr-2">
        <View className="flex-col justify-start">
          <View className="flex-row mb-2 items-start justify-between">
            <Text
              className="text-sm font-medium text-[#222] mb-1 flex-1 mr-2"
              numberOfLines={2}
            >
              {meal.name}
            </Text>
            {meal.matchScore && meal.matchScore > 0 && (
              <View className="bg-primary flex-row items-center justify-center rounded-2xl px-2.5 py-1.5 flex-shrink-0">
                <Text className="text-xs font-medium text-white">
                  {meal.matchScore}% match
                </Text>
              </View>
            )}
          </View>
          <Text
            className="text-sm font-normal text-[#222] mb-1"
            numberOfLines={1}
          >
            {meal.restaurant.name}
          </Text>
          {meal.restaurant?.location ? (
            <Text
              className="text-sm font-normal text-[#666] mb-2"
              numberOfLines={1}
            >
              {meal.restaurant.location.split(',').slice(0, -1).join(',') || ''}
            </Text>
          ) : null}
          <View className="flex-row items-center gap-2">
            {/* Star Rating */}
            {meal.rating ? (
              renderStarRating(meal.rating)
            ) : (
              <View className="flex-row items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <Ionicons
                    key={star}
                    name="star-outline"
                    size={14}
                    color="#FFD700"
                    style={{ marginRight: -2 }}
                  />
                ))}
              </View>
            )}
            {/* Rating Number */}
            <Text className="text-sm font-normal text-[#222]">
              {meal.rating ? meal.rating.toFixed(1) : 'N/A'}
            </Text>
            {/* Round Dot Separator */}
            <View className="w-1 h-1 bg-[#666] rounded-full" />
            {/* Distance */}
            <Text className="text-sm font-normal text-[#666]">
              {meal.distance ? `${meal.distance.toFixed(1)} mi` : 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: '#f2f2f2' }}>
      {/* Header Section - White Background */}
      <View className="bg-white pt-16 pb-0">
        {/* Search Bar Row with Back Button */}
        <View className="flex-row items-baseline px-5 mb-0">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3 w-8 h-8 rounded-full bg-white justify-center items-center"
          >
            <Ionicons name="chevron-back" size={25} color="#111111" />
          </TouchableOpacity>
          <View className="mb-4 flex-1 border border-primary rounded-[24px] flex-row items-center bg-white px-4 py-3 shadow-sm">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              placeholder="Search meals and restaurants"
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 placeholder:text-xs placeholder:text-[#4F4F4FCC]"
              placeholderTextColor="#888"
              autoFocus
            />
            <TouchableOpacity onPress={showFilterSheet}>
              <Image
                source={IMAGE_CONSTANTS.mapFilterIcon}
                className="w-5 h-5"
              />
            </TouchableOpacity>
          </View>
        </View>

        {selectedCuisines.length > 0 && (
          <View className="px-5 mb-2 flex-row flex-wrap items-center gap-2">
            {selectedCuisines.map(cuisine => (
              <View
                key={cuisine}
                className="flex-row items-center bg-primaryLight px-3 py-1 rounded-full"
              >
                <Text className="text-xs text-white font-normal">
                  {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                </Text>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => {
                setSelectedCuisines([]);
                setTempSelectedCuisines([]);
              }}
            >
              <Text className="text-sm text-primary font-medium">
                Reset filters
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tabs */}
        <View className="flex-row px-5 pb-0">
          <TouchableOpacity
            onPress={() => setActiveTab('restaurants')}
            className="flex-1 items-center pb-3 relative"
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === 'restaurants' ? 'text-primary' : 'text-[#666]'
              }`}
            >
              Restaurants
            </Text>
            {activeTab === 'restaurants' && (
              <View className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('meals')}
            className="flex-1 items-center pb-3 relative"
          >
            <Text
              className={`text-sm font-medium ${
                activeTab === 'meals' ? 'text-primary' : 'text-[#666]'
              }`}
            >
              Meals
            </Text>
            {activeTab === 'meals' && (
              <View className="absolute bottom-0 left-0 right-0 h-1 bg-primary" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Content with Macros and List */}
      <ScrollView
        className="flex-1 px-5"
        style={{ backgroundColor: '#f2f2f2' }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Macros Section */}
        <View className="mt-4">
          <RemainingTodayView
            macroData={macroData}
            macrosPreferences={macrosPreferences}
          />
        </View>

        {/* Search Results List - Show when search or filters are active */}
        {(searchQuery.trim().length > 0 || selectedCuisines.length > 0) && (
          <View className="mt-4">
            {searchLoading ? (
              <View className="flex items-center justify-center py-8">
                <Text className="text-[#888]">Searching...</Text>
              </View>
            ) : searchError ? (
              <View className="flex items-center justify-center py-8">
                <Text className="text-[#888] text-center">{searchError}</Text>
              </View>
            ) : searchResults.length > 0 ? (
              <>
                {activeTab === 'restaurants' ? (
                  <>{searchResults.map(meal => renderRestaurantItem(meal))}</>
                ) : (
                  <>{searchResults.map(meal => renderMealItem(meal))}</>
                )}
              </>
            ) : (
              //  {/* Empty State here */}
              <View></View>
            )}
          </View>
        )}

        <View className="flex items-center justify-center py-8 mb-10">
          <View className="flex-row mb-3 bg-[#E8E9ED] rounded-full items-center h-[120px] w-[120px] justify-center">
            <Image
              source={IMAGE_CONSTANTS.mealEmptyStateIcon}
              className="w-[53px] h-[53px]"
            />
          </View>
          <Text className="mb-2 text-black font-semibold">
            No Restaurants found
          </Text>
          <Text className="mx-5 mb-5 text-sm text-center tracking-tighter font-normal text-[#b7b3b3]">
            We couldn’t find “{searchQuery}” in your area. Try searching a
            different restaurant or location.
          </Text>
          <TouchableOpacity
            className="bg-primaryLight flex-row items-center justify-center rounded-[1000px] h-[52px] px-4 w-full mx-5"
            onPress={() => navigation.navigate('RequestRestaurantScreen')}
          >
            <Text className="text-white text-base font-semibold">
              + Request restuarant
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-white rounded-t-2xl p-6 mx-2 mb-4">
            <Text className="text-center text-base font-semibold text-[#111]">
              Filter by Cuisine
            </Text>
            <Text className="text-center text-xs text-[#666] mt-1 mb-5">
              Tailor your search to fit what you need specifically
            </Text>

            <View className="mt-1 rounded-2xl overflow-hidden border border-[#E5E5E5]">
              {CUISINE_OPTIONS.map((opt, index) => {
                const isSelected = tempSelectedCuisines.includes(opt.value);
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => handleCuisineToggle(opt.value)}
                    className={`flex-row items-center justify-between px-4 py-4 bg-white ${
                      index !== CUISINE_OPTIONS.length - 1
                        ? 'border-b border-[#F0F0F0]'
                        : ''
                    }`}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                  >
                    <Text
                      className={`text-sm font-medium ${isSelected ? 'text-primary' : 'text-[#222]'}`}
                    >
                      {opt.label}
                    </Text>
                    {isSelected ? (
                      <Ionicons name="checkmark" size={18} color="#01675B" />
                    ) : (
                      <View className="w-4 h-4 rounded-full border border-[#D1D1D1]" />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-6">
              <TouchableOpacity
                onPress={applyCuisineFilters}
                className="w-full py-3 rounded-full bg-primary"
              >
                <Text className="text-center text-sm font-medium text-white">
                  Apply Filters
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={resetCuisineFilters}
                className="w-full py-3 mt-3 rounded-full border border-[#E5E5E5]"
              >
                <Text className="text-center text-sm font-medium text-[#444]">
                  Reset Filters
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="w-full py-3 mt-3 rounded-full border border-transparent"
              >
                <Text className="text-center text-sm font-medium text-primary">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default SearchMealAndRestaurants;
