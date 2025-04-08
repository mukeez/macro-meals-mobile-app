import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { MacroDisplay } from '../components/MacroDisplay';
import { UserPreferences } from '../types';
import { mealService } from '../services/mealService';
import useStore from '../store/useStore';

export const MacroInputScreen: React.FC = () => {
    // Get state and actions from Zustand store
    const preferences = useStore((state) => state.preferences);
    const updatePreferences = useStore((state) => state.updatePreferences);
    const setIsLoadingSuggestions = useStore((state) => state.setIsLoadingSuggestions);
    const setSuggestedMeals = useStore((state) => state.setSuggestedMeals);
    const setSuggestionsError = useStore((state) => state.setSuggestionsError);

    // Local state for form
    const [unit, setUnit] = useState<'Metric' | 'Imperial'>('Metric');
    const [age, setAge] = useState(preferences.age ? preferences.age.toString() : '');
    const [weight, setWeight] = useState(preferences.weight ? preferences.weight.toString() : '');
    const [height, setHeight] = useState(preferences.height ? preferences.height.toString() : '');
    const [gender, setGender] = useState(preferences.gender || '');
    const [activityLevel, setActivityLevel] = useState(preferences.activityLevel || '');
    const [goal, setGoal] = useState(preferences.goal || '');
    const [manualMacros, setManualMacros] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Activity levels and goals
    const activityLevels = [
        { label: 'Sedentary', icon: '🛋️' },
        { label: 'Moderate', icon: '🚶' },
        { label: 'Active', icon: '🏃' }
    ];

    const goals = [
        { label: 'Lose', icon: '⬇️' },
        { label: 'Maintain', icon: '=' },
        { label: 'Gain', icon: '⬆️' }
    ];

    // Handler for calculating macros
    const handleCalculateMacros = async () => {
        // Validate inputs
        if (!age || !weight || !height || !gender || !activityLevel || !goal) {
            alert('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            // Calculate macros based on user inputs
            const calculatedPreferences: UserPreferences = {
                age: parseInt(age),
                weight: parseFloat(weight),
                height: parseFloat(height),
                gender,
                activityLevel,
                goal,
                calories: 2000, // Placeholder - replace with actual calculation
                protein: 150,   // Placeholder - replace with actual calculation
                carbs: 200,     // Placeholder - replace with actual calculation
                fat: 70,        // Placeholder - replace with actual calculation
                location: preferences.location || '',
            };

            // Update global preferences
            updatePreferences(calculatedPreferences);

            // Fetch meal suggestions
            const suggestedMeals = await mealService.getMockMealSuggestions(calculatedPreferences);
            setSuggestedMeals(suggestedMeals);
            setIsLoadingSuggestions(false);

            // Navigate to meal list (you'd implement navigation here)
            // navigation.navigate('MealList');
        } catch (error) {
            console.error('Error calculating macros:', error);
            setSuggestionsError('Failed to calculate macros. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Render unit toggle
    const renderUnitToggle = () => (
        <View style={styles.unitToggleContainer}>
            <TouchableOpacity
                style={[
                    styles.unitToggleButton,
                    unit === 'Metric' ? styles.activeUnitToggle : styles.inactiveUnitToggle
                ]}
                onPress={() => setUnit('Metric')}
            >
                <Text style={unit === 'Metric' ? styles.activeUnitText : styles.inactiveUnitText}>
                    Metric
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[
                    styles.unitToggleButton,
                    unit === 'Imperial' ? styles.activeUnitToggle : styles.inactiveUnitToggle
                ]}
                onPress={() => setUnit('Imperial')}
            >
                <Text style={unit === 'Imperial' ? styles.activeUnitText : styles.inactiveUnitText}>
                    Imperial
                </Text>
            </TouchableOpacity>
        </View>
    );

    // Render input row
    const renderInputRow = (label, value, onChangeText, unit) => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType="numeric"
                    placeholder={label}
                />
                {unit && <Text style={styles.unitText}>{unit}</Text>}
            </View>
        </View>
    );

    // Render gender select
    const renderGenderSelect = () => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Gender</Text>
            <TouchableOpacity style={styles.selectInput}>
                <Text style={styles.selectInputText}>Select</Text>
                <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>
        </View>
    );

    // Render activity level selector
    const renderActivityLevelSelector = () => (
        <View style={styles.selectorContainer}>
            <Text style={styles.sectionLabel}>Activity Level</Text>
            <View style={styles.optionRow}>
                {activityLevels.map((level) => (
                    <TouchableOpacity
                        key={level.label}
                        style={[
                            styles.optionButton,
                            activityLevel === level.label && styles.selectedOption
                        ]}
                        onPress={() => setActivityLevel(level.label)}
                    >
                        <Text style={styles.optionIcon}>{level.icon}</Text>
                        <Text style={styles.optionLabel}>{level.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    // Render goal selector
    const renderGoalSelector = () => (
        <View style={styles.selectorContainer}>
            <Text style={styles.sectionLabel}>Your Goal</Text>
            <View style={styles.optionRow}>
                {goals.map((goalOption) => (
                    <TouchableOpacity
                        key={goalOption.label}
                        style={[
                            styles.optionButton,
                            goal === goalOption.label && styles.selectedOption
                        ]}
                        onPress={() => setGoal(goalOption.label)}
                    >
                        <Text style={styles.optionIcon}>{goalOption.icon}</Text>
                        <Text style={styles.optionLabel}>{goalOption.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );

    // Render manual macros toggle
    const renderManualMacrosToggle = () => (
        <View style={styles.manualMacrosContainer}>
            <Text style={styles.manualMacrosLabel}>Enter Macros Manually</Text>
            <TouchableOpacity
                style={[
                    styles.toggleSwitch,
                    manualMacros && styles.toggleSwitchActive
                ]}
                onPress={() => setManualMacros(!manualMacros)}
            >
                <View style={[
                    styles.toggleSwitchHandle,
                    manualMacros && styles.toggleSwitchHandleActive
                ]} />
            </TouchableOpacity>
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Tell us about yourself</Text>
                <Text style={styles.subtitle}>Let's create your personalized plan</Text>

                {renderUnitToggle()}

                {renderInputRow('Age', age, setAge, 'Years')}
                {renderInputRow('Weight', weight, setWeight, unit === 'Metric' ? 'kg' : 'lb')}
                {renderInputRow('Height', height, setHeight, unit === 'Metric' ? 'cm' : 'ft')}

                {renderGenderSelect()}
                {renderActivityLevelSelector()}
                {renderGoalSelector()}
                {renderManualMacrosToggle()}

                <TouchableOpacity
                    style={styles.calculateButton}
                    onPress={handleCalculateMacros}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={styles.calculateButtonText}>Calculate My Macros</Text>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    contentContainer: {
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    unitToggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#f1f1f1',
        borderRadius: 10,
        marginBottom: 20,
    },
    unitToggleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
    },
    activeUnitToggle: {
        backgroundColor: '#19a28f',
    },
    inactiveUnitToggle: {
        backgroundColor: 'transparent',
    },
    activeUnitText: {
        color: 'white',
        fontWeight: 'bold',
    },
    inactiveUnitText: {
        color: '#666',
    },
    inputContainer: {
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        paddingHorizontal: 15,
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    unitText: {
        color: '#666',
        marginLeft: 10,
    },
    selectInput: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        height: 50,
        paddingHorizontal: 15,
    },
    selectInputText: {
        color: '#666',
        fontSize: 16,
    },
    dropdownIcon: {
        color: '#666',
        fontSize: 12,
    },
    selectorContainer: {
        marginBottom: 20,
    },
    sectionLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 10,
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    optionButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginHorizontal: 5,
    },
    selectedOption: {
        backgroundColor: '#19a28f',
        borderColor: '#19a28f',
    },
    optionIcon: {
        fontSize: 24,
        marginBottom: 5,
    },
    optionLabel: {
        fontSize: 14,
        color: '#333',
    },
    manualMacrosContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    manualMacrosLabel: {
        fontSize: 16,
        color: '#333',
    },
    toggleSwitch: {
        width: 50,
        height: 25,
        backgroundColor: '#ddd',
        borderRadius: 15,
        justifyContent: 'center',
    },
    toggleSwitchActive: {
        backgroundColor: '#19a28f',
    },
    toggleSwitchHandle: {
        width: 21,
        height: 21,
        borderRadius: 10.5,
        backgroundColor: 'white',
        alignSelf: 'flex-start',
        marginLeft: 2,
    },
    toggleSwitchHandleActive: {
        alignSelf: 'flex-end',
        marginRight: 2,
    },
    calculateButton: {
        backgroundColor: '#19a28f',
        borderRadius: 10,
        paddingVertical: 15,
        alignItems: 'center',
    },
    calculateButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});