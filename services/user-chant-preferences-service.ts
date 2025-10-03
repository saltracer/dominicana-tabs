import { ChantType } from '@/assets/data/liturgy/compline/chant/gabc-mapping';
import { UserLiturgyPreferencesService } from './UserLiturgyPreferencesService';

/**
 * Service for managing user chant type preferences using existing UserLiturgyPreferencesService
 */
export class UserChantPreferencesService {
  private static instance: UserChantPreferencesService;
  
  private constructor() {
    // No need to instantiate since we're using static methods
  }
  
  public static getInstance(): UserChantPreferencesService {
    if (!UserChantPreferencesService.instance) {
      UserChantPreferencesService.instance = new UserChantPreferencesService();
    }
    return UserChantPreferencesService.instance;
  }

  /**
   * Get user's chant type preference
   */
  public async getUserChantPreference(userId: string): Promise<ChantType> {
    try {
      const preferences = await UserLiturgyPreferencesService.getUserPreferences(userId);
      if (!preferences) {
        return 'dominican'; // Default to Dominican
      }

      // Map the chant_notation value to ChantType
      const chantNotation = preferences.chant_notation;
      switch (chantNotation) {
        case 'dominican':
          return 'dominican';
        case 'solesmes':
          return 'solesmes';
        case 'simple':
          return 'simple';
        default:
          return 'dominican'; // Default fallback
      }
    } catch (error) {
      console.error('Error in getUserChantPreference:', error);
      return 'dominican';
    }
  }

  /**
   * Update user's chant type preference
   */
  public async updateUserChantPreference(
    userId: string, 
    chantType: ChantType
  ): Promise<boolean> {
    try {
      // Map ChantType to chant_notation value
      const chantNotation = chantType; // They match exactly
      
      const result = await UserLiturgyPreferencesService.updateUserPreferences(userId, {
        chant_notation: chantNotation
      });

      return result.success;
    } catch (error) {
      console.error('Error in updateUserChantPreference:', error);
      return false;
    }
  }

  /**
   * Get user's chant notation enabled preference
   */
  public async getChantNotationEnabled(userId: string): Promise<boolean> {
    try {
      const preferences = await UserLiturgyPreferencesService.getUserPreferences(userId);
      return preferences?.chant_notation_enabled ?? true; // Default to enabled
    } catch (error) {
      console.error('Error in getChantNotationEnabled:', error);
      return true;
    }
  }

  /**
   * Update user's chant notation enabled preference
   */
  public async updateChantNotationEnabled(
    userId: string, 
    enabled: boolean
  ): Promise<boolean> {
    try {
      const result = await UserLiturgyPreferencesService.updateUserPreferences(userId, {
        chant_notation_enabled: enabled
      });

      return result.success;
    } catch (error) {
      console.error('Error in updateChantNotationEnabled:', error);
      return false;
    }
  }

  /**
   * Get user's complete liturgy preferences including chant settings
   */
  public async getUserLiturgyPreferences(userId: string) {
    try {
      return await UserLiturgyPreferencesService.getUserPreferences(userId);
    } catch (error) {
      console.error('Error in getUserLiturgyPreferences:', error);
      return null;
    }
  }
}

// Export singleton instance
export const userChantPreferencesService = UserChantPreferencesService.getInstance();
