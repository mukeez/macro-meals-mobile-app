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
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import useStore from "../store/useStore";
import { authService } from "../services/authService";
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import BackButton from "../components/BackButton";
import CustomTouchableOpacityButton from "../components/CustomTouchableOpacityButton";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons } from "@expo/vector-icons";

type RootStackParamList = {
  ResetPassword: { email: string; session_token: string; source: string };
  SettingsScreen: undefined;
  LoginScreen: undefined;
};
type NavigationProp = NativeStackNavigationProp<
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
    source,
  } = route.params;
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
  const [isValid, setIsValid] = useState(false);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });
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
      session_token: routeSessionToken,
      password: password,
    };
    try {
      const response = await authService.resetPassword(resetPasswordData);
      console.log("response", response);
      if (source === "settings") {
        navigation.navigate("SettingsScreen");
      } else {
        navigation.navigate("LoginScreen");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      Alert.alert("Error", "Failed to reset password: " + error);
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
                touched.password && errors.password ? "border border-[#ff6b6b] rounded-md" : ""
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
              <MaterialIcons
                style={{
                  position: "absolute",
                  right: 16,
                  top: "50%",
                  marginTop: -12,
                  zIndex: 10,
                }}
                name={isPasswordVisible ? "visibility" : "visibility-off"}
                size={24}
                color="#000"
                onPress={togglePasswordVisibility}
              />
            </View>
            {touched.password && errors.password ? (
              <Text className="text-[#ff6b6b] text-sm mb-3">{errors.password}</Text>
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
            <MaterialIcons
              style={{
                position: "absolute",
                right: 16,
                top: "50%",
                marginTop: -12,
                zIndex: 10,
              }}
              name={isPasswordVisible ? "visibility" : "visibility-off"}
              size={24}
              color="#000"
              onPress={toggleConfirmPasswordVisibility}
            />
          </View>
          {touched.confirmPassword && errors.confirmPassword ? (
            <Text className="text-[#ff6b6b] text-sm mb-3">{errors.confirmPassword}</Text>
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
