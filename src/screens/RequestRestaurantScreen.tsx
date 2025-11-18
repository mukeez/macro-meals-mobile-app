import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IMAGE_CONSTANTS } from 'src/constants/imageConstants';
import { locationService } from 'src/services/locationService';
import { mealService } from 'src/services/mealService';
import MapsService from '../../packages/maps_service/src/maps_service';
import {
  RestaurantService,
  type AutocompletePrediction,
} from '../../packages/maps_service/src/services/restaurant_service';
import CustomSafeAreaView from '../components/CustomSafeAreaView';
import { RootStackParamList } from '../types/navigation';

const RequestRestaurantScreen: React.FC = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route =
    useRoute<RouteProp<RootStackParamList, 'RequestRestaurantScreen'>>();
  const initialName = route.params?.restaurantName ?? '';

  const [restaurantName, setRestaurantName] = useState(initialName);
  const [location, setLocation] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [autocompleteSuggestions, setAutocompleteSuggestions] = useState<
    AutocompletePrediction[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const autocompleteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const restaurantServiceRef = useRef<RestaurantService | null>(null);
  const isSelectingSuggestionRef = useRef<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const locationInputRef = useRef<TextInput>(null);
  const reasonInputRef = useRef<TextInput>(null);
  const locationInputLayout = useRef<number>(0);
  const reasonInputLayout = useRef<number>(0);
  const isSubmitDisabled =
    restaurantName.trim().length === 0 ||
    additionalInfo.trim().length < 10 ||
    additionalInfo.trim().length > 200;

  // Initialize RestaurantService with API key (lazy initialization)
  const initializeRestaurantService = () => {
    if (restaurantServiceRef.current) {
      return true; // Already initialized
    }

    try {
      // Check if MapsService is initialized
      if (!MapsService.getIsInitialized()) {
        console.log('[Autocomplete] MapsService not initialized yet');
        return false; // Not ready yet
      }

      const apiKey = MapsService.getApiKey();
      console.log('[Autocomplete] RestaurantService initialized successfully');
      restaurantServiceRef.current = new RestaurantService(apiKey);
      return true;
    } catch (error) {
      console.error('Error initializing RestaurantService:', error);
      return false;
    }
  };

  // Auto-populate location from current location on mount
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      try {
        setLocationLoading(true);
        const hasPermission = await locationService.requestPermissions();
        if (!hasPermission) {
          return;
        }

        const currentLocation = await locationService.getCurrentLocation();
        if (currentLocation) {
          const address = await locationService.reverseGeocode(
            currentLocation.coords.latitude,
            currentLocation.coords.longitude
          );
          setLocation(address);
        }
      } catch (error) {
        console.error('Error fetching current location:', error);
      } finally {
        setLocationLoading(false);
      }
    };

    fetchCurrentLocation();
  }, []);

  // Try to initialize RestaurantService on mount if MapsService is ready
  useEffect(() => {
    // Try to initialize immediately if MapsService is already ready
    const tryInitialize = () => {
      if (MapsService.getIsInitialized()) {
        initializeRestaurantService();
      } else {
        console.log(
          '[Autocomplete] MapsService not initialized in mount effect'
        );
      }
    };

    tryInitialize();

    // Also try again after a short delay in case MapsService is still initializing
    const timeoutId = setTimeout(() => {
      tryInitialize();
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
      if (autocompleteTimeoutRef.current) {
        clearTimeout(autocompleteTimeoutRef.current);
      }
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

  // Debug: Log when suggestions change
  useEffect(() => {
    console.log(
      '[Autocomplete] State update - showSuggestions:',
      showSuggestions,
      'suggestions count:',
      autocompleteSuggestions.length
    );
  }, [showSuggestions, autocompleteSuggestions]);

  // Fetch autocomplete suggestions using RestaurantService from package
  const fetchAutocompleteSuggestions = async (input: string) => {
    if (!input || input.trim().length < 2) {
      setAutocompleteSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    console.log('[Autocomplete] Fetching suggestions for:', input);

    // Lazy initialize RestaurantService when needed
    if (!initializeRestaurantService()) {
      console.log('[Autocomplete] RestaurantService not ready, retrying...');
      // Retry after a short delay if MapsService isn't ready yet
      setTimeout(() => {
        if (initializeRestaurantService() && restaurantServiceRef.current) {
          fetchAutocompleteSuggestions(input);
        }
      }, 500);
      return;
    }

    if (!restaurantServiceRef.current) {
      console.error('[Autocomplete] RestaurantService not initialized');
      return;
    }

    try {
      console.log('[Autocomplete] Calling getAutocompletePredictions...');
      const predictions =
        await restaurantServiceRef.current.getAutocompletePredictions(
          input,
          'establishment|geocode'
        );
      console.log(
        '[Autocomplete] Got predictions:',
        predictions?.length || 0,
        predictions
      );
      setAutocompleteSuggestions(predictions);
      setShowSuggestions(predictions.length > 0);
      console.log(
        '[Autocomplete] Setting showSuggestions to:',
        predictions.length > 0
      );
    } catch (error) {
      console.error('[Autocomplete] Error fetching suggestions:', error);
      setAutocompleteSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle location input change with debounce
  const handleLocationChange = (text: string) => {
    setLocation(text);
    setShowSuggestions(true);

    // Clear previous timeout
    if (autocompleteTimeoutRef.current) {
      clearTimeout(autocompleteTimeoutRef.current);
    }

    // Debounce autocomplete requests
    autocompleteTimeoutRef.current = setTimeout(() => {
      fetchAutocompleteSuggestions(text);
    }, 300);
  };

  // Handle suggestion selection
  const handleSelectSuggestion = (prediction: AutocompletePrediction) => {
    isSelectingSuggestionRef.current = true;
    // Clear any pending blur timeout
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
    setLocation(prediction.description);
    setShowSuggestions(false);
    setAutocompleteSuggestions([]);
    // Reset the flag after a delay
    setTimeout(() => {
      isSelectingSuggestionRef.current = false;
    }, 300);
  };

  const handleRequestRestaurant = async () => {
    // Client-side validation
    if (restaurantName.trim().length === 0) {
      Alert.alert('Error', 'Please enter a restaurant name.');
      return;
    }

    if (additionalInfo.trim().length < 10) {
      Alert.alert(
        'Error',
        'Please provide a reason with at least 10 characters explaining why you want this restaurant added.'
      );
      return;
    }

    if (additionalInfo.trim().length > 200) {
      Alert.alert('Error', 'Reason must be 200 characters or less.');
      return;
    }

    try {
      setLoading(true);

      // Prepare request data
      const requestData = {
        restaurant_name: restaurantName.trim(),
        location: location.trim(),
        reason: additionalInfo.trim(),
      };

      console.log('[RequestRestaurant] Sending data:', requestData);

      const response = await mealService.requestRestaurant(requestData);
      console.log('[RequestRestaurant] Response:', response);

      Alert.alert(
        'Restaurant request submitted successfully',
        'We will review your request and get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Pop 2 screens: RequestRestaurantScreen -> SearchMealAndRestaurants -> MealFinderScreen
              navigation.pop(2);
            },
          },
        ]
      );
    } catch (error: any) {
      const statusCode = error?.response?.status || 'Unknown';
      console.error(
        `[RequestRestaurant] Error (Status: ${statusCode}):`,
        error
      );

      // Extract error message from axios error
      let errorMessage =
        'Failed to submit restaurant request. Please try again.';

      if (error?.response?.data) {
        // Log full error response for debugging with status code
        console.error(
          `[RequestRestaurant] Error response (Status: ${statusCode}):`,
          error.response.data
        );

        // Try to extract a meaningful error message
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.errors) {
          // Handle validation errors
          const validationErrors = error.response.data.errors;
          errorMessage = Object.entries(validationErrors)
            .map(([field, messages]: [string, any]) => {
              const msg = Array.isArray(messages)
                ? messages.join(', ')
                : messages;
              return `${field}: ${msg}`;
            })
            .join('\n');
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CustomSafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 300,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <View className="flex-row items-center mt-2 mb-6">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="flex-row items-center justify-start h-[32px] w-[32px] rounded-full"
            >
              <Image
                source={IMAGE_CONSTANTS.backButton}
                className="w-[10px] h-[18px]"
              />
            </TouchableOpacity>
            <Text className="flex-1 text-center text-[17px] font-semibold text-[#111]">
              Request restaurant
            </Text>
            <View style={{ width: 44 }} />
          </View>

          <View className="flex-col justify-center">
            <View className="flex-row w-full justify-center mb-4">
              <View className="items-center justify-center w-[80px] h-[80px] flex-row bg-primaryLight rounded-full">
                <Image
                  source={IMAGE_CONSTANTS.missingRestaurantIcon}
                  className="w-[40px] h-[40px]"
                />
              </View>
            </View>
            <Text className="text-lg font-semibold text-center text-black mb-2">
              Missing a restaurant?
            </Text>
            <Text className="text-sm text-center text-normal text-[#4F4F4FCC] mb-8">
              Help us expand our database by suggesting a restaurant you’d like
              to see on Meal Finder.
            </Text>
          </View>

          <View className="mb-5">
            <Text className="text-xs font-semibold text-[#444] mb-2 tracking-wide">
              Restaurant name
            </Text>
            <TextInput
              value={restaurantName}
              onChangeText={setRestaurantName}
              placeholder="e.g The protein place"
              className="border border-[#E5E5E5] px-4 text-sm text-[#222] h-[68px]"
              placeholderTextColor="#A0A0A0"
              returnKeyType="next"
            />
          </View>

          <View className="mb-5">
            <Text className="text-xs font-semibold text-[#444] mb-2 tracking-wide">
              Location
            </Text>
            <View className="relative">
              <View
                className="relative"
                onLayout={event => {
                  locationInputLayout.current = event.nativeEvent.layout.y;
                }}
              >
                <TextInput
                  ref={locationInputRef}
                  value={location}
                  onChangeText={handleLocationChange}
                  onFocus={() => {
                    if (autocompleteSuggestions.length > 0) {
                      setShowSuggestions(true);
                    }
                    // Scroll to location input when focused
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({
                        y: locationInputLayout.current - 20,
                        animated: true,
                      });
                    }, 100);
                  }}
                  onBlur={() => {
                    // Delay hiding suggestions to allow for selection
                    blurTimeoutRef.current = setTimeout(() => {
                      if (!isSelectingSuggestionRef.current) {
                        setShowSuggestions(false);
                      }
                    }, 200);
                  }}
                  placeholder="45 Gainz Avenue, Strongtown"
                  className="border border-[#E5E5E5] px-4 text-sm text-[#222] h-[68px]"
                  placeholderTextColor="#A0A0A0"
                  returnKeyType="next"
                />
                {locationLoading && (
                  <View className="absolute right-4 top-0 bottom-0 justify-center">
                    <ActivityIndicator size="small" color="#888" />
                  </View>
                )}
              </View>
              {showSuggestions && autocompleteSuggestions.length > 0 && (
                <View
                  className="bg-white border-l border-r border-b border-[#E5E5E5] rounded-b-lg mt-[-1px]"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.25,
                    shadowRadius: 3.84,
                    elevation: 10,
                    maxHeight: 200,
                  }}
                >
                  {autocompleteSuggestions.map((item, index) => (
                    <TouchableOpacity
                      key={item.place_id}
                      onPress={() => handleSelectSuggestion(item)}
                      className={`px-4 py-3 ${
                        index < autocompleteSuggestions.length - 1
                          ? 'border-b border-[#F0F0F0]'
                          : ''
                      } active:bg-[#F5F5F5]`}
                    >
                      <Text className="text-sm text-[#222] font-medium">
                        {item.structured_formatting?.main_text ||
                          item.description}
                      </Text>
                      {item.structured_formatting?.secondary_text && (
                        <Text className="text-xs text-[#666] mt-1">
                          {item.structured_formatting.secondary_text}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View
            className="mb-8"
            onLayout={event => {
              reasonInputLayout.current = event.nativeEvent.layout.y;
            }}
          >
            <Text className="text-xs font-semibold text-[#444] mb-2 tracking-wide">
              Reason
            </Text>
            <TextInput
              ref={reasonInputRef}
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              placeholder="Tell us what makes this restaurant special..."
              className="border border-[#E5E5E5] px-4 text-sm text-[#222] mb-2"
              placeholderTextColor="#A0A0A0"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={200}
              style={{ minHeight: 120, paddingTop: 16, paddingBottom: 16 }}
              onFocus={() => {
                // Scroll to reason input when focused
                setTimeout(() => {
                  scrollViewRef.current?.scrollTo({
                    y: reasonInputLayout.current - 100,
                    animated: true,
                  });
                }, 100);
              }}
            />
            <Text
              className={`text-xs ${
                additionalInfo.trim().length < 10 ||
                additionalInfo.trim().length > 200
                  ? 'text-red-500'
                  : 'text-[#666]'
              }`}
            >
              {additionalInfo.trim().length < 10
                ? 'Please provide at least 10 characters'
                : additionalInfo.trim().length > 200
                  ? 'Reason must be 200 characters or less'
                  : null}
            </Text>
          </View>

          <TouchableOpacity
            onPress={handleRequestRestaurant}
            disabled={isSubmitDisabled}
            className={`h-[52px] rounded-full items-center justify-center ${
              isSubmitDisabled || loading ? 'bg-[#C9E7E2]' : 'bg-primary'
            }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-base font-semibold">
                Submit request
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </CustomSafeAreaView>
  );
};

export default RequestRestaurantScreen;
