import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";

export default function CustomTouchableOpacityButton({
    title,
    onPress,
    disabled,
    className,
    textClassName,
    isLoading,
}: {
    title: string;
    onPress: ()=> void;
    disabled?: boolean;
    className?: string;
    textClassName?: string;
    isLoading?: boolean;
}){
    return (
        <TouchableOpacity 
            onPress={onPress} 
            disabled={disabled} 
            style={[
                { opacity: disabled ? 0.3 : 1 },
                { height: 56, width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#08a489', borderRadius: 100 }
            ]}
        >
            {isLoading ? (
                <ActivityIndicator color="white" size="small" />
            ) : (
                <Text className={textClassName ?? 'text-white text-center text-base font-semibold'}>{title}</Text>
            )}
        </TouchableOpacity>
    )
}