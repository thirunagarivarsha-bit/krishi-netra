// Speech Synthesis and Recognition utility for KRISHI-NETRA
// Supports Telugu (te-IN) with fallback to Indian English (en-IN)

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private audioContext: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  // Play natural chime for farmer feedback
  public playChime(type: 'start' | 'success' | 'alert' | 'click' = 'click') {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioContext) {
        this.audioContext = new AudioCtx();
      }
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      osc.connect(gain);
      gain.connect(this.audioContext.destination);

      const now = this.audioContext.currentTime;

      if (type === 'start') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === 'alert') {
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.setValueAtTime(240, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else {
        osc.frequency.setValueAtTime(600, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  // Speak text in Telugu or English
  public speak(
    text: string,
    lang: 'te' | 'en' = 'te',
    onEnd?: () => void,
    onStart?: () => void
  ): boolean {
    if (!this.synth) return false;

    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;

    // Rate: natural, moderate speed for farmers
    utterance.rate = 0.88;
    utterance.pitch = 1.0;

    // Try finding Telugu or appropriate voice
    const voices = this.synth.getVoices();
    const isTe = lang === 'te';
    const targetLangCode = isTe ? 'te-IN' : 'en-IN';
    
    let chosenVoice: SpeechSynthesisVoice | undefined;
    if (isTe) {
      chosenVoice = voices.find(v => v.lang.toLowerCase().includes('te'));
      if (!chosenVoice) {
        // DO NOT speak Telugu text using an English voice!
        console.info('No browser Telugu voice found; avoiding English voice fallback in Telugu mode.');
        onEnd?.();
        return false;
      }
    } else {
      chosenVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('IN')) 
        || voices.find(v => v.lang.startsWith('en'))
        || voices[0];
    }

    if (chosenVoice) {
      utterance.voice = chosenVoice;
    }
    utterance.lang = targetLangCode;

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    this.synth.speak(utterance);
    return true;
  }

  public pause() {
    if (this.synth && this.synth.speaking) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return this.synth ? this.synth.speaking : false;
  }

  public isPaused(): boolean {
    return this.synth ? this.synth.paused : false;
  }
}

export const speechService = new SpeechService();

// Speech Recognition wrapper
export interface VoiceRecognitionOptions {
  lang?: 'te-IN' | 'en-IN';
  onResult: (text: string) => void;
  onError?: (err: string) => void;
  onEnd?: () => void;
}

export class VoiceRecognition {
  private recognition: unknown = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = 
        (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition || 
        (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        // @ts-expect-error - standard webkit SpeechRecognition API
        this.recognition = new SpeechRecognition();
      }
    }
  }

  public start(options: VoiceRecognitionOptions): boolean {
    if (!this.recognition) return false;

    try {
      // @ts-expect-error - Recognition properties
      this.recognition.continuous = false;
      // @ts-expect-error - Recognition properties
      this.recognition.interimResults = false;
      // @ts-expect-error - Recognition properties
      this.recognition.lang = options.lang || 'te-IN';

      // @ts-expect-error - Recognition event
      this.recognition.onresult = (event: { results: { [x: number]: { [x: number]: { transcript: string } } } }) => {
        const transcript = event.results[0][0].transcript;
        options.onResult(transcript);
      };

      // @ts-expect-error - Recognition event
      this.recognition.onerror = (event: { error: string }) => {
        options.onError?.(event.error);
        this.isListening = false;
      };

      // @ts-expect-error - Recognition event
      this.recognition.onend = () => {
        this.isListening = false;
        options.onEnd?.();
      };

      // @ts-expect-error - Recognition method
      this.recognition.start();
      this.isListening = true;
      speechService.playChime('start');
      return true;
    } catch {
      return false;
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      // @ts-expect-error - Recognition method
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }
}

export const voiceRecognition = new VoiceRecognition();
