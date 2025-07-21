import React from "react";
import { ScrollView, Text, View } from "react-native";
import Header from "../components/Header";
import Section from "../components/Section";
import { termsContent } from "../constants/terms";
import CustomSafeAreaView from "../components/CustomSafeAreaView";

export default function TermsOfServiceScreen() {
  return (
    <CustomSafeAreaView className="flex-1">
      <Header title="Terms Of Service" />
      <ScrollView
        className="py-5 px-5"
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        <Text className="text-xs text-gray-500 mb-4">
          Last updated: May 19 2025
        </Text>
        {termsContent.map(({ title, paragraphs }, index) => (
          <Section title={title} key={index}>
            {paragraphs.map((text, idx) => (
              <Text className="text-sm mb-2 opacity-60" key={idx}>
                {text}
              </Text>
            ))}
          </Section>
        ))}
      </ScrollView>
    </CustomSafeAreaView>
  );
}
