/**
 * Download Diagnostics Script
 * Run this to diagnose download metadata issues
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';

const METADATA_KEY = 'podcast_downloads_metadata';
const PODCAST_AUDIO_DIR = `${FileSystem.documentDirectory}podcasts/audio/`;

export async function diagnoseDownloads() {
  console.log('='.repeat(60));
  console.log('DOWNLOAD DIAGNOSTICS');
  console.log('='.repeat(60));

  // 1. Check AsyncStorage metadata
  console.log('\n1️⃣ CHECKING ASYNCSTORAGE METADATA');
  console.log('-'.repeat(60));
  try {
    const metadataRaw = await AsyncStorage.getItem(METADATA_KEY);
    console.log('Metadata key:', METADATA_KEY);
    console.log('Raw data exists:', !!metadataRaw);
    console.log('Raw data length:', metadataRaw?.length || 0, 'chars');
    
    if (metadataRaw) {
      const metadata = JSON.parse(metadataRaw);
      console.log('Parsed entries:', metadata.length);
      if (metadata.length > 0) {
        console.log('Sample entry:', JSON.stringify(metadata[0], null, 2));
      }
    } else {
      console.warn('⚠️ NO METADATA IN ASYNCSTORAGE');
    }
  } catch (error) {
    console.error('Error reading metadata:', error);
  }

  // 2. Check files on disk
  console.log('\n2️⃣ CHECKING FILES ON DISK');
  console.log('-'.repeat(60));
  try {
    const dirInfo = await FileSystem.getInfoAsync(PODCAST_AUDIO_DIR);
    console.log('Audio directory exists:', dirInfo.exists);
    
    if (dirInfo.exists) {
      const podcastDirs = await FileSystem.readDirectoryAsync(PODCAST_AUDIO_DIR);
      console.log('Podcast directories:', podcastDirs.length);
      
      let totalFiles = 0;
      for (const dir of podcastDirs) {
        const podcastDir = `${PODCAST_AUDIO_DIR}${dir}/`;
        const files = await FileSystem.readDirectoryAsync(podcastDir);
        console.log(`  - ${dir}: ${files.length} file(s)`);
        totalFiles += files.length;
        
        if (files.length > 0) {
          const filePath = `${podcastDir}${files[0]}`;
          const fileInfo = await FileSystem.getInfoAsync(filePath);
          console.log(`    Sample: ${files[0]} (${Math.round(fileInfo.size! / 1024 / 1024)}MB)`);
        }
      }
      
      console.log('Total audio files on disk:', totalFiles);
      
      if (totalFiles > 0) {
        console.log('\n📊 SUMMARY:');
        console.log(`  Files on disk: ${totalFiles}`);
        const metadataCount = await AsyncStorage.getItem(METADATA_KEY)
          .then(d => d ? JSON.parse(d).length : 0);
        console.log(`  Metadata entries: ${metadataCount}`);
        
        if (totalFiles > 0 && metadataCount === 0) {
          console.error('🚨 MISMATCH: Files exist but metadata is missing!');
          console.error('🚨 CAUSE: AsyncStorage was likely cleared but files were not.');
        }
      }
    }
  } catch (error) {
    console.error('Error checking files:', error);
  }

  // 3. Check all AsyncStorage keys
  console.log('\n3️⃣ CHECKING ALL ASYNCSTORAGE KEYS');
  console.log('-'.repeat(60));
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const podcastKeys = allKeys.filter(k => k.includes('podcast'));
    console.log('Total AsyncStorage keys:', allKeys.length);
    console.log('Podcast-related keys:', podcastKeys.length);
    console.log('Podcast keys:', podcastKeys);
  } catch (error) {
    console.error('Error reading keys:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('DIAGNOSTICS COMPLETE');
  console.log('='.repeat(60));
}

