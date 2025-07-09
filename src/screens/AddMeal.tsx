import React, { useState, useEffect } from "react";
import { ScrollView, View, Text, Image, TouchableOpacity, Modal, Pressable, ActionSheetIOS, Platform, RefreshControl, ActivityIndicator, Alert } from "react-native";
import { LinearProgress } from "../components/LinearProgress";
import { IMAGE_CONSTANTS } from "../constants/imageConstants";
import { getMeals } from "../services/mealService";
import { mealService } from "../services/mealService";
import useStore from "../store/useStore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FILTER_OPTIONS = [
  { label: "Today", value: "today" },
  { label: "1 week", value: "1w" },
  { label: "1 month", value: "1m" },
  { label: "Custom", value: "custom" },
];

function getStartEndDates(range: string): { startDate: string; endDate: string } {
  const today = new Date();
  let startDate = new Date(today);
  switch (range) {
    case "today":
      break;
    case "1w":
      startDate.setDate(today.getDate() - 6);
      break;
    case "1m":
      startDate.setMonth(today.getMonth() - 1);
      break;
    default:
      break;
  }
  const format = (date: Date) => date.toISOString().split("T")[0];
  return { startDate: format(startDate), endDate: format(today) };
}

const macroData = [
  { label: 'Calories', key: 'calories', color: '#44A047' },
  { label: 'Carbs', key: 'carbs', color: '#FFC107' },
  { label: 'Fat', key: 'fat', color: '#FF69B4' },
  { label: 'Protein', key: 'protein', color: '#6A5ACD' },
] as const;

