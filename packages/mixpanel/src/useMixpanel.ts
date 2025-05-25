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
                console.log('[MIXPANEL] 📊 Tracking event:', event.name, event.properties);
                const validatedEvent = validateEvent(event);
                const formattedEvent = formatEvent(validatedEvent);
                mixpanel.track(formattedEvent.name, formattedEvent.properties);
                console.log('[MIXPANEL] ✅ Event sent successfully');
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error tracking event:', error);
            }
        },
        // Identify user
        identify: (userId: string) => {
            try {
                console.log('[MIXPANEL] 👤 Identifying user:', userId);
                mixpanel.identify(userId);
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error identifying user:', error);
            }
        },
        // Set user properties
        setUserProperties: (properties: UserProperties) => {
            try {
                console.log('[MIXPANEL] 📝 Setting user properties:', properties);
                mixpanel.getPeople().set(properties);
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error setting user properties:', error);
            }
        },
        reset: ()=> {
            try {
                console.log('[MIXPANEL] 🔄 Resetting');
                mixpanel.reset();
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error resetting:', error);
            }
        },
        // Register super properties (sent with every event)
        register: (properties: Record<string, any>) => {
            try {
                console.log('[MIXPANEL] 🔧 Registering super properties:', properties);
                mixpanel.registerSuperProperties(properties);
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error registering properties:', error);
            }
        },
        // Register super properties only once
        registerOnce: (properties: Record<string, any>) => {
            try {
                console.log('[MIXPANEL] 🔧 Registering super properties once:', properties);
                mixpanel.registerSuperPropertiesOnce(properties);
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error registering properties once:', error);
            }
        },
        // Unregister a super property
        unregisterSuperProperty: (propertyName: string) => {
            try {
                console.log('[MIXPANEL] 🗑️ Unregistering super property:', propertyName);
                mixpanel.unregisterSuperProperty(propertyName);
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error unregistering property:', error);
            }
        },
        // Clear all super properties
        clearSuperProperties: () => {
            try {
                console.log('[MIXPANEL] 🧹 Clearing all super properties');
                mixpanel.clearSuperProperties();
            } catch (error) {
                console.error('[MIXPANEL] ❌ Error clearing super properties:', error);
            }
        },
        trackScreen: (screenName: string, properties?: Record<string, any>)  => {
            try {
                console.log('[MIXPANEL] 📱 Tracking screen view:', screenName, properties);
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