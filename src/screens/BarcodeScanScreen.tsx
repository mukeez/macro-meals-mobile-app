import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator,
    StyleSheet
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { scanService } from "../services/scanService";
import * as ImagePicker from 'expo-image-picker';

type RootStackParamList = {
    Dashboard: undefined;
    Stats: undefined;
    AddMeal: { barcodeData: string; analyzedData?: any };
    AddMealScreen: { barcodeData?: string; analyzedData?: any };
    MealList: undefined;
    Profile: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const BarcodeScanScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = useRef<CameraView>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [flashMode, setFlashMode] = useState<'off' | 'torch'>('off');
    const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);
    const [lastScanTime, setLastScanTime] = useState<number | null>(null);
    const scanInterval = 2500;
    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const processingRef = useRef(false);
    const lastBarcodeRef = useRef<string | null>(null);
    const lastScanTimeRef = useRef<number>(0);
    const [scanError, setScanError] = useState(false);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            resetScanState();
        });
        return () => { cleanupScanState(); };
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
        if (processingRef.current || isAlertVisible || (lastBarcodeRef.current === scanningResult.data && currentTime - lastScanTimeRef.current < scanInterval)) {
            console.log('BARCODE ALREADY SCANNED', scanningResult.data);
            return;
        }
        processingRef.current = true;
        console.log('BARCODE SCANNED', scanningResult.data);
        lastBarcodeRef.current = scanningResult.data;
        lastScanTimeRef.current = currentTime;
        console.log('BARCODE SCANNED', scanningResult.data);
        setIsProcessing(true);
        try {
            const response = await scanService.scanBarcode(scanningResult.data);
            if (!response.success) {
                setScanError(true);
                handleScanError(scanningResult.data);
                return;
            }
            const product = response.data.items[0];
            if (product) {
                setScanError(false);
                handleSuccessfulScan(scanningResult.data, product);
            }
        } catch (error) {
            setScanError(true);
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
                { text: "Cancel", style: "cancel", onPress: () => { resetScanState(); } },
                { text: "Add Manually", onPress: () => { setIsAlertVisible(false); navigation.navigate('AddMeal', { barcodeData }); } }
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

    if (!permission?.granted) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <TouchableOpacity onPress={requestPermission} className="bg-teal-600 px-6 py-3 rounded-full mb-4">
                    <Text className="text-white font-semibold">Grant Camera Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2 bg-white border-b border-gray-200">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
                    <Ionicons name="arrow-back" size={24} color="#222" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-black text-base font-semibold">Barcode scan</Text>
                <View style={{ width: 24 }} />
            </View>
            <View className="w-full items-center bg-black">
                <View
                    className="w-full mt-4 rounded-2xl overflow-hidden relative"
                    style={{ aspectRatio: 1 }}
                >
                    <CameraView
                        ref={cameraRef}
                        style={{ flex: 1 }}
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
                    <View className="absolute inset-0 flex-1 justify-center items-center" pointerEvents="none">
                        <View className="absolute inset-0 bg-black/50 z-0">
                            <View className="flex-1 items-center justify-center">
                                <View className="w-[70%]" style={{ aspectRatio: 1, backgroundColor: 'transparent' }} />
                            </View>
                        </View>
                        <View className="absolute w-[70%]" style={{ aspectRatio: 1 }}>
                            <View className={`absolute top-0 left-0 w-16 h-16 border-t-[12px] border-l-[12px] ${scanError ? 'border-[#DB2F2C]' : 'border-[#10bfae]'} rounded-tl-lg`} />
                            <View className={`absolute top-0 right-0 w-16 h-16 border-t-[12px] border-r-[12px] ${scanError ? 'border-[#DB2F2C]' : 'border-[#10bfae]'} rounded-tr-lg`} />
                            <View className={`absolute bottom-0 left-0 w-16 h-16 border-b-[12px] border-l-[12px] ${scanError ? 'border-[#DB2F2C]' : 'border-[#10bfae]'} rounded-bl-lg`} />
                            <View className={`absolute bottom-0 right-0 w-16 h-16 border-b-[12px] border-r-[12px] ${scanError ? 'border-[#DB2F2C]' : 'border-[#10bfae]'} rounded-tr-lg rounded-br-lg`} />
                        </View>
                    </View>
                </View>
            </View>
            <View className="bg-black w-full py-4">
                <Text className={`text-center text-base ${scanError ? '' : 'text-white'}`} style={scanError ? { color: '#DB2F2C' } : {}}>
                    {scanError ? 'Barcode scanner not recognising food item' : 'Center the barcode within the frame to scan'}
                </Text>
            </View>
            <View className="flex-1 bg-white items-center justify-center">
                <TouchableOpacity className="w-20 h-20 bg-teal-600 rounded-full items-center justify-center" activeOpacity={0.8} onPress={() => { handleManualCapture() }}>
                    <MaterialCommunityIcons name="barcode-scan" size={40} color="#fff" />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default BarcodeScanScreen;