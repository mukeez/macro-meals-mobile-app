import { IMAGE_CONSTANTS } from "./imageConstants";

export interface OnboardingItem {
    title: string;
    description: string;
    imagePath: string;
}

export const onboardingItems: OnboardingItem[] = [
    {
        title: "Welcome to Macro Meals",
        description: "Macro Meals is a mobile app that helps you track your macros and improve your health.",
        imagePath: IMAGE_CONSTANTS.macroCalculator,
    },
    {
        title: "Track your macros",
        description: "Macro Meals is a mobile app that helps you track your macros and improve your health.",
        imagePath: IMAGE_CONSTANTS.macroDashboard,
    },
    {
        title: "Track your macros",
        description: "Macro Meals is a mobile app that helps you track your macros and improve your health.",
        imagePath: IMAGE_CONSTANTS.nearbyMealFinder,
    },
    {
        title: "Track your macros",
        description: "Macro Meals is a mobile app that helps you track your macros and improve your health.",
        imagePath: IMAGE_CONSTANTS.aiSuggestedMeals,
    },
]  