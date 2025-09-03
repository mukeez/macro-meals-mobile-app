import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Image,
  Linking,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import CustomSafeAreaView from "../components/CustomSafeAreaView";
import { IMAGE_CONSTANTS } from "../constants/imageConstants";
import { useMixpanel } from "@macro-meals/mixpanel/src";

const { height } = Dimensions.get("window");

type ContactSupportDrawerProps = {
  onClose: () => void;
};
const mixpanel = useMixpanel();
const subject = encodeURIComponent("Support Request");
const body = encodeURIComponent("Hello Macro Meals,\n\nI need help with ...");

const mailtoUrl = `mailto:support@macromealsapp.com?subject=${subject}&body=${body}`;
const handleSupportEmail = () => {
  mixpanel?.track({
    name: "contact_support_email_opened",
    properties: {},
  });
  Linking.openURL(mailtoUrl);
};

export default function ContactSupportDrawer({
  onClose,
}: ContactSupportDrawerProps) {
  return (
    <CustomSafeAreaView>
      <View
        className=" w-full rounded-t-3xl overflow-hidden shadow-2xl"
        style={{ height: height * 0.85 }}
      >
        <View className="bg-[#009688] py-8  px-6 rounded-t-3xl">
          <View className="flex-row items-center justify-between">
            <Image
              source={IMAGE_CONSTANTS.splashIcon}
              className="w-14 h-14"
              resizeMode="contain"
            />
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
          </View>
          <View className="mt-8">
            <Text className="text-4xl font-bold text-[#FFFFFF] opacity-50">
              Hi there 👋
            </Text>
            <Text className="text-white text-4xl mb-12 font-bold">
              How can we help?
            </Text>
          </View>

          <View
            className="absolute left-0 right-0 mx-6 rounded-xl bg-white p-6"
            style={{
              top: height * 0.27,
              zIndex: 10,
              shadowColor: "#000",
              shadowOpacity: 0.17,
              shadowOffset: { width: 0, height: 10 },
              shadowRadius: 16,
              elevation: 16,
            }}
          >
            <Text className="text-base font-bold text-gray-900 my-2">
              Start a conversation
            </Text>

            <View className="items-center my-2">
              <Text className="text-[#737376] text-sm text-center">
                Our usual reply time
              </Text>
              <View className="flex-row items-center justify-center mt-0.5">
                <MaterialCommunityIcons
                  name="clock-time-four-outline"
                  size={15}
                  color="#009688"
                />
                <Text className="text-gray-700 text-sm font-bold ml-1">
                  A few minutes
                </Text>
              </View>
            </View>
            <TouchableOpacity
              className="my-5 flex-row items-center justify-start bg-[#009688] w-3/5 rounded-3xl px-4 py-3"
              activeOpacity={0.85}
              onPress={handleSupportEmail}
            >
              <Ionicons name="paper-plane" size={17} color="white" />
              <Text className="text-white font-semibold text-sm ml-2">
                Send us a message
              </Text>
            </TouchableOpacity>
            {/* Add border under button */}
            <View
              style={{
                borderBottomColor: "#EFEFEF",
                borderBottomWidth: 1,
                marginTop: 8,
                marginBottom: 16, // white space under border
              }}
            />
          </View>
        </View>
      </View>
    </CustomSafeAreaView>
  );
}
