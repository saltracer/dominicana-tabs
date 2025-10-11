/**
 * Rosary Audio Service
 * Handles audio playback for rosary prayers
 * Supports pre-recorded MP4 files
 */

import { Audio } from 'expo-av';
import { AudioSettings } from '../types/rosary-types';

export class RosaryAudioService {
  private currentSound: Audio.Sound | null = null;
  private backgroundMusic: Audio.Sound | null = null;
  private isInitialized: boolean = false;

  /**
   * Get audio file asset using require()
   * Metro bundler requires static require() calls
   */
  private getAudioAsset(audioFile: string): any {
    const audioAssets: Record<string, any> = {
      'assets/audio/rosary/sign-of-cross.m4a': require('../assets/audio/rosary/sign-of-the-cross.m4a'),
      'assets/audio/rosary/apostles-creed.m4a': require('../assets/audio/rosary/alphonsus/Alphonsus Liguori_Apostles-Creed.m4a'),
      'assets/audio/rosary/our-father.m4a': require('../assets/audio/rosary/alphonsus/Alphonsus Liguori_Our-Father.m4a'),
      'assets/audio/rosary/hail-mary.m4a': require('../assets/audio/rosary/alphonsus/Alphonsus Liguori_Hail-Mary-1.m4a'),
      'assets/audio/rosary/glory-be.m4a': require('../assets/audio/rosary/alphonsus/Alphonsus Liguori_Glory-Be.m4a'),
      'assets/audio/rosary/fatima-prayer.m4a': require('../assets/audio/rosary/alphonsus/Alphonsus Liguori_Fatima-Prayer.m4a'),
      'assets/audio/rosary/final-prayer.m4a': require('../assets/audio/rosary/alphonsus/Alphonsus Liguori_Final-Prayer.m4a'),
      'assets/audio/rosary/dominican-opening-1.m4a': require('../assets/audio/rosary/dominican-opening-1.m4a'),
      'assets/audio/rosary/dominican-opening-2.m4a': require('../assets/audio/rosary/dominican-opening-2.m4a'),
      'assets/audio/rosary/dominican-opening-3.m4a': require('../assets/audio/rosary/dominican-opening-3.m4a'),
      // Mystery announcements
      'assets/audio/rosary/mysteries/joyful-mysteries/decade-1.m4a': require('../assets/audio/rosary/alphonsus/Alphonsus Liguori_joyful-decade-1.m4a'),
    };

    return audioAssets[audioFile] || null;
  }

  /**
   * Initialize audio system
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  /**
   * Play audio file for a prayer
   */
  async playPrayer(audioFile: string, settings: AudioSettings, onComplete?: () => void): Promise<void> {
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
        console.log(`Playing audio file: ${audioFile}`);
        
        try {
          const audioAsset = this.getAudioAsset(audioFile);
          
          if (!audioAsset) {
            console.warn(`Audio file not found in asset map: ${audioFile}`);
            if (onComplete) onComplete();
            return;
          }

          const { sound } = await Audio.Sound.createAsync(
            audioAsset,
            {
              shouldPlay: true,
              volume: settings.volume,
              rate: settings.speed,
            }
          );
          
          this.currentSound = sound;
          
          sound.setOnPlaybackStatusUpdate((status) => {
            if (status.isLoaded && status.didJustFinish) {
              if (onComplete) onComplete();
            }
          });
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
      //   ? require('../assets/audio/rosary/transitions/bell.mp4')
      //   : require('../assets/audio/rosary/transitions/chime.mp4');
      
      // const { sound } = await Audio.Sound.createAsync(
      //   soundFile,
      //   { shouldPlay: true, volume }
      // );
      
      // // Auto-unload after playing
      // sound.setOnPlaybackStatusUpdate((status) => {
      //   if (status.isLoaded && status.didJustFinish) {
      //     sound.unloadAsync();
      //   }
      // });

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
      if (this.backgroundMusic) {
        await this.backgroundMusic.setVolumeAsync(volume);
        await this.backgroundMusic.playAsync();
        return;
      }

      // In production, load the background music file
      // const { sound } = await Audio.Sound.createAsync(
      //   require('../assets/audio/rosary/background/gregorian-chant.mp4'),
      //   {
      //     shouldPlay: true,
      //     volume,
      //     isLooping: true,
      //   }
      // );
      
      // this.backgroundMusic = sound;

      // PLACEHOLDER
      console.log('Would start background music');
    } catch (error) {
      console.error('Error starting background music:', error);
    }
  }

  /**
   * Stop background music
   */
  async stopBackgroundMusic(): Promise<void> {
    if (this.backgroundMusic) {
      try {
        await this.backgroundMusic.stopAsync();
      } catch (error) {
        console.error('Error stopping background music:', error);
      }
    }
  }

  /**
   * Stop currently playing sound
   */
  async stopCurrentSound(): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      } catch (error) {
        console.error('Error stopping current sound:', error);
      }
    }
  }

  /**
   * Pause current sound
   */
  async pauseCurrentSound(): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.pauseAsync();
      } catch (error) {
        console.error('Error pausing sound:', error);
      }
    }
  }

  /**
   * Resume current sound
   */
  async resumeCurrentSound(): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.playAsync();
      } catch (error) {
        console.error('Error resuming sound:', error);
      }
    }
  }

  /**
   * Set playback speed
   */
  async setPlaybackSpeed(speed: number): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.setRateAsync(speed, true);
      } catch (error) {
        console.error('Error setting playback speed:', error);
      }
    }
  }

  /**
   * Set volume
   */
  async setVolume(volume: number): Promise<void> {
    if (this.currentSound) {
      try {
        await this.currentSound.setVolumeAsync(volume);
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
    
    if (this.backgroundMusic) {
      try {
        await this.backgroundMusic.unloadAsync();
        this.backgroundMusic = null;
      } catch (error) {
        console.error('Error unloading background music:', error);
      }
    }
  }
}

// Export singleton instance
export const rosaryAudioService = new RosaryAudioService();

