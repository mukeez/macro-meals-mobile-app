// import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// import { NavigationContainer } from '@react-navigation/native';
// import { Feather } from '@expo/vector-icons';

// import DashboardScreen from '../screens/DashboardScreen';
// import BarcodeScanScreen from '../screens/BarcodeScanScreen';
// import NearbyMealsScreen from '../screens/NearbyMealsScreen';
// import MacroGoalsScreen from '../screens/MacroGoalsScreen';

// export type BottomTabParamList = {
//     Home: undefined;
//     Scan: undefined;
//     Meals: undefined;
//     Settings: undefined;
// };

// const Tab = createBottomTabNavigator<BottomTabParamList>();

// export const BottomTabNavigator: React.FC = () => {
//     return (
//         <NavigationContainer>
//             <Tab.Navigator
//                 screenOptions={({ route }) => ({
//                     tabBarIcon: ({ color, size }) => {
//                         switch (route.name) {
//                             case 'Home':
//                                 return <Feather name="home" size={size} color={color} />;
//                             case 'Scan':
//                                 return <Feather name="camera" size={size} color={color} />;
//                             case 'Meals':
//                                 return <Feather name="list" size={size} color={color} />;
//                             case 'Settings':
//                                 return <Feather name="settings" size={size} color={color} />;
//                             default:
//                                 return null;
//                         }
//                     },
//                     tabBarActiveTintColor: '#19a28f',
//                     tabBarInactiveTintColor: 'gray',
//                     headerShown: false,
//                 })}
//             >
//                 <Tab.Screen
//                     name="Home"
//                     component={DashboardScreen}
//                     options={{ title: 'Home' }}
//                 />
//                 <Tab.Screen
//                     name="Scan"
//                     component={BarcodeScanScreen}
//                     options={{ title: 'Scan' }}
//                 />
//                 <Tab.Screen
//                     name="Meals"
//                     component={NearbyMealsScreen}
//                     options={{ title: 'Meals' }}
//                 />
//                 <Tab.Screen
//                     name="Settings"
//                     component={MacroGoalsScreen}
//                     options={{ title: 'Settings' }}
//                 />
//             </Tab.Navigator>
//         </NavigationContainer>
//     );
// };

// export default BottomTabNavigator;