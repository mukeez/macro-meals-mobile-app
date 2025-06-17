/**
 * Type definitions for navigation in the app.
 */

/**
 * Root stack parameter list for the main navigation stack.
 */
export type RootStackParamList = {
    Onboarding: undefined;
    OnboardingNav: undefined;
    OnboardingScreen: undefined;
    Auth: { initialAuthScreen: string };
    Dashboard: undefined;
    Welcome: undefined;
    AccountSettings: undefined;
    Login: undefined;
    SignUp: undefined;
    MacroInput: undefined;
    ForgotPasswordScreen: undefined;
    VerificationScreen: { email: string };
    MealList: undefined;
    SettingsScreen: undefined;
    ScanScreenType: undefined;
    MainTabs: undefined;
    BarcodeScanScreen: undefined;
    GoalSetupScreen: undefined;
    GoalsBasicInfo: undefined;
    ResetPassword: { email: string, session_token: string };
    AddMeal: undefined;
    SnapMeal: undefined;
    MealLog: undefined;
    NearbyMeals: undefined;
    DashboardScreen: undefined;
    LoginScreen: undefined;
    PaymentScreen: undefined;
    SignupScreen: undefined;
    MacroGoals: undefined;
    CustomBottomTabs: undefined;
    Notifications: undefined; 
    TermsOfService: undefined;
    About: undefined;
    PrivacyPolicy: undefined;
    GoalsSetupFlow: undefined;
};