#!/usr/bin/env node

/**
 * Generate Audio Version Manifest
 * Scans Supabase rosary-audio bucket and creates a version manifest file
 * 
 * Usage:
 *   node scripts/generate-audio-manifest.js
 *   node scripts/generate-audio-manifest.js --voice alphonsus
 *   node scripts/generate-audio-manifest.js --upload
 *   node scripts/generate-audio-manifest.js --output custom-manifest.json
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing credentials. Need EXPO_PUBLIC_SUPABASE_URL and service key in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Generate version string based on current date
 */
function generateVersion() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}.${month}.${day}`;
}

/**
 * Generate hash for a file (fallback if eTag not available)
 */
function generateHash(fileName, size) {
  return crypto
    .createHash('md5')
    .update(`${fileName}-${size}`)
    .digest('hex')
    .substring(0, 12);
}

/**
 * Scan bucket and generate manifest
 */
async function generateManifest(options = {}) {
  const { voice: specificVoice, output = 'scripts/rosary-audio-version.json' } = options;

  console.log('📂 Scanning rosary-audio bucket...\n');

  const manifest = {
    version: generateVersion(),
    lastUpdated: new Date().toISOString(),
    voices: {},
  };

  // List all folders (voices) in bucket
  const { data: rootItems, error: rootError } = await supabase.storage
    .from('rosary-audio')
    .list('', { limit: 100 });

  if (rootError) {
    console.error('❌ Error listing bucket root:', rootError.message);
    process.exit(1);
  }

  // Filter to only voice folders (not files)
  const voiceFolders = rootItems.filter(item => !item.id);

  if (voiceFolders.length === 0) {
    console.error('❌ No voice folders found in bucket');
    process.exit(1);
  }

  let totalFiles = 0;

  // Scan each voice folder
  for (const folder of voiceFolders) {
    const voiceName = folder.name;

    // Skip if specific voice requested and this isn't it
    if (specificVoice && voiceName !== specificVoice) {
      continue;
    }

    console.log(`📁 Voice: ${voiceName}`);

    const { data: files, error: filesError } = await supabase.storage
      .from('rosary-audio')
      .list(voiceName, { limit: 1000 });

    if (filesError) {
      console.error(`  ❌ Error listing files: ${filesError.message}`);
      continue;
    }

    // Filter actual files (not subdirectories)
    const audioFiles = files.filter(file => file.id);

    manifest.voices[voiceName] = {
      version: manifest.version,
      fileCount: audioFiles.length,
      files: {},
    };

    // Process each file
    for (const file of audioFiles) {
      const size = file.metadata?.size || 0;
      const lastModified = file.metadata?.lastModified || file.updated_at || new Date().toISOString();
      const hash = file.metadata?.eTag || generateHash(file.name, size);

      manifest.voices[voiceName].files[file.name] = {
        size,
        lastModified,
        hash,
      };

      const sizeKB = (size / 1024).toFixed(1);
      console.log(`  ✓ ${file.name} (${sizeKB} KB)`);
    }

    console.log(`  Total: ${audioFiles.length} files\n`);
    totalFiles += audioFiles.length;
  }

  // Write manifest to file
  const outputPath = path.resolve(output);
  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2), 'utf8');

  console.log('='.repeat(60));
  console.log('📝 Generated manifest:');
  console.log(`  Version: ${manifest.version}`);
  console.log(`  Total voices: ${Object.keys(manifest.voices).length}`);
  console.log(`  Total files: ${totalFiles}`);
  console.log(`  Output: ${outputPath}`);
  console.log('='.repeat(60));

  return manifest;
}

/**
 * Upload manifest to Supabase bucket
 */
async function uploadManifest(manifest) {
  console.log('\n📤 Uploading manifest to Supabase...');

  const manifestContent = JSON.stringify(manifest, null, 2);

  const { error } = await supabase.storage
    .from('rosary-audio')
    .upload(MANIFEST_FILE, manifestContent, {
      contentType: 'application/json',
      upsert: true, // Replace existing manifest
    });

  if (error) {
    console.error('❌ Upload failed:', error.message);
    process.exit(1);
  }

  console.log('✅ Manifest uploaded successfully to bucket root');
  console.log(`   File: ${MANIFEST_FILE}`);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const options = {
    voice: null,
    output: 'scripts/rosary-audio-version.json',
    upload: false,
    help: false,
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--voice':
        options.voice = args[++i];
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--upload':
        options.upload = true;
        break;
      case '--help':
      case '-h':
        options.help = true;
        break;
      default:
        console.error(`Unknown option: ${args[i]}`);
        options.help = true;
    }
  }

  if (options.help) {
    console.log(`
Audio Manifest Generator
========================

Scans the rosary-audio bucket and generates a version manifest file.

Usage:
  node scripts/generate-audio-manifest.js [options]

Options:
  --voice <name>      Generate manifest for specific voice only
  --output <path>     Output path (default: scripts/rosary-audio-version.json)
  --upload            Auto-upload manifest to bucket after generation
  --help              Show this help message

Examples:
  # Generate manifest for all voices
  node scripts/generate-audio-manifest.js

  # Generate for specific voice
  node scripts/generate-audio-manifest.js --voice alphonsus

  # Generate and auto-upload
  node scripts/generate-audio-manifest.js --upload

  # Custom output path
  node scripts/generate-audio-manifest.js --output custom-manifest.json

Workflow:
  1. Run script to generate manifest
  2. Review the generated JSON file
  3. Manually upload to Supabase bucket root (or use --upload)
  4. App will automatically detect and download updates
`);
    process.exit(0);
  }

  try {
    // Generate manifest
    const manifest = await generateManifest(options);

    // Upload if requested
    if (options.upload) {
      await uploadManifest(manifest);
    } else {
      console.log('\n💡 To upload this manifest to Supabase, run:');
      console.log(`   node scripts/generate-audio-manifest.js --upload`);
      console.log('\n   Or manually upload the file to the bucket root.');
    }

    console.log('\n✅ Done!');
  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  }
}

// Define MANIFEST_FILE at module level for upload function
const MANIFEST_FILE = 'rosary-audio-version.json';

main();

