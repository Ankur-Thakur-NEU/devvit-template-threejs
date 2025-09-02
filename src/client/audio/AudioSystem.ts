/**
 * Audio system for game sound effects
 */

export class AudioSystem {
  private audioContext: AudioContext | null = null;
  private throwSoundBuffer: AudioBuffer | null = null;

  constructor() {
    // Don't initialize audio immediately - wait for user interaction
  }

  private initAudio(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();

      // Create a simple throw sound using oscillator
      const duration = 0.2;
      const sampleRate = this.audioContext.sampleRate;
      const numSamples = duration * sampleRate;
      const buffer = this.audioContext.createBuffer(1, numSamples, sampleRate);
      const channelData = buffer.getChannelData(0);

      // Generate a swoosh sound
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        // Create a frequency sweep from high to low
        const frequency = 800 - (t * 600);
        channelData[i] = Math.sin(2 * Math.PI * frequency * t) * (1 - t / duration) * 0.3;
      }

      this.throwSoundBuffer = buffer;
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  playThrowSound(): void {
    // Initialize audio on first use (requires user interaction)
    if (!this.audioContext) {
      this.initAudio();
    }

    if (!this.audioContext || !this.throwSoundBuffer) return;

    try {
      const source = this.audioContext.createBufferSource();
      source.buffer = this.throwSoundBuffer;
      source.connect(this.audioContext.destination);
      source.start();
    } catch (error) {
      console.warn('Failed to play throw sound:', error);
    }
  }

  dispose(): void {
    if (this.audioContext) {
      void this.audioContext.close();
      this.audioContext = null;
    }
  }
}
