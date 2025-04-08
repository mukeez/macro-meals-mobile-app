// App.tsx with navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { WelcomeScreen } from './src/screens/WelcomeScreen';
import { MacroInputScreen } from './src/screens/MacroInputScreen';
import { MealListScreen } from './src/screens/MealListScreen';
import {LoginScreen} from "./src/screens/LoginScreen";

const Stack = createStackNavigator();

export default function App() {
    return (
        <SafeAreaProvider>
            <StatusBar style="dark" />
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Welcome"
                    screenOptions={{
                        headerShown: false, // Hide header for all screens
                    }}
                >
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="MacroInput" component={MacroInputScreen} />
                    <Stack.Screen name="MealList" component={MealListScreen} />
                    <Stack.Screen name="LoginScreen" component={LoginScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}