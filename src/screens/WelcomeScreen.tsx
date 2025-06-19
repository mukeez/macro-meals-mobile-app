// src/screens/WelcomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import CustomTouchableOpacityButton from '../components/CustomTouchableOpacityButton';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';
import { RootStackParamList } from '../types/navigation';



type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'WelcomeScreen'>;

export const WelcomeScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();

    const handleGetStarted = () => {
        navigation.navigate('Signup');
    };

    const handleLogin = () => {
        navigation.navigate('Login');
    };

    return (
        <CustomSafeAreaView className='flex-1' edges={['left', 'right']}>
            <View style={styles.container}>
                <View style={styles.content}>
                    <Image source={IMAGE_CONSTANTS.strawberryBg}/>
                    
                    <Text style={styles.title}>Welcome to MacroMate</Text>
                    <Text style={styles.subtitle}>
                        Track your macros, achieve your goals, and transform your nutrition journey.
                    </Text>
                </View>

                <View style={styles.buttonContainer}>
                    <CustomTouchableOpacityButton
                        className='h-[56px] w-full items-center justify-center bg-primary rounded-[100px] mb-4'
                        title="Get Started"
                        textClassName='text-white text-[17px] font-semibold'
                        onPress={handleGetStarted}
                    />
                    <CustomTouchableOpacityButton
                        className='h-[56px] w-full items-center justify-center bg-white border border-primary rounded-[100px]'
                        title="I already have an account"
                        textClassName='text-primary text-[17px] font-semibold'
                        onPress={handleLogin}
                    />
                </View>
            </View>
        </CustomSafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 24,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#202030',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
    buttonContainer: {
        marginBottom: 24,
    },
});