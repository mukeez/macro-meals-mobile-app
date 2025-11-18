import { Mixpanel } from 'mixpanel-react-native';

export interface MixpanelConfig {
  token: string;
  debug?: boolean;
  trackAutomaticEvents?: boolean;
  optOut?: boolean;
  allowSessionReplay?: boolean;
  sessionReplayConfig?: Partial<MixpanelSessionReplayConfig>;
}

export interface TrackEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
}

export interface UserProperties {
  [key: string]: any;
}

export enum MPSessionReplayMask {
  Text = 'text', // Text inputs and labels
  Web = 'web', // WebView content
  Map = 'map', // Map views (iOS only)
  Image = 'image', // Image components
}

export interface MixpanelSessionReplayConfig {
  wifiOnly?: boolean;
  autoStartRecording?: boolean;
  recordingSessionsPercent: number;
  autoMaskedViews: MPSessionReplayMask[];
  flushInterval: number;
  enableLogging: boolean;
}

export type MixpanelInstance = Mixpanel;
