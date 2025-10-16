import { supabase } from '../lib/supabase';

export interface AudioFile {
  name: string;
  path: string;
  size: number;
  lastModified: string;
  hash: string;
  metadata?: AudioMetadata;
}

export interface AudioMetadata {
  voice_name: string;
  file_name: string;
  file_type: 'prayer' | 'mystery';
  mystery_type?: 'joyful' | 'sorrowful' | 'glorious' | 'luminous';
  file_size?: number;
  duration?: number;
  uploaded_by?: string;
}

export interface VoiceManifest {
  version: string;
  fileCount: number;
  files: Record<string, {
    size: number;
    lastModified: string;
    hash: string;
  }>;
}

export interface RosaryManifest {
  version: string;
  lastUpdated: string;
  voices: Record<string, VoiceManifest>;
}

/**
 * Admin service for managing rosary audio files
 * Includes automatic manifest generation and upload
 */
export class AdminRosaryService {
  private static readonly BUCKET_NAME = 'rosary-audio';
  private static readonly MANIFEST_FILE = 'rosary-audio-version.json';

  /**
   * List all voice folders in the bucket
   */
  static async listVoices(): Promise<string[]> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .list('', { limit: 100 });

    if (error) {
      console.error('Error listing voices:', error);
      throw new Error(`Failed to list voices: ${error.message}`);
    }

    // Filter to only folders (voices have no file extension)
    const voices = (data || [])
      .filter(item => !item.id) // Folders don't have IDs
      .map(item => item.name);

