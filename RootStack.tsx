import React, { useContext } from "react";
import { useRemoteConfigContext } from '@macro-meals/remote-config-service';
import Config from 'react-native-config';

import { HasMacrosContext } from './src/contexts/HasMacrosContext';
import { IsProContext } from './src/contexts/IsProContext';
import MealFinderScreen from "src/screens/MealFinderScreen";
import { WelcomeScreen } from "./src/screens/WelcomeScreen";
// import SettingsScreen from "./src/screens/SettingsScreen";
import ScanScreenType from "./src/screens/ScanScreenType";
import BarcodeScanScreen from "./src/screens/BarcodeScanScreen";
import SnapMealScreen from "./src/screens/SnapMealScreen";
import MealLogScreen from "./src/screens/MealLogScreen";
// import { NearbyMealsScreen } from "./src/screens/NearbyMealsScreen";
import MealFinderBreakdownScreen from "./src/screens/MealFinderBreakdown";
// import { DashboardScreen } from "./src/screens/DashboardScreen";
import { LoginScreen } from "./src/screens/LoginScreen";
import { SignupScreen } from "./src/screens/SignupScreen";
import { OnboardingScreen } from "./src/screens/Onboarding/OnboardingScreen";
import { GoalSetupScreen } from "./src/screens/GoalSetupScreen";
import MacroGoalsScreen from "./src/screens/MacroGoalsScreen";

