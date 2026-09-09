import React, { useState } from 'react';
import { Language, CropType } from '../types';
import { te } from '../translations/te';
import { en } from '../translations/en';
import { 
  Camera, 
  Mic, 
  MicOff,
  AlertTriangle, 
  ArrowRight, 
  Droplets, 
  CloudRain, 
  Thermometer, 
  Volume2, 
  HelpCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { speechService, voiceRecognition } from '../utils/speech';
import { apiService } from '../services/api';
import { teluguTTS } from '../services/tts';

interface HomeScreenProps {
  language: Language;
  onStartScan: (crop?: CropType) => void;
  onViewField: () => void;
  onOpenHowToUse: () => void;
  onNavigateToActions?: () => void;
  onNavigateToAsk?: () => void;
  onNavigateToAlerts?: () => void;
  isActionCompleted?: boolean;
  onToggleActionCompleted?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  language,
  onStartScan,
  onViewField,
  onOpenHowToUse,
  onNavigateToActions,
  onNavigateToAsk,
  onNavigateToAlerts,
  isActionCompleted = false,
  onToggleActionCompleted
}) => {
  const [isListeningVoice, setIsListeningVoice] = useState(false);
  const [voiceQueryText, setVoiceQueryText] = useState('');
  const [voiceConfirmed, setVoiceConfirmed] = useState(false);
  const [voiceReplyText, setVoiceReplyText] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [localActionDone, setLocalActionDone] = useState(isActionCompleted);

  const isTelugu = language === 'te';
  const isCompleted = isActionCompleted || localActionDone;

  const handleMarkActionComplete = () => {
    speechService.playChime('success');
    setLocalActionDone(true);
    if (onToggleActionCompleted) {
      onToggleActionCompleted();
    }
  };

  // Voice Interaction
  const handleVoiceAsk = () => {
    if (isListeningVoice) {
      voiceRecognition.stop();
      setIsListeningVoice(false);
      return;
    }

    setVoiceReplyText('');
    setVoiceQueryText('');
    setVoiceConfirmed(false);
    setIsListeningVoice(true);

    const started = voiceRecognition.start({
      lang: isTelugu ? 'te-IN' : 'en-IN',
      onResult: (transcript) => {
        setIsListeningVoice(false);
        setVoiceQueryText(transcript);
      },
      onError: () => {
        setIsListeningVoice(false);
        simulateTeluguVoice();
      },
      onEnd: () => {
        setIsListeningVoice(false);
      }
    });

    if (!started) {
      simulateTeluguVoice();
    }
  };

  const [sampleQueryIndex, setSampleQueryIndex] = useState(0);

  const simulateTeluguVoice = () => {
    const samplesTe = [
      'ఆకులు పసుపుగా మారుతున్నాయి, ఏం చేయాలి?',
      'నేల ఎండిపోయింది, నీరు ఎప్పుడు పెట్టాలి?',
      'వరిలో అగ్గితెగులు (బ్లాస్ట్) అంటే ఏమిటి?',
      'నిన్న మందు పిచికారీ చేశాను, ఇప్పుడు ఏమి చేయాలి?',
      'ఆకులపై పురుగులు కనిపిస్తున్నాయి, నివారణ ఏమిటి?'
    ];
    const samplesEn = [
      'Leaves are turning yellow, what should I do?',
      'My soil is dry, when should I irrigate?',
      'What is rice blast disease?',
      'I sprayed yesterday, what should I do now?',
      'Insects visible on leaves, what is the remedy?'
    ];
    const samples = isTelugu ? samplesTe : samplesEn;
    const selected = samples[sampleQueryIndex % samples.length];
    setSampleQueryIndex(prev => prev + 1);
    setVoiceQueryText(selected);
    setIsListeningVoice(false);
  };

  const handleConfirmVoice = async () => {
    if (!voiceQueryText.trim()) return;
    setVoiceConfirmed(true);
    setIsAnswering(true);
    speechService.playChime('click');

    try {
      const res = await apiService.ask(voiceQueryText, 'cotton', language);
      setIsAnswering(false);
      const reply = isTelugu ? (res.replyTe || res.reply) : (res.replyEn || res.reply);
      setVoiceReplyText(reply);
      teluguTTS.speakText(reply, { lang: language });
    } catch {
      setIsAnswering(false);
      const fallback = isTelugu
        ? 'పంట సమాచారం విశ్లేషించబడింది. ఖచ్చితమైన నిర్ధారణ కోసం 📷 Scan Crop బటన్ నొక్కి ఫోటో తీయండి.'
        : 'Query analyzed. For verified visual diagnosis, tap 📷 Scan Crop.';
      setVoiceReplyText(fallback);
      teluguTTS.speakText(fallback, { lang: language });
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-4 sm:py-6 space-y-4 font-sans animate-fade-in pb-12">
      
      {/* 1. TOP HEADER: Greeting, Field Name, Weather Pill */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm">👋</span>
            <span className="text-xs font-black uppercase tracking-wider text-krishi-800">
              {isTelugu ? 'నమస్కారం' : 'Good Morning'}
            </span>
          </div>
          <h1 className="text-xl font-black text-charcoal-900 tracking-tight leading-tight">
            {isTelugu ? 'రాము వారి పత్తి చేను' : 'Ramu\'s Cotton Field'}
          </h1>
          <p className="text-[11px] font-medium text-charcoal-500">
            {isTelugu ? 'పూత దశ • బ్లాక్ 4 • 2.5 ఎకరాలు' : 'Peak Flowering • Block 4 • 2.5 Acres'}
          </p>
        </div>

        <button
          onClick={onOpenHowToUse}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-earth-300 text-[11px] font-bold text-charcoal-700 shadow-soft hover:bg-earth-50 cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-krishi-700" />
          <span>{isTelugu ? 'సహాయం' : 'Guide'}</span>
        </button>
      </div>

      {/* Weather & Microclimate Pill */}
      <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-earth-200 shadow-soft text-xs text-charcoal-700">
        <div className="flex items-center gap-2">
          <span className="text-base">☁️</span>
          <span className="font-bold text-charcoal-900">29.4°C</span>
          <span className="text-charcoal-400">•</span>
          <span className="flex items-center gap-1 font-semibold text-blue-800">
            <Droplets className="w-3.5 h-3.5 text-blue-600" />
            <span>84% తేమ</span>
          </span>
        </div>

        <span className="px-2 py-0.5 rounded-lg bg-teal-50 text-teal-900 font-black text-[10px]">
          వర్షం: 12.5 mm
        </span>
      </div>

      {/* 2. CROP HEALTH VISUAL & STATUS BADGE */}
      <div className={`p-4 rounded-3xl border-2 transition-all shadow-card flex items-center justify-between gap-4 ${
        isCompleted 
          ? 'bg-emerald-50/80 border-emerald-300' 
          : 'bg-amber-50/80 border-amber-300'
      }`}>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-wider block">
            {isTelugu ? 'పంట ప్రస్తుత స్థితి' : 'Current Crop Health'}
          </span>
          <p className="text-base font-black text-charcoal-900 flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isCompleted ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'}`}></span>
            <span>
              {isCompleted 
                ? (isTelugu ? 'మెరుగవుతోంది' : 'Improving') 
                : (isTelugu ? 'సరిచూడాలి (Verify)' : 'Needs Attention')}
            </span>
          </p>
          <p className="text-[11px] text-charcoal-600 font-medium">
            {isCompleted 
              ? (isTelugu ? 'రిస్క్ స్కోరు: 24/100 (తక్కువ)' : 'Risk: 24/100 (Low)') 
              : (isTelugu ? 'రిస్క్ స్కోరు: 78/100 (మధ్యస్థం)' : 'Risk: 78/100 (Moderate)')}
          </p>
        </div>

        {/* Dynamic Living Leaf Visual */}
        <div className="relative w-16 h-16 flex items-center justify-center flex-shrink-0">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md transition-all ${
            isCompleted 
              ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 scale-105' 
              : 'bg-gradient-to-tr from-amber-500 to-orange-600'
          }`}>
            {isCompleted ? '🌿' : '🍂'}
          </div>
          {!isCompleted && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 animate-ping ring-2 ring-white"></span>
          )}
        </div>
      </div>

      {/* 3. TODAY'S PRIORITY (ONE DOMINANT ACTION) */}
      <div className={`p-4 rounded-3xl border-2 transition-all shadow-elevated space-y-3 ${
        isCompleted
          ? 'bg-white border-emerald-300'
          : 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 text-white border-amber-400'
      }`}>
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
              isCompleted ? 'bg-emerald-100 text-emerald-900' : 'bg-black/30 text-white'
            }`}>
              {isTelugu ? 'నేటి ముఖ్య పని' : "TODAY'S PRIORITY"}
            </span>
          </div>

          <span className={`text-[11px] font-bold ${isCompleted ? 'text-charcoal-500' : 'text-amber-100'}`}>
            {isTelugu ? 'సాయంత్రం 05:00 లోపు' : 'Target: By 5:00 PM'}
          </span>
        </div>

        <div>
          <h2 className={`text-base font-black leading-tight ${isCompleted ? 'text-charcoal-900' : 'text-white'}`}>
            {isCompleted 
              ? (isTelugu ? '✓ ఆకు మచ్చల నివారణ పిచికారీ పూర్తయింది' : '✓ Foliar Spray Treatment Completed') 
              : (isTelugu ? 'కింది ఆకులను పరిశీలించండి — ఫంగిసైడ్ పిచికారీ చేయండి' : 'Inspect Lower Leaves — Apply Bio-Fungicide')}
          </h2>
          <p className={`text-xs mt-1 leading-relaxed ${isCompleted ? 'text-charcoal-600 font-medium' : 'text-amber-100'}`}>
            {isCompleted 
              ? (isTelugu ? '48 గంటల్లో ఫాలో-అప్ తనిఖీ చేయబడుతుంది.' : 'Follow-up foliar inspection due in 48 hours.') 
              : (isTelugu ? 'అధిక తేమ వల్ల ఆకులపై మచ్చలు వస్తున్నాయి. 1 లీటరుకు 3 గ్రాముల చొప్పున పిచికారీ చేయండి.' : 'Humidity over 80% triggered leaf spots. Mix 3g/L to arrest spore spread.')}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-1">
          {!isCompleted ? (
            <button
              onClick={handleMarkActionComplete}
              className="w-full py-3 rounded-2xl bg-white text-charcoal-950 hover:bg-earth-50 font-black text-sm shadow-xl flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-krishi-800" />
              <span>{isTelugu ? 'పని ప్రారంభించండి (CHECK NOW)' : 'CHECK NOW & COMPLETE'}</span>
            </button>
          ) : (
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="font-bold text-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isTelugu ? 'పూర్తయింది ✓' : 'Completed ✓'}</span>
              </span>
              {onNavigateToActions && (
                <button
                  onClick={onNavigateToActions}
                  className="font-bold text-krishi-800 hover:text-krishi-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>{isTelugu ? 'వివరాలు చూడండి' : 'View Action Log'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 4. SCAN CROP (PRIMARY CENTRAL INTERACTION) */}
      <button
        onClick={() => {
          speechService.playChime('click');
          onStartScan('cotton');
        }}
        className="w-full p-4 rounded-3xl bg-gradient-to-r from-krishi-800 via-krishi-800 to-krishi-700 hover:from-krishi-900 hover:to-krishi-800 text-white font-black text-base shadow-elevated flex items-center justify-between gap-3 active:scale-[0.98] transition-all cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-6 h-6 text-krishi-200" />
          </div>
          <div className="text-left">
            <span className="block text-base sm:text-lg font-black leading-tight">
              {isTelugu ? 'పంట ఫోటో తీయండి' : 'SCAN MY CROP'}
            </span>
            <span className="text-[11px] font-normal text-krishi-200">
              {isTelugu ? 'క్షణాల్లో సమస్యను నిర్ధారించండి' : 'Snap leaf photo for verified diagnosis'}
            </span>
          </div>
        </div>

        <ArrowRight className="w-5 h-5 text-krishi-200 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* 5. ASK BY VOICE (VOICE-FIRST INTERACTION) */}
      <div className="p-4 rounded-3xl bg-white border border-earth-200 shadow-soft space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-charcoal-900">
              {isTelugu ? 'కృషి-నేత్రను అడగండి' : 'Ask KRISHI-NETRA'}
            </h3>
            <p className="text-[11px] text-charcoal-500 font-medium">
              {isTelugu ? 'మీ సమస్యను తెలుగులో చెప్పండి' : 'Speak your observation in Telugu or English'}
            </p>
          </div>

          <button
            onClick={handleVoiceAsk}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all active:scale-95 cursor-pointer ${
              isListeningVoice 
                ? 'bg-amber-400 text-charcoal-900 animate-pulse ring-4 ring-amber-300' 
                : 'bg-krishi-50 text-krishi-800 hover:bg-krishi-100 border border-krishi-200'
            }`}
          >
            {isListeningVoice ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

        {/* Voice Confirmation Box */}
        {voiceQueryText && !voiceConfirmed && (
          <div className="p-3 rounded-2xl bg-earth-50 border border-earth-200 space-y-2 text-xs animate-fade-in">
            <p className="font-bold text-charcoal-700">
              {isTelugu ? 'మీరు చెప్పారు (YOU SAID):' : 'YOU SAID:'}
            </p>
            <p className="text-xs font-black text-krishi-900 bg-white p-2.5 rounded-xl border border-earth-200">
              "{voiceQueryText}"
            </p>
            <p className="text-[11px] text-charcoal-600 font-medium">
              {isTelugu ? 'మేము సరిగ్గా అర్థం చేసుకున్నామా?' : 'Did we understand correctly?'}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleConfirmVoice}
                className="flex-1 py-1.5 rounded-xl bg-krishi-800 text-white font-black text-xs shadow-soft hover:bg-krishi-900 cursor-pointer"
              >
                {isTelugu ? 'అవును (YES)' : 'YES'}
              </button>
              <button
                onClick={() => setVoiceQueryText('')}
                className="py-1.5 px-3 rounded-xl border border-earth-300 text-charcoal-700 font-bold text-xs hover:bg-earth-100 cursor-pointer"
              >
                {isTelugu ? 'మార్చండి' : 'CHANGE'}
              </button>
            </div>
          </div>
        )}

        {/* Voice Answer */}
        {voiceReplyText && (
          <div className="p-3 rounded-2xl bg-krishi-50 border border-krishi-200 text-xs space-y-1 animate-fade-in">
            <div className="flex items-center justify-between text-krishi-900 font-bold">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{isTelugu ? 'కృషి-నేత్ర సలహా:' : 'AI Advisory:'}</span>
              </span>
              <button 
                onClick={() => teluguTTS.speakText(voiceReplyText, { lang: language })}
                className="p-1 text-krishi-700 hover:text-krishi-900 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-charcoal-800 font-medium leading-relaxed pt-0.5">
              {voiceReplyText}
            </p>
          </div>
        )}

        {/* Link to Full Ask & Gesture Screen */}
        {onNavigateToAsk && (
          <div className="pt-1 border-t border-earth-100 flex items-center justify-between">
            <span className="text-[11px] text-charcoal-500 font-medium">
              {isTelugu ? 'ధ్వని, వాయిస్ నోట్స్ & సైగలతో మాట్లాడండి' : 'Speech, audio notes & sign gestures'}
            </span>
            <button
              onClick={() => {
                speechService.playChime('click');
                onNavigateToAsk();
              }}
              className="text-xs font-bold text-krishi-800 hover:text-krishi-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{isTelugu ? 'తెరువు' : 'Open Ask Mode'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* 6. ONE IMPORTANT ALERT */}
      <div 
        onClick={() => {
          if (onNavigateToAlerts) {
            speechService.playChime('click');
            onNavigateToAlerts();
          }
        }}
        className={`p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 shadow-soft flex items-start gap-3 text-xs ${
          onNavigateToAlerts ? 'cursor-pointer hover:bg-amber-100/60 transition-colors' : ''
        }`}
      >
        <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-black text-charcoal-900">
              {isTelugu ? '🌧 రాబోయే 24 గంటల్లో వర్ష సూచన' : '🌧 Rainfall Forecast (24h)'}
            </span>
            <span className="text-[10px] text-charcoal-500 font-bold">రేపు</span>
          </div>
          <p className="text-[11px] text-charcoal-600 font-medium mt-0.5 leading-relaxed">
            {isTelugu 
              ? 'మందు కొడితే వర్షపు నీటికి కొట్టుకుపోతుంది. వర్షం తగ్గే వరకు పిచికారీని వాయిదా వేయండి.' 
              : 'Intermittent rain showers forecast. Defer chemical sprays to prevent wash-off.'}
          </p>
          {onNavigateToAlerts && (
            <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-900">
              <span>{isTelugu ? 'అన్ని హెచ్చరికలు చూడండి' : 'View all 6 agronomic alerts'}</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          )}
        </div>
      </div>

      {/* 7. TODAY'S ACTIONS & RECENT CROP EVENT */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Actions Summary Card */}
        <button
          onClick={onNavigateToActions}
          className="p-3.5 rounded-2xl bg-white border border-earth-200 shadow-soft text-left space-y-1 hover:border-krishi-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-charcoal-500 text-[10px] font-bold uppercase">
            <span>{isTelugu ? 'పనుల రికార్డు' : 'Action Loop'}</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <p className="font-black text-charcoal-900 text-sm">
            {isCompleted ? (isTelugu ? 'పూర్తయింది ✓' : 'Up to Date ✓') : (isTelugu ? '1 పెండింగ్' : '1 Due Today')}
          </p>
          <p className="text-[10px] text-krishi-700 font-bold flex items-center gap-1">
            <span>{isTelugu ? '48 గంటల ఫాలో-అప్' : '48h Follow-up'}</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </button>

        {/* Recent Event Card */}
        <button
          onClick={onViewField}
          className="p-3.5 rounded-2xl bg-white border border-earth-200 shadow-soft text-left space-y-1 hover:border-krishi-300 transition-all cursor-pointer"
        >
          <div className="flex items-center justify-between text-charcoal-500 text-[10px] font-bold uppercase">
            <span>{isTelugu ? 'ఇటీవలి చర్య' : 'Recent Event'}</span>
            <Check className="w-3.5 h-3.5 text-krishi-700" />
          </div>
          <p className="font-black text-charcoal-900 text-sm">
            {isTelugu ? 'కాలువలు క్లియర్' : 'Drainage Open'}
          </p>
          <p className="text-[10px] text-charcoal-500 font-medium">
            {isTelugu ? 'నిన్న మధ్యాహ్నం' : 'Yesterday 2 PM'}
          </p>
        </button>
      </div>

    </div>
  );
};
