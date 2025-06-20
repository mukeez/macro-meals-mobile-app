import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    Image,
    ImageBackground,
    TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';

/**
 * ScanScreen component displays the various meal logging options:
 * - Scan with Camera (take a photo)
 * - Scan Barcode (scan a product)
 * - Manual Entry (search and log manually)
 */
const ScanScreenType: React.FC = () => {
    const navigation = useNavigation();

    /**
     * Navigate to the camera screen to take a photo of food
     */
    const handleOpenCamera = () => {
        navigation.navigate('SnapMeal' as never);
    };

    /**
     * Navigate to barcode scanner screen
     */
    const handleScanBarcode = () => {
        navigation.navigate('BarcodeScanScreen' as never);
    };

    /**
     * Navigate to manual meal entry/search screen
     */
    const handleManualEntry = () => {
        navigation.navigate('AddMeal' as never);
    };

    const handleMealSuggestions = () => {
        navigation.navigate('AiMealSuggestionsScreen' as never);
    };

    const handleMealFinder = () => {
        navigation.navigate('MealFinderScreen' as never);
    };

    return (
        <CustomSafeAreaView edges={['left', 'right']} paddingOverride={{ bottom: -100 }} className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            {/* Header (always on solid white) */}
            <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
                <TouchableOpacity onPress={() => navigation.goBack()} className="w-8 h-8 rounded-full justify-center items-center bg-[#F5F5F5]">
                    <Image source={IMAGE_CONSTANTS.closeIcon} className="w-[14px] h-[14px] object-fill" />
                </TouchableOpacity>
                <Text className="text-[20px] font-semibold text-[#1a8a6a] text-center">Add a meal</Text>
                <View style={{ width: 32 }} />
            </View>
            {/* Search Bar (on white) */}
            <View className="flex-row items-center bg-[#F5F5F5] rounded-3xl mx-5 mb-[18px] px-4 h-11">
                <Image source={IMAGE_CONSTANTS.searchIcon} className="w-6 h-6 object-fill mr-2" />
                <TextInput
                    className="flex-1 placeholder:text-[18px] placeholder:font-normal placeholder:text-lightGrey"
                    placeholder="Search for a food"
                    placeholderTextColor="#B0B0B0"
                    editable={false}
                />
            </View>

            <View className="flex-1 bg-[#88cec8]">
                <ImageBackground
                    source={require('../../assets/add-meal-bg.png')}
                    style={{ flex: 1, width: '100%', height: '100%', paddingBottom: 120 }}
                    resizeMode="cover"
                >
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
                        <View className="mt-3 bg-white rounded-lg p-1">
                            <TouchableOpacity className="flex-row items-start p-4" onPress={handleManualEntry}>
                                <View className="flex-row items-center justify-center mr-4 w-10 h-10 rounded-full bg-lightGreen">
                                    <Image source={IMAGE_CONSTANTS.editIcon} className="w-6 h-6 object-fill" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-semibold text-black mb-2">Manual entry</Text>
                                    <Text className="text-xs font-normal text-black">Log your meal details including portion sizes and ingredients for precise macro tracking.</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View className="mt-3 bg-white rounded-lg p-1">
                            <TouchableOpacity className="flex-row items-start p-4" onPress={handleMealSuggestions}>
                                <View className="flex-row items-center justify-center mr-4 w-10 h-10 rounded-full bg-lightGreen">
                                    <Image source={IMAGE_CONSTANTS.wandIcon} className="w-6 h-6 object-fill" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-semibold text-black mb-2">AI Meal suggestions</Text>
                                    <Text className="text-xs font-normal text-black">Get personalized meal recommendations based on your remaining macros.</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View className="mt-3 bg-white rounded-lg p-1 mb-10">
                            <TouchableOpacity className="flex-row items-start p-4" onPress={handleMealFinder}>
                                <View className="flex-row items-center justify-center mr-4 w-10 h-10 rounded-full bg-lightGreen">
                                    <Image source={IMAGE_CONSTANTS.locationIcon} className="w-6 h-6 object-fill" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-semibold text-black mb-2">Meal Finder</Text>
                                    <Text className="text-xs font-normal text-black">Discover nearby restaurant options that align with your macro targets and dietary preferences.</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        </CustomSafeAreaView>
    );
};

export default ScanScreenType;