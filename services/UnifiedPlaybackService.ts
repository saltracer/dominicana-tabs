/**
 * Unified Playback Service
 * Handles remote control events from system (lock screen, notification center, etc.)
 * for all audio types (rosary, podcast, and future integrations).
 * Required by react-native-track-player.
 */

import TrackPlayer, { Event } from 'react-native-track-player';
import { AudioStateManager } from '../lib/audio-state-manager';

export const UnifiedPlaybackService = async () => {
  console.log('[UnifiedPlaybackService] Initializing unified playback service');

  // Handle remote play button
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    console.log('[UnifiedPlaybackService] Remote play event received');
    AudioStateManager.logState();
    
    const executed = await AudioStateManager.executeRemoteCommand('play');
    
    // Fallback: if no handler executed, try TrackPlayer directly
    if (!executed) {
      console.log('[UnifiedPlaybackService] No handler found, using TrackPlayer fallback');
      try {
        await TrackPlayer.play();
      } catch (error) {
        console.error('[UnifiedPlaybackService] Fallback play failed:', error);
      }
    }
  });

  // Handle remote pause button
  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    console.log('[UnifiedPlaybackService] Remote pause event received');
    AudioStateManager.logState();
    
    const executed = await AudioStateManager.executeRemoteCommand('pause');
    
    // Fallback: if no handler executed, try TrackPlayer directly
    if (!executed) {
      console.log('[UnifiedPlaybackService] No handler found, using TrackPlayer fallback');
      try {
        await TrackPlayer.pause();
      } catch (error) {
        console.error('[UnifiedPlaybackService] Fallback pause failed:', error);
      }
    }
  });

  // Handle remote stop button
  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    console.log('[UnifiedPlaybackService] Remote stop event received');
    AudioStateManager.logState();
    
    const executed = await AudioStateManager.executeRemoteCommand('stop');
    
    // Fallback: if no handler executed, try TrackPlayer directly
    if (!executed) {
      console.log('[UnifiedPlaybackService] No handler found, using TrackPlayer fallback');
      try {
        await TrackPlayer.stop();
      } catch (error) {
        console.error('[UnifiedPlaybackService] Fallback stop failed:', error);
      }
    }
  });

  // Handle remote next button (skip to next track/prayer)
  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    console.log('[UnifiedPlaybackService] Remote next event received');
    AudioStateManager.logState();
    
    const executed = await AudioStateManager.executeRemoteCommand('next');
    
    // Fallback: if no handler executed, try TrackPlayer directly
    if (!executed) {
      console.log('[UnifiedPlaybackService] No handler found, using TrackPlayer fallback');
      try {
        await TrackPlayer.skipToNext();
      } catch (error) {
        console.error('[UnifiedPlaybackService] Fallback skipToNext failed:', error);
      }
    }
  });

  // Handle remote previous button (go to previous track/prayer)
  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    console.log('[UnifiedPlaybackService] Remote previous event received');
    AudioStateManager.logState();
    
    const executed = await AudioStateManager.executeRemoteCommand('previous');
    
    // Fallback: if no handler executed, try TrackPlayer directly
    if (!executed) {
      console.log('[UnifiedPlaybackService] No handler found, using TrackPlayer fallback');
      try {
        await TrackPlayer.skipToPrevious();
      } catch (error) {
        console.error('[UnifiedPlaybackService] Fallback skipToPrevious failed:', error);
      }
    }
  });

  // Handle playback queue ended (for sequential playback)
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async (event) => {
    console.log('[UnifiedPlaybackService] Queue ended', event);
    // This will be handled by individual hooks (useRosaryAudio, etc.) to trigger completion callbacks
  });

  console.log('[UnifiedPlaybackService] All event listeners registered');
};

