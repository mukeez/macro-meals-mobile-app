import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { authService } from "../services/authService";
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import BackButton from "../components/BackButton";
import CustomTouchableOpacityButton from "../components/CustomTouchableOpacityButton";
import { MaterialIcons } from "@expo/vector-icons";
import { RootStackParamList } from "src/types/navigation";
import { StackNavigationProp } from "@react-navigation/stack";

type ResetPasswordScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  "ResetPassword"
>;

export const ResetPasswordScreen: React.FC = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const route = useRoute<RouteProp<RootStackParamList, "ResetPassword">>();
  const {
    email: routeEmail,
    session_token: routeSessionToken,
    otp: routeOtp,
    source,
  } = route.params;
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });
  const navigation = useNavigation<ResetPasswordScreenNavigationProp>();

  // Validation logic
  React.useEffect(() => {
    let valid = true;
    const newErrors = { password: "", confirmPassword: "" };
    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
      valid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }
    setErrors(newErrors);
    setIsValid(valid);
  }, [password, confirmPassword]);

  const handleResetPassword = async () => {
    setIsLoading(true);
    const resetPasswordData = {
      email: routeEmail,
      otp: routeOtp,
      session_token: routeSessionToken,
      password: password,
    };
    
    console.log("Sending reset password data:", {
      email: resetPasswordData.email,
      otp: resetPasswordData.otp ? `${resetPasswordData.otp.substring(0, 2)}****` : 'undefined',
      session_token: resetPasswordData.session_token ? `${resetPasswordData.session_token.substring(0, 10)}...` : 'undefined',
      password: resetPasswordData.password ? `${resetPasswordData.password.substring(0, 3)}...` : 'undefined',
    });
    
    try {
      const response = await authService.resetPassword(resetPasswordData);
      console.log("response", response);
      if (source === "settings") {
        navigation.navigate('MainTabs', { screen: 'Settings' });
      } else {
        navigation.navigate("LoginScreen");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      
      // Log the full error response for debugging
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.log("Full error response:", {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
          headers: axiosError.response?.headers
        });
        
        // Log the detail structure specifically
        if (axiosError.response?.data?.detail) {
          console.log("Detail structure:", {
            type: typeof axiosError.response.data.detail,
            isArray: Array.isArray(axiosError.response.data.detail),
            value: axiosError.response.data.detail,
            firstElement: Array.isArray(axiosError.response.data.detail) ? axiosError.response.data.detail[0] : null
          });
        }
      }
      
      // Extract error message from Axios error response
      let errorMessage = "Failed to reset password. Please try again.";
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        
        // Handle nested detail structure (array of objects)
        if (axiosError.response?.data?.detail) {
          const detail = axiosError.response.data.detail;
          if (Array.isArray(detail) && detail.length > 0) {
            // If detail is an array, extract the first error message
            const firstError = detail[0];
            if (typeof firstError === 'object' && firstError.msg) {
              errorMessage = firstError.msg;
            } else if (typeof firstError === 'string') {
              errorMessage = firstError;
            } else if (firstError && typeof firstError === 'object') {
              // Try to find any string value in the object
              const values = Object.values(firstError);
              const stringValue = values.find(val => typeof val === 'string');
              if (stringValue) {
                errorMessage = stringValue as string;
              }
            }
          } else if (typeof detail === 'string') {
            errorMessage = detail;
          }
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomSafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 0,
            paddingBottom: 24,
          }}
        >
          <View className="flex-row items-center justify-start mb-3">
            <BackButton onPress={() => navigation.goBack()} />
          </View>
          <Text className="text-3xl font-medium text-black mb-2 text-left">
            Reset your password
          </Text>
          <View className="mt-5">
            <View
              className={`relative mb-2 ${
                touched.password && errors.password
                  ? "border border-[#ff6b6b] rounded-md"
                  : ""
              }`}
            >
              <TextInput
                className="border border-lightGrey text-base rounded-md pl-4 font-normal text-black h-[68px]"
                placeholder="Create password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (!touched.password)
                    setTouched((t) => ({ ...t, password: true }));
                }}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                className="absolute right-4 bottom-[30%]"
              >
                <Image
                  source={
                    showPassword
                      ? require("../../assets/visibility-on-icon.png")
                      : require("../../assets/visibility-off-icon.png")
                  }
                  className="w-6 h-6 ml-2"
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password ? (
              <Text className="text-[#ff6b6b] text-sm mb-3">
                {errors.password}
              </Text>
            ) : null}
          </View>
          <View className="mb-4" />
          <View
            className={`relative mb-2 ${
              touched.confirmPassword && errors.confirmPassword
                ? "border border-[#ff6b6b] rounded-md"
                : ""
            }`}
          >
            <TextInput
              className="border border-lightGrey text-base rounded-md pl-4 font-normal text-black h-[68px]"
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (!touched.confirmPassword)
                  setTouched((t) => ({ ...t, confirmPassword: true }));
              }}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-4 bottom-[30%]"
            >
              <Image
                source={
                  showConfirmPassword
                    ? require("../../assets/visibility-on-icon.png")
                    : require("../../assets/visibility-off-icon.png")
                }
                className="w-6 h-6 ml-2"
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>
          {touched.confirmPassword && errors.confirmPassword ? (
            <Text className="text-[#ff6b6b] text-sm mb-3">
              {errors.confirmPassword}
            </Text>
          ) : null}
          {/* Password hint with checkmark */}
          <View className="flex-row items-center justify-start mt-2 w-full">
            <View
              className={`w-[20px] h-[20px] rounded-full justify-center items-center mr-2 ${
                password.length >= 8 ? "bg-primary" : "bg-lightGrey"
              }`}
            >
              <MaterialIcons name="check" size={16} color="white" />
            </View>
            <Text className="text-sm font-normal text-textMediumGrey">
              Password must be at least 8 characters
            </Text>
          </View>

          <View className="absolute bottom-2 left-0 right-0 px-4">
            <View className="w-full items-center">
              <CustomTouchableOpacityButton
                className="h-[56px] w-full items-center justify-center bg-primary rounded-[100px]"
                title="Save password"
                textClassName="text-white text-[17px] font-semibold"
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
