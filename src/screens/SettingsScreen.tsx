import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Image,
    Linking,
    Platform,
    Switch, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useStore from '../store/useStore';
import { Picker } from '@react-native-picker/picker';
import { authService } from '../services/authService';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import { FontAwesome } from '@expo/vector-icons';

type RootStackParamList = {
  Login: undefined;
  Welcome: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  About: undefined;
  Notifications: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
import { appConstants } from '../../constants/appConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteItemAsync } from 'expo-secure-store';

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
    name: "",
    email: "",
    avatar: "", // Placeholder
  });

  /**
   * Mock fetching user data on component mount
   */
  useEffect(() => {
    console.log(preferences);
    const fetchUserData = async () => {
      const profileResponse = await fetch(
        "https://api.macromealsapp.com/api/v1/user/me",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!profileResponse.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const profileData = await profileResponse.json();
      setUserData(profileData);
    };
    fetchUserData();

    setUserData({
      name: "Sarah Wilson",
      email: "sarah@example.com",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    });

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

      console.log("Preferences updated successfully");
    } catch (error) {
      console.error("Error updating preferences:", error);
      // You could add error handling UI here if needed
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
        console.log('Modal sheet');
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
            icon="person"
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => {}}
          />
          <SectionItem
            title="Adjust targets"
            icon="whatshot"
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => {}}
          />
          <SectionItem
            title="Password"
            icon="lock"
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => {}}
          />
          <SectionItem
            title="Units"
            icon="straighten"
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => {}}
          />
        </ProfileSection>

        {/* Account Section */}
        <ProfileSection title="ACCOUNT">
          <SectionItem
            title="Account type"
            icon="verified-user"
            rightComponent={
              <View className="flex-row items-center">
                <Text className="text-md text-[#FFC008]  mx-2">Premium</Text>
              </View>
            }
            onPress={() => {}}
          />
          <SectionItem
            title="Restore Purchases"
            icon="restore"
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
            icon="notifications"
            rightComponent={
              <Text className="text-xl text-gray-400 ml-1">›</Text>
            }
            onPress={() => navigation.navigate("Notifications")}
          />
        </ProfileSection>

                {/* Help and Support Section */}
                <View style={styles.supportSection}>
                    <TouchableOpacity
                        style={styles.supportItem}
                        onPress={handleHelpSupport}
                    >
                        <View style={styles.supportIconContainer}>
                            <Text style={styles.supportIcon}>❓</Text>
                        </View>
                        <Text style={styles.supportText}>Help & Support</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.supportItem}
                        onPress={openEmail}
                    >
                        <View style={styles.supportIconContainer}>
                            <Text style={styles.supportIcon}>💬</Text>
                        </View>
                        <Text style={styles.supportText}>Send Feedback</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.premiumButton}
                        onPress={handleModalSheet}
                    >
                        <Text style={styles.premiumText}>💰</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.supportItem, styles.logoutItem]}
                        onPress={handleLogout}
                    >
                        <View style={[styles.supportIconContainer, styles.logoutIconContainer]}>
                            <Text style={styles.supportIcon}>🚪</Text>
                        </View>
                        <Text style={[styles.supportText, styles.logoutText]}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('TermsOfService')}
                    >
                        <Text style={styles.menuItemText}>Terms of Service</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('PrivacyPolicy')}
                    >
                        <Text style={styles.menuItemText}>Privacy Policy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('About')}
                    >
                        <Text style={styles.menuItemText}>About</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity
                        style={[styles.menuItem, styles.deleteButton]}
                        onPress={handleDeleteAccount}
                    >
                        <Text style={styles.deleteText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </CustomSafeAreaView>
    );
};

export default SettingsScreen;
