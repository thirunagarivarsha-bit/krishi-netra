import React from 'react';
import { Language } from '../types';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  Accessibility, 
  Type, 
  Sun, 
  Volume2, 
  Subtitles, 
  Languages, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  RefreshCw,
  Eye,
  MessageSquare,
  EarOff,
  MicOff,
  Smartphone
} from 'lucide-react';

interface AccessibilityScreenProps {
  language: Language;
  onNavigateToScan: () => void;
}

export const AccessibilityScreen: React.FC<AccessibilityScreenProps> = ({
  language,
  onNavigateToScan,
}) => {
  const { settings, toggleSetting, setLanguage, resetSettings } = useAccessibility();
  const isTelugu = language === 'te';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7 animate-fade-in">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-krishi-100 shadow-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-earth-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-krishi-100 border border-krishi-300 flex items-center justify-center text-krishi-900">
              <Accessibility className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight">
                {isTelugu ? 'సౌలభ్య సెట్టింగ్‌లు (Accessibility)' : 'Accessibility Center'}
              </h1>
              <p className="text-xs sm:text-sm text-charcoal-600 font-medium mt-0.5">
                {isTelugu
                  ? 'మాట్లాడలేని, వినలేని లేదా తక్కువ దృష్టి ఉన్న రైతుల కోసం స్వాతంత్ర్య సహాయం'
                  : 'Speak, hear & vision independence for all farmers'}
              </p>
            </div>
          </div>

          <button
            onClick={resetSettings}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-earth-300 bg-earth-50 hover:bg-earth-100 text-xs font-bold text-charcoal-700 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isTelugu ? 'రీసెట్' : 'Reset Defaults'}</span>
          </button>
        </div>

        {/* 3 User Independence Profiles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          
          <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 space-y-1.5">
            <div className="flex items-center gap-2 text-krishi-900 font-bold text-xs">
              <MicOff className="w-4 h-4 text-amber-600" />
              <span>{isTelugu ? 'మాట్లాడలేని రైతు' : 'Cannot Speak'}</span>
            </div>
            <p className="text-[11px] text-charcoal-600 leading-snug font-medium">
              {isTelugu 
                ? 'టచ్ స్క్రీన్ కార్డులు, ముందుగా సిద్ధం చేసిన ప్రశ్నల చిప్స్ ద్వారా పూర్తి పరీక్ష చేయవచ్చు.'
                : 'Use silent touch selection and quick-action chips to complete diagnosis without speaking.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 space-y-1.5">
            <div className="flex items-center gap-2 text-krishi-900 font-bold text-xs">
              <EarOff className="w-4 h-4 text-blue-600" />
              <span>{isTelugu ? 'వినలేని రైతు' : 'Cannot Hear'}</span>
            </div>
            <p className="text-[11px] text-charcoal-600 leading-snug font-medium">
              {isTelugu 
                ? 'ప్రతి వాయిస్ సమాధానానికి సమాంతరంగా స్క్రీన్ పై స్పష్టమైన సబ్‌టైటిల్స్ మరియు కార్డులు వస్తాయి.'
                : 'Synchronized visual subtitles, high-contrast badges & text cards replace all audio output.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 space-y-1.5">
            <div className="flex items-center gap-2 text-krishi-900 font-bold text-xs">
              <Eye className="w-4 h-4 text-teal-600" />
              <span>{isTelugu ? 'తక్కువ చూపు / తీవ్ర ఎండ' : 'Low Vision / Sunlight'}</span>
            </div>
            <p className="text-[11px] text-charcoal-600 leading-snug font-medium">
              {isTelugu 
                ? 'పెద్ద అక్షరాలు మరియు అధిక కాంట్రాస్ట్ ద్వారా పొలంలో తీవ్రమైన ఎండలోనూ స్పష్టంగా చూడవచ్చు.'
                : 'Large text typography and high-contrast styling ensure visibility even under harsh sunlight.'}
            </p>
          </div>

        </div>
      </div>

      {/* Primary Accessibility Toggle Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        {/* 1. Large Text Mode */}
        <div className="bg-white rounded-3xl p-5 border-2 border-krishi-100 shadow-card flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-krishi-50 border border-krishi-200 flex items-center justify-center text-krishi-800 flex-shrink-0 mt-0.5">
              <Type className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-charcoal-900">
                {isTelugu ? 'పెద్ద అక్షరాలు (Large Text)' : 'Large Text Mode'}
              </h2>
              <p className="text-xs text-charcoal-600 font-medium mt-0.5 leading-relaxed">
                {isTelugu
                  ? 'కంటిచూపు సమస్యలు ఉన్న రైతుల కోసం అక్షరాల పరిమాణాన్ని పెంచుతుంది'
                  : 'Increases base font size and spacing across all cards and buttons'}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleSetting('largeText')}
            className={`w-13 h-7 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 cursor-pointer ${
              settings.largeText ? 'bg-krishi-700' : 'bg-earth-300'
            }`}
            aria-label="Toggle large text"
          >
            <span
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.largeText ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 2. High Contrast Mode */}
        <div className="bg-white rounded-3xl p-5 border-2 border-krishi-100 shadow-card flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-800 flex-shrink-0 mt-0.5">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-charcoal-900">
                {isTelugu ? 'అధిక కాంట్రాస్ట్ (High Contrast)' : 'High Contrast Mode'}
              </h2>
              <p className="text-xs text-charcoal-600 font-medium mt-0.5 leading-relaxed">
                {isTelugu
                  ? 'పొలంలో ఎండ తీవ్రత ఎక్కువగా ఉన్నప్పుడు స్పష్టమైన నలుపు-తెలుపు బోర్డర్లు'
                  : 'Maximizes contrast for direct sunlight outdoors on the field'}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleSetting('highContrast')}
            className={`w-13 h-7 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 cursor-pointer ${
              settings.highContrast ? 'bg-krishi-700' : 'bg-earth-300'
            }`}
            aria-label="Toggle high contrast"
          >
            <span
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.highContrast ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 3. Voice Assistance */}
        <div className="bg-white rounded-3xl p-5 border-2 border-krishi-100 shadow-card flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-krishi-50 border border-krishi-200 flex items-center justify-center text-krishi-800 flex-shrink-0 mt-0.5">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-charcoal-900">
                {isTelugu ? 'వాయిస్ సహాయం (Voice Guidance)' : 'Voice Assistance'}
              </h2>
              <p className="text-xs text-charcoal-600 font-medium mt-0.5 leading-relaxed">
                {isTelugu
                  ? 'ఫలితాలు మరియు సలహాలను తెలుగులో మాట్లాడి వినిపిస్తుంది'
                  : 'Plays spoken audio narrations in natural Telugu / English'}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleSetting('voiceEnabled')}
            className={`w-13 h-7 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 cursor-pointer ${
              settings.voiceEnabled ? 'bg-krishi-700' : 'bg-earth-300'
            }`}
            aria-label="Toggle voice guidance"
          >
            <span
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.voiceEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* 4. Always-on Subtitles */}
        <div className="bg-white rounded-3xl p-5 border-2 border-krishi-100 shadow-card flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-800 flex-shrink-0 mt-0.5">
              <Subtitles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-charcoal-900">
                {isTelugu ? 'సబ్‌టైటిల్స్ (Subtitles / Captions)' : 'Always-on Subtitles'}
              </h2>
              <p className="text-xs text-charcoal-600 font-medium mt-0.5 leading-relaxed">
                {isTelugu
                  ? 'ప్రతి వాయిస్ సందేశానికి స్పష్టమైన అక్షరాల ప్రదర్శన మరియు హైలైట్'
                  : 'Displays synchronized on-screen text ticker for all audio responses'}
              </p>
            </div>
          </div>

          <button
            onClick={() => toggleSetting('subtitlesEnabled')}
            className={`w-13 h-7 rounded-full transition-colors relative flex items-center px-1 flex-shrink-0 cursor-pointer ${
              settings.subtitlesEnabled ? 'bg-krishi-700' : 'bg-earth-300'
            }`}
            aria-label="Toggle subtitles"
          >
            <span
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                settings.subtitlesEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

      </div>

      {/* Primary Language Selection Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-krishi-100 shadow-card space-y-3">
        <div className="flex items-center gap-2">
          <Languages className="w-5 h-5 text-krishi-700" />
          <h2 className="text-base font-black text-charcoal-900">
            {isTelugu ? 'భాష ఎంపిక (Primary Language)' : 'Language Selection'}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => setLanguage('te')}
            className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
              language === 'te'
                ? 'border-krishi-700 bg-krishi-50 font-black shadow-soft'
                : 'border-earth-200 bg-white hover:bg-earth-50'
            }`}
          >
            <div>
              <p className="text-base font-black text-charcoal-900">తెలుగు (Telugu)</p>
              <p className="text-xs text-charcoal-500 font-semibold mt-0.5">రైతులకు ప్రాథమిక భాష</p>
            </div>
            {language === 'te' && <CheckCircle2 className="w-5 h-5 text-krishi-700" />}
          </button>

          <button
            onClick={() => setLanguage('en')}
            className={`p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all cursor-pointer ${
              language === 'en'
                ? 'border-krishi-700 bg-krishi-50 font-black shadow-soft'
                : 'border-earth-200 bg-white hover:bg-earth-50'
            }`}
          >
            <div>
              <p className="text-base font-black text-charcoal-900">English</p>
              <p className="text-xs text-charcoal-500 font-semibold mt-0.5">Secondary Interface</p>
            </div>
            {language === 'en' && <CheckCircle2 className="w-5 h-5 text-krishi-700" />}
          </button>
        </div>
      </div>

      {/* Dedicated Section for Post-Analysis AI Assistant */}
      <div className="bg-gradient-to-r from-krishi-800 to-krishi-700 text-white rounded-3xl p-6 sm:p-7 shadow-elevated space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
            <MessageSquare className="w-6 h-6 text-krishi-200" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight">
              {isTelugu ? '🌱 కృషి-నేత్ర AI వాయిస్ & చాట్‌బాట్ సహాయకుడు' : '🌱 KRISHI-NETRA Context-Aware AI Assistant'}
            </h2>
            <p className="text-xs font-semibold text-krishi-100 mt-0.5">
              {isTelugu 
                ? 'పంట పరీక్ష తర్వాత మీ సందేహాలకు తెలుగు వాయిస్ & టెక్స్ట్ సమాధానాలు' 
                : 'Interactive Telugu voice Q&A and instant chat based on active crop diagnosis'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold">
          <span className="px-3 py-1 rounded-xl bg-white/15 backdrop-blur-sm">🎤 తెలుగు వాయిస్ ఇన్పుట్</span>
          <span className="px-3 py-1 rounded-xl bg-white/15 backdrop-blur-sm">🔊 తెలుగు ఆడియో ప్లేబ్యాక్</span>
          <span className="px-3 py-1 rounded-xl bg-white/15 backdrop-blur-sm">📝 రియల్-టైమ్ సబ్‌టైటిల్స్</span>
          <span className="px-3 py-1 rounded-xl bg-white/15 backdrop-blur-sm">🛡️ సురక్షిత వ్యవసాయ సలహాలు</span>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs font-bold text-krishi-100">
            {isTelugu ? 'పంట ఫలితాల స్క్రీన్ పై సహాయకుడు స్వయంచాలకంగా అందుబాటులో ఉంటాడు' : 'Assistant appears automatically below diagnosis results'}
          </span>
          <button
            onClick={onNavigateToScan}
            className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-charcoal-950 font-black text-xs sm:text-sm shadow-lg flex items-center gap-2 active:scale-95 transition-transform cursor-pointer"
          >
            <span>{isTelugu ? 'పంట స్కాన్ ప్రారంభించండి' : 'Start Crop Scan'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* THREE INDEPENDENT COMMUNICATION PATHS EXPLAINER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-krishi-100 shadow-card space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-krishi-700" />
          <h3 className="text-lg font-black text-charcoal-900">
            {isTelugu ? 'స్వతంత్ర సంభాషణ మార్గాలు (Universal Access)' : 'Independent Communication Channels'}
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-charcoal-600 font-medium leading-relaxed">
          {isTelugu
            ? 'KRISHI-NETRA లో ఏ ఒక్క విధానం కూడా తప్పనిసరి కాదు. రైతు తనకు అనువైన మార్గంలో మొత్తం ప్రక్రియను పూర్తి చేయవచ్చు.'
            : 'No single communication path is required. Every farmer can navigate the core workflow via the medium best suited to them:'}
        </p>

        <div className="space-y-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 text-xs font-medium space-y-1">
            <span className="font-black text-krishi-900">1. VOICE (వాయిస్ మార్గం):</span>
            <p className="text-charcoal-700">
              {isTelugu 
                ? 'తెలుగు మాట → AI విశ్లేషణ → తెలుగు వాయిస్ + స్క్రీన్ సబ్‌టైటిల్స్'
                : 'Telugu speech → AI reasoning → Spoken voice + synchronized subtitles'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 text-xs font-medium space-y-1">
            <span className="font-black text-krishi-900">2. TEXT / TOUCH (టెక్స్ట్ & టచ్ మార్గం):</span>
            <p className="text-charcoal-700">
              {isTelugu 
                ? 'టచ్ కార్డుల ఎంపిక → AI విశ్లేషణ → దృశ్య కార్డులు + సలహాలు (100% నిశ్శబ్దం)'
                : 'Touch selection & cards → AI reasoning → Visual text + color indicators (100% silent)'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 text-xs font-medium space-y-1">
            <span className="font-black text-krishi-900">3. AI ASSISTANT CHAT (సహాయకుడు చాట్):</span>
            <p className="text-charcoal-700">
              {isTelugu 
                ? 'సిద్ధం చేసిన ప్రశ్నల చిప్స్ లేదా టైపింగ్ → తక్షణ వ్యవసాయ సలహా + ఆడియో నియంత్రణలు'
                : 'Ready question chips or typing → Grounded agronomic guidance + playback controls'}
            </p>
          </div>
        </div>

        <div className="pt-3 border-t border-earth-200 flex justify-end">
          <button
            onClick={onNavigateToScan}
            className="px-6 py-3 rounded-2xl bg-krishi-800 hover:bg-krishi-900 text-white font-black text-xs sm:text-sm shadow-soft flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>{isTelugu ? 'పంట పరీక్షకు వెళ్లండి' : 'Proceed to Crop Scan'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
