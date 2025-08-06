import { TrackEvent } from '../types';

export const validateEvent = (event: TrackEvent): TrackEvent => {
    if (!event.name){
        throw new Error('Event name is required');
    }
    // Validate properties
    if (event.properties){
        // Remove the undefined values
        Object.keys(event.properties).forEach(key => {
            if (event.properties![key] === undefined) {
                delete event.properties![key];
            }
        });
    }
    return event;
}