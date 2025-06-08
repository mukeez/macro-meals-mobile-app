import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../screens/DashboardScreen';
import { StatsScreen } from '../screens/StatsScreen';
import ScanScreenType from '../screens/ScanScreenType';
import { SettingsScreen } from '../screens/SettingsScreen';
import { IMAGE_CONSTANTS } from '../constants/imageConstants';
import { ImageBackground, Image, View, Text } from 'react-native';

const Tab = createBottomTabNavigator();


const CustomBottomTabs = ()=> {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarShowLabel: true,
                tabBarActiveTintColor: '#01675B',
                tabBarInactiveTintColor: '#000',
                tabBarStyle: {
                    backgroundColor: '#fff',
                },
                tabBarLabelStyle: {
                    fontSize: 10,
                    fontWeight: '600'
                },
                tabBarItemStyle: {
                    paddingTop: 5,

                }
            }}
        >
            <Tab.Screen 
                name='Dashboard' 
                component={DashboardScreen} 
                options={{
                    headerShown: false,
                    tabBarLabel: 'Dashboard',
                    tabBarIcon: ({focused}) => (
                        <Image tintColor={focused ? '#01675B' : undefined} source={IMAGE_CONSTANTS.dashboardIcon} className='w-[24px] h-[24px]' />
                    )
                }} />
            <Tab.Screen 
                name='Scan' 
                component={StatsScreen} 
                options={{
                    headerShown: false,
                    tabBarLabel: 'Meals',
                    tabBarIcon: ({ focused }) => (
                        <Image tintColor={focused ? '#01675B' : undefined} source={IMAGE_CONSTANTS.mealsIcon} className='w-[24px] h-[24px]' />
                    )
                }} />
            <Tab.Screen 
                name='Stats' 
                component={ScanScreenType} 
                options={{
                    headerShown: false,
                    tabBarLabel: 'Progress',
                tabBarIcon: ({ focused }) => (
                    <Image tintColor={focused ? '#01675B' : undefined} source={IMAGE_CONSTANTS.progressIcon} className='w-[24px] h-[24px]' />
                )
            }} />
            <Tab.Screen 
                name='Settings' 
                component={SettingsScreen} 
                options={{
                    headerShown: false,
                    tabBarLabel: 'Profile',
                tabBarIcon: ({ focused }) => (
                    <Image tintColor={focused ? '#01675B' : undefined} source={IMAGE_CONSTANTS.profileIcon} className='w-[24px] h-[24px]' /> 
                )
            }} />
        </Tab.Navigator>
    )
}

export default CustomBottomTabs;