import React from 'react';
import { View, Text, Image, TouchableOpacity } from "react-native";
import CustomSafeAreaView from '../../components/CustomSafeAreaView';
import CustomTouchableOpacityButton from '../../components/CustomTouchableOpacityButton';
import CustomScaffold from '../../components/CustomScaffold';
import CustomPagerView from '../../components/CustomPagerView';
import { onboardingItems, OnboardingItem } from '../../constants/onboarding';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingContext } from '../../contexts/OnboardingContext';




export const OnboardingScreen: React.FC = () => {
    const {setIsOnboardingCompleted, setInitialAuthScreen} = React.useContext(OnboardingContext);
    
    const handleGetStartedClick = async () => {
        try {
            await AsyncStorage.setItem('isOnboardingCompleted', 'true');
            setInitialAuthScreen('SignupScreen');
            setIsOnboardingCompleted(true);
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
    }

    const handleSignInClick = async () => {
        try {
            await AsyncStorage.setItem('isOnboardingCompleted', 'true');
            setInitialAuthScreen('LoginScreen');
            setIsOnboardingCompleted(true);
        } catch (error) {
            console.error('Error saving onboarding status:', error);
        }
    }

    return (
        <CustomSafeAreaView edges={['left', 'right']}>
            <CustomScaffold className='flex-1'>
                <View className='flex-1'>
                    <CustomPagerView 
                        indicatorActiveColor='bg-indicatorActive' 
                        indicatorInactiveColor='bg-indicatorInactive'
                        indicatorClass='absolute bottom-40 w-full flex-row gap-2 justify-center items-center'
                    >
                        {onboardingItems.map((item: OnboardingItem, index: number) => (
                            <View key={index} className="flex-1 mt-[60px] items-center">
                                {item.mignifiedImagePath === undefined ? (
                                    <Image 
                                    source={typeof item.imagePath === 'string' ? { uri: item.imagePath } : item.imagePath} 
                                    className="w-full h-1/2 mb-8"
                                    resizeMode="contain"
                                />
                                ): (
                                    <View className='w-full h-full items-center'>
                                         <Image 
                                    source={typeof item.imagePath === 'string' ? { uri: item.imagePath } : item.imagePath} 
                                    className="w-full h-1/2 mb-8 object-fill"
                                    resizeMode="contain"
                                />
                                 <Image 
                                    source={typeof item.mignifiedImagePath === 'string' ? { uri: item.mignifiedImagePath } : item.mignifiedImagePath} 
                                    className="absolute w-full h-[92px] top-56"
                                    resizeMode="contain"
                                />

<Text className="text-2xl font-bold mt-10 mb-4">{item.title}</Text>
<Text className="mx-3 text-center text-sm text-[#404040] leading-6">{item.description}</Text>
                                    </View>
                                    
                                )}
                                
                                <Text className="text-2xl font-bold mt-10 mb-4">{item.title}</Text>
                                <Text className="mx-3 text-center text-sm text-[#404040] leading-6">{item.description}</Text>
                            </View>
                        ))}
                    </CustomPagerView>
                    <View className='absolute bottom-10 w-full px-4 '>
                        <CustomTouchableOpacityButton title="Get Started" onPress={handleGetStartedClick}/>
                        <View className='flex-row items-baseline justify-center'>
                            <Text className='mt-2 text-center text-base font-medium text-[#404040] leading-6'>Already have an account? </Text>
                            <TouchableOpacity onPress={handleSignInClick}>
                                <Text className='text-primary ml-1 text-base font-medium'>Sign in</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </CustomScaffold>
        </CustomSafeAreaView>
    )
}


