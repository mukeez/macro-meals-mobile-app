import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Animated, {
  useAnimatedStyle,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import useStore from "../store/useStore";
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import { IMAGE_CONSTANTS } from "../constants/imageConstants";
import CustomTouchableOpacityButton from "../components/CustomTouchableOpacityButton";
import { CircularProgress } from "../components/CircularProgress";
import { LinearProgress } from "../components/LinearProgress";
import { RootStackParamList } from "../types/navigation";

// type RootStackParamList = {
//     MacroInput: undefined;
//     Scan: undefined;
//     MealLog: {
//         date: string;
//     };
//     Settings: undefined;
//     SettingsScreen: undefined;
// };

type Profile = {
  display_name?: string;
  email?: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  is_pro?: boolean;
  has_macros?: boolean;
  meal_reminder_preferences_set?: boolean;
  is_active?: boolean;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TodayMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  meal_time: string;
  created_at: string;
  user_id: string;
}

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  // State for user data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [macros, setMacros] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
  });
  const [consumed, setConsumed] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
    calories: 0,
  });

  const [profile, setProfile] = useState<Profile>({
    display_name: undefined,
    email: undefined,
    avatar_url: undefined,
    first_name: undefined,
    last_name: undefined,
    gender: undefined,
    is_active: undefined,
    is_pro: undefined,
    meal_reminder_preferences_set: undefined,
    has_macros: undefined,
  });

  const [todayMeals, setTodayMeals] = useState<TodayMeal[]>([]);
  const [username, setUsername] = useState("User");
  const [progress, setProgress] = useState(0);

  const userId = useStore((state) => state.userId);
  const token = useStore((state) => state.token);
  const preferences = useStore((state) => state.preferences);

  // useEffect(() => {
  //     if (preferences.calories === 0 && preferences.protein === 0) {
  //         navigation.navigate('MacroInput');
  //     }
  // }, [preferences]);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (!token) {
          throw new Error("Authentication token not available");
        }

        // 1. Fetch user profile info
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
        console.log("THIS IS THE PROFILE DATA OLD", profileData);
        setProfile(profileData);
        console.log("THE SET PROFILE", profile);
        setUsername(profileData.display_name || undefined);

        const prefsResponse = await fetch(
          "https://api.macromealsapp.com/api/v1/user/preferences",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log('PREFS RESPONSE', prefsResponse.json);
        if (!prefsResponse.ok) {
          throw new Error("Failed to fetch user preferences");
        }

        const prefsData = await prefsResponse.json();
        setMacros({
          protein: prefsData.protein_target,
          carbs: prefsData.carbs_target,
          fat: prefsData.fat_target,
          calories: prefsData.calorie_target,
        });

        const progressResponse = await fetch(
          "https://api.macromealsapp.com/api/v1/meals/progress/today",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!progressResponse.ok) {
          throw new Error("Failed to fetch daily progress");
        }

        const progressData = await progressResponse.json();

        setConsumed({
          protein: progressData.logged_macros.protein,
          carbs: progressData.logged_macros.carbs,
          fat: progressData.logged_macros.fat,
          calories: progressData.logged_macros.calories,
        });

        const totalCalories = macros.calories;
        const progressPercentage =
          totalCalories > 0 ? (consumed.calories / totalCalories) * 100 : 0;
        setProgress(Math.min(100, progressPercentage));
        const todayMealsResponse = await fetch(
          "https://api.macromealsapp.com/api/v1/meals/today",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!todayMealsResponse.ok) {
          throw new Error("Failed to fetch today's meals");
        }
        const todayMealsData = await todayMealsResponse.json();
        console.log("THIS IS THE TODAY MEALS DATA", todayMealsData);
        setTodayMeals(todayMealsData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError("Failed to load your data. Please try again.");
        setIsLoading(false);

        // Fallback to existing preferences from the store
        // in case the API calls fail
        if (preferences) {
          setMacros({
            protein: preferences.protein || 0,
            carbs: preferences.carbs || 0,
            fat: preferences.fat || 0,
            calories: preferences.calories || 0,
          });
        }
      }
    };

    fetchUserData();
  }, [userId, token]);

  const handleMacroInput = () => {
    // Do NOT call setMajorStep or setSubStep here. State should only be advanced when user completes a major step.
    navigation.navigate('GoalSetupScreen', undefined);
  };


  const handleMealLog = () => {
    navigation.navigate("MealFinderScreen");
  };

  const handleRefresh = () => {
    setIsLoading(true);
  };



  const animatedStyle = useAnimatedStyle(() => {
    const animatedProgress = withTiming(progress, { duration: 1000 });
    return {
      borderColor: "#44A047",
      borderWidth: 4,
      borderRadius: 100,
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      transform: [{ rotate: `${(animatedProgress / 100) * 360}deg` }],
      borderTopColor: "transparent",
      borderRightColor: "transparent",
      borderLeftColor: "#44A047",
      borderBottomColor: "#44A047",
    };
  });

  const baseCircleStyle = {
    borderColor: "#d0e8d1",
    borderWidth: 4,
    borderRadius: 100,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#19a28f" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const remaining = {
    protein: Math.max(0, macros.protein - consumed.protein),
    carbs: Math.max(0, macros.carbs - consumed.carbs),
    fat: Math.max(0, macros.fat - consumed.fat),
    calories: Math.max(0, macros.calories - consumed.calories),
  };

  const proteinProgress = Math.min(
    100,
    Math.round((consumed.protein / macros.protein) * 100) || 0
  );
  const carbsProgress = Math.min(
    100,
    Math.round((consumed.carbs / macros.carbs) * 100) || 0
  );
  const fatProgress = Math.min(
    100,
    Math.round((consumed.fat / macros.fat) * 100) || 0
  );

  // Calculate today's total macros from todayMeals
  const todayMealsSum = todayMeals.reduce(
    (acc, meal) => ({
      carbs: acc.carbs + (meal.carbs || 0),
      fat: acc.fat + (meal.fat || 0),
      protein: acc.protein + (meal.protein || 0),
    }),
    { carbs: 0, fat: 0, protein: 0 }
  );

  function formatDate(date: Date) {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      day: "2-digit",
      month: "short",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);
    const parts = formattedDate.split(", ");
    const dayOfWeek = parts[0];
    const monthAndDate = parts[1];
    const [month, day] = monthAndDate.split(" ");
    return `${dayOfWeek}, ${day} ${month}`;
  }

  function getGreeting(username: string) {
    if (username === undefined) {
      return "Hello there 👋";
    }
    const hour = new Date().getHours();
    if (hour < 12) return `Good morning, ${username} 👋`;
    if (hour < 18) return `Good afternoon, ${username} 👋`;
    return `Good evening, ${username} 👋`;
  }

  function getTimeOfDayEmoji() {
    const hour = new Date().getHours();
    if (hour < 12) return "🌞";
    if (hour < 18) return "⛅️";
    return "🌙";
  }

  function formatTime(timeString: string) {
    const date = new Date(timeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }

  return (
    <CustomSafeAreaView
      edges={["left", "right"]}
      paddingOverride={{ bottom: -25 }}
    >
      <View className="flex-1">
        <ScrollView>
          <View className="flex-1 bg-[#F5F5F5] mt-4">
            <View className="flex-row items-center justify-between px-5 pb-4 bg-white">
              <View className="flex-col items-start gap-2">
                <Text className="text-[13px] font-normal">
                  {formatDate(new Date())} {getTimeOfDayEmoji()}
                </Text>
                <Text className="text-[18px] font-medium text-black">
                  {getGreeting(username)}
                </Text>
              </View>
              <Image
                source={IMAGE_CONSTANTS.mealsIcon}
                className="w-[24px] h-[24px] object-fill"
              />
            </View>
            {profile.has_macros === false ||
              profile.has_macros === undefined ? (
                <View className="flex-col bg-paleCyan px-5 py-5">
                  <Image
                    tintColor={"#8BAAA3"}
                    source={IMAGE_CONSTANTS.trophy}
                    className="absolute bottom-4 tint right-4 w-[74px] h-[74px] object-fill"
                  />
                  <View className="relative">
                    <Text className="text-base font-semibold mb-2">
                      Set up your Macro goals
                    </Text>
                    <Text className="tracking-wide text-[13px] font-normal mb-3 mr-10">
                      Set your macro goals to get personalized tracking and
                      tailored recommendations.
                    </Text>
                    <TouchableOpacity
                      className="bg-primary w-[105px] h-[32px] rounded-[100px] justify-center items-center"
                      onPress={handleMacroInput}
                    >
                      <Text className="text-white text-sm font-semibold">
                        Set up now
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ): <></>}
            <View className="mb-6 bg-white px-5 py-6">
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-col">
                  <Text className="text-3xl text-center font-semibold -tracking-wider">
                    {remaining.calories}
                  </Text>
                  <Text className="text-sm text-textMediumGrey text-center font-medium">
                    Remaining
                  </Text>
                </View>

                <View className="h-[150px] w-[150px] relative">
                  <CircularProgress
                    size={150}
                    strokeWidth={8}
                    consumed={consumed.calories.toString()}
                    total={consumed.calories + remaining.calories}
                    color="#44A047"
                    backgroundColor="#d0e8d1"
                    label="Consumed"
                  />
                </View>

                <View className="flex-col">
                  <Text className="text-3xl text-center font-semibold -tracking-wider">
                    {macros.calories}
                  </Text>
                  <Text className="text-sm text-textMediumGrey text-center font-medium">
                    Goal
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between w-full">
                <View className="flex-col items-center justify-center">
                  <Text className="text-sm text-textMediumGrey text-center font-medium mb-1">
                    Carbs
                  </Text>
                  <LinearProgress
                    progress={(todayMealsSum.carbs / macros.carbs) * 100}
                    color="#FFC107"
                  />
                  <Text className="text-sm text-textMediumGrey text-center font-medium mt-1">
                    {todayMealsSum.carbs}/{macros.carbs}g
                  </Text>
                </View>
                <View className="flex-col items-center justify-center">
                  <Text className="text-sm text-textMediumGrey text-center font-medium mb-1">
                    Fats
                  </Text>
                  <LinearProgress
                    progress={(todayMealsSum.fat / macros.fat) * 100}
                    color="#FF69B4"
                  />
                  <Text className="text-sm text-textMediumGrey text-center font-medium mt-1">
                    {todayMealsSum.fat}/{macros.fat}g
                  </Text>
                </View>
                <View className="flex-col items-center justify-center">
                  <Text className="text-sm text-textMediumGrey text-center font-medium mb-1">
                    Protein
                  </Text>
                  <LinearProgress
                    progress={(todayMealsSum.protein / macros.protein) * 100}
                    color="#6A5ACD"
                  />
                  <Text className="text-sm text-textMediumGrey text-center font-medium mt-1">
                    {todayMealsSum.protein}/{macros.protein}g
                  </Text>
                </View>
              </View>
            </View>
            {/* See nearby meals */}
            {profile.has_macros === true && (
              <View className="flex-row bg-lightGreen justify-between items-center rounded-md mx-5 mb-4">
                <View className="flex-1 flex-col pl-5 pr-2 py-6">
                  <Text className="text-base font-semibold">
                    Don't know what to eat?
                  </Text>
                  <Text
                    className="text-sm text-textMediumGrey font-medium"
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    Discover local meals meeting your daily macro targets
                  </Text>
                  <TouchableOpacity
                    className="bg-primary w-[144px] h-[32px] rounded-[200px] justify-center items-center mt-4"
                    onPress={handleMealLog}
                  >
                    <Text className="text-white text-sm font-semibold">
                      See nearby meals
                    </Text>
                  </TouchableOpacity>
                </View>
                <Image
                  source={IMAGE_CONSTANTS.sampleFood}
                  className="w-[133px] rounded-r-md h-full"
                  style={{ flexShrink: 0 }}
                />
              </View>
            )}

            {/* Recently uploaded */}
            <View className="flex-col bg-white px-5 py-6 mb-4">
              <Text className="text-[18px] font-semibold">
                Recently uploaded
              </Text>
              {todayMeals.length === 0 ? (
                <View className="flex-col items-center justify-center h-[150px] mx-20">
                  <Text className="tracking-normal leading-5 text-[14px] font-medium text-center">
                    Your recently logged meals for the day will show up here
                  </Text>
                </View>
              ) : (
                todayMeals.map((meal, index) => (
                  <View key={index} className="flex-row items-start mt-3">
                    <Image
                      source={IMAGE_CONSTANTS.sampleFood}
                      className="w-[90px] h-[90px] object-fill mr-2"
                    />
                    <View className="flex-1 flex-col">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text
                          className="text-sm text-textMediumGrey font-medium flex-1 mr-2"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {meal.name}
                        </Text>
                        <TouchableOpacity>
                          <View className="w-[24px] h-[24px] rounded-full justify-center items-center bg-gray-100">
                            <Image
                              source={IMAGE_CONSTANTS.editIcon}
                              className="w-[13px] h-[13px]"
                              tintColor="#253238"
                            />
                          </View>
                        </TouchableOpacity>
                      </View>
                      <View className="flex-row items-center mb-2">
                        <Text className="text-sm text-textMediumGrey text-center font-medium mr-2">
                          {formatTime(meal.meal_time)}
                        </Text>
                        <View className="w-[4px] h-[4px] rounded-full bg-[#253238] mr-2"></View>
                        <Image
                          source={IMAGE_CONSTANTS.mealScan}
                          className="w-[16px] h-[16px] object-fill mr-1"
                        />
                        <Text className="text-sm text-textMediumGrey text-center font-medium">
                          Meal Scan
                        </Text>
                      </View>

                      <View className="flex-row items-center gap-3">
                        <View className="flex-row items-center justify-center gap-1">
                          <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-kryptoniteGreen rounded-full">
                            <Image
                              source={IMAGE_CONSTANTS.caloriesIcon}
                              className="w-[10px] h-[10px] object-fill"
                            />
                          </View>
                          <Text className="text-xsm text-black text-center font-medium">
                            {meal.calories} cal
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                          <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-amber rounded-full">
                            <Text className="text-white text-[10px] text-center font-medium">
                              C
                            </Text>
                          </View>
                          <Text className="text-xsm text-textMediumGrey text-center font-medium">
                            {meal.carbs}g
                          </Text>
                        </View>

                        <View className="flex-row items-center gap-1">
                          <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-lavenderPink rounded-full">
                            <Text className="text-white text-[10px] text-center font-medium">
                              F
                            </Text>
                          </View>
                          <Text className="text-xsm text-textMediumGrey text-center font-medium">
                            {meal.fat}g
                          </Text>
                        </View>

                        <View className="flex-row items-center gap-1">
                          <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-gloomyPurple rounded-full">
                            <Text className="text-white text-[10px] text-center font-medium">
                              P
                            </Text>
                          </View>
                          <Text className="text-xsm text-textMediumGrey text-center font-medium">
                            {meal.protein}g
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </ScrollView>
      </View>
    </CustomSafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#ff6b6b",
    marginBottom: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#19a28f",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoBox: {
    width: 40,
    height: 40,
    backgroundColor: "#19a28f",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  logoIcon: {
    fontSize: 22,
    color: "white",
  },
  logoText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#19a28f",
    marginLeft: 8,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
  },
  profileText: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  greetingContainer: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  subGreeting: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  progressContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#19a28f",
  },
  macroCirclesContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  macroItem: {
    alignItems: "center",
  },
  macroCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#f1f1f1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  macroProgress: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    width: "100%",
  },
  macroInnerCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  macroValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  macroLabel: {
    fontSize: 14,
    color: "#666",
  },
  caloriesSummary: {
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 16,
    marginTop: 8,
  },
  caloriesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  caloriesLabel: {
    fontSize: 16,
    color: "#666",
  },
  caloriesValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  remainingValue: {
    color: "#19a28f",
  },
  actionButton: {
    backgroundColor: "#19a28f",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  actionButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  findMealsButton: {
    backgroundColor: "#f5a623",
  },
  mealLogButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  mealLogButtonText: {
    color: "#333",
    fontSize: 18,
    fontWeight: "500",
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingVertical: 8,
    backgroundColor: "#fff",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  navIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    color: "#666",
  },
  navActiveText: {
    fontSize: 12,
    color: "#19a28f",
    fontWeight: "bold",
  },
  baseCircle: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 4,
    borderRadius: 100,
  },
  progressCircle: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 4,
    borderRadius: 100,
  },
});
