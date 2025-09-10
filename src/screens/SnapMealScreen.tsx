import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  Button,
  ActivityIndicator,
  Image,
} from "react-native";
import { CameraView, useCameraPermissions, CameraType } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { scanService } from "../services/scanService";
import { RootStackParamList } from "../types/navigation";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useMixpanel } from "@macro-meals/mixpanel/src";

/**
 * SnapMealScreen component allows users to take photos of their meals
 * for AI analysis of nutritional content
 */
const SnapMealScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [permission, requestPermission] = useCameraPermissions();

  const cameraRef = useRef<CameraView>(null);
  const [facing] = useState<CameraType>("back");

  const [_showOverlay, setShowOverlay] = useState(true);
  const [loading, setLoading] = useState(false);
  const [scanError, setScanError] = useState(false);
  const [_isAlertVisible, setIsAlertVisible] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const mixpanel = useMixpanel();

  useEffect(() => {
    mixpanel?.track({
      name: "meal_scan_opened",
      properties: {
        entry_point: "add_meal",
      },
    });
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

      // Set captured image to freeze camera preview
      setCapturedImage(photo.uri);

      // Prepare the file for upload
      const fileUri = photo.uri;

      // Send to API
      const data = await scanService.scanImage(fileUri);
      console.log("AI Scan Response:", data);

      if (data && data.items && data.items.length > 0) {
        mixpanel?.track({
          name: "meal_scanned",
          properties: {
            match_found: true,
            meal_name: data.items[0].name,
            calories: data.items[0].calories,
            protein_g: data.items[0].protein,
            carbs_g: data.items[0].carbs,
            fats_g: data.items[0].fat,
          },
        });
        navigation.navigate("ScannedMealBreakdownScreen", {
          meal: {
            name: data.items[0].name,
            macros: {
              calories: data.items[0].calories,
              protein: data.items[0].protein,
              carbs: data.items[0].carbs,
              fat: data.items[0].fat,
            },
            image: photo.uri,
            restaurant: {
              name: data.items[0].restaurant_name || "",
              location: data.items[0].restaurant_location || "",
            },
            items: data.items,
            detected_ingredients: data.detected_ingredients || [],
            scanned_image: data.scanned_image,
          },
        });
      } else {
        setScanError(true);
        setIsAlertVisible(true);
        setCapturedImage(null);
      }
    } catch {
      setScanError(true);
      setIsAlertVisible(true);
      setCapturedImage(null);
    } finally {
      setLoading(false);
      setCapturedImage(null);
    }
  };

  /**
   * Handle going back to previous screen
   */
  const handleBack = () => {
    mixpanel?.track({
      name: "meal_scan_back_to_add_meal",
      properties: {
        gesture_type: "button",
      },
    });
    navigation.goBack();
  };

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    mixpanel?.track({
      name: "meal_scan_permission_prompt_shown",
      properties: {},
    });
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-center mb-5">
          We need camera access to analyze your meals
        </Text>
        <Button title="Continue" onPress={requestPermission} />
      </View>
    );
  }
  useEffect(() => {
    if (permission && permission.status !== undefined) {
      mixpanel?.track({
        name: "meal_scan_permission_response",
        properties: {
          granted: permission.granted,
        },
      });
    }
  }, [permission]);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View className="flex-1 relative">
        {loading && capturedImage ? (
          <Image
            source={{ uri: capturedImage }}
            style={{ flex: 1, resizeMode: "cover" }}
          />
        ) : (
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing={facing}
            // flashMode={flashMode}
          />
        )}
        {/* Header */}
        <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between pt-4 px-4 z-10">
          <TouchableOpacity onPress={handleBack} className="p-1">
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Text className="flex-1 text-center text-white text-lg font-semibold">
            Scan a meal
          </Text>
          <View style={{ width: 28 }} />
        </View>
        {/* Overlay Corners */}
        <View className="absolute inset-0 justify-center items-center pointer-events-none">
          <View className="absolute w-[70%]" style={{ aspectRatio: 1 }}>
            <View
              className={`absolute top-0 left-0 w-12 h-12 border-t-[12px] border-l-[12px] ${
                scanError ? "border-[#DB2F2C]" : "border-white"
              } rounded-tl-lg`}
            />
            <View
              className={`absolute top-0 right-0 w-12 h-12 border-t-[12px] border-r-[12px] ${
                scanError ? "border-[#DB2F2C]" : "border-white"
              } rounded-tr-lg`}
            />
            <View
              className={`absolute bottom-0 left-0 w-12 h-12 border-b-[12px] border-l-[12px] ${
                scanError ? "border-[#DB2F2C]" : "border-white"
              } rounded-bl-lg`}
            />
            <View
              className={`absolute bottom-0 right-0 w-12 h-12 border-b-[12px] border-r-[12px] ${
                scanError ? "border-[#DB2F2C]" : "border-white"
              } rounded-br-lg`}
            />
          </View>
        </View>
        {/* Capture Button */}
        <View
          className="absolute bottom-10 left-0 right-0 items-center justify-center"
          pointerEvents="box-none"
        >
          <TouchableOpacity
            onPress={handleCapture}
            activeOpacity={0.7}
            className="w-20 h-20 bg-white rounded-full border-4 border-white items-center justify-center shadow-lg"
          >
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
          <Text
            className={`text-center text-base font-semibold ${
              scanError ? "" : "text-white"
            }`}
            style={scanError ? { color: "#DB2F2C" } : {}}
          >
            {scanError
              ? "Meal scanner not recognising food item"
              : "Center the meal within the frame to scan"}
          </Text>
          {scanError && (
            <TouchableOpacity
              className="mt-4 px-6 py-3 rounded-full bg-[#DB2F2C]"
              onPress={() => {
                setIsAlertVisible(false);
                setScanError(false);
                navigation.navigate("ScannedMealBreakdownScreen", { meal: {} });
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
