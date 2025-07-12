import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import handleEditAvatar from "src/services/handleEditAvatar";
import useStore from "src/store/useStore";

interface EditableAvatarProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

const EditableAvatar: React.FC<EditableAvatarProps> = ({
  size = 70,
  style,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const profile = useStore((state) => state.profile);
  console.log("profile is:", profile);
  const setProfile = useStore((state) => state.setProfile);

  const handleAvatarEdit = async () => {
    console.log("[EditableAvatar] Avatar edit pressed");
    await handleEditAvatar((newProfile: any) => {
      console.log("[EditableAvatar] setProfile called with:", newProfile);
      setProfile(newProfile);
    }, setIsProcessing);
    setAvatarVersion((v) => v + 1);
  };

  const avatarUrl = profile?.avatar_url
    ? `${profile.avatar_url}?t=${avatarVersion}` //cache busting to force reload
    : undefined;

  return (
    <TouchableOpacity
      onPress={handleAvatarEdit}
      disabled={isProcessing}
      style={[{ width: size, height: size }, style]}
      activeOpacity={0.7}
    >
      <Image
        source={
          avatarUrl
            ? { uri: `${avatarUrl}?v=${avatarVersion}` }
            : require("../../assets/person-icon.png")
        }
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#eee",
        }}
        onError={(e) => {
          console.log(
            "[EditableAvatar] Image load error:",
            e.nativeEvent.error
          );
        }}
        onLoad={() => {
          console.log("[EditableAvatar] Image loaded successfully!");
        }}
      />
      <View
        style={{
          position: "absolute",
          right: 6,
          bottom: 6,
          backgroundColor: "white",
          borderRadius: size / 5,
          padding: 3,
        }}
        pointerEvents="none"
      >
        {isProcessing ? (
          <ActivityIndicator size="small" />
        ) : (
          <Icon name="edit" size={size / 4} color="#333" />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default EditableAvatar;
