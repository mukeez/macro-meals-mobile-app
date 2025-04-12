import {Meal, UserPreferences} from "../types";
import useStore from "../store/useStore";
import {useNavigation} from "@react-navigation/native";
import {useState} from "react";

enum MealType {
    BREAKFAST = 'breakfast',
    LUNCH = 'lunch',
    DINNER = 'dinner'
}


interface Macros {
    protein: number;
    carbs: number;
    fat: number;
    calories: number;
}

export const MealLogScreen: React.FC = () => {
    // Get user preferences and meals from global store
    const preferences = useStore((state: { preferences: UserPreferences }) => state.preferences);
    const navigation = useNavigation();



    // State for logged meals
    const [loggedMeals, setLoggedMeals] = useState<Meal[]>([
        {
            id: '1',
            name: 'Oatmeal Bowl',
            restaurant: { name: 'Home', location: '' },
            macros: {
                calories: 320,
                protein: 12,
                carbs: 45,
                fat: 6
            },
            description: 'with banana and honey',
            date: '2025-03-15T08:30:00Z',
            mealType: MealType.BREAKFAST
        },
        {
            id: '2',
            name: 'Salmon Poke Bowl',
            restaurant: { name: 'Poke Place', location: '' },
            macros: {
                calories: 580,
                protein: 28,
                carbs: 65,
                fat: 22
            },
            description: 'with brown rice and avocado',
            date: '2025-03-15T13:15:00Z',
            mealType: MealType.LUNCH
        }
    ]);

    // Calculate current macro progress
    const calculateProgress = (consumed: number, target: number): number => {
        return Math.min((consumed / target) * 100, 100);
    };

    // Sum up consumed macros
    const consumedMacros: Macros = loggedMeals.reduce(
        (acc: Macros, meal: Meal): Macros => ({
            protein: acc.protein + meal.macros.protein,
            carbs: acc.carbs + meal.macros.carbs,
            fat: acc.fat + meal.macros.fat,
            calories: acc.calories + meal.macros.calories
        }),
        { protein: 0, carbs: 0, fat: 0, calories: 0 }
    );

    /**
     * Navigate to the add meal screen
     */
    const handleAddMeal = (): void => {
        // In a real app, this would navigate to the add meal screen
        // Using type assertion to avoid type issues with navigation
        navigation.navigate('AddMeal' as never);
    };

    /**
     * Format time from ISO string to AM/PM format
     * @param dateString - ISO date string to format
     * @returns Formatted time string in 12-hour format with AM/PM
     */
    const formatTime = (dateString: string): string => {
        const date = new Date(dateString);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12;
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

        return `${formattedHours}:${formattedMinutes} ${ampm}`;
    };

    /**
     * Render a meal card based on meal data
     * @param meal - The meal data to render
     * @returns JSX element for the meal card
     */
    const renderMealCard = (meal: Meal): JSX.Element => {
        // Determine meal icon based on meal type
        const getMealIcon = (): string => {
            switch (meal.mealType) {
                case MealType.BREAKFAST:
                    return '☀️';
                case MealType.LUNCH:
                    return '🍊';
                default:
                    return '🍽️';
            }
        };

        // Format the meal time for display
        const formattedTime = formatTime(meal.date);

        // Format the meal type for display
        const mealTypeLabel = meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1);

        return (
            <View key={meal.id} style={styles.mealCard}>
                <View style={styles.mealCardHeader}>
                    <View style={styles.mealTypeContainer}>
                        <Text style={styles.mealIcon}>{getMealIcon()}</Text>
                        <Text style={styles.mealTypeText}>{mealTypeLabel}</Text>
                    </View>
                    <Text style={styles.mealTime}>{formattedTime}</Text>
                </View>

                <View style={styles.mealCardBody}>
                    <View style={styles.mealInfoContainer}>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        <Text style={styles.mealDescription}>{meal.description}</Text>
                    </View>

                    <View style={styles.mealActions}>
                        <TouchableOpacity style={styles.editButton}>
                            <Text>✏️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton}>
                            <Text>🗑️</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.macroRow}>
                    <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>P: </Text>
                        <Text style={{...styles.macroValue, ...styles.proteinText}}>{meal.macros.protein}g</Text>
                    </View>
                    <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>C: </Text>
                        <Text style={{...styles.macroValue, ...styles.carbsText}}>{meal.macros.carbs}g</Text>
                    </View>
                    <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>F: </Text>
                        <Text style={{...styles.macroValue, ...styles.fatsText}}>{meal.macros.fat}g</Text>
                    </View>
                    <Text style={styles.calories}>{meal.macros.calories} kcal</Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.titleContainer}>
                    <View style={styles.iconContainer}>
                        <Text style={styles.iconText}>🍴</Text>
                    </View>
                    <Text style={styles.headerTitle}>Today's Meals</Text>
                </View>
                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.scrollContainer}>
                {/* Daily Progress Section */}
                <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.progressTitle}>Daily Progress</Text>
                        <Text style={styles.dateText}>March 15, 2025</Text>
                    </View>

                    <View style={styles.macroCards}>
                        {/* Protein Card */}
                        <View style={{...styles.macroCard, ...styles.proteinCard}}>
                            <Text style={styles.macroCardTitle}>Protein</Text>
                            <Text style={styles.macroCardValue}>{consumedMacros.protein}g</Text>
                            <View style={styles.progressBarContainer}>
                                <View style={{
                                    height: '100%',
                                    borderRadius: 3,
                                    backgroundColor: '#009688',
                                    width: `${calculateProgress(consumedMacros.protein, preferences.protein)}%`
                                }} />
                            </View>
                        </View>

                        {/* Carbs Card */}
                        <View style={{...styles.macroCard, ...styles.carbsCard}}>
                            <Text style={styles.macroCardTitle}>Carbs</Text>
                            <Text style={styles.macroCardValue}>{consumedMacros.carbs}g</Text>
                            <View style={styles.progressBarContainer}>
                                <View style={{
                                    height: '100%',
                                    borderRadius: 3,
                                    backgroundColor: '#FF9800',
                                    width: `${calculateProgress(consumedMacros.carbs, preferences.carbs)}%`
                                }} />
                            </View>
                        </View>

                        {/* Fats Card */}
                        <View style={{...styles.macroCard, ...styles.fatsCard}}>
                            <Text style={styles.macroCardTitle}>Fats</Text>
                            <Text style={styles.macroCardValue}>{consumedMacros.fat}g</Text>
                            <View style={styles.progressBarContainer}>
                                <View style={{
                                    height: '100%',
                                    borderRadius: 3,
                                    backgroundColor: '#F44336',
                                    width: `${calculateProgress(consumedMacros.fat, preferences.fat)}%`
                                }} />
                            </View>
                        </View>
                    </View>
                </View>

                {/* Meal List */}
                <View style={styles.mealList}>
                    {loggedMeals.map(meal => renderMealCard(meal))}
                </View>

                {/* Spacer to ensure Add Meal button doesn't overlap content */}
                <View style={styles.spacer} />
            </ScrollView>

            {/* Add Meal Button */}
            <TouchableOpacity style={styles.floatingAddButton} onPress={handleAddMeal}>
                <Text style={styles.floatingAddButtonText}>+ Add Meal</Text>
            </TouchableOpacity>

            {/* Bottom Tab Navigation */}
            <View style={styles.tabBar}>
                <TouchableOpacity style={styles.tabItem}>
                    <Text style={{...styles.tabIcon, ...styles.activeTabIcon}}>🏠</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Text style={styles.tabIcon}>📊</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Text style={styles.tabIcon}>🍽️</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.tabItem}>
                    <Text style={styles.tabIcon}>👤</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Define styles for the component
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    scrollContainer: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconContainer: {
        width: 36,
        height: 36,
        backgroundColor: '#009688',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
    },
    iconText: {
        fontSize: 18,
        color: 'white',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    addButton: {
        width: 36,
        height: 36,
        backgroundColor: '#FFF2E0',
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        fontSize: 24,
        color: '#FF9800',
        fontWeight: '500',
    },
    progressSection: {
        margin: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    progressTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    dateText: {
        fontSize: 14,
        color: '#666',
    },
    macroCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    macroCard: {
        flex: 1,
        borderRadius: 8,
        padding: 12,
        marginHorizontal: 4,
    },
    proteinCard: {
        backgroundColor: '#E8F7F3',
    },
    carbsCard: {
        backgroundColor: '#FFF8E0',
    },
    fatsCard: {
        backgroundColor: '#FFEEEE',
    },
    macroCardTitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    macroCardValue: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    progressBarContainer: {
        height: 6,
        backgroundColor: '#E0E0E0',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 3,
    },
    proteinProgressBar: {
        backgroundColor: '#009688',
    },
    carbsProgressBar: {
        backgroundColor: '#FF9800',
    },
    fatsProgressBar: {
        backgroundColor: '#F44336',
    },
    mealList: {
        paddingHorizontal: 16,
    },
    mealCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    mealCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    mealTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    mealIcon: {
        fontSize: 16,
        marginRight: 6,
    },
    mealTypeText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1a1a1a',
    },
    mealTime: {
        fontSize: 14,
        color: '#666',
    },
    mealCardBody: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    mealInfoContainer: {
        flex: 1,
    },
    mealName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    mealDescription: {
        fontSize: 14,
        color: '#666',
    },
    mealActions: {
        flexDirection: 'row',
    },
    editButton: {
        marginRight: 12,
    },
    deleteButton: {},
    macroRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    macroItem: {
        flexDirection: 'row',
        marginRight: 12,
    },
    macroLabel: {
        fontSize: 14,
        color: '#666',
    },
    macroValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    proteinText: {
        color: '#009688',
    },
    carbsText: {
        color: '#FF9800',
    },
    fatsText: {
        color: '#F44336',
    },
    calories: {
        marginLeft: 'auto',
        fontSize: 14,
        color: '#1a1a1a',
    },
    floatingAddButton: {
        position: 'absolute',
        bottom: 70,
        left: 16,
        right: 16,
        backgroundColor: '#009688',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    floatingAddButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    spacer: {
        height: 80,
    },
    tabBar: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabIcon: {
        fontSize: 24,
        color: '#bbb',
    },
    activeTabIcon: {
        color: '#009688',
    },
});

// Export the component as default
export default MealLogScreen;