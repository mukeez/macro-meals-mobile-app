import React from 'react';

export interface Location {
  latitude: number;
  longitude: number;
}

export interface MapMarker<T = any> {
  id: string;
  coordinate: Location;
  title: string;
  description?: string;
  data: T;
  color?: string;
  icon?: string;
  size?: 'small' | 'medium' | 'large';
}

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapConfig {
  apiKey?: string;
  region?: string;
  enableLocationTracking?: boolean;
  debug?: boolean;
}

export interface MapBounds {
  northEast: Location;
  southWest: Location;
}

export interface GenericMapProps<T = any> {
  markers: MapMarker<T>[];
  region?: MapRegion;
  onMarkerPress?: (marker: MapMarker<T>) => void;
  onRegionChange?: (region: MapRegion) => void;
  onCalloutPress?: (marker: MapMarker<T>) => void;
  showUserLocation?: boolean;
  showMyLocationButton?: boolean;
  showCompass?: boolean;
  showScale?: boolean;
  mapType?: 'standard' | 'hybrid' | 'satellite' | 'terrain';
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  customMarkerRenderer?: (marker: MapMarker<T>) => React.ReactNode;
  customCalloutRenderer?: (marker: MapMarker<T>) => React.ReactNode;
  selectedMarker?: MapMarker<T> | null;
  onMarkerSelect?: (marker: MapMarker<T> | null) => void;
  // Region restriction props
  restrictToBounds?: MapBounds;
  minZoomLevel?: number;
  maxZoomLevel?: number;
  onRegionChangeComplete?: (region: MapRegion) => void;
}
