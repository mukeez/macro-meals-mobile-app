import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import { MacroInputScreen } from './src/screens/MacroInputScreen';

export default function App() {
    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
            <StatusBar style="auto" />
            <MacroInputScreen />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
});