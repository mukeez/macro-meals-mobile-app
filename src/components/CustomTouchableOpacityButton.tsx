import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function CustomTouchableOpacityButton({
    title,
    onPress,
    disabled,
    className,
    textClassName,

}: {
    title: string;
    onPress: ()=> void;
    disabled?: boolean;
    className?: string;
    textClassName?: string;
}){
    return (
        <TouchableOpacity onPress={onPress} disabled={disabled} className={className ?? 'h-[56px] items-center justify-center bg-primary rounded-[100px]'} >
            <Text className={textClassName ?? 'text-white text-center text-base font-semibold'}>{title}</Text>
        </TouchableOpacity>
    )
}