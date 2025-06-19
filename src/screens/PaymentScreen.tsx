// src/screens/WelcomeScreen.tsx
import React, { useEffect, useState } from 'react';

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

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [selectedPlan, setSelectedPlan] = useState('yearly');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentSheetParams, setPaymentSheetParams] = useState({});
  const [publishableKey, setPublishableKey] = useState('');

  useEffect(()=>{
   setIsLoading(true);
    fetchPublishableKey();
    initializePaymentSheet();
    setIsLoading(false);
  }, []);


  const fetchPublishableKey = async () => {
    const response = await fetch(`https://sunny-stag-aware.ngrok-free.app/api/v1/billing/stripe-config`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const token = useStore((state) => state.token);
    console.log('The token is: ', token);
    const data = await response.json();
    console.log(data);
    setPublishableKey(data.publishable_key);
  }

  const handleCreateSetupIntent = async () => {
    try{
    const token = await AsyncStorage.getItem('my_token');
    console.log('The token is: ', token);
    const response = await fetch(`https://sunny-stag-aware.ngrok-free.app/api/v1/billing/create-setup-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        "email" : "matrix@simulation.com",
        "user_id" : "e269b58e-5e72-46d2-b2ef-5df7f35622ef"
      }),
    });
    const data = await response.json();
    console.log(data);
    const newData = {
      clientSecret: data.client_secret,
      paymentIntent: data.payment_intent,
      ephemeralKey: data.ephemeral_key,
      publishableKey: data.publishable_key,
      customerId: data.customer_id
    }
    setPaymentSheetParams(newData);
    return newData;
  } catch (error) {
    console.log(error);
  }
  };

  const initializePaymentSheet = async () => {
    const newData = await handleCreateSetupIntent();
    console.log(`The new data is: ${JSON.stringify(newData)}`);
    if (!newData) return;
    
    // Log the exact client secret format
    console.log('Client secret exact value:', newData.clientSecret);
    
    const { error } = await initPaymentSheet({
      merchantDisplayName: "MacroMate",
      customerId: newData.customerId,
      customerEphemeralKeySecret: newData.ephemeralKey,
      setupIntentClientSecret: newData.clientSecret,
      allowsDelayedPaymentMethods: true,
    });
    console.log(`The error is: ${JSON.stringify(error)}`);
    if (!error) {
      setIsLoading(true);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      Alert.alert('Success', 'Your order is confirmed!');
    }
  };
  


if (isLoading){
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#19a28f" />
    </View>
  );
}

  return (
    <StripeProvider publishableKey={publishableKey}>
      <View className='relative h-screen bg-[##F2F2F2]'>
        <Pager />
        <View className="flex px-[20px] mt-8 justify-center items-center w-full">
          <Text className="text-base font-medium">Select a plan for your free trial</Text>
          <View className="flex-row w-full gap-4 justify-between mt-8">
            
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
                <Text className='font-medium text-[15px]'>$14.98/mo</Text>
                <Text className='font-medium text-[15px]'></Text>
              </View>
              <Text className='mt-4 mb-3 text-[12px] text-[#4F4F4F]'>Billed yearly after free trial.</Text>
              </View>
             
              
            </TouchableOpacity>
          </View>
          <Text className='mt-5 text-[12px] text-[#4F4F4F]'>You can change plans or cancel anytime</Text>
          <View className="w-full mt-[30px]">
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={openPaymentSheet}
            >
              <View className="bg-primaryLight h-[56px] w-full flex-row items-center justify-center rounded-[100px]">
                <Text className="text-white font-semibold text-[17px]">Start 1-Month Free Trial</Text>
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