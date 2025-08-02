// src/screens/WelcomeScreen.tsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { HasMacrosContext } from 'src/contexts/HasMacrosContext';
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';
import useStore from '../store/useStore'; 
import { paymentService } from '../services/paymentService';
import { userService } from '../services/userService';
import revenueCatService from '../services/revenueCatService';
import CustomSafeAreaView from 'src/components/CustomSafeAreaView';
import { IsProContext } from 'src/contexts/IsProContext';
import Config from 'react-native-config';
import BackButton from 'src/components/BackButton';

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
  const navigation = useNavigation<NavigationProp>();
  const handleBackPress = ()=>{
    // Option 1: Logout user to reset authentication state and return to login
    const { logout } = useStore.getState();
    logout();
    
    // Option 2: Alternative - Use navigation reset (uncomment if you prefer this)
    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: 'Auth', params: { initialAuthScreen: 'LoginScreen' } }],
    // });
  }

  return(
    <View className='flex-1 max-h-[50%] min-h-[300px]'>
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
      <View className="flex-row items-center justify-between px-4 mb-16">
        <BackButton onPress={handleBackPress}/>
        <View className="flex-row gap-2 items-center">
          <Text className='text-2xl font-bold text-white'>Macro Meals</Text>
          <View className='flex-row justify-center items-center gap-1 px-2 py-1 bg-primaryLigh rounded-md'>
            <Image source={IMAGE_CONSTANTS.crown} className='w-[18px] h-[14px]' />
            <Text className='text-white mt-0.5 font-medium text-base'>PREMIUM</Text> 
          </View>
        </View>
        <View className="w-[40px]" />
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
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const setHasBeenPromptedForGoals = useStore((state) => state.setHasBeenPromptedForGoals);
  const { setReadyForDashboard } = useContext(HasMacrosContext);
  const [amount, setAmount] = useState(9.99);

  const { isPro, setIsPro } = useContext(IsProContext);
  const [offerings, setOfferings] = useState<any>(null);

  // Load RevenueCat offerings when component mounts
  useEffect(() => {
    const loadOfferings = async () => {
      try {
        const currentOfferings = await revenueCatService.getOfferings();
        setOfferings(currentOfferings);
      } catch (error) {
        console.error('Failed to load offerings:', error);
      }
    };
    
    loadOfferings();
  }, []);

  const handleTrialSubscription = async () => {
    try {
      setIsLoading(true);
      
      // Get RevenueCat offerings
      const currentOfferings = await revenueCatService.getOfferings();
      if (!currentOfferings) {
        throw new Error('No subscription offerings available');
      }
      
      // Find the appropriate package based on selected plan
      let packageToPurchase;
      if (selectedPlan === 'monthly') {
        packageToPurchase = currentOfferings.availablePackages.find(
          pkg => pkg.product.identifier === 'monthly_subscription'
        );
      } else {
        packageToPurchase = currentOfferings.availablePackages.find(
          pkg => pkg.product.identifier === 'yearly_subscription'
        );
      }
      
      if (!packageToPurchase) {
        throw new Error(`No package found for ${selectedPlan} plan`);
      }
      
      // Purchase the package
      const customerInfo = await revenueCatService.purchasePackage(packageToPurchase);
      
      // Check if purchase was successful
      if (customerInfo.entitlements.active['pro']) {
        console.log('✅ Purchase successful, setting isPro to true');
        setHasBeenPromptedForGoals(false);
        setReadyForDashboard(true);
        setIsPro(true);
        
        Alert.alert(
          "You're in", 
          "Your subscription is confirmed. Let's hit those goals, one meal at a time.",
          [
            {
              text: "Continue",
              onPress: () => {
                // Force navigation to Dashboard using CommonActions
                navigation.dispatch(
                  CommonActions.reset({
                    index: 0,
                    routes: [
                      {
                        name: 'Dashboard',
                      },
                    ],
                  })
                );
              }
            }
          ]
        );
      } else {
        throw new Error('Purchase completed but no active entitlements found');
      }
    } catch (error) {
      console.error('Error in trial subscription:', error);
      
      let errorMessage = 'Failed to complete purchase. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
        <View className='flex-1 bg-[#F2F2F2]'>
          <Pager />
          <View className="flex-1 px-5 py-4 justify-center items-center w-full">
            <Text className="text-base font-medium text-center">Select a plan for your free trial</Text>
            <View className="flex-row w-full gap-3 justify-between mt-6">
              
            
              
              <TouchableOpacity activeOpacity={0.8} className={`flex-1 bg-white rounded-2xl ${selectedPlan === 'monthly' ? 'border-primaryLight border-2' : 'border border-[#F2F2F2]'}`} onPress={(e)=>{
                e.preventDefault();
                setSelectedPlan('monthly');
                setAmount(9.99);
              }}>
                
                <View className='w-full pl-3 pt-6 pb-3'>
                <View className='flex-row items-center justify-between gap-2'>
                  <Text className="text-base font-medium rounded-md">MONTHLY</Text>
                  {selectedPlan === 'monthly' && <Image source={IMAGE_CONSTANTS.checkPrimary} className='w-[16px] h-[16px] mr-5' />}
                </View>
                <View className='mt-3'>
                  <Text className='font-medium text-[15px]'>£9.99/mo</Text>
                  <Text className='font-medium text-[15px]'></Text>
                </View>
                <Text className='mt-3 mb-3 text-[12px] text-[#4F4F4F]'>Billed yearly after free trial.</Text>
                </View>
               
                
              </TouchableOpacity>


              <TouchableOpacity activeOpacity={0.8} className={`flex-1 items-center bg-white rounded-2xl ${selectedPlan === 'yearly' ? 'border-primary border-2' : 'border border-[#F2F2F2]'}`} onPress={(e)=>{
               e.preventDefault();
               setSelectedPlan('yearly');
               setAmount(70.00);
              }}>
                <View className="absolute px-2 py-2 top-[-10px] flex-row bg-primaryLight rounded-2xl">
                <Text className="text-white text-xs font-medium justify-center items-center">30% savings</Text>
              </View>
                <View className='w-full pl-3 pt-6 pb-3'>
                <View className='flex-row items-center justify-between gap-2'>
                  <Text className="text-base font-medium rounded-md">YEARLY</Text>
                  {selectedPlan === 'yearly' && <Image source={IMAGE_CONSTANTS.checkPrimary} className='w-[16px] h-[16px] mr-5' />}
                </View>
                <View className='mt-3'>
                  <Text className='font-medium text-[15px]'>£70.00/yr</Text>
                  <Text className='mt-1 font-medium text-[13px] text-decoration-line: line-through text-[#4F4F4F]'>£99.99/yr</Text>
                </View>
                <Text className='mt-3 mb-3 text-[12px] text-[#4F4F4F]'>Billed yearly after free trial.</Text>
                </View>
              </TouchableOpacity>
            </View>
            <Text className='mt-4 text-[12px] text-[#4F4F4F] text-center'>You can change plans or cancel anytime</Text>
            <View className="w-full mt-6 mb-2">
            <TouchableOpacity 
                    activeOpacity={0.8}
                    onPress={handleTrialSubscription}
                    disabled={isLoading}
                    className={isLoading ? 'opacity-70' : 'mt-5'}
                  >
                    <View className="bg-primaryLight h-[56px] w-full flex-row items-center justify-center rounded-[100px]">
                      {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <Text className="text-white font-semibold text-[17px]">{profile?.has_used_trial ? `Subscribe to ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} plan` : 'Start 7-Day Free Trial'}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
            </View>
          </View>
        </View>
        

      {/* </CustomSafeAreaView> */}
    </>
  )
}

export default PaymentScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    }
})