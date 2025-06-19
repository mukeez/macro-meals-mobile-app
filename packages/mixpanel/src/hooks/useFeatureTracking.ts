import { EVENTS } from '../constants';
import { useMixpanel } from '../useMixpanel';


export const useFeatureTracking =  (featureName: string) => {
    const mixpanel = useMixpanel();

    return {
        trackFeatureUse: (properties?: Record<string, any>)=> {
            mixpanel.track({
                name: EVENTS.FEATURE_USED,
                properties: {
                    feature: featureName,
                    ...properties,
                }
            });
        },
    };
};