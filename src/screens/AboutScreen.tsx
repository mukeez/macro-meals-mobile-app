import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  TouchableOpacity,
} from "react-native";

export default function AboutScreen() {
  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      {/* Top Header */}
      <View style={styles.topHeaderBackground}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>About</Text>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.sectionTitle}>Our Mission</Text>
        <Text style={styles.bodyText}>
          At Macro Meals, we believe that maintaining a healthy diet shouldn’t
          have to compromise convenience or enjoyment. Our mission is to empower
          individuals to make nutritionally informed food choices that align
          with their personal health and fitness goals, regardless of their
          lifestyle or schedule.
        </Text>
        <Text style={styles.sectionTitle}>Our Story</Text>
        <Text style={styles.bodyText}>
          Macro Meals was born from a simple frustration: the difficulty of
          maintaining specific nutritional targets while eating out or ordering
          in. Our founder, a fitness enthusiast and busy professional, struggled
          to find restaurant meals that would fit within their macronutrient
          goals without spending hours researching nutritional information.
        </Text>

        <Text style={styles.bodyText}>
          After countless conversations with nutritionists, fitness coaches, and
          everyday people trying to maintain healthy eating habits, we realized
          there was a gap in the market. Traditional calorie-tracking apps were
          focused on home cooking and manual logging, while restaurant finders
          weren’t considering nutritional needs.
        </Text>

        <Text style={styles.bodyText}>
          In 2024, we assembled a team of nutrition experts, software
          developers, and user experience designers to create a solution that
          bridges this gap. The result is Macro Meals – an innovative platform
          that combines precise nutritional tracking with real-world food
          options.
        </Text>

        <Text style={styles.sectionTitle}>What Sets Us Apart</Text>
        <View style={styles.bulletSection}>
          <Text style={styles.bodyText}>
            • <Text style={styles.boldText}>Real-World Focus:</Text> Unlike most
            nutrition apps that assume you’re cooking every meal at home, we
            connect you with actual restaurant meals and delivery options that
            fit your nutritional needs.
          </Text>
          <Text style={styles.bodyText}>
            • <Text style={styles.boldText}>Personalized Recommendations:</Text>{" "}
            Our AI-powered system learns your preferences over time to suggest
            meals you’ll actually enjoy.
          </Text>
          <Text style={styles.bodyText}>
            • <Text style={styles.boldText}>Beyond Calorie Counting:</Text> We
            focus on the quality of your nutrition by tracking macronutrients
            (protein, carbs, and fats) rather than just calories.
          </Text>
          <Text style={styles.bodyText}>
            • <Text style={styles.boldText}>Seamless Experience:</Text> Our
            intuitive interface makes nutrition tracking simple enough for
            anyone to maintain, regardless of their technical skills or
            nutrition knowledge.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Our Team</Text>
        <Text style={styles.bodyText}>
          Macro Meals is developed by a passionate team of nutrition
          enthusiasts, tech innovators, and fitness advocates who believe that
          technology should make healthy living more accessible, not more
          complicated.
        </Text>

        <Text style={styles.sectionTitle}>Contact Us</Text>
        <Text style={styles.bodyText}>
          We love hearing from our users! For support, feedback, or partnership
          inquiries:
        </Text>

        <TouchableOpacity
          onPress={() => handleEmailPress("support@macromeals.com")}
        >
          <Text style={styles.bodyText}>
            Email: <Text style={styles.emailLink}>support@macromeals.com</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleEmailPress("support@macromeals.com")}
        >
          <Text style={styles.bodyText}>
            Support:{" "}
            <Text style={styles.emailLink}>support@macromeals.com</Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleEmailPress("support@macromeals.com")}
        >
          <Text style={styles.bodyText}>
            Business Inquiries:{" "}
            <Text style={styles.emailLink}>support@macromeals.com</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: "#fff",
  },
  topHeaderBackground: {
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
  },
  bulletSection: {
    paddingLeft: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    marginRight: 30, // to balance the back icon spacing, need to eventually change to safe area view
  },
  container: {
    padding: 20,
    paddingTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
  boldText: {
    fontWeight: "bold",
  },
  emailLink: {
    fontSize: 14,
    color: "#009688",
    textDecorationLine: "underline",
    marginBottom: 8,
  },
});
