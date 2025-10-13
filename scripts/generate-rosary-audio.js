#!/usr/bin/env node

/**
 * Rosary Audio Generation Script
 * 
 * Uses ElevenLabs API to generate high-quality audio files for rosary prayers
 * Supports three voice personas: alphonsus, catherine, and teresa
 * 
 * DATA SOURCE:
 *   Prayer texts and mystery meditations are imported from constants/rosaryData.ts
 *   This ensures a single source of truth between the app and audio generation
 *   The script uses jiti to load TypeScript files at runtime
 * 
 * REQUIREMENTS:
 *   - Node.js v14+
 *   - FFmpeg installed and in PATH
 *   - jiti npm package (npm install --save-dev jiti)
 *   - ELEVENLABS_API_KEY in .env file
 * 
 * Usage:
 *   node scripts/generate-rosary-audio.js --voice alphonsus --prayer sign-of-the-cross
 *   node scripts/generate-rosary-audio.js --voice catherine --all-prayers
 *   node scripts/generate-rosary-audio.js --all-voices --mystery joyful
 *   node scripts/generate-rosary-audio.js --batch batch-config.json
 */

require('dotenv').config();
const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const apiKey = process.env.ELEVENLABS_API_KEY;
const execAsync = promisify(exec);

// Voice ID Configuration
const VOICES = {
  alphonsus: 'VBbvpxjgHBKYsO9HhVc1',
  teresa: '0iOlWyjXD1u9VhyWAEa2',
  catherine: '96wm98vfpxxhanrSUa6p'
};

// Prayer texts and mysteries will be loaded from rosaryData.ts
// This ensures a single source of truth for all prayer content
let PRAYER_TEXTS = null;
let MYSTERIES = null;

