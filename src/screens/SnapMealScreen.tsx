import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    StatusBar,
    SafeAreaView,
    Button,
} from 'react-native';
import { CameraView, FlashMode, useCameraPermissions } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * SnapMealScreen component allows users to take photos of their meals
 * for AI analysis of nutritional content
 */
const SnapMealScreen = () => {
    const navigation = useNavigation();

    const [permission, requestPermission] = useCameraPermissions();

    const cameraRef = useRef(null);
    const [facing, setFacing] = useState('back');
    const [flashMode, setFlashMode] = useState('off');

    const [showOverlay, setShowOverlay] = useState(true);

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
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
            });

            // For now, we just log the photo URI
            console.log('Photo captured:', photo.uri);

            // TODO: Implement the photo upload and analysis logic
            // navigation.navigate('AnalyzeMeal', { photoUri: photo.uri });

        } catch (error) {
            console.error('Error capturing photo:', error);
            alert('Failed to capture photo. Please try again.');
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
            <View style={styles.container}>
                <Text style={{ textAlign: 'center', color: '#fff', marginBottom: 20 }}>
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
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            <CameraView
                ref={cameraRef}
                style={styles.camera}
                facing={facing}
                flashMode={flashMode}
            >
                {/* Top controls */}
                <View style={styles.topControls}>
                    <TouchableOpacity onPress={handleBack} style={styles.controlButton}>
                        <Ionicons name="close" size={28} color="#fff" />
                    </TouchableOpacity>

                    <View style={styles.rightControls}>
                        <TouchableOpacity onPress={toggleFlash} style={styles.controlButton}>
                            <Ionicons name={getFlashIcon()} size={24} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlButton}>
                            <Ionicons name="moon" size={24} color="#fff" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.controlButton}>
                            <Ionicons name="timer-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Center frame */}
                <View style={styles.framingContainer}>
                    <View style={styles.frame}>
                        {showOverlay && (
                            <View style={styles.overlayContainer}>
                                <MaterialCommunityIcons name="food-variant" size={24} color="#fff" />
                                <Text style={styles.overlayText}>Center your meal in frame</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Bottom controls */}
                <View style={styles.bottomControls}>
                    <View style={styles.cameraOptions}>
                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={openGallery}
                        >
                            <Ionicons name="image" size={24} color="#fff" />
                            <Text style={styles.optionText}>Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
                            <View style={styles.captureButtonInner} />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.optionButton}
                            onPress={toggleCameraFacing}
                        >
                            <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
                            <Text style={styles.optionText}>Portrait</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.modeText}>Food</Text>
                </View>
            </CameraView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
    },
    camera: {
        flex: 1,
    },
    topControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    rightControls: {
        flexDirection: 'row',
    },
    controlButton: {
        marginHorizontal: 10,
    },
    framingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    frame: {
        width: '100%',
        height: '80%',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    overlayContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        padding: 15,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    overlayText: {
        color: '#fff',
        fontSize: 16,
        marginLeft: 8,
    },
    bottomControls: {
        paddingBottom: 30,
        alignItems: 'center',
    },
    cameraOptions: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 10,
    },
    optionButton: {
        alignItems: 'center',
    },
    optionText: {
        color: '#fff',
        marginTop: 5,
    },
    captureButton: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    captureButtonInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#fff',
    },
    modeText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default SnapMealScreen;