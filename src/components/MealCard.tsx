import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Meal } from '../types';
import { MacroDisplay } from './MacroDisplay';

interface MealCardProps {
    meal: Meal;
    onPress?: (meal: Meal) => void;
}

/**
 * Card component to display a suggested meal with its details and macros.
 */
export const MealCard: React.FC<MealCardProps> = ({ meal, onPress }) => {
    const handlePress = () => {
        if (onPress) {
            onPress(meal);
        }
    };

    // Safe fallback rendering for name and restaurant
    const nameText =
        typeof meal.name === 'string'
            ? meal.name
            : meal.name?.toString?.() || '[Unnamed Meal]';

    const restaurantText =
        typeof meal.restaurant === 'string'
            ? meal.restaurant
            : meal.restaurant?.name
                ? `${meal.restaurant.name}, ${meal.restaurant.location ?? ''}`
                : JSON.stringify(meal.restaurant ?? '');

    const descriptionText =
        typeof meal.description === 'string'
            ? meal.description
            : meal.description
                ? JSON.stringify(meal.description)
                : '';

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={handlePress}
            activeOpacity={onPress ? 0.7 : 1}
        >
            <View style={styles.header}>
                <View style={styles.textContainer}>
                    <Text style={styles.name}>{nameText}</Text>
                    <Text style={styles.restaurant}>{restaurantText}</Text>

                    {meal.distance !== undefined && (
                        <Text style={styles.distance}>{meal.distance.toFixed(1)} km away</Text>
                    )}

                    {meal.price !== undefined && (
                        <Text style={styles.price}>${meal.price.toFixed(2)}</Text>
                    )}
                </View>

                {meal.imageUrl && (
                    <Image source={{ uri: meal.imageUrl }} style={styles.image} />
                )}
            </View>

            {descriptionText && (
                <Text style={styles.description}>{descriptionText}</Text>
            )}

            <View style={styles.macroContainer}>
                <MacroDisplay macros={meal.macros} compact />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginVertical: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        marginRight: 10,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    restaurant: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
    },
    description: {
        fontSize: 14,
        color: '#666',
        marginVertical: 8,
    },
    price: {
        fontSize: 14,
        fontWeight: '500',
        color: '#2E7D32',
        marginTop: 2,
    },
    distance: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    macroContainer: {
        marginTop: 10,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
});
