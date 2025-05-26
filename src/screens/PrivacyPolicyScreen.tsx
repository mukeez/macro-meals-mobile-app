import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.root}>
      <View style={styles.topHeaderBackground}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          {/* header text */}
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.smallText}>Last updated: May 19, 2025</Text>
        <Text style={styles.bodyText}>
          This Privacy Policy describes how Macro Meals (“we,” “our,” or “us”)
          collects, uses, and shares your personal information when you use our
          mobile application (“App”).
        </Text>

        <Text style={styles.sectionTitle}>1. INFORMATION WE COLLECT</Text>
        <Text style={styles.bodyText}>1.1 Information You Provide:</Text>
        <Text style={styles.bodyText}>
          • Account information (name, email address, password)
        </Text>
        <Text style={styles.bodyText}>
          • Profile information (age, sex, height, weight, fitness goals)
        </Text>
        <Text style={styles.bodyText}>
          • Food and meal information that you log
        </Text>
        <Text style={styles.bodyText}>
          • Dietary preferences and restrictions
        </Text>
        <Text style={styles.bodyText}>
          • Payment information (processed by third-party payment processors)
        </Text>

        <Text style={styles.bodyText}>
          1.2 Information Automatically Collected:
        </Text>
        <Text style={styles.bodyText}>
          • Device information (device type, operating system)
        </Text>
        <Text style={styles.bodyText}>• App usage data</Text>
        <Text style={styles.bodyText}>
          • Location information (with your permission)
        </Text>
        <Text style={styles.bodyText}>• Log data</Text>

        <Text style={styles.bodyText}>1.3 Information from Third Parties:</Text>
        <Text style={styles.bodyText}>
          • Information from social media if you connect your accounts
        </Text>
        <Text style={styles.bodyText}>
          • Restaurant and food database information
        </Text>

        <Text style={styles.sectionTitle}>2. HOW WE USE YOUR INFORMATION</Text>
        <Text style={styles.bodyText}>We use your information to:</Text>
        <Text style={styles.bodyText}>
          • Provide and improve the App’s functionality
        </Text>
        <Text style={styles.bodyText}>
          • Calculate your personalized macronutrient recommendations
        </Text>
        <Text style={styles.bodyText}>
          • Connect you with relevant meal options
        </Text>
        <Text style={styles.bodyText}>
          • Process payments and manage your account
        </Text>
        <Text style={styles.bodyText}>
          • Send you notifications and updates
        </Text>
        <Text style={styles.bodyText}>
          • Analyze usage patterns to improve the App
        </Text>
        <Text style={styles.bodyText}>
          • Respond to your requests and support needs
        </Text>

        <Text style={styles.sectionTitle}>3. SHARING YOUR INFORMATION</Text>
        <Text style={styles.bodyText}>We may share your information with:</Text>
        <Text style={styles.bodyText}>
          • Service providers that help us operate the App
        </Text>
        <Text style={styles.bodyText}>
          • Restaurant partners to fulfill your orders
        </Text>
        <Text style={styles.bodyText}>
          • Analytics providers to improve our services
        </Text>
        <Text style={styles.bodyText}>
          • Legal authorities when required by law
        </Text>
        <Text style={styles.bodyText}>
          We do not sell your personal information to third parties.
        </Text>

        <Text style={styles.sectionTitle}>4. DATA STORAGE AND SECURITY</Text>
        <Text style={styles.bodyText}>
          4.1 We implement appropriate technical and organizational measures to
          protect your personal information.
        </Text>
        <Text style={styles.bodyText}>
          4.2 While we strive to protect your information, no method of
          transmission or storage is 100% secure.
        </Text>
        <Text style={styles.bodyText}>
          4.3 Your information may be stored and processed in the United States
          or any other country where we or our service providers maintain
          facilities.
        </Text>

        <Text style={styles.sectionTitle}>5. YOUR RIGHTS AND CHOICES</Text>
        <Text style={styles.bodyText}>
          5.1 You can access, update, or delete your account information at any
          time.
        </Text>
        <Text style={styles.bodyText}>
          5.2 You can opt out of receiving promotional communications.
        </Text>
        <Text style={styles.bodyText}>
          5.3 You can control location permissions through your device settings.
        </Text>
        <Text style={styles.bodyText}>
          5.4 You may have additional rights depending on your location (e.g.,
          GDPR, CCPA).
        </Text>

        <Text style={styles.sectionTitle}>6. CHILDREN’S PRIVACY</Text>
        <Text style={styles.bodyText}>
          The App is not intended for children under 13, and we do not knowingly
          collect information from children under 13.
        </Text>

        <Text style={styles.sectionTitle}>7. CHANGES TO THIS POLICY</Text>
        <Text style={styles.bodyText}>
          7.1 We may update this Privacy Policy from time to time.
        </Text>
        <Text style={styles.bodyText}>
          7.2 We will notify you of any significant changes through the App or
          via email.
        </Text>

        <Text style={styles.sectionTitle}>
          8. THIRD-PARTY LINKS AND SERVICES
        </Text>
        <Text style={styles.bodyText}>
          The App may contain links to third-party websites or services. We are
          not responsible for the privacy practices of such third parties.
        </Text>

        <Text style={styles.sectionTitle}>9. CONTACT US</Text>
        <Text style={styles.bodyText}>
          If you have questions about this Privacy Policy, please contact us at
          support@macromeals.com.
        </Text>
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
  container: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  topHeaderBackground: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    marginRight: 30, // to offset the back button and center the title
  },
  smallText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 6,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
});
