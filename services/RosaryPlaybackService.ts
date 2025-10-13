/**
 * Rosary Playback Service
 * Handles remote control events from system (lock screen, notification center, etc.)
 * Required by react-native-track-player
 */

import TrackPlayer, { Event } from 'react-native-track-player';

export const RosaryPlaybackService = async () => {
  // Handle remote play button
  TrackPlayer.addEventListener(Event.RemotePlay, async () => {
    console.log('[Rosary Playback Service] Remote play');
    await TrackPlayer.play();
  });

  // Handle remote pause button
  TrackPlayer.addEventListener(Event.RemotePause, async () => {
    console.log('[Rosary Playback Service] Remote pause');
    await TrackPlayer.pause();
  });

  // Handle remote stop button
  TrackPlayer.addEventListener(Event.RemoteStop, async () => {
    console.log('[Rosary Playback Service] Remote stop');
    await TrackPlayer.stop();
  });

  // Handle remote next button (skip to next prayer)
  // Note: This will be coordinated with the useRosaryAudio hook
  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    console.log('[Rosary Playback Service] Remote next');
    await TrackPlayer.skipToNext();
  });

  // Handle remote previous button (go to previous prayer)
  // Note: This will be coordinated with the useRosaryAudio hook
  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    console.log('[Rosary Playback Service] Remote previous');
    await TrackPlayer.skipToPrevious();
  });

  // Handle playback queue ended (for sequential playback)
  TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async (event) => {
    console.log('[Rosary Playback Service] Queue ended', event);
    // This will be handled by the hook to trigger onComplete callbacks
  });
};

