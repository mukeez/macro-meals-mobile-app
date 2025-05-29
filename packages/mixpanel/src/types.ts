import { Mixpanel } from 'mixpanel-react-native';

export interface MixpanelConfig {
    token: string;
    debug?: boolean;
    trackAutomaticEvents?: boolean;
    optOut?: boolean;
}


export interface TrackEvent {
    name: string;
    properties?: Record<string, any>;
    timestamp?: number;
}


export interface UserProperties {
    [key: string]: any;
}


export type MixpanelInstance = Mixpanel;