// Load prayer data from TypeScript file
async function loadPrayerData() {
  try {
    const rosaryDataPath = path.join(__dirname, '..', 'constants', 'rosaryData.ts');
    
    // Use tsx to transpile and import TypeScript on the fly
    // This is a workaround since we're in a CommonJS environment
    const { PRAYER_TEXTS: prayers, ROSARY_MYSTERIES } = await import(`file://${rosaryDataPath}`).catch(async () => {
      // Fallback: Try to use esbuild or tsx if available, otherwise error
      console.error('⚠️  Unable to import TypeScript directly.');
      console.error('Installing tsx for TypeScript support...');
      
      // Try using jiti for runtime TypeScript support
      try {
        const jiti = require('jiti')(__filename, { interopDefault: true });
        return jiti('../constants/rosaryData.ts');
      } catch (jitiError) {
        console.error('Please install jiti: npm install --save-dev jiti');
        throw new Error('Cannot load TypeScript files. Please install jiti or tsx.');
      }
    });
    
    // Transform PRAYER_TEXTS object to match script format
    // Use _audio_text versions which have no abbreviations and ellipses instead of newlines
    PRAYER_TEXTS = {
      'sign-of-the-cross': prayers.signOfCross_audio_text,
      'apostles-creed-1': prayers.apostlesCreed_audio_text,
      'apostles-creed-2': prayers.apostlesCreed_audio_text,
      'our-father-1': prayers.ourFather_audio_text,
      'our-father-2': prayers.ourFather_audio_text,
      'our-father-3': prayers.ourFather_audio_text,
      'hail-mary-01': prayers.hailMary_audio_text,
      'hail-mary-02': prayers.hailMary_audio_text,
      'hail-mary-03': prayers.hailMary_audio_text,
      'hail-mary-04': prayers.hailMary_audio_text,
      'hail-mary-05': prayers.hailMary_audio_text,
      'hail-mary-06': prayers.hailMary_audio_text,
      'hail-mary-07': prayers.hailMary_audio_text,
      'hail-mary-08': prayers.hailMary_audio_text,
      'hail-mary-09': prayers.hailMary_audio_text,
      'hail-mary-10': prayers.hailMary_audio_text,
      'hail-mary-11': prayers.hailMary_audio_text,
      'hail-mary-12': prayers.hailMary_audio_text,
      'hail-mary-13': prayers.hailMary_audio_text,
      'hail-mary-14': prayers.hailMary_audio_text,
      'hail-mary-15': prayers.hailMary_audio_text,
      'hail-mary-16': prayers.hailMary_audio_text,
      'hail-mary-17': prayers.hailMary_audio_text,
      'hail-mary-18': prayers.hailMary_audio_text,
      'hail-mary-19': prayers.hailMary_audio_text,
      'hail-mary-20': prayers.hailMary_audio_text,
      'glory-be-1': prayers.gloryBe_audio_text,
      'glory-be-2': prayers.gloryBe_audio_text,
      'glory-be-3': prayers.gloryBe_audio_text,
      'glory-be-4': prayers.gloryBe_audio_text,
      'glory-be-5': prayers.gloryBe_audio_text,
      'fatima-prayer': prayers.fatimaPrayer_audio_text,
      'hail-holy-queen': prayers.finalPrayer_audio_text.split('...')[0] + '.', // Just the Hail Holy Queen part
      'final-prayer': prayers.finalPrayer_audio_text,
      'dominican-opening-1': prayers.dominicanOpening1_audio_text,
      'dominican-opening-2': prayers.dominicanOpening2_audio_text,
      'dominican-opening-3': prayers.dominicanOpening3_audio_text,
      'dominican-opening-glory-be': prayers.dominicanOpeningGloryBe_audio_text,
      'dominican-glory-be-1': prayers.dominicanGloryBe_audio_text,
      'dominican-glory-be-2': prayers.dominicanGloryBe_audio_text,
      'dominican-glory-be-3': prayers.dominicanGloryBe_audio_text,
      'dominican-glory-be-4': prayers.dominicanGloryBe_audio_text,
      'dominican-glory-be-5': prayers.dominicanGloryBe_audio_text,
      'alleluia': prayers.alleluia_audio_text,
      'faith-hope-charity': prayers.faithHopeCharity_audio_text
    };
    
    // Transform ROSARY_MYSTERIES to script format
    MYSTERIES = {
      joyful: ROSARY_MYSTERIES[0].mysteries.map(m => ({
        name: m.name,
        audio_text: m.audio_text,
        shortAudio_text: m.shortAudio_text
      })),
      sorrowful: ROSARY_MYSTERIES[1].mysteries.map(m => ({
        name: m.name,
        audio_text: m.audio_text,
        shortAudio_text: m.shortAudio_text
      })),
      glorious: ROSARY_MYSTERIES[2].mysteries.map(m => ({
        name: m.name,
        audio_text: m.audio_text,
        shortAudio_text: m.shortAudio_text
      })),
      luminous: ROSARY_MYSTERIES[3].mysteries.map(m => ({
        name: m.name,
        audio_text: m.audio_text,
        shortAudio_text: m.shortAudio_text
      }))
    };
    
    return true;
  } catch (error) {
    console.error('Failed to load prayer data:', error.message);
    return false;
  }
}

// Prayer texts and mysteries are now loaded from constants/rosaryData.ts
// This eliminates duplication and ensures a single source of truth

// Core prayer list
const CORE_PRAYERS = [
  'sign-of-the-cross',
  'apostles-creed-1',
  'apostles-creed-2',
  'our-father-1',
  'our-father-2',
  'our-father-3',
  'hail-mary-01',
  'hail-mary-02',
  'hail-mary-03',
  'hail-mary-04',
  'hail-mary-05',
  'hail-mary-06',
  'hail-mary-07',
  'hail-mary-08',
  'hail-mary-09',
  'hail-mary-10',
  'hail-mary-11',
  'hail-mary-12',
  'hail-mary-13',
  'hail-mary-14',
  'hail-mary-15',
  'hail-mary-16',
  'hail-mary-17',
  'hail-mary-18',
  'hail-mary-19',
  'hail-mary-20',
  'glory-be-1',
  'glory-be-2',
  'glory-be-3',
  'glory-be-4',
  'glory-be-5',
  'fatima-prayer',
  'hail-holy-queen',
  'final-prayer',
  'dominican-opening-1',
  'dominican-opening-2',
  'dominican-opening-3',
  'dominican-opening-glory-be',
  'dominican-glory-be-1',
  'dominican-glory-be-2',
  'dominican-glory-be-3',
  'dominican-glory-be-4',
  'dominican-glory-be-5',
  'alleluia',
  'faith-hope-charity'
];

