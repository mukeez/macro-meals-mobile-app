// src/screens/WelcomeScreen.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type RootStackParamList = {
    Welcome: undefined;
    MacroInput: undefined;
    Login: undefined;
};

type WelcomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC = () => {
    // Try to get navigation, but don't throw an error if not available
    let navigation;
    try {
        navigation = useNavigation<WelcomeScreenNavigationProp>();
    } catch (error) {
        // Navigation is not available
        console.log('Navigation not available');
    }

    const handleGetStarted = () => {
        if (navigation) {
            navigation.navigate('MacroInput');
        } else {
            console.log('Would navigate to MacroInput screen');
        }
    };

    const handleLogin = () => {
        if (navigation) {
            navigation.navigate('Login');
        } else {
            console.log('Would navigate to Login screen');
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoBox} />
                    <Text style={styles.appName}>MacroMeals</Text>
                    <Text style={styles.tagline}>Eat smart. Anywhere.</Text>
                </View>

                {/* Circle Graphic Placeholder */}
                <View style={styles.circlePlaceholder} />

                {/* Icon Buttons */}
                <View style={styles.iconButtonsContainer}>
                    <View style={styles.iconButton} />
                    <View style={styles.iconButton} />
                    <View style={styles.iconButton} />
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        style={styles.getStartedButton}
                        onPress={handleGetStarted}
                    >
                        <Text style={styles.getStartedText}>Get Started</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                    >
                        <Text style={styles.loginText}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingVertical: 40,
        paddingHorizontal: 30,
    },
    logoContainer: {
        alignItems: 'center',
        marginTop: 20,
    },
    logoBox: {
        width: 70,
        height: 70,
        backgroundColor: '#19a28f',
        borderRadius: 16,
    },
    appName: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#19a28f',
        marginTop: 15,
    },
    tagline: {
        fontSize: 18,
        color: '#666',
        marginTop: 10,
    },
    circlePlaceholder: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#f5f5f5',
        marginVertical: 30,
    },
    iconButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 40,
    },
    iconButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#f5f5f5',
    },
    actionButtonsContainer: {
        width: '100%',
        marginTop: 20,
    },
    getStartedButton: {
        backgroundColor: '#19a28f',
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
        marginBottom: 15,
    },
    getStartedText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    loginButton: {
        borderColor: '#19a28f',
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 16,
        alignItems: 'center',
    },
    loginText: {
        color: '#19a28f',
        fontSize: 18,
        fontWeight: 'bold',
    }
});