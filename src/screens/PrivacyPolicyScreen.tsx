import React from "react";
import { View, Text, ScrollView } from "react-native";
import Section from "../components/Section";
import { privacyPolicy } from "../constants/privacyPolicy";
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import Header from "../components/Header";

export default function PrivacyPolicyScreen() {
  return (
    <CustomSafeAreaView className="flex-1 ">
      <Header title="Privacy Policy" />
      <ScrollView className="px-5 py-5">
        <Text className="text-xs text-gray-500 mb-4">
          Last updated: May 19, 2025
        </Text>
        {privacyPolicy.map(({ title, paragraph }, idx) => (
          <Section title={title} key={title}>
            {paragraph.map((text, pIdx) => (
              <Text className="text-sm leading-6 mb-2" key={pIdx}>
                {text}
              </Text>
            ))}
          </Section>
        ))}
      </ScrollView>
    </CustomSafeAreaView>
  );
}