    return voices;
  }

  /**
   * Get all audio files for a specific voice
   */
  static async getVoiceFiles(voice: string): Promise<AudioFile[]> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .list(voice, { limit: 1000 });

    if (error) {
      console.error('Error listing voice files:', error);
      throw new Error(`Failed to list voice files: ${error.message}`);
    }

    // Filter actual files (not subdirectories)
    const files = (data || [])
      .filter(file => file.id) // Files have IDs
      .map(file => ({
        name: file.name,
        path: `${voice}/${file.name}`,
        size: file.metadata?.size || 0,
        lastModified: file.metadata?.lastModified || file.updated_at || new Date().toISOString(),
        hash: file.metadata?.eTag || this.generateHash(file.name, file.metadata?.size || 0),
      }));

    // Try to get metadata from database
    const { data: metadataList } = await supabase
      .from('rosary_audio_metadata')
      .select('*')
      .eq('voice_name', voice);

    // Merge metadata
    const filesWithMetadata = files.map(file => {
      const metadata = metadataList?.find(m => m.file_name === file.name);
      return {
        ...file,
        metadata: metadata ? {
          voice_name: metadata.voice_name,
          file_name: metadata.file_name,
          file_type: metadata.file_type,
          mystery_type: metadata.mystery_type,
          file_size: metadata.file_size,
          duration: metadata.duration,
          uploaded_by: metadata.uploaded_by,
        } : undefined,
      };
    });

    return filesWithMetadata;
  }

  /**
   * Upload audio file to storage
   */
  static async uploadAudioFile(
    voice: string,
    fileName: string,
    file: File | Blob,
    metadata: Omit<AudioMetadata, 'voice_name' | 'file_name'>
  ): Promise<void> {
    const filePath = `${voice}/${fileName}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, file, {
        upsert: true,
        contentType: 'audio/mp4',
      });

    if (uploadError) {
      console.error('Error uploading audio file:', uploadError);
      throw new Error(`Failed to upload audio file: ${uploadError.message}`);
    }

    // Save metadata to database
    const { error: metadataError } = await supabase
      .from('rosary_audio_metadata')
      .upsert({
        voice_name: voice,
        file_name: fileName,
        file_path: filePath,
        file_type: metadata.file_type,
        mystery_type: metadata.mystery_type,
        file_size: file.size,
        duration: metadata.duration,
        uploaded_by: metadata.uploaded_by,
      }, {
        onConflict: 'voice_name,file_name',
      });

    if (metadataError) {
      console.error('Error saving metadata:', metadataError);
      // Don't throw - file is uploaded, metadata is optional
    }

    // Regenerate and upload manifest
    await this.regenerateManifest();
  }

  /**
   * Delete audio file from storage
   */
  static async deleteAudioFile(voice: string, fileName: string): Promise<void> {
    const filePath = `${voice}/${fileName}`;

    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting audio file:', error);
      throw new Error(`Failed to delete audio file: ${error.message}`);
    }

    // Delete metadata from database
    await supabase
      .from('rosary_audio_metadata')
      .delete()
      .eq('voice_name', voice)
      .eq('file_name', fileName);

    // Regenerate and upload manifest
    await this.regenerateManifest();
  }

  /**
   * Create a new voice folder
   */
  static async createVoice(name: string): Promise<void> {
    // Create a placeholder file to establish the folder
    const placeholderPath = `${name}/.placeholder`;
    const placeholderContent = new Blob([''], { type: 'text/plain' });

    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(placeholderPath, placeholderContent);

    if (error) {
      console.error('Error creating voice:', error);
      throw new Error(`Failed to create voice: ${error.message}`);
    }
  }

  /**
   * Delete an entire voice folder
   */
  static async deleteVoice(name: string): Promise<void> {
    // List all files in the voice folder
    const files = await this.getVoiceFiles(name);
    const filePaths = files.map(f => f.path);

    if (filePaths.length === 0) {
      return;
    }

    // Delete all files
    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove(filePaths);

    if (error) {
      console.error('Error deleting voice:', error);
      throw new Error(`Failed to delete voice: ${error.message}`);
    }

    // Delete all metadata for this voice
    await supabase
      .from('rosary_audio_metadata')
      .delete()
      .eq('voice_name', name);

    // Regenerate and upload manifest
    await this.regenerateManifest();
  }

  /**
   * Generate version string based on current date
   */
  private static generateVersion(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  }

  /**
   * Generate hash for a file
   */
  private static generateHash(fileName: string, size: number): string {
    const data = `${fileName}-${size}`;
    // Simple hash generation
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).substring(0, 12);
  }

  /**
   * Regenerate manifest file based on current bucket contents
   * This mimics the logic in scripts/generate-audio-manifest.js
   */
  static async regenerateManifest(): Promise<RosaryManifest> {
    console.log('Regenerating rosary audio manifest...');

    const manifest: RosaryManifest = {
      version: this.generateVersion(),
      lastUpdated: new Date().toISOString(),
      voices: {},
    };

    // Get all voices
    const voices = await this.listVoices();

    // Process each voice
    for (const voice of voices) {
      const files = await this.getVoiceFiles(voice);

      manifest.voices[voice] = {
        version: manifest.version,
        fileCount: files.length,
        files: {},
      };

      for (const file of files) {
        manifest.voices[voice].files[file.name] = {
          size: file.size,
          lastModified: file.lastModified,
          hash: file.hash,
        };
      }
    }

    // Upload manifest to bucket root
    await this.uploadManifest(manifest);

    console.log('Manifest regenerated and uploaded:', manifest.version);
    return manifest;
  }

  /**
   * Upload manifest file to bucket
   */
  private static async uploadManifest(manifest: RosaryManifest): Promise<void> {
    const manifestContent = JSON.stringify(manifest, null, 2);
    const manifestBlob = new Blob([manifestContent], { type: 'application/json' });

    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(this.MANIFEST_FILE, manifestBlob, {
        contentType: 'application/json',
        upsert: true, // Replace existing manifest
      });

    if (error) {
      console.error('Error uploading manifest:', error);
      throw new Error(`Failed to upload manifest: ${error.message}`);
    }
  }

  /**
   * Get the current manifest from the bucket
   */
  static async getCurrentManifest(): Promise<RosaryManifest | null> {
    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .download(this.MANIFEST_FILE);

    if (error) {
      console.error('Error downloading manifest:', error);
      return null;
    }

    try {
      const text = await data.text();
      return JSON.parse(text) as RosaryManifest;
    } catch (err) {
      console.error('Error parsing manifest:', err);
      return null;
    }
  }
}

