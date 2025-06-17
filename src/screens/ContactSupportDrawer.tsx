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

const { height } = Dimensions.get("window");

type ContactSupportDrawerProps = {
  onClose: () => void;
};

export default function ContactSupportDrawer({
  onClose,
}: ContactSupportDrawerProps) {
  return (
    <CustomSafeAreaView>
      <View
        className="absolute left-0 bottom-0 w-full rounded-t-3xl overflow-hidden shadow-2xl"
        style={{ height: height * 0.85 }}
      >
        {/* Top half with green bg */}
        <View className="bg-[#009688] py-16 px-6 rounded-t-3xl">
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
            <Text className="text-3xl font-bold text-gray-300">
              Hi there 👋
            </Text>
            <Text className="text-white text-3xl font-bold">
              How can we help?
            </Text>
          </View>

          <View
            className="absolute left-0 right-0 mx-6 rounded-2xl bg-white p-6"
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
              <Text className="text-gray-700 text-sm text-center">
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
              className="mt-5 flex-row items-center justify-start bg-[#009688] w-3/5 rounded-3xl px-4 py-3"
              activeOpacity={0.85}
              onPress={() => Linking.openURL("mailto:support@macromeals.com")}
            >
              <Ionicons name="paper-plane" size={17} color="white" />
              <Text className="text-white font-semibold text-base ml-2">
                Send us a message
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="flex-1 bg-white px-6 py-6 border-b-2"></View>
      </View>
    </CustomSafeAreaView>
  );
}
