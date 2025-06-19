// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from 'react';
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
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { authService } from "../services/authService";
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import CustomTouchableOpacityButton from "../components/CustomTouchableOpacityButton";
import BackButton from "../components/BackButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";

type RootStackParamList = {
  ForgotPasswordScreen: { source: string };
  VerificationScreen: { email: string; source: string };
  ResetPassword: { email: string; session_token: string; source: string };
};

type VerificationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "VerificationScreen"
>;

export const VerificationScreen: React.FC = () => {

  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<VerificationScreenNavigationProp>();
  const route = useRoute<RouteProp<RootStackParamList, "VerificationScreen">>();
  const { email: routeEmail, source } = route.params;

  const [errors, setErrors] = useState({
    email: "",
  });

  const isDisabled = () => {
    return isLoading || !routeEmail || !/\S+@\S+\.\S+/.test(routeEmail);
  };

    const CELL_COUNT = 6;
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
    const [error, setError] = useState('');
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({
        value,
        setValue,
    });

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [countdown]);

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

    const handleResendCode = async () => {
        if (!canResend) return;
        
        setIsLoading(true);
        try {
            await authService.forgotPassword(routeEmail);
            setCountdown(60);
            setCanResend(false);
            Alert.alert('Success', 'Verification code has been resent');
        } catch (error) {
            Alert.alert('Error', error instanceof Error ? error.message : 'Failed to resend code');
        } finally {
            setIsLoading(false);
        }
    };
    try {
      const data = await authService.verifyCode(params);
      const session_token = data.session_token;
      if (session_token) {
        navigation.navigate("ResetPassword", {
          email: routeEmail,
          session_token,
          source,
        });
      } else {
        Alert.alert("Error", "Invalid verification code");
      }
    } catch (error) {
      Alert.alert(
        "Forgot Password Failed",
        error instanceof Error
          ? error.message
          : "Invalid email. Please try again.",
        [{ text: "OK" }]
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
            <View className='absolute flex-col bottom-10 px-6 w-full'>
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
            <View className="mt-2 items-center">
                {!canResend ? (
                    <Text className="text-textMediumGrey">
                        Resend code in {countdown}s
                    </Text>
                ) : (
                    <TouchableOpacity 
                        onPress={handleResendCode}
                        disabled={isLoading}
                    >
                        <Text className="text-primary font-semibold">
                            Resend code
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            </KeyboardAvoidingView>
        </CustomSafeAreaView>
    );
};

          <View className="w-full">
            <View className="mb-6">
              <CodeField
                ref={ref}
                {...props}
                value={value}
                onChangeText={setValue}
                cellCount={CELL_COUNT}
                rootStyle={{
                  marginTop: 20,
                  marginBottom: 20,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
                keyboardType="number-pad"
                renderCell={({ index, symbol, isFocused }) => (
                  <Text
                    key={index}
                    style={{
                      width: 50,
                      height: 56,
                      borderWidth: 2,
                      borderColor: isFocused ? "#19a28f" : "#ddd",
                      borderRadius: 4,
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: 24,
                      backgroundColor: "#fff",
                      textAlign: "center",
                      textAlignVertical: "center",
                      lineHeight: 56,
                    }}
                    onLayout={getCellOnLayoutHandler(index)}
                  >
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </Text>
                )}
              />
              {errors.email ? (
                <Text className="text-red-500 text-sm mt-2">
                  {errors.email}
                </Text>
              ) : null}
            </View>
          </View>
        </ScrollView>
        <View className="absolute bottom-5 px-6 w-full">
          <View className="w-full items-center">
            <CustomTouchableOpacityButton
              className={`h-[56px] w-full items-center justify-center bg-primary rounded-[100px] ${
                isDisabled() ? "opacity-30" : "opacity-100"
              }`}
              title="Send code"
              textClassName="text-white text-[17px] font-semibold"
              disabled={isDisabled()}
              onPress={handleVerifyCode}
              isLoading={isLoading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </CustomSafeAreaView>
  );
};