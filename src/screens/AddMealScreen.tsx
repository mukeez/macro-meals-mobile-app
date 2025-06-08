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
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStore from '../store/useStore';

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

    const [mealName, setMealName] = useState<string>(analyzedData?.name.toString() || '');
    const [calories, setCalories] = useState<string>(analyzedData?.calories?.toString() || '0');
    const [protein, setProtein] = useState<string>(analyzedData?.protein?.toString() || '0');
    const [carbs, setCarbs] = useState<string>(analyzedData?.carbs?.toString() || '0');
    const [fats, setFats] = useState<string>(analyzedData?.fat?.toString() || '0');
    

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
    const handleAddToLog = (): void => {
        if (!mealName.trim()) {
            console.error('Please enter a meal name');
            return;
        }

        const newMeal = {
            name: mealName,
            macros: {
                calories: parseInt(calories, 10) || 0,
                protein: parseInt(protein, 10) || 0,
                carbs: parseInt(carbs, 10) || 0,
                fat: parseInt(fats, 10) || 0
            },
            date: new Date().toISOString(),
        };

        console.log('Adding meal to log:', newMeal);

        // Navigate back to meal log screen
        navigation.goBack();
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

    return (
        <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
    <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
    <Text style={styles.backButtonText}>←</Text>
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Add Meal</Text>
    <TouchableOpacity onPress={handleBookmark} style={styles.bookmarkButton}>
    <Text style={styles.bookmarkIcon}>🔖</Text>
    </TouchableOpacity>
    </View>

    <ScrollView style={styles.scrollContainer}>
        <TouchableOpacity
    style={styles.photoUploadContainer}
    onPress={handleAddPhoto}
    >
    <View style={styles.photoPlaceholder}>
    <Text style={styles.photoIcon}>🖼️</Text>
    </View>
    <Text style={styles.photoText}>Add meal photo (optional)</Text>
    </TouchableOpacity>

    <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>Meal Name</Text>
    <TextInput
    style={styles.textInput}
    placeholder="Enter meal name"
    value={mealName}
    onChangeText={setMealName}
    />
    </View>

    <View style={styles.macroRow}>
    <View style={styles.macroInputContainer}>
    <Text style={styles.inputLabel}>Calories</Text>
        <View style={styles.macroInputWrapper}>
    <TextInput
        style={styles.macroInput}
    keyboardType="numeric"
    value={calories}
    onChangeText={setCalories}
    />
    <Text style={styles.macroUnit}>kcal</Text>
        </View>
        </View>

        <View style={styles.macroInputContainer}>
    <Text style={styles.inputLabel}>Protein</Text>
        <View style={styles.macroInputWrapper}>
    <TextInput
        style={styles.macroInput}
    keyboardType="numeric"
    value={protein}
    onChangeText={setProtein}
    />
    <Text style={styles.macroUnit}>g</Text>
        </View>
        </View>
        </View>

    {/* Macros Inputs - Row 2 */}
    <View style={styles.macroRow}>
    <View style={styles.macroInputContainer}>
    <Text style={styles.inputLabel}>Carbs</Text>
        <View style={styles.macroInputWrapper}>
    <TextInput
        style={styles.macroInput}
    keyboardType="numeric"
    value={carbs}
    onChangeText={setCarbs}
    />
    <Text style={styles.macroUnit}>g</Text>
        </View>
        </View>

        <View style={styles.macroInputContainer}>
    <Text style={styles.inputLabel}>Fats</Text>
        <View style={styles.macroInputWrapper}>
    <TextInput
        style={styles.macroInput}
    keyboardType="numeric"
    value={fats}
    onChangeText={setFats}
    />
    <Text style={styles.macroUnit}>g</Text>
        </View>
        </View>
        </View>

    <View style={styles.quickAddSection}>
    <Text style={styles.sectionTitle}>Quick Add from Recent</Text>
    <View style={styles.recentMealsContainer}>
        {recentMeals.map((meal) => (
                <TouchableOpacity
                    key={meal.id}
            style={styles.recentMealCard}
            onPress={() => handleQuickAdd(meal)}
>
    <Text style={styles.recentMealIcon}>{meal.icon}</Text>
        <Text style={styles.recentMealName}>{meal.name}</Text>
        </TouchableOpacity>
))}
    </View>
    </View>

    <TouchableOpacity
        style={styles.addToLogButton}
    onPress={handleAddToLog}
    >
    <Text style={styles.addToLogButtonText}>Add to Log</Text>
    </TouchableOpacity>

    <TouchableOpacity
    style={styles.saveTemplateButton}
    onPress={handleSaveTemplate}
    >
    <Text style={styles.saveTemplateButtonText}>Save as Template</Text>
    </TouchableOpacity>

    <View style={styles.bottomSpacer} />
    </ScrollView>
    </SafeAreaView>
);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    backButton: {
        padding: 4,
    },
    backButtonText: {
        fontSize: 24,
        color: '#1a1a1a',
    },
    bookmarkButton: {
        padding: 4,
    },
    bookmarkIcon: {
        fontSize: 20,
        color: '#009688',
    },
    photoUploadContainer: {
        height: 160,
        borderWidth: 1,
        borderStyle: 'dashed',
        borderColor: '#ccc',
        borderRadius: 12,
        marginVertical: 16,
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
    photoIcon: {
        fontSize: 24,
        color: '#999',
    },
    photoText: {
        fontSize: 14,
        color: '#666',
    },
    inputGroup: {
        marginBottom: 16,
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
        paddingVertical: 10,
        fontSize: 16,
    },
    macroRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    macroInputContainer: {
        width: '48%',
    },
    macroInputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 12,
    },
    macroInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 16,
    },
    macroUnit: {
        fontSize: 14,
        color: '#999',
        marginLeft: 4,
    },
    quickAddSection: {
        marginTop: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 12,
    },
    recentMealsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    recentMealCard: {
        width: '31%',
        backgroundColor: '#E8F7F3',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    recentMealIcon: {
        fontSize: 24,
        marginBottom: 8,
    },
    recentMealName: {
        fontSize: 12,
        color: '#1a1a1a',
        textAlign: 'center',
    },
    addToLogButton: {
        backgroundColor: '#009688',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    addToLogButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    saveTemplateButton: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    saveTemplateButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '500',
    },
    bottomSpacer: {
        height: 40,
    },
});

export default AddMealScreen;