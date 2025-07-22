import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type NotificationItemProps = {
  text: string; // title
  body?: string; // notification body
  timeAgo: string;
  onPress?: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  read?: boolean;
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  text,
  body,
  timeAgo,
  onPress,
  icon = "notifications",
  read = false,
}) => (
  <View className="px-3">
    <TouchableOpacity
      className="flex-row items-center p-4 bg-white rounded-xl borber-b-1 border-black"
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {/* Icon with circle */}
      <View className="w-9 h-9 rounded-full items-center justify-center mr-4 bg-[#C4E7E3]">
        <MaterialIcons name={icon} size={16} color={"#01675B"} />
      </View>

      {/* Title/body/time wrapper */}
      <View className="flex-1">
        {/* Title and timeAgo in one row */}
        <View className="flex-row items-center justify-between">
          <Text className="text-base font-sans-medium text-[#000000]">
            {text}
          </Text>
          <Text className="text-xs font-sans-medium text-[#000000] ml-2">
            {timeAgo}
          </Text>
        </View>
        {/* Body below */}
        {body ? (
          <Text className="text-sm font-sans-medium text-[#000000] opacity-70 mt-1">
            {body}
          </Text>
        ) : null}
      </View>
    </TouchableOpacity>
  </View>
);

export default NotificationItem;
