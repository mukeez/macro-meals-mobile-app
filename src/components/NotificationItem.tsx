import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type NotificationItemProps = {
  text: string; // The notification message
  timeAgo: string; // How long ago the notification was received
  onPress?: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap; // Optional: allow custom icon
};

// You can customize this color or use a constant if desired
const ICON_COLOR = "#009688";

const NotificationItem: React.FC<NotificationItemProps> = ({
  text,
  timeAgo,
  onPress,
  icon = "notifications",
}) => (
  <TouchableOpacity
    className="flex-row items-center py-4 px-4 border-b border-b-[#f0f0f0]"
    onPress={onPress}
    disabled={!onPress}
    activeOpacity={onPress ? 0.7 : 1}
  >
    {/* Notification Icon on the left */}
    <MaterialIcons
      name={icon}
      size={24}
      color={ICON_COLOR}
      style={{ marginRight: 16 }}
    />

    {/* Notification Text */}
    <View className="flex-1">
      <Text className="text-base text-[#333]">{text}</Text>
    </View>

    {/* Time Ago on the far right */}
    <Text className="text-xs text-[#888] ml-4">{timeAgo}</Text>
  </TouchableOpacity>
);

export default NotificationItem;