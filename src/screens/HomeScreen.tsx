import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import CustomSafeAreaView from '../components/CustomSafeAreaView';



export const HomeScreen: React.FC = () => {
  

    return (
        <CustomSafeAreaView className='flex-1' edges={['left', 'right']}>
            <View style={styles.container}>
                <Text style={styles.title}>Welcome to MacroMate</Text>
                <Text style={styles.subtitle}>Your nutrition journey starts here</Text>
            </View>
        </CustomSafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
        padding: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#202030',
        textAlign: 'center',
        marginBottom: 16,
    },
    subtitle: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        lineHeight: 24,
    },
}); 