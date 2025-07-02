// src/screens/WelcomeScreen.tsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { HasMacrosContext } from 'src/contexts/HasMacrosContext';

const API_URL = 'https://api.macromealsapp.com/api/v1';

import AsyncStorage from "@react-native-async-storage/async-storage";
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';
import useStore from '../store/useStore'; 
import { paymentService } from '../services/paymentService';
import { userService } from '../services/userService';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type Profile = {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  is_pro?: boolean;
  has_macros?: boolean;
  meal_reminder_preferences_set?: boolean;
  is_active?: boolean;
};

const Pager = ()=>{
  const [currentPage, setCurrentPage] = useState(0);


  return(
    <View className='h-[55%]'>
      <PagerView 
      style={{ flex: 1}} 
      orientation='horizontal'
      onPageSelected={(e)=> {
        setCurrentPage(e.nativeEvent.position);
      }}
      initialPage={0}>
        <View key="1" style={{ flex: 1 }}>
          <SuccessStoryPager />
        </View>
        <View key="2" style={{ flex: 1 }}>
          <BenefitsPager />
        </View>
      </PagerView>
      <View className="absolute w-full top-[5rem] left-0">
      <View className="flex-row gap-2 justify-center mb-16">
        <Text className='text-2xl font-bold text-white'>Macro Meals</Text>
        <View className='flex-row justify-center items-center gap-1 px-2 py-1 bg-primaryLigh rounded-md'>
          <Image source={IMAGE_CONSTANTS.crown} className='w-[18px] h-[14px]' />
          <Text className='text-white mt-0.5 font-medium text-base'>PREMIUM</Text> 
        </View>
      </View>
      </View>
      <View className="absolute bottom-4 w-full flex-row gap-2 justify-center items-center">
        {[0, 1].map((index)=> (
          <View key={index} className={`w-[10px] h-[10px] rounded-full ${index === currentPage ? 'bg-white' : 'bg-[#7A8F8E]'}`}
          />
        ))}
      </View>
    </View>
  );
}


const SuccessStoryPager = ()=>{
  return(
    <View className='relative'>
      <Image source={IMAGE_CONSTANTS.successStoriesBg} className='w-full object-cover h-full' />
      <View className='absolute w-full items-center justify-center mt-[11rem]'>
     
      <View className="w-full flex-row gap-1 items-center justify-center">
        {Array.from({length: 5}).map((_, index)=> (
          <Image key={index} source={IMAGE_CONSTANTS.star} className='w-[20px] h-[20px] object-fit' />
        ))}
      </View>
      <Text className='mt-2 px-[30px] text-center leading-6 text-base font-normal text-white'>I've gained 10 pounds in the last month. Very good for helping you get to or maintain a healthy lifestyle</Text>
      <Text className='mt-4 px-[30px] text-center leading-6 text-base font-medium text-white'>by Amira, United Kingdom</Text>
      </View>
      <Text className='absolute bottom-10 w-full text-center text-white text-base font-medium'>Join the success stories!</Text>
    </View>
  );
}

const BenefitsPager = ()=>{
  return(
    <View className='relative'>
      <Image source={IMAGE_CONSTANTS.strawberryBg} className='w-full object-cover h-full' />
      <View className='absolute mt-[11rem] px-5 w-full'>
        <View className='flex-row items-center justify-left w-full'>
          <Image source={IMAGE_CONSTANTS.checkMark} className='w-[28px] h-[24px] mr-5 flex-shrink-0' />
          <Text className='text-sm font-semibold text-white flex-1'>Barcode Scan: Skip the search and log faster</Text>
        </View>
        <View className='mt-12 flex-row items-center justify-left w-full'>
          <Image source={IMAGE_CONSTANTS.checkMark} className='w-[28px] h-[24px] mr-5 flex-shrink-0' />
          <Text className='text-sm font-semibold text-white flex-1'>Custom Macro Tracking: Find your balance of carbs, protein and fat.</Text>
        </View>
        <View className='mt-12 flex-row items-center justify-left w-full'>
          <Image source={IMAGE_CONSTANTS.checkMark} className='w-[28px] h-[24px] mr-5 flex-shrink-0' />
          <Text className='text-sm font-semibold text-white flex-1'>Zero Ads: Track and reach your goals, free from distractions.</Text>
        </View>
      </View>
    </View>
  );
}




