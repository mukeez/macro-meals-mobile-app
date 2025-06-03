import { useContext } from 'react';
import { EVENTS } from './constants';
import { MixpanelContext } from './MixpanelProvider';
import { TrackEvent, UserProperties } from './types';
import { formatEvent } from './utils/eventFormatter';
import { validateEvent } from './utils/validation';

export const useMixpanel = ()=> {
    const mixpanel = useContext(MixpanelContext);
    console.log('[DEBUG] useMixpanel called, mixpanel:', !!mixpanel);
    
    if (!mixpanel){
        console.warn('[MIXPANEL] ⚠️  useMixpanel called but mixpanel is not available');
        return null;
    }
    
    return {
        // Track events
        track: (event: TrackEvent) => {
            try {
                const validatedEvent = validateEvent(event);
                const formattedEvent = formatEvent(validatedEvent);
                mixpanel.track(formattedEvent.name, formattedEvent.properties);
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error tracking event:', error);
            }
        },
        // Identify user
        identify: (userId: string) => {
            try {
                mixpanel.identify(userId);
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error identifying user:', error);
            }
        },
        // Set user properties
        setUserProperties: (properties: UserProperties) => {
            try {
                mixpanel.getPeople().set(properties);
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error setting user properties:', error);
            }
        },
        reset: ()=> {
            try {
                mixpanel.reset();
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error resetting:', error);
            }
        },
        // Register super properties (sent with every event)
        register: (properties: Record<string, any>) => {
            try {
                mixpanel.registerSuperProperties(properties);
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error registering properties:', error);
            }
        },
        // Register super properties only once
        registerOnce: (properties: Record<string, any>) => {
            try {
                mixpanel.registerSuperPropertiesOnce(properties);
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error registering properties once:', error);
            }
        },
        // Unregister a super property
        unregisterSuperProperty: (propertyName: string) => {
            try {
                mixpanel.unregisterSuperProperty(propertyName);
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error unregistering property:', error);
            }
        },
        // Clear all super properties
        clearSuperProperties: () => {
            try {
                mixpanel.clearSuperProperties();
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error clearing super properties:', error);
            }
        },
        trackScreen: (screenName: string, properties?: Record<string, any>)  => {
            try {
                mixpanel.track(EVENTS.SCREEN_VIEW, {
                    screen_name: screenName,
                    ...properties,
                });
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error tracking screen:', error);
            }
        }
    }
    
}