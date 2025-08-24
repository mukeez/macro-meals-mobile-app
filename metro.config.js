// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const { withSentryConfig } = require('@sentry/react-native/metro');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Monorepo/workspaces support
config.watchFolders = [path.resolve(__dirname, 'packages')];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, 'packages'),
];

// Absolute import aliases
config.resolver.extraNodeModules = {
  src: path.resolve(__dirname, 'src'),
  config: path.resolve(__dirname, 'config'),
  constants: path.resolve(__dirname, 'constants'),
};

// Platforms (keeps victory-native fallback happy)
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Override the serializer to use Metro's default instead of Sentry's custom one
config.serializer = {
  // Use Metro's default serializer instead of Sentry's custom one
  customSerializer: undefined,
};

// Sentry Metro configuration
const sentryConfig = {
  // Disable debug mode for production builds
  debug: false,
  // Suppress warnings during bundling
  silent: true,
};

// Apply Sentry plugin then NativeWind
module.exports = withNativeWind(withSentryConfig(config, sentryConfig), { input: './src/globals.css' });