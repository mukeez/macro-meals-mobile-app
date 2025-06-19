import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface MacroCircleProps {
    type: string;
    value: number;
    progress: number;
    color: string;
    size?: number;
    strokeWidth?: number;
}

export const MacroCircle: React.FC<MacroCircleProps> = ({ type, value, progress, color, size = 80, strokeWidth = 8 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <View className="items-center">
            <View className="w-20 h-20 mb-2 justify-center items-center relative">
                <Svg width={size} height={size}>
                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#f1f1f1"
                        strokeWidth={strokeWidth}
                        fill="white"
                    />

                    <Circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        fill="none"
                        strokeLinecap="round"
                        rotation={-90}
                        originX={size / 2}
                        originY={size / 2}
                    />
                </Svg>

                {/* Value in the center */}
                <View className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center">
                    <Text className="text-base font-bold text-[#333]">{value}g</Text>
                </View>
            </View>

            <Text className="text-sm mt-4 text-[#666]">{type}</Text>
        </View>
    );
};