import React, { useEffect, useState } from 'react';
// import { StatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MacroInputScreen } from "./screens/MacroInputScreen";
import { initGoogleSignIn } from "./services/socialAuthService";
import { MixpanelProvider } from "@macro-meals/mixpanel";
import { MIXPANEL_TOKEN } from '@env';
// import { checkNotificationPermission, getFCMToken } from '@macro-meals/push-notifications';

export default function App() {
    const [notificationPermission, setNotificationPermission] = useState(false);

    useEffect(() => {
        
        // const permission = checkNotificationPermission();
        //console.log('[DEBUG] App.tsx - permission:', permission);
        // const token = getFCMToken();
        //console.log('[DEBUG] App.tsx - permission:', permission);
        //console.log('[DEBUG] App.tsx - token:', token);
        console.log('[DEBUG] App.tsx - MIXPANEL_TOKEN:', MIXPANEL_TOKEN);
        initGoogleSignIn();
    }, []);

    return (
        <MixpanelProvider config={{ token: MIXPANEL_TOKEN }}>
            <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top', 'left', 'right', 'bottom']}>
                <StatusBar style="dark" hidden={true}/>
                <MacroInputScreen />
            </SafeAreaView>
        </MixpanelProvider>
    );
}