import React, { useEffect } from "react";
import { Platform } from 'react-native';
import MealFinderScreen from "src/screens/MealFinderScreen";
import {WelcomeScreen} from "./src/screens/WelcomeScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import ScanScreenType from "./src/screens/ScanScreenType";
import BarcodeScanScreen from "./src/screens/BarcodeScanScreen";
import SnapMealScreen from "./src/screens/SnapMealScreen";
import MealLogScreen from "./src/screens/MealLogScreen";
import { NearbyMealsScreen } from "./src/screens/NearbyMealsScreen";
import MealFinderBreakdownScreen from "./src/screens/MealFinderBreakdown";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { SignupScreen } from "./src/screens/SignupScreen";
import { OnboardingScreen } from "./src/screens/Onboarding/OnboardingScreen";
import { GoalSetupScreen } from "./src/screens/GoalSetupScreen";
import MacroGoalsScreen from "./src/screens/MacroGoalsScreen";


import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { VerificationScreen } from "./src/screens/VerificationScreen";
import { MealListScreen } from "./src/screens/MealListScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import {createStackNavigator} from '@react-navigation/stack';
import { useMixpanel } from "@macro-meals/mixpanel";
import './src/globals.css';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from "./src/types/navigation";
import { ResetPasswordScreen } from "./src/screens/ResetPassword";
import CustomBottomTabs from "./src/navigation/BottomTabNavigation";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import NotificationsPreferences from "./src/screens/NotificationsPreferences";
import AddMealScreen from "./src/screens/AddMealScreen";
import TermsOfServiceScreen from "./src/screens/TermsOfServiceScreen";
import AboutScreen from "./src/screens/AboutScreen";
import PrivacyPolicyScreen from "./src/screens/PrivacyPolicyScreen";
import ChangePasswordScreen from "./src/screens/ChangePasswordScreen";
import { AccountSettingsScreen } from "src/screens/AccountSettingsScreen";
import AdjustTargetsScreen from "./src/screens/AdjustTargetsScreen";
import { GoalsSetupFlow } from "src/screens/GoalsSetupFlow";

const Stack = createStackNavigator<RootStackParamList>();

export function RootStack({
  isOnboardingCompleted,
  isAuthenticated,
  initialAuthScreen,
}: {
  isOnboardingCompleted: boolean;
  isAuthenticated: boolean;
  initialAuthScreen: string;
}) {
  console.log("initialAuthScreen", initialAuthScreen);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isOnboardingCompleted ? (
        <Stack.Screen name="OnboardingNav" component={OnboardingNavigator} />
      ) : !isAuthenticated ? (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          initialParams={{ initialAuthScreen: initialAuthScreen }}
        />
      ) : (
        <Stack.Screen name="Dashboard" component={DashboardNavigator} />
      )}
    </Stack.Navigator>
  );
}

const AuthNavigator = ({
  route,
}: {
  route: { params?: { initialAuthScreen: string } };
}) => {
  const initialScreen = route.params?.initialAuthScreen || "LoginScreen";
  console.log("THIS IS THE INITIAL SCREEN", initialScreen);
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={initialScreen as any}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
    </Stack.Navigator>
  );
};

const OnboardingNavigator = () => {
  const handleGetStartedClick = async () => {
    try {
      await AsyncStorage.setItem("isOnboardingCompleted", "true");
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
    </Stack.Navigator>
  );
};

const DashboardNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={CustomBottomTabs} />
      <Stack.Screen name="BarcodeScanScreen" component={BarcodeScanScreen} />
      <Stack.Screen name="AddMeal" component={AddMealScreen} />
      <Stack.Screen name="SnapMeal" component={SnapMealScreen} />
      <Stack.Screen name="MealLog" component={MealLogScreen} />
      <Stack.Screen name="GoalSetupScreen" component={GoalSetupScreen} />
      <Stack.Screen name="GoalsSetupFlow" component={GoalsSetupFlow} />
      <Stack.Screen name="ScanScreenType" component={ScanScreenType} />
      <Stack.Screen name="MacroGoals" component={MacroGoalsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsPreferences} />
      <Stack.Screen name="MealFinderScreen" component={MealFinderScreen} />
      <Stack.Screen name="MealFinderBreakdownScreen" component={MealFinderBreakdownScreen} />
      <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <Stack.Screen name="AdjustTargets" component={AdjustTargetsScreen} />
            <Stack.Screen name="PaymentScreen" component={PaymentScreen} />

    </Stack.Navigator>
  );
};

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
