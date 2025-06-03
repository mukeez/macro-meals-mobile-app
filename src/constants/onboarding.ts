import { IMAGE_CONSTANTS } from "./imageConstants";

export interface OnboardingItem {
    title: string;
    description: string;
    imagePath: string;
    mignifiedImagePath?: string;
}

export const onboardingItems: OnboardingItem[] = [
    {
        title: "Macro calculator",
        description: "Find your ideal daily macros fast. Get personalized targets for protein, carbs, and fat based on your age, weight, activity level, and goals no guesswork needed.",
        imagePath: IMAGE_CONSTANTS.macroCalculator,
    },
    {
        title: "Macro dashboard",
        description: "The Macro Dashboard shows your calories, protein, carbs, and fat in a clear visual breakdown so you know exactly what you’ve consumed, what’s left, and how close you are to your goals.",
        imagePath: IMAGE_CONSTANTS.macroDashboard,

    },
    {
        title: "Nearby meal finder",
        description: "Find meals that fit your goals wherever you are. The Location-Based Meal Finder surfaces nearby restaurant options that match your macros, so you can eat out or order in without compromising your progress.",
        imagePath: IMAGE_CONSTANTS.nearbyMealFinder,
        mignifiedImagePath: IMAGE_CONSTANTS.grilledSalmon,
    },
    {
        title: "AI meal suggestions",
        description: "Hit your goals with smart meal suggestions. Our AI analyzes your remaining macros and recommends foods that help you meet your daily targets making it easier to stay on track with every bite.",
        imagePath: IMAGE_CONSTANTS.aiSuggestedMeals,
        mignifiedImagePath: IMAGE_CONSTANTS.steakAndMashedPotatoes,
    },
]  