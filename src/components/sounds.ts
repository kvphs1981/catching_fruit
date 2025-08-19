// /**
//  * Responsive Sound Manager for Basket Catching Game
//  * Optimized for different devices and user preferences
//  */

// export interface SoundConfig {
//   volume: number;
//   frequency: number;
//   duration: number;
//   type: 'sine' | 'square' | 'triangle' | 'sawtooth';
//   enabled: boolean;
// }

// export interface DeviceAudioCapabilities {
//   supportsWebAudio: boolean;
//   supportsAudioAPI: boolean;
//   isMobile: boolean;
//   isLowPerformance: boolean;
//   preferredFormat: 'wav' | 'mp3' | 'ogg';
// }

// export class SoundManager {
//   private sounds: { [key: string]: HTMLAudioElement } = {};
//   private audioContext: AudioContext | null = null;
//   private config: { [key: string]: SoundConfig } = {};
//   private deviceCapabilities: DeviceAudioCapabilities = {
//     supportsWebAudio: false,
//     supportsAudioAPI: false,
//     isMobile: false,
//     isLowPerformance: false,
//     preferredFormat: 'wav',
//   };
//   private masterVolume: number = 0.5;
//   private soundsEnabled: boolean = true;
//   private isInitialized: boolean = false;

//   constructor() {
//     this.detectDeviceCapabilities();
//     this.initializeDefaultConfig();
//     this.createSounds();
//   }

//   /**
//    * Detect device audio capabilities for optimization
//    */
//   private detectDeviceCapabilities(): void {
//     const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
//     const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
//     const isLowEnd = /Android.*Chrome\/[1-5][0-9]|iPhone.*OS [1-9]_/.test(userAgent);
//     const hasLowConcurrency =
//       typeof navigator !== 'undefined' &&
//       typeof navigator.hardwareConcurrency === 'number' &&
//       navigator.hardwareConcurrency < 4;

//     this.deviceCapabilities = {
//       supportsWebAudio: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
//       supportsAudioAPI: typeof Audio !== 'undefined',
//       isMobile: isMobile,
//       isLowPerformance: Boolean(isLowEnd) || Boolean(hasLowConcurrency),
//       preferredFormat: this.detectPreferredAudioFormat(),
//     };
//   }

//   /**
//    * Detect the best audio format for the current browser
//    */
//   private detectPreferredAudioFormat(): 'wav' | 'mp3' | 'ogg' {
//     if (typeof Audio === 'undefined') return 'wav';

//     const audio = new Audio();

//     // Test format support
//     if (audio.canPlayType('audio/ogg') && audio.canPlayType('audio/ogg').replace(/no/, '')) {
//       return 'ogg';
//     } else if (audio.canPlayType('audio/mp3') && audio.canPlayType('audio/mp3').replace(/no/, '')) {
//       return 'mp3';
//     } else {
//       return 'wav';
//     }
//   }

//   /**
//    * Initialize default sound configuration with responsive settings
//    */
//   private initializeDefaultConfig(): void {
//     const baseVolume = this.deviceCapabilities.isMobile ? 0.3 : 0.5;
//     const baseDuration = this.deviceCapabilities.isLowPerformance ? 0.1 : 0.2;

//     this.config = {
//       correct: {
//         volume: baseVolume,
//         frequency: this.deviceCapabilities.isMobile ? 600 : 800,
//         duration: baseDuration * 1.5,
//         type: 'sine',
//         enabled: true,
//       },
//       wrong: {
//         volume: baseVolume,
//         frequency: this.deviceCapabilities.isMobile ? 150 : 200,
//         duration: baseDuration * 2,
//         type: 'square',
//         enabled: true,
//       },
//       catch: {
//         volume: baseVolume * 0.8,
//         frequency: this.deviceCapabilities.isMobile ? 400 : 600,
//         duration: baseDuration * 0.75,
//         type: 'triangle',
//         enabled: true,
//       },
//       spawn: {
//         volume: baseVolume * 0.6,
//         frequency: this.deviceCapabilities.isMobile ? 300 : 400,
//         duration: baseDuration,
//         type: 'sine',
//         enabled: true,
//       },
//       gameOver: {
//         volume: baseVolume * 1.2,
//         frequency: this.deviceCapabilities.isMobile ? 100 : 150,
//         duration: baseDuration * 3,
//         type: 'sawtooth',
//         enabled: true,
//       },
//       levelUp: {
//         volume: baseVolume,
//         frequency: this.deviceCapabilities.isMobile ? 800 : 1000,
//         duration: baseDuration * 2,
//         type: 'sine',
//         enabled: true,
//       },
//     };
//   }

