import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    ScrollView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { mealService } from '../services/mealService';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import { FontAwesome } from '@expo/vector-icons';
import { LoggedMeal } from '../types';

type RootStackParamList = {
    MealDetails: {
        id: string;
    };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'MealDetails'>;
type MealDetailsRouteProp = RouteProp<RootStackParamList, 'MealDetails'>;

export const MealDetailsScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<MealDetailsRouteProp>();
    const { id } = route.params;
    const [meal, setMeal] = useState<LoggedMeal | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadMealDetails();
    }, [id]);

    const loadMealDetails = async () => {
        try {
            setLoading(true);
            const meals = await mealService.getLoggedMeals();
            const foundMeal = meals.find(m => m.id === id);
            if (foundMeal) {
                setMeal(foundMeal);
                setError(null);
            } else {
                setError('Meal not found');
            }
        } catch (err) {
            setError('Failed to load meal details. Please try again.');
            console.error('Error loading meal details:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Meal',
            'Are you sure you want to delete this meal?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await mealService.deleteMeal(id);
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete meal. Please try again.');
                            console.error('Error deleting meal:', err);
                        }
                    },
                },
            ],
        );
    };

    const handleGoBack = () => {
        navigation.goBack();
    };

    if (loading) {
        return (
            <CustomSafeAreaView className='flex-1' edges={['left', 'right']}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#009688" />
                    <Text style={styles.loadingText}>Loading meal details...</Text>
                </View>
            </CustomSafeAreaView>
        );
    }

    if (error || !meal) {
        return (
            <CustomSafeAreaView className='flex-1' edges={['left', 'right']}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error || 'Meal not found'}</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={loadMealDetails}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </CustomSafeAreaView>
        );
    }

    return (
        <CustomSafeAreaView className='flex-1' edges={['left', 'right']}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleGoBack}
                    >
                        <FontAwesome name="arrow-left" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Meal Details</Text>
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDelete}
                    >
                        <FontAwesome name="trash" size={24} color="#FF3B30" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content}>
                    <View style={styles.mealCard}>
                        <Text style={styles.mealName}>{meal.name}</Text>
                        <Text style={styles.mealTime}>
                            {new Date(meal.timestamp).toLocaleString()}
                        </Text>

                        <View style={styles.macrosContainer}>
                            <View style={styles.macroItem}>
                                <Text style={styles.macroLabel}>Calories</Text>
                                <Text style={styles.macroValue}>{meal.calories}</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <Text style={styles.macroLabel}>Protein</Text>
                                <Text style={styles.macroValue}>{meal.protein}g</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <Text style={styles.macroLabel}>Carbs</Text>
                                <Text style={styles.macroValue}>{meal.carbs}g</Text>
                            </View>
                            <View style={styles.macroItem}>
                                <Text style={styles.macroLabel}>Fat</Text>
                                <Text style={styles.macroValue}>{meal.fat}g</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </CustomSafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        padding: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    deleteButton: {
        padding: 8,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    mealCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    mealName: {
        fontSize: 24,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    mealTime: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    macrosContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 16,
    },
    macroItem: {
        width: '48%',
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        alignItems: 'center',
    },
    macroLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    macroValue: {
        fontSize: 20,
        fontWeight: '600',
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#FF3B30',
        textAlign: 'center',
        marginBottom: 12,
    },
    retryButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
    },
}); 