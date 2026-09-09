import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { speechService } from '../utils/speech';
import { useAccessibility } from '../context/AccessibilityContext';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Eye } from 'lucide-react';

interface SynchronizedSubtitleProps {
  text: string;
  language: Language;
  titleTe?: string;
  titleEn?: string;
  autoPlay?: boolean;
  onFinished?: () => void;
}

export const SynchronizedSubtitle: React.FC<SynchronizedSubtitleProps> = ({
  text,
  language,
  titleTe = 'వాయిస్ & సబ్‌టైటిల్స్',
  titleEn = 'Voice & Subtitles',
  autoPlay = false,
  onFinished
}) => {
  const { settings } = useAccessibility();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeWordIndex, setActiveWordIndex] = useState<number>(-1);

  // Split text into words/tokens for synchronization
  const words = text.split(/\s+/).filter(Boolean);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTelugu = language === 'te';

  // Words per minute roughly 120-140 for farmer-friendly speech
  const msPerWord = 360;

  const startPlayback = () => {
    speechService.playChime('click');
    setIsPlaying(true);
    setIsPaused(false);
    setActiveWordIndex(0);

    // Speak using speechService if voice is enabled in accessibility settings
    if (settings.voiceEnabled) {
      speechService.speak(
        text,
        language,
        () => {
          stopPlayback();
          onFinished?.();
        },
        () => {
          setIsPlaying(true);
        }
      );
    }

    // Highlighting ticker (runs whether voice is enabled or muted so deaf farmers see progression)
    let currentIdx = 0;
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      currentIdx++;
      if (currentIdx < words.length) {
        setActiveWordIndex(currentIdx);
      } else {
        clearInterval(timerRef.current!);
        setIsPlaying(false);
        setActiveWordIndex(-1);
        onFinished?.();
      }
    }, msPerWord);
  };

  const pausePlayback = () => {
    speechService.pause();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPaused(true);
  };

  const resumePlayback = () => {
    speechService.resume();
    setIsPaused(false);
    let currentIdx = activeWordIndex >= 0 ? activeWordIndex : 0;
    timerRef.current = setInterval(() => {
      currentIdx++;
      if (currentIdx < words.length) {
        setActiveWordIndex(currentIdx);
      } else {
        clearInterval(timerRef.current!);
        setIsPlaying(false);
        setActiveWordIndex(-1);
        onFinished?.();
      }
    }, msPerWord);
  };

  const stopPlayback = () => {
    speechService.stop();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPlaying(false);
    setIsPaused(false);
    setActiveWordIndex(-1);
  };

  const replayPlayback = () => {
    stopPlayback();
    setTimeout(() => {
      startPlayback();
    }, 100);
  };

  useEffect(() => {
    if (autoPlay && settings.voiceEnabled) {
      startPlayback();
    }
    return () => {
      stopPlayback();
    };
  }, [text]);

  return (
    <div className="rounded-2xl bg-gradient-to-r from-krishi-900 via-krishi-850 to-charcoal-900 text-white p-4 sm:p-5 shadow-elevated border border-krishi-700/60 space-y-3.5">
      
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
            {settings.voiceEnabled ? (
              <Volume2 className={`w-4 h-4 ${isPlaying && !isPaused ? 'animate-pulse' : ''}`} />
            ) : (
              <VolumeX className="w-4 h-4 text-charcoal-300" />
            )}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-krishi-200">
              {isTelugu ? titleTe : titleEn}
            </p>
            <p className="text-[10px] text-krishi-100 flex items-center gap-1 font-medium">
              <Eye className="w-3 h-3 text-krishi-300" />
              <span>
                {settings.voiceEnabled 
                  ? (isTelugu ? 'వాయిస్ & ముఖ్యాంశాల హైలైట్' : 'Voice with synchronized subtitle highlight')
                  : (isTelugu ? 'నిశ్శబ్ద మోడ్ (సబ్‌టైటిల్స్ మాత్రమే)' : 'Silent Mode (Visual subtitles only)')}
              </span>
            </p>
          </div>
        </div>

        {/* Media Controls */}
        <div className="flex items-center gap-1.5">
          {!isPlaying ? (
            <button
              onClick={startPlayback}
              className="px-3.5 py-1.5 rounded-xl bg-white text-krishi-950 font-black text-xs flex items-center gap-1.5 hover:bg-krishi-50 active:scale-95 shadow-soft transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isTelugu ? 'వినండి' : 'Play'}</span>
            </button>
          ) : isPaused ? (
            <button
              onClick={resumePlayback}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-charcoal-950 font-black text-xs flex items-center gap-1.5 active:scale-95 shadow-soft transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isTelugu ? 'కొనసాగించండి' : 'Resume'}</span>
            </button>
          ) : (
            <button
              onClick={pausePlayback}
              className="px-3.5 py-1.5 rounded-xl bg-amber-400 text-charcoal-950 font-black text-xs flex items-center gap-1.5 active:scale-95 shadow-soft transition-all cursor-pointer"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>{isTelugu ? 'ఆపండి' : 'Pause'}</span>
            </button>
          )}

          <button
            onClick={replayPlayback}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title={isTelugu ? 'మళ్లీ వినండి' : 'Replay'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Synchronized Words Subtitle Container */}
      <div className="p-4 rounded-xl bg-black/40 border border-white/10 backdrop-blur-sm text-sm sm:text-base leading-relaxed font-medium">
        <p className="flex flex-wrap gap-1.5">
          {words.map((word, idx) => {
            const isActive = idx === activeWordIndex;
            return (
              <span
                key={idx}
                className={`transition-all duration-150 inline-block px-1 rounded ${
                  isActive
                    ? 'subtitle-active-word scale-105'
                    : 'text-krishi-100 hover:text-white'
                }`}
              >
                {word}
              </span>
            );
          })}
        </p>
      </div>

      {/* Accessible hint for deaf farmers */}
      {!settings.voiceEnabled && (
        <p className="text-[11px] text-amber-200 font-semibold flex items-center gap-1.5">
          <span>ℹ️</span>
          <span>
            {isTelugu
              ? 'శబ్దం ఆఫ్‌లో ఉన్నా కూడా పూర్తి సమాచారం స్క్రీన్ పై స్పష్టంగా కనిపిస్తుంది.'
              : 'Full advisory is presented visually on screen. Sound is never required.'}
          </span>
        </p>
      )}

    </div>
  );
};
