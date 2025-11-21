import {
  MPSessionReplay,
  MPSessionReplayConfig,
  MPSessionReplayMask,
} from '@mixpanel/react-native-session-replay';
import { Mixpanel } from 'mixpanel-react-native';
import React, { createContext, useEffect, useState } from 'react';
import { EVENTS } from './constants';
import { MixpanelConfig, MixpanelInstance } from './types';

console.log('[DEBUG] MixpanelProvider loaded');

export const MixpanelContext = createContext<MixpanelInstance | null>(null);

export const MixpanelProvider: React.FC<{
  config: MixpanelConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  const [mixpanel, setMixpanel] = useState<MixpanelInstance | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log(
      '[MIXPANEL] 🔧 Initializing with token:',
      config.token ? `${config.token.substring(0, 10)}...` : 'undefined'
    );

    if (
      !config.token ||
      config.token === 'undefined' ||
      config.token === 'your_actual_mixpanel_token_here'
    ) {
      console.warn('[MIXPANEL] ⚠️  Invalid or missing token:', config.token);
      setIsInitialized(true);
      return;
    }

    try {
      // Initialize main Mixpanel SDK (without session replay config)
      const instance = new Mixpanel(config.token, config.debug || false);

      instance
        .init(config.trackAutomaticEvents || false)
        .then(async () => {
          instance.track(EVENTS.APP_OPENED);
          console.log('[MIXPANEL] ✅ Main SDK initialization successful');

          // Initialize Session Replay SDK separately if enabled
          if (config.allowSessionReplay) {
            try {
              // Get distinctId from Mixpanel instance (may be async or sync)
              const distinctId = instance.getDistinctId();
              const resolvedDistinctId =
                distinctId instanceof Promise ? await distinctId : distinctId;

              console.log(
                '[MIXPANEL] 🎬 Initializing Session Replay with distinctId:',
                resolvedDistinctId
              );

              // Create Session Replay config
              const sessionReplayConfig = new MPSessionReplayConfig({
                wifiOnly: config.sessionReplayConfig?.wifiOnly ?? false,
                autoStartRecording:
                  config.sessionReplayConfig?.autoStartRecording ?? true,
                recordingSessionsPercent:
                  config.sessionReplayConfig?.recordingSessionsPercent ?? 100,
                autoMaskedViews: config.sessionReplayConfig
                  ?.autoMaskedViews ?? [
                  MPSessionReplayMask.Text,
                  MPSessionReplayMask.Image,
                ],
                flushInterval: config.sessionReplayConfig?.flushInterval ?? 10,
                enableLogging:
                  config.sessionReplayConfig?.enableLogging ?? false,
              });

              console.log('[MIXPANEL] 🎬 Session Replay Config:', {
                autoStartRecording: sessionReplayConfig.autoStartRecording,
                recordingSessionsPercent:
                  sessionReplayConfig.recordingSessionsPercent,
                wifiOnly: sessionReplayConfig.wifiOnly,
                autoMaskedViews: sessionReplayConfig.autoMaskedViews,
                flushInterval: sessionReplayConfig.flushInterval,
                enableLogging: sessionReplayConfig.enableLogging,
              });

              // Initialize Session Replay SDK
              await MPSessionReplay.initialize(
                config.token,
                resolvedDistinctId,
                sessionReplayConfig
              );

              console.log(
                '[MIXPANEL] ✅ Session Replay initialized successfully'
              );

              // Check if recording started automatically
              if (sessionReplayConfig.autoStartRecording) {
                const isRecording = await MPSessionReplay.isRecording();
                console.log(
                  '[MIXPANEL] 🎥 Session Replay recording status:',
                  isRecording ? 'Recording' : 'Not recording'
                );
              }
            } catch (sessionReplayError: any) {
              const errorMessage =
                sessionReplayError?.message || String(sessionReplayError);

              console.error(
                '[MIXPANEL] ❌ Session Replay initialization failed:',
                errorMessage
              );

              // Provide helpful guidance for common errors
              if (
                errorMessage.includes(
                  'Recording disabled by remote settings'
                ) ||
                errorMessage.includes('disabled by remote')
              ) {
                console.warn(
                  '[MIXPANEL] ⚠️  Session Replay is disabled in your Mixpanel project settings.'
                );
                console.warn('[MIXPANEL] 💡 Please check:');
                console.warn('   1. Go to your Mixpanel project Settings');
                console.warn('   2. Navigate to Session Replay section');
                console.warn('   3. Enable Session Replay for your project');
                console.warn(
                  '   4. Ensure you have React Native Session Replay Beta access'
                );
              }

              // Don't fail main initialization if session replay fails
            }
          } else {
            console.log('[MIXPANEL] ⏸️  Session Replay disabled');
          }

          setMixpanel(instance);
          setIsInitialized(true);
        })
        .catch(error => {
          console.error('[MIXPANEL] ❌ Initialization failed:', error);
          setIsInitialized(true);
        });
    } catch (error) {
      console.error('[MIXPANEL] ❌ Failed to create instance:', error);
      setIsInitialized(true);
    }

    return () => {
      // Cleanup when necessary
      if (mixpanel) {
        mixpanel.reset();
      }
    };
  }, [
    config.token,
    config.debug,
    config.trackAutomaticEvents,
    config.allowSessionReplay,
    config.sessionReplayConfig,
  ]);

  console.log(
    '[DEBUG] MixpanelProvider rendered, mixpanel:',
    !!mixpanel,
    'isInitialized:',
    isInitialized
  );

  // Only render children when initialization is complete to prevent hook order issues
  if (!isInitialized) {
    return null;
  }

  return (
    <MixpanelContext.Provider value={mixpanel}>
      {children}
    </MixpanelContext.Provider>
  );
};