class RosaryAudioGenerator {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY is required. Please set it in your .env file.');
    }
    this.client = new ElevenLabsClient({ apiKey });
    this.outputDir = path.join(__dirname, '..', 'assets', 'audio', 'rosary');
  }

  /**
   * Generate audio for a single prayer
   */
  async generatePrayer(voiceName, prayerName, options = {}) {
    const { overwrite = false, delay = 1000 } = options;

    // Validate voice
    if (!VOICES[voiceName]) {
      throw new Error(`Invalid voice: ${voiceName}. Valid voices: ${Object.keys(VOICES).join(', ')}`);
    }

    // Get prayer text
    const text = PRAYER_TEXTS[prayerName];
    if (!text) {
      throw new Error(`Invalid prayer: ${prayerName}. Valid prayers: ${Object.keys(PRAYER_TEXTS).join(', ')}`);
    }

    // Setup output path
    const voiceDir = path.join(this.outputDir, voiceName);
    if (!fs.existsSync(voiceDir)) {
      fs.mkdirSync(voiceDir, { recursive: true });
    }

    const outputFile = path.join(voiceDir, `${prayerName}.m4a`);

    // Check if file exists
    if (!overwrite && fs.existsSync(outputFile)) {
      console.log(`⏭️  Skipping ${prayerName} (already exists)`);
      return { success: true, skipped: true, file: outputFile };
    }

    console.log(`🎙️  Generating: ${voiceName}/${prayerName}...`);

    try {
      // Generate audio with ElevenLabs
      // Request MP3 at 44.1kHz to match our target M4A sample rate
      const audio = await this.client.textToSpeech.convert(VOICES[voiceName], {
        text,
        model_id: 'eleven_monolingual_v1',
        output_format: 'mp3_44100_128', // 44.1kHz MP3 at 128kbps
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      });

      // Save temporary MP3 file
      const tempMp3 = path.join(voiceDir, `${prayerName}.mp3`);
      const chunks = [];
      
      for await (const chunk of audio) {
        chunks.push(chunk);
      }
      
      const audioBuffer = Buffer.concat(chunks);
      fs.writeFileSync(tempMp3, audioBuffer);

      // Convert to M4A with 44.1kHz mono using ffmpeg
      await this.convertToM4A(tempMp3, outputFile);

      // Clean up temp file
      fs.unlinkSync(tempMp3);

      console.log(`✅ Generated: ${outputFile}`);

      // Delay to respect rate limits
      if (delay > 0) {
        await this.sleep(delay);
      }

      return { success: true, file: outputFile };
    } catch (error) {
      console.error(`❌ Error generating ${prayerName}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate audio for a mystery decade announcement
   */
  async generateMysteryDecade(voiceName, mysteryType, decadeNumber, options = {}) {
    const { overwrite = false, delay = 1000, short = false } = options;

    // Validate inputs
    if (!VOICES[voiceName]) {
      throw new Error(`Invalid voice: ${voiceName}`);
    }
    if (!MYSTERIES[mysteryType]) {
      throw new Error(`Invalid mystery type: ${mysteryType}. Valid types: ${Object.keys(MYSTERIES).join(', ')}`);
    }
    if (decadeNumber < 1 || decadeNumber > 5) {
      throw new Error('Decade number must be between 1 and 5');
    }

    const mystery = MYSTERIES[mysteryType][decadeNumber - 1];
    
    // Use the appropriate text version
    const text = short ? mystery.shortAudio_text : mystery.audio_text;
    
    if (!text) {
      throw new Error(`Missing ${short ? 'short' : 'full'} audio text for ${mysteryType} decade ${decadeNumber}`);
    }

    // Setup output
    const voiceDir = path.join(this.outputDir, voiceName);
    if (!fs.existsSync(voiceDir)) {
      fs.mkdirSync(voiceDir, { recursive: true });
    }

    const fileName = short 
      ? `${mysteryType}-decade-${decadeNumber}-short.m4a`
      : `${mysteryType}-decade-${decadeNumber}.m4a`;
    const outputFile = path.join(voiceDir, fileName);

    // Check if file exists
    if (!overwrite && fs.existsSync(outputFile)) {
      console.log(`⏭️  Skipping ${fileName} (already exists)`);
      return { success: true, skipped: true, file: outputFile };
    }

    console.log(`🎙️  Generating: ${voiceName}/${fileName}${short ? ' (short)' : ''}...`);

    try {
      // Generate audio
      // Request MP3 at 44.1kHz to match our target M4A sample rate
      const audio = await this.client.textToSpeech.convert(VOICES[voiceName], {
        text,
        model_id: 'eleven_monolingual_v1',
        output_format: 'mp3_44100_128', // 44.1kHz MP3 at 128kbps
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      });

      // Save temporary MP3
      const tempMp3File = short 
        ? `${mysteryType}-decade-${decadeNumber}-short.mp3`
        : `${mysteryType}-decade-${decadeNumber}.mp3`;
      const tempMp3 = path.join(voiceDir, tempMp3File);
      const chunks = [];
      
      for await (const chunk of audio) {
        chunks.push(chunk);
      }
      
      const audioBuffer = Buffer.concat(chunks);
      fs.writeFileSync(tempMp3, audioBuffer);

      // Convert to M4A
      await this.convertToM4A(tempMp3, outputFile);

      // Clean up
      fs.unlinkSync(tempMp3);

      console.log(`✅ Generated: ${outputFile}`);

      if (delay > 0) {
        await this.sleep(delay);
      }

      return { success: true, file: outputFile };
    } catch (error) {
      console.error(`❌ Error generating ${fileName}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Convert MP3 to M4A with specific settings
   */
  async convertToM4A(inputFile, outputFile) {
    const command = `ffmpeg -i "${inputFile}" -c:a aac -b:a 128k -ar 44100 -ac 1 "${outputFile}" -y`;
    
    try {
      await execAsync(command);
    } catch (error) {
      throw new Error(`FFmpeg conversion failed: ${error.message}`);
    }
  }

  /**
   * Generate all core prayers for a voice
   */
  async generateAllPrayers(voiceName, options = {}) {
    console.log(`\n📿 Generating all core prayers for ${voiceName}...\n`);
    
    const results = [];
    for (const prayer of CORE_PRAYERS) {
      const result = await this.generatePrayer(voiceName, prayer, options);
      results.push({ prayer, ...result });
    }

    return results;
  }

  /**
   * Generate all mysteries for a voice
   */
  async generateAllMysteries(voiceName, options = {}) {
    const short = options.short || false;
    console.log(`\n📿 Generating all ${short ? 'short ' : ''}mysteries for ${voiceName}...\n`);
    
    const results = [];
    const mysteryTypes = ['joyful', 'sorrowful', 'glorious', 'luminous'];
    
    for (const mysteryType of mysteryTypes) {
      for (let decade = 1; decade <= 5; decade++) {
        const result = await this.generateMysteryDecade(voiceName, mysteryType, decade, options);
        results.push({ mystery: `${mysteryType}-${decade}${short ? '-short' : ''}`, ...result });
      }
    }

    return results;
  }

  /**
   * Generate all short mysteries for a voice
   */
  async generateAllShortMysteries(voiceName, options = {}) {
    return this.generateAllMysteries(voiceName, { ...options, short: true });
  }

  /**
   * Generate complete rosary audio for a voice
   */
  async generateComplete(voiceName, options = {}) {
    console.log(`\n🎯 Generating complete rosary audio for ${voiceName}...\n`);
    
    const prayerResults = await this.generateAllPrayers(voiceName, options);
    const mysteryResults = await this.generateAllMysteries(voiceName, options);
    const shortMysteryResults = await this.generateAllShortMysteries(voiceName, options);
    
    return [...prayerResults, ...mysteryResults, ...shortMysteryResults];
  }

  /**
   * Generate for all voices
   */
  async generateAllVoices(options = {}) {
    const allResults = {};
    
    for (const voiceName of Object.keys(VOICES)) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Starting generation for voice: ${voiceName.toUpperCase()}`);
      console.log(`${'='.repeat(60)}\n`);
      
      allResults[voiceName] = await this.generateComplete(voiceName, options);
    }

    return allResults;
  }

  /**
   * Utility sleep function
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Print summary statistics
   */
  printSummary(results) {
    console.log('\n' + '='.repeat(60));
    console.log('GENERATION SUMMARY');
    console.log('='.repeat(60));

    if (Array.isArray(results)) {
      const successful = results.filter(r => r.success).length;
      const skipped = results.filter(r => r.skipped).length;
      const failed = results.filter(r => !r.success).length;

      console.log(`✅ Successful: ${successful}`);
      console.log(`⏭️  Skipped: ${skipped}`);
      console.log(`❌ Failed: ${failed}`);
      console.log(`📊 Total: ${results.length}`);
    } else {
      // All voices results
      for (const [voice, voiceResults] of Object.entries(results)) {
        const successful = voiceResults.filter(r => r.success).length;
        const skipped = voiceResults.filter(r => r.skipped).length;
        const failed = voiceResults.filter(r => !r.success).length;

        console.log(`\n${voice.toUpperCase()}:`);
        console.log(`  ✅ Successful: ${successful}`);
        console.log(`  ⏭️  Skipped: ${skipped}`);
        console.log(`  ❌ Failed: ${failed}`);
      }
    }

    console.log('='.repeat(60) + '\n');
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  
  // Parse arguments
  const options = {
    voice: null,
    prayer: null,
    mystery: null,
    decade: null,
    allPrayers: false,
    allMysteries: false,
    allShortMysteries: false,
    allVoices: false,
    complete: false,
    short: false,
    overwrite: false,
    delay: 1000
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--voice':
        options.voice = args[++i];
        break;
      case '--prayer':
        options.prayer = args[++i];
        break;
      case '--mystery':
        options.mystery = args[++i];
        break;
      case '--decade':
        options.decade = parseInt(args[++i]);
        break;
      case '--all-prayers':
        options.allPrayers = true;
        break;
      case '--all-mysteries':
        options.allMysteries = true;
        break;
      case '--all-short-mysteries':
        options.allShortMysteries = true;
        break;
      case '--short':
        options.short = true;
        break;
      case '--all-voices':
        options.allVoices = true;
        break;
      case '--complete':
        options.complete = true;
        break;
      case '--overwrite':
        options.overwrite = true;
        break;
      case '--delay':
        options.delay = parseInt(args[++i]);
        break;
      case '--help':
        printHelp();
        return;
    }
  }

  // Load prayer data from rosaryData.ts
  console.log('📖 Loading prayer data from rosaryData.ts...');
  const dataLoaded = await loadPrayerData();
  if (!dataLoaded) {
    console.error('❌ Error: Failed to load prayer data.');
    console.error('Please ensure constants/rosaryData.ts exists and jiti is installed.');
    console.error('Install jiti: npm install --save-dev jiti');
    process.exit(1);
  }
  console.log('✅ Prayer data loaded successfully\n');

  // Validate API key
  if (!process.env.ELEVENLABS_API_KEY) {
    console.error('❌ Error: ELEVENLABS_API_KEY not found in environment variables.');
    console.error('Please add ELEVENLABS_API_KEY=your_key_here to your .env file');
    process.exit(1);
  }

  // Check for ffmpeg
  try {
    await execAsync('ffmpeg -version');
  } catch (error) {
    console.error('❌ Error: ffmpeg is not installed or not in PATH.');
    console.error('Please install ffmpeg: https://ffmpeg.org/download.html');
    process.exit(1);
  }

  try {
    const generator = new RosaryAudioGenerator(process.env.ELEVENLABS_API_KEY);
    let results;

    // Determine what to generate
    if (options.allVoices) {
      results = await generator.generateAllVoices({ 
        overwrite: options.overwrite,
        delay: options.delay 
      });
    } else if (!options.voice) {
      console.error('❌ Error: --voice is required (or use --all-voices)');
      console.error(`Valid voices: ${Object.keys(VOICES).join(', ')}`);
      process.exit(1);
    } else if (options.complete) {
      results = await generator.generateComplete(options.voice, {
        overwrite: options.overwrite,
        delay: options.delay
      });
    } else if (options.allPrayers) {
      results = await generator.generateAllPrayers(options.voice, {
        overwrite: options.overwrite,
        delay: options.delay
      });
    } else if (options.allMysteries) {
      results = await generator.generateAllMysteries(options.voice, {
        overwrite: options.overwrite,
        delay: options.delay,
        short: options.short
      });
    } else if (options.allShortMysteries) {
      results = await generator.generateAllShortMysteries(options.voice, {
        overwrite: options.overwrite,
        delay: options.delay
      });
    } else if (options.prayer) {
      results = [await generator.generatePrayer(options.voice, options.prayer, {
        overwrite: options.overwrite,
        delay: options.delay
      })];
    } else if (options.mystery && options.decade) {
      results = [await generator.generateMysteryDecade(
        options.voice,
        options.mystery,
        options.decade,
        { overwrite: options.overwrite, delay: options.delay, short: options.short }
      )];
    } else {
      console.error('❌ Error: Please specify what to generate');
      printHelp();
      process.exit(1);
    }

    // Print summary
    generator.printSummary(results);

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
Rosary Audio Generation Script
==============================

Usage: node scripts/generate-rosary-audio.js [options]

Options:
  --voice <name>          Voice to use (alphonsus, catherine, teresa)
  --prayer <name>         Generate a single prayer
  --mystery <type>        Mystery type (joyful, sorrowful, glorious, luminous)
  --decade <number>       Decade number (1-5, use with --mystery)
  --all-prayers           Generate all core prayers
  --all-mysteries         Generate all mystery decades (full version)
  --all-short-mysteries   Generate all short mystery decades
  --short                 Generate short version (use with --mystery or --all-mysteries)
  --complete              Generate all prayers, full mysteries, and short mysteries
  --all-voices            Generate for all voices
  --overwrite             Overwrite existing files
  --delay <ms>            Delay between requests (default: 1000ms)
  --help                  Show this help message

Examples:
  # Generate a single prayer
  node scripts/generate-rosary-audio.js --voice alphonsus --prayer sign-of-the-cross

  # Generate a specific mystery decade (full version)
  node scripts/generate-rosary-audio.js --voice catherine --mystery joyful --decade 1

  # Generate a specific mystery decade (short version)
  node scripts/generate-rosary-audio.js --voice catherine --mystery joyful --decade 1 --short

  # Generate all prayers for one voice
  node scripts/generate-rosary-audio.js --voice teresa --all-prayers

  # Generate all full mysteries
  node scripts/generate-rosary-audio.js --voice alphonsus --all-mysteries

  # Generate all short mysteries
  node scripts/generate-rosary-audio.js --voice alphonsus --all-short-mysteries

  # Generate everything (prayers + full mysteries + short mysteries) for one voice
  node scripts/generate-rosary-audio.js --voice alphonsus --complete

  # Generate everything for all voices
  node scripts/generate-rosary-audio.js --all-voices

Available Prayers:
  ${CORE_PRAYERS.join(', ')}

Available Mysteries:
  joyful, sorrowful, glorious, luminous (each has 5 decades)

Voice IDs:
  alphonsus: ${VOICES.alphonsus}
  teresa: ${VOICES.teresa}
  catherine: ${VOICES.catherine}
`);
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { RosaryAudioGenerator, VOICES, PRAYER_TEXTS, MYSTERIES };

