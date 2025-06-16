// src/screens/LoginScreen.tsx
import React, { useState } from "react";
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
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
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

type RootStackParamList = {
  ForgotPasswordScreen: { source: string };
  VerificationScreen: { email: string; source: string };
};

type ForgotPasswordScreenRouteProp = RouteProp<
  RootStackParamList,
  "ForgotPasswordScreen"
>;
type ForgotPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ForgotPasswordScreen"
>;

export const ForgotPasswordScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { setIsOnboardingCompleted } = React.useContext(OnboardingContext);
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const route = useRoute<ForgotPasswordScreenRouteProp>();

  const source = route.params?.source ?? "Forgot";
  const [errors, setErrors] = useState({
    email: "",
  });

  const isDisabled = () => {
    return isLoading || !email || !/\S+@\S+\.\S+/.test(email);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert(
        "Error",
        "Please enter the email associated with your account"
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      console.log("response", response);
      navigation.navigate("VerificationScreen", { email: email, source });
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

  const headerText =
    source === "settings" ? "Reset your password" : "Forgot your password?";
   return (
    <CustomSafeAreaView
      className="flex-1 items-start justify-start"
      edges={["left", "right"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView className="flex-1 relative p-6">
          <View className="flex-row items-center justify-start mb-3">
            <BackButton onPress={() => navigation.goBack()} />
          </View>
          <Text className="text-3xl font-medium text-black mb-2">
            {headerText}
          </Text>
          <Text className="text-[18px] font-normal text-textMediumGrey mb-8 leading-7">
            Enter your email and we’ll send you a code to reset your password.
          </Text>

          <View className="w-full">
            <View
              className={`mb-6 ${
                errors.email ? "border border-[#ff6b6b] rounded-md" : ""
              }`}
            >
              <TextInput
                className="border border-lightGrey text-base rounded-md pl-4 font-normal text-black h-[68px]"
                placeholder="Enter your email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  // Validate email on change
                  if (!text) {
                    setErrors((prev) => ({
                      ...prev,
                      email: "Email is required",
                    }));
                  } else if (!/\S+@\S+\.\S+/.test(text)) {
                    setErrors((prev) => ({
                      ...prev,
                      email: "Email is invalid",
                    }));
                  } else {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                textContentType="emailAddress"
                spellCheck={false}
                autoComplete="email"
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
              disabled={isLoading || !email || !/\S+@\S+\.\S+/.test(email)}
              onPress={handleForgotPassword}
              isLoading={isLoading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </CustomSafeAreaView>
  );
};