// MapProvider.tsx
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import MapsService from './maps_service';

// Type definitions
interface Restaurant {
  id: string;
  name: string;
  rating: number;
  priceLevel: number;
  vicinity: string;
  location: {
    latitude: number;
    longitude: number;
  };
  photos: string[];
  isOpen: boolean;
  types: string[];
}

interface RestaurantDetails {
  id: string;
  name: string;
  rating: number;
  priceLevel: number;
  formattedAddress: string;
  formattedPhoneNumber?: string;
  website?: string;
  openingHours?: {
    openNow: boolean;
    weekdayText: string[];
  };
  photos: string[];
  reviews: Array<{
    authorName: string;
    rating: number;
    text: string;
    time: number;
  }>;
}

interface RestaurantSearchCriteria {
  radius?: number; // in meters
  type?: string; // 'restaurant', 'food', etc.
  priceLevel?: number; // 0-4
  rating?: number; // minimum rating
  openNow?: boolean;
  keyword?: string; // specific cuisine or food type
}

interface MapConfig {
    googleMapsApiKey?: string;
    defaultRegion?: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
    enableLocationTracking?: boolean;
    debug?: boolean;
}

interface MapContextValue {
    // Service instance
    service: typeof MapsService;

    // State
    isInitialized: boolean;
    isLoading: boolean;
  error: string | null;
    
    // Location state
    currentLocation: Location.LocationObject | null;
    hasLocationPermission: boolean;

    // Map state
    mapRegion: {
        latitude: number;
        longitude: number;
        latitudeDelta: number;
        longitudeDelta: number;
    };
  
  // Restaurant state
  nearbyRestaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  isSearchingRestaurants: boolean;

    // Actions
    requestLocationPermission: () => Promise<boolean>;
    getCurrentLocation: () => Promise<Location.LocationObject | null>;
  updateMapRegion: (region: any) => void;
  centerMapOnLocation: (location: Location.LocationObject) => void;
  
  // Places/Restaurant functionality
  searchNearbyRestaurants: (criteria: RestaurantSearchCriteria) => Promise<Restaurant[]>;
  searchRestaurantsByText: (query: string) => Promise<Restaurant[]>;
  getRestaurantDetails: (placeId: string) => Promise<RestaurantDetails | null>;
  getRestaurantPhotos: (placeId: string) => Promise<string[]>;
  setSelectedRestaurant: (restaurant: Restaurant | null) => void;
  
  // Utilities
  reverseGeocode: (latitude: number, longitude: number) => Promise<string>;
  geocode: (address: string) => Promise<Location.LocationGeocodedLocation[]>;
}

const MapContext = createContext<MapContextValue | null>(null);

interface MapProviderProps {
  children: ReactNode;
  config: MapConfig;
  onLocationUpdate?: (location: Location.LocationObject) => void;
  onPermissionDenied?: () => void;
}

