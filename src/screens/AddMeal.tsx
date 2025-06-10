import React from "react";
import { ScrollView } from "react-native";
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import LargeHeader from "../components/LargeHeader";
import { MealItem } from "../components/MealItem";

// import FoodItem from "./FoodItem"; // Uncomment and implement once discussed

// Dummy food items for demonstration
const mockFoodItems = [
  {
    id: 1,
    mealType: "breakfast",
    name: "Omelette",
    imageUrl: "https://example.com/omelette.jpg",
    loggedTime: "08:30 AM",
    mode: "Manual",
  },
  // etc.
];
const mealTypeMap = {
  breakfast: { label: "Breakfast", emoji: "🍳" },
  lunch: { label: "Lunch", emoji: "🥗" },
  dinner: { label: "Dinner", emoji: "🍽️" },
};

const AddMeal: React.FC = () => {
  // Handler stubs for navigation/filter
  const handlePrevDay = () => {};
  const handleNextDay = () => {};
  const handleFilter = () => {};

  return (
    <CustomSafeAreaView className="flex-1 bg-gray-500">
      <LargeHeader
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onFilterPress={handleFilter}
      />

      <ScrollView
        className="flex-1 px-4 pt-4"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        {mockFoodItems.map((item) => (
          <MealItem
            key={item.id}
            label={mealTypeMap[item.mealType].label}
            emoji={mealTypeMap[item.mealType].emoji}
            mealName={item.name}
            imageUrl={item.imageUrl}
            loggedTime={item.loggedTime}
            mode={item.mode}
            onAddFood={() => {}}
          />
        ))}
      </ScrollView>
    </CustomSafeAreaView>
  );
};

export default AddMeal;
