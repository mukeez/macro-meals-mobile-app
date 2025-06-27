import { getMealProgress } from "src/services/mealService";
import { create } from "zustand";

type MacroDay = {
  date: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
};

type MacrosData = {
  daily_macros: MacroDay[];
  average_macros: { calories: number; protein: number; carbs: number; fat: number };
  target_macros: { calories: number; protein: number; carbs: number; fat: number };
  start_date: string;
  end_date: string;
};

type ProgressState = {
  data: MacrosData | null;
  loading: boolean;
  selectedRange: string;
  fetchData: (range: string) => Promise<void>;
  setSelectedRange: (range: string) => void;
};

function getStartDateByRange(range: string): Date {
  const today = new Date();
  const result = new Date(today);
  switch (range) {
    case "1w":
      result.setDate(today.getDate() - 6);
      break;
    case "1m":
      result.setMonth(today.getMonth() - 1);
      break;
    case "3m":
      result.setMonth(today.getMonth() - 3);
      break;
    case "6m":
      result.setMonth(today.getMonth() - 6);
      break;
    case "1y":
      result.setFullYear(today.getFullYear() - 1);
      break;
    default:
      result.setFullYear(1970);
  }
  return result;
}

const format = (date: Date) => date.toISOString().split("T")[0];

export const useProgressStore = create<ProgressState>((set) => ({
  data: null,
  loading: false,
  selectedRange: "1w",
  setSelectedRange: (range) => set({ selectedRange: range }),
  fetchData: async (range) => {
    set({ loading: true });
    try {
      const endDate = new Date();
      const startDate = getStartDateByRange(range);
      const data = await getMealProgress(format(startDate), format(endDate));
      set({ data, loading: false });
    } catch (e) {
      set({ data: null, loading: false });
    }
  },
}));