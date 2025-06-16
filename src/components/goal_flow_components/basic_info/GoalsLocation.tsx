import React from 'react'
import { View, Text, TouchableOpacity, TextInput, Platform, Image } from 'react-native'
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants'
import { useGoalsFlowStore } from 'src/store/goalsFlowStore'

export const GoalsLocation: React.FC = () => {
    const location = useGoalsFlowStore((state) => state.location);
    const setLocation = useGoalsFlowStore((state) => state.setLocation);



    return (
        <View className="flex-1 h-full">
            <View className="flex-col items-start w-full mt-4">
                <Text className='font-general-sans-semibold text-3xl font-600 mb-10 tracking-[-2]'>Your Location</Text>
                <TextInput 
                    className='w-full h-[68px] border border-silver rounded-md px-4 flex-row items-center justify-between placeholder:text-base' 
                    placeholder='Enter your location' 
                    value={location || ''}
                    onChangeText={setLocation}
                />
                <View className='flex-row items-center justify-center mt-2'>
                    <Image source={IMAGE_CONSTANTS.locationArrowIcon} className='w-[24px] h-[24px]' />
                    <Text className='font-general-sans-medium text-primary text-sm'>Use your current location</Text>
                </View>
            </View>
        </View>
    )
}