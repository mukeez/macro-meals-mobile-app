import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface MacroCircleProps {
    type: string;
    value: number;
    progress: number;
    color: string;
}

export const MacroCircle: React.FC<MacroCircleProps> = ({ type, value, progress, color }) => {
    const size = 80;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <View style={styles.container}>
            <View style={styles.circleContainer}>
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
                <View style={styles.valueContainer}>
                    <Text style={styles.value}>{value}g</Text>
                </View>
            </View>

            <Text style={styles.label}>{type}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
    },
    circleContainer: {
        width: 80,
        height: 80,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    valueContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    value: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    label: {
        fontSize: 14,
        color: '#666',
    },
});