import React from "react";
import { View, Text } from "react-native";

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

export default function Section({ title, children }: SectionProps) {
  return (
    <View className="mb-2">
      <Text className="text-sm font-semibold mb-2">{title}</Text>
      {children}
    </View>
  );
}
