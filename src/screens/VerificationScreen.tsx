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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { authService } from "../services/authService";
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import CustomTouchableOpacityButton from '../components/CustomTouchableOpacityButton';
import BackButton from '../components/BackButton';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { CodeField, Cursor, useBlurOnFulfill, useClearByFocusCell } from 'react-native-confirmation-code-field';

type VerificationScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'VerificationScreen'>;

export const VerificationScreen: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigation = useNavigation<VerificationScreenNavigationProp>();
    const route = useRoute<RouteProp<RootStackParamList, 'VerificationScreen'>>();
    const { email: routeEmail } = route.params;

    const [errors, setErrors] = useState({
        email: '',
    });

    const isDisabled = () => {
        return isLoading || !routeEmail || !/\S+@\S+\.\S+/.test(routeEmail);
    }

    const CELL_COUNT = 6;
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
    const [error, setError] = useState('');
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    const handleVerifyCode = async () => {
        if (!routeEmail) {
            Alert.alert('Error', 'Please enter the email associated with your account');
            return;
        }

        setIsLoading(true);
        const params = {
            email: routeEmail,
            otp: value,
        }
        console.log('The verification params are', value);
        try {
            const data = await authService.verifyCode(params);
            console.log('data', data);
            const session_token = data.session_token;
            console.log('The session token is', session_token);
            if (session_token) {
                navigation.navigate('ResetPassword', { email: routeEmail, session_token: session_token });
            } else {
                Alert.alert('Error', 'Invalid verification code');
            }
        } catch (error) {
            setError(error instanceof Error ?  `${error.message}: Code does not exist. Please try again` : 'Code does not exist. Please try again');
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
            <ScrollView className='flex-1 relative align-left p-6'>
                <View className="flex-row items-center justify-start mb-3">
                    <BackButton onPress={() => navigation.goBack()}/>
                </View>
                <Text className="text-3xl font-medium text-black mb-2 text-">Enter verification code</Text>
                <Text className="text-[18px] font-normal text-textMediumGrey mb-8 leading-7">We've sent a 6-digit code to {routeEmail}</Text>

                <View style={styles.formContainer}>
                    <View className="flex-col">  
                        <CodeField
                            ref={ref}
                            {...props}
                            value={value}
                            onChangeText={setValue}
                            cellCount={CELL_COUNT}
                            rootStyle={styles.codeFieldRoot}
                            keyboardType="number-pad"
                            renderCell={({ index, symbol, isFocused }) => (
                                <Text
                                    key={index}
                                    style={[styles.cell, isFocused && styles.focusCell]}
                                    onLayout={getCellOnLayoutHandler(index)}>
                                    {symbol || (isFocused ? <Cursor /> : null)}
                                </Text>
                            )}
                        />
                        {error ? <Text className='text-red-500 text-sm'>{error}</Text> : null}
                    </View>
                </View>
            </ScrollView>
            <View className='absolute flex-col bottom-5 px-6 w-full'>
                    <View className='w-full items-center'>
                        <CustomTouchableOpacityButton           
                            className={`h-[56px] w-full items-center justify-center bg-primary rounded-[100px] ${isDisabled() ? 'opacity-30' : 'opacity-100'}`} 
                            title="Verify code"
                            textClassName='text-white text-[17px] font-semibold'
                            disabled={isLoading || !routeEmail || !/\S+@\S+\.\S+/.test(routeEmail)} 
                            onPress={handleVerifyCode}
                            isLoading={isLoading}
                        />
                    </View>
                </View>
                <View className='items-center justify-center px-6 mt-4'>
                        <Text className="text-[17px] text-center text-gray-600 flex-wrap">
                            By signing up, you agree to our{' '}
                            <Text 
                                className="text-base text-primary font-medium"
                                onPress={() => handleResendCode()}
                            >
                                Terms of Service and Privacy Policy
                            </Text>
                        </Text>
                    </View>
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
        justifyContent: 'center',
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
    codeFieldRoot: {
        marginTop: 20,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cell: {
        width: 50,
        height: 56,
        borderWidth: 2,
        borderColor: '#ddd',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        fontSize: 24,
        backgroundColor: '#fff',
        textAlign: 'center',
        textAlignVertical: 'center',
        lineHeight: 56,
    },
    focusCell: {
        borderColor: '#19a28f',
    },
});