//   /**
//    * Create audio elements with generated sounds optimized for device
//    */
//   private createSounds(): void {
//     Object.keys(this.config).forEach((soundName) => {
//       const config = this.config[soundName];

//       try {
//         if (this.deviceCapabilities.supportsWebAudio && !this.deviceCapabilities.isLowPerformance) {
//           // Use Web Audio API for better performance on capable devices
//           this.sounds[soundName] = this.createWebAudioSound(config);
//         } else {
//           // Use HTML Audio API for compatibility
//           this.sounds[soundName] = this.createHTMLAudioSound(config);
//         }
//       } catch (error: any) {
//         console.warn(`Failed to create sound ${soundName}:`, error);
//         // Create a silent fallback
//         this.sounds[soundName] = this.createSilentSound();
//       }
//     });
//   }

//   /**
//    * Create sound using Web Audio API (better quality, more features)
//    */
//   private createWebAudioSound(config: SoundConfig): HTMLAudioElement {
//     const audioUrl = this.generateWebAudioTone(
//       config.frequency,
//       config.duration,
//       config.type,
//       config.volume
//     );

//     const audio = new Audio(audioUrl);
//     audio.volume = this.calculateResponsiveVolume(config.volume);
//     audio.preload = 'auto';

//     return audio;
//   }

//   /**
//    * Create sound using HTML Audio API (fallback)
//    */
//   private createHTMLAudioSound(config: SoundConfig): HTMLAudioElement {
//     const audioUrl = this.createBeepDataURL(
//       config.frequency,
//       config.duration,
//       config.volume
//     );

//     const audio = new Audio(audioUrl);
//     audio.volume = this.calculateResponsiveVolume(config.volume);
//     audio.preload = 'auto';

//     return audio;
//   }

//   /**
//    * Create a silent audio element as fallback
//    */
//   private createSilentSound(): HTMLAudioElement {
//     const silentUrl = this.createBeepDataURL(0, 0.01, 0);
//     const audio = new Audio(silentUrl);
//     audio.volume = 0;
//     return audio;
//   }

//   /**
//    * Generate Web Audio API tone with better quality
//    */
//   private generateWebAudioTone(
//     frequency: number,
//     duration: number,
//     waveType: OscillatorType,
//     amplitude: number
//   ): string {
//     const sampleRate = this.deviceCapabilities.isMobile ? 22050 : 44100; // Lower sample rate for mobile
//     const numSamples = Math.floor(sampleRate * duration);
//     const buffer = new ArrayBuffer(44 + numSamples * 2);
//     const view = new DataView(buffer);

//     // WAV header
//     const writeString = (offset: number, string: string) => {
//       for (let i = 0; i < string.length; i++) {
//         view.setUint8(offset + i, string.charCodeAt(i));
//       }
//     };

//     writeString(0, 'RIFF');
//     view.setUint32(4, 36 + numSamples * 2, true);
//     writeString(8, 'WAVE');
//     writeString(12, 'fmt ');
//     view.setUint32(16, 16, true);
//     view.setUint16(20, 1, true); // PCM
//     view.setUint16(22, 1, true); // Mono
//     view.setUint32(24, sampleRate, true);
//     view.setUint32(28, sampleRate * 2, true);
//     view.setUint16(32, 2, true);
//     view.setUint16(34, 16, true);
//     writeString(36, 'data');
//     view.setUint32(40, numSamples * 2, true);

//     // Generate waveform based on type
//     for (let i = 0; i < numSamples; i++) {
//       const t = i / sampleRate;
//       const phase = 2 * Math.PI * frequency * t;
//       let sample: number;

