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
import { authService } from '../services/authService';
import CustomSafeAreaView  from '../components/CustomSafeAreaView';
import { useMixpanel }  from '@macro-meals/mixpanel';


type RootStackParamList = {
    Welcome: undefined;
    MacroInput: undefined;
    Login: undefined;
    SignUp: undefined;
};

type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SignUp'>;

export const SignupScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const mixpanel = useMixpanel();

    const [errors, setErrors] = useState({
        email: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        terms: '',
    });

    let navigation;
    try {
        navigation = useNavigation<SignupScreenNavigationProp>();
    } catch (error) {
        console.log('Navigation not available');
    }

    const setAuthenticated = useStore((state) => state.setAuthenticated);

    const validateForm = () => {
        let isValid = true;
        const newErrors = {
            email: '',
            nickname: '',
            password: '',
            confirmPassword: '',
            terms: '',
        };

        if (!email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = 'Email is invalid';
            isValid = false;
        }

        if (nickname && nickname.length > 30) {
            newErrors.nickname = 'Nickname must be less than 30 characters';
            isValid = false;
        }

        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            isValid = false;
        } else if (confirmPassword !== password) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        if (!agreedToTerms) {
            newErrors.terms = 'You must agree to the Terms of Service and Privacy Policy';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSignup = async () => {
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);

        try {
            const signUpTime = new Date().toISOString();
            const userId = await authService.signup({
                email,
                password,
                nickname
            });
            mixpanel.identify(userId);
            mixpanel.track({
                name: 'user_signed_up',
                properties:{
                    signup_method: "email",
                    platform: Platform.OS,
                    signup_time: signUpTime,
                }

            })
            mixpanel.register({signup_time: signUpTime});
            setAuthenticated(true, '', userId);

            if (navigation) {
                navigation.navigate('MacroInput');
            }
        } catch (error) {
            console.error('Signup error:', error);

            let errorMessage = 'Failed to create account';

            if (error instanceof Error) {
                if (error.message.includes('email')) {
                    errorMessage = 'This email is already registered. Please use a different email or log in.';
                } else {
                    errorMessage = error.message;
                }
            }

            Alert.alert('Signup Failed', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CustomSafeAreaView edges={['left', 'right']}>
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

                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join MacroMate today</Text>

                <View style={styles.formContainer}>
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

                    <Text style={styles.inputLabel}>Nickname (optional)</Text>
                    <View style={[styles.inputContainer, errors.nickname ? styles.inputError : null]}>
                        <View style={styles.inputIconContainer}>
                            <Text style={styles.inputIcon}>👤</Text>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="How we should call you"
                            value={nickname}
                            onChangeText={(text) => {
                                setNickname(text);
                                if (errors.nickname) {
                                    setErrors(prev => ({ ...prev, nickname: '' }));
                                }
                            }}
                            autoCorrect={false}
                        />
                    </View>
                    {errors.nickname ? <Text style={styles.errorText}>{errors.nickname}</Text> : null}

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

                    <View style={styles.loginContainer}>
                        <Text style={styles.loginText}>Already have an account? </Text>
                        <TouchableOpacity onPress={() => navigation?.navigate('LoginScreen')}>
                            <Text style={styles.loginLink}>Log in</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
        </CustomSafeAreaView>
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
        paddingTop: 0,
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
    checkmark: {
        color: 'white',
        fontSize: 36,
        fontWeight: 'bold',
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