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
     ForgotPasswordScreen: { source: string };
    VerificationScreen: { email: string; source: string };
    ResetPassword: { email: string; session_token: string; source: string }; 
    MealList: undefined;
    SettingsScreen: undefined;
    ScanScreenType: undefined;
    MainTabs: undefined;
    BarcodeScanScreen: undefined;
    GoalSetupScreen: undefined;
    GoalsBasicInfo: undefined;
    AddMeal: undefined;
    AddMealScreen: {
      analyzedData?: {
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        quantity: number;
        meal_type?: string;
        meal_time?: string;
      };
    };
    SnapMeal: undefined;
    MealLog: undefined;
    NearbyMeals: undefined;
    DashboardScreen: undefined;
    LoginScreen: undefined;
    PaymentScreen: undefined;
    SignupScreen: undefined;
    MacroGoals: undefined;
    CustomBottomTabs: { screen?: string } | undefined;
    Notifications: undefined;
    TermsOfServiceScreen: undefined;
    About: undefined;
    MealFinderScreen: undefined;
    MealFinderBreakdownScreen: { meal: any };
    PrivacyPolicy: undefined;
    AiMealSuggestionsScreen: undefined;
    GoalsSetupFlow: undefined;
    ChangePassword: undefined;
    AdjustTargets: undefined;
    Progress:undefined;
    AccountSettingsScreen: undefined;
    AISuggestedMealsDetailsScreen: { meal: any };
    GoalSetupNav: undefined;
    NotificationsScreen: undefined;
    EditMealScreen: {
      analyzedData?: {
        name: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        quantity: number;
        meal_type?: string;
        serving_size?: number;
        no_of_servings?: number;
        logging_mode?: string;
        meal_time?: string;
      };
    };
};