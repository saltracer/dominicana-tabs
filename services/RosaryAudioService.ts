/**
 * Rosary Audio Service
 * @deprecated This service is deprecated and replaced by the useRosaryAudio hook
 * with react-native-track-player for better system integration.
 * 
 * Use hooks/useRosaryAudio.ts instead for:
 * - Android support
 * - iOS/Android lock screen controls
 * - Background playback
 * - Now Playing metadata
 * - Better reliability
 * 
 * This file is kept temporarily for reference during migration.
 */

import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import { AudioSettings } from '../types/rosary-types';
import { RosaryAudioDownloadService } from './RosaryAudioDownloadService';

export class RosaryAudioService {
  private currentPlayer: AudioPlayer | null = null;
  private backgroundMusicPlayer: AudioPlayer | null = null;
  private isInitialized: boolean = false;
  private onCompleteCallback: (() => void) | null = null;

  /**
   * Get audio file URI from Supabase Storage (with caching)
   */
  private async getAudioFileUri(audioFile: string, voice: string = 'alphonsus'): Promise<string | null> {
    try {
      const uri = await RosaryAudioDownloadService.getAudioFileUri(voice, audioFile);
      return uri;
    } catch (error) {
      console.error(`Failed to get audio file URI for ${audioFile}:`, error);
      
      // Try fallback to alphonsus if different voice was requested
      if (voice !== 'alphonsus') {
        console.log(`Falling back to alphonsus voice for ${audioFile}`);
        try {
          const fallbackUri = await RosaryAudioDownloadService.getAudioFileUri('alphonsus', audioFile);
          return fallbackUri;
        } catch (fallbackError) {
          console.error('Fallback to alphonsus also failed:', fallbackError);
          return null;
        }
      }
      
      return null;
    }
  }

  /**
   * Initialize audio system
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        interruptionMode: 'duckOthers',
        interruptionModeAndroid: 'duckOthers',
        allowsRecording: false,
        shouldPlayInBackground: true,
        shouldRouteThroughEarpiece: false,
      });
      this.isInitialized = true;
      console.log('Audio system initialized with expo-audio');
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  /**
   * Play audio file for a prayer
   */
  async playPrayer(audioFile: string, settings: AudioSettings, voice: string = 'alphonsus', onComplete?: () => void): Promise<void> {
    if (!settings.isEnabled || settings.mode === 'silent') {
      return;
    }

    try {
      // Stop any currently playing sound
      await this.stopCurrentSound();

      // For 'bell' mode, only play transition sounds
      if (settings.mode === 'bell') {
        await this.playTransitionSound('bell', settings.volume);
        if (onComplete) onComplete();
        return;
      }

      // For 'guided' mode, play the prayer audio
      if (settings.mode === 'guided') {
        console.log(`Playing audio file: ${audioFile} with voice: ${voice}`);
        
        try {
          // Get audio file URI from Supabase (downloads if needed, uses cache if available)
          const audioUri = await this.getAudioFileUri(audioFile, voice);
          
          if (!audioUri) {
            console.warn(`Audio file not available: ${audioFile} for voice: ${voice}`);
            if (onComplete) onComplete();
            return;
          }

          console.log(`Loading audio from: ${audioUri}`);

          // Stop any currently playing audio
          await this.stopCurrentSound();

          // Create and play audio with expo-audio
          const player = createAudioPlayer({ uri: audioUri });
          this.currentPlayer = player;
          this.onCompleteCallback = onComplete || null;
          
          // Set volume and playback rate
          player.volume = settings.volume;
          player.playbackRate = settings.speed;
          
          // Listen for playback status updates
          player.addListener('playbackStatusUpdate', (status) => {
            if (status.didJustFinish) {
              console.log('Audio playback finished');
              if (this.onCompleteCallback) {
                this.onCompleteCallback();
                this.onCompleteCallback = null;
              }
            }
          });
          
          // Start playback
          player.play();
        } catch (error) {
          console.error(`Failed to load audio file: ${audioFile}`, error);
          // If audio fails, still call onComplete to not block navigation
          if (onComplete) onComplete();
        }
      }
    } catch (error) {
      console.error('Error playing prayer audio:', error);
      if (onComplete) onComplete();
    }
  }