//       switch (waveType) {
//         case 'sine':
//           sample = Math.sin(phase);
//           break;
//         case 'square':
//           sample = Math.sin(phase) > 0 ? 1 : -1;
//           break;
//         case 'triangle':
//           sample = (2 / Math.PI) * Math.asin(Math.sin(phase));
//           break;
//         case 'sawtooth':
//           sample = (2 / Math.PI) * Math.atan(Math.tan(phase / 2));
//           break;
//         default:
//           sample = Math.sin(phase);
//       }

//       // Apply envelope to prevent clicks
//       const envelope = this.calculateEnvelope(i, numSamples);
//       const finalSample = sample * amplitude * envelope * 0.3 * 32767;

//       view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, finalSample)), true);
//     }

//     const blob = new Blob([buffer], { type: 'audio/wav' });
//     return URL.createObjectURL(blob);
//   }

//   /**
//    * Create simple beep using data URL (compatibility fallback)
//    */
//   private createBeepDataURL(frequency: number, duration: number, amplitude: number = 0.3): string {
//     const sampleRate = this.deviceCapabilities.isMobile ? 22050 : 44100;
//     const numSamples = Math.floor(sampleRate * duration);
//     const buffer = new ArrayBuffer(44 + numSamples * 2);
//     const view = new DataView(buffer);

//     // Simple WAV header
//     const writeString = (offset: number, string: string) => {
//       for (let i = 0; i < string.length; i++) {
//         view.setUint8(offset + i, string.charCodeAt(i));
//       }
//     };

//     writeString(0, 'RIFF');
//     view.setUint32(4, 36 + numSamples * 2, true);
//     writeString(8, 'WAVE');
//     writeString(12, 'fmt ');
//     view.setUint32(16, 16, true);
//     view.setUint16(20, 1, true);
//     view.setUint16(22, 1, true);
//     view.setUint32(24, sampleRate, true);
//     view.setUint32(28, sampleRate * 2, true);
//     view.setUint16(32, 2, true);
//     view.setUint16(34, 16, true);
//     writeString(36, 'data');
//     view.setUint32(40, numSamples * 2, true);

//     // Generate simple sine wave
//     for (let i = 0; i < numSamples; i++) {
//       const envelope = this.calculateEnvelope(i, numSamples);
//       const sample = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * amplitude * envelope * 32767;
//       view.setInt16(44 + i * 2, Math.max(-32768, Math.min(32767, sample)), true);
//     }

//     const blob = new Blob([buffer], { type: 'audio/wav' });
//     return URL.createObjectURL(blob);
//   }

//   /**
//    * Calculate envelope to prevent audio clicks and pops
//    */
//   private calculateEnvelope(sampleIndex: number, totalSamples: number): number {
//     const fadeLength = Math.min(totalSamples * 0.1, 1000); // 10% fade or max 1000 samples

//     if (sampleIndex < fadeLength) {
//       // Fade in
//       return sampleIndex / fadeLength;
//     } else if (sampleIndex > totalSamples - fadeLength) {
//       // Fade out
//       return (totalSamples - sampleIndex) / fadeLength;
//     } else {
//       // Full volume
//       return 1;
//     }
//   }

//   /**
//    * Calculate responsive volume based on device and user preferences
//    */
//   private calculateResponsiveVolume(configVolume: number): number {
//     let adjustedVolume = configVolume * this.masterVolume;

//     // Reduce volume on mobile devices to prevent distortion
//     if (this.deviceCapabilities.isMobile) {
//       adjustedVolume *= 0.7;
//     }

//     // Further reduce on low-performance devices
//     if (this.deviceCapabilities.isLowPerformance) {
//       adjustedVolume *= 0.8;
//     }

//     return Math.max(0, Math.min(1, adjustedVolume));
//   }

//   /**
//    * Initialize audio context (requires user interaction)
//    */
//   private async initializeAudioContext(): Promise<void> {
//     if (this.isInitialized) return;

//     try {
//       if (this.deviceCapabilities.supportsWebAudio) {
//         const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
//         this.audioContext = new AudioContextClass();

