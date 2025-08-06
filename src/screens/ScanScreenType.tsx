import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
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
import { StackNavigationProp } from '@react-navigation/stack';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';
import { mealService } from 'src/services/mealService';
import useStore from '../store/useStore';
import DiscoverCard from '../components/DiscoverCard';

// Interface for the search API response
interface SearchMealResponse {
    results: Array<{
        id: string;
        user_id: string;
        name: string;
        description: string | null;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        meal_time: string;
        meal_type: string;
        logging_mode: string;
        photo_url: string | null;
        created_at: string;
        notes: string | null;
        serving_unit: string;
        amount: number;
        read_only: boolean;
        favorite: boolean;
    }>;
    total_results: number;
    search_query: string;
}
import { RootStackParamList } from '../types/navigation';


/**
 * ScanScreen component displays the various meal logging options:
 * - Scan with Camera (take a photo)
 * - Scan Barcode (scan a product)
 * - Manual Entry (search and log manually)
 */
const ScanScreenType: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'ScanScreenType'>>();
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<SearchMealResponse['results']>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showGlobalSearch, setShowGlobalSearch] = useState(false);
    const [globalSearchLoading, setGlobalSearchLoading] = useState(false);
    const [globalSearchResults, setGlobalSearchResults] = useState<any[]>([]);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    
    const profile = useStore((state) => state?.profile) || null;

    // Debounced search functionality
    const debouncedSearch = useCallback(
        (() => {
            let timeoutId: NodeJS.Timeout;
            return (query: string) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(async () => {
                    if (query.trim().length >= 2) {
                        setSearchLoading(true);
                        try {
                            console.log('🔍 Sending search query:', query.trim());
                            // Log the full URL that will be called
                            const baseUrl = 'https://api.macromealsapp.com/api/v1';
                            const fullUrl = `${baseUrl}/meals/search?query=${encodeURIComponent(query.trim())}`;
                            console.log('🔍 Full URL being called:', fullUrl);
                            const response = await mealService.searchMeal(query.trim()) as unknown as SearchMealResponse;
                            console.log('🔍 Raw API response:', JSON.stringify(response, null, 2));
                            console.log('🔍 Response type:', typeof response);
                            console.log('🔍 Response keys:', response ? Object.keys(response) : 'response is null/undefined');
                            
                            if (!response) {
                                console.error('❌ Response is null or undefined');
                                setSearchResults([]);
                                return;
                            }
                            
                            // The API returns { results: [...], total_results: number, search_query: string }
                            setSearchResults(response.results || []);
                        } catch (error) {
                            console.error('Error searching meals:', error);
                            console.error('Error details:', JSON.stringify(error, null, 2));
                            setSearchResults([]);
                        } finally {
                            setSearchLoading(false);
                        }
                    } else {
                        setSearchResults([]);
                    }
                }, 1500); // 1.5 second delay
            };
        })(),
        []
    );

    // Trigger search when searchText changes
    useEffect(() => {
        if (searchFocused && searchText.trim().length >= 2) {
            debouncedSearch(searchText);
            setShowGlobalSearch(false); // Hide global search while searching
        } else {
            setSearchResults([]);
            setShowGlobalSearch(false);
        }
    }, [searchText, searchFocused, debouncedSearch]);

    // Show global search option when no results found
    useEffect(() => {
        console.log('🔍 Global search condition check:', {
            searchFocused,
            searchTextLength: searchText.trim().length,
            searchLoading,
            searchResultsLength: searchResults.length,
            showGlobalSearch: searchFocused && searchText.trim().length >= 2 && !searchLoading && searchResults.length === 0
        });
        
        if (searchFocused && searchText.trim().length >= 2 && !searchLoading && searchResults.length === 0) {
            setShowGlobalSearch(true);
        } else {
            setShowGlobalSearch(false);
        }
    }, [searchResults, searchLoading, searchFocused, searchText]);

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
            navigation.navigate('AddMealScreen' as never);
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
        navigation.navigate('MealFinderScreen' as never);
    };

    const handleSearchClear = () => {
        setSearchText('');
        setSearchFocused(false);
        setShowGlobalSearch(false);
        setGlobalSearchResults([]);
        Keyboard.dismiss();
    };

    const handleGlobalSearch = async () => {
        if (!searchText.trim()) return;
        
        setGlobalSearchLoading(true);
        try {
            console.log('🔍 Global search for query:', searchText.trim());
            // Log the full URL that will be called for global search
            const baseUrl = 'https://api.macromealsapp.com/api/v1';
            const globalSearchUrl = `${baseUrl}/products/search-meals-format?query=${encodeURIComponent(searchText.trim())}`;
            console.log('🔍 Global search URL:', globalSearchUrl);
            const response = await mealService.searchMealsApi(searchText.trim());
            console.log('🔍 Global search results:', response);
            // The API returns { results: [...], total_results: number, search_query: string }
            const results = response.results || [];
            setGlobalSearchResults(results);
        } catch (error) {
            console.error('Error in global search:', error);
            setGlobalSearchResults([]);
        } finally {
            setGlobalSearchLoading(false);
        }
    };

    const handleAddToLog = async (meal: any): Promise<void> => {
        try {
            if (!meal.name.trim()) {
                console.error('Please enter a meal name');
                return;
            }

            // Prepare the meal data for the new screen
            const searchedMeal = {
                id: meal.id || '',
                name: meal.name,
                description: meal.description || null,
                calories: parseFloat(meal.calories.toString()) || 0,
                protein: parseFloat(meal.protein.toString()) || 0,
                carbs: parseFloat(meal.carbs.toString()) || 0,
                fat: parseFloat(meal.fat.toString()) || 0,
                amount: meal.amount || 100, // Base amount from API
                serving_unit: meal.serving_unit || 'g',
                read_only: meal.read_only || false,
                barcode: meal.barcode,
                notes: meal.notes,
                photo_url: meal.photo_url || null,
            };

            // Navigate to the new screen with the meal data
            navigation.navigate('AddSearchedLoggedMeal', { searchedMeal });
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error preparing meal data:', error.message, error.stack);
            } else {
                try {
                    console.error('Error preparing meal data:', JSON.stringify(error));
                } catch {
                    console.error('Error preparing meal data:', error);
                }
            }
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
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
                          {searchLoading ? (
                            <Text className="text-center text-base text-gray-500 mt-10">Searching...</Text>
                          ) : searchResults && searchResults.length > 0 ? (
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-gray-500 mt-3 mb-1.5">SEARCH RESULTS</Text>
                                <FlatList
                              data={searchResults}
                              keyExtractor={(item, idx) => item.id + idx}
                              renderItem={({ item }) => (
                                <View className="bg-white rounded-lg py-4 px-4 mb-3 flex-row items-center justify-between">
                                  <View>
                                    <Text className="text-sm font-semibold mb-2">{item.name}</Text>
                                    {item.description && (
                                      <Text className="text-xs text-gray-500 mb-2">{item.description}</Text>
                                    )}
                                    <View className="flex-row items-center gap-2 mt-2">
                        <View className="flex-row items-center justify-center gap-1">
                            <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-kryptoniteGreen rounded-full">
                              <Image source={IMAGE_CONSTANTS.caloriesIcon} className="w-[10px] h-[10px] object-fill" />
                            </View>
                            <Text className="text-xs text-black text-center font-medium">
                              {item.calories} cal
                            </Text>
                    </View>
                                        <View className="flex-row items-center gap-1">
                                            <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-amber rounded-full">
                                                <Text className="text-white text-[10px] text-center font-medium">
                                                C
                                                </Text>
                                            </View>
                                            <Text className="text-xs text-textMediumGrey text-center font-medium">
                                                {item.carbs}g
                                            </Text>
                                            </View>

                                            <View className="flex-row items-center gap-1">
                                            <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-lavenderPink rounded-full">
                                                <Text className="text-white text-[10px] text-center font-medium">
                                                F
                                                </Text>
                                            </View>
                                            <Text className="text-xs text-textMediumGrey text-center font-medium">
                                                {item.fat}g
                                            </Text>
                                            </View>

                                            <View className="flex-row items-center gap-1">
                                            <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-gloomyPurple rounded-full">
                                                <Text className="text-white text-[10px] text-center font-medium">
                                                P
                                                </Text>
                                            </View>
                                            <Text className="text-xs text-textMediumGrey text-center font-medium">
                                                {item.protein}g
                                            </Text>
                                            </View>
                                    </View>
                                  </View>
                                  <TouchableOpacity onPress={() => handleAddToLog(item)}>
                                    <Text className="text-2xl text-green-700 font-bold">
                                        <Image source={IMAGE_CONSTANTS.fabIcon} className="w-6 h-6 object-fill" />
                                    </Text>
                                  </TouchableOpacity>
                                </View>
                              )}
                            />
                            </View>
                          ) : showGlobalSearch ? (
                            <View className="flex-1">
                                {globalSearchResults.length === 0 ? (
                                    <>
                                        <TouchableOpacity 
                                            onPress={handleGlobalSearch}
                                            disabled={globalSearchLoading}
                                            className="items-center mt-10"
                                        >
                                            <Text className="text-center text-base text-gray-500">
                                                No results found. 
                                            </Text>
                                            <Text className="text-primary font-medium text-base">
                                                {globalSearchLoading ? 'Searching...' : `Search for "${searchText}" in all meals`}
                                            </Text>
                                        </TouchableOpacity>
                                        
                                        {globalSearchLoading && (
                                            <ActivityIndicator size="small" color="#19a28f" className="mt-4" />
                                        )}
                                    </>
                                ) : (
                                    <View className="mt-6">
                                        <Text className="text-sm font-semibold text-gray-500 mb-3">GLOBAL SEARCH RESULTS</Text>
                                        <FlatList
                                            data={globalSearchResults}
                                            keyExtractor={(item, idx) => item.id + idx}
                                            renderItem={({ item }) => (
                                                <View className="bg-white rounded-lg py-4 px-4 mb-3 flex-row items-center justify-between">
                                                    <View>
                                                        <Text className="text-sm font-semibold mb-2">{item.name}</Text>
                                                        {item.description && (
                                                            <Text className="text-xs text-gray-500 mb-2">{item.description}</Text>
                                                        )}
                                                        <View className="flex-row items-center gap-2 mt-2">
                                                            <View className="flex-row items-center justify-center gap-1">
                                                                <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-kryptoniteGreen rounded-full">
                                                                    <Image source={IMAGE_CONSTANTS.caloriesIcon} className="w-[10px] h-[10px] object-fill" />
                                                                </View>
                                                                <Text className="text-xs text-black text-center font-medium">
                                                                    {item.calories} cal
                                                                </Text>
                                                            </View>
                                                            <View className="flex-row items-center gap-1">
                                                                <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-amber rounded-full">
                                                                    <Text className="text-white text-[10px] text-center font-medium">C</Text>
                                                                </View>
                                                                <Text className="text-xs text-textMediumGrey text-center font-medium">
                                                                    {item.carbs}g
                                                                </Text>
                                                            </View>
                                                            <View className="flex-row items-center gap-1">
                                                                <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-lavenderPink rounded-full">
                                                                    <Text className="text-white text-[10px] text-center font-medium">F</Text>
                                                                </View>
                                                                <Text className="text-xs text-textMediumGrey text-center font-medium">
                                                                    {item.fat}g
                                                                </Text>
                                                            </View>
                                                            <View className="flex-row items-center gap-1">
                                                                <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-gloomyPurple rounded-full">
                                                                    <Text className="text-white text-[10px] text-center font-medium">P</Text>
                                                                </View>
                                                                <Text className="text-xs text-textMediumGrey text-center font-medium">
                                                                    {item.protein}g
                                                                </Text>
                                                            </View>
                                                        </View>
                                                    </View>
                                                    <TouchableOpacity onPress={() => handleAddToLog(item)}>
                                                        <Text className="text-2xl text-green-700 font-bold">
                                                            <Image source={IMAGE_CONSTANTS.fabIcon} className="w-6 h-6 object-fill" />
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        />
                                    </View>
                                )}
                            </View>
                          ) : searchText && searchText.length > 0 && !searchLoading ? (
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
        </TouchableWithoutFeedback>
    );
};

export default ScanScreenType;