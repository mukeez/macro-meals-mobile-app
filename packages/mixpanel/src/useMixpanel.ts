import { useContext } from 'react';
import { EVENTS } from './constants';
import { MixpanelContext } from './MixpanelProvider';
import { TrackEvent, UserProperties } from './types';
import { formatEvent } from './utils/eventFormatter';
import { validateEvent } from './utils/validation';

export const useMixpanel = ()=> {
    const mixpanel = useContext(MixpanelContext);
    console.log('[DEBUG] useMixpanel called, mixpanel:', mixpanel);
    if (!mixpanel){
        throw new Error('useMixpanel must be used within a MixpanelProvider');
    }
    return {
        // Track events
        track: (event: TrackEvent) => {
            const validatedEvent = validateEvent(event);
            const formattedEvent = formatEvent(validatedEvent);
            mixpanel.track(formattedEvent.name, formattedEvent.properties);
        },
        // Identify user
        identify: (userId: string) => {
            mixpanel.identify(userId);
        },
        // Set user properties
        setUserProperties: (properties: UserProperties) => {
            mixpanel.getPeople().set(properties);
        },
        retet: ()=> {
            mixpanel.reset();
        },
        trackScreen: (screenName: string, properties?: Record<string, any>)  => {
            mixpanel.track(EVENTS.SCREEN_VIEW, {
                screen_name: screenName,
                ...properties,
            })
        }
    }
    
}