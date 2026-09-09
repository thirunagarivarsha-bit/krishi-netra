import React from 'react';
import { Language, ActiveTab } from '../types';
import { te } from '../translations/te';
import { en } from '../translations/en';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  Sprout, 
  Languages, 
  Cpu, 
  PlayCircle, 
  HelpCircle,
  Volume2,
  VolumeX,
  Accessibility,
  Sun,
  Type
} from 'lucide-react';
import { speechService } from '../utils/speech';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenOnboarding: () => void;
  onStartDemo: () => void;
  isAudioMuted: boolean;
  onToggleAudioMute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  language,
  onLanguageChange,
  activeTab,
  onTabChange,
  onOpenOnboarding,
  onStartDemo,
  isAudioMuted,
  onToggleAudioMute
}) => {
  const { settings } = useAccessibility();
  const t = language === 'te' ? te : en;
  const isTelugu = language === 'te';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-krishi-100 shadow-soft">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div 
          onClick={() => onTabChange('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-krishi-800 to-krishi-600 flex items-center justify-center text-white shadow-md shadow-krishi-900/10 group-hover:scale-105 transition-transform">
            <Sprout className="w-6 h-6 text-krishi-200" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-krishi-900 font-sans">KRISHI-NETRA</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-krishi-100 text-krishi-800 tracking-wider">
                {isTelugu ? 'కృషి-నేత్ర' : 'AI'}
              </span>
            </div>
            <p className="text-[11px] text-charcoal-500 font-medium hidden sm:block leading-tight">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links (Strict 5 Primary Areas + Judge View) */}
        <div className="hidden lg:flex items-center gap-1 bg-earth-100/70 p-1 rounded-xl border border-earth-200">
          <button
            onClick={() => onTabChange('home')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'home' 
                ? 'bg-white text-krishi-800 shadow-soft font-black' 
                : 'text-charcoal-700 hover:text-krishi-900'
            }`}
          >
            {t.nav.home}
          </button>
          <button
            onClick={() => onTabChange('field')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              activeTab === 'field' || activeTab === 'crops' || activeTab === 'actions'
                ? 'bg-white text-krishi-800 shadow-soft font-black' 
                : 'text-charcoal-700 hover:text-krishi-900'
            }`}
          >
            {t.nav.myField || t.nav.field}
          </button>
          <button
            onClick={() => onTabChange('scan')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'scan' 
                ? 'bg-krishi-800 text-white shadow-soft font-black' 
                : 'bg-krishi-100 text-krishi-800 hover:bg-krishi-200'
            }`}
          >
            <span>📷</span>
            <span>{t.nav.scan}</span>
          </button>
          <button
            onClick={() => onTabChange('ask')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'ask' 
                ? 'bg-white text-krishi-800 shadow-soft font-black' 
                : 'text-charcoal-700 hover:text-krishi-900'
            }`}
          >
            <span>🎤</span>
            <span>{t.nav.ask}</span>
          </button>
          <button
            onClick={() => onTabChange('alerts')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
              activeTab === 'alerts' 
                ? 'bg-white text-krishi-800 shadow-soft font-black' 
                : 'text-charcoal-700 hover:text-krishi-900'
            }`}
          >
            <span>🔔</span>
            <span>{t.nav.alerts}</span>
          </button>
          
          <div className="w-px h-4 bg-earth-300 mx-1" />

          <button
            onClick={() => onTabChange('technical')}
            className={`px-2.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
              activeTab === 'technical' 
                ? 'bg-charcoal-900 text-white shadow-soft font-black' 
                : 'text-charcoal-700 hover:text-krishi-900'
            }`}
            title="Technical Lab & Diagnostics"
          >
            <Cpu className="w-3.5 h-3.5 text-krishi-600" />
            <span>{t.nav.technical}</span>
          </button>
        </div>

        {/* Action Controls: Accessibility Quick Status, Alerts, Language Toggle, Help & Demo */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Quick Alert Bell button */}
          <button
            onClick={() => onTabChange('alerts')}
            className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
              activeTab === 'alerts'
                ? 'bg-krishi-800 text-white border-krishi-900 shadow-soft'
                : 'bg-white border-earth-300 text-charcoal-700 hover:bg-earth-100'
            }`}
            title="Alerts"
          >
            <span className="text-xs">🔔</span>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white animate-pulse"></span>
          </button>
          
          {/* Quick Accessibility Button (Visible on all screen sizes) */}
          <button
            onClick={() => onTabChange('accessibility')}
            className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
              activeTab === 'accessibility'
                ? 'bg-krishi-800 text-white border-krishi-900 shadow-soft'
                : 'bg-white border-earth-300 text-charcoal-700 hover:bg-earth-100'
            }`}
            title={isTelugu ? 'సౌలభ్య సెట్టింగ్‌లు' : 'Accessibility Settings'}
          >
            <Accessibility className="w-4 h-4" />
            {(settings.largeText || settings.highContrast) && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white"></span>
            )}
          </button>

          {/* Quick Audio Mute/Unmute */}
          <button
            onClick={onToggleAudioMute}
            title={isAudioMuted ? 'Muted' : 'Sound Active'}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-earth-300 text-charcoal-700 hover:bg-earth-100 transition-colors cursor-pointer"
          >
            {isAudioMuted ? (
              <VolumeX className="w-4 h-4 text-charcoal-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-krishi-700 animate-pulse-subtle" />
            )}
          </button>

          {/* How to use button */}
          <button
            onClick={() => {
              speechService.playChime('click');
              onOpenOnboarding();
            }}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-earth-300 text-xs font-bold text-charcoal-800 hover:bg-earth-100 transition-colors cursor-pointer"
            title="How to Use"
          >
            <HelpCircle className="w-3.5 h-3.5 text-krishi-700" />
            <span>{isTelugu ? 'ఎలా వాడాలి?' : 'Guide'}</span>
          </button>

          {/* Discrete Judge Mode Access (Visible on mobile & desktop) */}
          <button
            onClick={() => {
              speechService.playChime('click');
              onTabChange('technical');
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-black transition-all active:scale-95 cursor-pointer ${
              activeTab === 'technical'
                ? 'bg-charcoal-900 text-white border-charcoal-900 shadow-soft'
                : 'bg-white border-earth-300 text-charcoal-800 hover:bg-earth-100'
            }`}
            title="Open Technical View / Judge Mode"
          >
            <span>⚖️</span>
            <span className="text-[11px] font-black">{isTelugu ? 'న్యాయనిర్ణేత' : 'JUDGE'}</span>
          </button>

          {/* Hackathon Demo Button */}
          <button
            onClick={onStartDemo}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-charcoal-950 text-xs font-black shadow-soft transition-all active:scale-95 cursor-pointer"
          >
            <PlayCircle className="w-4 h-4" />
            <span>{t.nav.demo}</span>
          </button>

          {/* Primary Language Switch: తెలుగు | English */}
          <button
            onClick={() => {
              const newLang = language === 'te' ? 'en' : 'te';
              onLanguageChange(newLang);
              speechService.playChime('click');
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-krishi-50 border border-krishi-300 hover:bg-krishi-100 text-krishi-900 font-black text-xs transition-all shadow-sm cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-krishi-700" />
            <span>{isTelugu ? 'English' : 'తెలుగు'}</span>
          </button>
        </div>

      </div>
    </header>
  );
};
