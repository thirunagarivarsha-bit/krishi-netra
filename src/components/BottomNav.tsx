import React from 'react';
import { ActiveTab, Language } from '../types';
import { te } from '../translations/te';
import { en } from '../translations/en';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  Home, 
  Camera, 
  Layers, 
  CheckCircle2, 
  Wifi,
  Bell, 
  Mic,
  Accessibility 
} from 'lucide-react';
import { speechService } from '../utils/speech';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  language
}) => {
  const { settings } = useAccessibility();
  const t = language === 'te' ? te : en;
  const isTelugu = language === 'te';

  const handleSelect = (tab: ActiveTab) => {
    speechService.playChime('click');
    onTabChange(tab);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-earth-200 shadow-elevated pb-safe">
      <div className="grid grid-cols-5 items-center justify-around px-2 py-1 max-w-md mx-auto">
        
        {/* 1. Home */}
        <button
          onClick={() => handleSelect('home')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'home' 
              ? 'text-krishi-800 font-black' 
              : 'text-charcoal-500 hover:text-krishi-700'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 font-bold">{t.nav.home}</span>
        </button>

        {/* 2. My Field */}
        <button
          onClick={() => handleSelect('field')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'field' || activeTab === 'crops'
              ? 'text-krishi-800 font-black' 
              : 'text-charcoal-500 hover:text-krishi-700'
          }`}
        >
          <Layers className={`w-5 h-5 ${activeTab === 'field' || activeTab === 'crops' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 font-bold">{isTelugu ? 'నా చేను' : 'My Field'}</span>
        </button>

        {/* 3. Center Prominent Scan Button */}
        <div className="flex items-center justify-center -mt-6">
          <button
            onClick={() => handleSelect('scan')}
            className={`w-14 h-14 rounded-full bg-gradient-to-tr from-krishi-800 to-krishi-600 text-white flex flex-col items-center justify-center shadow-lg shadow-krishi-900/25 border-4 border-white active:scale-95 transition-transform cursor-pointer ${
              activeTab === 'scan' ? 'ring-2 ring-krishi-600 scale-105' : ''
            }`}
            aria-label={t.nav.scan}
          >
            <Camera className="w-6 h-6 stroke-[2.2]" />
            <span className="text-[8px] font-black tracking-tight uppercase mt-0.5">
              {isTelugu ? 'స్కాన్' : 'Scan'}
            </span>
          </button>
        </div>

        {/* 4. Ask */}
        <button
          onClick={() => handleSelect('ask')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'ask' 
              ? 'text-krishi-800 font-black' 
              : 'text-charcoal-500 hover:text-krishi-700'
          }`}
        >
          <Mic className={`w-5 h-5 ${activeTab === 'ask' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 font-bold">{isTelugu ? 'అడగండి' : 'Ask'}</span>
        </button>

        {/* 5. Alerts */}
        <button
          onClick={() => handleSelect('alerts')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer relative ${
            activeTab === 'alerts' 
              ? 'text-krishi-800 font-black' 
              : 'text-charcoal-500 hover:text-krishi-700'
          }`}
        >
          <Bell className={`w-5 h-5 ${activeTab === 'alerts' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] mt-0.5 font-bold">{t.nav.alerts}</span>
          <span className="absolute top-0.5 right-4 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white"></span>
        </button>

      </div>
    </nav>
  );
};
