import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface DiscoverCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}

const DiscoverCard: React.FC<DiscoverCardProps> = ({ icon, title, description, onPress }) => (
  <TouchableOpacity className="flex-row items-center bg-white/90 rounded-xl px-4 py-4 shadow-lg mb-4" onPress={onPress}>
    <View className="w-12 h-12 rounded-full bg-[#C4E7E3] justify-center items-center mr-4">
      {icon}
    </View>
    <View className="flex-1">
      <Text className="text-base font-semibold text-gray-900">{title}</Text>
      <Text className="text-xs text-[#404040] mt-1">{description}</Text>
    </View>
  </TouchableOpacity>
);

export default DiscoverCard; 