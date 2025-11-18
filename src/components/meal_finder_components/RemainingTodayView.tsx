import React from 'react';
import { Text, View } from 'react-native';
import { CircularProgress } from '../CircularProgress';

interface MacroData {
  label: 'Protein' | 'Carbs' | 'Fat';
  value: number;
  color: string;
}

interface RemainingTodayViewProps {
  macroData: MacroData[];
  macrosPreferences: {
    protein_target: number;
    carbs_target: number;
    fat_target: number;
  };
  verticalPadding?: number;
}

const macroTypeToPreferenceKey = {
  Protein: 'protein_target',
  Carbs: 'carbs_target',
  Fat: 'fat_target',
} as const;

export const RemainingTodayView: React.FC<RemainingTodayViewProps> = ({
  macroData,
  macrosPreferences,
  verticalPadding = 0,
}) => {
  return (
    <View className="flex-col rounded-lg items-start bg-white mt-3 px-5 pt-3 pb-3 mb-4">
      <View className="flex-row w-full justify-between items-center">
        {macroData.map(macro => {
          const target =
            macrosPreferences[macroTypeToPreferenceKey[macro.label]] || 0;
          const consumed = macro.value;
          const remaining = Math.max(0, target - consumed);

          return (
            <View key={macro.label} className="flex-row items-center">
              <Text
                className={`text-sm py-[${verticalPadding}px] text-black mr-3 font-medium`}
              >
                {macro.label}
              </Text>
              <CircularProgress
                size={40}
                strokeWidth={4}
                textSize={10}
                consumed={`${remaining}g`}
                letterSpacing={'tracking-tighter'}
                total={target}
                color={macro.color}
                backgroundColor="#d0e8d1"
                label={macro.label}
                showLabel={false}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};
