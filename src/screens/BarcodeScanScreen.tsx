import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator
} from 'react-native';
import { CameraView, useCameraPermissions, CameraCapturedPicture } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { scanService } from "../services/scanService";

type RootStackParamList = {
    Dashboard: undefined;
    Stats: undefined;
    AddMeal: { barcodeData: string; analyzedData?: any };
    AddMealScreen: { barcodeData?: string; analyzedData?: any };
    MealList: undefined;
    Profile: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

// If scanService isn't implemented yet, we'll use a mock implementation

const BarcodeScanScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [flashMode, setFlashMode] = useState('off');
    const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
    const [lastScanTime, setLastScanTime] = useState<number | null>(null);
    const scanInterval = 2500; // 2.5 seconds between scans
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    
    // Refs for managing scan state
    const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const processingRef = useRef(false);
    const lastBarcodeRef = useRef<string | null>(null);
    const lastScanTimeRef = useRef<number>(0);

    // Reset scanning state when screen is focused
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('SCREEN FOCUSED - RESETTING SCAN STATE');
            resetScanState();
        });

        return () => {
            cleanupScanState();
        };
    }, [navigation]);

    const resetScanState = () => {
        setIsProcessing(false);
        setLastScannedBarcode(null);
        setIsAlertVisible(false);
        processingRef.current = false;
        lastBarcodeRef.current = null;
        lastScanTimeRef.current = 0;
        cleanupScanState();
    };

    const cleanupScanState = () => {
        if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
            scanTimeoutRef.current = null;
        }
    };

    const handleBarCodeScanned = async (scanningResult: { data: string }) => {
        const currentTime = Date.now();
        
        // Check if we're already processing or if this is a duplicate scan
        if (processingRef.current || 
            isAlertVisible || 
            (lastBarcodeRef.current === scanningResult.data && 
             currentTime - lastScanTimeRef.current < scanInterval)) {
            return;
        }

        // Update refs to prevent duplicate scans
        processingRef.current = true;
        lastBarcodeRef.current = scanningResult.data;
        lastScanTimeRef.current = currentTime;
        setIsProcessing(true);

        try {
            const response = await scanService.scanBarcode(scanningResult.data);
            
            if (!response.success) {
                handleScanError(scanningResult.data);
                return;
            }

            const product = response.data.items[0];
            if (product) {
                handleSuccessfulScan(scanningResult.data, product);
            }
        } catch (error) {
            console.error('Scanning error:', error);
            handleScanError(scanningResult.data);
        }
    };

    const handleScanError = (barcodeData: string) => {
        if (isAlertVisible) return;
        
        setIsAlertVisible(true);
        Alert.alert(
            "Product Not Found",
            "We couldn't find this product in our database. Would you like to add it manually?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                    onPress: () => {
                        resetScanState();
                    }
                },
                {
                    text: "Add Manually",
                    onPress: () => {
                        setIsAlertVisible(false);
                        navigation.navigate('AddMeal', {
                            barcodeData: barcodeData
                        });
                    }
                }
            ]
        );
    };

    const handleSuccessfulScan = (barcodeData: string, product: any) => {
        navigation.navigate('AddMeal', {
            barcodeData: '',
            analyzedData: {
                name: product.name,
                calories: product.calories,
                protein: product.protein,
                carbs: product.carbs,
                fat: product.fat,
                quantity: product.quantity
            }
        });
    };

    const handleManualCapture = async () => {
        if (!cameraRef.current || isProcessing) return;

        setIsProcessing(true);

        try {
            // Take a picture
            const photo = await cameraRef.current.takePictureAsync();

            // Process the image for barcode
            try {
                const response = await scanService.scanImage(photo.uri);

                if (response.items && response.items.length > 0) {
                    const product = response.items[0];
                    navigation.navigate('AddMeal', {
                        barcodeData: '',
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
                    Alert.alert(
                        "No Barcode Detected",
                        "We couldn't find a readable barcode in this image. Please try again or enter details manually.",
                        [
                            {
                                text: "Try Again",
                                onPress: () => setIsProcessing(false)
                            },
                            {
                                text: "Add Manually",
                                onPress: () => navigation.navigate('AddMeal' as never)
                            }
                        ]
                    );
                }
            } catch (error) {
                console.error('Image processing error:', error);
                setIsProcessing(false);
                Alert.alert(
                    "Processing Error",
                    "There was an error processing the image. Please try again."
                );
            }
        } catch (error) {
            console.error('Camera capture error:', error);
            setIsProcessing(false);
            Alert.alert(
                "Camera Error",
                "There was an error taking the picture. Please try again."
            );
        }
    };

    const openGallery = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                "Permission Required",
                "We need access to your photo library to use this feature."
            );
            return;
        }

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
                        navigation.navigate('AddMeal', {
                            barcodeData: '',
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
                        Alert.alert(
                            "No Barcode Detected",
                            "We couldn't find a readable barcode in this image. Please try again or enter details manually.",
                            [
                                {
                                    text: "OK",
                                    onPress: () => setIsProcessing(false)
                                }
                            ]
                        );
                    }
                } catch (error) {
                    console.error('Image scan error:', error);
                    setIsProcessing(false);
                    Alert.alert(
                        "Processing Error",
                        "There was an error processing the image. Please try again."
                    );
                }
            }
        } catch (error) {
            console.error('Gallery selection error:', error);
            setIsProcessing(false);
        }
    };

    const toggleFlash = () => {
        setFlashMode(current => current === 'off' ? 'torch' : 'off');
    };

    // If permissions are not granted
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
                enableTorch={flashMode === 'torch'}
                barcodeScannerSettings={{
                    barcodeTypes: [
                        'ean13', 'ean8', 'upc_e',
                        'code39', 'code128', 'itf14'
                    ]
                }}
                onBarcodeScanned={isProcessing ? undefined : handleBarCodeScanned}
            />

            <View style={styles.overlayContainer}>
                <View style={styles.scanFrame} />

                {isProcessing ? (
                    <View style={styles.processingContainer}>
                        <ActivityIndicator size="large" color="#0FE38F" />
                        <Text style={styles.processingText}>Processing...</Text>
                    </View>
                ) : (
                    <View>
                        <Text style={styles.instructionText}>
                            Center the barcode within the frame to scan
                        </Text>
                        <Text style={styles.autoScanText}>
                            Scanning automatically...
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.bottomControls}>
                <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={toggleFlash}
                >
                    <Ionicons
                        name={flashMode === 'off' ? "flash-outline" : "flash"}
                        size={24}
                        color="white"
                    />
                </TouchableOpacity>

                <View style={[
                    styles.scanButtonContainer,
                    isProcessing && styles.scanButtonDisabled
                ]}>
                    <View style={styles.scanButton} />
                    {isProcessing && (
                        <View style={styles.scanButtonOverlay}>
                            <ActivityIndicator size="small" color="white" />
                        </View>
                    )}
                </View>

                <TouchableOpacity
                    style={styles.bottomButton}
                    onPress={openGallery}
                    disabled={isProcessing}
                >
                    <Ionicons
                        name="image-outline"
                        size={24}
                        color={isProcessing ? "gray" : "white"}
                    />
                </TouchableOpacity>
            </View>

            <View style={styles.bottomNavigation}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Dashboard')}
                >
                    <Ionicons name="home-outline" size={24} color="gray" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Stats')}
                >
                    <Ionicons name="stats-chart-outline" size={24} color="gray" />
                    <Text style={styles.navText}>Stats</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.navItem}>
                    <Ionicons name="camera-outline" size={24} color="white" />
                    <Text style={styles.navTextActive}>Scan</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('MealList')}
                >
                    <Ionicons name="restaurant-outline" size={24} color="gray" />
                    <Text style={styles.navText}>Meals</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Profile')}
                >
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
        bottom: 80,
        color: 'white',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
        textAlign: 'center',
    },
    autoScanText: {
        position: 'absolute',
        bottom: 40,
        color: '#0FE38F',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 10,
        textAlign: 'center',
        alignSelf: 'center',
        fontWeight: '500',
    },
    processingContainer: {
        position: 'absolute',
        bottom: 50,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        flexDirection: 'row',
    },
    processingText: {
        color: 'white',
        marginLeft: 10,
        fontSize: 16,
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
    scanButtonDisabled: {
        opacity: 0.5,
    },
    scanButtonOverlay: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#0FE38F', // Teal color
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
    navTextActive: {
        color: 'white',
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
    overlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default BarcodeScanScreen;