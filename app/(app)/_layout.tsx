import React from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function AppLayout() {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: '#19a28f',
                tabBarInactiveTintColor: '#666',
                tabBarStyle: {
                    borderTopWidth: 1,
                    borderTopColor: '#eeeeee',
                },
                headerShown: false,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name="home" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="stats"
                options={{
                    title: 'Stats',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name="bar-chart" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="log"
                options={{
                    title: 'Log',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name="plus-circle" size={24} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => (
                        <FontAwesome name="cog" size={24} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
} 