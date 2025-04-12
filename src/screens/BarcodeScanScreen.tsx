import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
    Alert
} from 'react-native';
import { Camera, CameraType, BarCodeScanningResult } from 'expo-camera';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

export const BarcodeScanScreen: React.FC = () => {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [type, setType] = useState(CameraType.back);
    const [scannedData, setScannedData] = useState<string | null>(null);
    const navigation = useNavigation();

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = ({ type, data }: BarCodeScanningResult) => {
        setScannedData(data);
        // You can add more specific handling based on barcode type
        Alert.alert(
            'Barcode Scanned',
            `Type: ${type}\nData: ${data}`,
            [
                {
                    text: 'OK',
                    onPress: () => {
                        // Process the scanned barcode
                        // For example, look up a food item, log a meal, etc.
                        console.log('Scanned barcode:', data);
                    }
                }
            ]
        );
    };

    const pickImageFromGallery = async () => {
        // Request gallery permissions
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Sorry', 'We need camera roll permissions to make this work!');
            return;
        }

        // Launch image picker
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
        });

        if (!result.canceled) {
            // Here you would typically process the selected image for barcode scanning
            console.log('Image picked:', result.assets[0].uri);
        }
    };

    const toggleCameraType = () => {
        setType(current =>
            current === CameraType.back ? CameraType.front : CameraType.back
        );
    };

    if (hasPermission === null) {
        return <View style={styles.container}><Text>Requesting camera permission...</Text></View>;
    }
    if (hasPermission === false) {
        return <View style={styles.container}>
            <Text>No access to camera</Text>
            <TouchableOpacity
                style={styles.permissionButton}
                onPress={() => Camera.requestCameraPermissionsAsync()}
            >
                <Text style={styles.permissionButtonText}>Grant Permission</Text>
            </TouchableOpacity>
        </View>;
    }

    return (
        <View style={styles.container}>
            <Camera
                style={styles.camera}
                type={type}
                barCodeScannerSettings={{
                    barCodeTypes: [
                        'qr',
                        'pdf417',
                        'ean13',
                        'ean8',
                        'code39',
                        'code128'
                    ]
                }}
                onBarCodeScanned={scannedData ? undefined : handleBarCodeScanned}
            >
                <View style={styles.overlay}>
                    <View style={styles.scanFrame} />
                    <Text style={styles.instructionText}>
                        Center the barcode within the frame to scan
                    </Text>
                </View>
            </Camera>

            <View style={styles.bottomNavigation}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Icon name="home-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={toggleCameraType}
                >
                    <Icon name="camera-reverse-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Flip</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={pickImageFromGallery}
                >
                    <Icon name="image-outline" size={24} color="#666" />
                    <Text style={styles.navText}>Gallery</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    scanFrame: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#19a28f',
        backgroundColor: 'transparent',
    },
    instructionText: {
        color: 'white',
        marginTop: 20,
        fontSize: 16,
        textAlign: 'center',
    },
    bottomNavigation: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'white',
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    navItem: {
        alignItems: 'center',
    },
    navText: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
    },
    permissionButton: {
        backgroundColor: '#19a28f',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
    },
    permissionButtonText: {
        color: 'white',
        textAlign: 'center',
    },
});

export default BarcodeScanScreen;