import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccessibilitySettings, Language } from '../types';
import { speechService } from '../utils/speech';
import { teluguTTS } from '../services/tts';

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => void;
  toggleSetting: (key: keyof Omit<AccessibilitySettings, 'language'>) => void;
  setLanguage: (lang: Language) => void;
  resetSettings: () => void;
  activeSubtitle: string | null;
  setActiveSubtitle: (text: string | null) => void;
  isAudioPlaying: boolean;
  setIsAudioPlaying: (playing: boolean) => void;
}

const STORAGE_KEY = 'krishi_netra_accessibility';

const defaultSettings: AccessibilitySettings = {
  largeText: false,
  highContrast: false,
  voiceEnabled: true,
  subtitlesEnabled: true,
  language: 'te',
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch {}
    return defaultSettings;
  });

  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Sync to localStorage and DOM classes whenever settings change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}

    const root = document.documentElement;
    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
  }, [settings]);

  const updateSetting = <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSetting = (key: keyof Omit<AccessibilitySettings, 'language'>) => {
    speechService.playChime('click');
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const setLanguage = (lang: Language) => {
    speechService.playChime('click');
    speechService.stop();
    teluguTTS.stop();
    setActiveSubtitle(null);
    setIsAudioPlaying(false);
    updateSetting('language', lang);
  };

  const resetSettings = () => {
    speechService.playChime('alert');
    setSettings(defaultSettings);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        toggleSetting,
        setLanguage,
        resetSettings,
        activeSubtitle,
        setActiveSubtitle,
        isAudioPlaying,
        setIsAudioPlaying,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
