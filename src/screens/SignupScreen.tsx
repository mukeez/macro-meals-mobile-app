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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useStore from '../store/useStore';
import { authService } from '../services/authService';
import CustomSafeAreaView  from '../components/CustomSafeAreaView';
import BackButton from '../components/BackButton';
import CustomTouchableOpacityButton from '../components/CustomTouchableOpacityButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { RootStackParamList } from '../types/navigation';
import { useMixpanel } from '@macro-meals/mixpanel';


type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignupScreen'>;

export const SignupScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    // const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const mixpanel = useMixpanel();

    const [errors, setErrors] = useState({
        email: '',
        nickname: '',
        password: '',
        confirmPassword: '',
        terms: '',
    });

    const setAuthenticated = useStore((state) => state.setAuthenticated);
    const navigation = useNavigation<NavigationProp>();

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

        // if (nickname && nickname.length > 30) {
        //     newErrors.nickname = 'Nickname must be less than 30 characters';
        //     isValid = false;
        // }

        if (!password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 6 characters';
            isValid = false;
        }

        // if (!confirmPassword) {
        //     newErrors.confirmPassword = 'Please confirm your password';
        //     isValid = false;
        // } else if (confirmPassword !== password) {
        //     newErrors.confirmPassword = 'Passwords do not match';
        //     isValid = false;
        // }

        // if (!agreedToTerms) {
        //     newErrors.terms = 'You must agree to the Terms of Service and Privacy Policy';
        //     isValid = false;
        // }

        setErrors(newErrors);
        return isValid;
    };

    const handleSignup = async () => {
        if (!validateForm()) {
            console.log('Invalid form');
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
            if (mixpanel) {
                mixpanel.identify(userId);
                mixpanel.track({
                    name: 'user_signed_up',
                    properties:{
                        signup_method: "email",
                        platform: Platform.OS,
                        signup_time: signUpTime,
                    }
                });
                mixpanel.register({signup_time: signUpTime});
            }
            // setAuthenticated(true, '', userId);
            const data = await authService.login({ email, password });
            console.log('Login successful, setting authenticated state');
            setAuthenticated(true, data.access_token, data.user.id);
            console.log('Auth state updated, token:', data.access_token);
            await AsyncStorage.setItem('my_token', data.access_token);
            console.log('Token saved to AsyncStorage');
            
            // Add this to check if the state was actually updated
            const isAuth = useStore.getState().isAuthenticated;
            console.log('Current auth state after update:', isAuth);
            navigation.navigate('Dashboard');

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
        <CustomSafeAreaView className='flex-1' edges={['left', 'right']}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View className="flex-row items-center justify-start mb-3">
                        <BackButton onPress={() => navigation.navigate('LoginScreen')}/>
                    </View>

                <Text className="text-3xl font-medium text-black mb-2 text-left">Begin Macro Tracking</Text>
                <Text className="text-[18px] font-normal text-textMediumGrey mb-8 leading-7">Enter your details to set up your account and start your tracking journey.</Text>

                <View style={styles.formContainer}>
                    <View className="mb-6" style={[errors.email ? styles.inputError : null]}>
                        
                        <TextInput
                            className="border border-lightGrey text-base rounded-md pl-4 font-normal text-black h-[68px]"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                // Validate email on change
                                if (!text) {
                                    setErrors(prev => ({ ...prev, email: 'Email is required' }));
                                } else if (!/\S+@\S+\.\S+/.test(text)) {
                                    setErrors(prev => ({ ...prev, email: 'Email is invalid' }));
                                } else {
                                    setErrors(prev => ({ ...prev, email: '' }));
                                }
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            textContentType="emailAddress"
                            spellCheck={false}
                            autoComplete="email"
                        />
                    </View>
                    {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}


                    <View className="relative mb-4" style={[errors.password ? styles.inputError : null]}>
                        
                        <TextInput
                            className="border border-lightGrey text-base rounded-md pl-4 font-normal text-black h-[68px]"
                            placeholder="Create password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) {
                                    setErrors(prev => ({ ...prev, password: '' }));
                                }
                            }}
                            secureTextEntry={!showPassword}
                        />
                        <MaterialIcons className='absolute right-4 top-1/2 -translate-y-1/2' name={isPasswordVisible ? 'visibility' : 'visibility-off'} size={24} color='#000' onPress={togglePasswordVisibility} />
                    </View>
                    {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                    <View className='flex-row items-center justify-start mt-2 w-full'>
                        <View className={`w-[20px] h-[20px] rounded-full justify-center items-center mr-2 ${password.length >= 8 ? 'bg-primary' : 'bg-lightGrey'}`}>
                            <MaterialIcons name="check" size={16} color='white' />
                        </View> 
                        <Text className='text-sm font-normal text-textMediumGrey'>Password must be at least 8 characters</Text>
                    </View>
                    


                
                    {errors.terms ? <Text style={styles.errorText}>{errors.terms}</Text> : null}
                   

                    {/* <TouchableOpacity
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
                    </TouchableOpacity> */}

                    
                </View>
                <View style={styles.bottomContainer}>
                    <View style={styles.buttonWrapper}>
                        <CustomTouchableOpacityButton 
                            className='h-[56px] w-full items-center justify-center bg-primary rounded-[100px]' 
                            title="Sign up"
                            textClassName='text-white text-[17px] font-semibold'
                            disabled={isLoading || !email || !password || password.length < 8 || !/\S+@\S+\.\S+/.test(email)} 
                            onPress={handleSignup}
                            isLoading={isLoading}
                        />
                    </View>
                    <View className='items-center justify-center px-6 mt-4'>
                        <Text className="text-[17px] text-center text-gray-600 flex-wrap">
                            By signing up, you agree to our{' '}
                            <Text 
                                className="text-base text-primary font-medium"
                                onPress={() => navigation.navigate('TermsAndConditions')}
                            >
                                Terms of Service and Privacy Policy
                            </Text>
                        </Text>
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
    bottomContainer: {
        position: 'absolute',
        bottom: 10,
        left: 0,
        right: 0,
        paddingHorizontal: 16,
    },
    buttonWrapper: {
        width: '100%',
        alignItems: 'center',
    },
});