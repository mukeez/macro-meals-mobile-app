import React, { useState } from 'react';
import { useRoute, RouteProp } from '@react-navigation/native';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    StatusBar,
    ScrollView,
    ActivityIndicator,
    Image,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStore from '../store/useStore';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

interface RouteParams {
    barcodeData: any;
    analyzedData?: {
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        quantity: number;
    };
}

interface RecentMeal {
    id: string;
    name: string;
    icon: string;
    macros: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

/**
 * Screen for adding a new meal to the log
 */
export const AddMealScreen: React.FC = () => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<{ AddMeal: RouteParams }, 'AddMeal'>>();
    const params = route.params;
    const { barcodeData, analyzedData } = params;

    console.log('Params:', params);

    const [mealName, setMealName] = useState<string>('');
    const [calories, setCalories] = useState<string>('0');
    const [protein, setProtein] = useState<string>('0');
    const [carbs, setCarbs] = useState<string>('0');
    const [fats, setFats] = useState<string>('0');
    const userId = useStore((state) => state.userId);
    const token = useStore((state) => state.token);
    const [loading, setLoading] = useState<boolean>(false);
    const [time, setTime] = useState<Date>(new Date());
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [recentMeals] = useState<RecentMeal[]>([
        {
            id: '1',
            name: 'Chicken Salad',
            icon: '🥗',
            macros: {
                calories: 350,
                protein: 30,
                carbs: 15,
                fat: 18
            }
        },
        {
            id: '2',
            name: 'Protein Bowl',
            icon: '🥣',
            macros: {
                calories: 450,
                protein: 35,
                carbs: 40,
                fat: 15
            }
        },
        {
            id: '3',
            name: 'Salmon Rice',
            icon: '🐟',
            macros: {
                calories: 480,
                protein: 28,
                carbs: 55,
                fat: 16
            }
        }
    ]);

    /**
     * Handles going back to the previous screen
     */
    const handleGoBack = (): void => {
        navigation.goBack();
    };

    /**
     * Handles saving the meal to bookmarks
     */
    const handleBookmark = (): void => {
        // Implementation for bookmarking a meal
        console.log('Bookmark meal');
    };

    /**
     * Quick add a recent meal
     * @param meal - The recent meal to add
     */
    const handleQuickAdd = (meal: RecentMeal): void => {
        setMealName(meal.name);
        setCalories(meal.macros.calories.toString());
        setProtein(meal.macros.protein.toString());
        setCarbs(meal.macros.carbs.toString());
        setFats(meal.macros.fat.toString());
    };

    /**
     * Adds the current meal to the log
     */
    const handleAddToLog = async (): Promise<void> => {
        setLoading(true);
        try {
            if (!mealName.trim()) {
                console.error('Please enter a meal name');
                return;
            }

            const newMeal = {
                name: mealName,
                calories: parseInt(calories, 10) || 0,
                protein: parseInt(protein, 10) || 0,
                carbs: parseInt(carbs, 10) || 0,
                fat: parseInt(fats, 10) || 0,
                meal_time: new Date().toISOString()
            };

            const response = await fetch('https://api.macromealsapp.com/api/v1/meals/add', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newMeal)
            });
            const data = await response.json();
            console.log('THIS IS THE RESPONSE', data);

            console.log('Adding meal to log:', newMeal);

