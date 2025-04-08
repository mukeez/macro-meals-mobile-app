// src/screens/LoginScreen.tsx
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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import useStore from '../store/useStore';
import { authService } from "../services/authService";
// Import the mock service instead of the real one
import { mockSocialAuth } from '../services/authMock';

type RootStackParamList = {
    Welcome: undefined;
    MacroInput: undefined;
    Login: undefined;
    SignUp: undefined;
};

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Get navigation if available
    let navigation;
    try {
        navigation = useNavigation<LoginScreenNavigationProp>();
    } catch (error) {
        console.log('Navigation not available');
    }

    // Set up auth state in your Zustand store
    const setAuthenticated = useStore((state) => state.setAuthenticated);

    const handleLogin = async () => {
        // Validate form
        if (!email || !password) {
            Alert.alert('Error', 'Please enter both email and password');
            return;
        }

        setIsLoading(true);

        try {
            const data = await authService.login({ email, password });
            console.log("hre")
            // Update authentication state in Zustand store
            setAuthenticated(true, data.token, data.user.id);

            // Navigate to the main screen
            if (navigation) {
                navigation.navigate('MacroInputScreen');
            }
        } catch (error) {
            Alert.alert(
                'Login Failed',
                error instanceof Error ? error.message : 'Invalid email or password. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setIsLoading(true);
            // Use the mock service
            const authData = await mockSocialAuth.googleSignIn();
            setAuthenticated(true, authData.token, authData.user.id);
            if (navigation) {
                navigation.navigate('MacroInput');
            }
        } catch (error) {
            console.error('Google login error:', error);
            Alert.alert('Login Failed', 'Google login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAppleLogin = async () => {
        try {
            setIsLoading(true);
            // Use the mock service
            const authData = await mockSocialAuth.appleSignIn();
            setAuthenticated(true, authData.token, authData.user.id);
            if (navigation) {
                navigation.navigate('MacroInput');
            }
        } catch (error) {
            console.error('Apple login error:', error);
            Alert.alert('Login Failed', 'Apple login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFacebookLogin = async () => {
        try {
            setIsLoading(true);
            // Use the mock service
            const authData = await mockSocialAuth.facebookSignIn();
            setAuthenticated(true, authData.token, authData.user.id);
            if (navigation) {
                navigation.navigate('MacroInput');
            }
        } catch (error) {
            console.error('Facebook login error:', error);
            Alert.alert('Login Failed', 'Facebook login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = () => {
        if (navigation) {
            navigation.navigate('SignupScreen');
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoBox}>
                        <Text style={styles.checkmark}>✓</Text>
                    </View>
                </View>

                <Text style={styles.welcomeTitle}>Welcome Back!</Text>
                <Text style={styles.welcomeSubtitle}>Track your nutrition journey with MacroMeals</Text>

                <View style={styles.formContainer}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <View style={styles.inputContainer}>
                        <View style={styles.inputIconContainer}>
                            <Text style={styles.inputIcon}>✉️</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />
                    </View>

                    <Text style={styles.inputLabel}>Password</Text>
                    <View style={styles.inputContainer}>
                        <View style={styles.inputIconContainer}>
                            <Text style={styles.inputIcon}>❓</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity
                            style={styles.eyeIconContainer}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Text style={styles.eyeIcon}>👁️</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.rememberForgotContainer}>
                        <TouchableOpacity
                            style={styles.rememberContainer}
                            onPress={() => setRememberMe(!rememberMe)}
                        >
                            <View style={[
                                styles.checkbox,
                                rememberMe && styles.checkboxChecked
                            ]}>
                                {rememberMe && <Text style={styles.checkboxCheck}>✓</Text>}
                            </View>
                            <Text style={styles.rememberText}>Remember me</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.forgotContainer}>
                            <Text style={styles.forgotText}>Forgot Password?</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" size="small" />
                        ) : (
                            <Text style={styles.loginButtonText}>Login</Text>
                        )}
                    </TouchableOpacity>

                    <Text style={styles.orText}>Or continue with</Text>

                    <View style={styles.socialContainer}>
                        <TouchableOpacity style={styles.socialButton} onPress={handleGoogleLogin}>
                            <Text style={styles.socialIcon}>G</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton} onPress={handleAppleLogin}>
                            <Text style={styles.socialIcon}>🍎</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.socialButton} onPress={handleFacebookLogin}>
                            <Text style={styles.socialIcon}>f</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.signupContainer}>
                        <Text style={styles.noAccountText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={handleSignUp}>
                            <Text style={styles.signupText}>Sign up</Text>
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
        padding: 24,
        alignItems: 'center',
    },
    logoContainer: {
        marginTop: 40,
        marginBottom: 20,
        alignItems: 'center',
    },
    logoBox: {
        width: 70,
        height: 70,
        backgroundColor: '#19a28f',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
    },
    welcomeTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#19a28f',
        marginBottom: 10,
    },
    welcomeSubtitle: {
        fontSize: 16,
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
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
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
        height: 48,
        fontSize: 16,
    },
    eyeIconContainer: {
        padding: 12,
    },
    eyeIcon: {
        fontSize: 18,
        color: '#999',
    },
    rememberForgotContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    rememberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#19a28f',
        borderColor: '#19a28f',
    },
    checkboxCheck: {
        color: 'white',
        fontSize: 14,
        fontWeight: 'bold',
    },
    rememberText: {
        fontSize: 14,
        color: '#333',
    },
    forgotContainer: {},
    forgotText: {
        fontSize: 14,
        color: '#19a28f',
        fontWeight: '500',
    },
    loginButton: {
        backgroundColor: '#19a28f',
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 24,
    },
    loginButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    orText: {
        textAlign: 'center',
        color: '#666',
        marginBottom: 20,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginBottom: 30,
    },
    socialButton: {
        width: 60,
        height: 48,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    socialIcon: {
        fontSize: 20,
        color: '#333',
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    noAccountText: {
        fontSize: 16,
        color: '#666',
    },
    signupText: {
        fontSize: 16,
        color: '#19a28f',
        fontWeight: 'bold',
    },
});