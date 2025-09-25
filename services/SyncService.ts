import AsyncStorage from '@react-native-async-storage/async-storage';
import { Book, Bookmark, ReadingProgress } from '../types';

interface SyncData {
  bookmarks: Bookmark[];
  readingProgress: ReadingProgress[];
  annotations: any[];
  readingSessions: any[];
  lastSync: string;
  deviceId: string;
  userId: string;
}

interface SyncConflict {
  type: 'bookmark' | 'progress' | 'annotation';
  localItem: any;
  remoteItem: any;
  conflictId: string;
  timestamp: string;
}

interface SyncStatus {
  isOnline: boolean;
  lastSync: string;
  pendingChanges: number;
  conflicts: SyncConflict[];
  syncInProgress: boolean;
}

class SyncService {
  private static readonly SYNC_DATA_KEY = 'sync_data';
  private static readonly SYNC_STATUS_KEY = 'sync_status';
  private static readonly CONFLICTS_KEY = 'sync_conflicts';
  private static readonly DEVICE_ID_KEY = 'device_id';

  private deviceId: string = '';
  private userId: string = '';
  private syncStatus: SyncStatus = {
    isOnline: false,
    lastSync: '',
    pendingChanges: 0,
    conflicts: [],
    syncInProgress: false
  };

  constructor() {
    this.initializeSync();
  }

  /**
   * Initialize sync service
   */
  private async initializeSync(): Promise<void> {
    try {
      // Get or create device ID
      let deviceId = await AsyncStorage.getItem(SyncService.DEVICE_ID_KEY);
      if (!deviceId) {
        deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await AsyncStorage.setItem(SyncService.DEVICE_ID_KEY, deviceId);
      }
      this.deviceId = deviceId;

      // Load sync status
      const statusData = await AsyncStorage.getItem(SyncService.SYNC_STATUS_KEY);
      if (statusData) {
        this.syncStatus = JSON.parse(statusData);
      }

      console.log('Sync service initialized for device:', this.deviceId);
    } catch (error) {
      console.error('Error initializing sync service:', error);
    }
  }

  /**
   * Set user ID for sync
   */
  async setUserId(userId: string): Promise<void> {
    this.userId = userId;
    await this.updateSyncStatus();
  }

