import React from "react";
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
import {OnboardingScreen} from "./src/screens/Onboarding/OnboardingScreen";
import {MacroInputScreen} from "./src/screens/MacroInputScreen";
import MacroGoalsScreen from "./src/screens/MacroGoalsScreen";
import {MealListScreen} from "./src/screens/MealListScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import {createStackNavigator} from '@react-navigation/stack';
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

export function RootStack({isOnboardingCompleted, isAuthenticated}: {isOnboardingCompleted: boolean, isAuthenticated: boolean}){
    return (
        <Stack.Navigator screenOptions={{headerShown: false}}>
            {
                !isOnboardingCompleted ? (
                    <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
                ): !isAuthenticated ? (
                    <Stack.Screen name="Auth" component={AuthNavigator} />
                ): (
                    <Stack.Screen name="Dashboard" component={DashboardNavigator} />
                )
            }
        </Stack.Navigator>
    );
}


const AuthNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false}}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="SignupScreen" component={SignupScreen} />
        </Stack.Navigator>
    )
}


const OnboardingNavigator = () =>{
    return (
        <Stack.Navigator screenOptions={{ headerShown: false}}>
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        </Stack.Navigator>
    );
}

const DashboardNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false}}>
            <Stack.Screen name="DashboardScreen" component={DashboardScreen} />
            <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
            <Stack.Screen name="ScanScreenType" component={ScanScreenType} />
            <Stack.Screen name="BarcodeScanScreen" component={BarcodeScanScreen} />
            <Stack.Screen name="AddMeal" component={AddMealScreen} />
            <Stack.Screen name="SnapMeal" component={SnapMealScreen} />
            <Stack.Screen name="MealLog" component={MealLogScreen} />
        </Stack.Navigator>
    );
}


// export function RootStack() {
//     return <Stack.Navigator
//         initialRouteName="Welcome"
//         screenOptions={{headerShown: false}}
//     >
//         <Stack.Screen name="Welcome" component={WelcomeScreen}/>
//         <Stack.Screen name="SettingsScreen" component={SettingsScreen}/>
//         <Stack.Screen name="ScanScreenType" component={ScanScreenType}/>
//         <Stack.Screen name="BarcodeScanScreen" component={BarcodeScanScreen}/>
//         <Stack.Screen name="AddMeal" component={AddMealScreen}/>
//         <Stack.Screen name="SnapMeal" component={SnapMealScreen}/>
//         <Stack.Screen name="MealLog" component={MealLogScreen}/>
//         <Stack.Screen name="NearbyMeals" component={NearbyMealsScreen}/>
//         <Stack.Screen name="DashboardScreen" component={DashboardScreen}/>
//         <Stack.Screen name="LoginScreen" component={LoginScreen}/>
//         <Stack.Screen name="SignupScreen" component={SignupScreen}/>
//         <Stack.Screen name="MacroInput" component={MacroInputScreen}/>
//         <Stack.Screen name="MacroGoals" component={MacroGoalsScreen}/>
//         <Stack.Screen name="MealList" component={MealListScreen}/>
//         <Stack.Screen name="PaymentScreen" component={PaymentScreen}/>
//     </Stack.Navigator>;
// }