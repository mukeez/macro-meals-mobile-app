import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MacroTargets } from '../types';

interface MacroDisplayProps {
    macros: MacroTargets;
    label?: string;
    compact?: boolean;
    showPercentages?: boolean;
}

/**
 * Component for displaying macronutrient information.
 * Can be used in compact or detailed mode.
 */
export const MacroDisplay: React.FC<MacroDisplayProps> = ({
                                                              macros,
                                                              label,
                                                              compact = false,
                                                              showPercentages = false,
                                                          }) => {
    const totalCalories = macros.calories;

    const calculatePercentage = (value: number, multiplier: number): number => {
        return Math.round((value * multiplier / totalCalories) * 100);
    };

    const proteinPercentage = calculatePercentage(macros.protein, 4);
    const carbsPercentage = calculatePercentage(macros.carbs, 4);
    const fatPercentage = calculatePercentage(macros.fat, 9);

    if (compact) {
        return (
            <View style={styles.compactContainer}>
                {label && <Text style={styles.label}>{label}</Text>}
                <Text style={styles.compactText}>
                    {macros.calories} cal · P: {macros.protein}g · C: {macros.carbs}g · F: {macros.fat}g
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>Calories:</Text>
                <Text style={styles.macroValue}>{macros.calories}</Text>
            </View>

            <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>Protein:</Text>
                <Text style={styles.macroValue}>
                    {macros.protein}g
                    {showPercentages && ` (${proteinPercentage}%)`}
                </Text>
            </View>

            <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>Carbs:</Text>
                <Text style={styles.macroValue}>
                    {macros.carbs}g
                    {showPercentages && ` (${carbsPercentage}%)`}
                </Text>
            </View>

            <View style={styles.macroRow}>
                <Text style={styles.macroLabel}>Fat:</Text>
                <Text style={styles.macroValue}>
                    {macros.fat}g
                    {showPercentages && ` (${fatPercentage}%)`}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        backgroundColor: '#f8f8f8',
        borderRadius: 8,
        marginVertical: 5,
    },
    compactContainer: {
        padding: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    macroRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 3,
    },
    macroLabel: {
        fontSize: 14,
        color: '#666',
    },
    macroValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    compactText: {
        fontSize: 14,
        color: '#666',
    },
});