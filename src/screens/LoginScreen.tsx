// src/screens/LoginScreen.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import useStore from "../store/useStore";
import { authService } from "../services/authService";
import AsyncStorage from "@react-native-async-storage/async-storage";
// Import the mock service instead of the real one
import { mockSocialAuth } from "../services/authMock";
import { OnboardingContext } from "../contexts/OnboardingContext";
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import CustomTouchableOpacityButton from "../components/CustomTouchableOpacityButton";
import BackButton from "../components/BackButton";
import { RootStackParamList } from "../types/navigation";
import { MaterialIcons } from "@expo/vector-icons";
import { userService } from "../services/userService";
import { HasMacrosContext } from "src/contexts/HasMacrosContext";
import { useGoalsFlowStore } from "../store/goalsFlowStore";
import { useMixpanel } from "@macro-meals/mixpanel";
import { IsProContext } from "src/contexts/IsProContext";
// import { macroMealsCrashlytics } from '@macro-meals/crashlytics';

// type RootStackParamList = {
//     Welcome: undefined;
//     MacroInput: undefined;
//     Login: undefined;
//     SignupScreen: undefined;
//     Dashboard: undefined;
// };

type LoginScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "Login"
>;

export const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { setIsOnboardingCompleted } = React.useContext(OnboardingContext);
  const { hasMacros, setHasMacros, setReadyForDashboard, readyForDashboard } =
    React.useContext(HasMacrosContext);
  const { setIsPro, isPro } = React.useContext(IsProContext);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const resetSteps = useGoalsFlowStore((state) => state.resetSteps);
  const mixpanel = useMixpanel();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  // Set up auth state in your Zustand store
  const setAuthenticated = useStore((state) => state.setAuthenticated);

  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log("🔍 LoginScreen - State changed:", {
      hasMacros,
      isPro,
      readyForDashboard,
      isAuthenticated: useStore.getState().isAuthenticated
    });
  }, [hasMacros, isPro, readyForDashboard]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setIsLoading(true);

    try {
      // First get login data
      const loginData = await authService.login({ email, password });

      // Store token temporarily for profile fetch
      const token = loginData.access_token;
      const userId = loginData.user.id;

      // Store tokens first so axios interceptor can use them
      await Promise.all([
        AsyncStorage.setItem("my_token", token),
        AsyncStorage.setItem("refresh_token", loginData.refresh_token),
        AsyncStorage.setItem("user_id", userId),
        AsyncStorage.setItem("isOnboardingCompleted", "true"),
      ]);

      console.log("Tokens stored successfully:", {
        hasAccessToken: !!token,
        hasRefreshToken: !!loginData.refresh_token,
        userId: userId,
      });

      // Then get profile using the stored token
      const profile = await userService.getProfile();
      console.log("🔍 LoginScreen - Profile received:", {
        has_macros: profile.has_macros,
        is_pro: profile.is_pro,
        email: profile.email,
        id: profile.id
      });

      // Reset steps before setting other states
      resetSteps();

      // Set all state in the correct order - batch them together
      console.log("🔍 LoginScreen - Setting states:", {
        hasMacros: profile.has_macros,
        isPro: profile.is_pro,
        readyForDashboard: profile.has_macros
      });
      
      // Set all states together to ensure they're synchronized
      setIsOnboardingCompleted(true);
      setHasMacros(profile.has_macros);
      setIsPro(profile.is_pro);
      setReadyForDashboard(profile.has_macros);

      console.log("🔍 LoginScreen - Immediately after setting states:", {
        profileHasMacros: profile.has_macros,
        profileIsPro: profile.is_pro,
        settingHasMacros: profile.has_macros,
        settingIsPro: profile.is_pro,
        settingReadyForDashboard: profile.has_macros
      });

      // Debug: Check context values after a short delay
      setTimeout(() => {
        console.log("🔍 LoginScreen - Context values after setting:", {
          hasMacros,
          isPro,
          readyForDashboard,
          profileHasMacros: profile.has_macros,
          profileIsPro: profile.is_pro
        });
      }, 50);

      // Identify user in Mixpanel
      mixpanel?.identify(userId);
      mixpanel?.setUserProperties({
        email: profile.email || email,
        name: profile.display_name || profile.first_name,
        signup_date: profile.created_at || new Date().toISOString(),
        has_macros: profile.has_macros,
        is_pro: profile.is_pro || false,
        meal_reminder_preferences_set:
          profile.meal_reminder_preferences_set || false,
      });

      // Track successful login
      mixpanel?.track({
        name: "user_logged_in",
        properties: {
          login_method: "email",
          has_macros: profile.has_macros,
          is_pro: profile.is_pro || false,
        },
      });

      // Update FCM token on backend after successful login
      try {
        const fcmToken = await AsyncStorage.getItem("fcm_token");
        console.log("FCM token from AsyncStorage:", fcmToken);
        if (fcmToken) {
          await userService.updateFCMToken(fcmToken);
          console.log("FCM token updated on backend after login");
        } else {
          console.log("No FCM token found in AsyncStorage");
        }
      } catch (error) {
        console.log("Could not update FCM token on backend:", error);
      }

      // Set authenticated last to trigger navigation
      console.log("🔍 LoginScreen - Setting authenticated state");
      
      // Add a small delay to ensure context updates have propagated
      setTimeout(() => {
        console.log("🔍 LoginScreen - Setting authenticated state after delay");
        setAuthenticated(true, token, userId);
      }, 100);
    } catch (error) {
      setAuthenticated(false, "", "");
      setHasMacros(false);
      setIsPro(false);
      setReadyForDashboard(false);
      console.log("Login failed:", error);

      // Extract error message from Axios error response
      let errorMessage = "Invalid email or password. Please try again.";

      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert("Login Failed", errorMessage, [{ text: "OK" }]);
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
    } catch (error) {
      console.error("Google login error:", error);
      Alert.alert("Login Failed", "Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsOnboardingCompleted(false);
    try {
      setIsLoading(true);
      // Use the mock service
      const authData = await mockSocialAuth.appleSignIn();
      setAuthenticated(true, authData.token, authData.user.id);
    } catch (error) {
      console.error("Apple login error:", error);
      Alert.alert("Login Failed", "Apple login failed. Please try again.");
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
    } catch (error) {
      console.error("Facebook login error:", error);
      Alert.alert("Login Failed", "Facebook login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

    const handleSignUp = () => {
        navigation.navigate('SignupScreen');
    };
    return (
        <CustomSafeAreaView className="flex-1 bg-white" edges={['left', 'right']}>
            <KeyboardAvoidingView
                className="flex-1"
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView 
                    className="flex-1 p-6" 
                    contentContainerStyle={{ flexGrow: 1, justifyContent: 'space-between' }}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    <View className="flex-1">
                        <Text className="text-3xl font-medium text-black mb-2">Access your account</Text>
                        <Text className="text-[18px] font-normal text-textMediumGrey mb-8 leading-7">Sign in to track your macros and view personalized meal suggestions.</Text>

                        <View className="w-full">
                            <View className={`${errors.email ? 'border border-red-500 rounded-md' : ''}`}>  
                                <TextInput
                                    className="border border-lightGrey text-base rounded-md pl-4 font-normal text-black h-[68px]"
                                    placeholder="Enter your email"
                                    placeholderTextColor="#9CA3AF"
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
                            {errors.email ? <Text className='text-red-500 text-sm mt-2'>{errors.email}</Text> : null}
                            
                            <View className={`relative mt-6 mb-4 ${errors.password ? 'border border-red-500 rounded-md' : ''}`}>    
                                <TextInput
                                    className="border border-lightGrey text-base rounded-md pl-4 font-normal text-black h-[68px]"
                                    placeholder="Enter password"
                                    placeholderTextColor="#9CA3AF"
                                    value={password}
                                    onChangeText={(text) => {
                                        setPassword(text);
                                        if (errors.password) {
                                            setErrors(prev => ({ ...prev, password: '' }));
                                        }
                                    }}
                                    secureTextEntry={!showPassword}
                                />
                                <MaterialIcons style={{ position: 'absolute', right: 16, top: 34 }} name={isPasswordVisible ? 'visibility' : 'visibility-off'} size={24} color='#000' onPress={togglePasswordVisibility} />
                            </View>
                            {errors.password ? <Text className='text-red-500 text-sm mt-2 mb-2'>{errors.password}</Text> : null}
                            <TouchableOpacity className="mb-4" onPress={() => (navigation as any).navigate('ForgotPasswordScreen')}>
                                <Text className="text-[14px] text-primary font-medium">Forgot Password?</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View className="w-full mt-8">
                        <View className="w-full items-center">
                            <CustomTouchableOpacityButton 
                                className={`h-[54px] w-full items-center justify-center bg-primary rounded-[100px] ${isLoading || !email || !password || password.length < 8 || !/\S+@\S+\.\S+/.test(email) ? 'opacity-50' : ''}`} 
                                title="Sign in"
                                textClassName="text-white text-[17px] font-semibold"
                                disabled={isLoading || !email || !password || password.length < 8 || !/\S+@\S+\.\S+/.test(email)} 
                                onPress={handleLogin}
                                isLoading={isLoading}
                            />
                        </View>
                        <View className="items-center justify-center px-6 mt-2">
                            <Text className="text-[17px] text-center text-gray-600 flex-wrap">
                                Don't have an account?{' '}
                                <Text 
                                    className="text-base text-primary font-medium"
                                    onPress={() => navigation.navigate('SignupScreen')}
                                >
                                    Sign up
                                </Text>
                            </Text>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </CustomSafeAreaView>
    );
};
