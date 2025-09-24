import { supabase } from '../lib/supabase';
import { UserLiturgyPreferences } from '../types/liturgy-types';

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
  created_at?: string;
  updated_at?: string;
}

export class UserLiturgyPreferencesService {
  /**
   * Get user's liturgy preferences
   */
  static async getUserPreferences(userId: string): Promise<UserLiturgyPreferencesData | null> {
    try {
      const { data, error } = await supabase
        .from('user_liturgy_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, create default ones
          return await this.createDefaultPreferences(userId);
        }
        console.error('Error fetching user liturgy preferences:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserPreferences:', error);
      return null;
    }
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

      return { success: true };
    } catch (error) {
      console.error('Error in deleteUserPreferences:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  }

  /**
   * Get available options for different preference types
   */
  static getAvailableOptions() {
    return {
      languages: [
        { code: 'en', name: 'English' },
        { code: 'la', name: 'Latin' },
        { code: 'fr', name: 'French' },
        { code: 'es', name: 'Spanish' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
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
        { value: 'modern', label: 'Modern Notation' },
        { value: 'gregorian', label: 'Gregorian Notation' },
        { value: 'solesmes', label: 'Solesmes Notation' },
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
    };
  }
}