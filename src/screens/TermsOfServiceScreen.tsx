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

export default function TermsOfServiceScreen() {
  const navigation = useNavigation();
  return (
    <View style={styles.root}>
      {/* Top Header */}
      <View style={styles.topHeaderBackground}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Terms Of Service</Text>
        </View>
      </View>
      <ScrollView style={styles.container}>
        <Text style={styles.smallText}>Last updated: May 19 2025</Text>

        <Section title="1. ACCEPTANCE OF TERMS">
          <Text style={styles.paragraph}>
            By downloading, installing, or using the Macro Meals application
            (“App”), you agree to be bound by these Terms and Conditions
            (“Terms”). If you do not agree to these Terms, please do not use the
            App.
          </Text>
        </Section>

        <Section title="2. DESCRIPTION OF SERVICE">
          <Text style={styles.paragraph}>
            Macro Meals is a mobile application designed to help users
            calculate, track, and meet their daily macronutrient goals by
            connecting them with real-world meals from nearby restaurants or
            food delivery options that align with their dietary needs.
          </Text>
        </Section>

        <Section title="3. ACCOUNT REGISTRATION">
          <Text style={styles.paragraph}>
            3.1 To use certain features of the App, you must register for an
            account.
          </Text>
          <Text style={styles.paragraph}>
            3.2 You are responsible for maintaining the confidentiality of your
            account information.
          </Text>
          <Text style={styles.paragraph}>
            3.3 You are responsible for all activities that occur under your
            account.
          </Text>
          <Text style={styles.paragraph}>
            3.4 You must provide accurate, current, and complete information
            during registration.
          </Text>
        </Section>

        <Section title="4. USER CONTENT">
          <Text style={styles.paragraph}>
            4.1 You retain all rights to any content you submit, post, or
            display on or through the App.
          </Text>
          <Text style={styles.paragraph}>
            4.2 By submitting content to the App, you grant Macro Meals a
            worldwide, non-exclusive, royalty-free license to use, reproduce,
            modify, and display such content.
          </Text>
          <Text style={styles.paragraph}>
            4.3 You agree not to post content that is illegal, offensive, or
            violates any third-party rights.
          </Text>
        </Section>

        <Section title="5. SUBSCRIPTION AND PAYMENT">
          <Text style={styles.paragraph}>
            5.1 Certain features of the App may require a subscription.
          </Text>
          <Text style={styles.paragraph}>
            5.2 All payments are processed through approved third-party payment
            processors.
          </Text>
          <Text style={styles.paragraph}>
            5.3 Subscription fees are billed in advance on a recurring basis.
          </Text>
          <Text style={styles.paragraph}>
            5.4 You can cancel your subscription at any time through your
            account settings or by contacting customer support.
          </Text>
        </Section>

        <Section title="6. TRIAL PERIOD">
          <Text style={styles.paragraph}>
            6.1 Macro Meals may offer a trial period for new users.
          </Text>
          <Text style={styles.paragraph}>
            6.2 At the end of the trial period, your account will automatically
            be charged for a subscription unless you cancel before the trial
            ends.
          </Text>
        </Section>

        <Section title="7. DISCLAIMER OF WARRANTIES">
          <Text style={styles.paragraph}>
            7.1 The App is provided “as is” without warranties of any kind.
          </Text>
          <Text style={styles.paragraph}>
            7.2 Macro Meals does not guarantee that the App will be error-free
            or uninterrupted.
          </Text>
          <Text style={styles.paragraph}>
            7.3 Macro Meals does not guarantee the accuracy of nutritional
            information or restaurant data.
          </Text>
        </Section>

        <Section title="8. LIMITATION OF LIABILITY">
          <Text style={styles.paragraph}>
            8.1 Macro Meals shall not be liable for any indirect, incidental,
            special, consequential, or punitive damages.
          </Text>
          <Text style={styles.paragraph}>
            8.2 The total liability of Macro Meals shall not exceed the amount
            paid by you for using the App in the six months preceding the claim.
          </Text>
        </Section>

        <Section title="9. HEALTH DISCLAIMER">
          <Text style={styles.paragraph}>
            9.1 The App is not intended to provide medical advice.
          </Text>
          <Text style={styles.paragraph}>
            9.2 Consult with a healthcare professional before making significant
            changes to your diet or exercise routine.
          </Text>
          <Text style={styles.paragraph}>
            9.3 The App should not be used as a replacement for professional
            medical advice, diagnosis or treatment.
          </Text>
        </Section>

        <Section title="10. THIRD-PARTY SERVICES">
          <Text style={styles.paragraph}>
            10.1 The App may integrate with third-party services.
          </Text>
          <Text style={styles.paragraph}>
            10.2 Your use of such services is subject to their respective terms
            and conditions.
          </Text>
          <Text style={styles.paragraph}>
            10.3 Macro Meals is not responsible for third-party services.
          </Text>
        </Section>

        <Section title="11. TERMINATION">
          <Text style={styles.paragraph}>
            11.1 Macro Meals reserves the right to terminate or suspend your
            account at any time without notice.
          </Text>
          <Text style={styles.paragraph}>
            11.2 You may terminate your account at any time by contacting
            customer support.
          </Text>
        </Section>

        <Section title="12. MODIFICATIONS TO TERMS">
          <Text style={styles.paragraph}>
            12.1 Macro Meals reserves the right to modify these Terms at any
            time.
          </Text>
          <Text style={styles.paragraph}>
            12.2 Continued use of the App after any modifications constitutes
            acceptance of the modified Terms.
          </Text>
        </Section>

        <Section title="13. GOVERNING LAW">
          <Text style={styles.paragraph}>
            These Terms shall be governed by and construed in accordance with
            the laws of [Your Jurisdiction], without regard to its conflict of
            law provisions.
          </Text>
        </Section>

        <Section title="14. CONTACT INFORMATION">
          <Text style={styles.paragraph}>
            For questions about these Terms, please contact us at
            support@macromeals.com.
          </Text>
        </Section>
      </ScrollView>
    </View>
  );
}

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

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
    marginRight: 30, // to balance the back icon spacing
  },
  container: {
    backgroundColor: "#fff",
    padding: 20,
  },
  smallText: {
    fontSize: 12,
    color: "#555",
    marginBottom: 10,
  },
  section: {
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 6,
  },
});
