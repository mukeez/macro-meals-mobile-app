import React from "react";
import { View, Text } from "react-native";
import { Tabs } from "expo-router";

export default function DashboardLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="Dashboard" options={{ headerShown: false }} />
        </Tabs>
    );
}