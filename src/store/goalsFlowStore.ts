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
};

export const useGoalsFlowStore = create<GoalsFlowState>((set)=> ({
    gender: null,
    setGender: (gender) => set({ gender }),
    majorStep: 0,
    subSteps: { 0: 0, 1: 0, 2: 0},
    completed: {0: Array(6).fill(false), 1: Array(3).fill(false), 2: [false]},
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
    markSubStepComplete: (major, sub) => set((state)=> {
        const updated = [ ...state.completed[major]];
        updated[sub] = true;
        return{ completed: { ...state.completed, [major]: updated}};
    }),
    dateOfBirth: null,
    setDateOfBirth: (date) => set({ dateOfBirth: date }),
    location: null,
    setLocation: (location) => set({ location}),
    unit: 'imperial',
    heightFt: null,
    heightIn: null,
    heightCm: null,
    weightLb: null,
    weightKg: null,
    setUnit: (unit) => set({ unit }),
    setHeightFt: (ft) => set({ heightFt: ft }),
    setHeightIn: (inch) => set({ heightIn: inch }),
    setHeightCm: (cm) => set({ heightCm: cm }),
    setWeightLb: (lb) => set({ weightLb: lb }),
    setWeightKg: (kg) => set({ weightKg: kg }),
    dailyActivityLevel: null,
    setDailyActivityLevel: (level) => set({ dailyActivityLevel: level }),
    dietryPreference: null,
    setDietryPreference: (preference) => set({ dietryPreference: preference }),
    resetSteps: () => set({
        majorStep: 0,
        subSteps: { 0: 0, 1: 0, 2: 0 },
        completed: { 0: Array(6).fill(false), 1: Array(3).fill(false), 2: [false] },
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
    }),
    fitnessGoal: null,
    setFitnessGoal: (goal) => set({ fitnessGoal: goal }),
    targetWeight: null,
    setTargetWeight: (weight) => set({ targetWeight: weight }),
    progressRate: null,
    setProgressRate: (rate) => set({ progressRate: rate }),
}));