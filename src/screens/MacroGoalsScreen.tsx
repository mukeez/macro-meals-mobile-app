import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import Svg, { Circle, G } from 'react-native-svg';
import useStore from '../store/useStore';
import { macroCalculationService } from '../services/macroCalculationService';
import { RootStackParamList } from '../types/navigation';
import { UserPreferences } from '../types';

type MacroGoalsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'MacroGoals'>;

interface MacroGoalsScreenProps {
    route?: {
        params?: {
            calculatedMacros?: UserPreferences;
        };
    };
}

const MacroGoalsScreen: React.FC<MacroGoalsScreenProps> = ({ route }) => {
    const navigation = useNavigation<MacroGoalsScreenNavigationProp>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const preferences = useStore((state) => state.preferences);
    const updatePreferences = useStore((state) => state.updatePreferences);

    const calculatedMacros = route?.params?.calculatedMacros;

    useEffect(() => {
        if (calculatedMacros) {
            updatePreferences(calculatedMacros);
        }
        else if (!preferences.calories) {
            loadMacroGoals();
        }
    }, [calculatedMacros]);

    const loadMacroGoals = async (): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const metrics = {
                age: preferences.age || 30,
                weight: preferences.weight || 70,
                height: preferences.height || 170,
                sex: preferences.gender || 'Male',
                activityLevel: preferences.activityLevel || 'Moderate',
                goal: preferences.goal || 'Maintain',
                unitSystem: 'Metric' as const,
            };

            const calculatedMacros = await macroCalculationService.calculateMacros(metrics);

            updatePreferences(calculatedMacros);
        } catch (error) {
            console.error('Error loading macro goals:', error);
            setError('Failed to load your macro goals. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirm = (): void => {
        navigation.navigate('DashboardScreen');
    };

    const handleBackPress = (): void => {
        navigation.goBack();
    };

    const calculateMacroPercentages = (): {
        proteinPercentage: number;
        carbsPercentage: number;
        fatPercentage: number;
    } => {
        const { calories, protein, carbs, fat } = preferences;

        const proteinCals = protein * 4;
        const carbsCals = carbs * 4;
        const fatCals = fat * 9;

        const proteinPercentage = proteinCals / calories;
        const carbsPercentage = carbsCals / calories;
        const fatPercentage = fatCals / calories;

        return { proteinPercentage, carbsPercentage, fatPercentage };
    };

    if (isLoading) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#19a28f" />
                <Text style={styles.loadingText}>Calculating your macro goals...</Text>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={[styles.container, styles.centerContent]}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadMacroGoals}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    const { proteinPercentage, carbsPercentage, fatPercentage } = calculateMacroPercentages();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            <View style={styles.header}>
                <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Macro Goals</Text>
            </View>

            <View style={styles.content}>
                <View style={styles.ringContainer}>
                    <MacroRing
                        calories={preferences.calories}
                        proteinPercentage={proteinPercentage}
                        carbsPercentage={carbsPercentage}
                        fatPercentage={fatPercentage}
                    />
                </View>

                <View style={styles.macroCards}>
                    <MacroCard
                        label="Protein"
                        value={preferences.protein}
                        unit="g"
                        color="#4CAF50"
                        icon="🥩"
                    />

                    <MacroCard
                        label="Carbs"
                        value={preferences.carbs}
                        unit="g"
                        color="#FFC107"
                        icon="🍞"
                    />

                    <MacroCard
                        label="Fats"
                        value={preferences.fat}
                        unit="g"
                        color="#E57373"
                        icon="🥑"
                    />
                </View>
            </View>

            <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
            >
                <Text style={styles.confirmButtonText}>Confirm & Go to Dashboard →</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
};

interface MacroRingProps {
    calories: number;
    proteinPercentage: number;
    carbsPercentage: number;
    fatPercentage: number;
}

// Component for the macro progress ring
const MacroRing: React.FC<MacroRingProps> = ({
                                                 calories,
                                                 proteinPercentage,
                                                 carbsPercentage,
                                                 fatPercentage
                                             }) => {
    const size = 220;
    const strokeWidth = 25;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Calculate stroke dasharray values based on percentages
    const proteinStrokeDasharray = `${circumference * proteinPercentage} ${circumference * (1 - proteinPercentage)}`;
    const carbsStrokeDasharray = `${circumference * carbsPercentage} ${circumference * (1 - carbsPercentage)}`;
    const fatStrokeDasharray = `${circumference * fatPercentage} ${circumference * (1 - fatPercentage)}`;

    return (
        <View style={styles.ring}>
            <Svg width={size} height={size}>
                {/* Background circles */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#E0E0E0"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                />

                {/* Fat progress (red) */}
                <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#E57373"
                    strokeWidth={strokeWidth}
                    strokeDasharray={fatStrokeDasharray}
                    strokeLinecap="round"
                    fill="transparent"
                    transform={`rotate(-90, ${size / 2}, ${size / 2})`}
                />

                {/* Carbs progress (yellow) */}
                <G transform={`rotate(120, ${size / 2}, ${size / 2})`}>
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#FFC107"
                        strokeWidth={strokeWidth}
                        strokeDasharray={carbsStrokeDasharray}
                        strokeLinecap="round"
                        fill="transparent"
                        transform={`rotate(-90, ${size / 2}, ${size / 2})`}
                    />
                </G>

                {/* Protein progress (green) */}
                <G transform={`rotate(240, ${size / 2}, ${size / 2})`}>
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#4CAF50"
                        strokeWidth={strokeWidth}
                        strokeDasharray={proteinStrokeDasharray}
                        strokeLinecap="round"
                        fill="transparent"
                        transform={`rotate(-90, ${size / 2}, ${size / 2})`}
                    />
                </G>
            </Svg>

            {/* Calorie display in the center */}
            <View style={styles.calorieContainer}>
                <Text style={styles.calorieValue}>{calories}</Text>
                <Text style={styles.calorieUnit}>cal/day</Text>
            </View>
        </View>
    );
};

// Props for the MacroCard component
interface MacroCardProps {
    label: string;
    value: number;
    unit: string;
    color: string;
    icon: string;
}

// Component for individual macro cards
const MacroCard: React.FC<MacroCardProps> = ({ label, value, unit, color, icon }) => {
    return (
        <View style={[styles.macroCard, { borderLeftColor: color }]}>
            <View style={styles.macroIconContainer}>
                <Text style={styles.macroIcon}>{icon}</Text>
            </View>
            <View style={styles.macroInfo}>
                <Text style={styles.macroLabel}>{label}</Text>
                <Text style={styles.macroValue}>
                    {value}<Text style={styles.macroUnit}>{unit}</Text>
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    errorText: {
        fontSize: 16,
        color: '#E57373',
        textAlign: 'center',
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: '#19a28f',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 16,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 24,
        color: '#19a28f',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#19a28f',
        marginLeft: 8,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    ringContainer: {
        marginBottom: 30,
    },
    ring: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    calorieContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    calorieValue: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#19a28f',
    },
    calorieUnit: {
        fontSize: 16,
        color: '#757575',
        marginTop: 4,
    },
    macroCards: {
        width: '100%',
    },
    macroCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 6,
    },
    macroIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    macroIcon: {
        fontSize: 20,
    },
    macroInfo: {
        flex: 1,
    },
    macroLabel: {
        fontSize: 18,
        color: '#424242',
        marginBottom: 4,
    },
    macroValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#212121',
    },
    macroUnit: {
        fontSize: 16,
        fontWeight: 'normal',
        color: '#757575',
    },
    confirmButton: {
        backgroundColor: '#19a28f',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 24,
        margin: 16,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default MacroGoalsScreen;