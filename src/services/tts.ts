// KRISHI-NETRA Production Telugu & English Neural TTS Service
// Prioritizes server-side gTTS neural audio bytes, caches with composite keys,
// synchronizes live subtitles, and strictly prevents English voice fallbacks in Telugu mode.

import { apiService } from './api';
import { speechService } from '../utils/speech';
import { AudioDebugInfo } from '../types';

export interface TTSOptions {
  lang?: 'te' | 'en' | 'te-IN' | 'en-IN';
  onStart?: () => void;
  onEnd?: () => void;
  onBoundary?: (charIndex: number) => void;
  onError?: (error: unknown) => void;
}

class TeluguTTSService {
  private audioCache = new Map<string, HTMLAudioElement>();
  private currentAudio: HTMLAudioElement | null = null;
  private isBrowserSynthPlaying = false;
  private currentText = '';
  private currentOptions: TTSOptions = {};
  private lastDebugInfo: AudioDebugInfo = {
    inputLanguage: 'te-IN',
    responseLanguage: 'te-IN',
    ttsLanguage: 'te-IN',
    ttsModel: 'gTTS-v2.5 (Neural)',
    speaker: 'te-IN Standard Farmer Voice',
    audioGenerated: true,
    status: 'READY'
  };

  /**
   * Synthesizes or plays spoken audio in genuine Telugu (te-IN) or English (en-IN).
   * 1. Check composite in-memory cache
   * 2. Call backend server-side neural TTS (/api/tts)
   * 3. Fallback to native browser voice ONLY if a true language-matched voice exists
   * 4. NEVER fall back to an English voice when Telugu mode is active
   */
  public async speakText(text: string, options: TTSOptions = {}): Promise<boolean> {
    this.stop();
    this.currentText = text.trim();
    this.currentOptions = options;

    if (!this.currentText) {
      options.onEnd?.();
      return false;
    }

    const isTelugu = (options.lang || 'te').toString().toLowerCase().startsWith('te');
    const langCode = isTelugu ? 'te-IN' : 'en-IN';
    const cacheKey = `${langCode}_${this.currentText}`;

    this.lastDebugInfo = {
      inputLanguage: langCode,
      responseLanguage: langCode,
      ttsLanguage: langCode,
      ttsModel: 'gTTS-v2.5 (Server Neural)',
      speaker: isTelugu ? 'te-IN Standard Farmer Voice' : 'en-IN Extension Agent Voice',
      audioGenerated: false,
      status: 'SYNTHESIZING'
    };

    // 1. Check in-memory audio cache
    if (this.audioCache.has(cacheKey)) {
      const cachedAudio = this.audioCache.get(cacheKey)!;
      return this.playAudioElement(cachedAudio, options, langCode);
    }

    // 2. Call Backend Server-Side Neural TTS (/api/tts)
    try {
      const ttsRes = await apiService.tts(this.currentText, isTelugu ? 'te' : 'en');
      if (ttsRes && (ttsRes.audioBase64 || ttsRes.audioUrl)) {
        const audioSrc = ttsRes.audioBase64 || `${window.location.origin}${ttsRes.audioUrl}`;
        const newAudio = new Audio(audioSrc);
        this.audioCache.set(cacheKey, newAudio);
        this.lastDebugInfo.audioGenerated = true;
        this.lastDebugInfo.audioLength = `${ttsRes.durationSeconds || 0}s`;
        this.lastDebugInfo.status = 'PLAYING_SERVER_TTS';
        return this.playAudioElement(newAudio, options, langCode);
      }
    } catch (err) {
      console.warn('Backend neural TTS generation unavailable:', err);
    }

    // 3. Browser SpeechSynthesis Fallback (Strictly validated)
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const voices = window.speechSynthesis.getVoices();

        if (isTelugu) {
          // Strictly verify a Telugu voice exists on device
          const teluguVoice = voices.find(v => v.lang.toLowerCase().includes('te'));
          if (teluguVoice) {
            return this.speakWithBrowserSynth(this.currentText, 'te-IN', teluguVoice, options);
          } else {
            // DO NOT switch silently to an English voice!
            console.info('No native Telugu voice pack on device. Preserving Telugu text visually.');
            this.lastDebugInfo.status = 'VISUAL_ONLY_NO_TELUGU_VOICE';
            options.onError?.('Telugu voice is temporarily unavailable on this device. Please read the response below.');
            options.onEnd?.();
            return false;
          }
        } else {
          // English mode: find Indian English or standard English voice
          const englishVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('IN')) || 
                               voices.find(v => v.lang.startsWith('en')) || 
                               voices[0];
          return this.speakWithBrowserSynth(this.currentText, 'en-IN', englishVoice, options);
        }
      }
    } catch (err) {
      console.warn('Browser speech synthesis fallback failed:', err);
    }

    // Resilient fallback
    options.onEnd?.();
    return false;
  }

  private playAudioElement(audio: HTMLAudioElement, options: TTSOptions, _langCode: string): Promise<boolean> {
    return new Promise((resolve) => {
      audio.currentTime = 0;
      this.currentAudio = audio;

      audio.onplay = () => {
        options.onStart?.();
      };

      // Real-time boundary calculation for subtitles based on playback time ratio
      audio.ontimeupdate = () => {
        if (options.onBoundary && audio.duration > 0) {
          const progressRatio = audio.currentTime / audio.duration;
          const charIndex = Math.min(this.currentText.length - 1, Math.floor(progressRatio * this.currentText.length));
          options.onBoundary(charIndex);
        }
      };

      audio.onended = () => {
        this.currentAudio = null;
        this.lastDebugInfo.status = 'COMPLETED';
        options.onEnd?.();
        resolve(true);
      };

      audio.onerror = (err) => {
        this.currentAudio = null;
        this.lastDebugInfo.status = 'ERROR';
        options.onError?.(err);
        options.onEnd?.();
        resolve(false);
      };

      audio.play().catch((err) => {
        console.warn('Audio play was interrupted or restricted by browser policy:', err);
        this.currentAudio = null;
        options.onEnd?.();
        resolve(false);
      });
    });
  }

  private speakWithBrowserSynth(
    text: string, 
    langCode: string, 
    voice: SpeechSynthesisVoice | undefined, 
    options: TTSOptions
  ): boolean {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.88;
    utterance.pitch = 1.0;
    utterance.lang = langCode;
    if (voice) utterance.voice = voice;

    utterance.onstart = () => {
      this.isBrowserSynthPlaying = true;
      this.lastDebugInfo.status = 'PLAYING_BROWSER_VOICE';
      options.onStart?.();
    };

    utterance.onboundary = (event) => {
      if (options.onBoundary && typeof event.charIndex === 'number') {
        options.onBoundary(event.charIndex);
      }
    };

    utterance.onend = () => {
      this.isBrowserSynthPlaying = false;
      this.lastDebugInfo.status = 'COMPLETED';
      options.onEnd?.();
    };

    utterance.onerror = (err) => {
      this.isBrowserSynthPlaying = false;
      this.lastDebugInfo.status = 'BROWSER_VOICE_ERROR';
      options.onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  }

  public pause() {
    if (this.currentAudio && !this.currentAudio.paused) {
      this.currentAudio.pause();
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  }

  public resume() {
    if (this.currentAudio && this.currentAudio.paused) {
      this.currentAudio.play().catch(() => {});
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  }

  public replay() {
    if (this.currentText) {
      this.speakText(this.currentText, this.currentOptions);
    }
  }

  public stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.isBrowserSynthPlaying = false;
    this.lastDebugInfo.status = 'STOPPED';
  }

  public isPlaying(): boolean {
    if (this.currentAudio) {
      return !this.currentAudio.paused;
    }
    return this.isBrowserSynthPlaying || speechService.isSpeaking();
  }

  public getDebugInfo(): AudioDebugInfo {
    return { ...this.lastDebugInfo };
  }

  public cacheAudio(text: string, lang: 'te' | 'en', audioUrl: string) {
    const key = `${lang}_${text.trim()}`;
    const audio = new Audio(audioUrl);
    this.audioCache.set(key, audio);
  }
}

export const teluguTTS = new TeluguTTSService();
