import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

/**
 * ScanScreen component displays the various meal logging options:
 * - Scan with Camera (take a photo)
 * - Scan Barcode (scan a product)
 * - Manual Entry (search and log manually)
 */
const ScanScreenType: React.FC = () => {
    const navigation = useNavigation();

    /**
     * Navigate to the camera screen to take a photo of food
     */
    const handleOpenCamera = () => {
        // You would implement or navigate to a camera capture screen
        console.log('Opening camera for meal photo');
        navigation.navigate('SnapMeal' as never);


        // This would typically navigate to a camera screen, e.g.
        // navigation.navigate('MealCameraScreen' as never);
    };

    /**
     * Navigate to barcode scanner screen
     */
    const handleScanBarcode = () => {
        navigation.navigate('BarcodeScanScreen' as never);
    };

    /**
     * Navigate to manual meal entry/search screen
     */
    const handleManualEntry = () => {
        navigation.navigate('AddMeal' as never);
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.logoContainer}>
                    <View style={styles.logoBox}>
                        <Text style={styles.logoIcon}>🍴</Text>
                    </View>
                    <Text style={styles.logoText}>MacroMeal</Text>
                </View>
                <TouchableOpacity style={styles.helpButton}>
                    <Text style={styles.helpIcon}>❓</Text>
                </TouchableOpacity>
            </View>

            {/* Scan with Camera Option */}
            <View style={styles.optionCard}>
                <View style={styles.optionContent}>
                    <View style={[styles.optionIconContainer, styles.cameraIconContainer]}>
                        <Text style={styles.optionIcon}>📷</Text>
                    </View>
                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>Scan with Camera</Text>
                        <Text style={styles.optionSubtitle}>Take a photo of your meal</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.actionButton, styles.cameraButton]}
                    onPress={handleOpenCamera}
                >
                    <Text style={styles.actionButtonText}>Open Camera</Text>
                </TouchableOpacity>
            </View>

            {/* Scan Barcode Option */}
            <View style={styles.optionCard}>
                <View style={styles.optionContent}>
                    <View style={[styles.optionIconContainer, styles.barcodeIconContainer]}>
                        <Text style={styles.optionIcon}>📊</Text>
                    </View>
                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>Scan Barcode</Text>
                        <Text style={styles.optionSubtitle}>Scan product barcode</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.actionButton, styles.barcodeButton]}
                    onPress={handleScanBarcode}
                >
                    <Text style={styles.actionButtonText}>Scan Barcode</Text>
                </TouchableOpacity>
            </View>

            {/* Manual Entry Option */}
            <View style={styles.optionCard}>
                <View style={styles.optionContent}>
                    <View style={[styles.optionIconContainer, styles.manualIconContainer]}>
                        <Text style={styles.optionIcon}>⌨️</Text>
                    </View>
                    <View style={styles.optionTextContainer}>
                        <Text style={styles.optionTitle}>Manual Entry</Text>
                        <Text style={styles.optionSubtitle}>Search and log manually</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={[styles.actionButton, styles.manualButton]}
                    onPress={handleManualEntry}
                >
                    <Text style={styles.manualButtonText}>Enter Manually</Text>
                </TouchableOpacity>
            </View>

            {/* Bottom Tab Bar */}
            <View style={styles.tabBar}>
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => navigation.navigate('DashboardScreen' as never)}
                >
                    <Text style={styles.tabIcon}>🏠</Text>
                    <Text style={styles.tabText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.tabItem, styles.activeTab]}>
                    <Text style={[styles.tabIcon, styles.activeTabIcon]}>📷</Text>
                    <Text style={[styles.tabText, styles.activeTabText]}>Scan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => navigation.navigate('MealLogScreen' as never)}
                >
                    <Text style={styles.tabIcon}>📋</Text>
                    <Text style={styles.tabText}>Log</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => navigation.navigate('SettingsScreen' as never)}
                >
                    <Text style={styles.tabIcon}>👤</Text>
                    <Text style={styles.tabText}>Profile</Text>
                </TouchableOpacity>
            </View>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    logoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoBox: {
        width: 40,
        height: 40,
        backgroundColor: '#3D9A8B',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoIcon: {
        fontSize: 22,
        color: 'white',
    },
    logoText: {
        fontSize: 22,
        fontWeight: '600',
        color: '#3D9A8B',
        marginLeft: 10,
    },
    helpButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f1f1f1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    helpIcon: {
        fontSize: 20,
        color: '#888',
    },
    optionCard: {
        margin: 16,
        marginBottom: 8,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2.5,
        elevation: 2,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    optionIconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cameraIconContainer: {
        backgroundColor: '#E8F7F3',
    },
    barcodeIconContainer: {
        backgroundColor: '#FFF2E6',
    },
    manualIconContainer: {
        backgroundColor: '#F5F5F5',
    },
    optionIcon: {
        fontSize: 24,
    },
    optionTextContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    optionSubtitle: {
        fontSize: 14,
        color: '#777',
    },
    actionButton: {
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },
    cameraButton: {
        backgroundColor: '#3D9A8B',
    },
    barcodeButton: {
        backgroundColor: '#F47B20',
    },
    manualButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    manualButtonText: {
        color: '#555',
        fontSize: 16,
        fontWeight: '600',
    },
    tabBar: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    tabItem: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeTab: {
        borderTopWidth: 2,
        borderTopColor: '#3D9A8B',
    },
    tabIcon: {
        fontSize: 24,
        marginBottom: 2,
        color: '#999',
    },
    activeTabIcon: {
        color: '#3D9A8B',
    },
    tabText: {
        fontSize: 12,
        color: '#999',
    },
    activeTabText: {
        color: '#3D9A8B',
    },
});

export default ScanScreenType;