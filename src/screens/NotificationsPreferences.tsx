import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Switch,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import Header from "../components/Header";
import { userService } from "../services/userService";

export default function NotificationsPreferences() {
  const [toggles, setToggles] = useState({
    mealReminders: false,
  });
  const [loading, setLoading] = useState({
    mealReminders: false,
  });

  // Fetch preferences on mount
  useEffect(() => {
    async function fetchPreferences() {
      try {
        const user = await userService.getPreferences();
        console.log("API response:", user);
        setToggles({
          mealReminders: !!user.meal_reminder_preferences_set,
        });
      } catch (e) {
        console.error("API ERROR:", e, e?.message, e?.stack);
        Alert.alert("Error", "Could not load preferences.");
      } finally {
        setLoading((prev) => ({ ...prev, initial: false }));
      }
    }
    fetchPreferences();
  }, []);

  const handleToggle = async (value: boolean) => {
    setLoading((prev) => ({ ...prev, mealReminders: true }));
    try {
      await userService.updatePreferences({
        meal_reminder_preferences_set: value,
      });
      setToggles((prev) => ({ ...prev, mealReminders: value }));
    } catch (e) {
      Alert.alert("Error", "Could not update preference. Please try again.");
    } finally {
      setLoading((prev) => ({ ...prev, mealReminders: false }));
    }
  };

  return (
    <CustomSafeAreaView>
      <Header title="Notification Preferences" />
      <View className="bg-white px-4 pt-6">
        {/* Meal Reminders */}
        <View className="mb-4">
          <View className="flex-row items-center justify-between px-2 py-4 rounded-lg bg-white">
            <Text className="text-base font-medium text-[#333]">
              Meal Reminders
            </Text>
            <View className="flex-row items-center">
              {loading.mealReminders && (
                <ActivityIndicator
                  size="small"
                  color="#009688"
                  style={{ marginRight: 8 }}
                />
              )}
              <Switch
                value={toggles.mealReminders}
                onValueChange={(v) => handleToggle(v)}
                disabled={loading.mealReminders}
                ios_backgroundColor="#ddd"
                trackColor={{ false: "#ddd", true: "#009688" }}
                thumbColor={
                  Platform.OS === "android"
                    ? toggles.mealReminders
                      ? "#009688"
                      : "#f4f3f4"
                    : undefined
                }
              />
            </View>
          </View>
          {/* Static Details always visible */}
          <View className="pl-6 py-2 bg-gray-50 rounded-b-lg border-t border-gray-200">
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-700">Breakfast</Text>
              <Text className="text-sm text-gray-700">08:00 AM</Text>
            </View>
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-700">Lunch</Text>
              <Text className="text-sm text-gray-700">12:30 PM</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-700">Dinner</Text>
              <Text className="text-sm text-gray-700">07:00 PM</Text>
            </View>
          </View>
        </View>

        {/* Progress Alerts */}
        {/* <View className="mb-2">
          <View className="flex-row items-center justify-between px-2 py-4 rounded-lg bg-white">
            <Text className="text-base font-medium text-[#333]">
              Progress Alerts
            </Text>
            <View className="flex-row items-center">
              {loading.progressAlerts && (
                <ActivityIndicator
                  size="small"
                  color="#009688"
                  style={{ marginRight: 8 }}
                />
              )}
              <Switch
                value={toggles.progressAlerts}
                onValueChange={(v) => handleToggle("progressAlerts", v)}
                disabled={loading.progressAlerts}
                ios_backgroundColor="#ddd"
                trackColor={{ false: "#ddd", true: "#009688" }}
                thumbColor={
                  Platform.OS === "android"
                    ? toggles.progressAlerts
                      ? "#009688"
                      : "#f4f3f4"
                    : undefined
                }
              />
            </View>
          </View>
        </View> */}
      </View>
    </CustomSafeAreaView>
  );
}
