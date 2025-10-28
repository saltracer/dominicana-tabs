import { supabase } from '../lib/supabase';
import { UserLiturgyPreferences } from '../types/liturgy-types';
import { FinalPrayerConfig } from '../types/rosary-types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserLiturgyPreferencesData {
  user_id: string;
  language: string;
  display_options: any;
  memorial_preference: string;
  calendar_type: string;
  primary_language: string;
  secondary_language: string;
  display_mode: string;
  bible_translation: string;
  audio_enabled: boolean;
  audio_types: string[];
  chant_notation: string;
  font_size: string;
  show_rubrics: boolean;
  theme_preference: string;
  chant_notation_enabled: boolean;
  tts_enabled: boolean;
  tts_voice_id: string;
  tts_speed: number;
  rosary_voice?: string; // Voice for rosary audio playback
  show_mystery_meditations?: boolean; // Show or hide mystery meditations in rosary (default: true)
  audio_playback_speed?: number; // Rosary audio playback speed (0.5 - 2.0, default: 1.0)
  rosary_final_prayers?: FinalPrayerConfig[]; // Customizable final prayers for rosary
  // Podcast settings
  podcast_downloads_enabled?: boolean; // Enable podcast downloads (default: true)
  podcast_max_downloads?: number; // Maximum number of downloaded episodes (default: 10)
  podcast_auto_download?: boolean; // Auto-download new episodes (default: false)
  podcast_download_quality?: string; // Download quality: low, medium, high (default: high)
  podcast_wifi_only?: boolean; // Download over WiFi only (default: true)
  podcast_background_playback?: boolean; // Background playback (default: true)
  podcast_auto_play_next?: boolean; // Auto-play next episode (default: false)
  podcast_default_speed?: number; // Default playback speed (0.5-3.0, default: 1.0)
  created_at?: string;
  updated_at?: string;
}

export class UserLiturgyPreferencesService {
  private static readonly CACHE_KEY_PREFIX = 'user_liturgy_preferences_';
  private static readonly CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

  /**
   * Get cache key for a user
   */
  private static getCacheKey(userId: string): string {
    return `${this.CACHE_KEY_PREFIX}${userId}`;
  }

