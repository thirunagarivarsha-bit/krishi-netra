import React, { useState } from 'react';
import { Language } from '../types';
import { te } from '../translations/te';
import { en } from '../translations/en';
import { 
  Volume2, 
  VolumeX, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  Sparkles,
  Camera,
  Layers,
  Mic,
  Bot
} from 'lucide-react';
import { speechService } from '../utils/speech';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onStartCropCheck: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  language,
  onStartCropCheck
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const t = language === 'te' ? te : en;

  if (!isOpen) return null;

  const handleToggleVoice = () => {
    if (isPlayingAudio) {
      speechService.stop();
      setIsPlayingAudio(false);
    } else {
      speechService.playChime('click');
      const textToSpeak = t.onboarding.audioText;
      setIsPlayingAudio(true);
      speechService.speak(
        textToSpeak,
        language,
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(true)
      );
    }
  };

  const handleStart = () => {
    speechService.stop();
    setIsPlayingAudio(false);
    speechService.playChime('click');
    onClose();
    onStartCropCheck();
  };

  const stepIcons = [
    <Camera className="w-8 h-8 text-krishi-700" key="1" />,
    <Layers className="w-8 h-8 text-krishi-700" key="2" />,
    <Mic className="w-8 h-8 text-krishi-700" key="3" />,
    <Bot className="w-8 h-8 text-krishi-700" key="4" />
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-charcoal-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-krishi-100 overflow-hidden my-auto">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-krishi-900 via-krishi-800 to-krishi-700 text-white px-6 py-6 sm:px-8 sm:py-7 relative">
          <button 
            onClick={() => {
              speechService.stop();
              onClose();
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-krishi-600/60 border border-krishi-400/30 text-[11px] font-semibold text-krishi-100 uppercase tracking-wide">
              {language === 'te' ? 'రైతు మార్గదర్శకం' : 'Farmer Guide'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-sans">
            KRISHI-NETRA
          </h1>
          <p className="text-base sm:text-lg font-medium text-krishi-100 mt-1">
            {t.onboarding.subtitle}
          </p>

          {/* Voice Narration Button on Banner */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={handleToggleVoice}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 ${
                isPlayingAudio 
                  ? 'bg-amber-400 text-charcoal-900 animate-pulse ring-2 ring-amber-300' 
                  : 'bg-white text-krishi-900 hover:bg-krishi-50'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <VolumeX className="w-4 h-4 text-charcoal-900" />
                  <span>{language === 'te' ? 'ఆపండి' : 'Stop'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-krishi-700" />
                  <span>🔊 {t.onboarding.listenAudio} (Listen in Telugu)</span>
                </>
              )}
            </button>
            {isPlayingAudio && (
              <span className="text-xs text-krishi-200 flex items-center gap-1 font-medium animate-pulse">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {language === 'te' ? 'వాయిస్ చదువుతోంది...' : 'Audio playing...'}
              </span>
            )}
          </div>
        </div>

        {/* 4 Large Visual Steps */}
        <div className="p-5 sm:p-7 space-y-3 bg-earth-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {t.onboarding.steps.map((step, idx) => (
              <div 
                key={idx}
                className="bg-white p-4 rounded-2xl border border-krishi-100 shadow-soft hover:shadow-card hover:border-krishi-300 transition-all flex items-start gap-3.5"
              >
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-krishi-50 border border-krishi-200 flex items-center justify-center shadow-inner">
                  {stepIcons[idx]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-5 h-5 rounded-full bg-krishi-800 text-white text-[11px] font-bold flex items-center justify-center">
                      {step.stepNumber}
                    </span>
                    <h2 className="font-bold text-base text-charcoal-900 leading-tight">
                      {step.title}
                    </h2>
                  </div>
                  <p className="text-xs text-charcoal-700 leading-relaxed font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Assurance Notice */}
          <div className="p-3 rounded-xl bg-krishi-100/60 border border-krishi-200 flex items-center gap-2.5 text-xs text-krishi-900 font-medium">
            <CheckCircle2 className="w-4 h-4 text-krishi-700 flex-shrink-0" />
            <span>
              {language === 'te' 
                ? 'సులభమైన విధానం • సాంకేతిక పరిజ్ఞానం అవసరం లేదు • రైతు కోసమే రూపొందించబడింది'
                : 'Simple to use • Zero technical jargon • Built specifically for smallholder farmers'}
            </span>
          </div>
        </div>

        {/* Bottom Call to Action */}
        <div className="px-6 py-4 sm:px-8 sm:py-5 bg-white border-t border-krishi-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-charcoal-500 text-center sm:text-left">
            {language === 'te' ? 'పత్తి • వరి • మిర్చి • మొక్కజొన్న' : 'Supported: Cotton • Paddy • Chilli • Maize'}
          </div>

          <button
            onClick={handleStart}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-krishi-800 to-krishi-700 hover:from-krishi-900 hover:to-krishi-800 text-white font-black text-base shadow-elevated flex items-center justify-center gap-2.5 transition-all active:scale-95 cursor-pointer"
          >
            <span>{t.onboarding.startCheck}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

      </div>
    </div>
  );
};
