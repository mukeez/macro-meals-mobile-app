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
      <ScrollView
        className="px-5 py-5 "
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <Text className="text-xs text-[#121212] mb-4">
          Last updated: May 19, 2025
        </Text>
        <Text className="text-sm text-gray-500 mb-1">
          This Privacy Policy describes how Macro Meals (“we,” “our,” or “us”)
          collects, uses, and shares your personal information when you use our
          mobile application (“App”).
        </Text>
        {privacyPolicy.map(({ title, paragraph }, idx) => (
          <Section title={title} key={title}>
            {paragraph.map((text, pIdx) => (
              <Text className="text-sm mb-2" key={pIdx}>
                {text}
              </Text>
            ))}
          </Section>
        ))}
      </ScrollView>
    </CustomSafeAreaView>
  );
}
