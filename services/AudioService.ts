import { Audio } from 'expo-av';

interface AudioSettings {
  rate: number;
  pitch: number;
  volume: number;
  voice: string;
}

interface AudioState {
  isPlaying: boolean;
  isPaused: boolean;
  currentPosition: number;
  duration: number;
  currentText: string;
}

class AudioService {
  private speechSynthesis: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioState: AudioState = {
    isPlaying: false,
    isPaused: false,
    currentPosition: 0,
    duration: 0,
    currentText: ''
  };
  private settings: AudioSettings = {
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    voice: 'default'
  };

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.speechSynthesis = window.speechSynthesis;
    }
  }

  /**
   * Start text-to-speech for given text
   */
  async startSpeaking(text: string): Promise<void> {
    if (!this.speechSynthesis) {
      throw new Error('Speech synthesis not available');
    }

    this.stopSpeaking();
    
    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.rate = this.settings.rate;
    this.currentUtterance.pitch = this.settings.pitch;
    this.currentUtterance.volume = this.settings.volume;
    
    if (this.settings.voice !== 'default') {
      const voices = this.speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.name === this.settings.voice);
      if (selectedVoice) {
        this.currentUtterance.voice = selectedVoice;
      }
    }

    this.currentUtterance.onstart = () => {
      this.audioState.isPlaying = true;
      this.audioState.isPaused = false;
      this.audioState.currentText = text;
    };

    this.currentUtterance.onend = () => {
      this.audioState.isPlaying = false;
      this.audioState.isPaused = false;
    };

    this.currentUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
      this.audioState.isPlaying = false;
    };

    this.speechSynthesis.speak(this.currentUtterance);
  }

  /**
   * Pause text-to-speech
   */
  pauseSpeaking(): void {
    if (this.speechSynthesis && this.audioState.isPlaying) {
      this.speechSynthesis.pause();
      this.audioState.isPaused = true;
    }
  }

  /**
   * Resume text-to-speech
   */
  resumeSpeaking(): void {
    if (this.speechSynthesis && this.audioState.isPaused) {
      this.speechSynthesis.resume();
      this.audioState.isPaused = false;
    }
  }

  /**
   * Stop text-to-speech
   */
  stopSpeaking(): void {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
      this.audioState.isPlaying = false;
      this.audioState.isPaused = false;
    }
  }

  /**
   * Get current audio state
   */
  getAudioState(): AudioState {
    return { ...this.audioState };
  }

  /**
   * Update audio settings
   */
  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get available voices
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if (!this.speechSynthesis) return [];
    return this.speechSynthesis.getVoices();
  }

  /**
   * Get current settings
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }
}

export default new AudioService();