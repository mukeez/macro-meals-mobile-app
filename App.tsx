import React, {useEffect, useState} from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import useStore from "./src/store/useStore";

import {LoginScreen} from "./src/screens/LoginScreen";
import {SignupScreen} from "./src/screens/SignupScreen";
import {DashboardScreen} from "./src/screens/DashboardScreen";
import {MacroInputScreen} from "./src/screens/MacroInputScreen";
import {MealListScreen} from "./src/screens/MealListScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {WelcomeScreen} from "./src/screens/WelcomeScreen";
import MacroGoalsScreen from "./src/screens/MacroGoalsScreen";
import {NearbyMealsScreen} from "./src/screens/NearbyMealsScreen";
import MealLogScreen from "./src/screens/MealLogScreen";
import AddMealScreen from "./src/screens/AddMealScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import ScanScreenType from "./src/screens/ScanScreenType";
import BarcodeScanScreen from "./src/screens/BarcodeScanScreen";
import SnapMealScreen from "./src/screens/SnapMealScreen";

type RootStackParamList = {
    Welcome: undefined;
    Login: undefined;
    SignUp: undefined;
    MacroInput: undefined;
    MealList: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
    const [isLoading, setIsLoading] = useState(true);
    const { setAuthenticated } = useStore();

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('access_token');
                const userId = await AsyncStorage.getItem('user_id');

                if (token && userId) {
                    // Restore authentication state
                    setAuthenticated(true, token, userId);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Welcome"
                screenOptions={{ headerShown: false }}
            >
                <Stack.Screen name="Welcome" component={WelcomeScreen} />
                <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
                <Stack.Screen name="ScanScreenType" component={ScanScreenType} />
                <Stack.Screen name="BarcodeScanScreen" component={BarcodeScanScreen} />
                <Stack.Screen name="AddMeal" component={AddMealScreen} />
                <Stack.Screen name="SnapMeal" component={SnapMealScreen} />
                <Stack.Screen name="MealLog" component={MealLogScreen} />
                <Stack.Screen name="NearbyMeals" component={NearbyMealsScreen} />
                <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
                <Stack.Screen name="LoginScreen" component={LoginScreen} />
                <Stack.Screen name="SignupScreen" component={SignupScreen} />
                <Stack.Screen name="MacroInput" component={MacroInputScreen} />
                <Stack.Screen name="MacroGoals" component={MacroGoalsScreen} />
                <Stack.Screen name="MealList" component={MealListScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}