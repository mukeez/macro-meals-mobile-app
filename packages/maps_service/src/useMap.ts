

import { useState, useCallback } from 'react';
import { MapMarker, MapRegion } from './types';

export function useMap<T = any>(initialMarkers: MapMarker<T>[] = []) {
  const [markers, setMarkers] = useState<MapMarker<T>[]>(initialMarkers);
  const [selectedMarker, setSelectedMarker] = useState<MapMarker<T> | null>(null);
  const [region, setRegion] = useState<MapRegion | null>(null);

  const addMarker = useCallback((marker: MapMarker<T>) => {
    setMarkers(prev => [...prev, marker]);
  }, []);

  const removeMarker = useCallback((markerId: string) => {
    setMarkers(prev => prev.filter(marker => marker.id !== markerId));
  }, []);

  const updateMarker = useCallback((markerId: string, updates: Partial<MapMarker<T>>) => {
    setMarkers(prev => prev.map(marker => 
      marker.id === markerId ? { ...marker, ...updates } : marker
    ));
  }, []);

  const clearMarkers = useCallback(() => {
    setMarkers([]);
  }, []);

  const selectMarker = useCallback((marker: MapMarker<T> | null) => {
    setSelectedMarker(marker);
  }, []);

  const updateRegion = useCallback((newRegion: MapRegion) => {
    setRegion(newRegion);
  }, []);

  return {
    markers,
    selectedMarker,
    region,
    addMarker,
    removeMarker,
    updateMarker,
    clearMarkers,
    selectMarker,
    updateRegion,
    setMarkers,
  };
}