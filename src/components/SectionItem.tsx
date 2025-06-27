import React from "react";
import { TouchableOpacity, View, Text, Image, ImageSourcePropType } from "react-native";

type SectionItemProps = {
  title: string;
  image?: ImageSourcePropType; // Better type safety for icons
  onPress?: () => void;
  rightComponent?: React.ReactNode;
};

const ICON_COLOR = "#009688";

const SectionItem: React.FC<SectionItemProps> = ({
  title,
  image,
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
    {image && (
      <View className="w-8 h-8 justify-center items-center mr-3">
        <Image
          source={image}
          className="w-6 h-6"
          resizeMode="contain"
        />
      </View>
    )}
    <View className="flex-1">
      <Text className="text-base font-medium text-[#333]">{title}</Text>
    </View>
    {rightComponent && <View>{rightComponent}</View>}
  </TouchableOpacity>
);

export default SectionItem;
