import { getMealByPeriod } from "src/services/mealService";
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

type ProgressStateByPeriod = {
  data: MacrosData | null;
  loading: boolean;
  selectedPeriod: string;
  fetchDataByPeriod: (period: string) => Promise<void>;
  setSelectedPeriod: (period: string) => void;
};

// Period mapping for API
const PERIOD_MAP = {
  "1w": "1W",    // 1 Week
  "1m": "1M",    // 1 Month
  "3m": "3M",    // 3 Months
  "6m": "6M",    // 6 Months
  "1y": "1Y",    // 1 Year
  "all": "All"   // All time
} as const;

export const useProgressStoreByPeriod = create<ProgressStateByPeriod>((set, get) => ({
  data: null,
  loading: false,
  selectedPeriod: "1w",
  setSelectedPeriod: (period) => set({ selectedPeriod: period }),
  fetchDataByPeriod: async (period) => {
    set({ loading: true });
    try {
      // Map the period to the API format
      const apiPeriod = PERIOD_MAP[period as keyof typeof PERIOD_MAP] || period;
      console.log(`Fetching data for period: ${period} -> ${apiPeriod}`);
      
      const data = await getMealByPeriod(apiPeriod);
      set({ data, loading: false });
    } catch (e) {
      console.error('Error fetching data by period:', e);
      set({ data: null, loading: false });
    }
  },
})); 