/**
 * Audio State Manager
 * Global state coordinator for all audio playback in the app.
 * Manages multiple audio types (rosary, podcast, etc.) and coordinates
 * remote control events from iOS/Android system controls.
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

interface AudioTypeHandlers {
  type: AudioType;
  handlers: AudioHandlers;
}

class AudioStateManagerClass {
  private activeAudioType: AudioType = null;
  private registeredHandlers: Map<AudioType, AudioHandlers> = new Map();

  /**
   * Register handlers for a specific audio type
   */
  registerAudioHandlers(type: AudioType, handlers: AudioHandlers): void {
    if (!type) {
      console.warn('[AudioStateManager] Cannot register handlers for null type');
      return;
    }
    
    console.log(`[AudioStateManager] Registering handlers for: ${type}`);
    this.registeredHandlers.set(type, handlers);
  }

  /**
   * Unregister handlers for a specific audio type
   */
  unregisterAudioHandlers(type: AudioType): void {
    if (!type) return;
    
    console.log(`[AudioStateManager] Unregistering handlers for: ${type}`);
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
    console.log(`[AudioStateManager] Setting active audio type: ${type}`);
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
      console.warn(`[AudioStateManager] No active handlers for command: ${command}`);
      return false;
    }

    const handler = handlers[command];
    if (!handler) {
      console.warn(`[AudioStateManager] No handler registered for command: ${command}`);
      return false;
    }

    try {
      console.log(`[AudioStateManager] Executing ${command} for ${this.activeAudioType}`);
      await handler(...args);
      return true;
    } catch (error) {
      console.error(`[AudioStateManager] Error executing ${command}:`, error);
      return false;
    }
  }

  /**
   * Clear all registered handlers (useful for cleanup/testing)
   */
  clearAll(): void {
    console.log('[AudioStateManager] Clearing all handlers');
    this.registeredHandlers.clear();
    this.activeAudioType = null;
  }

  /**
   * Debug: Log current state
   */
  logState(): void {
    console.log('[AudioStateManager] Current state:', {
      activeType: this.activeAudioType,
      registeredTypes: Array.from(this.registeredHandlers.keys()),
    });
  }
}

// Export singleton instance
export const AudioStateManager = new AudioStateManagerClass();

