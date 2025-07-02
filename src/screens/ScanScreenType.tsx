import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Image,
    ImageBackground,
    TextInput,
    FlatList,
    Keyboard,
    Animated,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';
import FavoritesService, { FavoriteMeal } from '../services/favoritesService';
import { mealService } from 'src/services/mealService';
import useStore from '../store/useStore';
import DiscoverCard from '../components/DiscoverCard';

const DUMMY_MEALS = [
  { name: 'Brown rice', macros: { calories: 170, carbs: 12, fat: 10, protein: 10 } },
  { name: 'Salmon and rice', macros: { calories: 170, carbs: 12, fat: 10, protein: 10 } },
  { name: 'Salmon and fries', macros: { calories: 170, carbs: 12, fat: 10, protein: 10 } },
];

/**
 * ScanScreen component displays the various meal logging options:
 * - Scan with Camera (take a photo)
 * - Scan Barcode (scan a product)
 * - Manual Entry (search and log manually)
 */
const ScanScreenType: React.FC = () => {
    const navigation = useNavigation();
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
    const [favoritesLoading, setFavoritesLoading] = useState(true);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const { profile } = useStore();

    // Function to load favorites
    const loadFavorites = () => {
        setFavoritesLoading(true);
        FavoritesService.getFavorites().then(favs => {
            setFavorites(favs);
            setFavoritesLoading(false);
        });
    };

    // Initial load on mount
    useEffect(() => {
        loadFavorites();
    }, []);

    useEffect(() => {
        if (searchFocused) {
            if (searchText.trim().length > 0) {
                setSearchResults(
                    favorites.filter(meal => meal.name.toLowerCase().includes(searchText.toLowerCase()))
                );
            } else {
                setSearchResults(favorites);
            }
        } else {
            setSearchResults([]);
        }
    }, [searchText, searchFocused, favorites]);

    // Animate fade in/out on search focus change
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: searchFocused ? 0 : 1,
            duration: 250,
            useNativeDriver: true,
        }).start();
    }, [searchFocused]);

    /**
     * Navigate to the camera screen to take a photo of food
     */
    const handleOpenCamera = () => {
        if (profile?.has_macros === false || profile?.has_macros === undefined) {
            navigation.navigate('GoalSetupScreen' as never);
        } else {
            navigation.navigate('SnapMeal' as never);
        }
    };

    /**
     * Navigate to barcode scanner screen
     */
    const handleScanBarcode = () => {
        if (profile?.has_macros === false || profile?.has_macros === undefined) {
            navigation.navigate('GoalSetupScreen' as never);
        } else {
            navigation.navigate('BarcodeScanScreen' as never);
        }
    };

    /**
     * Navigate to manual meal entry/search screen
     */
    const handleManualEntry = () => {
        if (profile?.has_macros === false || profile?.has_macros === undefined) {
            navigation.navigate('GoalSetupScreen' as never);
        } else {
            navigation.navigate('AddMeal' as never);
        }
    };

    const handleMealSuggestions = () => {
        if (profile?.has_macros === false || profile?.has_macros === undefined) {
            navigation.navigate('GoalSetupScreen' as never);
        } else {
            navigation.navigate('AiMealSuggestionsScreen' as never);
        }
    };

    const handleMealFinder = () => {
        if (profile?.has_macros === false || profile?.has_macros === undefined) {
            navigation.navigate('GoalSetupScreen' as never);
        } else {
            navigation.navigate('MealFinderScreen' as never);
        }
    };

    const handleSearchClear = () => {
        setSearchText('');
        setSearchFocused(false);
        Keyboard.dismiss();
    };

    const handleAddToLog = async (meal: any): Promise<void> => {
        setLoading(true);
        try {
            if (!meal.name.trim()) {
                console.error('Please enter a meal name');
                return;
            }

            const newMeal = {
                name: meal.name, 
                calories: parseInt(meal.macros.calories, 10) || 0,
                protein: parseInt(meal.macros.protein, 10) || 0,
                carbs: parseInt(meal.macros.carbs, 10) || 0,
                fat: parseInt(meal.macros.fat, 10) || 0,
                meal_type: "breakfast",
                meal_time: new Date().toISOString(),
                description: "",
            };

            const response = await mealService.logMeal(newMeal);


            // Navigate back to meal log screen
            navigation.navigate('MainTabs' as never);
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error adding meal to log:', error.message, error.stack);
            } else {
                try {
                    console.error('Error adding meal to log:', JSON.stringify(error));
                } catch (e) {
                    console.error('Error adding meal to log:', error);
                }
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomSafeAreaView edges={['left', 'right']} paddingOverride={{ bottom: -100 }} className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            {/* Header (always on solid white) */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-5">
                <TouchableOpacity onPress={() => navigation.goBack()} className="w-8 h-8 rounded-full justify-center items-center">
                    <Image source={IMAGE_CONSTANTS.closeIcon} className="w-[14px] h-[14px] object-fill" />
                </TouchableOpacity>
                <Text className="text-[20px] font-semibold text-primary text-center">Add a meal</Text>
                <View style={{ width: 32 }} />
            </View>
            {/* Search Bar (on white) */}
            <View className="flex-row items-center bg-gray rounded-3xl h-[48px] mx-5 mb-[18px] px-4">
                <Image source={IMAGE_CONSTANTS.searchIcon} className="w-6 h-6 object-fill mr-2" />
                <TextInput
                    className="flex-1 placeholder:text-[18px] placeholder:font-normal placeholder:text-lightGrey"
                    placeholder="Search for a food"
                    placeholderTextColor="#B0B0B0"
                    value={searchText}
                    onChangeText={setSearchText}
                    onFocus={() => {
                        setSearchFocused(true);
                        loadFavorites();
                    }}
                    onBlur={() => { if (!searchText) setSearchFocused(false); }}
                    editable={true}
                    returnKeyType="search"
                />
                {(searchFocused) && (
                  <TouchableOpacity onPress={handleSearchClear} className="ml-2">
                    <Image source={IMAGE_CONSTANTS.closeIcon} className="w-4 h-4 object-fill" />
                  </TouchableOpacity>
                )}
            </View>

            <View className="flex-1 bg-monteCarlo">
                <ImageBackground
                    source={require('../../assets/add-meal-bg.png')}
                    style={{ flex: 1, width: '100%', height: '100%', paddingBottom: 120 }}
                    resizeMode="cover"
                >
                    {searchFocused ? (
                        <View className="flex-1 px-5 pt-2">
                          {favoritesLoading ? (
                            <Text className="text-center text-base text-gray-500 mt-10">Loading...</Text>
                          ) : searchResults.length > 0 ? (
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-500 mt-3 mb-1.5">FAVOURITES</Text>
                                <FlatList
                              data={searchResults}
                              keyExtractor={(item, idx) => item.name + idx}
                              renderItem={({ item }) => (
                                <View className="bg-white rounded-lg py-4 px-4 mb-3 flex-row items-center justify-between">
                                  <View>
                                    <Text className="text-sm font-semibold mb-2">{item.name}</Text>
                                    <View className="flex-row items-center gap-2 mt-2">
                        <View className="flex-row items-center justify-center gap-1">
                            <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-kryptoniteGreen rounded-full">
                              <Image source={IMAGE_CONSTANTS.caloriesIcon} className="w-[10px] h-[10px] object-fill" />
                            </View>
                            <Text className="text-xs text-black text-center font-medium">
                              {item.macros.calories} cal
                            </Text>
                    </View>
                                        <View className="flex-row items-center gap-1">
                                            <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-amber rounded-full">
                                                <Text className="text-white text-[10px] text-center font-medium">
                                                C
                                                </Text>
                                            </View>
                                            <Text className="text-xs text-textMediumGrey text-center font-medium">
                                                {item.macros.carbs}g
                                            </Text>
                                            </View>

                                            <View className="flex-row items-center gap-1">
                                            <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-lavenderPink rounded-full">
                                                <Text className="text-white text-[10px] text-center font-medium">
                                                F
                                                </Text>
                                            </View>
                                            <Text className="text-xs text-textMediumGrey text-center font-medium">
                                                {item.macros.fat}g
                                            </Text>
                                            </View>

                                            <View className="flex-row items-center gap-1">
                                            <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-gloomyPurple rounded-full">
                                                <Text className="text-white text-[10px] text-center font-medium">
                                                P
                                                </Text>
                                            </View>
                                            <Text className="text-xs text-textMediumGrey text-center font-medium">
                                                {item.macros.protein}g
                                            </Text>
                                            </View>
                                    </View>
                                  </View>
                                  {loading ? (
                                    <ActivityIndicator size="small" color="#01675B" />
                                  ) : ( 
                                    <TouchableOpacity onPress={() => handleAddToLog(item)}>
                                    <Text className="text-2xl text-green-700 font-bold">
                                        <Image source={IMAGE_CONSTANTS.fabIcon} className="w-6 h-6 object-fill" />
                                    </Text>
                                  </TouchableOpacity>
                                  )}
                                </View>
                              )}
                            />
                            </View>
                          ) : searchText.length === 0 && favorites.length === 0 ? (
                            <Text className="text-center text-base text-gray-500 mt-10">You have not added any favourite</Text>
                          ) : searchText.length > 0 ? (
                            <Text className="text-center text-base text-gray-500 mt-10">No results found</Text>
                          ) : null}
                        </View>
                    ) : (
                        // Show scan options, discover more, and favorites with fade animation
                        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
                        <View className="mt-10 mx-5">
                            <Text className="text-sm font-semibold text-black mb-5">SCAN OPTIONS</Text>
                            <View className="flex-row justify-between gap-3">
                                <TouchableOpacity className="flex-1 bg-white rounded-md items-center py-6 shadow-sm" onPress={handleScanBarcode}>
                                    <View className="flex-row items-center mb-2 justify-center mr-2 w-10 h-10 rounded-full bg-lightGreen">
                                        <Image source={IMAGE_CONSTANTS.scanBarcodeIcon} className="w-6 h-6 object-fill" />
                                    </View>
                                    <Text className="text-base font-normal text-black">Scan a barcode</Text>
                                </TouchableOpacity>
                                <TouchableOpacity className="flex-1 bg-white rounded-md items-center py-6 shadow-sm" onPress={handleOpenCamera}>
                                    <View className="flex-row items-center mb-2 justify-center mr-2 w-10 h-10 rounded-full bg-lightGreen">
                                        <Image source={IMAGE_CONSTANTS.scanMealIcon} className="w-6 h-6 object-fill" />
                                    </View>
                                    <Text className="text-base font-normal text-black">Scan a meal</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        {/* Discover More */}
                        <View className="mt-8 mx-5">
                            <Text className="text-sm font-semibold text-black mb-2">DISCOVER MORE</Text>
                            <DiscoverCard
                                icon={<Image source={IMAGE_CONSTANTS.editIcon} className="w-6 h-6 object-fill" />}
                                title="Manual entry"
                                description="Log your meal details including portion sizes and ingredients for precise macro tracking."
                                onPress={handleManualEntry}
                            />
                            <DiscoverCard
                                icon={<Image source={IMAGE_CONSTANTS.wandIcon} className="w-6 h-6 object-fill" />}
                                title="AI Meal suggestions"
                                description="Get personalized meal recommendations based on your remaining macros."
                                onPress={handleMealSuggestions}
                            />
                            <DiscoverCard
                                icon={<Image source={IMAGE_CONSTANTS.locationIcon} className="w-6 h-6 object-fill" />}
                                title="Meal Finder"
                                description="Discover nearby restaurant options that align with your macro targets and dietary preferences."
                                onPress={handleMealFinder}
                            />
                        </View>
                        </Animated.View>
                    )}
                </ImageBackground>
            </View>
        </CustomSafeAreaView>
    );
};

export default ScanScreenType;