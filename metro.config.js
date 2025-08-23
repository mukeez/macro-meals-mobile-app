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

// Apply Sentry plugin then NativeWind
module.exports = withNativeWind(withSentryConfig(config), { input: './src/globals.css' });