import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
} from "react-native";
import Section from "../components/Section";
import { about } from "../constants/about";
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import Header from "../components/Header";

export default function AboutScreen() {
  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  return (
    <CustomSafeAreaView className="flex-1 ">
      <Header title="About" />
      <ScrollView className="px-5 py-5">
        {about.map(({ section, body }, idx) => (
          <Section title={section} key={section}>
            {body.map((paragraph, pIdx) => {
              // Render contact links for the Contact Us section
              if (
                section === "Contact Us" &&
                paragraph.includes("@macromeals.com")
              ) {
                const parts = paragraph.split(":");
                if (parts.length === 2) {
                  const label = parts[0].trim();
                  const email = parts[1].trim();
                  return (
                    <TouchableOpacity
                      onPress={() => handleEmailPress(email)}
                      key={pIdx}
                    >
                      <Text className="text-sm mb-2">
                        {label}:{" "}
                        <Text className="text-sm text-[#009688] underline">
                          {email}
                        </Text>
                      </Text>
                    </TouchableOpacity>
                  );
                }
              }
              return (
                <Text className="text-sm mb-2" key={pIdx}>
                  {paragraph}
                </Text>
              );
            })}
          </Section>
        ))}
      </ScrollView>
    </CustomSafeAreaView>
  );
}
