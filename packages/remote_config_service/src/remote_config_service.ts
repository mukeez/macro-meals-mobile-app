import remoteConfig, { FirebaseRemoteConfigTypes } from '@react-native-firebase/remote-config';
import {
  RemoteConfigServiceInterface,
  RemoteConfigDefaults,
  ConfigSettings,
  ConfigUpdateEvent,
  ConfigUpdateError,
  RemoteConfigListener,
  ConfigUpdateCallback,
} from './types';

class MacroMealsRemoteConfigService implements RemoteConfigServiceInterface {
  private remoteConfigInstance: FirebaseRemoteConfigTypes.Module;
  private listeners: Map<string, ConfigUpdateCallback> = new Map();
  private isInitialized: boolean = false;
  private retryAttempts: number = 0;
  private readonly maxRetryAttempts: number = 3;
  private readonly retryDelayMs: number = 1000;
  private initializationStartTime: number = 0;

  constructor() {
    this.remoteConfigInstance = remoteConfig();
    console.log('[REMOTE CONFIG] 🚀 Service instance created');
  }

  /**
   * Initialize the remote config service with defaults and settings
   */
  async initialize(defaults?: RemoteConfigDefaults, settings?: ConfigSettings): Promise<void> {
    this.initializationStartTime = Date.now();
    console.log('[REMOTE CONFIG] 🔧 Starting initialization...', {
      hasDefaults: !!defaults,
      hasSettings: !!settings,
      defaultsKeys: defaults ? Object.keys(defaults) : [],
      settings: settings ? { minimumFetchIntervalMillis: settings.minimumFetchIntervalMillis } : undefined
    });

    try {
      // Set defaults if provided
      if (defaults) {
        await this.setDefaults(defaults);
      }

      // Set config settings if provided
      if (settings) {
        await this.setConfigSettings(settings);
      }

      // Perform initial fetch and activate
      const fetchedRemotely = await this.fetchAndActivate();
      
      // Log all available values after initialization
      try {
        const allParameters = this.getAll();
        console.log('[REMOTE CONFIG] 📋 All available values after initialization:', {
          totalParameters: Object.keys(allParameters).length,
          parameterKeys: Object.keys(allParameters),
          parameterDetails: Object.entries(allParameters).reduce((acc, [key, value]) => {
            acc[key] = {
              value: value.asString(),
              source: value.getSource(),
              valueType: typeof value.asString()
            };
            return acc;
          }, {} as Record<string, any>)
        });
      } catch (error) {
        console.error('[REMOTE CONFIG] ❌ Failed to log all parameters:', error);
      }
      
      this.isInitialized = true;
      const initializationTime = Date.now() - this.initializationStartTime;
      
      console.log('[REMOTE CONFIG] ✅ Service initialized successfully', {
        initializationTimeMs: initializationTime,
        fetchedRemotely,
        isInitialized: this.isInitialized,
        activeListeners: this.listeners.size
      });
    } catch (error) {
      const initializationTime = Date.now() - this.initializationStartTime;
      console.error('[REMOTE CONFIG] ❌ Failed to initialize service:', {
        error: error instanceof Error ? error.message : String(error),
        initializationTimeMs: initializationTime,
        retryAttempts: this.retryAttempts
      });
      throw error;
    }
  }

  /**
   * Set default values for remote config parameters
   */
  async setDefaults(defaults: RemoteConfigDefaults): Promise<void> {
    console.log('[REMOTE CONFIG] 📝 Setting defaults...', {
      defaultKeys: Object.keys(defaults),
      defaultValues: Object.entries(defaults).reduce((acc, [key, value]) => {
        acc[key] = typeof value === 'string' ? value : JSON.stringify(value);
        return acc;
      }, {} as Record<string, string>)
    });

    try {
      await this.remoteConfigInstance.setDefaults(defaults);
      console.log('[REMOTE CONFIG] ✅ Defaults set successfully');
    } catch (error) {
      console.error('[REMOTE CONFIG] ❌ Failed to set defaults:', {
        error: error instanceof Error ? error.message : String(error),
        defaultKeys: Object.keys(defaults)
      });
      throw error;
    }
  }

