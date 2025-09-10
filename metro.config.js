const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add web-specific resolver configuration
config.resolver.alias = {
  ...config.resolver.alias,
  'react-dom': 'react-native-web/dist/exports/ReactDOM',
};

// Ensure web platform is supported
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

module.exports = config;