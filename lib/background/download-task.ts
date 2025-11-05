/**
 * Background Download Task
 * Processes podcast downloads in the background using expo-task-manager
 */

import * as TaskManager from 'expo-task-manager';
import { Platform } from 'react-native';
import { PodcastDownloadQueueService } from '../../services/PodcastDownloadQueueService';

export const DOWNLOAD_TASK_NAME = 'podcast-background-download-task';

/**
 * Define the background download task
 * This task will be executed periodically by the system
 */
export function defineDownloadTask(): void {
  if (Platform.OS === 'web') {
    console.warn('[BackgroundTask] Not available on web');
    return;
  }

  TaskManager.defineTask(DOWNLOAD_TASK_NAME, async ({ data, error }: any) => {
    if (error) {
      console.error('[BackgroundTask] Task error:', error);
      return;
    }

    console.log('[BackgroundTask] Starting background download task');

    try {
      // Initialize the queue service
      await PodcastDownloadQueueService.initialize();

      // Get queue statistics
      const stats = await PodcastDownloadQueueService.getStats();
      console.log('[BackgroundTask] Queue stats:', stats);

      // The queue service will automatically process pending downloads
      // based on network conditions and concurrency limits
      
      console.log('[BackgroundTask] Background download task completed');
    } catch (taskError) {
      console.error('[BackgroundTask] Error processing downloads:', taskError);
    }
  });

  console.log('[BackgroundTask] Download task defined');
}

/**
 * Check if the download task is registered
 */
export async function isTaskRegistered(): Promise<boolean> {
  if (Platform.OS === 'web') {
    return false;
  }

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(DOWNLOAD_TASK_NAME);
    return isRegistered;
  } catch (error) {
    console.error('[BackgroundTask] Error checking task registration:', error);
    return false;
  }
}

/**
 * Get task status
 */
export async function getTaskStatus(): Promise<any> {
  if (Platform.OS === 'web') {
    return null;
  }

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(DOWNLOAD_TASK_NAME);
    if (!isRegistered) {
      return { registered: false };
    }

    // Note: Task execution status is not easily accessible
    // We rely on the queue service state for download status
    return { registered: true };
  } catch (error) {
    console.error('[BackgroundTask] Error getting task status:', error);
    return null;
  }
}

