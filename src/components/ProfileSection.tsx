import React from "react";
import { View, Text } from "react-native";

type ProfileSectionProps = {
  title: string;
  children: React.ReactNode;
};

const ProfileSection: React.FC<ProfileSectionProps> = ({ title, children }) => (
  <View className="mt-1.5 px-5 py-3.5">
    <Text className="text-lg mb-3 text-[#333]">{title}</Text>
    <View className="bg-white rounded-xl overflow-hidden shadow-sm">
      {children}
    </View>
  </View>
);

export default ProfileSection;