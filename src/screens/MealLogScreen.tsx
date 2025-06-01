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
import { Meal, LoggedMeal } from '../types';
import { router } from 'expo-router';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import { FontAwesome } from '@expo/vector-icons';

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
            const [mealsPromise, progressPromise] = [
                mealService.getTodaysMeals(),
                mealService.getDailyProgress()
            ];

            const [meals, progress] = await Promise.all([mealsPromise, progressPromise]);

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

    useEffect(() => {
        loadData();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            if (shouldRefreshMeals) {
                loadData();
            }
            return () => {};
        }, [shouldRefreshMeals])
    );

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

    const calculateProgress = (consumed: number, target: number): number => {
        if (!target || target <= 0) return 0;
        return Math.min((consumed / target) * 100, 100);
    };

    const getConsumedMacros = () => {
        if (dailyProgress && dailyProgress.logged_macros) {
            return dailyProgress.logged_macros;
        }

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
    const handleAddMeal = () => {
        router.push('/scan');
    };

    const handleMealPress = (mealId: string) => {
        router.push({
            pathname: '/meal-details',
            params: { mealId }
        });
    };

    /**
     * Format time from ISO string to AM/PM format
     * @param dateString - ISO date string to format
     * @returns Formatted time string in 12-hour format with AM/PM
     */
    const formatTime = (dateString: string): string => {
        if (!dateString) return '';

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
    const renderMealCard = (meal: LoggedMeal) => (
        <TouchableOpacity
            key={meal.id}
            style={styles.mealCard}
            onPress={() => handleMealPress(meal.id)}
        >
            <View style={styles.mealCardContent}>
                <Text style={styles.mealName}>{meal.name}</Text>
                <Text style={styles.mealTime}>{new Date(meal.timestamp).toLocaleTimeString()}</Text>
                <View style={styles.macroRow}>
                    <Text style={styles.macroText}>P: {meal.protein}g</Text>
                    <Text style={styles.macroText}>C: {meal.carbs}g</Text>
                    <Text style={styles.macroText}>F: {meal.fat}g</Text>
                    <Text style={styles.calories}>{meal.calories} kcal</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <CustomSafeAreaView className='flex-1' edges={['left', 'right']}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <FontAwesome name="arrow-left" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Meal Log</Text>
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
                            <View style={styles.progressSection}>
                                <View style={styles.progressHeader}>
                                    <Text style={styles.progressTitle}>Daily Progress</Text>
                                    <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
                                </View>

                                <View style={styles.macroCards}>
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

                    <View style={styles.spacer} />
                </ScrollView>

                <TouchableOpacity style={styles.floatingAddButton} onPress={handleAddMeal}>
                    <Text style={styles.floatingAddButtonText}>+ Add Meal</Text>
                </TouchableOpacity>

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
            </View>
        </CustomSafeAreaView>
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
    mealCardContent: {
        flex: 1,
    },
    mealName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1a1a1a',
        marginBottom: 4,
    },
    mealTime: {
        fontSize: 14,
        color: '#666',
    },
    macroRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    macroText: {
        fontSize: 14,
        color: '#666',
    },
    calories: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
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
    backButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1a1a1a',
    },
});

export default MealLogScreen;