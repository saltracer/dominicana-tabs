/**
 * Audio State Manager - Web Version
 * Simplified global state coordinator for audio playback on web.
 * Uses event emitter pattern for coordination instead of TrackPlayer-specific logic.
 */

export type AudioType = 'rosary' | 'podcast' | 'other' | null;

export interface AudioHandlers {
  play?: () => Promise<void> | void;
  pause?: () => Promise<void> | void;
  stop?: () => Promise<void> | void;
  next?: () => Promise<void> | void;
  previous?: () => Promise<void> | void;
  seekTo?: (position: number) => Promise<void> | void;
}

class AudioStateManagerClass {
  private activeAudioType: AudioType = null;
  private registeredHandlers: Map<AudioType, AudioHandlers> = new Map();
  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Register handlers for a specific audio type
   */
  registerAudioHandlers(type: AudioType, handlers: AudioHandlers): void {
    if (!type) {
      console.warn('[AudioStateManager Web] Cannot register handlers for null type');
      return;
    }
    
    console.log(`[AudioStateManager Web] Registering handlers for: ${type}`);
    this.registeredHandlers.set(type, handlers);
  }

  /**
   * Unregister handlers for a specific audio type
   */
  unregisterAudioHandlers(type: AudioType): void {
    if (!type) return;
    
    console.log(`[AudioStateManager Web] Unregistering handlers for: ${type}`);
    this.registeredHandlers.delete(type);
    
    // If the active type is being unregistered, clear it
    if (this.activeAudioType === type) {
      this.activeAudioType = null;
    }
  }

  /**
   * Set the currently active audio type
   */
  setActiveAudioType(type: AudioType): void {
    console.log(`[AudioStateManager Web] Setting active audio type: ${type}`);
    this.activeAudioType = type;
  }

  /**
   * Get the currently active audio type
   */
  getActiveAudioType(): AudioType {
    return this.activeAudioType;
  }

  /**
   * Get handlers for the currently active audio type
   */
  getActiveHandlers(): AudioHandlers | null {
    if (!this.activeAudioType) {
      return null;
    }
    return this.registeredHandlers.get(this.activeAudioType) || null;
  }

  /**
   * Get handlers for a specific audio type
   */
  getHandlers(type: AudioType): AudioHandlers | null {
    if (!type) return null;
    return this.registeredHandlers.get(type) || null;
  }

  /**
   * Execute a remote command for the active audio type
   */
  async executeRemoteCommand(command: keyof AudioHandlers, ...args: any[]): Promise<boolean> {
    const handlers = this.getActiveHandlers();
    
    if (!handlers) {
      console.warn(`[AudioStateManager Web] No active handlers for command: ${command}`);
      return false;
    }

    const handler = handlers[command];
    if (!handler) {
      console.warn(`[AudioStateManager Web] No handler registered for command: ${command}`);
      return false;
    }

    try {
      console.log(`[AudioStateManager Web] Executing ${command} for ${this.activeAudioType}`);
      await handler(...args);
      return true;
    } catch (error) {
      console.error(`[AudioStateManager Web] Error executing ${command}:`, error);
      return false;
    }
  }

  /**
   * Subscribe to events
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    console.log(`[AudioStateManager Web] Subscribed to event: ${event}`);
  }

  /**
   * Unsubscribe from events
   */
  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      console.log(`[AudioStateManager Web] Unsubscribed from event: ${event}`);
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      console.log(`[AudioStateManager Web] Emitting event: ${event}`, data);
      eventListeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[AudioStateManager Web] Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Clear all registered handlers (useful for cleanup/testing)
   */
  clearAll(): void {
    console.log('[AudioStateManager Web] Clearing all handlers');
    this.registeredHandlers.clear();
    this.listeners.clear();
    this.activeAudioType = null;
  }

  /**
   * Debug: Log current state
   */
  logState(): void {
    console.log('[AudioStateManager Web] Current state:', {
      activeType: this.activeAudioType,
      registeredTypes: Array.from(this.registeredHandlers.keys()),
      registeredEvents: Array.from(this.listeners.keys()),
    });
  }
}

// Export singleton instance
export const AudioStateManager = new AudioStateManagerClass();

