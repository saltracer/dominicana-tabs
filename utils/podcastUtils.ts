import { PodcastEpisode, Podcast } from '../types/podcast-types';

/**
 * Default skip interval in seconds
 */
export const DEFAULT_SKIP_SECONDS = 30;

/**
 * Default speed options array
 */
export const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0];

/**
 * Format seconds as MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format time remaining as "X:XX left" or "X:XX:XX left" for hours
 */
export function formatTimeRemaining(totalSeconds: number, currentPosition: number): string {
  const remaining = Math.max(0, totalSeconds - currentPosition);
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const secs = Math.floor(remaining % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} left`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')} left`;
}

/**
 * Format duration with hours if > 1 hour
 */
export function formatDuration(seconds?: number): string {
  if (!seconds) return '';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
  }
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, '0')}`;
}

/**
 * Calculate progress percentage (0-100)
 */
export function calculateProgressPercentage(position: number, duration: number): number {
  if (duration <= 0) return 0;
  return (position / duration) * 100;
}

/**
 * Format date string (absolute or relative)
 */
export function formatDate(dateString?: string, options?: { absolute?: boolean }): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  
  if (options?.absolute) {
    // Use actual date format for playlist screens
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }
  
  // Relative dates for other screens
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return date.toLocaleDateString();
}

/**
 * Calculate position after skipping back
 */
export function calculateSkipBackPosition(
  currentPosition: number, 
  skipSeconds: number = DEFAULT_SKIP_SECONDS
): number {
  return Math.max(0, currentPosition - skipSeconds);
}

/**
 * Calculate position after skipping forward
 */
export function calculateSkipForwardPosition(
  currentPosition: number, 
  duration: number, 
  skipSeconds: number = DEFAULT_SKIP_SECONDS
): number {
  return Math.min(duration, currentPosition + skipSeconds);
}

/**
 * Convert slider percentage to seconds
 */
export function calculateSliderPosition(percentValue: number, duration: number): number {
  return (percentValue / 100) * duration;
}

/**
 * Get next speed in array (cycles)
 */
export function getNextSpeed(
  currentSpeed: number, 
  speeds: number[] = SPEED_OPTIONS
): number {
  const currentIndex = speeds.findIndex(speed => Math.abs(speed - currentSpeed) < 0.01);
  const nextIndex = (currentIndex + 1) % speeds.length;
  return speeds[nextIndex];
}

/**
 * Format speed as "1.5x"
 */
export function getSpeedLabel(speed: number): string {
  return `${speed}x`;
}

/**
 * Get artwork URL with priority: episode → cached path → podcast → null
 */
export function getArtworkUrl(
  episode: PodcastEpisode | null, 
  podcast: Podcast | null, 
  cachedPath?: string | null
): string | null {
  if (cachedPath) return cachedPath;
  if (episode?.artworkUrl) return episode.artworkUrl;
  if (podcast?.artworkUrl) return podcast.artworkUrl;
  return null;
}