const AddMeal: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [selectedRange, setSelectedRange] = useState("today");
  const [modalVisible, setModalVisible] = useState(false);
  const [meals, setMeals] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const macrosPreferences = useStore((state) => state.macrosPreferences);
  const todayProgress = useStore((state) => state.todayProgress) || { protein: 0, carbs: 0, fat: 0, calories: 0 };

  const fetchMeals = async () => {
    const { startDate, endDate } = getStartEndDates(selectedRange);
    try {
      setLoading(true);
      const mealsData = await getMeals(startDate, endDate);
      setMeals(mealsData);
    } catch (e) {
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [selectedRange]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMeals();
    setRefreshing(false);
  };

  const handleDeleteMeal = async (mealId: string) => {
    Alert.alert(
      "Delete log",
      "This action cannot be undone and will adjust your remaining macro calculations and progress metrics.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await mealService.deleteMeal(mealId);
              // Refresh the meals list
              fetchMeals();
            } catch (error) {
              console.error('Error deleting meal:', error);
              Alert.alert('Error', 'Failed to delete meal. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Group meals by mealType
  const mealSections = [
    { key: "breakfast", emoji: "☀️", label: "Breakfast", meals: meals.filter(m => m.meal_type === "breakfast") },
    { key: "lunch", emoji: "🥗", label: "Lunch", meals: meals.filter(m => m.meal_type === "lunch") },
    { key: "dinner", emoji: "🍽️", label: "Dinner", meals: meals.filter(m => m.meal_type === "dinner") },
  ].filter(section => section.meals.length > 0); // Only show sections that have meals

  const showFilterSheet = () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: "Filter your meals",
          message: "Select a time frame to view your meals over time.",
          options: ["Today", "1 week", "1 month", "Custom", "Cancel"],
          cancelButtonIndex: 4,
          destructiveButtonIndex: undefined,
        },
        (buttonIndex) => {
          if (buttonIndex === 0) setSelectedRange("today");
          else if (buttonIndex === 1) setSelectedRange("1w");
          else if (buttonIndex === 2) setSelectedRange("1m");
          else if (buttonIndex === 3) setSelectedRange("custom");
          // Cancel does nothing
        }
      );
    } else {
      setModalVisible(true); // fallback to your custom modal for Android
    }
  };

  return (
    <View className="flex-1 bg-[#F5F5F5]">
      {/* Top section: Range/filter and progress bars in one column */}
      <View className="bg-primaryLight px-4 pt-[60px] pb-6 mb-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-1"></View>
          
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => {
              const currentIndex = FILTER_OPTIONS.findIndex(opt => opt.value === selectedRange);
              const prevIndex = currentIndex > 0 ? currentIndex - 1 : FILTER_OPTIONS.length - 1;
              setSelectedRange(FILTER_OPTIONS[prevIndex].value);
            }}>
              <Text className="text-white text-2xl font-bold">‹</Text>
            </TouchableOpacity>
            
            <Text className="text-white text-lg font-semibold mx-4">{FILTER_OPTIONS.find(opt => opt.value === selectedRange)?.label || "Today"}</Text>
            
            <TouchableOpacity onPress={() => {
              const currentIndex = FILTER_OPTIONS.findIndex(opt => opt.value === selectedRange);
              const nextIndex = currentIndex < FILTER_OPTIONS.length - 1 ? currentIndex + 1 : 0;
              setSelectedRange(FILTER_OPTIONS[nextIndex].value);
            }}>
              <Text className="text-white text-2xl font-bold">›</Text>
            </TouchableOpacity>
          </View>
          
          <View className="flex-1 items-end">
            <TouchableOpacity onPress={showFilterSheet}>
              <Image source={IMAGE_CONSTANTS.filterIcon} className="w-7 h-7" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Macros Progress Section */}
        <View className="bg-white/20 rounded-2xl mt-3 px-4 py-4">
          <View className="flex-row items-center justify-start mb-3">
            <Text className="text-white text-base font-medium">
              Calories remaining ({Math.max(0, (macrosPreferences?.calorie_target || 0) - todayProgress.calories)})
            </Text>
          </View>
          <View className="flex-row items-center justify-between w-full">
            {macroData.map((macro) => (
              <View key={macro.label} className="flex-col items-center justify-center">
                <Text className="text-white text-[11px] font-medium mb-1">
                  {macro.key === 'calories' 
                    ? `${todayProgress.calories}/${macrosPreferences?.calorie_target || 0}`
                    : `${todayProgress[macro.key]}/${macrosPreferences?.[`${macro.key}_target`] || 0}`
                  }
                </Text>
                <LinearProgress
                  width={78}
                  progress={
                    macro.key === 'calories' 
                      ? (todayProgress.calories / (macrosPreferences?.calorie_target || 1)) * 100
                      : (todayProgress[macro.key] / (macrosPreferences?.[`${macro.key}_target`] || 1)) * 100
                  }
                  color={macro.color}
                  backgroundColor="#E5E5E5"
                />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Meals List */}
      <ScrollView
        className="flex-1" 
        contentContainerStyle={{ paddingBottom: 32 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#7E54D9"]}
            tintColor="#7E54D9"
          />
        }
      >
        {loading ? (
          <View className="flex-1 justify-center items-center py-20">
            <ActivityIndicator size="large" color="#7E54D9" />
            <Text className="text-textMediumGrey mt-4">Loading meals...</Text>
          </View>
        ) : (
          <>
            {/* Single Meals Card - Full Width */}
            <View className="bg-white py-3">

              {mealSections.length === 0 ? (
                <View className="flex-1 w-full py-1">
                  <Text className="text-textMediumGrey text-center">You haven't logged any meals yet.</Text>
                  <TouchableOpacity className="mt-4 py-2 px-4 border-t border-gray" onPress={() => navigation.navigate('ScanScreenType')}>
                    <Text className="text-primary font-semibold">+ ADD FOOD</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                mealSections.map((section, sectionIndex) => (
                  <View key={section.key}>
                    {/* Section Header inside the card */}
                    {section.meals.length > 0 && (
                      <View className="flex-row items-center mb-3 px-4 mt-3">
                        <Text className="text-lg font-semibold">{section.emoji} {section.label}</Text>
                      </View>
                    )}
                    {section.meals.map((meal, index) => (
                      <View key={index} className="flex-row items-start px-4 mt-3 pb-2">
                        <Image
                          source={meal.photo_url ? { uri: meal.photo_url } : IMAGE_CONSTANTS.sampleFood}
                          className="w-[90px] h-[90px] object-cover rounded-lg mr-2"
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
                            <View className="flex-row items-center gap-3">
                              <TouchableOpacity
                                onPress={() => {
                                  navigation.navigate('EditMealScreen', {
                                    analyzedData: {
                                      id: meal.id,
                                      name: meal.name,
                                      calories: meal.calories,
                                      protein: meal.protein,
                                      carbs: meal.carbs,
                                      fat: meal.fat,
                                      amount: meal.quantity || 1,
                                      meal_type: meal.meal_type,
                                      serving_unit: meal.serving_unit,
                                      logging_mode: meal.logging_mode,
                                      meal_time: meal.meal_time,
                                      photo_url: meal.photo_url,
                                      read_only: meal.read_only
                                    }
                                  });
                                }}
                              >
                                <View className="w-[24px] h-[24px] bg-gray rounded-full justify-center items-center bg-gray-100">
                                  <Image
                                    source={IMAGE_CONSTANTS.editIcon}
                                    className="w-[13px] h-[13px]"
                                    tintColor="#253238"
                                  />
                                </View>
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleDeleteMeal(meal.id)}>
                                <View className="w-[24px] h-[24px] rounded-full bg-gray justify-center items-center bg-gray-100">
                                  <Image
                                    source={IMAGE_CONSTANTS.deleteIcon}
                                    className="w-[11px] h-[13px]"
                                    tintColor="#253238"
                                  />
                                </View>
                              </TouchableOpacity>
                            </View>
                          </View>
                          <View className="flex-row items-center mb-2">
                            <Text className="text-sm text-textMediumGrey text-center font-medium mr-2">
                              {meal.meal_time ? new Date(meal.meal_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </Text>
                            <View className="w-[4px] h-[4px] rounded-full bg-[#253238] mr-2"></View>
                            <Image
                              source={
                                meal.logging_mode === 'manual' ? IMAGE_CONSTANTS.fireIcon :
                                meal.logging_mode === 'barcode' ? IMAGE_CONSTANTS.scanBarcodeIcon :
                                meal.logging_mode === 'scan' ? IMAGE_CONSTANTS.scanMealIcon :
                                IMAGE_CONSTANTS.fireIcon // default to fire icon
                              }
                              className="w-[16px] h-[16px] object-fill mr-1"
                            />
                            <Text className="text-sm text-textMediumGrey text-center font-medium">
                              {meal.logging_mode ? meal.logging_mode.charAt(0).toUpperCase() + meal.logging_mode.slice(1) : 'Manual'}
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
                    ))}
                    {/* Add Food Button for this section */}
                    <TouchableOpacity 
                      className="mt-4 py-4 px-4 border-t border-gray"
                      onPress={() => navigation.navigate('ScanScreenType')}
                    >
                      <Text className="text-primary font-semibold">+ ADD FOOD</Text>
                    </TouchableOpacity>
                    {/* Add vertical separation between sections */}
                    {sectionIndex < mealSections.length - 1 && section.meals.length > 0 && (
                      <View className="h-6 bg-[#F5F5F5]"></View>
                    )}
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Filter Modal */}
      {Platform.OS !== "ios" && (
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/40">
            <View className="bg-[#F5F5F5] rounded-t-2xl p-4 mx-2 mb-4">
              <Text className="text-center text-base font-bold mb-1">Filter your meals</Text>
              <Text className="text-center text-xs mb-4">Select a time frame to view your meals over time.</Text>
              {FILTER_OPTIONS.map(opt => (
                <Pressable
                  key={opt.value}
                  className="py-3 border-b border-gray-200"
                  onPress={() => {
                    setSelectedRange(opt.value);
                    setModalVisible(false);
                  }}
                >
                  <Text className="text-center text-lg text-blue-600 font-medium">{opt.label}</Text>
                </Pressable>
              ))}
              <Pressable className="py-3 mt-2" onPress={() => setModalVisible(false)}>
                <Text className="text-center text-lg text-blue-600 font-bold">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );  
};

export default AddMeal;
