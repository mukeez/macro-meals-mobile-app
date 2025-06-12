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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useStore from '../store/useStore';
import { authService } from '../services/authService';
import CustomSafeAreaView  from '../components/CustomSafeAreaView';
import BackButton from '../components/BackButton';
import CustomTouchableOpacityButton from '../components/CustomTouchableOpacityButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types/navigation';
import { MaterialIcons } from '@expo/vector-icons';




type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;

export const ResetPasswordScreen: React.FC = () => {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const route = useRoute<RouteProp<RootStackParamList, 'ResetPassword'>>();
    const { email: routeEmail, session_token : routeSessionToken } = route.params;
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({ password: '', confirmPassword: '' });
    const [isValid, setIsValid] = useState(false);
    const [touched, setTouched] = useState({ password: false, confirmPassword: false });
    const setAuthenticated = useStore((state) => state.setAuthenticated);
    const navigation = useNavigation<NavigationProp>();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // Validation logic
    React.useEffect(() => {
        let valid = true;
        const newErrors = { password: '', confirmPassword: '' };
        if (!password) {
            newErrors.password = 'Password is required';
            valid = false;
        } else if (password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            valid = false;
        }
        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            valid = false;
        } else if (confirmPassword !== password) {
            newErrors.confirmPassword = 'Passwords do not match';
            valid = false;
        }
        setErrors(newErrors);
        setIsValid(valid);
    }, [password, confirmPassword]);

    const handleResetPassword = async () => {
        setIsLoading(true);
        const resetPasswordData = {
            email: routeEmail,
            session_token: routeSessionToken,
            new_password: password
        }
        try {
            const response = await authService.resetPassword(resetPasswordData);
            console.log('response', response);
            navigation.navigate('LoginScreen');
        } catch (error) {
            console.error('Password reset error:', error);
            Alert.alert('Error', 'Failed to reset password: ' + error);
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
                        <BackButton onPress={() => navigation.goBack()}/>
                    </View>
                <Text className="text-3xl font-medium text-black mb-2 text-left">Reset your password</Text>
                <View className='mt-5'>
                    <View className="relative mb-2" style={[touched.password && errors.password ? styles.inputError : null]}>
                        <TextInput
                            className="border border-lightGrey text-base rounded-md pl-4 font-normal text-black h-[68px]"
                            placeholder="Create password"
                            value={password}
                            onChangeText={text => {
                                setPassword(text);
                                if (!touched.password) setTouched(t => ({ ...t, password: true }));
                            }}
                            secureTextEntry={!showPassword}
                        />
                        <MaterialIcons className='absolute right-4 top-1/2 -translate-y-1/2' name={isPasswordVisible ? 'visibility' : 'visibility-off'} size={24} color='#000' onPress={togglePasswordVisibility} />
                    </View>
                    {touched.password && errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
                </View>
                <View className='mb-4' style={[touched.password && errors.password ? styles.inputError : null]}></View>
                <View className='relative mb-2' style={[touched.confirmPassword && errors.confirmPassword ? styles.inputError : null]}>
                    <TextInput 
                        className='border border-lightGrey text-base rounded-md pl-4 font-normal text-black h-[68px]' 
                        placeholder='Confirm password' 
                        value={confirmPassword} 
                        onChangeText={text => {
                            setConfirmPassword(text);
                            if (!touched.confirmPassword) setTouched(t => ({ ...t, confirmPassword: true }));
                        }} 
                        secureTextEntry={!showConfirmPassword} 
                    />
                    <MaterialIcons className='absolute right-4 top-1/2 -translate-y-1/2' name={isPasswordVisible ? 'visibility' : 'visibility-off'} size={24} color='#000' onPress={toggleConfirmPasswordVisibility} />
                </View>
                {touched.confirmPassword && errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
                {/* Password hint with checkmark */}
                <View className='flex-row items-center justify-start mt-2 w-full'>
                    <View className={`w-[20px] h-[20px] rounded-full justify-center items-center mr-2 ${password.length >= 8 ? 'bg-primary' : 'bg-lightGrey'}`}>
                        <MaterialIcons name="check" size={16} color='white' />
                    </View> 
                    <Text className='text-sm font-normal text-textMediumGrey'>Password must be at least 8 characters</Text>
                </View>
                
                <View style={styles.bottomContainer}>
                    <View style={styles.buttonWrapper}>
                        <CustomTouchableOpacityButton 
                            className='h-[56px] w-full items-center justify-center bg-primary rounded-[100px]' 
                            title="Save password"
                            textClassName='text-white text-[17px] font-semibold'
                            disabled={isLoading || !isValid} 
                            onPress={handleResetPassword}
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