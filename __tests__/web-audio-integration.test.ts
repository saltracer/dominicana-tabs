/**
 * Integration tests for web audio coordination
 * Tests mutual pause behavior between rosary and podcast players
 */

import { AudioStateManager } from '../lib/audio-state-manager';

describe('Web Audio Integration', () => {
  beforeEach(() => {
    // Clear all handlers before each test
    AudioStateManager.clearAll();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('AudioStateManager web version', () => {
    it('should register handlers correctly', () => {
      const mockHandlers = {
        play: jest.fn(),
        pause: jest.fn(),
        stop: jest.fn(),
      };

      AudioStateManager.registerAudioHandlers('rosary', mockHandlers);

      const handlers = AudioStateManager.getHandlers('rosary');
      expect(handlers).toBeDefined();
      expect(handlers?.play).toBe(mockHandlers.play);
    });

    it('should unregister handlers correctly', () => {
      const mockHandlers = {
        play: jest.fn(),
        pause: jest.fn(),
      };

      AudioStateManager.registerAudioHandlers('rosary', mockHandlers);
      AudioStateManager.unregisterAudioHandlers('rosary');

      const handlers = AudioStateManager.getHandlers('rosary');
      expect(handlers).toBeNull();
    });

    it('should set and get active audio type', () => {
      AudioStateManager.setActiveAudioType('rosary');
      expect(AudioStateManager.getActiveAudioType()).toBe('rosary');

      AudioStateManager.setActiveAudioType('podcast');
      expect(AudioStateManager.getActiveAudioType()).toBe('podcast');
    });

    it('should emit events when audio plays', () => {
      const listener = jest.fn();
      
      AudioStateManager.on('audio-play-started', listener);
      AudioStateManager.emit('audio-play-started', { type: 'rosary' });

      expect(listener).toHaveBeenCalledWith({ type: 'rosary' });
    });

    it('should handle multiple event listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      
      AudioStateManager.on('audio-play-started', listener1);
      AudioStateManager.on('audio-play-started', listener2);
      AudioStateManager.emit('audio-play-started', { type: 'podcast' });

      expect(listener1).toHaveBeenCalledWith({ type: 'podcast' });
      expect(listener2).toHaveBeenCalledWith({ type: 'podcast' });
    });

    it('should unsubscribe from events', () => {
      const listener = jest.fn();
      
      AudioStateManager.on('audio-play-started', listener);
      AudioStateManager.off('audio-play-started', listener);
      AudioStateManager.emit('audio-play-started', { type: 'rosary' });

      expect(listener).not.toHaveBeenCalled();
    });

    it('should handle errors in event listeners gracefully', () => {
      const errorListener = jest.fn(() => {
        throw new Error('Listener error');
      });
      const normalListener = jest.fn();
      
      AudioStateManager.on('audio-play-started', errorListener);
      AudioStateManager.on('audio-play-started', normalListener);

      // Should not throw, and other listeners should still execute
      expect(() => {
        AudioStateManager.emit('audio-play-started', { type: 'rosary' });
      }).not.toThrow();

      expect(errorListener).toHaveBeenCalled();
      expect(normalListener).toHaveBeenCalled();
    });
  });

  describe('Mutual pause behavior', () => {
    it('should notify when rosary starts playing', () => {
      const listener = jest.fn();
      AudioStateManager.on('audio-play-started', listener);

      // Simulate rosary starting
      AudioStateManager.setActiveAudioType('rosary');
      AudioStateManager.emit('audio-play-started', { type: 'rosary' });

      expect(listener).toHaveBeenCalledWith({ type: 'rosary' });
      expect(AudioStateManager.getActiveAudioType()).toBe('rosary');
    });

    it('should notify when podcast starts playing', () => {
      const listener = jest.fn();
      AudioStateManager.on('audio-play-started', listener);

      // Simulate podcast starting
      AudioStateManager.setActiveAudioType('podcast');
      AudioStateManager.emit('audio-play-started', { type: 'podcast' });

      expect(listener).toHaveBeenCalledWith({ type: 'podcast' });
      expect(AudioStateManager.getActiveAudioType()).toBe('podcast');
    });

    it('should allow rosary to listen for podcast events', () => {
      const rosaryPauseHandler = jest.fn();

      // Rosary registers a listener for other audio starting
      AudioStateManager.on('audio-play-started', ({ type }) => {
        if (type !== 'rosary') {
          rosaryPauseHandler();
        }
      });

      // Podcast starts playing
      AudioStateManager.emit('audio-play-started', { type: 'podcast' });

      // Rosary should have been notified and paused
      expect(rosaryPauseHandler).toHaveBeenCalled();
    });

    it('should allow podcast to listen for rosary events', () => {
      const podcastPauseHandler = jest.fn();

      // Podcast registers a listener for other audio starting
      AudioStateManager.on('audio-play-started', ({ type }) => {
        if (type !== 'podcast') {
          podcastPauseHandler();
        }
      });

      // Rosary starts playing
      AudioStateManager.emit('audio-play-started', { type: 'rosary' });

      // Podcast should have been notified and paused
      expect(podcastPauseHandler).toHaveBeenCalled();
    });

    it('should not trigger own pause when starting', () => {
      const rosaryPauseHandler = jest.fn();

      // Rosary registers a listener that only pauses for OTHER audio
      AudioStateManager.on('audio-play-started', ({ type }) => {
        if (type !== 'rosary') {
          rosaryPauseHandler();
        }
      });

      // Rosary starts playing
      AudioStateManager.emit('audio-play-started', { type: 'rosary' });

      // Rosary should NOT pause itself
      expect(rosaryPauseHandler).not.toHaveBeenCalled();
    });

    it('should handle rapid switching between players', () => {
      const rosaryPauses = jest.fn();
      const podcastPauses = jest.fn();

      // Register pause handlers for both
      AudioStateManager.on('audio-play-started', ({ type }) => {
        if (type === 'podcast') rosaryPauses();
        if (type === 'rosary') podcastPauses();
      });

      // Switch rapidly
      AudioStateManager.emit('audio-play-started', { type: 'rosary' });
      AudioStateManager.emit('audio-play-started', { type: 'podcast' });
      AudioStateManager.emit('audio-play-started', { type: 'rosary' });
      AudioStateManager.emit('audio-play-started', { type: 'podcast' });

      expect(rosaryPauses).toHaveBeenCalledTimes(2);
      expect(podcastPauses).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event types', () => {
    it('should handle audio-play-started events', () => {
      const listener = jest.fn();
      AudioStateManager.on('audio-play-started', listener);
      AudioStateManager.emit('audio-play-started', { type: 'rosary' });

      expect(listener).toHaveBeenCalledWith({ type: 'rosary' });
    });

    it('should handle audio-paused events', () => {
      const listener = jest.fn();
      AudioStateManager.on('audio-paused', listener);
      AudioStateManager.emit('audio-paused', { type: 'podcast' });

      expect(listener).toHaveBeenCalledWith({ type: 'podcast' });
    });

    it('should handle audio-stopped events', () => {
      const listener = jest.fn();
      AudioStateManager.on('audio-stopped', listener);
      AudioStateManager.emit('audio-stopped', { type: 'rosary' });

      expect(listener).toHaveBeenCalledWith({ type: 'rosary' });
    });

    it('should handle custom event types', () => {
      const listener = jest.fn();
      AudioStateManager.on('custom-event', listener);
      AudioStateManager.emit('custom-event', { data: 'test' });

      expect(listener).toHaveBeenCalledWith({ data: 'test' });
    });
  });

  describe('Cleanup', () => {
    it('should clear all handlers and listeners', () => {
      const mockHandlers = { play: jest.fn() };
      const listener = jest.fn();

      AudioStateManager.registerAudioHandlers('rosary', mockHandlers);
      AudioStateManager.on('audio-play-started', listener);

      AudioStateManager.clearAll();

      expect(AudioStateManager.getHandlers('rosary')).toBeNull();
      expect(AudioStateManager.getActiveAudioType()).toBeNull();

      // Events should not fire after clear
      AudioStateManager.emit('audio-play-started', { type: 'rosary' });
      expect(listener).not.toHaveBeenCalled();
    });

    it('should clear active type when unregistering active handler', () => {
      const mockHandlers = { play: jest.fn() };
      
      AudioStateManager.registerAudioHandlers('rosary', mockHandlers);
      AudioStateManager.setActiveAudioType('rosary');
      
      AudioStateManager.unregisterAudioHandlers('rosary');

      expect(AudioStateManager.getActiveAudioType()).toBeNull();
    });

    it('should not affect other registered handlers when unregistering one', () => {
      const rosaryHandlers = { play: jest.fn() };
      const podcastHandlers = { play: jest.fn() };

      AudioStateManager.registerAudioHandlers('rosary', rosaryHandlers);
      AudioStateManager.registerAudioHandlers('podcast', podcastHandlers);

      AudioStateManager.unregisterAudioHandlers('rosary');

      expect(AudioStateManager.getHandlers('rosary')).toBeNull();
      expect(AudioStateManager.getHandlers('podcast')).toBeDefined();
    });
  });

  describe('State debugging', () => {
    it('should log current state', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      AudioStateManager.registerAudioHandlers('rosary', { play: jest.fn() });
      AudioStateManager.setActiveAudioType('rosary');
      AudioStateManager.on('audio-play-started', jest.fn());

      AudioStateManager.logState();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[AudioStateManager] Current state:',
        expect.objectContaining({
          activeType: 'rosary',
          registeredTypes: expect.arrayContaining(['rosary']),
          registeredEvents: expect.arrayContaining(['audio-play-started']),
        })
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Remote command execution', () => {
    it('should execute remote play command', async () => {
      const playHandler = jest.fn().mockResolvedValue(undefined);
      
      AudioStateManager.registerAudioHandlers('rosary', {
        play: playHandler,
      });
      AudioStateManager.setActiveAudioType('rosary');

      const result = await AudioStateManager.executeRemoteCommand('play');

      expect(result).toBe(true);
      expect(playHandler).toHaveBeenCalled();
    });

    it('should execute remote pause command', async () => {
      const pauseHandler = jest.fn().mockResolvedValue(undefined);
      
      AudioStateManager.registerAudioHandlers('podcast', {
        pause: pauseHandler,
      });
      AudioStateManager.setActiveAudioType('podcast');

      const result = await AudioStateManager.executeRemoteCommand('pause');

      expect(result).toBe(true);
      expect(pauseHandler).toHaveBeenCalled();
    });

    it('should return false if no active audio type', async () => {
      const result = await AudioStateManager.executeRemoteCommand('play');

      expect(result).toBe(false);
    });

    it('should return false if command handler not registered', async () => {
      AudioStateManager.registerAudioHandlers('rosary', {
        play: jest.fn(),
        // No pause handler
      });
      AudioStateManager.setActiveAudioType('rosary');

      const result = await AudioStateManager.executeRemoteCommand('pause');

      expect(result).toBe(false);
    });

    it('should handle errors in command execution', async () => {
      const errorHandler = jest.fn().mockRejectedValue(new Error('Command failed'));
      
      AudioStateManager.registerAudioHandlers('rosary', {
        play: errorHandler,
      });
      AudioStateManager.setActiveAudioType('rosary');

      const result = await AudioStateManager.executeRemoteCommand('play');

      expect(result).toBe(false);
      expect(errorHandler).toHaveBeenCalled();
    });
  });
});

