import { MPSessionReplay } from '@mixpanel/react-native-session-replay';
import { useCallback, useContext } from 'react';
import { MixpanelContext } from './MixpanelProvider';

/**
 * Hook to manually control Session Replay recording
 *
 * @example
 * ```tsx
 * const { startRecording, stopRecording, isRecording } = useSessionReplay();
 *
 * // Start recording manually
 * await startRecording();
 *
 * // Check if recording
 * const recording = await isRecording();
 *
 * // Stop recording
 * await stopRecording();
 * ```
 */
export const useSessionReplay = () => {
  const mixpanel = useContext(MixpanelContext);

  /**
   * Start session replay recording
   */
  const startRecording = useCallback(async (): Promise<void> => {
    if (!mixpanel) {
      console.warn(
        '[MIXPANEL] ⚠️  Cannot start recording: Mixpanel not initialized'
      );
      return;
    }

    try {
      await MPSessionReplay.startRecording();
      console.log('[MIXPANEL] 🎬 Session Replay recording started');
    } catch (error) {
      console.error('[MIXPANEL] ❌ Error starting recording:', error);
    }
  }, [mixpanel]);

  /**
   * Stop session replay recording
   */
  const stopRecording = useCallback(async (): Promise<void> => {
    if (!mixpanel) {
      console.warn(
        '[MIXPANEL] ⚠️  Cannot stop recording: Mixpanel not initialized'
      );
      return;
    }

    try {
      await MPSessionReplay.stopRecording();
      console.log('[MIXPANEL] ⏸️  Session Replay recording stopped');
    } catch (error) {
      console.error('[MIXPANEL] ❌ Error stopping recording:', error);
    }
  }, [mixpanel]);

  /**
   * Check if session replay is currently recording
   */
  const isRecording = useCallback(async (): Promise<boolean> => {
    if (!mixpanel) {
      return false;
    }

    try {
      const recording = await MPSessionReplay.isRecording();
      return recording;
    } catch (error) {
      console.error('[MIXPANEL] ❌ Error checking recording status:', error);
      return false;
    }
  }, [mixpanel]);

  /**
   * Update the distinctId for Session Replay when user is identified
   */
  const identify = useCallback(
    async (distinctId: string): Promise<void> => {
      if (!mixpanel) {
        console.warn(
          '[MIXPANEL] ⚠️  Cannot identify: Mixpanel not initialized'
        );
        return;
      }

      try {
        await MPSessionReplay.identify(distinctId);
        console.log(
          '[MIXPANEL] 👤 Session Replay identified user:',
          distinctId
        );
      } catch (error) {
        console.error(
          '[MIXPANEL] ❌ Error identifying in Session Replay:',
          error
        );
      }
    },
    [mixpanel]
  );

  return {
    startRecording,
    stopRecording,
    isRecording,
    identify,
  };
};
