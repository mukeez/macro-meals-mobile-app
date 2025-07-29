import { useEffect, useRef } from "react";
import { useGoalsFlowStore } from "src/store/goalsFlowStore";
import { userService } from "src/services/userService"; // adjust path as needed

/**
 * Generic hook to sync weight or height (and their unit preference) to backend.
 * 
 * @param type Either "weight" or "height"
 * @param setUpdating Function to toggle loader (updating state)
 */
export function useSyncBodyMetricToBackend(
  type: "weight" | "height",
  setUpdating: (v: boolean) => void
) {
  const store = useGoalsFlowStore();

  // Pick correct values from the store based on type
  const unitPreference =
    type === "weight" ? store.weight_unit_preference : store.height_unit_preference;
  const metricValue =
    type === "weight" ? store.weightKg : store.heightCm;
  const imperialValue =
    type === "weight"
      ? store.weightLb
      : store.heightFt !== null && store.heightIn !== null
        ? store.heightFt + store.heightIn / 12
        : null;

  const prev = useRef<{ unit?: string; value?: number | null }>({});

  useEffect(() => {
    const value = unitPreference === "metric" ? metricValue : imperialValue;
    // Only PATCH if value or unit changed
    if (prev.current.unit === unitPreference && prev.current.value === value) return;
    prev.current = { unit: unitPreference, value };

    // Don't PATCH empty/invalid values
    if (value === null || value === undefined || Number.isNaN(value) || value <= 0) return;

    setUpdating(true);
    userService
      .updateProfile({
        [type]: value,
        [`${type}_unit_preference`]: unitPreference,
      })
      .catch((e) => {
        // Optionally show a toast or log the error
        console.error(`Failed to update ${type}`, e.response?.data || e);
      })
      .finally(() => setUpdating(false));
  }, [metricValue, imperialValue, unitPreference]);
}