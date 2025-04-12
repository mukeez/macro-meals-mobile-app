import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Platform
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';

import { MealCard } from '../components/MealCard';
import { MacroDisplay } from '../components/MacroDisplay';
import useStore from '../store/useStore';
import { mealService } from '../services/mealService';
import { locationService } from '../services/locationService';
import { Meal, UserPreferences } from '../types';

/**
 * Screen for displaying nearby meal suggestions based on user's macro goals
 */
export const NearbyMealsScreen: React.FC = () => {
    const navigation = useNavigation();
    const preferences = useStore((state) => state.preferences);
    const updatePreferences = useStore((state) => state.updatePreferences);

    const [meals, setMeals] = useState<Meal[]>([]);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [currentAddress, setCurrentAddress] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get user's current location
    const fetchCurrentLocation = async () => {
        try {
            // Check and request permissions
            const hasPermission = await locationService.requestPermissions();

            if (!hasPermission) {
                Alert.alert(
                    'Location Access Denied',
                    'Please enable location services to find nearby meals.',
                    [{ text: 'OK' }]
                );
                return;
            }

            // Get current location
            const currentLocation = await locationService.getCurrentLocation();

            if (currentLocation) {
                setLocation(currentLocation);

                // Reverse geocode to get human-readable address
                const address = await locationService.reverseGeocode(
                    currentLocation.coords.latitude,
                    currentLocation.coords.longitude
                );

                setCurrentAddress(address);

                // Update preferences with location
                updatePreferences({
                    location: address,
                    latitude: currentLocation.coords.latitude,
                    longitude: currentLocation.coords.longitude
                });

                return currentLocation;
            }
        } catch (error) {
            console.error('Location fetch error:', error);
            setError('Could not retrieve location');
        }
    };

    // Fetch nearby meals
    const fetchNearbyMeals = async (showRefreshing = false) => {
        if (showRefreshing) {
            setRefreshing(true);
        } else {
            setIsLoading(true);
        }

        setError(null);

        try {
            // Ensure we have location
            if (!location) {
                await fetchCurrentLocation();
            }

            // Prepare meal suggestion request
            const mealRequest: UserPreferences = {
                ...preferences,
                location: currentAddress || preferences.location || 'Unknown Location'
            };

            // Fetch meals from service
            const fetchedMeals = await mealService.suggestMeals(mealRequest);

            setMeals(fetchedMeals);
        } catch (error) {
            console.error('Error fetching nearby meals:', error);

            // Create a user-friendly error message
            const errorMessage = error instanceof Error
                ? error.message
                : 'Failed to load nearby meals. Please try again.';

            setError(errorMessage);

            // Show an alert to the user
            Alert.alert(
                'Meal Suggestions Error',
                errorMessage,
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
            if (showRefreshing) {
                setRefreshing(false);
            }
        }
    };

    // Initial location and meal fetch
    useEffect(() => {
        if (meals.length === 0) {
            fetchCurrentLocation().then(() => {
                fetchNearbyMeals();
            });
        }
    }, []);

    // Render loading state
    if (isLoading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#19a28f" />
                <Text style={styles.loadingText}>Finding meals near you...</Text>
            </View>
        );
    }

    // Render header with location and macro targets
    const renderHeader = () => (
        <View style={styles.headerContainer}>
            <View style={styles.locationHeader}>
                <Text style={styles.locationText}>
                    📍 {currentAddress || preferences.location || 'Unknown Location'}
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate('MacroInput')}>
                    <Text style={styles.filterIcon}>⚙️</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.macroBalanceContainer}>
                <MacroDisplay
                    macros={preferences}
                    label="Remaining Today"
                    compact
                    showPercentages
                />
            </View>
        </View>
    );

    // Render individual meal card
    const renderMealCard = ({ item }: { item: Meal }) => (
        <MealCard
            meal={item}
            onPress={() => {/* TODO: Navigate to meal details */}}
        />
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={meals}
                renderItem={renderMealCard}
                keyExtractor={(item) => item.id}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => fetchNearbyMeals(true)}
                        colors={['#19a28f']}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>
                            {error || 'No meals found nearby'}
                        </Text>
                        <TouchableOpacity
                            style={styles.retryButton}
                            onPress={() => {
                                fetchCurrentLocation();
                                fetchNearbyMeals();
                            }}
                        >
                            <Text style={styles.retryButtonText}>Retry</Text>
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
    },
    headerContainer: {
        padding: 16,
        backgroundColor: '#f9f9f9',
    },
    locationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    locationText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    filterIcon: {
        fontSize: 20,
    },
    macroBalanceContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    listContent: {
        paddingBottom: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#19a28f',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
    },
});