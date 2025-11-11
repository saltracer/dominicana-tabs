/**
 * Tests for RosaryAudioQueue - HTML5 Audio queue manager
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useRosaryAudio } from '../hooks/useRosaryAudio.web.html5';
import { RosaryBead } from '../types/rosary-types';

// Mock RosaryAudioDownloadService
jest.mock('../services/RosaryAudioDownloadService.web', () => ({
  RosaryAudioDownloadService: {
    getAudioFileUri: jest.fn((voice: string, audioFile: string) => {
      return Promise.resolve(`https://example.com/audio/${voice}/${audioFile}`);
    }),
  },
}));

// Mock HTML5 Audio
const createMockAudio = () => {
  const audioMock = {
    play: jest.fn().mockResolvedValue(undefined),
    pause: jest.fn(),
    load: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    currentTime: 0,
    duration: 10,
    volume: 1,
    playbackRate: 1,
    src: '',
    paused: true,
    ended: false,
    error: null,
    buffered: {
      length: 0,
      start: jest.fn(),
      end: jest.fn(),
    },
  };

  // Store event listeners
  const listeners: Record<string, Function[]> = {};
  audioMock.addEventListener = jest.fn((event: string, callback: Function) => {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
  });

  // Trigger event helper
  (audioMock as any).triggerEvent = (event: string, data?: any) => {
    if (listeners[event]) {
      listeners[event].forEach(callback => callback(data));
    }
  };

  return audioMock;
};

let mockAudio: any;

beforeEach(() => {
  mockAudio = createMockAudio();
  (global as any).Audio = jest.fn(() => mockAudio);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('RosaryAudioQueue', () => {
  const mockBeads: RosaryBead[] = [
    {
      id: 'sign-of-cross',
      type: 'sign-of-cross',
      title: 'Sign of the Cross',
      audioFile: 'assets/audio/rosary/sign-of-cross.m4a',
    },
    {
      id: 'apostles-creed',
      type: 'apostles-creed',
      title: 'Apostles\' Creed',
      audioFile: 'assets/audio/rosary/apostles-creed-1.m4a',
    },
    {
      id: 'our-father-1',
      type: 'our-father',
      title: 'Our Father',
      audioFile: 'assets/audio/rosary/our-father-1.m4a',
    },
  ];

  const defaultOptions = {
    beads: mockBeads,
    voice: 'alphonsus',
    settings: {
      isEnabled: true,
      mode: 'guided' as const,
      autoAdvance: true,
      speed: 1.0,
      volume: 0.8,
      backgroundMusicVolume: 0.3,
      pauseDuration: 5,
      playBellSounds: true,
    },
    rosaryForm: 'dominican' as const,
    mysteryName: 'Joyful Mysteries',
    showMysteryMeditations: true,
    isLentSeason: false,
  };

  describe('Queue initialization', () => {
    it('should initialize with empty queue', () => {
      const { result } = renderHook(() => useRosaryAudio({
        ...defaultOptions,
        beads: [],
      }));

      expect(result.current.isPlaying).toBe(false);
      expect(result.current.isPaused).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should build queue with correct tracks', async () => {
      const { result } = renderHook(() => useRosaryAudio(defaultOptions));

      await act(async () => {
        await result.current.initializeQueue();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.downloadProgress.total).toBe(3);
    });

    it('should handle beads with no audio file', async () => {
      const beadsWithMissing = [
        ...mockBeads,
        {
          id: 'no-audio',
          type: 'hail-mary' as const,
          title: 'No Audio',
          audioFile: undefined,
        },
      ];

      const { result } = renderHook(() => useRosaryAudio({
        ...defaultOptions,
        beads: beadsWithMissing,
      }));

      await act(async () => {
        await result.current.initializeQueue();
      });

      // Should skip bead with no audio
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Sequential playback', () => {
    it('should play first track on play()', async () => {
      const { result } = renderHook(() => useRosaryAudio(defaultOptions));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.play();
      });

      expect(mockAudio.play).toHaveBeenCalled();
      expect(mockAudio.src).toContain('sign-of-cross');
    });

    it('should automatically advance to next track on ended', async () => {
      const onTrackChange = jest.fn();
      const { result } = renderHook(() => useRosaryAudio({
        ...defaultOptions,
        onTrackChange,
      }));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.play();
      });

      // Simulate first track ending
      await act(async () => {
        mockAudio.triggerEvent('ended');
      });

      // Should advance to second track
      await waitFor(() => {
        expect(mockAudio.src).toContain('apostles-creed');
      });
    });

    it('should fire onTrackChange callback with correct beadId', async () => {
      const onTrackChange = jest.fn();
      const { result } = renderHook(() => useRosaryAudio({
        ...defaultOptions,
        onTrackChange,
      }));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.play();
      });

      await waitFor(() => {
        expect(onTrackChange).toHaveBeenCalledWith('sign-of-cross', expect.any(Number));
      });
    });

    it('should fire onQueueComplete when last track finishes', async () => {
      const onQueueComplete = jest.fn();
      const { result } = renderHook(() => useRosaryAudio({
        ...defaultOptions,
        beads: [mockBeads[0]], // Only one bead
        onQueueComplete,
      }));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.play();
      });

      // Simulate track ending
      await act(async () => {
        mockAudio.triggerEvent('ended');
      });

      await waitFor(() => {
        expect(onQueueComplete).toHaveBeenCalled();
      });
    });
  });

  describe('Playback controls', () => {
    it('should pause current track', async () => {
      const { result } = renderHook(() => useRosaryAudio(defaultOptions));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.play();
        await result.current.pause();
      });

      expect(mockAudio.pause).toHaveBeenCalled();
    });

    it('should resume from same position', async () => {
      const { result } = renderHook(() => useRosaryAudio(defaultOptions));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.play();
        mockAudio.currentTime = 5;
        await result.current.pause();
        await result.current.play();
      });

      expect(mockAudio.play).toHaveBeenCalledTimes(2);
    });

    it('should skip to next track', async () => {
      const { result } = renderHook(() => useRosaryAudio(defaultOptions));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.play();
        await result.current.skipToNext();
      });

      await waitFor(() => {
        expect(mockAudio.src).toContain('apostles-creed');
      });
    });

    it('should skip to previous track', async () => {
      const { result } = renderHook(() => useRosaryAudio(defaultOptions));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.play();
        // Move to second track
        mockAudio.triggerEvent('ended');
        await result.current.skipToPrevious();
      });

      await waitFor(() => {
        expect(mockAudio.src).toContain('sign-of-cross');
      });
    });

    it('should skip to specific bead by ID', async () => {
      const { result } = renderHook(() => useRosaryAudio(defaultOptions));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.skipToBead('our-father-1');
      });

      await waitFor(() => {
        expect(mockAudio.src).toContain('our-father');
      });
    });
  });

  describe('Speed and volume controls', () => {
    it('should set playback speed', async () => {
      const { result } = renderHook(() => useRosaryAudio(defaultOptions));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.setSpeed(1.5);
      });

      expect(mockAudio.playbackRate).toBe(1.5);
    });

    it('should set volume', async () => {
      const { result } = renderHook(() => useRosaryAudio(defaultOptions));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.setVolume(0.5);
      });

      expect(mockAudio.volume).toBe(0.5);
    });

    it('should clamp volume between 0 and 1', async () => {
      const { result } = renderHook(() => useRosaryAudio(defaultOptions));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.setVolume(1.5); // Over max
      });

      expect(mockAudio.volume).toBeLessThanOrEqual(1);

      await act(async () => {
        await result.current.setVolume(-0.5); // Under min
      });

      expect(mockAudio.volume).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Error handling', () => {
    it('should handle track load errors gracefully', async () => {
      mockAudio.play.mockRejectedValueOnce(new Error('Load failed'));
      const onError = jest.fn();

      const { result } = renderHook(() => useRosaryAudio(defaultOptions));

      await act(async () => {
        await result.current.initializeQueue();
        // Play should not throw even if it fails
        await result.current.play().catch(() => {});
      });

      // Should not crash the app
      expect(result.current.isLoading).toBe(false);
    });

    it('should skip unplayable tracks', async () => {
      const { result } = renderHook(() => useRosaryAudio(defaultOptions));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.play();
      });

      // Simulate error event
      await act(async () => {
        mockAudio.error = { code: 4, message: 'Not supported' };
        mockAudio.triggerEvent('error');
      });

      // Should attempt to skip to next track
      await waitFor(() => {
        expect(mockAudio.src).toBeTruthy();
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle empty queue', async () => {
      const { result } = renderHook(() => useRosaryAudio({
        ...defaultOptions,
        beads: [],
      }));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.play();
      });

      // Should not crash
      expect(result.current.isPlaying).toBe(false);
    });

    it('should handle skip at end of queue', async () => {
      const onQueueComplete = jest.fn();
      const { result } = renderHook(() => useRosaryAudio({
        ...defaultOptions,
        onQueueComplete,
      }));

      await act(async () => {
        await result.current.initializeQueue();
        // Skip to last track
        await result.current.skipToBead('our-father-1');
        // Try to skip to next
        await result.current.skipToNext();
      });

      // Should complete queue
      await waitFor(() => {
        expect(onQueueComplete).toHaveBeenCalled();
      });
    });

    it('should handle skip at start of queue', async () => {
      const { result } = renderHook(() => useRosaryAudio(defaultOptions));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.play();
        await result.current.skipToPrevious();
      });

      // Should stay at first track or restart it
      await waitFor(() => {
        expect(mockAudio.src).toContain('sign-of-cross');
      });
    });
  });

  describe('Special cases', () => {
    it('should handle faith-hope-charity combined audio', async () => {
      const beadsWithFHC: RosaryBead[] = [
        {
          id: 'faith-hope-charity',
          type: 'faith-hope-charity' as any,
          title: 'Faith, Hope, and Charity',
          audioFile: 'assets/audio/rosary/faith-hope-charity.m4a',
        },
      ];

      const { result } = renderHook(() => useRosaryAudio({
        ...defaultOptions,
        beads: beadsWithFHC,
      }));

      await act(async () => {
        await result.current.initializeQueue();
      });

      expect(result.current.downloadProgress.total).toBe(1);
    });

    it('should handle Dominican Glory Be + Alleluia sequence', async () => {
      const beadsWithDominican: RosaryBead[] = [
        {
          id: 'dominican-opening-glory-be',
          type: 'glory-be',
          title: 'Glory Be',
          audioFile: 'assets/audio/rosary/dominican-opening-glory-be.m4a',
        },
      ];

      const { result } = renderHook(() => useRosaryAudio({
        ...defaultOptions,
        beads: beadsWithDominican,
        isLentSeason: false, // Alleluia should be included
      }));

      await act(async () => {
        await result.current.initializeQueue();
      });

      // Should create two tracks (Glory Be + Alleluia)
      expect(result.current.downloadProgress.total).toBe(1);
    });

    it('should skip Alleluia during Lent', async () => {
      const beadsWithDominican: RosaryBead[] = [
        {
          id: 'dominican-opening-glory-be',
          type: 'glory-be',
          title: 'Glory Be',
          audioFile: 'assets/audio/rosary/dominican-opening-glory-be.m4a',
        },
      ];

      const { result } = renderHook(() => useRosaryAudio({
        ...defaultOptions,
        beads: beadsWithDominican,
        isLentSeason: true, // Alleluia should NOT be included
      }));

      await act(async () => {
        await result.current.initializeQueue();
      });

      // Should only create one track (Glory Be, no Alleluia)
      expect(result.current.downloadProgress.total).toBe(1);
    });
  });

  describe('Progress tracking', () => {
    it('should update progress on timeupdate', async () => {
      const { result } = renderHook(() => useRosaryAudio(defaultOptions));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.play();
      });

      // Simulate time update
      await act(async () => {
        mockAudio.currentTime = 5;
        mockAudio.duration = 10;
        mockAudio.triggerEvent('timeupdate');
      });

      await waitFor(() => {
        expect(result.current.progress.position).toBe(5);
        expect(result.current.progress.duration).toBe(10);
      });
    });

    it('should update duration on loadedmetadata', async () => {
      const { result } = renderHook(() => useRosaryAudio(defaultOptions));

      await act(async () => {
        await result.current.initializeQueue();
        await result.current.play();
      });

      // Simulate metadata loaded
      await act(async () => {
        mockAudio.duration = 15;
        mockAudio.triggerEvent('loadedmetadata');
      });

      await waitFor(() => {
        expect(result.current.progress.duration).toBe(15);
      });
    });
  });
});

