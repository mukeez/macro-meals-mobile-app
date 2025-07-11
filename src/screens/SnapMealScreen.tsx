import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    Button,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { CameraView, FlashMode, useCameraPermissions, CameraType } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import useStore from '../store/useStore';
import * as FileSystem from 'expo-file-system';
import { scanService } from '../services/scanService';
import { StackNavigationProp } from '@react-navigation/stack';

/**
 * SnapMealScreen component allows users to take photos of their meals
 * for AI analysis of nutritional content
 */
type RootStackParamList = {
    Dashboard: undefined;
    Stats: undefined;
    AddMeal: { barcodeData: string; analyzedData?: any };
    AddMealScreen: { barcodeData?: string; analyzedData?: any };
    MealList: undefined;
    Profile: undefined;
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const SnapMealScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const [permission, requestPermission] = useCameraPermissions();

    const cameraRef = useRef<CameraView>(null);
    const [facing, setFacing] = useState<CameraType>('back');
    const [flashMode, setFlashMode] = useState<FlashMode>('off');
    const token = useStore((state) => state.token);

    const [showOverlay, setShowOverlay] = useState(true);
    const [loading, setLoading] = useState(false);
    const [scanError, setScanError] = useState(false);
    const [isAlertVisible, setIsAlertVisible] = useState(false);

    useEffect(() => {
        const overlayTimer = setTimeout(() => {
            setShowOverlay(false);
        }, 5000);

        return () => clearTimeout(overlayTimer);
    }, []);

    /**
     * Handle meal photo capture
     */
    const handleCapture = async () => {
        if (!cameraRef.current) return;

        try {
            setLoading(true);
            setScanError(false);
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
            });

            // Prepare the file for upload
            const fileUri = photo.uri;
            const fileName = fileUri.split('/').pop() || 'meal.jpg';
            const fileType = 'image/jpeg';

            // Send to API
            const data = await scanService.scanImage(fileUri);
            console.log('AI Scan Response:', data);

            if (data && data.items && data.items.length > 0) {
                navigation.navigate('AddMealScreen', {
                    analyzedData: {
                        name: data.items[0].name,
                        calories: data.items[0].calories,
                        protein: data.items[0].protein,
                        carbs: data.items[0].carbs,
                        fat: data.items[0].fat,
                        amount: data.items[0].amount,
                        serving_unit: data.items[0].serving_unit,
                        logging_mode: 'scanned',
                        photo: photo.uri,
                    }
                });
            } else {
                setScanError(true);
                setIsAlertVisible(true);
            }
        } catch (error) {
            setScanError(true);
            setIsAlertVisible(true);
            console.error('Error capturing or uploading photo:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Toggle flash mode (off -> on -> auto)
     */
    const toggleFlash = () => {
        setFlashMode(current => {
            switch (current) {
                case 'off':
                    return 'on';
                case 'on':
                    return 'auto';
                default:
                    return 'off';
            }
        });
    };

    /**
     * Toggle between front and back camera
     */
    const toggleCameraFacing = () => {
        setFacing(current => (
            current === 'back' ? 'front' : 'back'
        ));
    };

    /**
     * Stub for opening the device gallery
     */
    const openGallery = () => {
        // TODO: Implement gallery selection using expo-media-library
        console.log('Open gallery');
    };

    /**
     * Handle going back to previous screen
     */
    const handleBack = () => {
        navigation.goBack();
    };

    const getFlashIcon = () => {
        switch (flashMode) {
            case 'on':
                return 'flash';
            case 'auto':
                return 'flash-auto';
            default:
                return 'flash-off';
        }
    };

    if (!permission) {
        return <View />;
    }

    if (!permission.granted) {
        return (
            <View className="flex-1 bg-black justify-center items-center">
                <Text className="text-white text-center mb-5">
                    We need camera access to analyze your meals
                </Text>
                <Button
                    title="Grant Permission"
                    onPress={requestPermission}
                />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-black">
            <StatusBar barStyle="light-content" backgroundColor="#000" />
            <View className="flex-1 relative">
                <CameraView
                    ref={cameraRef}
                    style={{ flex: 1 }}
                    facing={facing}
                    // flashMode={flashMode}
                />
                {/* Header */}
                <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between pt-4 px-4 z-10">
                    <TouchableOpacity onPress={handleBack} className="p-1">
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>
                    <Text className="flex-1 text-center text-white text-lg font-semibold">Scan a meal</Text>
                    <View style={{ width: 28 }} />
                </View>
                {/* Overlay Corners */}
                <View className="absolute inset-0 justify-center items-center pointer-events-none">
                    <View className="absolute w-[70%]" style={{ aspectRatio: 1 }}>
                        <View className={`absolute top-0 left-0 w-12 h-12 border-t-[12px] border-l-[12px] ${scanError ? 'border-[#DB2F2C]' : 'border-white'} rounded-tl-lg`} />
                        <View className={`absolute top-0 right-0 w-12 h-12 border-t-[12px] border-r-[12px] ${scanError ? 'border-[#DB2F2C]' : 'border-white'} rounded-tr-lg`} />
                        <View className={`absolute bottom-0 left-0 w-12 h-12 border-b-[12px] border-l-[12px] ${scanError ? 'border-[#DB2F2C]' : 'border-white'} rounded-bl-lg`} />
                        <View className={`absolute bottom-0 right-0 w-12 h-12 border-b-[12px] border-r-[12px] ${scanError ? 'border-[#DB2F2C]' : 'border-white'} rounded-br-lg`} />
                    </View>
                </View>
                {/* Capture Button */}
                <View className="absolute bottom-10 left-0 right-0 items-center justify-center" pointerEvents="box-none">
                    <TouchableOpacity onPress={handleCapture} activeOpacity={0.7} className="w-20 h-20 bg-white rounded-full border-4 border-white items-center justify-center shadow-lg">
                        <View className="w-16 h-16 bg-gray-200 rounded-full" />
                    </TouchableOpacity>
                </View>
                {/* Loading Indicator */}
                {loading && (
                    <View className="absolute inset-0 bg-black/40 justify-center items-center z-50">
                        <ActivityIndicator size="large" color="#fff" />
                    </View>
                )}
                <View className="absolute bottom-32 left-0 right-0 items-center">
                    <Text className={`text-center text-base font-semibold ${scanError ? '' : 'text-white'}`} style={scanError ? { color: '#DB2F2C' } : {}}>
                        {scanError ? 'Meal scanner not recognising food item' : 'Center the meal within the frame to scan'}
                    </Text>
                    {scanError && (
                        <TouchableOpacity
                            className="mt-4 px-6 py-3 rounded-full bg-[#DB2F2C]"
                            onPress={() => {
                                setIsAlertVisible(false);
                                setScanError(false);
                                navigation.navigate('AddMealScreen', {});
                            }}
                        >
                            <Text className="text-white font-semibold">Add Manually</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </SafeAreaView>
    );
};

export default SnapMealScreen;