import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';

import { scanService } from '../services/scanService';

const BarcodeScanScreen = () => {
    const navigation = useNavigation();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleBarCodeScanned = async (scanningResult) => {
        if (isProcessing) return;

        setIsProcessing(true);

        try {
            const response = await scanService.scanBarcode(scanningResult.data);

            if (response.items && response.items.length > 0) {
                const product = response.items[0];
                navigation.navigate('AddMealScreen', {
                    barcodeData: scanningResult.data,
                    analyzedData: {
                        name: product.name,
                        calories: product.calories,
                        protein: product.protein,
                        carbs: product.carbs,
                        fat: product.fat,
                        quantity: product.quantity
                    }
                });
            } else {
                // Handle no product found
                setIsProcessing(false);
            }
        } catch (error) {
            console.error('Barcode scan error:', error);
            setIsProcessing(false);
        }
    };

    const openGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setIsProcessing(true);

                try {
                    const response = await scanService.scanImage(result.assets[0].uri);

                    if (response.items && response.items.length > 0) {
                        const product = response.items[0];
                        navigation.navigate('AddMealScreen', {
                            barcodeData: null,
                            analyzedData: {
                                name: product.name,
                                calories: product.calories,
                                protein: product.protein,
                                carbs: product.carbs,
                                fat: product.fat,
                                quantity: product.quantity
                            }
                        });
                    } else {
                        // Handle no product found
                        setIsProcessing(false);
                    }
                } catch (error) {
                    console.error('Image scan error:', error);
                    setIsProcessing(false);
                }
            }
        } catch (error) {
            console.error('Gallery selection error:', error);
            setIsProcessing(false);
        }
    };

    const toggleFlash = () => {
    };

    if (!permission?.granted) {
        return (
            <View style={styles.container}>
                <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
                    <Text style={styles.permissionButtonText}>Grant Camera Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scan Barcode</Text>
                <View style={styles.headerPlaceholder} />
            </View>

            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing="back"
                barCodeScannerSettings={{
                    barCodeTypes: [
                        'ean13', 'ean8', 'upc_e',
                        'code39', 'code128', 'itf14'
                    ]
                }}
                onBarcodeScanned={!isProcessing ? handleBarCodeScanned : undefined}
            >
                <View style={styles.scanFrame} />
                <Text style={styles.instructionText}>
                    Center the barcode within the frame to scan
                </Text>
            </CameraView>

            <View style={styles.bottomControls}>
                <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={toggleFlash}
                >
                    <Ionicons name="flash-outline" size={24} color="white" />
                </TouchableOpacity>

                <View style={styles.scanButtonContainer}>
                    <View style={styles.scanButton} />
                </View>

                <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={openGallery}
                >
                    <Ionicons name="image-outline" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.bottomNavigation}>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="home-outline" size={24} color="gray" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="stats-chart-outline" size={24} color="gray" />
                    <Text style={styles.navText}>Stats</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="camera-outline" size={24} color="white" />
                    <Text style={styles.navText}>Scan</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="restaurant-outline" size={24} color="gray" />
                    <Text style={styles.navText}>Meals</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="person-outline" size={24} color="gray" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTitle: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    headerPlaceholder: {
        width: 24, // Match the back icon width
    },
    camera: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 280,
        height: 200,
        borderWidth: 2,
        borderColor: '#0FE38F', // Teal color from the image
        borderStyle: 'dashed',
        backgroundColor: 'transparent',
        position: 'absolute',
    },
    instructionText: {
        position: 'absolute',
        bottom: 50,
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    bottomControls: {
        position: 'absolute',
        bottom: 80,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    bottomButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanButtonContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#0FE38F',
    },
    bottomNavigation: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: '#1A1A1A',
        paddingVertical: 10,
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        color: 'gray',
        fontSize: 10,
        marginTop: 5,
    },
    permissionButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0FE38F',
    },
    permissionButtonText: {
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default BarcodeScanScreen;