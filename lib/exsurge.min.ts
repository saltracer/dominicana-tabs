// Load the exsurge library as a raw string from the asset file
// Using Expo's Asset and File APIs to load the file content
import { Asset } from 'expo-asset';
import { File } from 'expo-file-system';

// Function to load the exsurge library content
export async function loadExsurgeLibrary(): Promise<string> {
  try {
    // Load the asset
    const asset = Asset.fromModule(require('../assets/javascript/exsurge.min.js.txt'));
    
    // Download/ensure the asset is available
    await asset.downloadAsync();
    
    // Read the file content as text
    if (asset.localUri) {
      const file = new File(asset.localUri);
      const content = await file.text();
      return content;
    }
    
    throw new Error('Asset localUri not available');
  } catch (error) {
    console.error('Error loading exsurge library:', error);
    throw error;
  }
}

// For synchronous usage, export empty string and load async
export let exsurge = '';

// Initialize the library on module load
loadExsurgeLibrary()
  .then((content) => {
    exsurge = content;
  })
  .catch((error) => {
    console.error('Failed to load exsurge library:', error);
  });

//# sourceMappingURL=exsurge.min.js.map