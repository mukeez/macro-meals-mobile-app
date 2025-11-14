import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants';
import { mealService } from 'src/services/mealService';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import { RootStackParamList } from '../types/navigation';

const RequestRestaurantScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'RequestRestaurantScreen'>>();
  const initialName = route.params?.restaurantName ?? '';

  const [restaurantName, setRestaurantName] = useState(initialName);
  const [location, setLocation] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const isSubmitDisabled = restaurantName.trim().length === 0;

  const handleRequestRestaurant = async () => {
    try {
      setLoading(true);
      const response = await mealService.requestRestaurant({
        restaurant_name: restaurantName,
        location: location,
        reason: additionalInfo,
      });
      console.log('Restaurant request response:', response);
      Alert.alert(
        'Restaurant request submitted successfully',
        'We will review your request and get back to you soon.'
      );
      navigation.goBack();
    } catch (error) {
      console.error('Error requesting restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomSafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-row items-center mt-2 mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="flex-row items-center justify-start h-[32px] w-[32px] rounded-full"
            >
              <Image
                source={IMAGE_CONSTANTS.backButton}
                className="w-[10px] h-[18px]"
              />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-[17px] font-semibold text-[#111]">
              Request restaurant
            </Text>
            <View style={{ width: 44 }} />
          </View>

          <View className="flex-col justify-center">
            <View className="flex-row w-full justify-center mb-4">
              <View className="items-center justify-center w-[80px] h-[80px] flex-row bg-primaryLight rounded-full">
                <Image
                  source={IMAGE_CONSTANTS.missingRestaurantIcon}
                  className="w-[40px] h-[40px]"
                />
              </View>
            </View>
            <Text className="text-lg font-semibold text-center text-black mb-2">
              Missing a restaurant?
            </Text>
            <Text className="text-sm text-center text-normal text-[#4F4F4FCC] mb-8">
              Help us expand our database by suggesting a restaurant you’d like
              to see on Meal Finder.
            </Text>
          </View>

          <View className="mb-5">
            <Text className="text-xs font-semibold text-[#444] mb-2 tracking-wide">
              Restaurant name
            </Text>
            <TextInput
              value={restaurantName}
              onChangeText={setRestaurantName}
              placeholder="e.g The protein place"
              className="border border-[#E5E5E5] px-4 text-sm text-[#222] h-[68px]"
              placeholderTextColor="#A0A0A0"
              returnKeyType="next"
            />
          </View>

          <View className="mb-5">
            <Text className="text-xs font-semibold text-[#444] mb-2 tracking-wide">
              Location
            </Text>
            <TextInput
              value={location}
              onChangeText={setLocation}
              placeholder="45 Gainz Avenue, Strongtown"
              className="border border-[#E5E5E5] px-4 text-sm text-[#222] h-[68px]"
              placeholderTextColor="#A0A0A0"
              returnKeyType="next"
            />
          </View>

          <View className="mb-8">
            <Text className="text-xs font-semibold text-[#444] mb-2 tracking-wide">
              Reason
            </Text>
            <TextInput
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              placeholder="Tell us what makes this restaurant special..."
              className="border border-[#E5E5E5] px-4 text-sm text-[#222] mb-4"
              placeholderTextColor="#A0A0A0"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 120, paddingTop: 16, paddingBottom: 16 }}
            />
          </View>

          <TouchableOpacity
            onPress={handleRequestRestaurant}
            disabled={isSubmitDisabled}
            className={`h-[52px] rounded-full items-center justify-center ${
              isSubmitDisabled || loading ? 'bg-[#C9E7E2]' : 'bg-primary'
            }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Submit request
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </CustomSafeAreaView>
  );
};

export default RequestRestaurantScreen;