//         // Resume audio context if suspended (mobile requirement)
//         if (this.audioContext.state === 'suspended') {
//           await this.audioContext.resume();
//         }
//       }

//       this.isInitialized = true;
//     } catch (error: any) {
//       console.warn('Failed to initialize audio context:', error);
//       this.isInitialized = false;
//     }
//   }

//   /**
//    * Play a sound with responsive optimizations
//    */
//   public async play(
//     soundName: string,
//     options?: { volume?: number; playbackRate?: number }
//   ): Promise<void> {
//     if (!this.soundsEnabled || !this.config[soundName]?.enabled) {
//       return;
//     }

//     // Initialize audio context on first play (user interaction requirement)
//     if (!this.isInitialized) {
//       await this.initializeAudioContext();
//     }

//     const audio = this.sounds[soundName];
//     if (!audio) {
//       console.warn(`Sound ${soundName} not found`);
//       return;
//     }

//     try {
//       // Reset audio to beginning
//       audio.currentTime = 0;

//       // Apply options if provided
//       if (options?.volume !== undefined) {
//         audio.volume = this.calculateResponsiveVolume(options.volume);
//       }

//       if (options?.playbackRate !== undefined && !this.deviceCapabilities.isLowPerformance) {
//         audio.playbackRate = Math.max(0.25, Math.min(4, options.playbackRate));
//       }

//       // Play with error handling
//       const playPromise = audio.play();

//       if (playPromise !== undefined) {
//         await playPromise;
//       }

//       // Debug logging for development
//       if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
//         console.log(`Playing ${soundName} sound - Volume: ${audio.volume.toFixed(2)}`);
//       }
//     } catch (error: any) {
//       // Handle autoplay policies and other errors gracefully
//       console.warn(`Error playing sound ${soundName}:`, error);

//       // Try to play again after a short delay (sometimes helps with timing issues)
//       if (error && error.name === 'NotAllowedError' && !this.deviceCapabilities.isMobile) {
//         setTimeout(() => {
//           audio.play().catch(() => {
//             console.warn(`Retry failed for sound ${soundName}`);
//           });
//         }, 100);
//       }
//     }
//   }

//   /**
//    * Set master volume for all sounds
//    */
//   public setMasterVolume(volume: number): void {
//     this.masterVolume = Math.max(0, Math.min(1, volume));

//     // Update all existing audio volumes
//     Object.keys(this.sounds).forEach((soundName) => {
//       const config = this.config[soundName];
//       if (config && this.sounds[soundName]) {
//         this.sounds[soundName].volume = this.calculateResponsiveVolume(config.volume);
//       }
//     });
//   }

//   /**
//    * Enable or disable all sounds
//    */
//   public setSoundsEnabled(enabled: boolean): void {
//     this.soundsEnabled = enabled;
//   }

//   /**
//    * Enable or disable specific sound
//    */
//   public setSoundEnabled(soundName: string, enabled: boolean): void {
//     if (this.config[soundName]) {
//       this.config[soundName].enabled = enabled;
//     }
//   }

//   /**
//    * Get current device capabilities
//    */
//   public getDeviceCapabilities(): DeviceAudioCapabilities {
//     return { ...this.deviceCapabilities };
//   }

//   /**
//    * Update sound configuration
//    */
//   public updateSoundConfig(soundName: string, newConfig: Partial<SoundConfig>): void {
//     if (this.config[soundName]) {
//       this.config[soundName] = { ...this.config[soundName], ...newConfig };

//       // Recreate the sound with new config
//       try {
//         if (this.deviceCapabilities.supportsWebAudio && !this.deviceCapabilities.isLowPerformance) {
//           this.sounds[soundName] = this.createWebAudioSound(this.config[soundName]);
//         } else {
//           this.sounds[soundName] = this.createHTMLAudioSound(this.config[soundName]);
//         }
//       } catch (error: any) {
//         console.warn(`Failed to update sound ${soundName}:`, error);
//       }
//     }
//   }

//   /**
//    * Preload all sounds (call after user interaction)
//    */
//   public async preloadSounds(): Promise<void> {
//     await this.initializeAudioContext();

