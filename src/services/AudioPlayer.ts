import type { AudioPlayerService, SectionId } from "../types";
import { getSectionById } from "../data/sections";

/**
 * Audio player with Web Audio API effects chain:
 *   source → gainNode (volume) → filterNode (low-pass) → analyser → destination
 *
 * The filter slider maps 0–1 to a low-pass cutoff sweep:
 *   0 = 200 Hz (muffled)  →  1 = 20000 Hz (wide open)
 */
export class AudioPlayer implements AudioPlayerService {
  private audio: HTMLAudioElement;
  private errorCallback: ((error: string) => void) | null = null;

  // Web Audio nodes
  private ctx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private gainNode: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;

  // Beat detection state - multi-band analysis
  private previousBassEnergy = 0;
  private previousSnareEnergy = 0;
  private previousHiHatEnergy = 0;
  private kickIntensity = 0;
  private snareIntensity = 0;
  private hiHatIntensity = 0;
  private bassLevel = 0; // Track sustained bass energy
  private beatDecayRate = 0.82; // Very fast decay for extreme dramatic dips
  
  // Energy history for better onset detection
  private bassHistory: number[] = [];
  private snareHistory: number[] = [];
  private hiHatHistory: number[] = [];
  private historyLength = 10;

  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
    this.audio.addEventListener("error", () => {
      const message =
        this.audio.error?.message ?? "Unknown audio playback error";
      this.errorCallback?.(message);
    });
  }

  /** Lazily create the Web Audio graph (must happen after a user gesture). */
  private ensureAudioGraph(): void {
    if (this.ctx) return;

    // Gracefully skip if Web Audio API is unavailable (e.g. test environment)
    const AudioCtx = globalThis.AudioContext ?? (globalThis as any).webkitAudioContext;
    if (!AudioCtx) return;

    try {
      this.ctx = new AudioCtx();
      this.sourceNode = this.ctx.createMediaElementSource(this.audio);
      this.gainNode = this.ctx.createGain();
      this.filterNode = this.ctx.createBiquadFilter();
      this.analyserNode = this.ctx.createAnalyser();

      // Configure analyser for beat onset detection
      this.analyserNode.fftSize = 4096; // Even higher resolution for precise frequency separation
      this.analyserNode.smoothingTimeConstant = 0.1; // Minimal smoothing for instant transient response
      const bufferLength = this.analyserNode.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);

      this.filterNode.type = "lowpass";
      this.filterNode.frequency.value = 20000; // wide open by default
      this.filterNode.Q.value = 0.7;

      // Chain: source → filter → analyser → gain → destination
      this.sourceNode.connect(this.filterNode);
      this.filterNode.connect(this.analyserNode);
      this.analyserNode.connect(this.gainNode);
      this.gainNode.connect(this.ctx.destination);
    } catch {
      // If Web Audio setup fails, fall back to basic HTMLAudioElement
      this.ctx = null;
    }
  }

  async load(sectionId: SectionId): Promise<void> {
    try {
      const section = getSectionById(sectionId);
      this.audio.src = section.audioSrc;
      this.audio.load();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load audio";
      this.errorCallback?.(message);
    }
  }

  play(): void {
    try {
      this.ensureAudioGraph();
      if (this.ctx?.state === "suspended") {
        this.ctx.resume();
      }
      this.audio.play().catch((err: unknown) => {
        const message =
          err instanceof Error ? err.message : "Failed to play audio";
        this.errorCallback?.(message);
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to play audio";
      this.errorCallback?.(message);
    }
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  setVolume(volume: number): void {
    const v = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.setTargetAtTime(v, this.ctx!.currentTime, 0.02);
    } else {
      this.audio.volume = v;
    }
  }

  /**
   * Set the low-pass filter cutoff.
   * @param level 0–1 where 0 = muffled (200 Hz), 1 = wide open (20 kHz)
   */
  setFilterCutoff(level: number): void {
    if (!this.filterNode || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1, level));
    // Exponential mapping: 200 Hz → 20000 Hz
    const minFreq = 200;
    const maxFreq = 20000;
    const freq = minFreq * Math.pow(maxFreq / minFreq, clamped);
    this.filterNode.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.02);
  }

  /**
   * Get multi-band beat intensity using advanced onset detection
   * Returns object with separate intensities for kick, snare, hi-hat, and bass
   */
  getAudioData(): number {
    if (!this.analyserNode || !this.dataArray || !this.isPlaying()) {
      // Decay all intensities even when not playing
      this.kickIntensity *= this.beatDecayRate;
      this.snareIntensity *= this.beatDecayRate;
      this.hiHatIntensity *= this.beatDecayRate;
      this.bassLevel *= 0.85;
      return Math.max(0, Math.min(1, (this.kickIntensity + this.snareIntensity + this.hiHatIntensity) / 3 + this.bassLevel * 0.15));
    }

    try {
      this.analyserNode.getByteFrequencyData(this.dataArray);

      // Precise frequency band analysis for musical elements
      // Kick drum: 40-100Hz (sub-bass punch)
      // Sustained bass: 40-250Hz (bass lines and low-end)
      // Snare drum: 150-400Hz (body) + 2-6kHz (snap/crack)
      // Hi-hats: 6-16kHz (sizzle and shimmer)
      
      const nyquist = (this.ctx?.sampleRate || 44100) / 2;
      const binWidth = nyquist / this.dataArray.length;
      const maxBin = this.dataArray.length;
      
      // Calculate bin ranges with precise boundaries and bounds checking
      const kickStart = Math.max(0, Math.floor(40 / binWidth));
      const kickEnd = Math.min(maxBin, Math.floor(100 / binWidth));
      const bassStart = Math.max(0, Math.floor(40 / binWidth));
      const bassEnd = Math.min(maxBin, Math.floor(250 / binWidth));
      const snareBodyStart = Math.max(0, Math.floor(150 / binWidth));
      const snareBodyEnd = Math.min(maxBin, Math.floor(400 / binWidth));
      const snareSnapStart = Math.max(0, Math.floor(2000 / binWidth));
      const snareSnapEnd = Math.min(maxBin, Math.floor(6000 / binWidth));
      const hiHatStart = Math.max(0, Math.floor(6000 / binWidth));
      const hiHatEnd = Math.min(maxBin, Math.floor(16000 / binWidth));
      
      // Calculate kick energy (focused on sub-bass punch)
      let kickEnergy = 0;
      if (kickEnd > kickStart) {
        for (let i = kickStart; i < kickEnd; i++) {
          kickEnergy += this.dataArray[i] || 0;
        }
        kickEnergy = kickEnergy / (kickEnd - kickStart) / 255;
      }
      
      // Calculate sustained bass energy (broader low-end)
      let sustainedBass = 0;
      if (bassEnd > bassStart) {
        for (let i = bassStart; i < bassEnd; i++) {
          sustainedBass += this.dataArray[i] || 0;
        }
        sustainedBass = sustainedBass / (bassEnd - bassStart) / 255;
      }
      
      // Calculate snare energy (body + snap combined)
      let snareEnergy = 0;
      if (snareBodyEnd > snareBodyStart) {
        for (let i = snareBodyStart; i < snareBodyEnd; i++) {
          snareEnergy += (this.dataArray[i] || 0) * 0.4; // Body weight
        }
      }
      if (snareSnapEnd > snareSnapStart) {
        for (let i = snareSnapStart; i < snareSnapEnd; i++) {
          snareEnergy += (this.dataArray[i] || 0) * 0.6; // Snap weight (higher for transient detection)
        }
      }
      const snareCount = (snareBodyEnd - snareBodyStart) + (snareSnapEnd - snareSnapStart);
      if (snareCount > 0) {
        snareEnergy = snareEnergy / snareCount / 255;
      }
      
      // Calculate hi-hat energy (high-frequency sizzle)
      let hiHatEnergy = 0;
      if (hiHatEnd > hiHatStart) {
        for (let i = hiHatStart; i < hiHatEnd; i++) {
          hiHatEnergy += this.dataArray[i] || 0;
        }
        hiHatEnergy = hiHatEnergy / (hiHatEnd - hiHatStart) / 255;
      }
      
      // Update energy history for adaptive threshold calculation
      this.bassHistory.push(kickEnergy);
      this.snareHistory.push(snareEnergy);
      this.hiHatHistory.push(hiHatEnergy);
      if (this.bassHistory.length > this.historyLength) this.bassHistory.shift();
      if (this.snareHistory.length > this.historyLength) this.snareHistory.shift();
      if (this.hiHatHistory.length > this.historyLength) this.hiHatHistory.shift();
      
      // Calculate adaptive thresholds based on recent energy history
      const bassAvg = this.bassHistory.reduce((a, b) => a + b, 0) / Math.max(1, this.bassHistory.length);
      const snareAvg = this.snareHistory.reduce((a, b) => a + b, 0) / Math.max(1, this.snareHistory.length);
      const hiHatAvg = this.hiHatHistory.reduce((a, b) => a + b, 0) / Math.max(1, this.hiHatHistory.length);
      
      // Onset detection: look for sudden increases above adaptive threshold
      const kickOnset = Math.max(0, kickEnergy - this.previousBassEnergy);
      const snareOnset = Math.max(0, snareEnergy - this.previousSnareEnergy);
      const hiHatOnset = Math.max(0, hiHatEnergy - this.previousHiHatEnergy);
      
      // Adaptive thresholds with minimum floor
      const kickThreshold = Math.max(0.05, bassAvg * 0.3);
      const snareThreshold = Math.max(0.04, snareAvg * 0.25);
      const hiHatThreshold = Math.max(0.03, hiHatAvg * 0.2);
      
      // Trigger dramatic pulses on onset detection with instant attack
      if (kickOnset > kickThreshold) {
        // Kick detected - explosive instant response
        this.kickIntensity = Math.min(1, this.kickIntensity + kickOnset * 10.0);
      }
      if (snareOnset > snareThreshold) {
        // Snare detected - explosive instant response
        this.snareIntensity = Math.min(1, this.snareIntensity + snareOnset * 9.0);
      }
      if (hiHatOnset > hiHatThreshold) {
        // Hi-hat detected - sharp instant response
        this.hiHatIntensity = Math.min(1, this.hiHatIntensity + hiHatOnset * 8.0);
      }
      
      // Very fast decay between beats for extreme dramatic dips
      this.kickIntensity *= this.beatDecayRate;
      this.snareIntensity *= this.beatDecayRate;
      this.hiHatIntensity *= this.beatDecayRate;
      
      // Track sustained bass with smooth interpolation (adds subtle continuous glow)
      this.bassLevel = this.bassLevel * 0.82 + sustainedBass * 0.18;
      
      // Store current energy for next frame comparison (minimal smoothing for sharp detection)
      this.previousBassEnergy = kickEnergy * 0.7 + this.previousBassEnergy * 0.3;
      this.previousSnareEnergy = snareEnergy * 0.7 + this.previousSnareEnergy * 0.3;
      this.previousHiHatEnergy = hiHatEnergy * 0.7 + this.previousHiHatEnergy * 0.3;
      
      // Combine all elements: transients drive dramatic pulses, bass adds subtle continuous glow
      // Weight kick highest (most dramatic), then snare, then hi-hat
      const combined = (this.kickIntensity * 0.5) + (this.snareIntensity * 0.3) + (this.hiHatIntensity * 0.2) + (this.bassLevel * 0.1);
      
      return Math.max(0, Math.min(1, combined));
    } catch (error) {
      // If audio analysis fails, gracefully decay and return 0
      console.error('Audio analysis error:', error);
      this.kickIntensity *= this.beatDecayRate;
      this.snareIntensity *= this.beatDecayRate;
      this.hiHatIntensity *= this.beatDecayRate;
      this.bassLevel *= 0.85;
      return 0;
    }
  }
  
  /**
   * Get detailed multi-band audio data for advanced visualizations
   * Returns separate intensities for each frequency band
   */
  getMultiBandAudioData(): { kick: number; snare: number; hiHat: number; bass: number; combined: number } {
    // Ensure intensities are decayed even when not actively analyzing
    if (!this.analyserNode || !this.dataArray || !this.isPlaying()) {
      this.kickIntensity *= this.beatDecayRate;
      this.snareIntensity *= this.beatDecayRate;
      this.hiHatIntensity *= this.beatDecayRate;
      this.bassLevel *= 0.85;
    }
    
    const combined = this.getAudioData();
    
    return {
      kick: Math.max(0, Math.min(1, this.kickIntensity)),
      snare: Math.max(0, Math.min(1, this.snareIntensity)),
      hiHat: Math.max(0, Math.min(1, this.hiHatIntensity)),
      bass: Math.max(0, Math.min(1, this.bassLevel)),
      combined: combined
    };
  }

  getCurrentTime(): number {
    return this.audio.currentTime;
  }

  getDuration(): number {
    return this.audio.duration || 0;
  }

  seek(time: number): void {
    this.audio.currentTime = Math.max(0, Math.min(this.getDuration(), time));
  }

  isPlaying(): boolean {
    return !this.audio.paused && !this.audio.ended;
  }

  onError(callback: (error: string) => void): void {
    this.errorCallback = callback;
  }
}
