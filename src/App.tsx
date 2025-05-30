
import React, { useEffect } from 'react';
// import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { initGoogleSignIn } from "./services/socialAuthService";
import { MacroInputScreen } from "./screens/MacroInputScreen";
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen';

export default function App() {

    useEffect(() => {
        SplashScreen.preventAutoHideAsync();
        setTimeout(async ()=> {
            SplashScreen.hideAsync();
        }, 3000);
        // Initialize Google Sign In
        initGoogleSignIn();
    }, [])

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar style="dark" hidden={true}/>
            <MacroInputScreen />
        </SafeAreaView>
    );
}