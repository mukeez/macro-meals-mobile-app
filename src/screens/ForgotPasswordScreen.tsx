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
import AsyncStorage from '@react-native-async-storage/async-storage';
// Import the mock service instead of the real one
import { mockSocialAuth } from '../services/authMock';
import { OnboardingContext } from '../contexts/OnboardingContext';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import CustomTouchableOpacityButton from '../components/CustomTouchableOpacityButton';
import BackButton from '../components/BackButton';




type ForgotPasswordScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ForgotPasswordScreen'>;

export const ForgotPasswordScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { setIsOnboardingCompleted } = React.useContext(OnboardingContext);
    const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();

    const [errors, setErrors] = useState({
        email: '',
    });

    const isDisabled = () => {
        return isLoading || !email || !/\S+@\S+\.\S+/.test(email);
    }


        const handleForgotPassword = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter the email associated with your account');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.forgotPassword(email);
            console.log('response', response);
            navigation.navigate('VerificationScreen', { email: email });
        } catch (error) {
            Alert.alert(
                'Forgot Password Failed',
                error instanceof Error ? error.message : 'Invalid email. Please try again.',
                [{ text: 'OK' }]
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <CustomSafeAreaView className='flex-1 items-start justify-start' edges={['left', 'right']}>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
            <ScrollView className='flex-1 relative align-left p-6' contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-row items-center justify-start mb-3">
                    <BackButton onPress={() => navigation.goBack()}/>
                </View>
                <Text className="text-3xl font-medium text-black mb-2 text-">Forgot your password?</Text>
                <Text className="text-[18px] font-normal text-textMediumGrey mb-8 leading-7">Enter your email and we’ll send you a code to reset your password.</Text>

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
                        {errors.email ? <Text className='text-red-500 text-sm mt-2'>{errors.email}</Text> : null}
                    </View>
                    
                    
                    
                </View>
                <View className='absolute bottom-1 px-6 w-full'>
                    <View className='w-full items-center'>
                        <CustomTouchableOpacityButton           
                            className={`h-[56px] w-full items-center justify-center bg-primary rounded-[100px] ${isDisabled() ? 'opacity-30' : 'opacity-100'}`} 
                            title="Send code"
                            textClassName='text-white text-[17px] font-semibold'
                            disabled={isLoading || !email || !/\S+@\S+\.\S+/.test(email)} 
                            onPress={handleForgotPassword}
                            isLoading={isLoading}
                        />
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