export type MacroResponse = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
};

const API_BASE_URL = 'https://api.macromealsapp.com/api/v1';


export async function fetchMacros(): Promise<MacroResponse> {
  const res = await fetch(`${API_BASE_URL}/macros/adjust-macros`);
  if (!res.ok) throw new Error("Failed to fetch macros");
  return res.json();
}

export async function updateMacros(updated: MacroResponse): Promise<void> {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });
  if (!res.ok) throw new Error("Failed to update macros");
}