import * as Location from 'expo-location';
import { Alert } from 'react-native';

/**
 * Location service for handling geolocation in the app
 */
export const locationService = {
    /**
     * Request location permissions
     * @returns {Promise<boolean>} Whether permissions were granted
     */
    requestPermissions: async (): Promise<boolean> => {
        try {
            const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();

            if (foregroundStatus !== 'granted') {
                const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
                return backgroundStatus === 'granted';
            }

            return foregroundStatus === 'granted';
        } catch (error) {
            console.error('Error requesting location permissions:', error);
            return false;
        }
    },

    /**
     * Get current device location
     * @returns {Promise<Location.LocationObject | null>} Location data or null
     */
    getCurrentLocation: async (): Promise<Location.LocationObject | null> => {
        try {
            // Check permissions first
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert(
                    'Location Access Needed',
                    'Please enable location services to find nearby meals.',
                    [{ text: 'OK' }]
                );
                return null;
            }

            // Check if location services are enabled
            const isEnabled = await Location.hasServicesEnabledAsync();
            if (!isEnabled) {
                Alert.alert(
                    'Location Services Disabled',
                    'Please enable location services in your device settings.',
                    [{ text: 'OK' }]
                );
                return null;
            }

            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced // Changed from High to Balanced for better reliability
            });

            // Log the coordinates for debugging
            console.log('Location obtained:', {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy,
                timestamp: new Date(location.timestamp).toISOString()
            });

            // Validate coordinates (basic sanity check)
            if (location.coords.latitude === 0 && location.coords.longitude === 0) {
                console.warn('Received zero coordinates - likely invalid location');
                return null;
            }

            return location;
        } catch (error) {
            console.error('Error getting current location:', error);

            if (error instanceof Error) {
                Alert.alert(
                    'Location Error',
                    error.message || 'Could not retrieve your location.',
                    [{ text: 'OK' }]
                );
            }

            return null;
        }
    },

    /**
     * Reverse geocode coordinates to get human-readable address
     * @param latitude
     * @param longitude
     * @returns {Promise<string>} Formatted address
     */
    reverseGeocode: async (
        latitude: number,
        longitude: number
    ): Promise<string> => {
        try {
            console.log('Reverse geocoding coordinates:', { latitude, longitude });

            // First try Expo's built-in reverse geocoding
            try {
                const expoAddresses = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude
                });

                if (expoAddresses && expoAddresses.length > 0) {
                    const address = expoAddresses[0];
                    let locationString = '';

                    // Build address string from Expo's data
                    if (address.street) {
                        locationString += address.street;
                    }
                    if (address.city) {
                        locationString += locationString ? `, ${address.city}` : address.city;
                    }
                    if (address.region) {
                        locationString += locationString ? `, ${address.region}` : address.region;
                    }
                    if (address.country) {
                        locationString += locationString ? `, ${address.country}` : address.country;
                    }

                    if (locationString) {
                        console.log('Expo reverse geocoding result:', locationString);
                        return locationString;
                    }
                }
            } catch (expoError) {
                console.log('Expo reverse geocoding failed, trying OpenStreetMap:', expoError);
            }

            // Fallback to OpenStreetMap
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
                {
                    headers: {
                        'User-Agent': 'MacroMeals/1.0'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Geocoding request failed');
            }

            const data = await response.json();
            console.log('OpenStreetMap geocoding response:', data);

            // Extract street-level details
            const address = data.address;

            // Construct a street-level address
            let streetLevelLocation = '';

            // Prioritize most specific address components
            if (address.road) {
                streetLevelLocation += address.road;
            }

            if (address.house_number) {
                streetLevelLocation = `${address.house_number} ${streetLevelLocation}`;
            }

            if (address.suburb) {
                streetLevelLocation += `, ${address.suburb}`;
            }

            if (address.city || address.town) {
                streetLevelLocation += `, ${address.city || address.town}`;
            }

            if (address.country) {
                streetLevelLocation += `, ${address.country}`;
            }

            if (!streetLevelLocation) {
                streetLevelLocation = data.display_name ||
                    `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            }

            console.log('Final geocoding result:', streetLevelLocation);
            return streetLevelLocation.trim();
        } catch (error) {
            console.error('Reverse geocoding error:', error);

            return `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        }
    },
    /**
     * Calculate distance between two coordinates
     * @param lat1 First latitude
     * @param lon1 First longitude
     * @param lat2 Second latitude
     * @param lon2 Second longitude
     * @returns Distance in kilometers
     */
    calculateDistance: (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number => {
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }



};