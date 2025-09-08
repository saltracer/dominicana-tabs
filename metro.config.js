const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Configure resolver to handle platform-specific modules
config.resolver = {
  ...config.resolver,
  alias: {
    ...config.resolver.alias,
  },
  // Set resolver main fields for proper module resolution
  resolverMainFields: ['react-native', 'browser', 'main'],
  platforms: ['ios', 'android', 'native', 'web'],
};

// Configure transformer for optimal bundling
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Configure platform-specific module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Metro will automatically handle platform-specific file extensions
// .web.tsx for web, .native.tsx for mobile, .tsx as fallback

// Ensure proper asset handling
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

// Add Bible file extensions to asset extensions
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'usx', 'xml', 'ldml', 'vrs'
];

// Configure watchman for better performance
config.watchFolders = [__dirname];

// Add additional configuration for better bundling
config.maxWorkers = 2; // Limit workers to prevent memory issues
config.resetCache = false; // Keep cache for faster builds

module.exports = config;
