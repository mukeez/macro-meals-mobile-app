import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Image,

} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import CustomSafeAreaView  from '../components/CustomSafeAreaView';
import BackButton from 'src/components/BackButton';
import { RootStackParamList } from 'src/types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants';
import { useGoalsFlowStore } from 'src/store/goalsFlowStore';
import useStore from 'src/store/useStore';





type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const GoalSetupScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const { completed, majorStep, setMajorStep, setSubStep, navigateToMajorStep } = useGoalsFlowStore();
    const setHasBeenPromptedForGoals = useStore((state) => state.setHasBeenPromptedForGoals);
    return (
        <CustomSafeAreaView className="flex-1 bg-white" edges={['left', 'right']}>
            <ScrollView className="relative flex-1 mx-4" contentContainerStyle={{ flexGrow: 1 }}>
                <View className="flex-1">
                {/* <View className="flex-row items-center justify-between">
                    <BackButton onPress={() => {
                        setHasBeenPromptedForGoals(false);
                        navigation.navigate('MainTabs' as never);
                    }} />
                </View> */}
                <View className="items-start justify-start mt-4">
                    <Text className="text-3xl font-bold">Welcome</Text>
                    <Text className="mt-2 leading-7 font-normal text-lg text-textMediumGrey">Set up your personalized macro plan in three simple steps. Each completed stage brings you closer to nutrition targets tailored to your body and goals.</Text>
                </View>
                <View className="flex-col gap-4 mt-8">
                    <TouchableOpacity 
                        className={`h-[56px] rounded-[1000px] p-4 flex-row items-center justify-center gap-3 ${completed[0]?.every(Boolean) ? 'bg-gray' : 'bg-gray opacity-50'}`}
                        onPress={() => {
                            if (completed[0]?.every(Boolean)) {
                                navigateToMajorStep(0);
                                navigation.navigate('GoalsSetupFlow');
                            }
                        }}
                        disabled={!completed[0]?.every(Boolean)}
                        activeOpacity={completed[0]?.every(Boolean) ? 0.8 : 1}
                    >
                        <Image source={IMAGE_CONSTANTS.personAltIcon} className="w-[16px] h-[16px]" />
                        <Text className={`text-base font-normal ${completed[0]?.every(Boolean) ? 'text-primary' : 'text-gray-500'}`}>Basic info</Text>
                        {completed[0]?.every(Boolean) && (
                          <Image source={IMAGE_CONSTANTS.checkPrimary} className='absolute right-6 w-[20px] h-[20px]' />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className={`h-[56px] rounded-[1000px] p-4 flex-row items-center justify-center gap-3 ${completed[1]?.every(Boolean) ? 'bg-gray' : 'bg-gray opacity-50'}`}
                        onPress={() => {
                            if (completed[1]?.every(Boolean)) {
                                navigateToMajorStep(1);
                                navigation.navigate('GoalsSetupFlow');
                            }
                        }}
                        disabled={!completed[1]?.every(Boolean)}
                        activeOpacity={completed[1]?.every(Boolean) ? 0.8 : 1}
                    >
                        <View className='flex-row items-center justify-center gap-3'>
                        <Image source={IMAGE_CONSTANTS.goalTargetIcon} className="w-[16px] h-[16px]" />
                        <Text className={`text-base font-normal ${completed[1]?.every(Boolean) ? 'text-primary' : 'text-gray-500'}`}>Your goal</Text>
                        </View>
                        {completed[1]?.every(Boolean) && (
                          <Image source={IMAGE_CONSTANTS.checkPrimary} className='absolute right-6 w-[20px] h-[20px]' />
                        )}
                    </TouchableOpacity>
                    <TouchableOpacity 
                        className={`h-[56px] rounded-[1000px] p-4 flex-row items-center justify-center gap-3 ${completed[2]?.every(Boolean) ? 'bg-gray' : 'bg-gray opacity-50'}`}
                        onPress={() => {
                            if (completed[2]?.every(Boolean)) {
                                navigateToMajorStep(2);
                                navigation.navigate('GoalsSetupFlow');
                            }
                        }}
                        disabled={!completed[2]?.every(Boolean)}
                        activeOpacity={completed[2]?.every(Boolean) ? 0.8 : 1}
                    >
                        <Image source={IMAGE_CONSTANTS.navIcon} className="w-[16px] h-[16px]" />
                        <Text className={`text-base font-normal ${completed[2]?.every(Boolean) ? 'text-primary' : 'text-gray-500'}`}>Your plan</Text>
                        {completed[2]?.every(Boolean) && (
                          <Image source={IMAGE_CONSTANTS.checkPrimary} className='absolute right-6 w-[20px] h-[20px]' />
                        )}
                    </TouchableOpacity>
                </View>
                <TouchableOpacity className="absolute bottom-5 left-0 right-0 bg-primary h-[56px] rounded-[1000px] p-4 flex-row items-center justify-center gap-3"
                onPress={() => {
                    const allCompleted = completed[0]?.every(Boolean) && completed[1]?.every(Boolean) && completed[2]?.every(Boolean);
                    if (allCompleted) {
                        navigation.navigate('PaymentScreen');
                        setHasBeenPromptedForGoals(false);
                        return;
                    }
                    if (completed[majorStep]?.every(Boolean) && majorStep < 2) {
                        setMajorStep(majorStep + 1);
                        setSubStep(majorStep + 1, 0);
                    }
                    navigation.navigate('GoalsSetupFlow');
                }}>
                    <Text className="text-base font-normal text-white">
                        {(() => {
                            const allCompleted = completed[0]?.every(Boolean) && completed[1]?.every(Boolean) && completed[2]?.every(Boolean);
                            if (allCompleted) return "Let's get started";
                            if (majorStep === 2) return 'Confirm';
                            return 'Continue';
                        })()}
                    </Text>
                </TouchableOpacity>
                </View>
            </ScrollView>
        </CustomSafeAreaView>
    );
};

