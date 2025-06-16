import React from 'react';
import { View, Text } from 'react-native';

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children, className }) => (
  <View className={`mb-4 ${className || ''}`}>
    {title && <Text className="text-sm text-gray-400 font-medium px-6 mt-6 mb-3">{title}</Text>}
    <View className="bg-white rounded-xl mx-5">{children}</View>
  </View>
);

export default SettingsSection; 