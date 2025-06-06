import React, { useEffect } from "react";
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {WelcomeScreen} from "./src/screens/WelcomeScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import ScanScreenType from "./src/screens/ScanScreenType";
import BarcodeScanScreen from "./src/screens/BarcodeScanScreen";
import AddMealScreen from "./src/screens/AddMealScreen";
import SnapMealScreen from "./src/screens/SnapMealScreen";
import MealLogScreen from "./src/screens/MealLogScreen";
import {NearbyMealsScreen} from "./src/screens/NearbyMealsScreen";
import {DashboardScreen} from "./src/screens/DashboardScreen";
import {LoginScreen} from "./src/screens/LoginScreen";
import {SignupScreen} from "./src/screens/SignupScreen";
import {MacroInputScreen} from "./src/screens/MacroInputScreen";
import MacroGoalsScreen from "./src/screens/MacroGoalsScreen";
import {MealListScreen} from "./src/screens/MealListScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import {createStackNavigator} from '@react-navigation/stack';
import { useMixpanel } from "@macro-meals/mixpanel";
import './src/globals.css';

type RootStackParamList = {
    Welcome: undefined;
    Login: undefined;
    SignUp: undefined;
    MacroInput: undefined;
    MealList: undefined;
    SettingsScreen: undefined;
    ScanScreenType: undefined;
    BarcodeScanScreen: undefined;
    AddMeal: undefined;
    SnapMeal: undefined;
    MealLog: undefined;
    NearbyMeals: undefined;
    DashboardScreen: undefined;
    LoginScreen: undefined;
    PaymentScreen: undefined;
    SignupScreen: undefined;
    MacroGoals: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export function RootStack() {
    const mixpanel = useMixpanel();

    useEffect(() => {
        
        if (mixpanel) {
            mixpanel.track({
                name: 'app_opened',
                properties: {
                    platform: Platform.OS,
                    version: Constants.expoConfig?.version || '1.0.0',
                }
            });
        } else {
            console.warn('[MIXPANEL] ⚠️  App opened but Mixpanel not available');
        }
    }, [mixpanel]);

    return <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{headerShown: false}}
    >
        <Stack.Screen name="Welcome" component={WelcomeScreen}/>
        <Stack.Screen name="SettingsScreen" component={SettingsScreen}/>
        <Stack.Screen name="ScanScreenType" component={ScanScreenType}/>
        <Stack.Screen name="BarcodeScanScreen" component={BarcodeScanScreen}/>
        <Stack.Screen name="AddMeal" component={AddMealScreen}/>
        <Stack.Screen name="SnapMeal" component={SnapMealScreen}/>
        <Stack.Screen name="MealLog" component={MealLogScreen}/>
        <Stack.Screen name="NearbyMeals" component={NearbyMealsScreen}/>
        <Stack.Screen name="DashboardScreen" component={DashboardScreen}/>
        <Stack.Screen name="LoginScreen" component={LoginScreen}/>
        <Stack.Screen name="SignupScreen" component={SignupScreen}/>
        <Stack.Screen name="MacroInput" component={MacroInputScreen}/>
        <Stack.Screen name="MacroGoals" component={MacroGoalsScreen}/>
        <Stack.Screen name="MealList" component={MealListScreen}/>
        <Stack.Screen name="PaymentScreen" component={PaymentScreen}/>
    </Stack.Navigator>;
}