import { ForgotPasswordScreen } from "./src/screens/ForgotPasswordScreen";
import { VerificationScreen } from "./src/screens/VerificationScreen";
// import { MealListScreen } from "./src/screens/MealListScreen";
import PaymentScreen from "./src/screens/PaymentScreen";
import { createStackNavigator } from "@react-navigation/stack";
// import { useMixpanel } from "@macro-meals/mixpanel";
import "./src/globals.css";
// import AsyncStorage from "@react-native-async-storage/async-storage";
import { RootStackParamList } from "./src/types/navigation";
import { ResetPasswordScreen } from "./src/screens/ResetPassword";
import CustomBottomTabs from "./src/navigation/BottomTabNavigation";
// import AddMeal from "./src/screens/AddMeal";
import NotificationsScreen from "./src/screens/NotificationsScreen";
import NotificationsPreferences from "./src/screens/NotificationsPreferences";
import AddMealScreen from "./src/screens/AddMealScreen";
import TermsOfServiceScreen from "./src/screens/TermsOfServiceScreen";
import AboutScreen from "./src/screens/AboutScreen";
import PrivacyPolicyScreen from "./src/screens/PrivacyPolicyScreen";
import AiMealSuggestionsScreen from "src/screens/AiMealSuggestionsScreen";
import ChangePasswordScreen from "./src/screens/ChangePasswordScreen";
import AdjustTargetsScreen from "./src/screens/AdjustTargetsScreen";
import { GoalsSetupFlow } from "src/screens/GoalsSetupFlow";
import AccountSettingsScreen from "src/screens/AccountSettingsScreen";
import EditMealScreen from "src/screens/EditMealScreen";
import AISuggestedMealsDetailsScreen from "src/screens/AISuggestedMealsDetails";
import { EmailVerificationScreen } from "src/screens/EmailVerificationScreen";
import AddSearchedLoggedMealScreen from "src/screens/AddSearchedLoggedMealScreen";
import HealthGuidelinesScreen from "src/screens/HealthGuidelinesScreen";
import ManageSubscriptionsScreen from "src/screens/ManageSubscriptionsScreen";
import ScannedMealBreakdownScreen from "./src/screens/ScannedMealBreakdown";
import AIRecipeDetailsScreen from "./src/screens/AIRecipeDetailsScreen";

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
  // Get values from context instead of props for better reactivity
  const { hasMacros, readyForDashboard } = useContext(HasMacrosContext);
  const { isPro } = useContext(IsProContext);
  
  // Note: Subscription status is now handled in App.tsx during session validation
  // This prevents race conditions and ensures proper routing on first load
  

  // Get dev mode from remote config (ignored in production)
  const { getValue, isInitialized } = useRemoteConfigContext();
  let devMode = false;
  
  // Only try to get dev_mode if remote config is initialized
  if (isInitialized) {
    try {
      // Only allow dev_mode to bypass payment in non-production environments
              const currentEnv = Config.ENVIRONMENT;
      console.log('🔍 RootStack - Current environment:', currentEnv);
      
      if (currentEnv !== 'production') {
        const devModeValue = getValue('dev_mode');
        console.log('🔍 RootStack - Raw dev_mode value:', devModeValue);
        devMode = devModeValue.asBoolean();
        console.log('🔍 RootStack - Parsed dev_mode value:', devMode);
      } else {
        console.log('🔍 RootStack - Production environment detected, ignoring dev_mode remote config');
        devMode = false;
      }
    } catch (error) {
      console.log('🔍 RootStack - Could not get dev_mode from remote config, defaulting to false:', error);
      devMode = false;
    }
  } else {
    console.log('🔍 RootStack - Remote config not initialized yet, dev_mode defaults to false');
    // Only enable dev mode bypass if explicitly configured
    // This prevents automatic bypass in development
  }
  
  // Simplified routing logic - App.tsx handles session validation
  const shouldShowLogin = !isAuthenticated;
  
  console.log("🔍 RootStack Routing Decision:", {
    isOnboardingCompleted,
    isAuthenticated,
    initialAuthScreen,
    hasMacros,
    isPro,
    readyForDashboard,
    devMode,
    shouldShowOnboarding: !isOnboardingCompleted,
    shouldShowAuth: shouldShowLogin,
    shouldShowDashboard: hasMacros && readyForDashboard && (isPro || devMode),
    shouldShowPayment: hasMacros && readyForDashboard && !isPro && !devMode,
    shouldShowGoalSetup: !(hasMacros && readyForDashboard)
  });

  // Add immediate debugging for the routing condition
  const shouldShowDashboard = hasMacros && readyForDashboard && (isPro || devMode);
  const shouldShowPayment = hasMacros && readyForDashboard && !isPro && !devMode;
  
  console.log("🔍 RootStack - Routing Conditions:", {
    hasMacros,
    readyForDashboard,
    isPro,
    devMode,
    hasMacrosAndReady: hasMacros && readyForDashboard,
    shouldShowDashboard,
    shouldShowPayment,
    finalDecision: shouldShowDashboard ? "DASHBOARD" : shouldShowPayment ? "PAYMENT" : "GOAL_SETUP"
  });

  // Add specific logging for isPro routing
  if (hasMacros && readyForDashboard) {
    if (isPro) {
      console.log("🔍 RootStack - User is PRO, routing to Dashboard");
    } else if (devMode) {
      console.log("🔍 RootStack - User is not PRO but dev mode is enabled, routing to Dashboard");
    } else {
      console.log("🔍 RootStack - User is not PRO and dev mode is disabled, routing to PaymentScreen");
    }
  }

  // Log dev mode bypass if applicable
  if (devMode && hasMacros && readyForDashboard && !isPro) {
    console.log("🛠️ DEV MODE: Bypassing payment screen, routing to dashboard");
  }

  // Log which screen will be rendered
  let currentScreen = '';
  if (!isOnboardingCompleted) {
    currentScreen = 'OnboardingNav';
  } else if (!isAuthenticated) {
    currentScreen = 'Auth';
  } else if (hasMacros && readyForDashboard) {
    if (isPro || devMode) {
      currentScreen = 'Dashboard';
    } else {
      currentScreen = 'PaymentScreen';
    }
  } else {
    currentScreen = 'GoalSetupNav';
  }
  
  console.log('🔍 RootStack - Rendering screen:', currentScreen);
  


  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isOnboardingCompleted ? (
        <Stack.Screen name="OnboardingNav" component={OnboardingNavigator} />
      ) : shouldShowLogin ? (
        <Stack.Screen
          name="Auth"
          component={AuthNavigator}
          initialParams={{ initialAuthScreen: initialAuthScreen }}
        />
      ) : hasMacros && readyForDashboard ? (
        (isPro || devMode) ? (
          <Stack.Screen name="Dashboard" component={DashboardNavigator} />
        ) : (
          <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
        )
      ) : (
        <Stack.Screen name="GoalSetupNav" component={GoalSetupNavigator} />
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
      <Stack.Screen name="WelcomeScreen" component={WelcomeScreen} />
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="SignupScreen" component={SignupScreen} />
      <Stack.Screen
        name="EmailVerificationScreen"
        component={EmailVerificationScreen}
      />
    </Stack.Navigator>
  );
};

