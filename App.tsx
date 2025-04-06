import React from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Constants from 'expo-constants';
import { MacroInputScreen } from './src/screens/MacroInputScreen';

export default function App() {
  return (
      <View style={styles.container}>
        <StatusBar style="dark" />
        <View style={styles.safeArea}>
          <MacroInputScreen />
        </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Constants.statusBarHeight,
  },
  safeArea: {
    flex: 1,
    paddingBottom: 34,
  },
});