export const MapProvider: React.FC<MapProviderProps> = ({
  children,
  config,
  onLocationUpdate,
  onPermissionDenied,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);
  const [mapRegion, setMapRegion] = useState(config.defaultRegion || {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  // Restaurant state
  const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [isSearchingRestaurants, setIsSearchingRestaurants] = useState(false);

  // Initialize map service
  const initialize = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize maps service with config
      await MapsService.initialize(config);
      
      // Request location permission
      const hasPermission = await requestLocationPermission();
      
      if (hasPermission && config.enableLocationTracking) {
        // Get initial location
        const location = await getCurrentLocation();
        if (location) {
          setCurrentLocation(location);
          centerMapOnLocation(location);
        }
      }

      setIsInitialized(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize Maps';
      setError(errorMessage);
      console.error('Maps initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Request location permission
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      setHasLocationPermission(hasPermission);
      
      if (!hasPermission) {
        Alert.alert(
          'Location Permission Required',
          'Please enable location access to use map features.',
          [{ text: 'OK' }]
        );
        onPermissionDenied?.();
      }
      
      return hasPermission;
    } catch (err) {
      console.error('Permission request error:', err);
      return false;
    }
  };

  // Get current location
  const getCurrentLocation = async (): Promise<Location.LocationObject | null> => {
    try {
      if (!hasLocationPermission) {
        const hasPermission = await requestLocationPermission();
        if (!hasPermission) return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCurrentLocation(location);
      onLocationUpdate?.(location);
      return location;
    } catch (err) {
      console.error('Get location error:', err);
      setError('Failed to get current location');
      return null;
    }
  };

  // Update map region
  const updateMapRegion = (region: any) => {
    setMapRegion(region);
  };

  // Center map on location
  const centerMapOnLocation = (location: Location.LocationObject) => {
    const newRegion = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    setMapRegion(newRegion);
  };

  // Reverse geocoding
  const reverseGeocode = async (latitude: number, longitude: number): Promise<string> => {
    try {
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      return addresses[0]?.formattedAddress || 'Unknown location';
    } catch (err) {
      console.error('Reverse geocoding error:', err);
      return 'Unknown location';
    }
  };

  // Geocoding
  const geocode = async (address: string): Promise<Location.LocationGeocodedLocation[]> => {
    try {
      return await Location.geocodeAsync(address);
    } catch (err) {
      console.error('Geocoding error:', err);
      return [];
    }
  };

  // Restaurant functionality
  const searchNearbyRestaurants = async (criteria: RestaurantSearchCriteria): Promise<Restaurant[]> => {
    if (!currentLocation) {
      console.warn('No current location available for restaurant search');
      return [];
    }

    try {
      setIsSearchingRestaurants(true);
      setError(null);

      const apiKey = MapsService.getApiKey();
      const queryParams: Record<string, string> = {
        location: `${currentLocation.coords.latitude},${currentLocation.coords.longitude}`,
        radius: criteria.radius?.toString() || '5000',
        type: criteria.type || 'restaurant',
        key: apiKey,
      };

      if (criteria.priceLevel !== undefined) {
        queryParams.maxprice = criteria.priceLevel.toString();
      }
      if (criteria.keyword) {
        queryParams.keyword = criteria.keyword;
      }
      if (criteria.openNow) {
        queryParams.opennow = 'true';
      }

      const queryString = Object.entries(queryParams)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${queryString}`
      );
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      const restaurants = data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        rating: place.rating || 0,
        priceLevel: place.price_level || 0,
        vicinity: place.vicinity,
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        photos: place.photos?.map((photo: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${config.googleMapsApiKey}`
        ) || [],
        isOpen: place.opening_hours?.open_now || false,
        types: place.types || [],
      }));

      // Filter by minimum rating if specified
      const filteredRestaurants = criteria.rating 
        ? restaurants.filter((restaurant: Restaurant) => restaurant.rating >= criteria.rating!)
        : restaurants;

      setNearbyRestaurants(filteredRestaurants);
      return filteredRestaurants;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search restaurants';
      setError(errorMessage);
      console.error('Restaurant search error:', err);
      return [];
    } finally {
      setIsSearchingRestaurants(false);
    }
  };

  const searchRestaurantsByText = async (query: string): Promise<Restaurant[]> => {
    try {
      setIsSearchingRestaurants(true);
      setError(null);

      const apiKey = MapsService.getApiKey();
      const queryParams: Record<string, string> = {
        query: query,
        type: 'restaurant',
        key: apiKey,
      };

      const queryString = Object.entries(queryParams)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?${queryString}`
      );
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      const restaurants = data.results.map((place: any) => ({
        id: place.place_id,
        name: place.name,
        rating: place.rating || 0,
        priceLevel: place.price_level || 0,
        vicinity: place.vicinity,
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
        photos: place.photos?.map((photo: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${config.googleMapsApiKey}`
        ) || [],
        isOpen: place.opening_hours?.open_now || false,
        types: place.types || [],
      }));

      setNearbyRestaurants(restaurants);
      return restaurants;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search restaurants';
      setError(errorMessage);
      console.error('Restaurant text search error:', err);
      return [];
    } finally {
      setIsSearchingRestaurants(false);
    }
  };

  const getRestaurantDetails = async (placeId: string): Promise<RestaurantDetails | null> => {
    try {
      const apiKey = MapsService.getApiKey();
      const queryParams: Record<string, string> = {
        place_id: placeId,
        fields: 'name,rating,formatted_phone_number,formatted_address,opening_hours,photos,reviews,price_level,website',
        key: apiKey,
      };

      const queryString = Object.entries(queryParams)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?${queryString}`
      );
      const data = await response.json();

      if (data.status !== 'OK') {
        throw new Error(`Google Places API error: ${data.status}`);
      }

      const place = data.result;
      return {
        id: place.place_id,
        name: place.name,
        rating: place.rating || 0,
        priceLevel: place.price_level || 0,
        formattedAddress: place.formatted_address,
        formattedPhoneNumber: place.formatted_phone_number,
        website: place.website,
        openingHours: place.opening_hours ? {
          openNow: place.opening_hours.open_now,
          weekdayText: place.opening_hours.weekday_text || [],
        } : undefined,
        photos: place.photos?.map((photo: any) => 
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=${config.googleMapsApiKey}`
        ) || [],
        reviews: place.reviews?.map((review: any) => ({
          authorName: review.author_name,
          rating: review.rating,
          text: review.text,
          time: review.time,
        })) || [],
      };
    } catch (err) {
      console.error('Restaurant details error:', err);
      return null;
    }
  };

  const getRestaurantPhotos = async (placeId: string): Promise<string[]> => {
    const details = await getRestaurantDetails(placeId);
    return details?.photos || [];
  };

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, []);

  const contextValue: MapContextValue = {
    service: MapsService,
    isInitialized,
    isLoading,
    error,
    currentLocation,
    hasLocationPermission,
    mapRegion,
    nearbyRestaurants,
    selectedRestaurant,
    isSearchingRestaurants,
    requestLocationPermission,
    getCurrentLocation,
    updateMapRegion,
    centerMapOnLocation,
    searchNearbyRestaurants,
    searchRestaurantsByText,
    getRestaurantDetails,
    getRestaurantPhotos,
    setSelectedRestaurant,
    reverseGeocode,
    geocode,
  };

  return (
    <MapContext.Provider value={contextValue}>
      {children}
    </MapContext.Provider>
  );
};

