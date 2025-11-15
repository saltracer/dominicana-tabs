import { useCallback } from 'react';
import { usePodcastPlayer } from '../contexts/PodcastPlayerContext';
import { 
  calculateSkipBackPosition, 
  calculateSkipForwardPosition, 
  DEFAULT_SKIP_SECONDS 
} from '../utils/podcastUtils';

/**
 * Hook that provides playback control handlers
 * Uses utilities from podcastUtils.ts
 */
export function usePodcastControls(skipSeconds: number = DEFAULT_SKIP_SECONDS) {
  const { position, duration, isPlaying, pause, resume, seek } = usePodcastPlayer();
  
  const skipBack = useCallback(() => {
    const newPosition = calculateSkipBackPosition(position, skipSeconds);
    seek(newPosition);
  }, [position, seek, skipSeconds]);
  
  const skipForward = useCallback(() => {
    const newPosition = calculateSkipForwardPosition(position, duration, skipSeconds);
    seek(newPosition);
  }, [position, duration, seek, skipSeconds]);
  
  const playPause = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  }, [isPlaying, pause, resume]);
  
  return { skipBack, skipForward, playPause };
}

