import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, Text, View } from "react-native";

type LogoutButtonProps = {
  onPress: () => void;
};

const LogoutButton: React.FC<LogoutButtonProps> = ({ onPress }) => (
  <TouchableOpacity
    className="border border-red-500 rounded-full py-3 items-center bg-transparent"
    onPress={onPress}
    activeOpacity={0.8}
  >
    <View className="flex-row items-center">
      <Ionicons
        name="exit-outline"
        size={20}
        color="#ef4444"
        className="mr-2"
      />
      <Text className="text-red-500 text-base font-semibold">Log Out</Text>
    </View>
  </TouchableOpacity>
);

export default LogoutButton;
