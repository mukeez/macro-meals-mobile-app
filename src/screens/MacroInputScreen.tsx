import React, { useState, useEffect } from 'react';
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
    Alert,
} from 'react-native';
import { MacroDisplay } from '../components/MacroDisplay';
import { UserPreferences } from '../types';
import { mealService } from '../services/mealService';
import useStore from '../store/useStore';

// Try to import navigation, but don't fail if it's not available
let useNavigation: any;
let StackNavigationProp: any;
try {
    const navModule = require('@react-navigation/native');
    useNavigation = navModule.useNavigation;
} catch (error) {
    // Navigation module not available
}

type RootStackParamList = {
    MacroInput: undefined;
    MealList: { fromSearch: boolean };
};

type MacroInputScreenNavigationProp = any; // Simplified type to avoid errors

/**
 * Screen for inputting macro targets and location.
 */
export const MacroInputScreen: React.FC = () => {
    // Try to get navigation, but don't throw an error if not available
    let navigation;
    try {
        if (useNavigation) {
            navigation = useNavigation<MacroInputScreenNavigationProp>();
        }
    } catch (error) {
        // Navigation is not available
    }

    // Get state and actions from Zustand store
    const preferences = useStore((state) => state.preferences);
    const updatePreferences = useStore((state) => state.updatePreferences);
    const setIsLoadingSuggestions = useStore((state) => state.setIsLoadingSuggestions);
    const setSuggestedMeals = useStore((state) => state.setSuggestedMeals);
    const setSuggestionsError = useStore((state) => state.setSuggestionsError);

    // Local form state
    const [formValues, setFormValues] = useState<UserPreferences>({
        ...preferences,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Update local form if global preferences change
    useEffect(() => {
        setFormValues({
            ...preferences,
        });
    }, [preferences]);

    /**
     * Updates a specific field in the form.
     */
    const handleChange = (field: keyof UserPreferences, value: string) => {
        let parsedValue: string | number = value;

        // Convert numerical inputs to numbers
        if (field !== 'location') {
            parsedValue = value === '' ? 0 : Number(value);
        }

        setFormValues((prev) => ({
            ...prev,
            [field]: parsedValue,
        }));

        // Clear error for this field if it exists
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    /**
     * Validates the form before submission.
     */
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Check for required fields
        if (!formValues.location.trim()) {
            newErrors.location = 'Location is required';
        }

        // Check for valid macro values
        if (formValues.calories <= 0) {
            newErrors.calories = 'Calories must be greater than 0';
        }

        if (formValues.protein < 0) {
            newErrors.protein = 'Protein cannot be negative';
        }

        if (formValues.carbs < 0) {
            newErrors.carbs = 'Carbs cannot be negative';
        }

        if (formValues.fat < 0) {
            newErrors.fat = 'Fat cannot be negative';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    /**
     * Fetches meal suggestions based on user preferences
     */
    const fetchMealSuggestions = async () => {
        setIsLoading(true);
        setIsLoadingSuggestions(true);
        setSuggestionsError(null);

        try {
            // In a real app, use mealService.suggestMeals
            // For demo, using the mock service
            const suggestedMeals = await mealService.getMockMealSuggestions(formValues);
            setSuggestedMeals(suggestedMeals);
            return true;
        } catch (error) {
            setSuggestionsError('Failed to load meal suggestions. Please try again.');
            console.error('Error fetching meals:', error);
            return false;
        } finally {
            setIsLoading(false);
            setIsLoadingSuggestions(false);
        }
    };

    /**
     * Handles form submission and navigation to the meal list.
     */
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        // Update global preferences in Zustand store
        updatePreferences(formValues);

        // Fetch meal suggestions
        const success = await fetchMealSuggestions();

        if (success) {
            // Navigate if navigation is available, otherwise show alert
            if (navigation) {
                navigation.navigate('MealList', { fromSearch: true });
            } else {
                Alert.alert(
                    'Success',
                    'Preferences saved and meals fetched successfully!',
                    [{ text: 'OK' }]
                );
            }
        } else {
            Alert.alert(
                'Error',
                'Failed to get meal suggestions. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    /**
     * Renders an input field with label and error handling.
     */
    const renderInputField = (
        label: string,
        field: keyof UserPreferences,
        placeholder: string,
        keyboardType: 'default' | 'numeric' = 'default'
    ) => (
        <View style={styles.inputContainer}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, errors[field] && styles.inputError]}
                value={String(formValues[field])}
                onChangeText={(text) => handleChange(field, text)}
                placeholder={placeholder}
                keyboardType={keyboardType}
                returnKeyType="next"
            />
            {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
        </View>
    );

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Set Your Macro Goals</Text>

                {renderInputField('Calories', 'calories', 'Daily calorie target', 'numeric')}
                {renderInputField('Protein (g)', 'protein', 'Daily protein target', 'numeric')}
                {renderInputField('Carbs (g)', 'carbs', 'Daily carbohydrate target', 'numeric')}
                {renderInputField('Fat (g)', 'fat', 'Daily fat target', 'numeric')}
                {renderInputField('Location', 'location', 'Enter your location or zip code')}

                <View style={styles.previewContainer}>
                    <Text style={styles.previewTitle}>Your Macro Targets:</Text>
                    <MacroDisplay macros={formValues} showPercentages />
                </View>

                <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={styles.submitButtonText}>Find Meals</Text>
                    )}
                </TouchableOpacity>

                {/* Add bottom padding for safe area */}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    inputError: {
        borderColor: '#ff6b6b',
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 14,
        marginTop: 4,
    },
    previewContainer: {
        marginTop: 20,
        marginBottom: 20,
    },
    previewTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    submitButton: {
        backgroundColor: '#4a6da7',
        borderRadius: 10,
        padding: 16,
        alignItems: 'center',
        marginTop: 10,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
});