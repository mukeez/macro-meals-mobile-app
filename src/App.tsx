import './globals.css'
import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { initGoogleSignIn } from "./services/socialAuthService";
import { MacroInputScreen } from "./screens/MacroInputScreen";

export default function App() {
    useEffect(() => {
        // Initialize Google Sign In
        initGoogleSignIn();
    }, [])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar barStyle="dark-content" />
            <MacroInputScreen />
        </SafeAreaView>
    );
}