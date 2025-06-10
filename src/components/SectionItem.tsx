import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { TouchableOpacity, View, Text } from "react-native";

type SectionItemProps = {
  title: string;
  icon?: keyof typeof MaterialIcons.glyphMap; // Better type safety for icons
  onPress?: () => void;
  rightComponent?: React.ReactNode;
};

const ICON_COLOR = "#009688";

const SectionItem: React.FC<SectionItemProps> = ({
  title,
  icon,
  onPress,
  rightComponent,
}) => (
  <TouchableOpacity
    className="flex-row items-center py-4 px-4 border-b border-b-[#f0f0f0]"
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    {/* Icon on the left */}
    {icon && (
      <MaterialIcons
        name={icon}
        size={24}
        color={ICON_COLOR}
        style={{ marginRight: 16 }}
      />
    )}
    <View className="flex-1 p-2">
      <Text className="text-base font-medium text-[#333]">{title}</Text>
    </View>
    {rightComponent && <View>{rightComponent}</View>}
  </TouchableOpacity>
);

export default SectionItem;
