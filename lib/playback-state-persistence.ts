/**
 * Playback State Persistence Service
 * Persists playback state locally (AsyncStorage) for app restart recovery
 * Does NOT sync to Supabase - that's handled separately by PodcastPlaybackService
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PodcastEpisode } from '../types';
import { RosaryBead } from '../types/rosary-types';

// Storage keys
const PODCAST_STATE_KEY = 'playback:podcast';
const ROSARY_STATE_KEY = 'playback:rosary';

// Type definitions
export interface PersistedPodcastState {
  episode: PodcastEpisode;
  position: number;
  playbackContext: {
    type: 'podcast' | 'playlist' | 'queue' | 'downloaded' | 'single';
    episodes: PodcastEpisode[];
    currentIndex: number;
    sourceId?: string;
  };
  playbackSpeed: number;
  savedAt: string;
}

export interface PersistedRosaryState {
  currentMystery: string;
  rosaryForm: string;
  voice: string;
  currentBeadId: string;
  currentSpeed: number;
  beads: RosaryBead[];
  savedAt: string;
}

// Helper functions
async function getJson<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`[PlaybackPersistence] Error reading ${key}:`, error);
    return null;
  }
}

async function setJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`[PlaybackPersistence] Error saving ${key}:`, error);
  }
}

// Podcast State Methods
export async function savePodcastState(state: PersistedPodcastState): Promise<void> {
  await setJson(PODCAST_STATE_KEY, state);
  if (__DEV__) {
    console.log('[PlaybackPersistence] Saved podcast state:', {
      episode: state.episode.title,
      position: state.position,
      speed: state.playbackSpeed,
    });
  }
}

export async function loadPodcastState(): Promise<PersistedPodcastState | null> {
  const state = await getJson<PersistedPodcastState>(PODCAST_STATE_KEY);
  if (__DEV__ && state) {
    console.log('[PlaybackPersistence] Loaded podcast state:', {
      episode: state.episode.title,
      position: state.position,
      speed: state.playbackSpeed,
    });
  }
  return state;
}

export async function clearPodcastState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(PODCAST_STATE_KEY);
    if (__DEV__) {
      console.log('[PlaybackPersistence] Cleared podcast state');
    }
  } catch (error) {
    console.error('[PlaybackPersistence] Error clearing podcast state:', error);
  }
}

// Rosary State Methods
export async function saveRosaryState(state: PersistedRosaryState): Promise<void> {
  await setJson(ROSARY_STATE_KEY, state);
  if (__DEV__) {
    console.log('[PlaybackPersistence] Saved rosary state:', {
      mystery: state.currentMystery,
      form: state.rosaryForm,
      beadId: state.currentBeadId,
      speed: state.currentSpeed,
    });
  }
}

export async function loadRosaryState(): Promise<PersistedRosaryState | null> {
  const state = await getJson<PersistedRosaryState>(ROSARY_STATE_KEY);
  if (__DEV__ && state) {
    console.log('[PlaybackPersistence] Loaded rosary state:', {
      mystery: state.currentMystery,
      form: state.rosaryForm,
      beadId: state.currentBeadId,
      speed: state.currentSpeed,
    });
  }
  return state;
}

export async function clearRosaryState(): Promise<void> {
  try {
    await AsyncStorage.removeItem(ROSARY_STATE_KEY);
    if (__DEV__) {
      console.log('[PlaybackPersistence] Cleared rosary state');
    }
  } catch (error) {
    console.error('[PlaybackPersistence] Error clearing rosary state:', error);
  }
}

// Clear all playback state (useful for sign out)
export async function clearAllPlaybackState(): Promise<void> {
  await Promise.all([
    clearPodcastState(),
    clearRosaryState(),
  ]);
  if (__DEV__) {
    console.log('[PlaybackPersistence] Cleared all playback state');
  }
}

