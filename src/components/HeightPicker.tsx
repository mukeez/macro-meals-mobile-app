import React from "react";
import { View, Text, Platform, ActivityIndicator } from "react-native";
import { Picker } from "@react-native-picker/picker";

// These arrays can be defined outside the component
const heightsFt = [3, 4, 5, 6, 7, 8, 9];
const heightsIn = Array.from({ length: 12 }, (_, i) => i);
const heightsCm = Array.from({ length: 121 }, (_, i) => 100 + i); // 100cm to 220cm

// Define prop types
type HeightPickerProps = {
  height_unit_preference: "imperial" | "metric";
  heightFt: number | null;
  heightIn: number | null;
  heightCm: number | null;
  updating: { height: boolean };
  handleFieldChange: (field: "heightFt" | "heightIn" | "heightCm", value: number | null) => void;
};

export default function HeightPicker({
  height_unit_preference,
  heightFt,
  heightIn,
  heightCm,
  updating,
  handleFieldChange,
}: HeightPickerProps) {
  // Defensive in case selectedValue is undefined
  const ftValue = heightFt == null ? null : heightFt;
  const inValue = heightIn == null ? null : heightIn;
  const cmValue = heightCm == null ? null : heightCm;

  if (height_unit_preference === "imperial") {
    return (
      <View className="flex-row items-center min-h-[56px] px-4">
        <Text className="flex-1 text-base text-[#222]">Height</Text>
        <View className="flex-row items-center flex-1 justify-end">
          <Picker
            selectedValue={ftValue}
            style={{ width: 80, height: 44 }}
            onValueChange={(ft) => handleFieldChange("heightFt", ft)}
            enabled={!updating.height}
          >
            <Picker.Item label="ft" value={null} />
            {heightsFt.map((ft) => (
              <Picker.Item key={ft} label={`${ft} ft`} value={ft} />
            ))}
          </Picker>
          <Picker
            selectedValue={inValue}
            style={{ width: 80, height: 44, marginLeft: 8 }}
            onValueChange={(inch) => handleFieldChange("heightIn", inch)}
            enabled={!updating.height}
          >
            <Picker.Item label="in" value={null} />
            {heightsIn.map((inch) => (
              <Picker.Item key={inch} label={`${inch} in`} value={inch} />
            ))}
          </Picker>
          {updating.height && (
            <ActivityIndicator
              size="small"
              color="#19a28f"
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
      </View>
    );
  } else {
    return (
      <View className="flex-row items-center min-h-[56px] px-4">
        <Text className="flex-1 text-base text-[#222]">Height</Text>
        <View className="flex-row items-center flex-1 justify-end">
          <Picker
            selectedValue={cmValue}
            style={{ width: 140, height: 44 }}
            onValueChange={(cm) => handleFieldChange("heightCm", cm)}
            enabled={!updating.height}
          >
            <Picker.Item label="cm" value={null} />
            {heightsCm.map((cm) => (
              <Picker.Item key={cm} label={`${cm} cm`} value={cm} />
            ))}
          </Picker>
          {updating.height && (
            <ActivityIndicator
              size="small"
              color="#19a28f"
              style={{ marginLeft: 8 }}
            />
          )}
        </View>
      </View>
    );
  }
}