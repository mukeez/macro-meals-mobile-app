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
    Modal,
} from 'react-native';
import { MacroDisplay } from '../components/MacroDisplay';
import { UserPreferences } from '../types';
import { mealService } from '../services/mealService';
import useStore from '../store/useStore';
import { macroCalculationService } from "../services/macroCalculationService";
import { useNavigation } from '@react-navigation/native';

export const MacroInputScreen: React.FC = () => {
    // Get state and actions from Zustand store
    const preferences = useStore((state) => state.preferences);
    const updatePreferences = useStore((state) => state.updatePreferences);
    const setIsLoadingSuggestions = useStore((state) => state.setIsLoadingSuggestions);
    const setSuggestedMeals = useStore((state) => state.setSuggestedMeals);
    const setSuggestionsError = useStore((state) => state.setSuggestionsError);

    // Try to get navigation if available
    let navigation;
    try {
        navigation = useNavigation();
    } catch (error) {
        console.log('Navigation not available');
    }

    // Local state for form
    const [unit, setUnit] = useState<'Metric' | 'Imperial'>('Metric');
    const [age, setAge] = useState(preferences.age ? preferences.age.toString() : '');
    const [weight, setWeight] = useState(preferences.weight ? preferences.weight.toString() : '');
    const [height, setHeight] = useState(preferences.height ? preferences.height.toString() : '');
    const [sex, setSex] = useState(preferences.gender || '');
    const [showSexDropdown, setShowSexDropdown] = useState(false);
    const [activityLevel, setActivityLevel] = useState(preferences.activityLevel || '');
    const [goal, setGoal] = useState(preferences.goal || '');
    const [manualMacros, setManualMacros] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Sex options for dropdown
    const sexOptions = ['Male', 'Female'];

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
        if (!age || !weight || !height || !sex || !activityLevel || !goal) {
            alert('Please fill in all fields');
            return;
        }

        setIsLoading(true);

        try {
            // Call the backend API to calculate accurate macros
            const calculatedMacros = await macroCalculationService.calculateMacros({
                age: parseInt(age),
                weight: parseFloat(weight),
                height: parseFloat(height),
                sex, // "Male" or "Female" from our dropdown
                activityLevel,
                goal,
                unitSystem: unit,
            });

            // Create a complete user preferences object with all needed fields
            const calculatedPreferences: UserPreferences = {
                ...calculatedMacros,
                location: preferences.location || '',
            };

            // Update global preferences
            updatePreferences(calculatedPreferences);

            // Set loading state for meal suggestions
            setIsLoadingSuggestions(true);

            try {
                // Fetch meal suggestions
                const suggestedMeals = await mealService.getMockMealSuggestions(calculatedPreferences);
                setSuggestedMeals(suggestedMeals);

                // Navigate to meal list if navigation is available
                navigation?.navigate('MealList', { fromCalculator: true });
            } catch (error) {
                console.error('Error fetching meal suggestions:', error);
                setSuggestionsError('Failed to fetch meal suggestions. Please try again.');
            } finally {
                setIsLoadingSuggestions(false);
            }
        } catch (error) {
            console.error('Error calculating macros:', error);
            alert('Could not calculate macros. Please check your connection and try again.');
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

    // Render sex select dropdown
    const renderSexSelect = () => (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Sex</Text>
            <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setShowSexDropdown(true)}
            >
                <Text style={styles.selectInputText}>
                    {sex || 'Select'}
                </Text>
                <Text style={styles.dropdownIcon}>▼</Text>
            </TouchableOpacity>

            {/* Sex Selection Modal */}
            <Modal
                visible={showSexDropdown}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowSexDropdown(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSexDropdown(false)}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Select Sex</Text>
                            {sexOptions.map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.optionItem}
                                    onPress={() => {
                                        setSex(option);
                                        setShowSexDropdown(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        sex === option && styles.selectedOptionText
                                    ]}>
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
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

                {renderSexSelect()}
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
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    modalContent: {
        alignItems: 'stretch',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
        color: '#333',
    },
    optionItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
    },
    selectedOptionText: {
        color: '#19a28f',
        fontWeight: 'bold',
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