  /**
   * Set configuration settings
   */
  async setConfigSettings(settings: ConfigSettings): Promise<void> {
    console.log('[REMOTE CONFIG] ⚙️ Updating config settings...', {
      minimumFetchIntervalMillis: settings.minimumFetchIntervalMillis,
      fetchTimeoutMillis: settings.fetchTimeoutMillis
    });

    try {
      await this.remoteConfigInstance.setConfigSettings(settings);
      console.log('[REMOTE CONFIG] ✅ Config settings updated successfully');
    } catch (error) {
      console.error('[REMOTE CONFIG] ❌ Failed to set config settings:', {
        error: error instanceof Error ? error.message : String(error),
        settings
      });
      throw error;
    }
  }

  /**
   * Fetch and activate remote config values
   */
  async fetchAndActivate(): Promise<boolean> {
    const fetchStartTime = Date.now();
    console.log('[REMOTE CONFIG] 🔄 Starting fetch and activate...');

    try {
      const fetchedRemotely = await this.remoteConfigInstance.fetchAndActivate();
      const fetchTime = Date.now() - fetchStartTime;
      
      if (fetchedRemotely) {
        console.log('[REMOTE CONFIG] ✅ Values fetched and activated from backend', {
          fetchTimeMs: fetchTime,
          source: 'remote'
        });
      } else {
        console.log('[REMOTE CONFIG] ℹ️ Values were already activated locally', {
          fetchTimeMs: fetchTime,
          source: 'local'
        });
      }
      
      this.retryAttempts = 0; // Reset retry attempts on success
      return fetchedRemotely;
    } catch (error) {
      const fetchTime = Date.now() - fetchStartTime;
      console.error('[REMOTE CONFIG] ❌ Failed to fetch and activate:', {
        error: error instanceof Error ? error.message : String(error),
        fetchTimeMs: fetchTime,
        retryAttempts: this.retryAttempts
      });
      throw error;
    }
  }

  /**
   * Fetch remote config values with optional cache expiration
   */
  async fetch(cacheExpirationSeconds?: number): Promise<void> {
    const fetchStartTime = Date.now();
    console.log('[REMOTE CONFIG] 📥 Fetching values...', {
      cacheExpirationSeconds,
      hasCustomExpiration: cacheExpirationSeconds !== undefined
    });

    try {
      if (cacheExpirationSeconds !== undefined) {
        await this.remoteConfigInstance.fetch(cacheExpirationSeconds);
      } else {
        await this.remoteConfigInstance.fetch();
      }
      
      const fetchTime = Date.now() - fetchStartTime;
      console.log('[REMOTE CONFIG] ✅ Values fetched successfully', {
        fetchTimeMs: fetchTime,
        cacheExpirationSeconds
      });
    } catch (error) {
      const fetchTime = Date.now() - fetchStartTime;
      console.error('[REMOTE CONFIG] ❌ Failed to fetch values:', {
        error: error instanceof Error ? error.message : String(error),
        fetchTimeMs: fetchTime,
        cacheExpirationSeconds
      });
      throw error;
    }
  }

  /**
   * Activate fetched remote config values
   */
  async activate(): Promise<boolean> {
    const activateStartTime = Date.now();
    console.log('[REMOTE CONFIG] 🔄 Activating values...');

    try {
      const activated = await this.remoteConfigInstance.activate();
      const activateTime = Date.now() - activateStartTime;
      
      console.log('[REMOTE CONFIG] ✅ Values activated successfully', {
        activated,
        activateTimeMs: activateTime
      });
      return activated;
    } catch (error) {
      const activateTime = Date.now() - activateStartTime;
      console.error('[REMOTE CONFIG] ❌ Failed to activate values:', {
        error: error instanceof Error ? error.message : String(error),
        activateTimeMs: activateTime
      });
      throw error;
    }
  }

