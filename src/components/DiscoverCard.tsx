import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface DiscoverCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onPress: () => void;
}

const DiscoverCard: React.FC<DiscoverCardProps> = ({ icon, title, description, onPress }) => (
  <View className="mt-3 bg-white rounded-lg p-1">
    <TouchableOpacity className="flex-row items-start p-4" onPress={onPress}>
      <View className="flex-row items-center justify-center mr-4 w-10 h-10 rounded-full bg-lightGreen">
        {icon}
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-black mb-2">{title}</Text>
        <Text className="text-xs font-normal text-black">{description}</Text>
      </View>
    </TouchableOpacity>
  </View>
);

export default DiscoverCard; 