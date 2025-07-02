import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';
import { RootStackParamList } from '../types/navigation';
import FavoritesService, { FavoriteMeal } from '../services/favoritesService';

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'FavoritesScreen'>>();
  const [favorites, setFavorites] = useState<FavoriteMeal[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Refresh favorites when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async (): Promise<void> => {
    try {
      setLoading(true);
      const savedFavorites = await FavoritesService.getFavorites();
      setFavorites(savedFavorites);
    } catch (error) {
      console.error('Error loading favorites:', error);
      Alert.alert('Error', 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (meal: FavoriteMeal): Promise<void> => {
    Alert.alert(
      'Remove from Favorites',
      `Are you sure you want to remove "${meal.name}" from favorites?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await FavoritesService.removeFromFavorites(meal.name, meal.restaurant.name);
              await loadFavorites(); // Refresh the list
              Alert.alert('Removed from favorites');
            } catch (error) {
              console.error('Error removing favorite:', error);
              Alert.alert('Error', 'Failed to remove from favorites');
            }
          },
        },
      ]
    );
  };

  const navigateToMealDetails = (meal: FavoriteMeal): void => {
    navigation.navigate('MealFinderBreakdownScreen', { meal });
  };

  const clearAllFavorites = async (): Promise<void> => {
    if (favorites.length === 0) return;

    Alert.alert(
      'Clear All Favorites',
      'Are you sure you want to remove all favorites? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await FavoritesService.clearFavorites();
              setFavorites([]);
              Alert.alert('All favorites cleared');
            } catch (error) {
              console.error('Error clearing favorites:', error);
              Alert.alert('Error', 'Failed to clear favorites');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <CustomSafeAreaView edges={['left', 'right']} className="flex-1 bg-white">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#19a28f" />
        </View>
      </CustomSafeAreaView>
    );
  }

  return (
    <CustomSafeAreaView edges={['left', 'right']} className="flex-1 bg-grey">
      {/* Header */}
      <View className="flex-row bg-white items-center justify-between px-5 pt-4 pb-5">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-8 h-8 rounded-full justify-center items-center bg-[#F5F5F5]">
          <Text className="text-[22px]">‹</Text>
        </TouchableOpacity>
        <Text className="text-[20px] font-semibold text-[#222] text-center">Favorites</Text>
        {favorites.length > 0 && (
          <TouchableOpacity onPress={clearAllFavorites} className="w-8 h-8 rounded-full justify-center items-center bg-[#F5F5F5]">
            <Ionicons name="trash-outline" size={18} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView className="flex-1 pb-8">
        {favorites.length === 0 ? (
          <View className="flex-1 justify-center items-center mt-20">
            <Ionicons name="heart-outline" size={80} color="#ccc" />
            <Text className="text-xl font-semibold text-[#222] mt-4 mb-2">No favorites yet</Text>
            <Text className="text-base text-[#888] text-center px-8">
              Your favorite meals will appear here. Tap the heart icon on any meal to add it to favorites.
            </Text>
          </View>
        ) : (
          <View className="px-5 pt-4">
            <Text className="text-base font-medium text-[#222] mb-4">
              <Text>{favorites.length}</Text> <Text>{favorites.length === 1 ? 'favorite' : 'favorites'}</Text>
            </Text>
            
            {favorites.map((meal, index) => (
              <TouchableOpacity
                key={meal.id}
                onPress={() => navigateToMealDetails(meal)}
                className="flex-row bg-white rounded-xl mb-4 px-3 py-5 shadow-sm"
              >
                <View className="flex-row items-center justify-center bg-cornflowerBlue h-[48px] w-[48px] rounded-full mr-2.5">
                  <Image source={meal.image} className="w-[20px] h-[20px] rounded-full" />
                </View>
                
                <View className="flex-1 gap-1">
                  <View className="flex-row items-start justify-between">
                    <Text className="text-sm font-medium text-[#222] flex-1 mr-2" numberOfLines={2}>
                      {meal.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() => removeFavorite(meal)}
                      className="flex items-center justify-center py-1 px-1.5 rounded-[100px] bg-red-50 flex-shrink-0"
                    >
                      <Ionicons name="heart" size={16} color="#FF6B6B" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row items-center gap-3 flex-wrap">
                    <Text className="text-sm font-normal text-[#222] flex-shrink flex-wrap" style={{ flexWrap: 'wrap', flexShrink: 1 }}>
                      {meal.restaurant.name}
                    </Text>
                    <View className="w-[4px] h-[4px] rounded-full bg-[#253238]"></View>
                    <Text className="text-sm font-normal text-[#222] flex-shrink flex-wrap" style={{ flexWrap: 'wrap', flexShrink: 1 }}>
                      {meal.restaurant.location} away
                    </Text>
                  </View>
                  
                  <View className="flex-row items-center gap-2 mt-1">
                    <View className="flex-row items-center gap-1">
                      <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-amber rounded-full">
                        <Text className="text-white text-[10px] text-center font-medium">C</Text>
                      </View>
                      <Text className="text-xs text-textMediumGrey text-center font-medium">
                        {meal.macros.carbs}g
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                      <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-lavenderPink rounded-full">
                        <Text className="text-white text-[10px] text-center font-medium">F</Text>
                      </View>
                      <Text className="text-xs text-textMediumGrey text-center font-medium">
                        {meal.macros.fat}g
                      </Text>
                    </View>

                    <View className="flex-row items-center gap-1">
                      <View className="flex-row items-center justify-center h-[16px] w-[16px] bg-gloomyPurple rounded-full">
                        <Text className="text-white text-[10px] text-center font-medium">P</Text>
                      </View>
                      <Text className="text-xs text-textMediumGrey text-center font-medium">
                        {meal.macros.protein}g
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </CustomSafeAreaView>
  );
};

export default FavoritesScreen; 