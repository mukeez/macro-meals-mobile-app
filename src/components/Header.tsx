import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

type HeaderProps = {
  title: string;
};

const Header = ({ title }: HeaderProps) => {
  const navigation = useNavigation();
  return (
    <View className="w-full py-5 px-4  bg-white flex-row items-center justify-between">
      <TouchableOpacity
        className="w-10 items-start"
        onPress={() => navigation.goBack()}
      >
        <AntDesign name="left" size={24} color="black" />
      </TouchableOpacity>
      <Text className="flex-1 text-center text-lg font-semibold text-gray-800">
        {title}
      </Text>
      {/* Spacer to balance the row for proper centering */}
      <View className="w-10" />
    </View>
  );
};

export default Header;
