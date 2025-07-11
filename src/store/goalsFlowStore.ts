import { create } from 'zustand';

type GoalsFlowState = {
    majorStep: number;
    subSteps: { [key: number]: number };
    completed: { [key: number]: boolean[]};
    setMajorStep: (step: number) => void;
    setSubStep: (major: number, sub: number) => void;
    markSubStepComplete: (major: number, sub: number) => void;
    gender: string | null;
    setGender: (gender: string) => void;
    dateOfBirth: string | null;
    setDateOfBirth: (date: string) => void;
    location: string | null;
    setLocation: (location: string) => void;
    unit: 'imperial' | 'metric';
    heightFt: number | null;
    heightIn: number | null;
    heightCm: number | null;
    weightLb: number | null;
    weightKg: number | null;
    setUnit: (unit: 'imperial' | 'metric') => void;
    setHeightFt: (ft: number | null) => void;
    setHeightIn: (inch: number | null) => void;
    setHeightCm: (cm: number | null) => void;
    setWeightLb: (lb: number | null) => void;
    setWeightKg: (kg: number | null) => void;
    dailyActivityLevel: string | null;
    setDailyActivityLevel: (level: string) => void;
    dietryPreference: string | null;
    setDietryPreference: (preference: string) => void;
    resetSteps: () => void;
    fitnessGoal: string | null;
    setFitnessGoal: (goal: string) => void;
    targetWeight: number | null;
    setTargetWeight: (weight: number) => void;
    progressRate: string | null;
    setProgressRate: (rate: string) => void;
    preferences: any | null;
    setPreferences: (prefs: any) => void;
    macroTargets: { carbs: number; fat: number; protein: number; calorie: number } | null;
    setMacroTargets: (macros: { carbs: number; fat: number; protein: number; calorie: number }) => void;
};

export const useGoalsFlowStore = create<GoalsFlowState>((set)=> ({
    gender: null,
    setGender: (gender) => {
        console.log('[GoalsFlow] Gender selected:', gender);
        set({ gender });
    },
    majorStep: 0,
    subSteps: { 0: 0, 1: 0, 2: 0},
    completed: {0: Array(5).fill(false), 1: Array(3).fill(false), 2: [false]},
    setMajorStep: (step)=> {
        console.log('[goalsFlowStore] setMajorStep called with:', step);
        set({ majorStep: step });
    },
    setSubStep: (major, sub)=> {
        console.log('[goalsFlowStore] setSubStep called with:', major, sub);
        set((state)=> ({
            subSteps: { ...state.subSteps, [major]: sub }
        }));
    },
    markSubStepComplete: (major, sub) => {
        console.log('[GoalsFlow] Marking substep complete:', { major, sub });
        set((state)=> {
            const updated = [ ...state.completed[major]];
            updated[sub] = true;
            return{ completed: { ...state.completed, [major]: updated}};
        });
    },
    dateOfBirth: null,
    setDateOfBirth: (date) => {
        console.log('[GoalsFlow] Date of birth selected:', date);
        set({ dateOfBirth: date });
    },
    location: null,
    setLocation: (location) => {
        console.log('[GoalsFlow] Location selected:', location);
        set({ location});
    },
    unit: 'imperial',
    heightFt: null,
    heightIn: null,
    heightCm: null,
    weightLb: null,
    weightKg: null,
    setUnit: (unit) => {
        console.log('[GoalsFlow] Unit system changed:', unit);
        set({ unit });
    },
    setHeightFt: (ft) => {
        console.log('[GoalsFlow] Height (feet) selected:', ft);
        set({ heightFt: ft });
    },
    setHeightIn: (inch) => {
        console.log('[GoalsFlow] Height (inches) selected:', inch);
        set({ heightIn: inch });
    },
    setHeightCm: (cm) => {
        console.log('[GoalsFlow] Height (cm) selected:', cm);
        set({ heightCm: cm });
    },
    setWeightLb: (lb) => {
        console.log('[GoalsFlow] Weight (lb) selected:', lb);
        set({ weightLb: lb });
    },
    setWeightKg: (kg) => {
        console.log('[GoalsFlow] Weight (kg) selected:', kg);
        set({ weightKg: kg });
    },
    dailyActivityLevel: null,
    setDailyActivityLevel: (level) => {
        console.log('[GoalsFlow] Daily activity level selected:', level);
        set({ dailyActivityLevel: level });
    },
    dietryPreference: null,
    setDietryPreference: (preference) => {
        console.log('[GoalsFlow] Dietary preference selected:', preference);
        set({ dietryPreference: preference });
    },
    resetSteps: () => {
        console.log('[GoalsFlow] Resetting all steps and data');
        set({
            majorStep: 0,
            subSteps: { 0: 0, 1: 0, 2: 0 },
            completed: { 0: Array(5).fill(false), 1: Array(3).fill(false), 2: [false] },
            gender: null,
            dateOfBirth: null,
            location: null,
            heightFt: null,
            heightIn: null,
            heightCm: null,
            weightLb: null,
            weightKg: null,
            unit: 'imperial',
            dailyActivityLevel: null,
            dietryPreference: null,
            fitnessGoal: null,
            targetWeight: null,
        });
    },
    fitnessGoal: null,
    setFitnessGoal: (goal) => {
        console.log('[GoalsFlow] Fitness goal selected:', goal);
        set({ fitnessGoal: goal });
    },
    targetWeight: null,
    setTargetWeight: (weight) => {
        console.log('[GoalsFlow] Target weight selected:', weight);
        set({ targetWeight: weight });
    },
    progressRate: null,
    setProgressRate: (rate) => {
        console.log('[GoalsFlow] Progress rate selected:', rate);
        set({ progressRate: rate });
    },
    preferences: null,
    setPreferences: (prefs) => {
        console.log('[GoalsFlow] Preferences set:', prefs);
        set({ preferences: prefs });
    },
    macroTargets: null,
    setMacroTargets: (macros) => {
        console.log('[GoalsFlow] Macro targets set:', macros);
        set({ macroTargets: macros });
    },
}));