import { getMealProgress, getMealByPeriod } from "src/services/mealService";
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
  fetchDataByPeriod: (period: string) => Promise<void>;
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

export const useProgressStore = create<ProgressState>((set, get) => ({
  data: null,
  loading: false,
  selectedRange: "1w",
  setSelectedRange: (range) => set({ selectedRange: range }),
  fetchData: async (range) => {
    set({ loading: true });
    try {
      // Always use start_date and end_date, calculate based on range
      let endDate = new Date();
      let startDate = getStartDateByRange(range);
      
      // Special handling for 1w to ensure it's exactly 1 week
      if (range === "1w") {
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 6);
      }
      
      const data = await getMealProgress(format(startDate), format(endDate));
      set({ data, loading: false });
    } catch (e) {
      set({ data: null, loading: false });
    }
  },
  fetchDataByPeriod: async (period) => {
    set({ loading: true });
    try {
      // Convert range to period format
      const periodMap: { [key: string]: string } = {
        "1w": "1W",
        "1m": "1M", 
        "3m": "3M",
        "6m": "6M",
        "1y": "1Y",
        "all": "All"
      };
      
      const mappedPeriod = periodMap[period] || period;
      const data = await getMealByPeriod(mappedPeriod);
      set({ data, loading: false });
    } catch (e) {
      set({ data: null, loading: false });
    }
  },
}));