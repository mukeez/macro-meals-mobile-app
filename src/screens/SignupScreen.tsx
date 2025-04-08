// src/screens/SignupScreen.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import useStore from '../store/useStore';
import { authService } from '../services/authService';

type RootStackParamList = {
    Welcome: undefined;
    MacroInput: undefined;
    Login: undefined;
    SignUp: undefined;
};

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

export const SignupScreen: React.FC = () => {
    // Form state
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Error states
    const [errors, setErrors] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        terms: '',
    });

    // Get navigation if available
    let navigation;
    try {
        navigation = useNavigation<SignupScreenNavigationProp>();
    } catch (error) {
        console.log('Navigation not available');
    }

    // Set up auth state from Zustand store
    const setAuthenticated = useStore((state) => state.setAuthenticated);

    // Validate form
    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            email: '',
            password: '',
            confirmPassword: '',
            terms: '',
        };

        // Email validation
        if (!email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
            isValid = false;
        }

        // Password validation
        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        // Confirm password validation
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            isValid = false;
        } else if (confirmPassword !== password) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        // Terms agreement validation
        if (!agreedToTerms) {
            newErrors.terms = 'You must agree to the Terms of Service and Privacy Policy';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    // Handle signup
    const handleSignup = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            // Use the authService.signup method
            const data = await authService.signup({
                email,
                password
            });

            // Update authentication state
            setAuthenticated(true, data.token, data.user.id);

            // Navigate to next screen
            if (navigation) {
                navigation.navigate('MacroInput');
            }
        } catch (error) {
            let errorMessage = 'Failed to create account';

            // Check if error is about email already in use
            if (error instanceof Error && error.message.includes('email')) {
                errorMessage = 'This email is already registered. Please use a different email or log in.';
            }

            Alert.alert('Signup Failed', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle login navigation
    const handleLoginNavigation = () => {
        if (navigation) {
            navigation.navigate('Login');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoBox}>
                        <Image
                            source={require('../../assets/fork-knife.png')}
                            style={styles.logoIcon}
                            resizeMode="contain"
                        />
                    </View>
                </View>

                {/* Header */}
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join MacroMate today</Text>

                <View style={styles.formContainer}>
                    {/* Email Input */}
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={[styles.inputContainer, errors.email ? styles.inputError : null]}>
                        <View style={styles.inputIconContainer}>
                            <Text style={styles.inputIcon}>✉️</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="your@email.com"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (errors.email) {
                                    setErrors(prev => ({ ...prev, email: '' }));
                                }
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>
                    {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

                    {/* Password Input */}
                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={[styles.inputContainer, errors.password ? styles.inputError : null]}>
                        <View style={styles.inputIconContainer}>
                            <Text style={styles.inputIcon}>🔑</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) {
                                    setErrors(prev => ({ ...prev, password: '' }));
                                }
                            }}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIconContainer}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Text style={styles.eyeIcon}>👁️</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.passwordHint}>Must be at least 6 characters</Text>
                    {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

                    {/* Confirm Password Input */}
                    <Text style={styles.inputLabel}>Confirm Password</Text>
                    <View style={[styles.inputContainer, errors.confirmPassword ? styles.inputError : null]}>
                        <View style={styles.inputIconContainer}>
                            <Text style={styles.inputIcon}>🔑</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChangeText={(text) => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword) {
                                    setErrors(prev => ({ ...prev, confirmPassword: '' }));
                                }
                            }}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIconContainer}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Text style={styles.eyeIcon}>👁️</Text>
                        </TouchableOpacity>
                    </View>
                    {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}

                    {/* Terms and Conditions Checkbox */}
                    <View style={styles.checkboxContainer}>
                        <TouchableOpacity
                            style={styles.checkboxWrapper}
                            onPress={() => {
                                setAgreedToTerms(!agreedToTerms);
                                if (errors.terms) {
                                    setErrors(prev => ({ ...prev, terms: '' }));
                                }
                            }}
                        >
                            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
                                {agreedToTerms && <Text style={styles.checkboxCheck}>✓</Text>}
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.termsText}>
                            I agree to the{' '}
                            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                            <Text style={styles.termsLink}>Privacy Policy</Text>
                        </Text>
                    </View>
                    {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}

                    {/* Signup Button */}
                    <TouchableOpacity
                        style={[
                            styles.signupButton,
                            (!email || !password || !confirmPassword || !agreedToTerms) && styles.buttonDisabled
                        ]}
                        onPress={handleSignup}
                        disabled={isLoading || !email || !password || !confirmPassword || !agreedToTerms}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text style={styles.signupButtonText}>Create Account</Text>
                        )}
                    </TouchableOpacity>

                    {/* Login Link */}
                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={handleLoginNavigation}>
                            <Text style={styles.loginLink}>Log in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 40,
        paddingBottom: 24,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoBox: {
        width: 80,
        height: 80,
        backgroundColor: '#08a489',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoIcon: {
        width: 40,
        height: 40,
        tintColor: 'white',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#202030',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginBottom: 40,
    },
    formContainer: {
        width: '100%',
    },
    inputLabel: {
        fontSize: 16,
        color: '#333',
        marginBottom: 8,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 12,
        marginBottom: 8,
        backgroundColor: '#f9f9f9',
    },
    inputError: {
        borderColor: '#ff6b6b',
    },
    inputIconContainer: {
        padding: 12,
    },
    inputIcon: {
        fontSize: 18,
        color: '#999',
    },
    input: {
        flex: 1,
        height: 50,
        fontSize: 16,
    },
    eyeIconContainer: {
        padding: 12,
    },
    eyeIcon: {
        fontSize: 18,
        color: '#999',
    },
    passwordHint: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        marginTop: 4,
    },
    errorText: {
        color: '#ff6b6b',
        fontSize: 14,
        marginBottom: 12,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 20,
    },
    checkboxWrapper: {
        marginRight: 10,
        marginTop: 2,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#08a489',
        borderColor: '#08a489',
    },
    checkboxCheck: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    termsText: {
        fontSize: 15,
        color: '#333',
        flex: 1,
    },
    termsLink: {
        color: '#08a489',
        fontWeight: '500',
    },
    signupButton: {
        backgroundColor: '#08a489',
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 24,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    signupButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    loginText: {
        fontSize: 16,
        color: '#666',
    },
    loginLink: {
        fontSize: 16,
        color: '#08a489',
        fontWeight: 'bold',
    },
});