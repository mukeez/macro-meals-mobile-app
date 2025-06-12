import React from "react";
import { View, Text, Image } from "react-native";

type ProfileHeaderProps = {
  email: string;
  age: string;
  name?: string;
  avatar?: string; // URL for avatar image
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  email,
  age,
  name,
  avatar,
}) => (
  <View className="bg-white pt-8 px-5">
    <Text className="text-3xl font-bold mt-1.5 mb-4 text-[#333]">Profile</Text>
    <View className="bg-white flex-row items-center mb-1">
      {avatar ? (
        <Image
          source={{ uri: avatar }}
          className="w-[70px] h-[70px] rounded-full mr-4"
        />
      ) : (
        <View className="w-[70px] h-[70px] rounded-full bg-[#5B37B7] justify-center items-center mr-4">
          <Text className="text-2xl">👤</Text>
        </View>
      )}
      <View className="flex-1 justify-center">
        {name && (
          <Text className="text-lg font-bold text-[#333] mb-1">{name}</Text>
        )}
        <Text className="text-lg font-medium text-[#333] mb-1">{email}</Text>
        <Text className="text-base text-[#666]">{age} years old</Text>
      </View>
    </View>
  </View>
);

export default ProfileHeader;
