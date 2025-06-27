import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Image,
    Linking,
    Platform,
    Switch, Alert,
    Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import useStore from '../store/useStore';
import { Picker } from '@react-native-picker/picker';
import { authService } from '../services/authService';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { IMAGE_CONSTANTS } from "../constants/imageConstants";
import { RootStackParamList } from '../types/navigation';
import { appConstants } from '../../constants/appConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteItemAsync } from 'expo-secure-store';
import ProfileSection from "src/components/ProfileSection";
import SectionItem from "src/components/SectionItem";
import { userService } from '../services/userService';

type NavigationProp = StackNavigationProp<RootStackParamList>;

/**
 * Settings screen for the application.
 * Displays user profile, macro targets, and app settings.
 */
export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const preferences = useStore((state) => state.preferences);
  const token = useStore((state) => state.token);
  const updatePreferences = useStore((state) => state.updatePreferences);
  const logout = useStore((state) => state.logout);
  const setAuthenticated = useStore((state) => state.setAuthenticated);
  const [supportDrawerOpen, setSupportDrawerOpen] = React.useState(false);

  // Local state for settings
  const [units, setUnits] = useState<string>("g/kcal");
  // const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [userData, setUserData] = useState({
    age: 0,
    avatar_url: "",
    created_at: "",
    display_name: "",
    dob: "",
    email: "",
    fcm_token: "",
    first_name: "",
    has_macros: false,
    height: 0,
    id: "",
    is_active: true,
    is_pro: false,
    last_name: "",
    meal_reminder_preferences_set: false,
    sex: "",
    unit_preference: "metric",
    updated_at: ""
  });

  // Modal state for units selection
  const [showUnitsModal, setShowUnitsModal] = useState(false);
  const [tempUnitPreference, setTempUnitPreference] = useState("metric");

  const UNIT_OPTIONS = [
    { label: 'Metric', value: 'metric' },
    { label: 'Imperial', value: 'imperial' },
  ];

  /**
   * Mock fetching user data on component mount
   */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const profileData = await userService.fetchUserData();
        setUserData(profileData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Handle error appropriately
      }
    };
    fetchUserData();

    if (preferences.unitSystem) {
      setUnits(preferences.unitSystem === "Metric" ? "g/kcal" : "oz/cal");
    }
  }, [token]);

  /**
   * Handle changing the units system
   * @param value - The new units value
   */
  const handleUnitsChange = async (value: string) => {
    setUnits(value);

    const newUnitSystem = value === "g/kcal" ? "Metric" : "Imperial";
    updatePreferences({
      unitSystem: newUnitSystem,
    });

    try {
      const token = useStore.getState().token;
      const response = await fetch(
        "https://api.macromealsapp.com/api/v1/user/preferences",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            unitSystem: newUnitSystem,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update preferences");
      }
    } catch (error) {
      console.error("Error updating preferences:", error);
      // You could add error handling UI here if needed
    }
  };

  /**
   * Handle unit preference change using the same pattern as account settings
   */
  const handleUnitPreferenceChange = async (value: string) => {
    try {
      const updated = await userService.updateProfile({ unit_preference: value });
      setUserData((prev) => ({ ...prev, ...updated }));
      setShowUnitsModal(false);
    } catch (error) {
      console.error('Error updating unit preference:', error);
      // Optionally show error to user
    }
  };

  /**
   * Handle dark mode toggle
   * @param value - The new dark mode state
   */
  // const handleDarkModeToggle = (value: boolean) => {
  //     setIsDarkMode(value);
  //     // In a real app, you would update a theme context or store
  // };

  /**
   * Handle going back to the previous screen
   */
  const handleGoBack = () => {
    navigation.goBack();
  };

  /**
   * Handle logout action
   */
  const handleLogout = async () => {
    try {
      await authService.logout();
      setAuthenticated(false, "", "");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  /**
   * Handle navigation to help screen
   */
  const handleHelpSupport = () => {
    // Navigate to help screen
    Alert.alert("Help + Support ", "Help + Support coming soon!");
    // navigation.navigate('HelpSupport' as never);
  };

    const handleModalSheet = () => {
        navigation.navigate('PaymentScreen' as never);
    };

    const openEmail = () => {
        let url = `mailto:${appConstants.email.to}`;

        const subject = `?subject=${encodeURIComponent(appConstants.email.subject)}`;
        const body = `&body=${encodeURIComponent(appConstants.email.body)}`;
        url += subject + body;
        Linking.openURL(url).catch((err)=> console.error('Error opening email', err));
    }

  /**
   * Handle navigation to feedback screen
   */
  const handleSendFeedback = () => {
    // Navigate to feedback screen
    Alert.alert("Feedback ", "Feedback coming soon!");

    // navigation.navigate('SendFeedback' as never);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await authService.logout();
              setAuthenticated(false, "", "");
              navigation.reset({
                index: 0,
                routes: [{ name: "Welcome" }],
              });
            } catch (error) {
              console.error("Delete account error:", error);
            }
          },
        },
      ]
    );
  };

  return (
    <CustomSafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <ScrollView contentContainerStyle={{ backgroundColor: "#f8f8f8" }}>
        {/* Header with back button and title */}
        {/* <View className="flex-row items-center p-4 border-b border-b-gray-200">
          <TouchableOpacity
            className="mr-4"
            onPress={() => navigation.goBack()}
          >
            <FontAwesome name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold">Settings</Text>
        </View> */}

        {/* --- Hardcoded Profile Header Start --- */}
        <View className="bg-white pt-8 px-5">
          <Text className="text-3xl font-bold mt-1.5 mb-4 text-[#333]">
            Profile
          </Text>
          <View className="bg-white flex-row items-center mb-1">
            <View className="w-[70px] h-[70px] rounded-full bg-[#5B37B7] justify-center items-center mr-4">
              <Text className="text-2xl">👤</Text>
            </View>
            <View className="flex-1 justify-center">
              <Text className="text-lg font-medium text-[#333] mb-1">
                {userData?.email}
              </Text>
              <Text className="text-base text-[#666]">
                {userData?.age} years old
              </Text>
            </View>
          </View>
        </View>
        {/* --- Hardcoded Profile Header End --- */}

        {/* Personal Section */}
        <ProfileSection title="PERSONAL">
          <SectionItem
            title="Account settings"
            image={IMAGE_CONSTANTS.personIcon}
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => {
              navigation.navigate('AccountSettingsScreen');
            }}
          />
          <SectionItem
            title="Adjust targets"
            image={IMAGE_CONSTANTS.fireIcon}
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => {}}
          />
          <SectionItem
            title="Password"
            image={IMAGE_CONSTANTS.lockIcon}
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => {
              navigation.navigate("ChangePassword");
            }}
          />
          <SectionItem
            title="Units"
            image={IMAGE_CONSTANTS.balanceIcon}
            rightComponent={
              <View className="flex-row px-2 py-2 gap-1 bg-gray rounded-lg items-center">
                <Text className="text-md text-black">{userData?.unit_preference}</Text>
                <FontAwesome name="angle-down" size={15} color="black" />
              </View>
            }
            onPress={() => {
              setTempUnitPreference(userData?.unit_preference || 'metric');
              setShowUnitsModal(true);
            }}
          />
        </ProfileSection>

        {/* Account Section */}
        <ProfileSection title="ACCOUNT">
          <SectionItem
            title="Account type"
            image={IMAGE_CONSTANTS.accountTypeIcon}
            rightComponent={
              <View className="flex-row items-center">
                <Text className="text-md text-[#FFC008]  mx-2">Premium</Text>
              </View>
            }
            onPress={() => {}}
          />
          <SectionItem
            title="Restore Purchases"
            image={IMAGE_CONSTANTS.restoreIcon}
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => {}}
          />
        </ProfileSection>

        {/* Notifications Section */}
        <ProfileSection title="NOTIFICATIONS">
          <SectionItem
            title="Notifications"
            image={IMAGE_CONSTANTS.notificationIcon}
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => navigation.navigate("Notifications")}
          />
        </ProfileSection>

        {/* Help and Support Section */}
        <ProfileSection title="HELP & SUPPORT">
          <SectionItem
            title="Contact support"
            image={IMAGE_CONSTANTS.supportAgentIcon}
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => {handleHelpSupport}}
          />
          <SectionItem
            title="Submit feedback"
            image={IMAGE_CONSTANTS.chatIcon}
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => {openEmail()}}
          />
          <SectionItem
            title="Knowledge base"
            image={IMAGE_CONSTANTS.knowledgeIcon}
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => {}}
          />
        </ProfileSection>


          {/* General Section */}
        <ProfileSection title="TERMS and conditions">
          <SectionItem
            title="Terms of Service"
            image={IMAGE_CONSTANTS.fileIcon}
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => navigation.navigate('TermsOfServiceScreen')}
          />
          <SectionItem
            title="Privacy Policy"
            image={IMAGE_CONSTANTS.fileIcon}
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
          <SectionItem
            title="About"
            image={IMAGE_CONSTANTS.infoIcon}
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => {}}
          />
        </ProfileSection>


        <TouchableOpacity
          className="border border-red-500 rounded-full py-3 items-center bg-transparent my-8 mx-5  "
        onPress={handleLogout}
        activeOpacity={0.8}
      >
        <View className="flex-row items-center">
          <Ionicons
            name="exit-outline"
            size={20}
            color="#ef4444"
            className="mr-2"
          />
          <Text className="text-red-500 text-base font-semibold">Log Out</Text>
        </View>
  </TouchableOpacity>

        {/* Units Selection Modal */}
        <Modal
          visible={showUnitsModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowUnitsModal(false)}
        >
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-white rounded-t-xl p-4">
              <Text className="text-center text-base font-semibold mb-2">Select Unit System</Text>
              <Picker
                selectedValue={tempUnitPreference}
                onValueChange={setTempUnitPreference}
                style={{ width: '100%' }}
                itemStyle={{ fontSize: 18, height: 180 }}
              >
                <Picker.Item label="Metric" value="metric" />
                <Picker.Item label="Imperial" value="imperial" />
              </Picker>
              <View className="flex-row justify-between mt-4">
                <TouchableOpacity onPress={() => setShowUnitsModal(false)} className="flex-1 items-center py-2">
                  <Text className="text-lg text-blue-500">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleUnitPreferenceChange(tempUnitPreference)}
                  className="flex-1 items-center py-2"
                >
                  <Text className="text-lg text-blue-500">Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>
    </CustomSafeAreaView>
  );
};

export default SettingsScreen;
