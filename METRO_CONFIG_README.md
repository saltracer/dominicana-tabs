# Metro Configuration for React Native Maps

This project includes a custom Metro configuration that properly handles `react-native-maps` for different platforms.

## Overview

The `metro.config.js` file is configured to:
- **Include** `react-native-maps` for mobile platforms (iOS, Android)
- **Exclude** `react-native-maps` from web builds by providing a mock module
- Ensure proper bundling and performance optimization

## How It Works

### Platform-Specific File Extensions

The solution uses React Native's standard platform-specific file extension approach:

1. **Platform-Specific Files**: 
   - `ProvincesMap.web.tsx` - Web-specific version (no react-native-maps)
   - `ProvincesMap.native.tsx` - Mobile version (with react-native-maps)

2. **Metro's Default Resolution**: Metro automatically chooses the right file based on platform

3. **Clean Import**: The main screen simply imports `ProvincesMap` and Metro handles the rest

4. **Standard React Native Pattern**: Uses the same approach as React Native core libraries

### Component Implementation

The main provinces screen (`app/(tabs)/community/provinces.tsx`) uses a simple import:

```typescript
// Import ProvincesMap - Metro will automatically choose the right platform-specific file
import ProvincesMap from '../../../components/ProvincesMap';
```

Metro automatically resolves to:
- `ProvincesMap.web.tsx` for web platform
- `ProvincesMap.native.tsx` for mobile platforms (iOS/Android)

The platform-specific files handle their own imports:
- `.web.tsx` uses actual provinces data with web-optimized UI (no react-native-maps)
- `.native.tsx` uses real react-native-maps for full map functionality

### Web Component Features

The `ProvincesMap.web.tsx` provides a rich web experience:

- **Search Functionality**: Search provinces by name, country, or region
- **Region Filtering**: Filter by main regions (Africa, Americas, Asia-Pacific, Europe, Oceania)
- **Interactive List**: Scrollable list with province details
- **Province Details Modal**: Click on provinces to see detailed information
- **Responsive Design**: Optimized for web browsers
- **Real Data**: Uses actual provinces data from `allProvinces`

### File Architecture

The solution uses platform-specific file extensions:
- **Web**: `ProvincesMap.web.tsx` - Web-specific version with interactive list view, search, and filtering
- **Mobile**: `ProvincesMap.native.tsx` - Mobile version with full map functionality using react-native-maps
- **Mock Module**: `react-native-maps-mock.tsx` - Provides mock components for web (used by other components if needed)
- **Main Import**: `ProvincesMap` - Metro automatically resolves to the right file

## Configuration Details

### Key Features

- **Platform Detection**: Automatically detects the target platform during bundling
- **Conditional Imports**: Handles both `require()` and `import` statements
- **Performance Optimization**: Includes caching and worker configuration
- **Asset Handling**: Properly configured for SVG and other assets

### Metro Config Options

```javascript
// Platform-specific configuration
resolverMainFields: ['react-native', 'browser', 'main']
platforms: ['ios', 'android', 'native', 'web']

// Metro automatically handles platform-specific file extensions
// .web.tsx for web, .native.tsx for mobile, .tsx as fallback

// Performance settings
maxWorkers: 2
resetCache: false

// Asset configuration
assetExts: [/* image, video, audio formats */]
sourceExts: [/* TypeScript, JavaScript, CSS formats */]
```

## Usage

### Development

The configuration works automatically with:
- `expo start` - Development server
- `expo start --web` - Web development
- `expo start --ios` - iOS development
- `expo start --android` - Android development

### Building

For production builds:
- **Web**: `expo build:web` - Uses mock module
- **Mobile**: `expo build:ios` / `expo build:android` - Uses real react-native-maps

### Code Compatibility

The components (`ProvincesMap.tsx`, `ProvincesMapMobile.tsx`) have been updated to handle platform-specific imports:

```typescript
// Updated pattern for better reliability
if (Platform.OS === 'web') {
  // Use mock module for web
  const MockMaps = require('./react-native-maps-mock');
  MapView = MockMaps.default;
  Marker = MockMaps.Marker;
  Polygon = MockMaps.Polygon;
} else {
  // Use real react-native-maps for mobile
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polygon = Maps.Polygon;
}
```

## Benefits

1. **No Bundle Errors**: Web builds won't fail due to missing react-native-maps
2. **Smaller Web Bundle**: react-native-maps is excluded from web builds
3. **Full Mobile Functionality**: Maps work normally on iOS and Android
4. **Graceful Degradation**: Web users see informative placeholders
5. **Zero Code Changes**: Existing components work without modification

## Troubleshooting

### Common Issues

1. **Metro Cache Issues**: Run `expo start --clear` to clear cache
2. **Module Resolution Errors**: Ensure `react-native-maps` is in package.json
3. **Web Build Failures**: Check that mock module exists and exports correctly

### Debug Mode

The components include console logging for debugging:
```bash
# Look for these messages in component output:
console.warn('react-native-maps not available:', error);
```

## File Structure

```
├── metro.config.js                           # Main Metro configuration
├── app/(tabs)/community/
│   └── provinces.tsx                         # Main screen with simple import
├── components/
│   ├── ProvincesMap.web.tsx                  # Web-specific version
│   ├── ProvincesMap.native.tsx               # Mobile version with maps
│   └── react-native-maps-mock.tsx            # Mock module for web
└── METRO_CONFIG_README.md                    # This documentation
```

## Dependencies

- `expo`: ~53.0.22
- `react-native-maps`: 1.20.1
- `metro-config`: Provided by Expo

## Notes

- The mock module provides a better user experience than error messages
- All react-native-maps exports are mocked to prevent import errors
- The configuration is optimized for Expo projects
- Performance settings are tuned for development and production builds