const PaymentScreen = () => {
  const navigation = useNavigation<NavigationProp>();
  const profile = useStore((state) => state.profile);
  const setStoreProfile = useStore((state) => state.setProfile);
  const clearProfile = useStore((state) => state.clearProfile);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [publishableKey, setPublishableKey] = useState('');
  const setHasBeenPromptedForGoals = useStore((state) => state.setHasBeenPromptedForGoals);
  const { setReadyForDashboard } = useContext(HasMacrosContext);

  const fetchPublishableKey = async () => {
    try {
      const response = await paymentService.getStripeConfig();
      setPublishableKey(response.publishable_key);
      return response.publishable_key;
    } catch (error) {
      console.error('Error fetching publishable key:', error);
      throw error;
  }
  };

  const initializePaymentSheet = async () => {
    try {
      // Clear existing profile and fetch fresh data
      clearProfile();
      const fetchedProfile = await userService.getProfile();
      
      if (!fetchedProfile?.id || !fetchedProfile?.email) {
        throw new Error('Invalid profile data received');
      }
      
      const currentProfile = fetchedProfile as Profile;
      setStoreProfile(currentProfile);

      const response = await paymentService.createPaymentIntent(
        currentProfile.email,
        currentProfile.id,
        selectedPlan
      );

      if (!response || !response.client_secret) {
        throw new Error('Invalid response from payment service');
      }
    
    const { error } = await initPaymentSheet({
        merchantDisplayName: "Macro meals",
        customerId: response.customer_id,
        customerEphemeralKeySecret: response.ephemeral_key,
        setupIntentClientSecret: response.client_secret,
      allowsDelayedPaymentMethods: true,
        returnURL: 'macromeals://stripe-redirect',
        style: 'automatic'
      });

      if (error) {
        throw new Error(error.message || 'Failed to initialize payment');
      }
    } catch (error) {
      console.error('Error initializing payment sheet:', error);
      throw error;
    }
  };

  const handlePaymentPress = async () => {
    try {
      setIsLoading(true);
      
      // Get publishable key if not already set
      if (!publishableKey) {
        await fetchPublishableKey();
      }

      // Initialize payment sheet (this will now fetch profile if needed)
      await initializePaymentSheet();

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        Alert.alert(`Error code: ${presentError.code}`, presentError.message);
    } else {
      Alert.alert('Success', 'Your order is confirmed!');
      setHasBeenPromptedForGoals(false);
        setReadyForDashboard(true);
       //navigation.navigate('MainTabs');
    }
    } catch (error) {
      console.error('Error processing payment:', error);
      if (error instanceof Error) {
        if (error.message === 'Failed to fetch user profile' || error.message === 'Invalid profile data' || error.message === 'Invalid profile data received') {
          Alert.alert('Error', 'Failed to fetch user profile. Please try again.');
        } else {
          Alert.alert('Error', 'Failed to process payment. Please try again.');
        }
      } else {
        Alert.alert('Error', 'Failed to process payment. Please try again.');
      }
    } finally {
      setIsLoading(false);
}
  };

  return (
    <StripeProvider publishableKey={publishableKey}>
      <View className='relative h-screen bg-[##F2F2F2]'>
        <Pager />
        <View className="flex px-[20px] mt-8 justify-center items-center w-full">
          <Text className="text-base font-medium">Select a plan for your free trial</Text>
          <View className="flex-row w-full gap-4 justify-between mt-8">
            
          
            
            <TouchableOpacity activeOpacity={0.8} className={`flex-1 bg-white rounded-2xl ${selectedPlan === 'monthly' ? 'border-primaryLight border-2' : 'border border-[#F2F2F2]'}`} onPress={(e)=>{
              e.preventDefault();
              setSelectedPlan('monthly');
            }}>
              
              <View className='w-full pl-3 pt-8 pb-3'>
              <View className='flex-row items-center justify-between gap-2'>
                <Text className="text-base font-medium rounded-md">MONTHLY</Text>
                {selectedPlan === 'monthly' && <Image source={IMAGE_CONSTANTS.checkPrimary} className='w-[16px] h-[16px] mr-5' />}
              </View>
              <View className='mt-4'>
                <Text className='font-medium text-[15px]'>$9.99/mo</Text>
                <Text className='font-medium text-[15px]'></Text>
              </View>
              <Text className='mt-4 mb-3 text-[12px] text-[#4F4F4F]'>Billed yearly after free trial.</Text>
              </View>
             
              
            </TouchableOpacity>


            <TouchableOpacity activeOpacity={0.8} className={`flex-1 items-center bg-white rounded-2xl ${selectedPlan === 'yearly' ? 'border-primary border-2' : 'border border-[#F2F2F2]'}`} onPress={(e)=>{
             e.preventDefault();
             setSelectedPlan('yearly');
            }}>
              <View className="absolute px-2 py-2 top-[-10px] flex-row bg-primaryLight rounded-2xl">
              <Text className="text-white text-xs font-medium justify-center items-center">50% savings</Text>
            </View>
              <View className='w-full pl-3 pt-8 pb-3'>
              <View className='flex-row items-center justify-between gap-2'>
                <Text className="text-base font-medium rounded-md">YEARLY</Text>
                {selectedPlan === 'yearly' && <Image source={IMAGE_CONSTANTS.checkPrimary} className='w-[16px] h-[16px] mr-5' />}
              </View>
              <View className='mt-4'>
                <Text className='font-medium text-[15px]'>$70.00/yr</Text>
                <Text className='mt-1 font-medium text-[13px] text-decoration-line: line-through text-[#4F4F4F]'>$170.80/yr</Text>
              </View>
              <Text className='mt-4 mb-3 text-[12px] text-[#4F4F4F]'>Billed yearly after free trial.</Text>
              </View>
            </TouchableOpacity>
          </View>
          <Text className='mt-4 text-[12px] text-[#4F4F4F]'>You can change plans or cancel anytime</Text>
          <View className="w-full mt-[30px]">
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handlePaymentPress}
              disabled={isLoading}
              className={isLoading ? 'opacity-70' : ''}
            >
              <View className="bg-primaryLight h-[56px] w-full flex-row items-center justify-center rounded-[100px]">
                {isLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                <Text className="text-white font-semibold text-[17px]">Start 1-Month Free Trial</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      </StripeProvider>
  )
}

export default PaymentScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    }
})