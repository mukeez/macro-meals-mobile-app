import React from 'react';
import {
    View,
    Text,
    StyleSheet,
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
        <CustomSafeAreaView edges={['left', 'right']} paddingOverride={{ bottom: -100 }} style={{ flex: 1, backgroundColor: '#fff' }}>
            <StatusBar barStyle="dark-content" />
            {/* Header (always on solid white) */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerIconBtn}>
                    <Image source={IMAGE_CONSTANTS.closeIcon} className='w-[14px] h-[14px] object-fill' />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add a meal</Text>
                <View style={{ width: 32 }} />
            </View>
            {/* Search Bar (on white) */}
            <View style={styles.searchBarContainer}>
             <Image source={IMAGE_CONSTANTS.searchIcon} className='w-[24px] h-[24px] object-fill mr-2' />
                <TextInput
                   className=' flex-1 placeholder:text-[18px] placeholder:font-normal placeholder:text-lightGrey'
                    placeholder="Search for a food"
                    placeholderTextColor="#B0B0B0"
                    editable={false}
                />
            </View>
 
            <View style={{ flex: 1, backgroundColor: '#88cec8' }}>
                <ImageBackground
                    source={require('../../assets/add-meal-bg.png')}
                    style={styles.bg}
                    resizeMode="cover"
                >
      
                    <View className='mt-10 mx-5'>
                        <Text className='text-sm font-semibold text-black mb-5'>SCAN OPTIONS</Text>
                        <View style={styles.scanOptionsRow}>
                            <TouchableOpacity style={styles.scanOptionCard} onPress={handleScanBarcode}>
                                <View className='flex-row items-center mb-2 justify-center mr-2 w-[40px] h-[40px] rounded-full bg-lightGreen'>

                                <Image source={IMAGE_CONSTANTS.scanBarcodeIcon} className='w-[24px] h-[24px] object-fill' />
                                </View>
                                <Text className='text-base font-normal text-black'>Scan a barcode</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.scanOptionCard} onPress={handleOpenCamera}>
                                <View className='flex-row items-center mb-2 justify-center mr-2 w-[40px] h-[40px] rounded-full bg-lightGreen'>
                                <Image source={IMAGE_CONSTANTS.scanMealIcon} className='w-[24px] h-[24px] object-fill' />
                                </View>
                                <Text className='text-base font-normal text-black'>Scan a meal</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {/* Discover More */}
                    <View className='mt-8 mx-5'>
                        <Text className='text-sm font-semibold text-black mb-2'>DISCOVER MORE</Text>
                        <View className='mt-3 bg-white rounded-lg p-1'>      
                            <TouchableOpacity style={styles.discoverCardInner} onPress={handleManualEntry}>
                                <View className='flex-row items-center justify-center mr-4 w-[40px] h-[40px] rounded-full bg-lightGreen'>
                                <Image source={IMAGE_CONSTANTS.editIcon} className='w-[24px] h-[24px] object-fill' />
                                </View>
                                <View style={styles.discoverTextWrap}>
                                    <Text className='text-sm font-semibold text-black mb-2'>Manual entry</Text>
                                    <Text className='text-xs font-normal text-black'>Log your meal details including portion sizes and ingredients for precise macro tracking.</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View className='mt-3 bg-white rounded-lg p-1'>      
                            <TouchableOpacity style={styles.discoverCardInner} onPress={handleMealSuggestions}>
                                <View className='flex-row items-center justify-center mr-4 w-[40px] h-[40px] rounded-full bg-lightGreen'>
                                <Image source={IMAGE_CONSTANTS.wandIcon} className='w-[24px] h-[24px] object-fill' />
                                </View>
                                <View style={styles.discoverTextWrap}>
                                    <Text className='text-sm font-semibold text-black mb-2'>AI Meal suggestions</Text>
                                    <Text className='text-xs font-normal text-black'>Get personalized meal recommendations based on your remaining macros.</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <View className='mt-3 bg-white rounded-lg p-1 mb-10'>      
                            <TouchableOpacity style={styles.discoverCardInner} onPress={handleMealFinder}>
                                <View className='flex-row items-center justify-center mr-4 w-[40px] h-[40px] rounded-full bg-lightGreen'>
                                <Image source={IMAGE_CONSTANTS.locationIcon} className='w-[24px] h-[24px] object-fill' />
                                </View>
                                <View style={styles.discoverTextWrap}>
                                    <Text className='text-sm font-semibold text-black mb-2'>Meal Finder</Text>
                                    <Text className='text-xs font-normal text-black'>Discover nearby restaurant options that align with your macro targets and dietary preferences.</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ImageBackground>
            </View>
        </CustomSafeAreaView>
    );
};

const styles = StyleSheet.create({
    bg: {
        flex: 1,
        width: '100%',
        height: '100%',
        paddingBottom: 120,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    headerIconBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    headerIcon: {
        fontSize: 22,
        color: '#222',
        fontWeight: 'bold',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a8a6a',
        textAlign: 'center',
    },
    searchBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 24,
        marginHorizontal: 20,
        marginBottom: 18,
        paddingHorizontal: 16,
        height: 44,
    },
    searchIcon: {
        fontSize: 18,
        color: '#B0B0B0',
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#222',
    },
    section: {
        marginHorizontal: 20,
        marginBottom: 18,
    },
    sectionTitle: {
        fontSize: 14,
        color: '#222',
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 8,
    },
    scanOptionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    scanOptionCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 6,
        alignItems: 'center',
        paddingVertical: 24,

        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 1,
    },
    scanOptionIconWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8F7F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    scanOptionIcon: {
        fontSize: 24,
        color: '#19a28f',
    },
    scanOptionText: {
        fontSize: 16,
        color: '#222',
        fontWeight: '500',
        textAlign: 'center',
    },
    discoverCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 2,
        elevation: 1,
    },
    discoverCardInner: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        padding: 16,
    },
    discoverIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E8F7F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    discoverIcon: {
        fontSize: 20,
        color: '#19a28f',
    },
    discoverTextWrap: {
        flex: 1,
    },
    discoverTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#222',
        marginBottom: 2,
    },
    discoverDesc: {
        fontSize: 14,
        color: '#666',
    },
    tabBar: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTab: {
        borderTopWidth: 2,
        borderTopColor: '#3D9A8B',
    },
    tabIcon: {
        fontSize: 24,
        marginBottom: 2,
        color: '#999',
    },
    activeTabIcon: {
        color: '#3D9A8B',
    },
    tabText: {
        fontSize: 12,
        color: '#999',
    },
    activeTabText: {
        color: '#3D9A8B',
    },
});

export default ScanScreenType;