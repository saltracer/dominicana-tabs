/**
 * Rosary Types
 * Type definitions for the rosary prayer system
 */

export type RosaryForm = 'dominican' | 'standard';
export type MysterySet = 'Joyful Mysteries' | 'Sorrowful Mysteries' | 'Glorious Mysteries' | 'Luminous Mysteries';
export type PrayerType = 'sign-of-cross' | 'apostles-creed' | 'our-father' | 'hail-mary' | 'glory-be' | 'fatima' | 'mystery-announcement' | 'dominican-opening';

export interface RosaryBead {
  id: string;
  type: PrayerType;
  title: string;
  text: string;
  order: number;
  decadeNumber?: number; // 0 = opening/closing, 1-5 = decades
  beadNumber?: number; // Position within decade (1-10 for Hail Marys, 0 for Our Father, 11 for Glory Be, 12 for Fatima)
  audioFile?: string; // Path to MP4 audio file
}

export interface Mystery {
  name: string;
  bibleReference: string; // e.g., "Luke 1:26-38"
  meditation: string; // Full meditation text displayed in the app
  audio_text?: string; // Full text used for audio generation (more conversational)
  shortMeditation: string; // Brief meditation text when meditations are disabled
  shortAudio_text?: string; // Brief audio text when meditations are disabled
}

export interface MysteryData {
  name: MysterySet;
  day: string;
  icon: string;
  description: string;
  mysteries: Mystery[];
}

export interface RosaryProgress {
  currentBeadId: string;
  completedBeadIds: string[];
  currentDecade: number;
  startTime: Date;
  mystery: MysterySet;
  form: RosaryForm;
}

export interface AudioSettings {
  isEnabled: boolean;
  mode: 'guided' | 'silent' | 'background' | 'bell';
  autoAdvance: boolean;
  speed: number;
  volume: number;
  backgroundMusicVolume: number;
  pauseDuration: number; // seconds between decades
  playBellSounds: boolean;
}

export interface FinalPrayerConfig {
  id: string;
  order: number;
}

export interface FinalPrayerMetadata {
  id: string;
  name: string;
  textKey: string;
  traditional: boolean;
}

