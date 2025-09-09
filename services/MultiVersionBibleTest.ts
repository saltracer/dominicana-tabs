/**
 * Multi-Version Bible Service Test
 * 
 * Tests the multi-version Bible service with both Douay-Rheims and Vulgate
 */

import { multiVersionBibleService } from './MultiVersionBibleService';

export async function testMultiVersionBibleService(): Promise<void> {
  console.log('=== Multi-Version Bible Service Test ===');
  
  try {
    // Test 1: Get available versions
    console.log('\n--- Test 1: Available Versions ---');
    const versions = multiVersionBibleService.getAvailableVersions();
    console.log('Available versions:', versions.map(v => `${v.id}: ${v.name} (${v.format})`));
    
    // Test 2: Test Douay-Rheims (current default)
    console.log('\n--- Test 2: Douay-Rheims Version ---');
    console.log('Current version:', multiVersionBibleService.getCurrentVersion());
    
    const douayBooks = await multiVersionBibleService.getAvailableBooks();
    console.log(`Douay-Rheims books available: ${douayBooks.length}`);
    console.log('First 5 books:', douayBooks.slice(0, 5).map(b => `${b.code}: ${b.title}`));
    
    // Test 3: Load Genesis from Douay-Rheims
    console.log('\n--- Test 3: Load Genesis (Douay-Rheims) ---');
    try {
      const douayGenesis = await multiVersionBibleService.loadBook('GEN');
      console.log(`✅ Douay-Rheims Genesis loaded: ${douayGenesis.chapters.length} chapters`);
      console.log(`First verse: ${douayGenesis.chapters[0]?.verses[0]?.text.substring(0, 100)}...`);
    } catch (error) {
      console.log(`❌ Douay-Rheims Genesis failed: ${error}`);
    }
    
    // Test 4: Switch to Vulgate
    console.log('\n--- Test 4: Switch to Vulgate ---');
    multiVersionBibleService.setCurrentVersion('vulgate');
    console.log('Current version:', multiVersionBibleService.getCurrentVersion());
    
    const vulgateBooks = await multiVersionBibleService.getAvailableBooks();
    console.log(`Vulgate books available: ${vulgateBooks.length}`);
    console.log('First 5 books:', vulgateBooks.slice(0, 5).map(b => `${b.code}: ${b.title}`));
    
    // Test 5: Load Genesis from Vulgate
    console.log('\n--- Test 5: Load Genesis (Vulgate) ---');
    try {
      const vulgateGenesis = await multiVersionBibleService.loadBook('GEN');
      console.log(`✅ Vulgate Genesis loaded: ${vulgateGenesis.chapters.length} chapters`);
      console.log(`First verse: ${vulgateGenesis.chapters[0]?.verses[0]?.text.substring(0, 100)}...`);
    } catch (error) {
      console.log(`❌ Vulgate Genesis failed: ${error}`);
    }
    
    // Test 6: Compare first verses
    console.log('\n--- Test 6: Compare First Verses ---');
    try {
      const douayVerse = await multiVersionBibleService.getVerse('GEN', 1, 1, 'douay-rheims');
      const vulgateVerse = await multiVersionBibleService.getVerse('GEN', 1, 1, 'vulgate');
      
      console.log('Douay-Rheims Gen 1:1:', douayVerse?.text.substring(0, 100) + '...');
      console.log('Vulgate Gen 1:1:', vulgateVerse?.text.substring(0, 100) + '...');
    } catch (error) {
      console.log(`❌ Verse comparison failed: ${error}`);
    }
    
    // Test 7: Search functionality
    console.log('\n--- Test 7: Search Functionality ---');
    try {
      multiVersionBibleService.setCurrentVersion('vulgate');
      const searchResults = await multiVersionBibleService.search('Deus', 'GEN', false);
      console.log(`✅ Vulgate search for 'Deus' in Genesis: ${searchResults.length} results`);
      if (searchResults.length > 0) {
        console.log('First result:', searchResults[0].text.substring(0, 100) + '...');
      }
    } catch (error) {
      console.log(`❌ Search failed: ${error}`);
    }
    
    // Test 8: Multi-version search
    console.log('\n--- Test 8: Multi-Version Search ---');
    try {
      const multiResults = await multiVersionBibleService.searchMultipleVersions('God', ['douay-rheims', 'vulgate']);
      console.log(`✅ Multi-version search for 'God': ${multiResults.length} results`);
      console.log('Results by version:', multiResults.reduce((acc, result) => {
        acc[result.versionName] = (acc[result.versionName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>));
    } catch (error) {
      console.log(`❌ Multi-version search failed: ${error}`);
    }
    
    console.log('\n=== Multi-Version Bible Service Test Complete ===');
    
  } catch (error) {
    console.error('❌ Multi-version test failed:', error);
  }
}

// Export for use in other tests
export { testMultiVersionBibleService };