            // Navigate back to meal log screen
            navigation.navigate('CustomBottomTabs', {screen: 'DashboardScreen'});
        } catch (error) {
            console.error('Error adding meal to log:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Saves the current meal as a template
     */
    const handleSaveTemplate = (): void => {
        // Implementation for saving a meal template
        console.log('Save as template');
    };

    /**
     * Handles adding a photo to the meal
     */
    const handleAddPhoto = (): void => {
        console.log('Add meal photo');
    };

    const handleTimeChange = (event: any, selectedDate?: Date) => {
        setShowTimePicker(false);
        if (selectedDate) {
            setTime(selectedDate);
        }
    };

    const formattedTime = time
        ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
        : '';

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" />
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pt-3 pb-3 border-b border-b-[#f0f0f0] bg-white">
                <TouchableOpacity onPress={handleGoBack} className="p-1">
                    <MaterialIcons name="arrow-back-ios" size={24} color="#222" />
                </TouchableOpacity>
                <Text className="text-[18px] font-semibold text-[#1a1a1a]">Add a meal</Text>
                <TouchableOpacity onPress={handleBookmark} className="p-1">
                    <MaterialIcons name="star-border" size={24} color="#19a28f" />
                </TouchableOpacity>
            </View>
            <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingBottom: 32 }}>
                {/* Photo Upload */}
                <TouchableOpacity className="h-[181px] border border-dashed border-[#e0e0e0] rounded-xl m-4 justify-center items-center bg-[#f9f9f9]" onPress={handleAddPhoto}>
                    <View className="w-12 h-12 rounded-lg bg-[#e0e0e0] justify-center items-center mb-2">
                        <MaterialIcons name="image" size={40} color="#b0b0b0" />
                    </View>
                    <Text className="text-[14px] text-[#888]">Add meal photo (optional)</Text>
                </TouchableOpacity>
                {/* Meal Name */}
                <View className="mx-4 mb-3">
                    <Text className="text-[14px] text-[#333] mb-1.5">Meal name</Text>
                    <TextInput
                        className="border border-[#e0e0e0] h-[68px] rounded-lg px-3 py-3 text-[16px] bg-white"
                        placeholder="Enter meal name"
                        value={mealName}
                        onChangeText={setMealName}
                        placeholderTextColor="#b0b0b0"
                    />
                </View>
                {/* Time of the day */}
                <View className="mx-4 mb-3">
                    <Text className="text-[14px] text-[#333] mb-1.5">Time of the day</Text>
                    <TouchableOpacity
                        className="border border-[#e0e0e0] rounded-lg items-start justify-center h-[68px] px-3 py-3 bg-white"
                        onPress={() => {
                            console.log('Time picker pressed');
                            setShowTimePicker(true);
                        }}
                        activeOpacity={0.7}
                    >
                        <Text className="text-[16px] text-[#222]">{formattedTime || '8:00 am'}</Text>
                    </TouchableOpacity>
                    {showTimePicker && (
                        <>
            
                            <DateTimePicker
                                value={time}
                                mode="time"
                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                onChange={handleTimeChange}
                            />
                        </>
                    )}
                </View>
                {/* Macros Inputs - Row 1 */}
                <View className="flex-row justify-between mx-4 mb-3">
                    <View className="w-[48%]">
                        <Text className="text-[14px] text-[#333] mb-1.5">Calories</Text>
                        <TextInput
                            className="border border-[#e0e0e0] h-[68px] rounded-lg px-3 py-3 text-[16px] bg-white"
                            keyboardType="numeric"
                            value={calories}
                            onChangeText={setCalories}
                            placeholder="0kcal"
                            placeholderTextColor="#b0b0b0"
                        />
                    </View>
                    <View className="w-[48%]">
                        <Text className="text-[14px] text-[#333] mb-1.5">Protein</Text>
                        <TextInput
                            className="border border-[#e0e0e0] h-[68px] rounded-lg px-3 py-3 text-[16px] bg-white"
                            keyboardType="numeric"
                            value={protein}
                            onChangeText={setProtein}
                            placeholder="0g"
                            placeholderTextColor="#b0b0b0"
                        />
                    </View>
                </View>
                {/* Macros Inputs - Row 2 */}
                <View className="flex-row justify-between mx-4 mb-3">
                    <View className="w-[48%]">
                        <Text className="text-[14px] text-[#333] mb-1.5">Carbs</Text>
                        <TextInput
                            className="border border-[#e0e0e0] h-[68px] rounded-lg px-3 py-3 text-[16px] bg-white"
                            keyboardType="numeric"
                            value={carbs}
                            onChangeText={setCarbs}
                            placeholder="0g"
                            placeholderTextColor="#b0b0b0"
                        />
                    </View>
                    <View className="w-[48%]">
                        <Text className="text-[14px] text-[#333] mb-1.5">Fats</Text>
                        <TextInput
                            className="border border-[#e0e0e0] h-[68px] rounded-lg px-3 py-3 text-[16px] bg-white"
                            keyboardType="numeric"
                            value={fats}
                            onChangeText={setFats}
                            placeholder="0g"
                            placeholderTextColor="#b0b0b0"
                        />
                    </View>
                </View>
                {/* Quick Add from Recent */}
                <View className="mt-4 mb-6 mx-4">
                    <Text className="text-[15px] font-medium text-[#333] mb-4">Quick add from recent</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-grow-0">
                        {recentMeals.map((meal) => (
                            <TouchableOpacity
                                key={meal.id}
                                className="flex-row items-center bg-[##607D8B] rounded-xl py-3 px-4 mr-3 w-[260px] h-[80px]"
                                onPress={() => handleQuickAdd(meal)}
                                activeOpacity={0.8}
                            >
                                <View className="w-9 h-9 rounded-full bg-white justify-center items-center mr-2.5">
                                    <MaterialIcons name="restaurant" size={24} color="#19a28f" />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-[15px] font-medium text-white">{meal.name}</Text>
                                    <Text className="text-[13px] text-[#888]">{meal.macros.calories} calories</Text>
                                </View>
                                <View className="w-7 h-7 rounded-full bg-white justify-center items-center ml-2">
                                    <MaterialIcons name="add" size={20} color="#19a28f" />
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </ScrollView>
            {/* Add to log button */}
            <View className="px-4 pb-1 pt-4 bg-white border-t border-t-[#f0f0f0]">
                <TouchableOpacity
                    className="bg-[#88cec8] rounded-full py-4 items-center justify-center"
                    onPress={handleAddToLog}
                    activeOpacity={0.8}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator size="small" color="#fff" />
                    ) : (
                        <Text className="text-white text-[18px] font-semibold">Add to log</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        backgroundColor: '#fff',
    },
    iconButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    scrollContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    photoUploadContainer: {
        height: 140,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#e0e0e0',
        borderRadius: 12,
        margin: 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    photoPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    photoText: {
        fontSize: 14,
        color: '#888',
    },
    inputGroup: {
        marginHorizontal: 16,
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 14,
        color: '#333',
        marginBottom: 6,
    },
    textInput: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    macroRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 16,
        marginBottom: 12,
    },
    macroInputContainer: {
        width: '48%',
    },
    quickAddSection: {
        marginTop: 18,
        marginBottom: 24,
        marginHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        marginBottom: 10,
    },
    recentMealsScroll: {
        flexGrow: 0,
    },
    recentMealCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f7f3',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginRight: 12,
        minWidth: 180,
    },
    recentMealIconWrap: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    recentMealTextWrap: {
        flex: 1,
    },
    recentMealName: {
        fontSize: 15,
        fontWeight: '500',
        color: '#222',
    },
    recentMealCalories: {
        fontSize: 13,
        color: '#888',
    },
    recentMealPlusWrap: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    addToLogButtonWrap: {
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    addToLogButton: {
        backgroundColor: '#88cec8',
        borderRadius: 24,
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addToLogButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});

export default AddMealScreen;