  /**
   * Get cached preferences
   */
  private static async getCachedPreferences(userId: string): Promise<UserLiturgyPreferencesData | null> {
    try {
      const cacheKey = this.getCacheKey(userId);
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const now = Date.now();
        
        // Check if cache is still valid
        if (parsed.timestamp && (now - parsed.timestamp) < this.CACHE_EXPIRY_MS) {
          return parsed.data;
        }
        
        // Cache expired, remove it
        await AsyncStorage.removeItem(cacheKey);
      }
      
      return null;
    } catch (error) {
      console.warn('Error reading cached preferences:', error);
      return null;
    }
  }

  /**
   * Cache preferences
   */
  private static async cachePreferences(userId: string, preferences: UserLiturgyPreferencesData): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(userId);
      const cacheData = {
        data: preferences,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error caching preferences:', error);
    }
  }

  /**
   * Clear cached preferences for a user
   */
  private static async clearCachedPreferences(userId: string): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(userId);
      await AsyncStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn('Error clearing cached preferences:', error);
    }
  }

  /**
   * Get user's liturgy preferences with caching
   */
  static async getUserPreferences(userId: string): Promise<UserLiturgyPreferencesData | null> {
    try {
      // First, try to get cached preferences
      const cachedPreferences = await this.getCachedPreferences(userId);
      
      // Fetch fresh data from server
      const { data, error } = await supabase
        .from('user_liturgy_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, create default ones
          const defaultPreferences = await this.createDefaultPreferences(userId);
          // Cache the default preferences
          await this.cachePreferences(userId, defaultPreferences);
          return defaultPreferences;
        }
        console.error('Error fetching user liturgy preferences:', error);
        
        // If we have cached data and server request failed, return cached data
        if (cachedPreferences) {
          console.log('Returning cached preferences due to server error');
          return cachedPreferences;
        }
        
        return null;
      }

      // Cache the fresh data
      await this.cachePreferences(userId, data);
      
      return data;
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      
      // If we have cached data and there's an error, return cached data
      const cachedPreferences = await this.getCachedPreferences(userId);
      if (cachedPreferences) {
        console.log('Returning cached preferences due to error');
        return cachedPreferences;
      }
      
      return null;
    }
  }

  /**
   * Get user's liturgy preferences with immediate cache return (for UI loading)
   */
  static async getUserPreferencesWithCache(userId: string): Promise<{
    cached: UserLiturgyPreferencesData | null;
    fresh: Promise<UserLiturgyPreferencesData | null>;
  }> {
    const cached = await this.getCachedPreferences(userId);
    const fresh = this.getUserPreferences(userId);
    
    return { cached, fresh };
  }

  /**
   * Update user's liturgy preferences
   */
  static async updateUserPreferences(
    userId: string, 
    preferences: Partial<UserLiturgyPreferencesData>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_liturgy_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating user liturgy preferences:', error);
        return { success: false, error: error.message };
      }

      // Clear cache to force refresh on next load
      await this.clearCachedPreferences(userId);

      return { success: true };
    } catch (error) {
      console.error('Error in updateUserPreferences:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Create default preferences for a new user
   */
  static async createDefaultPreferences(userId: string): Promise<UserLiturgyPreferencesData> {
    const defaultPreferences: UserLiturgyPreferencesData = {
      user_id: userId,
      language: 'en',
      display_options: {},
      memorial_preference: 'both',
      calendar_type: 'general',
      primary_language: 'en',
      secondary_language: 'la',
      display_mode: 'bilingual',
      bible_translation: 'NRSV',
      audio_enabled: true,
      audio_types: ['spoken'],
      chant_notation: 'gregorian',
      font_size: 'medium',
      show_rubrics: true,
      theme_preference: 'light',
      chant_notation_enabled: true,
      tts_enabled: true,
      tts_voice_id: '',
      tts_speed: 2,
      rosary_voice: 'alphonsus', // Default rosary voice
      show_mystery_meditations: true, // Default to showing mystery meditations
      audio_playback_speed: 1.0, // Default playback speed (normal)
      rosary_final_prayers: [
        { id: 'hail_holy_queen', order: 1 },
        { id: 'versicle_response', order: 2 },
        { id: 'rosary_prayer', order: 3 }
      ]
    };

    try {
      const { error } = await supabase
        .from('user_liturgy_preferences')
        .insert(defaultPreferences);

      if (error) {
        console.error('Error creating default preferences:', error);
        throw error;
      }

      return defaultPreferences;
    } catch (error) {
      console.error('Error in createDefaultPreferences:', error);
      throw error;
    }
  }

  /**
   * Delete user's liturgy preferences
   */
  static async deleteUserPreferences(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_liturgy_preferences')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('Error deleting user liturgy preferences:', error);
        return { success: false, error: error.message };
      }

      // Clear cached preferences when deleting
      await this.clearCachedPreferences(userId);

      return { success: true };
    } catch (error) {
      console.error('Error in deleteUserPreferences:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Clear all cached preferences (useful for logout)
   */
  static async clearAllCachedPreferences(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const preferenceKeys = keys.filter(key => key.startsWith(this.CACHE_KEY_PREFIX));
      
      if (preferenceKeys.length > 0) {
        await AsyncStorage.multiRemove(preferenceKeys);
        console.log(`Cleared ${preferenceKeys.length} cached preference entries`);
      }
    } catch (error) {
      console.warn('Error clearing all cached preferences:', error);
    }
  }

  /**
   * Get available options for different preference types
   */
  static getAvailableOptions() {
    return {
      languages: [
        { value: 'en', label: 'English' },
        { value: 'la', label: 'Latin' },
        { value: 'fr', label: 'French' },
        { value: 'es', label: 'Spanish' },
        { value: 'de', label: 'German' },
        { value: 'it', label: 'Italian' },
      ],
      displayModes: [
        { value: 'primary-only', label: 'Primary Language Only' },
        { value: 'bilingual', label: 'Bilingual' },
        { value: 'secondary-only', label: 'Secondary Language Only' },
      ],
      bibleTranslations: [
        { value: 'NRSV', label: 'New Revised Standard Version' },
        { value: 'NAB', label: 'New American Bible' },
        { value: 'RSV', label: 'Revised Standard Version' },
        { value: 'DRA', label: 'Douay-Rheims American' },
        { value: 'VULGATE', label: 'Latin Vulgate' },
      ],
      audioTypes: [
        { value: 'spoken', label: 'Spoken' },
        { value: 'chant', label: 'Chant' },
        { value: 'organ', label: 'Organ' },
      ],
      chantNotations: [
        { value: 'dominican', label: 'Dominican Variation' },
        { value: 'simple', label: 'Simple Variation' },
        { value: 'solesmes', label: 'Solesmes Variation' },
      ],
      fontSizes: [
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
      memorialPreferences: [
        { value: 'both', label: 'Both Dominican and Universal' },
        { value: 'dominican', label: 'Dominican Only' },
        { value: 'universal', label: 'Universal Only' },
      ],
      calendarTypes: [
        { value: 'general', label: 'General Roman Calendar' },
        { value: 'dominican', label: 'Dominican Calendar' },
        { value: 'custom', label: 'Custom Calendar' },
      ],
      themePreferences: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'auto', label: 'Auto' },
      ],
      ttsSpeeds: [
        { value: 1, label: 'Slow' },
        { value: 2, label: 'Normal' },
        { value: 3, label: 'Fast' },
      ],
      // Podcast settings
      podcastDownloadQualities: [
        { value: 'low', label: 'Low (64 kbps)' },
        { value: 'medium', label: 'Medium (128 kbps)' },
        { value: 'high', label: 'High (256 kbps)' },
      ],
      podcastMaxDownloads: [
        { value: 5, label: '5 episodes' },
        { value: 10, label: '10 episodes' },
        { value: 20, label: '20 episodes' },
        { value: 50, label: '50 episodes' },
        { value: 100, label: '100 episodes' },
      ],
      podcastSpeeds: [
        { value: 0.5, label: '0.5x - Slow' },
        { value: 0.75, label: '0.75x - Slower' },
        { value: 1.0, label: '1.0x - Normal' },
        { value: 1.25, label: '1.25x - Faster' },
        { value: 1.5, label: '1.5x - Fast' },
        { value: 2.0, label: '2.0x - Very Fast' },
        { value: 2.5, label: '2.5x - Very Fast' },
        { value: 3.0, label: '3.0x - Fastest' },
      ],
    };
  }
}