import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import useStore from 'src/store/useStore';
import { userService } from './userService';

const handleEditAvatar = async (setUserData: any, setIsProcessing: any) => {
  console.log('[handleEditAvatar] Requesting media library permissions...');
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    console.warn('[handleEditAvatar] Permission not granted for media library');
    Alert.alert('Sorry, we need camera roll permissions to make this work!');
    return;
  }

  console.log('[handleEditAvatar] Launching image picker...');
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (!result.canceled && result.assets && result.assets.length > 0) {
    setIsProcessing(true);
    try {
      const imageUri = result.assets[0].uri;
      console.log('[handleEditAvatar] Image selected:', imageUri);
      const authToken = useStore.getState().token;
      if (!authToken) {
        console.error('[handleEditAvatar] No auth token found');
        Alert.alert("Authentication error", "You must be logged in to update your avatar.");
        setIsProcessing(false);
        return;
      }

      // 1. Upload the image
      console.log('[handleEditAvatar] Uploading profile image...');
      await userService.uploadProfileImage(imageUri, authToken);
      console.log('[handleEditAvatar] Image uploaded successfully.');

      // 2. Fetch the updated user profile
      console.log('[handleEditAvatar] Fetching updated user profile...');
      const updatedUser = await userService.getProfile();
      console.log('[handleEditAvatar] Updated user profile retrieved:', updatedUser);

      // 3. Update local state with the updated user data (including new avatar_url)
     setUserData(updatedUser);
      setIsProcessing(false);
      console.log('[handleEditAvatar] Avatar updated successfully.');
    } catch (error: any) {
      setIsProcessing(false);
      console.error('[handleEditAvatar] Error updating avatar:', error);
      Alert.alert('Error', error.message || 'There was a problem uploading your new avatar. Please try again.');
    }
  } else {
    console.log('[handleEditAvatar] Image picker canceled or no asset selected.');
  }
};

export default handleEditAvatar;