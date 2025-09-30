interface MapsConfig {
  googleMapsApiKey?: string;
  defaultRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  enableLocationTracking?: boolean;
  debug?: boolean;
}

export class MapsService {
    private config: MapsConfig | null = null;
    private isInitialized = false;

    constructor() {
        // Don't auto-initialize, let MapProvider handle it
    }

    async initialize(config: MapsConfig): Promise<void> {
        try {
            console.log('[MAPS_SERVICE] 🔧 Initializing with config:', {
                hasApiKey: !!config.googleMapsApiKey,
                enableLocationTracking: config.enableLocationTracking,
                debug: config.debug
            });

            this.config = config;
            this.isInitialized = true;

            if (config.debug) {
                console.log('[MAPS_SERVICE] ✅ Initialized successfully');
            }
        } catch (error) {
            console.error('[MAPS_SERVICE] ❌ Initialization failed:', error);
            throw error;
        }
    }

    getConfig(): MapsConfig | null {
        return this.config;
    }

    getIsInitialized(): boolean {
        return this.isInitialized;
    }

    // Utility method to check if service is ready
    ensureInitialized(): void {
        if (!this.isInitialized || !this.config) {
            throw new Error('MapsService not initialized. Call initialize() first.');
        }
    }

    // Get API key safely
    getApiKey(): string {
        this.ensureInitialized();
        if (!this.config?.googleMapsApiKey) {
            throw new Error('Google Maps API key not configured');
        }
        return this.config.googleMapsApiKey;
    }

    // Get default region
    getDefaultRegion() {
        this.ensureInitialized();
        return this.config?.defaultRegion || {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
        };
    }

    // Check if location tracking is enabled
    isLocationTrackingEnabled(): boolean {
        return this.config?.enableLocationTracking || false;
    }

    // Check if debug mode is enabled
    isDebugMode(): boolean {
        return this.config?.debug || false;
    }
}

export default new MapsService();