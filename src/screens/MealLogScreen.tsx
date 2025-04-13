import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import useStore from '../store/useStore';
import { mealService } from '../services/mealService';
import { Meal } from '../types';

// Enum for meal types
enum MealType {
    BREAKFAST = 'breakfast',
    LUNCH = 'lunch',
    DINNER = 'dinner'
}

/**
 * Interface for daily progress data from API
 */
interface DailyProgress {
    logged_macros: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    target_macros: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
    progress_percentage: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
    };
}

/**
 * Screen to display daily meal log and macro progress
 */
const MealLogScreen: React.FC = () => {
    // Access store values
    const preferences = useStore(state => state.preferences);
    const loggedMeals = useStore(state => state.loggedMeals || []);
    const setLoggedMeals = useStore(state => state.setLoggedMeals);
    const shouldRefreshMeals = useStore(state => state.shouldRefreshMeals);
    const setShouldRefreshMeals = useStore(state => state.setShouldRefreshMeals);

    const navigation = useNavigation();
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [dailyProgress, setDailyProgress] = useState<DailyProgress | null>(null);
    const [error, setError] = useState<string | null>(null);

    /**
     * Load both meals and daily progress
     */
    const loadData = async () => {
        setLoading(true);
        setError(null);

        try {
            // Call both APIs in parallel
            const [mealsPromise, progressPromise] = [
                mealService.getTodaysMeals(),
                mealService.getDailyProgress()
            ];

            // Wait for both requests to complete
            const [meals, progress] = await Promise.all([mealsPromise, progressPromise]);

            // Update state with fetched data
            setLoggedMeals(meals || []);
            setDailyProgress(progress);
            setShouldRefreshMeals(false);
        } catch (err: any) {
            console.error('Error loading data:', err);
            setError('Failed to load meals. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    // Also refresh when the screen comes into focus if needed
    useFocusEffect(
        React.useCallback(() => {
            if (shouldRefreshMeals) {
                loadData();
            }
            return () => {};
        }, [shouldRefreshMeals])
    );

    // Pull-to-refresh handler
    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await loadData();
        } catch (error) {
            console.error('Error refreshing data:', error);
        } finally {
            setRefreshing(false);
        }
    };

    // Calculate current macro progress
    const calculateProgress = (consumed: number, target: number): number => {
        if (!target || target <= 0) return 0;
        return Math.min((consumed / target) * 100, 100);
    };

    // Get consumed macros from API response or calculate from meals
    const getConsumedMacros = () => {
        if (dailyProgress && dailyProgress.logged_macros) {
            return dailyProgress.logged_macros;
        }

        // Fallback: calculate from meals
        return (loggedMeals || []).reduce(
            (acc, meal) => ({
                protein: acc.protein + (meal?.macros?.protein || 0),
                carbs: acc.carbs + (meal?.macros?.carbs || 0),
                fat: acc.fat + (meal?.macros?.fat || 0),
                calories: acc.calories + (meal?.macros?.calories || 0)
            }),
            { protein: 0, carbs: 0, fat: 0, calories: 0 }
        );
    };

    // Get target macros from API response or use preferences
    const getTargetMacros = () => {
        if (dailyProgress && dailyProgress.target_macros) {
            return dailyProgress.target_macros;
        }

        // Fallback: use preferences
        return {
            protein: preferences?.protein || 0,
            carbs: preferences?.carbs || 0,
            fat: preferences?.fat || 0,
            calories: preferences?.calories || 0
        };
    };

    const consumedMacros = getConsumedMacros();
    const targetMacros = getTargetMacros();

    /**
     * Navigate to the add meal screen
     */
    const handleAddMeal = (): void => {
        navigation.navigate('AddMeal' as never);
    };

    /**
     * Format time from ISO string to AM/PM format
     * @param dateString - ISO date string to format
     * @returns Formatted time string in 12-hour format with AM/PM
     */
    const formatTime = (dateString: string): string => {
        if (!dateString) return ''; // Handle null or undefined

        try {
            const date = new Date(dateString);
            const hours = date.getHours();
            const minutes = date.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12;
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

            return `${formattedHours}:${formattedMinutes} ${ampm}`;
        } catch (e) {
            console.error('Error formatting date:', e);
            return '';
        }
    };

    /**
     * Render a meal card based on meal data
     * @param meal - The meal data to render
     * @returns JSX element for the meal card
     */
    const renderMealCard = (meal: Meal) => {
        if (!meal) return null;

        // Determine meal icon based on meal type
        const getMealIcon = () => {
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
        const mealTypeLabel = meal.mealType
            ? meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)
            : 'Meal';

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
                        <Text style={styles.mealName}>{meal.name || 'Unnamed Meal'}</Text>
                        <Text style={styles.mealDescription}>{meal.description || ''}</Text>
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
                        <Text style={{...styles.macroValue, ...styles.proteinText}}>
                            {meal.macros?.protein || 0}g
                        </Text>
                    </View>
                    <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>C: </Text>
                        <Text style={{...styles.macroValue, ...styles.carbsText}}>
                            {meal.macros?.carbs || 0}g
                        </Text>
                    </View>
                    <View style={styles.macroItem}>
                        <Text style={styles.macroLabel}>F: </Text>
                        <Text style={{...styles.macroValue, ...styles.fatsText}}>
                            {meal.macros?.fat || 0}g
                        </Text>
                    </View>
                    <Text style={styles.calories}>
                        {meal.macros?.calories || 0} kcal
                    </Text>
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

            <ScrollView
                style={styles.scrollContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                    />
                }
            >
                {error ? (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                            <Text style={styles.retryButtonText}>Retry</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <>
                        {/* Daily Progress Section */}
                        <View style={styles.progressSection}>
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressTitle}>Daily Progress</Text>
                                <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
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
                                            width: `${calculateProgress(consumedMacros.protein, targetMacros.protein)}%`
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
                                            width: `${calculateProgress(consumedMacros.carbs, targetMacros.carbs)}%`
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
                                            width: `${calculateProgress(consumedMacros.fat, targetMacros.fat)}%`
                                        }} />
                                    </View>
                                </View>
                            </View>
                        </View>

                        {/* Meal List */}
                        <View style={styles.mealList}>
                            {loading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#009688" />
                                    <Text style={styles.loadingText}>Loading meals...</Text>
                                </View>
                            ) : !loggedMeals || loggedMeals.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyStateText}>No meals logged today</Text>
                                    <Text style={styles.emptyStateSubtext}>Tap "Add Meal" to log your first meal</Text>
                                </View>
                            ) : (
                                loggedMeals.map(meal => renderMealCard(meal))
                            )}
                        </View>
                    </>
                )}

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
        minHeight: 200,
    },
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginVertical: 16,
    },
    emptyStateText: {
        fontSize: 18,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: 16,
    },
    errorText: {
        fontSize: 16,
        color: '#F44336',
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#009688',
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 4,
    },
    retryButtonText: {
        color: '#fff',
        fontWeight: '500',
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

export default MealLogScreen;