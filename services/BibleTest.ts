/**
 * Bible Test Service
 * 
 * Simple test to verify Bible loading functionality
 */

import { Asset } from "expo-asset";
import { File } from "expo-file-system";
import { USXParser } from './USXParser';
import { testUSFXParser } from './USFXTest';
import { testMultiVersionBibleService } from './MultiVersionBibleTest';

export async function testBibleLoading() {
  try {
    console.log('=== Testing Bible Loading ===');
    
    // Test 1: Try to load the asset directly
    console.log('Test 1: Loading GEN.usx asset...');
    const asset = Asset.fromModule(require('../assets/bibles/douay-rheims/release/USX_1/GEN.usx'));
    console.log('Asset loaded:', asset);
    
    // Test 2: Download the asset
    console.log('Test 2: Downloading asset...');
    await asset.downloadAsync();
    console.log('Asset downloaded, localUri:', asset.localUri);
    
    // Test 3: Read the file content
    if (asset.localUri) {
      console.log('Test 3: Reading file content...');
      const file = new File(asset.localUri);
      const content = await file.text();
      console.log('File content length:', content.length);
      console.log('First 200 characters:', content.substring(0, 200));
      
      // Test 4: Parse with USXParser
      console.log('Test 4: Parsing with USXParser...');
      const parser = new USXParser();
      const result = parser.parseUSXContent(content);
      console.log('Parse result:', result.success ? 'SUCCESS' : 'FAILED');
      if (result.success && result.book) {
        console.log('Book title:', result.book.title);
        console.log('Number of chapters:', result.book.chapters.length);
        console.log('Chapter numbers:', result.book.chapters.map(c => c.number));
        if (result.book.chapters.length > 0) {
          const firstChapter = result.book.chapters[0];
          console.log('First chapter verses:', firstChapter.verses.length);
          if (firstChapter.verses.length > 0) {
            console.log('First verse:', firstChapter.verses[0].text.substring(0, 100));
          }
        }
      } else {
        console.log('Parse error:', result.error);
      }
    } else {
      console.log('No local URI available');
    }
    
    console.log('=== USX Test Complete ===');
    
    // Test USFX Parser
    console.log('\n=== Testing USFX Parser ===');
    try {
      await testUSFXParser();
      console.log('USFX Parser test completed successfully!');
    } catch (error) {
      console.error('USFX Parser test failed:', error);
    }
    
    // Test Multi-Version Bible Service
    console.log('\n=== Testing Multi-Version Bible Service ===');
    try {
      await testMultiVersionBibleService();
      console.log('Multi-Version Bible Service test completed successfully!');
    } catch (error) {
      console.error('Multi-Version Bible Service test failed:', error);
    }
    
    console.log('=== All Tests Complete ===');
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}
