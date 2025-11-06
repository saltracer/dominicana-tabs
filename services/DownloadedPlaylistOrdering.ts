/**
 * Downloaded Playlist Ordering Service
 * Manages custom ordering for the downloaded playlist
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export class DownloadedPlaylistOrdering {
  private static readonly ORDER_KEY = 'downloaded_playlist_order';

  /**
   * Get custom order for downloaded playlist
   * Returns array of episodeIds in display order
   */
  static async getOrder(): Promise<string[]> {
    if (Platform.OS === 'web') {
      return [];
    }

    try {
      const data = await AsyncStorage.getItem(this.ORDER_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('[DownloadedOrdering] Error getting order:', error);
      return [];
    }
  }

  /**
   * Save custom order for downloaded playlist
   */
  static async saveOrder(episodeIds: string[]): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      await AsyncStorage.setItem(this.ORDER_KEY, JSON.stringify(episodeIds));
      if (__DEV__) {
        console.log('[DownloadedOrdering] ✅ Saved order for', episodeIds.length, 'episodes');
      }
    } catch (error) {
      console.error('[DownloadedOrdering] Error saving order:', error);
      throw error;
    }
  }

  /**
   * Apply custom order to downloaded items
   */
  static applyOrder<T extends { episodeId?: string; id: string }>(
    items: T[],
    customOrder: string[]
  ): T[] {
    if (customOrder.length === 0) {
      return items; // No custom order, return as-is
    }

    // Create a map for O(1) lookup
    const itemsByEpisodeId = new Map<string, T>();
    const itemsById = new Map<string, T>();
    const unordered: T[] = [];

    items.forEach(item => {
      const episodeId = item.episodeId || item.id;
      if (episodeId) {
        itemsByEpisodeId.set(episodeId, item);
        itemsById.set(item.id, item);
      } else {
        unordered.push(item);
      }
    });

    // Apply order
    const ordered: T[] = [];
    customOrder.forEach(episodeId => {
      const item = itemsByEpisodeId.get(episodeId) || itemsById.get(episodeId);
      if (item) {
        ordered.push(item);
      }
    });

    // Add any items not in custom order at the end
    items.forEach(item => {
      if (!ordered.includes(item)) {
        ordered.push(item);
      }
    });

    return ordered;
  }

  /**
   * Clear custom order
   */
  static async clearOrder(): Promise<void> {
    if (Platform.OS === 'web') {
      return;
    }

    try {
      await AsyncStorage.removeItem(this.ORDER_KEY);
      if (__DEV__) {
        console.log('[DownloadedOrdering] ✅ Cleared custom order');
      }
    } catch (error) {
      console.error('[DownloadedOrdering] Error clearing order:', error);
    }
  }
}