  /**
   * Get a specific remote config value
   */
  getValue(key: string): FirebaseRemoteConfigTypes.ConfigValue {
    try {
      const value = this.remoteConfigInstance.getValue(key);
      const valueString = value.asString();
      const source = value.getSource();
      
      console.log(`[REMOTE CONFIG] 📖 Retrieved value for '${key}':`, {
        value: valueString,
        source,
        valueType: typeof valueString,
        valueLength: valueString.length,
        timestamp: new Date().toISOString()
      });
      
      return value;
    } catch (error) {
      console.error(`[REMOTE CONFIG] ❌ Failed to get value for '${key}':`, {
        error: error instanceof Error ? error.message : String(error),
        key,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Get all remote config parameters
   */
  getAll(): { [key: string]: FirebaseRemoteConfigTypes.ConfigValue } {
    try {
      const parameters = this.remoteConfigInstance.getAll();
      const parameterKeys = Object.keys(parameters);
      
      console.log('[REMOTE CONFIG] 📋 All parameters retrieved:', {
        totalParameters: parameterKeys.length,
        parameterKeys,
        timestamp: new Date().toISOString()
      });
      
      // Log each parameter's details
      parameterKeys.forEach(key => {
        const value = parameters[key];
        console.log(`[REMOTE CONFIG] 📋 Parameter '${key}':`, {
          value: value.asString(),
          source: value.getSource(),
          valueType: typeof value.asString()
        });
      });
      
      return parameters;
    } catch (error) {
      console.error('[REMOTE CONFIG] ❌ Failed to get all parameters:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  /**
   * Subscribe to real-time config updates with error handling and retry logic
   */
  onConfigUpdated(callback: ConfigUpdateCallback): RemoteConfigListener {
    const listenerId = `listener_${Date.now()}_${Math.random()}`;
    
    console.log('[REMOTE CONFIG] 👂 Registering config update listener:', {
      listenerId,
      totalListeners: this.listeners.size + 1
    });
    
    const wrappedCallback = async (event: any, error?: any) => {
      try {
        if (error) {
          console.error('[REMOTE CONFIG] ❌ Listener error:', {
            listenerId,
            error: error instanceof Error ? error.message : String(error),
            errorCode: error.code,
            timestamp: new Date().toISOString()
          });
          
          // Handle specific error cases
          if (error.code === 'config_update_not_fetched') {
            console.log('[REMOTE CONFIG] 🔄 Handling config_update_not_fetched error, attempting retry...', {
              listenerId,
              retryAttempts: this.retryAttempts
            });
            await this.handleConfigUpdateError();
          }
          
          const configError: ConfigUpdateError = {
            code: error.code || 'unknown_error',
            message: error.message || 'Unknown error occurred',
          };
          
          callback({ updatedKeys: [] }, configError);
          return;
        }

        // Extract updated keys from the event
        const updatedKeys = event?.updatedKeys || [];
        
        console.log('[REMOTE CONFIG] 🔄 Config update received:', {
          listenerId,
          updatedKeys,
          totalUpdatedKeys: updatedKeys.length,
          timestamp: new Date().toISOString()
        });

        // Create the event object
        const configEvent: ConfigUpdateEvent = {
          updatedKeys,
        };

        // Call the original callback
        callback(configEvent);

        // Automatically activate the new config if there are updates
        if (updatedKeys.length > 0) {
          console.log('[REMOTE CONFIG] 🔄 Activating new config values...', {
            listenerId,
            updatedKeys,
            timestamp: new Date().toISOString()
          });
          await this.activate();
        }
      } catch (callbackError) {
        console.error('[REMOTE CONFIG] ❌ Error in callback:', {
          listenerId,
          error: callbackError instanceof Error ? callbackError.message : String(callbackError),
          timestamp: new Date().toISOString()
        });
      }
    };

    // Store the callback
    this.listeners.set(listenerId, wrappedCallback);

    // Subscribe to config updates
    const unsubscribe = this.remoteConfigInstance.onConfigUpdated(wrappedCallback);

    console.log('[REMOTE CONFIG] ✅ Listener registered successfully:', {
      listenerId,
      totalListeners: this.listeners.size
    });

    return {
      unsubscribe: () => {
        try {
          unsubscribe();
          this.listeners.delete(listenerId);
          console.log('[REMOTE CONFIG] 👋 Listener unsubscribed:', {
            listenerId,
            remainingListeners: this.listeners.size,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          console.error('[REMOTE CONFIG] ❌ Error unsubscribing:', {
            listenerId,
            error: error instanceof Error ? error.message : String(error),
            timestamp: new Date().toISOString()
          });
        }
      },
    };
  }

  /**
   * Handle config update errors with retry logic
   */
  private async handleConfigUpdateError(): Promise<void> {
    if (this.retryAttempts >= this.maxRetryAttempts) {
      console.error('[REMOTE CONFIG] ❌ Max retry attempts reached:', {
        maxAttempts: this.maxRetryAttempts,
        currentAttempts: this.retryAttempts,
        timestamp: new Date().toISOString()
      });
      return;
    }

    this.retryAttempts++;
    const retryDelay = this.retryDelayMs * this.retryAttempts;
    
    console.log('[REMOTE CONFIG] 🔄 Retrying fetch:', {
      attempt: this.retryAttempts,
      maxAttempts: this.maxRetryAttempts,
      retryDelayMs: retryDelay,
      timestamp: new Date().toISOString()
    });

    try {
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Attempt to fetch and activate
      await this.fetchAndActivate();
      console.log('[REMOTE CONFIG] ✅ Retry successful:', {
        attempt: this.retryAttempts,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[REMOTE CONFIG] ❌ Retry failed:', {
        attempt: this.retryAttempts,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      
      // Recursively retry if we haven't reached max attempts
      if (this.retryAttempts < this.maxRetryAttempts) {
        await this.handleConfigUpdateError();
      }
    }
  }

  /**
   * Get the last fetch time
   */
  async getLastFetchTime(): Promise<Date | null> {
    try {
      // Note: getLastFetchTime is not available in the current version
      // This is a placeholder for future implementation
      console.warn('[REMOTE CONFIG] ⚠️ getLastFetchTime is not available in the current Firebase Remote Config version');
      return null;
    } catch (error) {
      console.error('[REMOTE CONFIG] ❌ Failed to get last fetch time:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      return null;
    }
  }

  /**
   * Get the last fetch status
   */
  async getLastFetchStatus(): Promise<number> {
    try {
      const status = this.remoteConfigInstance.lastFetchStatus;
      // Convert string status to number or return default
      const statusNumber = typeof status === 'string' ? parseInt(status, 10) || -1 : status || -1;
      
      console.log('[REMOTE CONFIG] 📊 Last fetch status:', {
        status: statusNumber,
        originalStatus: status,
        timestamp: new Date().toISOString()
      });
      
      return statusNumber;
    } catch (error) {
      console.error('[REMOTE CONFIG] ❌ Failed to get last fetch status:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
      return -1;
    }
  }

  /**
   * Get the number of active listeners
   */
  getActiveListenersCount(): number {
    const count = this.listeners.size;
    console.log('[REMOTE CONFIG] 📊 Active listeners count:', {
      count,
      timestamp: new Date().toISOString()
    });
    return count;
  }

  /**
   * Check if the service is initialized
   */
  isServiceInitialized(): boolean {
    console.log('[REMOTE CONFIG] 📊 Service initialization status:', {
      isInitialized: this.isInitialized,
      timestamp: new Date().toISOString()
    });
    return this.isInitialized;
  }

  /**
   * Debug method to log all current remote config values
   */
  debugLogAllValues(): void {
    try {
      const allParameters = this.getAll();
      console.log('[REMOTE CONFIG] 🔍 DEBUG: All current values:', {
        totalParameters: Object.keys(allParameters).length,
        parameterKeys: Object.keys(allParameters),
        parameterDetails: Object.entries(allParameters).reduce((acc, [key, value]) => {
          acc[key] = {
            value: value.asString(),
            source: value.getSource(),
            valueType: typeof value.asString(),
            asBoolean: value.asBoolean(),
            asNumber: value.asNumber()
          };
          return acc;
        }, {} as Record<string, any>),
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('[REMOTE CONFIG] ❌ Failed to debug log all values:', {
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Clean up all listeners (useful for app shutdown)
   */
  cleanup(): void {
    const listenerCount = this.listeners.size;
    this.listeners.clear();
    console.log('[REMOTE CONFIG] 🧹 Cleanup completed:', {
      clearedListeners: listenerCount,
      timestamp: new Date().toISOString()
    });
  }
}

export default new MacroMealsRemoteConfigService();