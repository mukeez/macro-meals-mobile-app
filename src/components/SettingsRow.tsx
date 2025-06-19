import React from 'react';
import { TouchableOpacity, View, Text, Image } from 'react-native';
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants';

interface SettingsRowProps {
  icon: any; // image path
  label: string;
  onPress?: () => void;
  right?: React.ReactNode;
  showChevron?: boolean;
  className?: string;
  borderBottom?: boolean;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon,
  label,
  onPress,
  right,
  showChevron = true,
  className = '',
  borderBottom = true,
}) => {
  const RowComponent = onPress ? TouchableOpacity : View;
  return (
    <RowComponent
      onPress={onPress}
      className={`flex-row items-center px-4 py-5 ${borderBottom ? 'border-b border-gray-100' : ''} ${className}`}
    >
      <Image source={icon} className="w-6 h-6 mr-4" resizeMode="contain" />
      <Text className="flex-1 text-base text-black">{label}</Text>
      {right}
      {showChevron && <Image source={IMAGE_CONSTANTS.chevronRightIcon} className="w-5 h-5 ml-2" />}
    </RowComponent>
  );
};

export default SettingsRow; 