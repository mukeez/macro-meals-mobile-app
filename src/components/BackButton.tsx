import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { IMAGE_CONSTANTS } from "../constants/imageConstants";

export default function BackButton({onPress}: {onPress: () => void}){
    return (
        <TouchableOpacity onPress={onPress}className="flex-row items-center justify-center h-[32px] w-[32px] bg-gray-100 rounded-full">
            <Image source={IMAGE_CONSTANTS.backButton} className="w-[8px] h-[14px]" />
        </TouchableOpacity>
    )
}