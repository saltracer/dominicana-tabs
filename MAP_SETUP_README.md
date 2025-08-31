# Map Setup Instructions

## Issue
The Android app crashes when attempting to view maps. This is likely due to missing Google Maps API key configuration.

## Solution Steps

### 1. Get a Google Maps API Key
1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS (if you plan to support iOS)
4. Create credentials (API Key)
5. Restrict the API key to your app's package name for security

### 2. Update Configuration Files

#### Update app.json
Replace `YOUR_GOOGLE_MAPS_API_KEY_HERE` in `app.json` with your actual API key:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ACTUAL_API_KEY_HERE"
        }
      }
    },
    "plugins": [
      [
        "react-native-maps",
        {
          "googleMapsApiKey": "YOUR_ACTUAL_API_KEY_HERE"
        }
      ]
    ]
  }
}
```

### 3. Rebuild the App
After updating the API key:

```bash
# Clear cache and rebuild
expo start --clear
# Or for a fresh build
expo run:android
```

### 4. Test the Map
1. Navigate to the Community tab
2. Tap on "Provinces" 
3. The map should load without crashing

### 5. Debugging
If issues persist:

1. **Test with Simple Map**: Navigate to `/community/map-test` to test a basic map
2. **Check Logs**: Look for map-related errors in the console
3. **Verify API Key**: Ensure the API key is valid and has the correct permissions
4. **Check Internet**: Ensure the device has internet connectivity

### 6. Common Issues

#### "Maps are not available on this device"
- Check if `react-native-maps` is properly installed
- Verify the API key is correctly configured
- Ensure internet connectivity

#### "Map Error" Alert
- Verify the Google Maps API key is valid
- Check if the Maps SDK for Android is enabled in Google Cloud Console
- Ensure the API key has the correct restrictions

#### App Crashes on Map Load
- Most likely due to missing or invalid API key
- Check the Android logs for specific error messages
- Verify the app has internet permissions

### 7. Alternative Solutions

If Google Maps continues to cause issues, consider:
1. Using a different map provider (Mapbox, OpenStreetMap)
2. Implementing a fallback to a list view
3. Using a web-based map solution

## Files Modified
- `app.json` - Added Google Maps API key configuration
- `components/ProvincesMap/ProvincesMap.native.tsx` - Added better error handling
- `components/SimpleMapTest.tsx` - Created simple test component
- `app/(tabs)/community/map-test.tsx` - Created test screen
