import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Image,
    Linking,
    Platform,
    Switch, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import useStore from '../store/useStore';
import { Picker } from '@react-native-picker/picker';
import { authService } from '../services/authService';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import { FontAwesome } from '@expo/vector-icons';

type RootStackParamList = {
    Login: undefined;
    Welcome: undefined;
    TermsOfService: undefined;
    PrivacyPolicy: undefined;
    About: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
import { appConstants } from '../../constants/appConstants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteItemAsync } from 'expo-secure-store';

/**
 * Settings screen for the application.
 * Displays user profile, macro targets, and app settings.
 */
export const SettingsScreen: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const preferences = useStore((state) => state.preferences);
    const token = useStore((state) => state.token);
    const updatePreferences = useStore((state) => state.updatePreferences);
    const logout = useStore((state) => state.logout);
    const setAuthenticated = useStore((state) => state.setAuthenticated);

    // Local state for settings
    const [units, setUnits] = useState<string>('g/kcal');
    // const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        avatar: '' // Placeholder
    });

    /**
     * Mock fetching user data on component mount
     */
    useEffect(() => {
        console.log(preferences);
        const fetchUserData = async () => {
            const profileResponse = await fetch('https://api.macromealsapp.com/api/v1/user/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!profileResponse.ok) {
                throw new Error('Failed to fetch user profile');
            }

            const profileData = await profileResponse.json();
            setUserData(profileData);
        };
        fetchUserData();

        setUserData({
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
        });

        if (preferences.unitSystem) {
            setUnits(preferences.unitSystem === 'Metric' ? 'g/kcal' : 'oz/cal');
        }
    }, [token]);

    /**
     * Handle changing the units system
     * @param value - The new units value
     */
    const handleUnitsChange = async (value: string) => {
        setUnits(value);

        const newUnitSystem = value === 'g/kcal' ? 'Metric' : 'Imperial';
        updatePreferences({
            unitSystem: newUnitSystem
        });

        try {
            const token = useStore.getState().token;
            const response = await fetch('https://api.macromealsapp.com/api/v1/user/preferences', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    unitSystem: newUnitSystem
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update preferences');
            }

            console.log('Preferences updated successfully');
        } catch (error) {
            console.error('Error updating preferences:', error);
            // You could add error handling UI here if needed
        }
    };

    /**
     * Handle dark mode toggle
     * @param value - The new dark mode state
     */
    // const handleDarkModeToggle = (value: boolean) => {
    //     setIsDarkMode(value);
    //     // In a real app, you would update a theme context or store
    // };

    /**
     * Handle going back to the previous screen
     */
    const handleGoBack = () => {
        navigation.goBack();
    };

    /**
     * Handle logout action
     */
    const handleLogout = async () => {
        try {
            await authService.logout();
            setAuthenticated(false, '', '');
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    /**
     * Handle navigation to help screen
     */
    const handleHelpSupport = () => {
        // Navigate to help screen
        Alert.alert('Help + Support ', 'Help + Support coming soon!')
        // navigation.navigate('HelpSupport' as never);
    };

    const handleModalSheet = () => {
        console.log('Modal sheet');
        navigation.navigate('PaymentScreen' as never);
    };

    const openEmail = () => {
        let url = `mailto:${appConstants.email.to}`;

        const subject = `?subject=${encodeURIComponent(appConstants.email.subject)}`;
        const body = `&body=${encodeURIComponent(appConstants.email.body)}`;
        url += subject + body;
        Linking.openURL(url).catch((err)=> console.error('Error opening email', err));
    }

    /**
     * Handle navigation to feedback screen
     */
    const handleSendFeedback = () => {
        // Navigate to feedback screen
        Alert.alert('Feedback ', 'Feedback coming soon!')

        // navigation.navigate('SendFeedback' as never);
    };

    const handleDeleteAccount = async () => {
        Alert.alert(
            'Delete Account',
            'Are you sure you want to delete your account? This action cannot be undone.',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await authService.logout();
                            setAuthenticated(false, '', '');
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Welcome' }],
                            });
                        } catch (error) {
                            console.error('Delete account error:', error);
                        }
                    },
                },
            ]
        );
    };

    return (
        <CustomSafeAreaView style={styles.container} edges={['left', 'right']}>
            <ScrollView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <FontAwesome name="arrow-left" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.title}>Settings</Text>
                </View>

                <View style={styles.profileSection}>
                    <Image
                        source={{ uri: userData.avatar }}
                        style={styles.avatar}
                    />
                    <View style={styles.profileInfo}>
                        <Text style={styles.userName}>{userData.name}</Text>
                        <TouchableOpacity>
                            <Text style={styles.userEmail}>{userData.email}</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>✏️</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.sectionTitle}>Macro Targets</Text>
                <View style={styles.macroSection}>
                    <View style={styles.macroItem}>
                        <View style={[styles.macroIcon, styles.proteinIcon]}>
                            <Text>🍗</Text>
                        </View>
                        <Text style={styles.macroLabel}>Protein</Text>
                        <TouchableOpacity style={styles.macroValue}>
                            <Text style={styles.macroValueText}>{preferences.protein}g</Text>
                            <Text style={styles.chevron}>›</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.macroItem}>
                        <View style={[styles.macroIcon, styles.carbsIcon]}>
                            <Text>🍞</Text>
                        </View>
                        <Text style={styles.macroLabel}>Carbs</Text>
                        <TouchableOpacity style={styles.macroValue}>
                            <Text style={styles.macroValueText}>{preferences.carbs}g</Text>
                            <Text style={styles.chevron}>›</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.macroItem}>
                        <View style={[styles.macroIcon, styles.fatsIcon]}>
                            <Text>🫒</Text>
                        </View>
                        <Text style={styles.macroLabel}>Fats</Text>
                        <TouchableOpacity style={styles.macroValue}>
                            <Text style={styles.macroValueText}>{preferences.fat}g</Text>
                            <Text style={styles.chevron}>›</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.settingsSection}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingIconContainer}>
                            <Text style={styles.settingIcon}>⚖️</Text>
                        </View>
                        <Text style={styles.settingLabel}>Units</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={units}
                                style={styles.picker}
                                onValueChange={handleUnitsChange}
                                dropdownIconColor="#666"
                            >
                                <Picker.Item label="g/kcal" value="g/kcal" />
                                <Picker.Item label="oz/cal" value="oz/cal" />
                            </Picker>
                        </View>
                    </View>

                    {/* Dark Mode Setting */}
                    {/*<View style={styles.settingItem}>*/}
                    {/*    <View style={styles.settingIconContainer}>*/}
                    {/*        <Text style={styles.settingIcon}>🌙</Text>*/}
                    {/*    </View>*/}
                    {/*    <Text style={styles.settingLabel}>Dark Mode</Text>*/}
                    {/*    <Switch*/}
                    {/*        value={isDarkMode}*/}
                    {/*        onValueChange={handleDarkModeToggle}*/}
                    {/*        trackColor={{ false: '#E0E0E0', true: '#19a28f' }}*/}
                    {/*        thumbColor={isDarkMode ? '#FFF' : '#FFF'}*/}
                    {/*        style={styles.switch}*/}
                    {/*    />*/}
                    {/*</View>*/}
                </View>

                {/* Help and Support Section */}
                <View style={styles.supportSection}>
                    <TouchableOpacity
                        style={styles.supportItem}
                        onPress={handleHelpSupport}
                    >
                        <View style={styles.supportIconContainer}>
                            <Text style={styles.supportIcon}>❓</Text>
                        </View>
                        <Text style={styles.supportText}>Help & Support</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.supportItem}
                        onPress={openEmail}
                    >
                        <View style={styles.supportIconContainer}>
                            <Text style={styles.supportIcon}>💬</Text>
                        </View>
                        <Text style={styles.supportText}>Send Feedback</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.premiumButton}
                        onPress={handleModalSheet}
                    >
                        <Text style={styles.premiumText}>💰</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.supportItem, styles.logoutItem]}
                        onPress={handleLogout}
                    >
                        <View style={[styles.supportIconContainer, styles.logoutIconContainer]}>
                            <Text style={styles.supportIcon}>🚪</Text>
                        </View>
                        <Text style={[styles.supportText, styles.logoutText]}>Logout</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('TermsOfService')}
                    >
                        <Text style={styles.menuItemText}>Terms of Service</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('PrivacyPolicy')}
                    >
                        <Text style={styles.menuItemText}>Privacy Policy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.menuItem}
                        onPress={() => navigation.navigate('About')}
                    >
                        <Text style={styles.menuItemText}>About</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity
                        style={[styles.menuItem, styles.deleteButton]}
                        onPress={handleDeleteAccount}
                    >
                        <Text style={styles.deleteText}>Delete Account</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </CustomSafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#e1e1e1',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 15,
    },
    userName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 5,
    },
    userEmail: {
        fontSize: 16,
        color: '#666',
    },
    editButton: {
        padding: 10,
    },
    editButtonText: {
        fontSize: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginVertical: 15,
        marginHorizontal: 20,
    },
    macroSection: {
        marginHorizontal: 20,
    },
    macroItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    macroIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    proteinIcon: {
        backgroundColor: '#E8F7F3',
    },
    carbsIcon: {
        backgroundColor: '#FFF8E0',
    },
    fatsIcon: {
        backgroundColor: '#FFEEEE',
    },
    macroLabel: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    macroValue: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    macroValueText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    chevron: {
        fontSize: 20,
        color: '#999',
        marginLeft: 5,
    },
    settingsSection: {
        backgroundColor: '#f9f9f9',
        padding: 20,
        marginVertical: 10,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    settingIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingIcon: {
        fontSize: 20,
    },
    settingLabel: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    switch: {
        marginLeft: 10,
    },
    pickerContainer: {
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        width: 120,
    },
    picker: {
        height: 40,
        width: 120,
    },
    supportSection: {
        marginTop: 20,
        marginBottom: 20,
    },
    supportItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    supportIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    supportIcon: {
        fontSize: 20,
    },
    supportText: {
        fontSize: 16,
        color: '#333',
    },
    logoutItem: {
        marginTop: 10,
    },
    logoutIconContainer: {
        backgroundColor: '#FFE5E5',
    },
    logoutText: {
        color: '#FF4343',
    },
    section: {
        marginTop: 24,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    menuItemText: {
        fontSize: 16,
        color: '#333',
    },
    logoutButton: {
        borderBottomWidth: 0,
    },
    deleteButton: {
        borderBottomWidth: 0,
    },
    deleteText: {
        fontSize: 16,
        color: '#FF3B30',
    },
    premiumButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 28,
    },
    premiumText: {
        fontSize: 16,
    },
});

export default SettingsScreen;