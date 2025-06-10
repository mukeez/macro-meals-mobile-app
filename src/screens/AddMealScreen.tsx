import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  Image,
} from "react-native";
import { FontAwesome5, Ionicons } from "@expo/vector-icons";
import Header from "../components/Header"; // Adjust path as needed
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import { IMAGE_CONSTANTS } from "../constants/imageConstants";

export default function AddMealScreen() {
  const [search, setSearch] = useState("");
  return (
    <CustomSafeAreaView className="">
      {/* Header */}
      <Header title="Add a meal" />
      <ImageBackground
        source={IMAGE_CONSTANTS.mealBg}
        style={{ flex: 1 }}
        imageStyle={{ opacity: 0.12 }}
      >
        {/* Search Bar */}
        <View className="flex-row items-center mx-4 mt-8 bg-[#F5F5F5] rounded-full px-4 py-3 shadow-lg">
          <Ionicons name="search" size={22} color="#888" className="mr-2" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search for food"
            placeholderTextColor="#888"
            className="flex-1 text-base"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close" size={22} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        <View className="bg-transparent min-h-screen">
          {/* Scan Options Section */}
          <View>
            <Text className="text-md font-bold text-[#063A2E] mb-3 mx-4 mt-8">
              SCAN OPTIONS
            </Text>
            <View className="flex-row justify-between mx-4">
              {/* Card 1 */}
              <TouchableOpacity className="flex-1 bg-white/90 mx-1 rounded-2xl items-center py-6 shadow-lg">
                <View className="w-12 h-12 rounded-full bg-[#C4E7E3] justify-center items-center mb-3">
                  <FontAwesome5 name="barcode" size={20} color="#20A090" />
                </View>
                <Text className="text-sm font-semibold text-black text-center">
                  Scan a barcode
                </Text>
              </TouchableOpacity>
              {/* Card 2 */}
              <TouchableOpacity className="flex-1 bg-white/90 mx-1 rounded-2xl items-center py-6 shadow-lg">
                <View className="w-12 h-12 rounded-full bg-[#C4E7E3] justify-center items-center mb-3">
                  <FontAwesome5 name="utensils" size={20} color="#20A090" />
                </View>
                <Text className="text-sm font-semibold text-black text-center">
                  Scan a meal
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Discover More Section */}
          <View className="mx-4 mt-8 ">
            <Text className="text-md font-bold text-[#063A2E] mb-3">
              DISCOVER MORE
            </Text>
            {/* Card 1 */}
            <TouchableOpacity className="flex-row items-center bg-white/90 rounded-xl px-4 py-4 shadow-lg mb-4">
              <View className="w-12 h-12 rounded-full bg-[#C4E7E3] justify-center items-center mr-4">
                <Ionicons name="pencil" size={24} color="#20A090" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Manual entry
                </Text>
                <Text className="text-xs text-[#404040] mt-1">
                  Log your meal details including portion sizes and ingredients
                  for precise macro tracking.
                </Text>
              </View>
            </TouchableOpacity>
            {/* Card 2 */}
            <TouchableOpacity className="flex-row items-center bg-white/90 rounded-xl px-4 py-4 shadow-lg mb-4">
              <View className="w-12 h-12 rounded-full bg-[#C4E7E3] justify-center items-center mr-4">
                <FontAwesome5 name="magic" size={20} color="#20A090" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  AI Meal suggestions
                </Text>
                <Text className="text-xs text-[#404040] mt-1">
                  Get personalized meal recommendations based on your remaining
                  macros.
                </Text>
              </View>
            </TouchableOpacity>
            {/* Card 3 */}
            <TouchableOpacity className="flex-row items-center bg-white/90 rounded-xl px-4 py-4 shadow-lg mb-4">
              <View className="w-12 h-12 rounded-full bg-[#C4E7E3] justify-center items-center mr-4">
                <FontAwesome5 name="map-marker-alt" size={20} color="#20A090" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-gray-900">
                  Meal Finder
                </Text>
                <Text className="text-xs text-[#404040] mt-1">
                  Discover nearby restaurant options that align with your macro
                  targets and dietary preferences.
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </CustomSafeAreaView>
  );
}
