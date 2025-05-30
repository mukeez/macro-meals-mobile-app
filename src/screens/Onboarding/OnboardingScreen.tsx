import React, { useState } from 'react';
import { View, Text, Image } from "react-native";
import CustomSafeAreaView from '../../components/CustomSafeAreaView';
import CustomTouchableOpacityButton from '../../components/CustomTouchableOpacityButton';
import CustomScaffold from '../../components/CustomScaffold';
import CustomPagerView from '../../components/CustomPagerView';
import { onboardingItems, OnboardingItem } from '../../constants/onboarding';

export const OnboardingScreen: React.FC = () => {
    return (
        <CustomSafeAreaView edges={['left', 'right']}>
            <CustomScaffold>
                <CustomPagerView indicatorActiveColor='bg-indicatorActive' indicatorInactiveColor='bg-indicatorInactive'>
                    {onboardingItems.map((item: OnboardingItem, index: number) => (
                        <View key={index} className="flex-1 justify-center items-center p-4">
                            <Image 
                                source={item.imagePath} 
                                className="w-full h-1/2 mb-8"
                                resizeMode="contain"
                            />
                            <Text className="text-2xl font-bold mb-4">{item.title}</Text>
                            <Text className="text-center text-gray-600">{item.description}</Text>
                        </View>
                    ))}
                </CustomPagerView>
                <CustomTouchableOpacityButton title="Next" onPress={()=>{}}/>
            </CustomScaffold>
        </CustomSafeAreaView>
    )
}


