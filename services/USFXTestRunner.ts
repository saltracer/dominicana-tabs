/**
 * USFX Test Runner
 * 
 * Simple test runner to execute USFX parser tests
 */

import { testUSFXParser } from './USFXTest';

/**
 * Run USFX parser tests
 */
export async function runUSFXTests(): Promise<void> {
  console.log('Starting USFX Parser Tests...');
  
  try {
    await testUSFXParser();
    console.log('USFX Parser Tests completed successfully!');
  } catch (error) {
    console.error('USFX Parser Tests failed:', error);
    throw error;
  }
}

// Export for use in other parts of the app
export { testUSFXParser };
