import React, { useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MealCard } from '../components/MealCard';
import { MacroDisplay } from '../components/MacroDisplay';
import { mealService } from '../services/mealService';
import useStore from '../store/useStore';

type RootStackParamList = {
    MacroInput: undefined;
    MealList: { fromSearch: boolean };
};

type MealListScreenRouteProp = RouteProp<RootStackParamList, 'MealList'>;
type MealListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MealList'>;

/**
 * Screen for displaying suggested meals based on user preferences.
 */
export const MealListScreen: React.FC = () => {
    const route = useRoute<MealListScreenRouteProp>();
    const navigation = useNavigation<MealListScreenNavigationProp>();

    // Get state and actions from Zustand store
    const preferences = useStore((state) => state.preferences);
    const suggestedMeals = useStore((state) => state.suggestedMeals);
    const isLoading = useStore((state) => state.isLoadingSuggestions);
    const error = useStore((state) => state.suggestionsError);
    const setSuggestedMeals = useStore((state) => state.setSuggestedMeals);
    const setIsLoading = useStore((state) => state.setIsLoadingSuggestions);
    const setError = useStore((state) => state.setSuggestionsError);

    const [refreshing, setRefreshing] = React.useState(false);

    /**
     * Fetches meal suggestions from the API.
     */
    const fetchMeals = async (showRefreshing = false) => {
        if (showRefreshing) {
            setRefreshing(true);
        } else {
            setIsLoading(true);
        }

        setError(null);

        try {
            const result = await mealService.getAiMealSuggestions();
            setSuggestedMeals(result.meals);
        } catch (err) {
            setError('Failed to load meal suggestions. Please try again.');
            console.error('Error fetching meals:', err);
        } finally {
            setIsLoading(false);
            if (showRefreshing) {
                setRefreshing(false);
            }
        }
    };

    /**
     * Handle pull-to-refresh.
     */
    const handleRefresh = () => {
        fetchMeals(true);
    };

    /**
     * Initialize data on screen mount or when coming from search.
     */
    useEffect(() => {
        const fromSearch = route.params?.fromSearch;

        if ((fromSearch && !isLoading) || suggestedMeals.length === 0) {
            fetchMeals();
        }
    }, [route.params?.fromSearch]);

    /**
     * Handles when a meal card is pressed.
     */
    const handleMealPress = (meal: Meal) => {
        console.log('Meal pressed:', meal.name);
    };

    /**
     * Renders the list header with user preferences summary.
     */
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Suggested Meals</Text>
            <Text style={styles.headerSubtitle}>
                Based on your preferences in {preferences.location}
            </Text>

            <View style={styles.targetContainer}>
                <Text style={styles.targetTitle}>Your Macro Targets:</Text>
                <MacroDisplay macros={preferences} compact />
            </View>

            <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('MacroInput')}
            >
                <Text style={styles.editButtonText}>Edit Preferences</Text>
            </TouchableOpacity>
        </View>
    );

    /**
     * Renders content based on loading/error state.
     */
    if (isLoading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#4a6da7" />
                <Text style={styles.loadingText}>Finding meals that match your goals...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={() => fetchMeals()}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={suggestedMeals}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <MealCard meal={item} onPress={handleMealPress} />
                )}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No meals found matching your criteria.</Text>
                        <TouchableOpacity
                            style={styles.emptyButton}
                            onPress={() => navigation.navigate('MacroInput')}
                        >
                            <Text style={styles.emptyButtonText}>Adjust Preferences</Text>
                        </TouchableOpacity>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    listContent: {
        padding: 16,
    },
    headerContainer: {
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    targetContainer: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    targetTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
    },
    editButton: {
        backgroundColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        alignItems: 'center',
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#4a6da7',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#ff6b6b',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryButton: {
        backgroundColor: '#4a6da7',
        borderRadius: 8,
        padding: 12,
        width: 100,
        alignItems: 'center',
    },
    retryButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    emptyButton: {
        backgroundColor: '#4a6da7',
        borderRadius: 8,
        padding: 12,
        width: 180,
        alignItems: 'center',
    },
    emptyButtonText: {
        fontSize: 16,
        color: 'white',
        fontWeight: '500',
    },
});