const OnboardingNavigator = () => {
  // const handleGetStartedClick = async () => {
  //   try {
  //     await AsyncStorage.setItem("isOnboardingCompleted", "true");
  //   } catch (error) {
  //     console.error("Error saving onboarding status:", error);
  //   }
  // };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OnboardingScreen" component={OnboardingScreen} />
    </Stack.Navigator>
  );
};

const GoalSetupNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GoalSetupScreen" component={GoalSetupScreen} />
      <Stack.Screen name="GoalsSetupFlow" component={GoalsSetupFlow} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
    </Stack.Navigator>
  );
};

const DashboardNavigator = () => {
  console.log('🔍 DashboardNavigator - Rendering DashboardNavigator');
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={CustomBottomTabs} />
      <Stack.Screen name="BarcodeScanScreen" component={BarcodeScanScreen} />
      <Stack.Screen name="AddMealScreen" component={AddMealScreen} />
      <Stack.Screen name="EditMealScreen" component={EditMealScreen} />
      <Stack.Screen name="SnapMeal" component={SnapMealScreen} />
      <Stack.Screen
        name="NotificationsScreen"
        component={NotificationsScreen}
      />
      <Stack.Screen
        name="AccountSettingsScreen"
        component={AccountSettingsScreen}
      />
      <Stack.Screen name="MealLog" component={MealLogScreen} />
      <Stack.Screen
        name="AiMealSuggestionsScreen"
        component={AiMealSuggestionsScreen}
      />
      <Stack.Screen
        name="AIRecipeDetailsScreen"
        component={AIRecipeDetailsScreen}
      />
      <Stack.Screen name="ScanScreenType" component={ScanScreenType} />
      <Stack.Screen name="ManageSubscriptionsScreen" component={ManageSubscriptionsScreen} />
      <Stack.Screen name="MacroGoals" component={MacroGoalsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsPreferences} />
      <Stack.Screen name="MealFinderScreen" component={MealFinderScreen} />
      <Stack.Screen
        name="MealFinderBreakdownScreen"
        component={MealFinderBreakdownScreen}
      />
      <Stack.Screen
        name="ScannedMealBreakdownScreen"
        component={ScannedMealBreakdownScreen}
      />
      <Stack.Screen
        name="AISuggestedMealsDetailsScreen"
        component={AISuggestedMealsDetailsScreen}
      />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen
        name="ForgotPasswordScreen"
        component={ForgotPasswordScreen}
      />
      <Stack.Screen name="AdjustTargets" component={AdjustTargetsScreen} />
      <Stack.Screen name="PaymentScreen" component={PaymentScreen} />
      <Stack.Screen name="HealthGuidelinesScreen" component={HealthGuidelinesScreen} />
      <Stack.Screen
        name="TermsOfServiceScreen"
        component={TermsOfServiceScreen}
      />
      <Stack.Screen
        name="AddSearchedLoggedMeal"
        component={AddSearchedLoggedMealScreen}
      />
      <Stack.Screen name="VerificationScreen" component={VerificationScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </Stack.Navigator>
  );
};
