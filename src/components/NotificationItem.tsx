import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type NotificationItemProps = {
  text: string;
  timeAgo: string;
  onPress?: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  read?: boolean; // <-- Added this line
};

const ICON_COLOR = "#009688";

const NotificationItem: React.FC<NotificationItemProps> = ({
  text,
  timeAgo,
  onPress,
  icon = "notifications",
  read = false,
}) => (
  <TouchableOpacity
    className="flex-row items-center py-4 px-4 border-b border-b-[#f0f0f0]"
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    <MaterialIcons
      name={icon}
      size={24}
      color={ICON_COLOR}
      style={{ marginRight: 16 }}
    />

    <View className="flex-1">
      <Text
        className="text-base text-[#333]"
        style={read ? {} : { fontWeight: "bold" }} // Unread = bold text
      >
        {text}
      </Text>
    </View>

    <Text className="text-xs text-[#888] ml-4">{timeAgo}</Text>
  </TouchableOpacity>
);

export default NotificationItem;
