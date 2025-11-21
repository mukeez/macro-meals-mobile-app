import { Mixpanel } from 'mixpanel-react-native';
import {
  MPSessionReplayConfig,
  MPSessionReplayMask,
} from '@mixpanel/react-native-session-replay';

// Re-export Session Replay types for convenience
export { MPSessionReplayMask, MPSessionReplayConfig };

export interface MixpanelConfig {
  token: string;
  debug?: boolean;
  trackAutomaticEvents?: boolean;
  optOut?: boolean;
  allowSessionReplay?: boolean;
  sessionReplayConfig?: Partial<MPSessionReplayConfig>;
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