  /**
   * Play transition sound (bell or chime)
   */
  async playTransitionSound(soundType: 'bell' | 'chime', volume: number = 0.8): Promise<void> {
    try {
      // In production, load the actual sound file
      // const soundFile = soundType === 'bell' 
      //   ? require('../assets/audio/rosary/transitions/bell.m4a')
      //   : require('../assets/audio/rosary/transitions/chime.m4a');
      
      // const player = createAudioPlayer(soundFile);
      // player.volume = volume;
      
      // // Auto-remove after playing
      // player.addListener('playbackStatusUpdate', (status) => {
      //   if (status.didJustFinish) {
      //     player.remove();
      //   }
      // });
      // 
      // player.play();

      // PLACEHOLDER
      console.log(`Would play ${soundType} transition sound`);
    } catch (error) {
      console.error(`Error playing ${soundType} sound:`, error);
    }
  }

  /**
   * Start background music
   */
  async startBackgroundMusic(volume: number = 0.3): Promise<void> {
    try {
      if (this.backgroundMusicPlayer) {
        this.backgroundMusicPlayer.volume = volume;
        this.backgroundMusicPlayer.play();
        return;
      }

      // Background music support (implement when files available)
      // const player = createAudioPlayer({ uri: backgroundMusicUri });
      // player.loop = true;
      // player.volume = volume;
      // this.backgroundMusicPlayer = player;
      // player.play();

      console.log('Background music feature not yet implemented');
    } catch (error) {
      console.error('Error starting background music:', error);
    }
  }

  /**
   * Stop background music
   */
  async stopBackgroundMusic(): Promise<void> {
    if (this.backgroundMusicPlayer) {
      try {
        this.backgroundMusicPlayer.pause();
      } catch (error) {
        console.error('Error stopping background music:', error);
      }
    }
  }

  /**
   * Stop currently playing sound
   */
  async stopCurrentSound(): Promise<void> {
    if (this.currentPlayer) {
      try {
        this.currentPlayer.pause();
        this.currentPlayer.remove();
        this.currentPlayer = null;
        this.onCompleteCallback = null;
      } catch (error) {
        console.error('Error stopping current sound:', error);
      }
    }
  }

  /**
   * Pause current sound
   */
  async pauseCurrentSound(): Promise<void> {
    if (this.currentPlayer) {
      try {
        this.currentPlayer.pause();
      } catch (error) {
        console.error('Error pausing sound:', error);
      }
    }
  }

  /**
   * Resume current sound
   */
  async resumeCurrentSound(): Promise<void> {
    if (this.currentPlayer) {
      try {
        this.currentPlayer.play();
      } catch (error) {
        console.error('Error resuming sound:', error);
      }
    }
  }

  /**
   * Set playback speed
   */
  async setPlaybackSpeed(speed: number): Promise<void> {
    if (this.currentPlayer) {
      try {
        this.currentPlayer.playbackRate = speed;
      } catch (error) {
        console.error('Error setting playback speed:', error);
      }
    }
  }

  /**
   * Set volume
   */
  async setVolume(volume: number): Promise<void> {
    if (this.currentPlayer) {
      try {
        this.currentPlayer.volume = volume;
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  }

  /**
   * Get simulated duration for placeholder (in milliseconds)
   * This is used until actual audio files are provided
   */
  private getSimulatedDuration(audioFile: string): number {
    // Simulated durations based on typical prayer lengths
    if (audioFile.includes('sign-of-cross')) return 3000;
    if (audioFile.includes('apostles-creed')) return 30000;
    if (audioFile.includes('our-father')) return 20000;
    if (audioFile.includes('hail-mary')) return 15000;
    if (audioFile.includes('glory-be')) return 8000;
    if (audioFile.includes('fatima')) return 10000;
    if (audioFile.includes('decade-')) return 25000; // Mystery meditation
    if (audioFile.includes('dominican-opening')) return 5000;
    if (audioFile.includes('final-prayer')) return 60000;
    return 10000; // Default
  }

  /**
   * Cleanup and release resources
   */
  async cleanup(): Promise<void> {
    await this.stopCurrentSound();
    await this.stopBackgroundMusic();
    
    if (this.backgroundMusicPlayer) {
      try {
        this.backgroundMusicPlayer.remove();
        this.backgroundMusicPlayer = null;
      } catch (error) {
        console.error('Error removing background music player:', error);
      }
    }
    
    this.onCompleteCallback = null;
  }
}

// Export singleton instance
export const rosaryAudioService = new RosaryAudioService();

