import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
} from "react-native";
import Header from "../components/Header";
import { CircularProgress } from "../components/CircularProgress";
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import {
  fetchMacros,
  MacroResponse,
  updateMacros,
} from "../services/macroService";

const AdjustTargetsScreen: React.FC = () => {
  const [dialogVisible, setDialogVisible] = useState(false);
  const [selectedMacro, setSelectedMacro] = useState<{
    label: string;
    value: number;
  } | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [userCalories, setUserCalories] = useState(0);
  const [caloriesGoal, setCaloriesGoal] = useState(0);
  const [macros, setMacros] = useState([
    { label: "Protein", value: 0 },
    { label: "Fat", value: 0 },
    { label: "Carbs", value: 0 },
  ]);


  useEffect(() => {
    setLoading(true);
    fetchMacros()
      .then((data) => {
        setUserCalories(data.calories);
        setCaloriesGoal(data.calories);
        setMacros([
          { label: "Protein", value: data.protein },
          { label: "Fat", value: data.fat },
          { label: "Carbs", value: data.carbs },
        ]);
      })
      .finally(() => setLoading(false));
  }, []);


  const saveChanges = async () => {
    if (!selectedMacro) return;
    setLoading(true);

    const updated: MacroResponse = {
      calories: caloriesGoal,
      protein: macros.find((m) => m.label === "Protein")?.value ?? 0,
      fat: macros.find((m) => m.label === "Fat")?.value ?? 0,
      carbs: macros.find((m) => m.label === "Carbs")?.value ?? 0,
    };

    if (selectedMacro) {
      updated[selectedMacro.label.toLowerCase() as keyof MacroResponse] =
        parseInt(inputValue, 10);
    }

    try {
      await updateMacros(updated);
      setMacros((macros) =>
        macros.map((m) =>
          m.label === selectedMacro.label
            ? { ...m, value: parseInt(inputValue, 10) }
            : m
        )
      );
      closeDialog();
    } finally {
      setLoading(false);
    }
  };

  const handleMacroPress = (macro: { label: string; value: number }) => {
    setSelectedMacro(macro);
    setInputValue(macro.value.toString());
    setDialogVisible(true);
  };

  const closeDialog = () => {
    setDialogVisible(false);
    setSelectedMacro(null);
    setInputValue("");
  };

  return (
    <CustomSafeAreaView>
      <View className="flex-1 bg-[#f6f6f6]">
        <Header title="Adjust Targets" />

        <View className="bg-[#01675B] px-6 py-10 items-center">
          <Text className="text-white text-base font-semibold text-center mb-4">
            Your current goal
          </Text>
          <CircularProgress
            size={120}
            strokeWidth={8}
            consumed={userCalories}
            total={caloriesGoal}
            color="#fff"
            backgroundColor="rgba(255,255,255,0.2)"
            label="calories/day"
          />
        </View>

        <ScrollView
          className="flex-1 mt-3"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-black text-base font-medium my-3 py-2 px-4">
            Tap on any of the values to set your preferred macro targets.
          </Text>
          {macros.map((macro) => (
            <TouchableOpacity
              key={macro.label}
              onPress={() => handleMacroPress(macro)}
              activeOpacity={0.7}
              className="w-full"
            >
              <View className="flex-row items-center justify-between py-4 bg-white border-b border-b-[#f0f0f0]">
                <Text className="text-black text-base font-semibold pl-6">
                  {macro.label}
                </Text>
                <Text className="text-[#009688] text-lg font-bold pr-6">
                  {macro.value}g
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Modal
          visible={dialogVisible}
          transparent
          animationType="fade"
          onRequestClose={closeDialog}
        >
          <View className="flex-1 justify-center items-center bg-black/40">
            <View className="bg-white rounded-2xl px-6 pt-6 pb-4 w-11/12 max-w-md shadow-lg relative">
              <Pressable
                onPress={closeDialog}
                className="absolute top-4 right-4 z-10"
                accessibilityLabel="Close dialog"
              >
                <Text className="text-2xl text-gray-400">✕</Text>
              </Pressable>
              <Text className="text-xl mb-6 text-center">
                {selectedMacro?.label}/Day
              </Text>
              <TextInput
                className="border-b border-gray-300 rounded-lg px-4 py-2 mb-6 text-lg text-left"
                keyboardType="numeric"
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Enter value"
                autoFocus
              />
              <View className="my-4">
                <TouchableOpacity
                  className={`bg-[#009688] rounded-full py-3 mb-3 self-center w-1/2 ${
                    inputValue === (selectedMacro?.value.toString() ?? "")
                      ? "opacity-50"
                      : "opacity-100"
                  }`}
                  onPress={saveChanges}
                  disabled={
                    inputValue === (selectedMacro?.value.toString() ?? "")
                  }
                >
                  <Text className="text-white text-center text-base font-semibold">
                    Save changes
                  </Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity className="py-2" onPress={closeDialog}>
                <Text className="text-center text-[#333333] text-base font-semibold opacity-80">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </CustomSafeAreaView>
  );
};

export default AdjustTargetsScreen;
