import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Image,
    Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useStore from '../store/useStore';
import { Picker } from '@react-native-picker/picker';

/**
 * Settings screen for the application.
 * Displays user profile, macro targets, and app settings.
 */
const SettingsScreen: React.FC = () => {
    const navigation = useNavigation();
    const preferences = useStore((state) => state.preferences);
    const updatePreferences = useStore((state) => state.updatePreferences);
    const logout = useStore((state) => state.logout);

    // Local state for settings
    const [units, setUnits] = useState<string>('g/kcal');
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [userData, setUserData] = useState({
        name: 'Sarah Wilson',
        email: 'sarah@example.com',
        avatar: 'https://randomuser.me/api/portraits/women/44.jpg' // Placeholder
    });

    /**
     * Mock fetching user data on component mount
     */
    useEffect(() => {
        // In a real app, this would be an API call
        // For now we're using mock data
        setUserData({
            name: 'Sarah Wilson',
            email: 'sarah@example.com',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
        });

        // Initialize units from preferences
        if (preferences.unitSystem) {
            setUnits(preferences.unitSystem === 'Metric' ? 'g/kcal' : 'oz/cal');
        }
    }, []);

    /**
     * Handle changing the units system
     * @param value - The new units value
     */
    const handleUnitsChange = (value: string) => {
        setUnits(value);
        // Update global preferences
        updatePreferences({
            unitSystem: value === 'g/kcal' ? 'Metric' : 'Imperial'
        });
    };

    /**
     * Handle dark mode toggle
     * @param value - The new dark mode state
     */
    const handleDarkModeToggle = (value: boolean) => {
        setIsDarkMode(value);
        // In a real app, you would update a theme context or store
    };

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
        await logout();
        // Navigate to login screen
        navigation.navigate('Login' as never);
    };

    /**
     * Handle navigation to help screen
     */
    const handleHelpSupport = () => {
        // Navigate to help screen
        navigation.navigate('HelpSupport' as never);
    };

    /**
     * Handle navigation to feedback screen
     */
    const handleSendFeedback = () => {
        // Navigate to feedback screen
        navigation.navigate('SendFeedback' as never);
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Settings</Text>
            </View>

            <ScrollView style={styles.scrollContainer}>
                {/* User Profile Section */}
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

                {/* Macro Targets Section */}
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

                {/* App Settings Section */}
                <View style={styles.settingsSection}>
                    {/* Units Setting */}
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
                    <View style={styles.settingItem}>
                        <View style={styles.settingIconContainer}>
                            <Text style={styles.settingIcon}>🌙</Text>
                        </View>
                        <Text style={styles.settingLabel}>Dark Mode</Text>
                        <Switch
                            value={isDarkMode}
                            onValueChange={handleDarkModeToggle}
                            trackColor={{ false: '#E0E0E0', true: '#19a28f' }}
                            thumbColor={isDarkMode ? '#FFF' : '#FFF'}
                            style={styles.switch}
                        />
                    </View>
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
                        onPress={handleSendFeedback}
                    >
                        <View style={styles.supportIconContainer}>
                            <Text style={styles.supportIcon}>💬</Text>
                        </View>
                        <Text style={styles.supportText}>Send Feedback</Text>
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

                {/* Bottom spacer */}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 5,
    },
    backButtonText: {
        fontSize: 24,
        color: '#333',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '500',
        color: '#333',
        marginLeft: 10,
    },
    scrollContainer: {
        flex: 1,
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
    bottomSpacer: {
        height: 40,
    },
});

export default SettingsScreen;