//     const loadPromises = Object.keys(this.sounds).map((soundName) => {
//       return new Promise<void>((resolve) => {
//         const audio = this.sounds[soundName];
//         if (audio.readyState >= 2) {
//           resolve();
//         } else {
//           audio.addEventListener('canplaythrough', () => resolve(), { once: true });
//           audio.addEventListener('error', () => resolve(), { once: true }); // Resolve even on error
//           audio.load();
//         }
//       });
//     });

//     try {
//       await Promise.all(loadPromises);
//       console.log('All sounds preloaded successfully');
//     } catch (error: any) {
//       console.warn('Some sounds failed to preload:', error);
//     }
//   }

//   /**
//    * Clean up resources
//    */
//   public dispose(): void {
//     // Stop and clean up all audio elements
//     Object.values(this.sounds).forEach((audio) => {
//       audio.pause();
//       audio.src = '';
//       audio.load();
//     });

//     // Close audio context
//     if (this.audioContext && this.audioContext.state !== 'closed') {
//       this.audioContext.close();
//     }

//     this.sounds = {};
//     this.isInitialized = false;
//   }

//   /**
//    * Get sound configuration for debugging
//    */
//   public getSoundConfig(soundName?: string): any {
//     if (soundName) {
//       return this.config[soundName] ? { ...this.config[soundName] } : null;
//     }
//     return { ...this.config };
//   }

//   /**
//    * Test all sounds (for debugging)
//    */
//   public async testAllSounds(): Promise<void> {
//     console.log('Testing all sounds...');
//     const soundNames = Object.keys(this.sounds);

//     for (let i = 0; i < soundNames.length; i++) {
//       const soundName = soundNames[i];
//       console.log(`Testing sound: ${soundName}`);
//       await this.play(soundName);

//       // Wait between sounds
//       await new Promise((resolve) => setTimeout(resolve, 500));
//     }

//     console.log('Sound test complete');
//   }
// }

// export default SoundManager;


export class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: { [key: string]: AudioBuffer } = {};
  private enabled = true;

  constructor() {
    this.initAudioContext();
    this.generateSounds();
  }

  private initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Web Audio API not supported');
    }
  }

  private generateSounds() {
    if (!this.audioContext) return;

    // Generate catch sound (positive)
    this.sounds.catch = this.generateTone(523.25, 0.3, 'sine'); // C5
    
    // Generate correct sound (very positive)
    this.sounds.correct = this.generateChord([523.25, 659.25, 783.99], 0.5); // C-E-G major
    
    // Generate wrong sound (negative)
    this.sounds.wrong = this.generateTone(220, 0.4, 'sawtooth'); // A3
    
    // Generate spawn sound (neutral)
    this.sounds.spawn = this.generateTone(440, 0.2, 'triangle'); // A4
  }

  private generateTone(frequency: number, duration: number, type: OscillatorType = 'sine'): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ numberOfChannels: 1, length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const frameCount = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      if (type === 'sine') {
        sample = Math.sin(2 * Math.PI * frequency * t);
      } else if (type === 'sawtooth') {
        sample = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
      } else if (type === 'triangle') {
        sample = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
      }
      
      // Apply envelope (fade out)
      const envelope = Math.max(0, 1 - (t / duration));
      data[i] = sample * envelope * 0.3; // Volume control
    }

    return buffer;
  }

  private generateChord(frequencies: number[], duration: number): AudioBuffer {
    if (!this.audioContext) return new AudioBuffer({ numberOfChannels: 1, length: 1, sampleRate: 44100 });

    const sampleRate = this.audioContext.sampleRate;
    const frameCount = sampleRate * duration;
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      frequencies.forEach(freq => {
        sample += Math.sin(2 * Math.PI * freq * t) / frequencies.length;
      });
      
      // Apply envelope
      const envelope = Math.max(0, 1 - (t / duration));
      data[i] = sample * envelope * 0.2;
    }

    return buffer;
  }

  async play(soundName: string) {
    if (!this.enabled || !this.audioContext || !this.sounds[soundName]) return;

    try {
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const source = this.audioContext.createBufferSource();
      source.buffer = this.sounds[soundName];
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.warn('Error playing sound:', error);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }
}
