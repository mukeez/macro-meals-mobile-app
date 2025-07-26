// src/screens/WelcomeScreen.tsx
import React, { useEffect, useState, useContext } from 'react';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { HasMacrosContext } from 'src/contexts/HasMacrosContext';
import { WebView } from 'react-native-webview';


import AsyncStorage from "@react-native-async-storage/async-storage";
import { StripeProvider, useStripe, PlatformPayButton, isPlatformPaySupported, PlatformPay, confirmPlatformPayPayment } from '@stripe/stripe-react-native';
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Linking
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';
import useStore from '../store/useStore'; 
import { paymentService } from '../services/paymentService';
import { userService } from '../services/userService';
import CustomSafeAreaView from 'src/components/CustomSafeAreaView';
import { IsProContext } from 'src/contexts/IsProContext';
import Config from 'react-native-config';

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
  const [isApplePaySupported, setIsApplePaySupported] = useState(false);
  const [amount, setAmount] = useState(9.99);
  const [showWebView, setShowWebView] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const { isPro, setIsPro } = useContext(IsProContext);
  const MERCHANT_IDENTIFIER = Config.MERCHANT_IDENTIFIER;

  console.log('MERCHANT_IDENTIFIER', MERCHANT_IDENTIFIER);

  // useEffect(() => {
  //   (async function () {
  //     setIsApplePaySupported(await isPlatformPaySupported());
  //   })();
  // }, [isPlatformPaySupported]);


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

  const handleTrialSubscription = async () => {
    try {
      setIsLoading(true);
      // Get user profile for checkout
      const profile = await userService.getProfile();
      if (!profile?.email || !profile?.id) {
        throw new Error('User profile not found');
      }
      
      const checkoutResponse = await paymentService.checkout(
        profile.email,
        selectedPlan,
        profile.id
      );
      
      if (checkoutResponse?.checkout_url) {
        setCheckoutUrl(checkoutResponse.checkout_url);
        setShowWebView(true);
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Error in trial subscription:', error);
      
      // Extract error message from API response
      let errorMessage = 'Failed to start checkout process. Please try again.';
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        if (axiosError.response?.data?.detail) {
          errorMessage = axiosError.response.data.detail;
        } else if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.message) {
          errorMessage = axiosError.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
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
        Alert.alert("You're in", "Your subscription is confirmed. Let’s hit those goals, one meal at a time.");
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

  const handleApplePayPress = async () => {
    try {
      // Get publishable key if not already set
      if (!publishableKey) {
        await fetchPublishableKey();
      }

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
      const { error } = await confirmPlatformPayPayment(
        response.client_secret,
        {
          applePay: {
            cartItems: [
              {
                label: `Macro Meals ${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'}`,
                amount: amount.toString(),  
                paymentType: PlatformPay.PaymentType.Immediate,
              },
              {
                label: 'Total',
                amount: amount.toString(),
                paymentType: PlatformPay.PaymentType.Immediate,
              },
            ],
            merchantCountryCode: 'US',
            currencyCode: 'USD',
            requiredShippingAddressFields: [
              PlatformPay.ContactField.PostalAddress,
            ],
            requiredBillingContactFields: [PlatformPay.ContactField.PhoneNumber],
          },
        }
      );
      if (error) {
        console.error('Apple Pay error:', error);
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('You\'re in', 'Your subscription is confirmed. Let’s hit those goals, one meal at a time.');
        setHasBeenPromptedForGoals(false);
        setReadyForDashboard(true);
      }
    } catch (error) {
      console.error('Error processing Apple Pay:', error);
      Alert.alert('Error', 'Failed to process Apple Pay payment. Please try again.');
    }
  };

  return (
    <StripeProvider publishableKey={publishableKey}
    merchantIdentifier={MERCHANT_IDENTIFIER}>
      {/* <CustomSafeAreaView edges={['left', 'right']} className="flex-1"> */}
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
                <Text className="text-white text-xs font-medium justify-center items-center">50% savings</Text>
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
        
        {/* WebView Modal for Checkout */}
        <Modal
          visible={showWebView}
          animationType="slide"
          onRequestClose={() => setShowWebView(false)}
        >
          <View className="flex-1">
            <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-200">
              <TouchableOpacity onPress={() => setShowWebView(false)}>
                <Text className="text-blue-500 text-lg">Cancel</Text>
              </TouchableOpacity>
              <Text className="text-lg font-semibold">Complete Payment</Text>
              <View style={{ width: 60 }} />
            </View>
            <View className="flex-1">
              <WebView 
                source={{ uri: checkoutUrl }}
                onNavigationStateChange={(navState) => {
                  // Handle successful payment completion
                  if (navState.url.includes('success') || navState.url.includes('completed')) {
                    setShowWebView(false);
                    console.log("🔍 PaymentScreen - Payment successful, setting isPro to true");
                    Alert.alert(
                      "You're in", 
                      "Your subscription is confirmed. Let's hit those goals, one meal at a time.",
                      [
                        {
                          text: "Continue",
                          onPress: () => {
                            console.log("🔍 PaymentScreen - User confirmed, updating states");
                            setHasBeenPromptedForGoals(false);
                            setReadyForDashboard(true);
                            setIsPro(true);
                            console.log("🔍 PaymentScreen - States updated: readyForDashboard=true, isPro=true");
                            
                            // Add a small delay to ensure state updates propagate
                            setTimeout(() => {
                              console.log("🔍 PaymentScreen - After delay, checking if navigation should trigger");
                              
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
                              console.log("🔍 PaymentScreen - Forced navigation to Dashboard");
                            }, 100);
                          }
                        }
                      ]
                    );
                  }
                  // Handle payment cancellation
                  if (navState.url.includes('canceled') || navState.url.includes('cancelled')) {
                    setShowWebView(false);
                    Alert.alert("Payment Cancelled", "Your payment was cancelled. You can try again anytime.");
                  }
                }}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView error: ', nativeEvent);
                 // Alert.alert("Error", "Failed to load checkout page. Please try again.");
                  setShowWebView(false);
                }}
                onHttpError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent;
                  console.warn('WebView HTTP error: ', nativeEvent);
                }}
                startInLoadingState={true}
                renderLoading={() => (
                  <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#009688" />
                    <Text className="mt-4 text-gray-600">Loading checkout...</Text>
                  </View>
                )}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                allowsInlineMediaPlayback={true}
                mediaPlaybackRequiresUserAction={false}
              />
            </View>
          </View>
        </Modal>
      {/* </CustomSafeAreaView> */}
      
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