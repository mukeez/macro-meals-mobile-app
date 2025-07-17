import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Platform,
  Keyboard,
} from "react-native";
import { userService } from "../services/userService";
import { authService } from "../services/authService";
import useStore from "../store/useStore";
import { useNavigation } from "@react-navigation/native";
import CustomSafeAreaView from "src/components/CustomSafeAreaView";
import DateTimePicker from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMixpanel } from "@macro-meals/mixpanel";

function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
];

function formatDate(dateStr: string) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "-";
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${d.getFullYear()}`;
}

export default function AccountSettingsScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDate, setTempDate] = useState<Date | null>(null);
  const [localValues, setLocalValues] = useState<{ [key: string]: string }>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const inputRefs = useRef<{ [key: string]: TextInput | null }>({});
  const userRef = useRef<any>(null);
  const navigation = useNavigation();
  const debouncedPatch = useRef<{ [key: string]: (...args: any[]) => void }>(
    {}
  );
  const mixpanel = useMixpanel();
  const [heightUnit, setHeightUnit] = useState("cm");
  const [weightUnit, setWeightUnit] = useState("kg");

  useEffect(() => {
    if (user) {
      setHeightUnit(
        user.height_unit_preference === "imperial" ? "ft/in" : "cm"
      );
      setWeightUnit(user.weight_unit_preference === "imperial" ? "lbs" : "kg");
    }
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getProfile();
        setUser(data);
        userRef.current = data;
        setLocalValues({
          first_name: data?.first_name || "",
          last_name: data?.last_name || "",
          height: data?.height?.toString() || "",
          weight: data?.weight?.toString() || "",
        });
      } catch (e) {
        setUser(null);
        userRef.current = null;
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const updateUserSilently = useCallback(
    (newData: any) => {
      userRef.current = newData;
      // Only update user state if the field being updated is not currently focused
      if (!focusedField) {
        setUser(newData);
      }
    },
    [focusedField]
  );

  // Update Mixpanel user properties when user data changes
  const updateMixpanelUserProperties = useCallback(
    (updatedFields: any) => {
      if (!mixpanel) return;

      const propertiesToUpdate: any = {};

      // Map backend field names to Mixpanel property names
      if (updatedFields.first_name !== undefined) {
        propertiesToUpdate.first_name = updatedFields.first_name;
      }
      if (updatedFields.last_name !== undefined) {
        propertiesToUpdate.last_name = updatedFields.last_name;
      }
      if (updatedFields.sex !== undefined) {
        propertiesToUpdate.gender = updatedFields.sex;
      }
      if (updatedFields.dob !== undefined) {
        propertiesToUpdate.birthday = updatedFields.dob;
      }
      if (updatedFields.height !== undefined) {
        propertiesToUpdate.height = updatedFields.height;
      }
      if (updatedFields.weight !== undefined) {
        propertiesToUpdate.weight = updatedFields.weight;
      }

      // Only update if there are properties to update
      if (Object.keys(propertiesToUpdate).length > 0) {
        mixpanel.setUserProperties(propertiesToUpdate);
        console.log(
          "[MIXPANEL] 📝 Updated user properties:",
          propertiesToUpdate
        );
      }
    },
    [mixpanel]
  );

  const getDebouncedPatch = (field: string) => {
    if (!debouncedPatch.current[field]) {
      debouncedPatch.current[field] = debounce(async (value: any) => {
        if (!value || value === userRef.current[field]) return;

        setUpdating((prev) => ({ ...prev, [field]: true }));
        try {
          const patch: any = {};
          patch[field] = value;
          await userService.updateProfile(patch);

          // Update Mixpanel user properties
          updateMixpanelUserProperties(patch);

          // Update user data in background without affecting the UI
          setTimeout(async () => {
            try {
              const freshUserData = await userService.getProfile();
              updateUserSilently(freshUserData);
            } catch (e) {
              console.error("Failed to refresh user data:", e);
            }
          }, 1000);
        } catch (e) {
          Alert.alert("Error", "Failed to update profile");
          setLocalValues(prev => ({
            ...prev,
            [field]: userRef.current[field]?.toString() || "",
          }));
        } finally {
          setUpdating((prev) => ({ ...prev, [field]: false }));
        }
      }, 1500);
    }
    return debouncedPatch.current[field];
  };

  const handleFieldChange = (field: string, value: any) => {
    setLocalValues(prev => ({ ...prev, [field]: value }));
    getDebouncedPatch(field)(value);
  };

  // When field loses focus, update the user state
  const handleFieldBlur = (field: string) => {
    setFocusedField(null);
    // Update the user state with the latest data
    setUser(userRef.current);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Track account deletion in Mixpanel
              mixpanel?.track({
                name: "account_deleted",
                properties: {
                  user_id: userRef.current?.id,
                  email: userRef.current?.email,
                  account_age_days: userRef.current?.created_at
                    ? Math.floor(
                        (Date.now() -
                          new Date(userRef.current.created_at).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    : 0,
                },
              });

              await authService.deleteAccount();
            } catch (error) {
              console.error("Error during account deletion:", error);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#19a28f" />
      </View>
    );
  }

  return (
    <CustomSafeAreaView className="flex-1 bg-white" edges={["left", "right"]}>
      <ScrollView
        contentContainerStyle={{ backgroundColor: "#f8f8f8", flexGrow: 1 }}
      >
        <View className="flex-row bg-white items-center justify-between px-5 pt-4 pb-5 mb-5">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-8 h-8 rounded-full justify-center items-center bg-[#F5F5F5]"
          >
            <Text className="text-[22px]">‹</Text>
          </TouchableOpacity>
          <Text className="text-[20px] font-semibold text-[#222] text-center">
            Account Settings
          </Text>
          <View className="w-8" />
        </View>
        <View className="bg-white rounded-2xl mx-3 px-0 py-0 shadow-sm">
          {/* Email */}
          <View className="flex-row items-center min-h-[56px] border-b border-[#f0f0f0] px-4">
            <Text className="flex-1 text-base text-[#222]">Email</Text>
            <Text className="text-base text-[#888]">
              {userRef.current?.email || "-"}
            </Text>
          </View>
          {/* First name */}
          <View className="flex-row items-center min-h-[56px] border-b border-[#f0f0f0] px-4">
            <Text className="flex-1 text-base text-[#222]">First name</Text>
            <TextInput
              ref={(ref) => {
                if (ref) {
                  inputRefs.current.first_name = ref;
                }
              }}
              value={localValues.first_name}
              onChangeText={(v) => handleFieldChange("first_name", v)}
              onFocus={() => setFocusedField("first_name")}
              onBlur={() => handleFieldBlur("first_name")}
              className="text-base text-[#222] text-right flex-1 min-w-[80px]"
              placeholder="First name"
              editable={!updating.first_name}
              underlineColorAndroid="transparent"
            />
            {updating.first_name && (
              <ActivityIndicator
                size="small"
                color="#19a28f"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
          {/* Last name */}
          <View className="flex-row items-center min-h-[56px] border-b border-[#f0f0f0] px-4">
            <Text className="flex-1 text-base text-[#222]">Last name</Text>
            <TextInput
              ref={(ref) => {
                if (ref) {
                  inputRefs.current.last_name = ref;
                }
              }}
              value={localValues.last_name}
              onChangeText={(v) => handleFieldChange("last_name", v)}
              onFocus={() => setFocusedField("last_name")}
              onBlur={() => handleFieldBlur("last_name")}
              className="text-base text-[#222] text-right flex-1 min-w-[80px]"
              placeholder="Last name"
              editable={!updating.last_name}
              underlineColorAndroid="transparent"
            />
            {updating.last_name && (
              <ActivityIndicator
                size="small"
                color="#19a28f"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
          {/* Birthday */}
          <TouchableOpacity
            className="flex-row items-center min-h-[56px] border-b border-[#f0f0f0] px-4"
            onPress={() => {
              Keyboard.dismiss();
              setTempDate(
                userRef.current?.dob
                  ? new Date(userRef.current.dob)
                  : new Date()
              );
              setShowDatePicker(true);
            }}
            activeOpacity={0.7}
          >
            <Text className="flex-1 text-base text-[#222]">Birthday</Text>
            <Text className="text-base text-[#222]">
              {formatDate(userRef.current?.dob)}
            </Text>
          </TouchableOpacity>
          {/* Gender */}
          <View className="flex-row items-center min-h-[56px] border-b border-[#f0f0f0] px-4">
            <Text className="flex-1 text-base text-[#222]">Gender</Text>
            <View className="flex-1 items-end">
              <TextInput
                value={
                  userRef.current?.sex === "male"
                    ? "Male"
                    : userRef.current?.sex === "female"
                    ? "Female"
                    : ""
                }
                onFocus={() => {}}
                className="text-base text-[#222] text-right min-w-[60px]"
                placeholder="Gender"
                editable={false}
                pointerEvents="none"
              />
              <View
                className="absolute right-0 top-0 bottom-0 w-full"
                pointerEvents="box-none"
              >
                <TouchableOpacity
                  className="flex-1 w-full h-full"
                  onPress={() => {
                    Keyboard.dismiss();
                    Alert.alert(
                      "Select Gender",
                      undefined,
                      GENDER_OPTIONS.map((opt) => ({
                        text: opt.label,
                        onPress: () => handleFieldChange("sex", opt.value),
                      }))
                    );
                  }}
                />
              </View>
            </View>
            {updating.sex && (
              <ActivityIndicator
                size="small"
                color="#19a28f"
                style={{ marginLeft: 8 }}
              />
            )}
          </View>
          {/* Height */}
          <View className="flex-row items-center min-h-[56px] px-4">
            <Text className="flex-1 text-base text-[#222]">Height</Text>
            <View className="flex-row items-center flex-1 justify-end">
              <TextInput
                value={localValues.height}
                onChangeText={(v) =>
                  handleFieldChange("height", v.replace(/[^0-9]/g, ""))
                }
                className="text-base text-[#222] text-right min-w-[60px]"
                placeholder={`Height (${heightUnit})`}
                editable={!updating.height}
                underlineColorAndroid="transparent"
                keyboardType="numeric"
                style={{ flex: 1, textAlign: "right" }}
              />
              <Text style={{ marginLeft: 4, color: "#888" }}>{heightUnit}</Text>
              {updating.height && (
                <ActivityIndicator
                  size="small"
                  color="#19a28f"
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
          </View>
          {/* Weight */}
          <View className="flex-row items-center min-h-[56px] px-4">
            <Text className="flex-1 text-base text-[#222]">Weight</Text>
            <View className="flex-row items-center flex-1 justify-end">
              <TextInput
                value={localValues.weight}
                onChangeText={(v) =>
                  handleFieldChange("weight", v.replace(/[^0-9]/g, ""))
                }
                className="text-base text-[#222] text-right min-w-[60px]"
                placeholder={`Weight (${weightUnit})`}
                editable={!updating.weight}
                underlineColorAndroid="transparent"
                keyboardType="numeric"
                style={{ flex: 1, textAlign: "right" }}
              />
              <Text style={{ marginLeft: 4, color: "#888" }}>{weightUnit}</Text>
              {updating.weight && (
                <ActivityIndicator
                  size="small"
                  color="#19a28f"
                  style={{ marginLeft: 8 }}
                />
              )}
            </View>
          </View>
        </View>
        {/* Date Picker Bottom Modal */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-white rounded-t-xl p-4">
              <Text className="text-center text-base font-semibold mb-2">
                Select Birthday
              </Text>
              <DateTimePicker
                value={tempDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, selectedDate) => {
                  if (selectedDate) setTempDate(selectedDate);
                }}
                maximumDate={new Date()}
              />
              <View className="flex-row justify-between mt-4">
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  className="flex-1 items-center py-2"
                >
                  <Text className="text-lg text-blue-500">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (tempDate) {
                      handleFieldChange(
                        "dob",
                        tempDate.toISOString().split("T")[0]
                      );
                    }
                    setShowDatePicker(false);
                  }}
                  className="flex-1 items-center py-2"
                >
                  <Text className="text-lg text-blue-500">Done</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <View className="mt-8 mx-4">
          <TouchableOpacity
            className="pl-4 flex-row justify-start bg-white rounded-xl py-6"
            onPress={handleDeleteAccount}
          >
            <Text className="text-punchRed text-left font-semibold text-base">
              Delete account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </CustomSafeAreaView>
  );
}
