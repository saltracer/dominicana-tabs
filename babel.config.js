module.exports = function (api) {
  api.cache.forever();
  
  // Detect if we're building for web
  const isWeb = process.env.EXPO_PLATFORM === 'web' || 
                process.env.PLATFORM === 'web';
  
  const plugins = [
    // Add reanimated plugin only for non-web platforms
    ...(!isWeb ? ['react-native-reanimated/plugin'] : []),
  ];

  return {
    presets: ['babel-preset-expo'],
    plugins,
  };
};
