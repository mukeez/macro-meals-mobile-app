import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import React, { useContext, useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  View,
  ScrollView,
  Alert,
  Platform,
  Text,
  TouchableOpacity,
} from "react-native";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import BackButton from "src/components/BackButton";
import CustomSafeAreaView from "src/components/CustomSafeAreaView";
import CustomTouchableOpacityButton from "src/components/CustomTouchableOpacityButton";
import { authService } from "src/services/authService";
import { RootStackParamList } from "src/types/navigation";
import useStore from "../store/useStore";
import { OnboardingContext } from "src/contexts/OnboardingContext";
import { HasMacrosContext } from "src/contexts/HasMacrosContext";
import { useGoalsFlowStore } from "src/store/goalsFlowStore";

type VerificationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "EmailVerificationScreen"
>;

export const EmailVerificationScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const navigation = useNavigation<VerificationScreenNavigationProp>();
  const route =
    useRoute<RouteProp<RootStackParamList, "EmailVerificationScreen">>();
  const setAuthenticated = useStore((state) => state.setAuthenticated);
const { setIsOnboardingCompleted } = useContext(OnboardingContext);
const { setHasMacros, setReadyForDashboard } = useContext(HasMacrosContext);
const resetSteps = useGoalsFlowStore((state) => state.resetSteps);
const { email: routeEmail, password: routePassword } = route.params;
  const CELL_COUNT = 6;
  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [error, setError] = useState("");
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

  const isDisabled = () => {
    return (
      isLoading ||
      !routeEmail ||
      !/\S+@\S+\.\S+/.test(routeEmail) ||
      value.length !== CELL_COUNT
    );
  };

  const handleVerifyEmail = async () => {
    if (!routeEmail) {
      Alert.alert(
        "Error",
        "Please enter the email associated with your account"
      );
      return;
    }

    setIsLoading(true);
    setError("");
    const params = {
      email: routeEmail,
      otp: value,
    };
     try {
        const data = await authService.verifyEmail(params);
        if (data?.session_token || data?.success) {
            const loginData = await authService.login({ email: routeEmail, password: routePassword });
            const token = loginData.access_token;
            const loginUserId = loginData.user.id;
            const profileResponse = await fetch('https://api.macromealsapp.com/api/v1/user/me', {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });
            if (!profileResponse.ok) {
                throw new Error(await profileResponse.text());
            }
            const profile = await profileResponse.json();
            await Promise.all([
                AsyncStorage.setItem('my_token', token),
                AsyncStorage.setItem('user_id', loginUserId),
                AsyncStorage.setItem('isOnboardingCompleted', 'true')
            ]);
            resetSteps();
            setIsOnboardingCompleted(true);
            setHasMacros(profile.has_macros);
            setReadyForDashboard(profile.has_macros);
            setAuthenticated(true, token, loginUserId);
            navigation.navigate("GoalSetupScreen");
        } else {
            setError("Invalid verification code. Please try again.");
            Alert.alert("Error", "Invalid verification code");
        }
    } catch (err) {
        setError(
            err instanceof Error
                ? `${err.message}: Code does not exist. Please try again`
                : "Code does not exist. Please try again"
        );
    } finally {
        setIsLoading(false);
    }
};

  const handleResendCode = async () => {
    if (!canResend || !routeEmail) return;

    setIsLoading(true);
    try {
      await authService.resendEmailVerification({ email: routeEmail });
      setCountdown(60);
      setCanResend(false);
      Alert.alert(
        "Success",
        "Verification code has been resent to your email."
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to resend code"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomSafeAreaView
      className="flex-1 items-start justify-start"
      edges={["left", "right"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView className="flex-1 relative align-left p-6">
          <View className="flex-row items-center justify-start mb-3">
            <BackButton onPress={() => navigation.goBack()} />
          </View>
          <Text className="text-3xl font-medium text-black mb-2">
            Enter email verification code
          </Text>
          <Text className="text-[18px] font-normal text-textMediumGrey mb-8 leading-7">
            We've sent a 6-digit code to {routeEmail}
          </Text>

          <View className="w-full mb-5">
            <View className="flex-col">
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
                    className={`w-[50px] h-[56px] border-2 border-gray-300 rounded justify-center items-center text-2xl bg-white text-center ${
                      isFocused ? "border-[#19a28f]" : ""
                    }`}
                    style={{ lineHeight: 56 }}
                    onLayout={getCellOnLayoutHandler(index)}
                  >
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </Text>
                )}
              />
              {error ? (
                <Text className="text-red-500 text-sm">{error}</Text>
              ) : null}
            </View>
          </View>
        </ScrollView>
        <View className="absolute flex-col bottom-10 px-6 w-full">
          <View className="w-full items-center">
            <CustomTouchableOpacityButton
              className={`h-[56px] w-full items-center justify-center bg-primary rounded-[100px] ${
                isDisabled() ? "opacity-30" : "opacity-100"
              }`}
              title="Verify code"
              textClassName="text-white text-[17px] font-semibold"
              disabled={isDisabled()}
              onPress={handleVerifyEmail}
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
            <TouchableOpacity onPress={handleResendCode} disabled={isLoading}>
              <Text className="text-primary font-semibold">Resend code</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </CustomSafeAreaView>
  );
};