  /**
   * Check if device is online
   */
  isOnline(): boolean {
    return navigator.onLine !== false;
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus };
  }

  /**
   * Sync reading data
   */
  async syncReadingData(): Promise<{
    success: boolean;
    conflicts: SyncConflict[];
    syncedItems: number;
  }> {
    if (!this.isOnline()) {
      throw new Error('Device is offline');
    }

    if (this.syncStatus.syncInProgress) {
      throw new Error('Sync already in progress');
    }

    this.syncStatus.syncInProgress = true;
    await this.updateSyncStatus();

    try {
      // Get local data
      const localData = await this.getLocalSyncData();
      
      // Simulate server sync (in real implementation, this would call API)
      const serverData = await this.getServerSyncData();
      
      // Merge data and resolve conflicts
      const mergeResult = await this.mergeSyncData(localData, serverData);
      
      // Save merged data
      await this.saveLocalSyncData(mergeResult.mergedData);
      
      // Update sync status
      this.syncStatus.lastSync = new Date().toISOString();
      this.syncStatus.pendingChanges = 0;
      this.syncStatus.conflicts = mergeResult.conflicts;
      this.syncStatus.syncInProgress = false;
      
      await this.updateSyncStatus();

      return {
        success: true,
        conflicts: mergeResult.conflicts,
        syncedItems: mergeResult.syncedItems
      };
    } catch (error) {
      this.syncStatus.syncInProgress = false;
      await this.updateSyncStatus();
      throw error;
    }
  }

  /**
   * Upload local changes to server
   */
  async uploadLocalChanges(): Promise<void> {
    if (!this.isOnline()) {
      throw new Error('Device is offline');
    }

    const localData = await this.getLocalSyncData();
    
    // In real implementation, this would upload to server
    console.log('Uploading local changes:', localData);
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  /**
   * Download server changes
   */
  async downloadServerChanges(): Promise<SyncData> {
    if (!this.isOnline()) {
      throw new Error('Device is offline');
    }

    // In real implementation, this would download from server
    const serverData = await this.getServerSyncData();
    return serverData;
  }

  /**
   * Resolve sync conflict
   */
  async resolveConflict(conflictId: string, resolution: 'local' | 'remote' | 'merge'): Promise<void> {
    const conflicts = await this.getSyncConflicts();
    const conflict = conflicts.find(c => c.conflictId === conflictId);
    
    if (!conflict) {
      throw new Error('Conflict not found');
    }

    let resolvedItem: any;
    
    switch (resolution) {
      case 'local':
        resolvedItem = conflict.localItem;
        break;
      case 'remote':
        resolvedItem = conflict.remoteItem;
        break;
      case 'merge':
        resolvedItem = this.mergeConflictItems(conflict.localItem, conflict.remoteItem);
        break;
    }

    // Apply resolution
    await this.applyConflictResolution(conflict.type, resolvedItem);
    
    // Remove conflict
    const updatedConflicts = conflicts.filter(c => c.conflictId !== conflictId);
    await this.saveSyncConflicts(updatedConflicts);
    
    this.syncStatus.conflicts = updatedConflicts;
    await this.updateSyncStatus();
  }

  /**
   * Get pending changes count
   */
  async getPendingChangesCount(): Promise<number> {
    const localData = await this.getLocalSyncData();
    const lastSync = new Date(this.syncStatus.lastSync);
    
    let pendingCount = 0;
    
    // Count items modified since last sync
    localData.bookmarks.forEach(bookmark => {
      if (new Date(bookmark.createdAt) > lastSync) {
        pendingCount++;
      }
    });
    
    localData.readingProgress.forEach(progress => {
      if (new Date(progress.lastRead) > lastSync) {
        pendingCount++;
      }
    });
    
    return pendingCount;
  }

  /**
   * Force sync (ignore conflicts)
   */
  async forceSync(): Promise<void> {
    if (!this.isOnline()) {
      throw new Error('Device is offline');
    }

    // Download server data and overwrite local
    const serverData = await this.downloadServerChanges();
    await this.saveLocalSyncData(serverData);
    
    // Clear conflicts
    await this.saveSyncConflicts([]);
    
    this.syncStatus.lastSync = new Date().toISOString();
    this.syncStatus.pendingChanges = 0;
    this.syncStatus.conflicts = [];
    await this.updateSyncStatus();
  }

  /**
   * Get sync conflicts
   */
  async getSyncConflicts(): Promise<SyncConflict[]> {
    try {
      const data = await AsyncStorage.getItem(SyncService.CONFLICTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sync conflicts:', error);
      return [];
    }
  }

  /**
   * Clear all sync data
   */
  async clearAllSyncData(): Promise<void> {
    await AsyncStorage.removeItem(SyncService.SYNC_DATA_KEY);
    await AsyncStorage.removeItem(SyncService.SYNC_STATUS_KEY);
    await AsyncStorage.removeItem(SyncService.CONFLICTS_KEY);
    
    this.syncStatus = {
      isOnline: false,
      lastSync: '',
      pendingChanges: 0,
      conflicts: [],
      syncInProgress: false
    };
  }

  /**
   * Get local sync data
   */
  private async getLocalSyncData(): Promise<SyncData> {
    try {
      const data = await AsyncStorage.getItem(SyncService.SYNC_DATA_KEY);
      return data ? JSON.parse(data) : {
        bookmarks: [],
        readingProgress: [],
        annotations: [],
        readingSessions: [],
        lastSync: '',
        deviceId: this.deviceId,
        userId: this.userId
      };
    } catch (error) {
      console.error('Error getting local sync data:', error);
      return {
        bookmarks: [],
        readingProgress: [],
        annotations: [],
        readingSessions: [],
        lastSync: '',
        deviceId: this.deviceId,
        userId: this.userId
      };
    }
  }

  /**
   * Save local sync data
   */
  private async saveLocalSyncData(data: SyncData): Promise<void> {
    await AsyncStorage.setItem(
      SyncService.SYNC_DATA_KEY,
      JSON.stringify(data)
    );
  }

  /**
   * Get server sync data (simulated)
   */
  private async getServerSyncData(): Promise<SyncData> {
    // In real implementation, this would fetch from server
    return {
      bookmarks: [],
      readingProgress: [],
      annotations: [],
      readingSessions: [],
      lastSync: new Date().toISOString(),
      deviceId: this.deviceId,
      userId: this.userId
    };
  }

  /**
   * Merge sync data
   */
  private async mergeSyncData(localData: SyncData, serverData: SyncData): Promise<{
    mergedData: SyncData;
    conflicts: SyncConflict[];
    syncedItems: number;
  }> {
    const conflicts: SyncConflict[] = [];
    let syncedItems = 0;

    // Merge bookmarks
    const mergedBookmarks = this.mergeBookmarks(localData.bookmarks, serverData.bookmarks, conflicts);
    syncedItems += mergedBookmarks.length;

    // Merge reading progress
    const mergedProgress = this.mergeReadingProgress(localData.readingProgress, serverData.readingProgress, conflicts);
    syncedItems += mergedProgress.length;

    // Merge annotations
    const mergedAnnotations = this.mergeAnnotations(localData.annotations, serverData.annotations, conflicts);
    syncedItems += mergedAnnotations.length;

    const mergedData: SyncData = {
      bookmarks: mergedBookmarks,
      readingProgress: mergedProgress,
      annotations: mergedAnnotations,
      readingSessions: [...localData.readingSessions, ...serverData.readingSessions],
      lastSync: new Date().toISOString(),
      deviceId: this.deviceId,
      userId: this.userId
    };

    return {
      mergedData,
      conflicts,
      syncedItems
    };
  }

  /**
   * Merge bookmarks
   */
  private mergeBookmarks(local: Bookmark[], server: Bookmark[], conflicts: SyncConflict[]): Bookmark[] {
    const merged: Bookmark[] = [];
    const allBookmarks = [...local, ...server];
    const bookmarkMap = new Map<string, Bookmark>();

    allBookmarks.forEach(bookmark => {
      const key = `${bookmark.bookId}_${bookmark.position}`;
      const existing = bookmarkMap.get(key);

      if (existing) {
        // Check for conflicts
        if (existing.note !== bookmark.note || existing.createdAt !== bookmark.createdAt) {
          conflicts.push({
            type: 'bookmark',
            localItem: existing,
            remoteItem: bookmark,
            conflictId: `conflict_${Date.now()}_${Math.random()}`,
            timestamp: new Date().toISOString()
          });
        }
        // Use the most recent version
        if (new Date(bookmark.createdAt) > new Date(existing.createdAt)) {
          bookmarkMap.set(key, bookmark);
        }
      } else {
        bookmarkMap.set(key, bookmark);
      }
    });

    return Array.from(bookmarkMap.values());
  }

  /**
   * Merge reading progress
   */
  private mergeReadingProgress(local: ReadingProgress[], server: ReadingProgress[], conflicts: SyncConflict[]): ReadingProgress[] {
    const merged: ReadingProgress[] = [];
    const progressMap = new Map<string, ReadingProgress>();

    [...local, ...server].forEach(progress => {
      const existing = progressMap.get(progress.bookId);

      if (existing) {
        // Use the most recent progress
        if (new Date(progress.lastRead) > new Date(existing.lastRead)) {
          progressMap.set(progress.bookId, progress);
        }
      } else {
        progressMap.set(progress.bookId, progress);
      }
    });

    return Array.from(progressMap.values());
  }

  /**
   * Merge annotations
   */
  private mergeAnnotations(local: any[], server: any[], conflicts: SyncConflict[]): any[] {
    // Similar to bookmarks merge
    return [...local, ...server];
  }

  /**
   * Merge conflict items
   */
  private mergeConflictItems(local: any, remote: any): any {
    // Simple merge strategy - combine notes and use latest timestamp
    return {
      ...local,
      ...remote,
      note: `${local.note || ''} | ${remote.note || ''}`.trim(),
      createdAt: new Date(Math.max(
        new Date(local.createdAt).getTime(),
        new Date(remote.createdAt).getTime()
      )).toISOString()
    };
  }

  /**
   * Apply conflict resolution
   */
  private async applyConflictResolution(type: string, resolvedItem: any): Promise<void> {
    // Implementation would apply the resolved item to local storage
    console.log(`Applying conflict resolution for ${type}:`, resolvedItem);
  }

  /**
   * Save sync conflicts
   */
  private async saveSyncConflicts(conflicts: SyncConflict[]): Promise<void> {
    await AsyncStorage.setItem(
      SyncService.CONFLICTS_KEY,
      JSON.stringify(conflicts)
    );
  }

  /**
   * Update sync status
   */
  private async updateSyncStatus(): Promise<void> {
    await AsyncStorage.setItem(
      SyncService.SYNC_STATUS_KEY,
      JSON.stringify(this.syncStatus)
    );
  }
}

export default new SyncService();