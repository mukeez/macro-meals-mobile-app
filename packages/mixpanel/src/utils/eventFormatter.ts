import { Platform } from 'react-native';
import { COMMON_PROPERTIES } from '../constants';
import { TrackEvent } from '../types';

export const formatEvent = (event: TrackEvent): TrackEvent => {
    return {
        ...event,
        properties: {
            ...event.properties,
            [COMMON_PROPERTIES.APP_VERSION]: '1.0.0', // Get this from app config
            [COMMON_PROPERTIES.PLATFORM]: Platform.OS,
            
        }
    }
}