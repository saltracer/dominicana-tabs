/**
 * Audio Version Types
 * Type definitions for audio file version manifest system
 */

export interface AudioFileMetadata {
  size: number;
  lastModified: string;
  hash: string;
}

export interface VoiceManifest {
  version: string;
  fileCount: number;
  files: {
    [fileName: string]: AudioFileMetadata;
  };
}

export interface AudioVersionManifest {
  version: string;
  lastUpdated: string;
  voices: {
    [voiceName: string]: VoiceManifest;
  };
}

export interface CachedManifest {
  manifest: AudioVersionManifest;
  cachedAt: number;
}

export interface UpdateCheckResult {
  hasUpdates: boolean;
  updatedFiles: string[];
  newFiles: string[];
  voicesWithUpdates: string[];
}

