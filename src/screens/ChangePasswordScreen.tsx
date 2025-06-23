import React from "react";
import { View, Text } from "react-native";
import Header from "../components/Header";
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import CustomTouchableOpacityButton from "../components/CustomTouchableOpacityButton";
import { useNavigation } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";
import { StackNavigationProp } from "@react-navigation/stack";

type NavigationProp = StackNavigationProp<
  RootStackParamList,
  "ForgotPasswordScreen"
>;
const ChangePasswordScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  return (
    <CustomSafeAreaView>
      <Header title="Password" />
      <View className="flex-1 bg-white p-6">
        <Text className="text-lg font-semibold mb-2">
          Change or reset password
        </Text>
        <Text className="text-base text-[#4F4F4F] mb-8">
          To change your existing password, press the button below. You will
          receive an email asking you to create a new password.
        </Text>
        <CustomTouchableOpacityButton
          title="Reset Password"
          onPress={() => {
            navigation.navigate("ForgotPasswordScreen", { source: "settings" });
          }}
        />
      </View>
    </CustomSafeAreaView>
  );
};

export default ChangePasswordScreen;
