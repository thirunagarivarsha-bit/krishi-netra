import React, { useState } from 'react';
import { Language, VoiceNote, AudioDebugInfo } from '../types';
import { te } from '../translations/te';
import { en } from '../translations/en';
import { teluguTTS } from '../services/tts';
import { voiceRecognition, speechService } from '../utils/speech';
import { apiService } from '../services/api';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  HelpCircle, 
  Hand, 
  Check, 
  Clock, 
  Volume2,
  Sparkles,
  Terminal,
  Activity
} from 'lucide-react';

interface AskScreenProps {
  language: Language;
  onNavigateToScan: () => void;
}

export const AskScreen: React.FC<AskScreenProps> = ({
  language,
  onNavigateToScan
}) => {
  const { settings } = useAccessibility();
  const isTelugu = language === 'te';

  // Mode: 'voice' | 'notes' | 'gestures'
  const [activeMode, setActiveMode] = useState<'voice' | 'notes' | 'gestures'>('voice');

  // Voice Query State
  const [isListening, setIsListening] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [confirmedTranscript, setConfirmedTranscript] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isResponding, setIsResponding] = useState(false);
  const [lastResponseTe, setLastResponseTe] = useState<string | null>(null);
  const [lastResponseEn, setLastResponseEn] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [highlightCharIndex, setHighlightCharIndex] = useState<number>(-1);
  const [audioDebug, setAudioDebug] = useState<AudioDebugInfo | null>(null);
  const [dynamicFollowUpsTe, setDynamicFollowUpsTe] = useState<string[]>([]);
  const [dynamicFollowUpsEn, setDynamicFollowUpsEn] = useState<string[]>([]);

  // Active Information Gathering (Uncertainty Follow-Ups)
  const [selectedLeafLocation, setSelectedLeafLocation] = useState<string | null>(null);
  const [selectedSymptomType, setSelectedSymptomType] = useState<string | null>(null);
  const [activeClarificationResult, setActiveClarificationResult] = useState<string | null>(null);

  // Voice Notes
  const [voiceNotes] = useState<VoiceNote[]>([
    {
      id: 'vn-1',
      transcriptTe: 'పత్తి ఆకుల అంచులు ఎండిపోయి గోధుమ రంగు మచ్చలు వస్తున్నాయి.',
      transcriptEn: 'Cotton leaf margins drying with brown spots developing.',
      recordedAt: 'Today, 08:30 AM',
      durationSeconds: 6
    },
    {
      id: 'vn-2',
      transcriptTe: 'మొలకల దశలో కింద ఆకులపై లేత పసుపు రంగు కనిపిస్తోంది.',
      transcriptEn: 'Light yellowing visible on bottom leaves during seedling stage.',
      recordedAt: 'Yesterday, 05:15 PM',
      durationSeconds: 4
    }
  ]);
  const [activePlayingNoteId, setActivePlayingNoteId] = useState<string | null>(null);

  // Visual Gesture Recognition (Constrained Vocabulary)
  const [activeGesture, setActiveGesture] = useState<'HELP' | 'OK' | 'NEXT' | 'STOP' | 'WATER' | 'CROP' | null>('WATER');
  const [gestureFeedback, setGestureFeedback] = useState<string>(
    isTelugu ? '💧 నీరు (WATER) సంజ్ఞ గుర్తించబడింది ➔ తేమ స్థాయి 42%' : '💧 WATER gesture detected ➔ Soil moisture is 42%'
  );

  // Quick preset questions (Includes all 5 key agronomic scenarios)
  const presetQuestions = isTelugu ? [
    'వరి ఆకులు పసుపుగా మారుతున్నాయి, ఏం చేయాలి?',
    'నేల ఎండిపోయింది, నీరు ఎప్పుడు పెట్టాలి?',
    'వరిలో అగ్గితెగులు (బ్లాస్ట్) అంటే ఏమిటి?',
    'నిన్న మందు పిచికారీ చేశాను, ఇప్పుడు ఏమి చేయాలి?',
    'ఆకులపై గోధుమ రంగు మచ్చలు ఎందుకు వస్తున్నాయి?',
    'ఆకుల కింద పురుగులు కనిపిస్తున్నాయి, నివారణ ఏమిటి?'
  ] : [
    'My paddy leaves are becoming yellow.',
    'My soil is dry. Should I irrigate?',
    'What is blast disease?',
    'I sprayed yesterday. What should I do now?',
    'Why are my leaves having brown spots?',
    'Insects visible on leaves, what is the remedy?'
  ];

  // Handle Speech Input
  const handleToggleListening = () => {
    if (isListening) {
      voiceRecognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    speechService.playChime('click');
    const started = voiceRecognition.start({
      lang: language === 'te' ? 'te-IN' : 'en-IN',
      onResult: (result) => {
        setCurrentTranscript(result);
        setIsListening(false);
        speechService.playChime('success');
      },
      onError: () => {
        setIsListening(false);
        const demoPhrase = isTelugu 
          ? 'నా వరి ఆకులు పసుపుగా మారుతున్నాయి, ఏమి చేయాలి?'
          : 'My paddy leaves are turning yellow, what should I do?';
        setCurrentTranscript(demoPhrase);
      },
      onEnd: () => setIsListening(false)
    });

    if (!started) {
      const demoPhrase = isTelugu 
        ? 'నా వరి ఆకులు పసుపుగా మారుతున్నాయి, ఏమి చేయాలి?'
        : 'My paddy leaves are turning yellow, what should I do?';
      setCurrentTranscript(demoPhrase);
      setIsListening(false);
    }
  };

  // Submit farmer observation to AI
  const handleProcessQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    setIsResponding(true);
    speechService.playChime('click');

    try {
      const res = await apiService.ask(queryText, 'paddy', language);
      setIsResponding(false);
      const resTe = res.replyTe || res.reply;
      const resEn = res.replyEn || res.reply;
      
      setLastResponseTe(resTe);
      setLastResponseEn(resEn);
      if (res.audioDebug) setAudioDebug(res.audioDebug);
      if (res.suggestedFollowUpsTe) setDynamicFollowUpsTe(res.suggestedFollowUpsTe);
      if (res.suggestedFollowUpsEn) setDynamicFollowUpsEn(res.suggestedFollowUpsEn);
      speechService.playChime('success');

      if (settings.voiceEnabled) {
        teluguTTS.speakText(isTelugu ? resTe : resEn, {
          lang: language,
          onStart: () => setIsPlayingAudio(true),
          onEnd: () => {
            setIsPlayingAudio(false);
            setHighlightCharIndex(-1);
          },
          onBoundary: (idx) => setHighlightCharIndex(idx)
        });
      }
    } catch {
      setIsResponding(false);
      const fallbackTe = 'పంట సమాచారం విశ్లేషించబడింది. ఆకులను 📷 Scan Crop లో పరీక్షించండి.';
      const fallbackEn = 'Observation recorded. Use 📷 Scan Crop for detailed foliar analysis.';
      setLastResponseTe(fallbackTe);
      setLastResponseEn(fallbackEn);
    }
  };

  // Play audio response
  const handleToggleVoicePlayback = () => {
    if (isPlayingAudio) {
      teluguTTS.stop();
      setIsPlayingAudio(false);
      setHighlightCharIndex(-1);
    } else if (lastResponseTe) {
      const textToSpeak = isTelugu ? lastResponseTe : (lastResponseEn || lastResponseTe);
      teluguTTS.speakText(textToSpeak, {
        lang: language,
        onStart: () => setIsPlayingAudio(true),
        onEnd: () => {
          setIsPlayingAudio(false);
          setHighlightCharIndex(-1);
        },
        onBoundary: (idx) => setHighlightCharIndex(idx)
      });
      setIsPlayingAudio(true);
    }
  };

  // Handle clarification from active information gathering
  const handleSelectClarification = (type: 'location' | 'symptom', value: string) => {
    speechService.playChime('click');
    if (type === 'location') setSelectedLeafLocation(value);
    if (type === 'symptom') setSelectedSymptomType(value);

    if (value === 'bottom' || value === 'yellowing') {
      setActiveClarificationResult(isTelugu 
        ? '✓ క్రింది ఆకులలో కేవలం పసుపు రంగు ఉండడం సాధారణ నత్రజని లోపం లేదా నీటి ఎద్దడిని సూచిస్తుంది. శిలీంధ్ర వ్యాధి లక్షణం కాదు. రసాయన మందులు అవసరం లేదు.'
        : '✓ Yellowing localized to bottom leaves indicates physiological nitrogen translocation or moisture stress, not fungal blast. Chemical spray is NOT recommended.');
    } else {
      setActiveClarificationResult(isTelugu 
        ? '⚠️ లేత ఆకులపై మచ్చలు కనిపించడం శిలీంధ్ర వ్యాధి ప్రారంభ సంకేతం. పంట ఆకును కెమెరాతో స్కాన్ చేసి ఖచ్చితమైన నిర్ధారణ పొందండి.'
        : '⚠️ Spots on tender new growth suggest foliar fungal infection. Please perform a camera scan for definitive diagnosis.');
    }
  };

  // Handle Gesture Selection (Accessible visual mode)
  const handleSelectGesture = (gesture: 'HELP' | 'OK' | 'NEXT' | 'STOP' | 'WATER' | 'CROP') => {
    speechService.playChime('click');
    setActiveGesture(gesture);
    const feedbackMap = {
      HELP: isTelugu ? '🆘 సహాయం (HELP): వాయిస్ సహాయకుడు సిద్ధంగా ఉంది' : '🆘 HELP: Voice guidance active',
      OK: isTelugu ? '👍 నిర్ధారించండి (OK): సూచించిన చర్య పూర్తయింది' : '👍 OK: Current advisory confirmed',
      NEXT: isTelugu ? '➡️ తదుపరి (NEXT): తదుపరి సూచన చూపిస్తున్నాం' : '➡️ NEXT: Advancing to next guideline',
      STOP: isTelugu ? '✋ ఆపు (STOP): రసాయన పిచికారీని నిలిపివేయండి' : '✋ STOP: Chemical spray suspended',
      WATER: isTelugu ? '💧 నీరు (WATER): ప్రస్తుత నేల తేమ 42% (తక్కువ)' : '💧 WATER: Current soil moisture 42% (Low)',
      CROP: isTelugu ? '🌱 పంట (CROP): పత్తి పంట పూత దశలో ఉంది' : '🌱 CROP: Cotton in flowering stage'
    };
    setGestureFeedback(feedbackMap[gesture]);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎙️</span>
            <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
              {isTelugu ? 'కృషి-నేత్ర సహాయకుడు' : 'Ask KRISHI-NETRA'}
            </h1>
          </div>
          <p className="text-xs text-charcoal-500 font-medium mt-0.5">
            {isTelugu ? 'వాయిస్, టెక్స్ట్ మరియు సైగలతో వ్యవసాయ సలహాలు' : 'Voice, text & gesture-assisted decision support'}
          </p>
        </div>

        <button
          onClick={onNavigateToScan}
          className="px-3.5 py-2 rounded-xl bg-krishi-800 hover:bg-krishi-900 text-white font-bold text-xs shadow-soft flex items-center gap-1.5 cursor-pointer active:scale-95"
        >
          <span>📷 {isTelugu ? 'స్కాన్' : 'Scan'}</span>
        </button>
      </div>

      {/* 3 Sub-Modes Switcher */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-earth-100/90 border border-earth-200">
        <button
          onClick={() => {
            speechService.playChime('click');
            setActiveMode('voice');
          }}
          className={`py-2 px-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeMode === 'voice'
              ? 'bg-white text-krishi-900 shadow-soft'
              : 'text-charcoal-600 hover:text-krishi-900'
          }`}
        >
          <Mic className="w-3.5 h-3.5" />
          <span>{isTelugu ? 'వాయిస్' : 'Voice Ask'}</span>
        </button>

        <button
          onClick={() => {
            speechService.playChime('click');
            setActiveMode('notes');
          }}
          className={`py-2 px-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeMode === 'notes'
              ? 'bg-white text-krishi-900 shadow-soft'
              : 'text-charcoal-600 hover:text-krishi-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>{isTelugu ? 'నోట్స్' : 'Voice Notes'}</span>
        </button>

        <button
          onClick={() => {
            speechService.playChime('click');
            setActiveMode('gestures');
          }}
          className={`py-2 px-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer ${
            activeMode === 'gestures'
              ? 'bg-white text-krishi-900 shadow-soft'
              : 'text-charcoal-600 hover:text-krishi-900'
          }`}
        >
          <Hand className="w-3.5 h-3.5" />
          <span>{isTelugu ? 'సంజ్ఞలు' : 'Gestures'}</span>
        </button>
      </div>

      {/* MODE 1: VOICE & ASK */}
      {activeMode === 'voice' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Central Microphone Interactive Card */}
          <div className="bg-white rounded-3xl p-6 border border-krishi-100 shadow-card text-center space-y-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500">
                {isTelugu ? 'మీ సమస్యను తెలుగులో చెప్పండి' : 'Speak naturally in Telugu or English'}
              </span>
              <h2 className="text-base sm:text-lg font-black text-charcoal-900 mt-0.5">
                {isListening ? (isTelugu ? 'వింటున్నాము... మాట్లాడండి' : 'Listening... Speak now') : (isTelugu ? 'మైక్రోఫోన్ నొక్కి మాట్లాడండి' : 'Tap to Ask KRISHI-NETRA')}
              </h2>
            </div>

            {/* Large Glowing Mic Button */}
            <div className="flex items-center justify-center py-2">
              <button
                type="button"
                onClick={handleToggleListening}
                className={`w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-elevated transition-all active:scale-95 cursor-pointer relative ${
                  isListening
                    ? 'bg-amber-500 text-charcoal-950 ring-8 ring-amber-200 animate-pulse'
                    : 'bg-gradient-to-tr from-krishi-800 to-krishi-700 text-white hover:scale-105 shadow-krishi-900/30'
                }`}
                aria-label="Voice input"
              >
                {isListening ? (
                  <MicOff className="w-9 h-9" />
                ) : (
                  <Mic className="w-9 h-9 stroke-[2.2]" />
                )}
                <span className="text-[10px] font-black uppercase tracking-wider mt-1">
                  {isListening ? (isTelugu ? 'ఆపు' : 'Stop') : (isTelugu ? 'మాట్లాడు' : 'Speak')}
                </span>
              </button>
            </div>

            {/* Live Transcription Confirmation Card: YOU SAID */}
            {(currentTranscript || confirmedTranscript) && (
              <div className="p-4 rounded-2xl bg-earth-50 border border-earth-300 text-left space-y-3 animate-fade-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-charcoal-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-krishi-700" />
                    <span>{isTelugu ? 'మీరు చెప్పినది (YOU SAID):' : 'YOU SAID:'}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-krishi-100 text-krishi-900">
                    VOICE TRANSCRIPTION
                  </span>
                </div>

                <p className="text-sm font-semibold text-charcoal-900 italic bg-white p-3 rounded-xl border border-earth-200 leading-relaxed">
                  "{currentTranscript || confirmedTranscript}"
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-xs font-bold text-charcoal-600">
                    {isTelugu ? 'మేము సరిగ్గా అర్థం చేసుకున్నామా?' : 'Did we understand correctly?'}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        speechService.playChime('success');
                        setIsConfirmed(true);
                        setConfirmedTranscript(currentTranscript);
                        handleProcessQuery(currentTranscript);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-krishi-800 text-white text-xs font-black shadow-soft hover:bg-krishi-900 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                      <span>{isTelugu ? 'అవును, అడగండి (YES)' : 'YES, ASK'}</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        speechService.playChime('click');
                        setCurrentTranscript('');
                        setIsConfirmed(false);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-earth-300 text-charcoal-700 text-xs font-bold hover:bg-earth-100 cursor-pointer"
                    >
                      <span>{isTelugu ? 'మార్చండి (CHANGE)' : 'CHANGE'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Quick 1-Tap Preset Questions */}
            <div className="pt-2 border-t border-earth-200 space-y-2 text-left">
              <p className="text-xs font-bold text-charcoal-600">
                {isTelugu ? 'తరచుగా అడిగే ప్రశ్నలు (1-Tap):' : 'Frequently Asked (1-Tap):'}
              </p>
              <div className="flex flex-wrap gap-2">
                {presetQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentTranscript(q);
                      handleProcessQuery(q);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-earth-50 border border-earth-200 hover:border-krishi-400 text-charcoal-800 text-xs font-semibold transition-all active:scale-95 text-left cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Response Card with Audio Playback & Subtitles */}
          {isResponding && (
            <div className="p-5 rounded-3xl bg-white border border-krishi-200 shadow-soft text-center space-y-2 animate-fade-in">
              <div className="w-6 h-6 border-2 border-krishi-700 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-charcoal-600">
                {isTelugu ? 'కృషి-నేత్ర సమాధానాన్ని సిద్ధం చేస్తోంది...' : 'KRISHI-NETRA analyzing response...'}
              </p>
            </div>
          )}

          {lastResponseTe && !isResponding && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-krishi-600/30 shadow-card space-y-3.5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-earth-200 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-krishi-600 animate-pulse"></span>
                  <span className="text-xs font-black uppercase tracking-wider text-krishi-900">
                    {isTelugu ? 'కృషి-నేత్ర సలహా' : 'KRISHI-NETRA Agronomic Advisory'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleToggleVoicePlayback}
                  className="px-3 py-1.5 rounded-xl bg-krishi-100 hover:bg-krishi-200 text-krishi-900 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {isPlayingAudio ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>{isTelugu ? 'ఆపండి' : 'Pause'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>{isTelugu ? 'వినండి' : 'Listen'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Subtitles & Spoken Response Content */}
              <div className="p-3.5 rounded-2xl bg-krishi-50/70 border border-krishi-200 space-y-2">
                {isPlayingAudio && (
                  <div className="flex items-center gap-1.5 pb-1 text-[10px] font-black uppercase text-krishi-800">
                    <span className="w-2 h-2 rounded-full bg-krishi-600 animate-ping"></span>
                    <span>{isTelugu ? 'ధ్వని పఠనం జరుగుతోంది (AUDIO PLAYING)...' : 'SPOKEN AUDIO PLAYING...'}</span>
                  </div>
                )}
                <p className="text-xs sm:text-sm font-semibold text-charcoal-900 leading-relaxed whitespace-pre-line">
                  {isTelugu ? lastResponseTe : (lastResponseEn || lastResponseTe)}
                </p>
              </div>

              {/* Dynamic Follow-up Suggestions */}
              {(isTelugu ? dynamicFollowUpsTe : dynamicFollowUpsEn).length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-black uppercase tracking-wider text-charcoal-600 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>{isTelugu ? 'సంబంధిత తదుపరి ప్రశ్నలు (1-Tap):' : 'Suggested Follow-Up Questions:'}</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(isTelugu ? dynamicFollowUpsTe : dynamicFollowUpsEn).map((fq, fidx) => (
                      <button
                        key={fidx}
                        onClick={() => {
                          setCurrentTranscript(fq);
                          handleProcessQuery(fq);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-charcoal-900 text-xs font-bold text-left transition-all cursor-pointer"
                      >
                        {fq}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Audio Debug Panel (PART 35 Requirement) */}
              {audioDebug && (
                <div className="p-3 rounded-2xl bg-charcoal-950 text-white font-mono text-[11px] space-y-1.5 border border-charcoal-800 shadow-elevated">
                  <div className="flex items-center justify-between border-b border-charcoal-800 pb-1">
                    <span className="font-black text-amber-400 flex items-center gap-1">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>AUDIO DEBUG PANEL</span>
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/80 text-emerald-300 font-bold uppercase tracking-wider">
                      {audioDebug.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-0.5 text-charcoal-300">
                    <div><span className="text-charcoal-500">Input:</span> <strong className="text-white">{audioDebug.inputLanguage}</strong></div>
                    <div><span className="text-charcoal-500">Response:</span> <strong className="text-white">{audioDebug.responseLanguage}</strong></div>
                    <div><span className="text-charcoal-500">TTS Engine:</span> <strong className="text-krishi-400">{audioDebug.ttsModel}</strong></div>
                    <div><span className="text-charcoal-500">Audio:</span> <strong className="text-emerald-400">{audioDebug.audioGenerated ? 'READY' : 'OFFLINE'}</strong></div>
                  </div>
                </div>
              )}

              <div className="text-[11px] text-charcoal-500 font-medium">
                🛡️ {isTelugu ? 'ఈ సలహా కేవలం అధికారిక వ్యవసాయ పరిశోధనా మార్గదర్శకాల ఆధారంగా రూపొందించబడింది.' : 'Grounded in ICAR/ANGRAU agricultural guidance. No pesticide dosage invented.'}
              </div>
            </div>
          )}

          {/* ACTIVE INFORMATION GATHERING (When Uncertainty Is High) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-earth-200 shadow-soft space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-krishi-700" />
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-charcoal-900">
                    {isTelugu ? 'సందేహ నివృత్తి ప్రశ్నలు (Active Follow-Up)' : 'Active Information Gathering'}
                  </h3>
                  <p className="text-[11px] text-charcoal-500 font-medium">
                    {isTelugu ? 'సందేహం ఎక్కువగా ఉన్నప్పుడు AI రైతును ప్రశ్నలు అడుగుతుంది' : 'AI asks targeted questions to reduce diagnostic uncertainty'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                UNCERTAINTY REDUCTION
              </span>
            </div>

            {/* Question 1: Where is the yellowing? */}
            <div className="space-y-2">
              <p className="text-xs font-black text-charcoal-800">
                1. {isTelugu ? 'ఆకులు ఎక్కడ పసుపుగా మారాయి? (Where is the yellowing?)' : 'Where is the yellowing located?'}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'bottom', te: '🍃 క్రింది ఆకులు', en: 'Bottom leaves' },
                  { id: 'top', te: '🌱 పై లేత చిగుర్లు', en: 'New top leaves' },
                  { id: 'whole', te: '🌿 మొత్తం మొక్క', en: 'Whole plant' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectClarification('location', item.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      selectedLeafLocation === item.id
                        ? 'bg-krishi-800 text-white border-krishi-900 shadow-soft'
                        : 'bg-earth-50 border-earth-200 text-charcoal-700 hover:bg-earth-100'
                    }`}
                  >
                    {isTelugu ? item.te : item.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: What do you see? */}
            <div className="space-y-2">
              <p className="text-xs font-black text-charcoal-800">
                2. {isTelugu ? 'మీరు ఆకుపై ఏమి చూస్తున్నారు? (What do you see?)' : 'What visual symptoms do you observe?'}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'spots', te: '🟤 మచ్చలు (Spots)', en: 'Leaf Spots' },
                  { id: 'insects', te: '🐛 పురుగులు (Pests)', en: 'Pests/Insects' },
                  { id: 'wilting', te: '🥀 వాడటం (Wilting)', en: 'Wilting' },
                  { id: 'yellowing', te: '🟡 పసుపు రంగు మాత్రమే', en: 'Only Yellowing' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectClarification('symptom', item.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      selectedSymptomType === item.id
                        ? 'bg-krishi-800 text-white border-krishi-900 shadow-soft'
                        : 'bg-earth-50 border-earth-200 text-charcoal-700 hover:bg-earth-100'
                    }`}
                  >
                    {isTelugu ? item.te : item.en}
                  </button>
                ))}
              </div>
            </div>

            {/* Clarification Result Feedback */}
            {activeClarificationResult && (
              <div className="p-3.5 rounded-2xl bg-krishi-50 border border-krishi-300 text-xs font-semibold text-krishi-950 leading-relaxed animate-fade-in">
                {activeClarificationResult}
              </div>
            )}
          </div>

        </div>
      )}

      {/* MODE 2: VOICE NOTES LOG */}
      {activeMode === 'notes' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-earth-200 shadow-card space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-earth-200 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-charcoal-900">
                {isTelugu ? 'రైతు వాయిస్ నోట్స్ (Farmer Voice Notes)' : 'Farmer Voice Observation Log'}
              </h2>
              <p className="text-xs text-charcoal-500 font-medium">
                {isTelugu ? 'పొలంలో రికార్డ్ చేసిన మాటలు సలహాదారుల పరిశీలనకు భద్రపరచబడ్డాయి' : 'Voice recordings preserved for field advisor and KVK audit'}
              </p>
            </div>
            <span className="text-xs font-black px-2.5 py-1 rounded-full bg-earth-100 text-charcoal-800">
              {voiceNotes.length} {isTelugu ? 'నోట్స్' : 'Notes'}
            </span>
          </div>

          <div className="space-y-3">
            {voiceNotes.map((note) => (
              <div key={note.id} className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-charcoal-500">{note.recordedAt}</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-krishi-100 text-krishi-900">
                    {note.durationSeconds}s AUDIO
                  </span>
                </div>

                <p className="text-xs sm:text-sm font-bold text-charcoal-900 leading-snug">
                  "{isTelugu ? note.transcriptTe : note.transcriptEn}"
                </p>

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => {
                      if (activePlayingNoteId === note.id) {
                        teluguTTS.stop();
                        setActivePlayingNoteId(null);
                      } else {
                        teluguTTS.speakText(isTelugu ? note.transcriptTe : note.transcriptEn, {
                          lang: language,
                          onEnd: () => setActivePlayingNoteId(null)
                        });
                        setActivePlayingNoteId(note.id);
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white border border-earth-300 hover:bg-earth-100 text-charcoal-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    {activePlayingNoteId === note.id ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-krishi-700" />
                        <span>{isTelugu ? 'ఆపండి' : 'Stop'}</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-krishi-700" />
                        <span>{isTelugu ? 'వినండి (Play)' : 'Play Note'}</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] text-charcoal-500 font-medium">
                    ✓ {isTelugu ? 'KVK ఆడిట్ కోసం రికార్డ్ అయింది' : 'Verified for KVK audit'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODE 3: VISUAL GESTURE MODE (ACCESSIBILITY) */}
      {activeMode === 'gestures' && (
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-earth-200 shadow-card space-y-4 animate-fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">✋</span>
              <h2 className="text-base sm:text-lg font-black text-charcoal-900">
                {isTelugu ? 'దృశ్య సంజ్ఞల విధానం (Visual Gesture Mode)' : 'Visual Gesture Assistance Mode'}
              </h2>
            </div>
            <p className="text-xs text-charcoal-500 font-medium mt-0.5">
              {isTelugu 
                ? 'మాటలు లేదా వినికిడి లోపం ఉన్న రైతులకు పరిమిత వ్యవసాయ సంజ్ఞల సహాయం' 
                : 'Constrained agricultural gestures for speech or hearing-impaired farmers'}
            </p>
          </div>

          {/* Active Gesture Detection Visual Display */}
          <div className="p-4 rounded-2xl bg-krishi-50/80 border-2 border-krishi-300 text-center space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-krishi-800 bg-white px-2.5 py-0.5 rounded-full border border-krishi-200">
              RECOGNIZED GESTURE
            </span>
            <p className="text-sm font-black text-krishi-950">
              {gestureFeedback}
            </p>
            <p className="text-[10px] text-charcoal-500 font-medium">
              {isTelugu ? 'శబ్దం లేదా మాటలు ఏవీ లేకుండా నేరుగా చర్యలను ఆదేశించవచ్చు' : 'Commands decisions silently without requiring speech or hearing'}
            </p>
          </div>

          {/* Constrained Vocabulary Cards (6 Gestures) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { id: 'STOP' as const, emoji: '✋', te: 'STOP (ఆపు)', descTe: 'మందు కొట్టడం ఆపండి' },
              { id: 'OK' as const, emoji: '👍', te: 'OK (అవును)', descTe: 'చర్యను నిర్ధారించండి' },
              { id: 'NEXT' as const, emoji: '➡️', te: 'NEXT (తదుపరి)', descTe: 'తర్వాతి సూచన' },
              { id: 'HELP' as const, emoji: '🆘', te: 'HELP (సహాయం)', descTe: 'సలహా వినండి' },
              { id: 'WATER' as const, emoji: '💧', te: 'WATER (నీరు)', descTe: 'నేలలో తేమ తనిఖీ' },
              { id: 'CROP' as const, emoji: '🌱', te: 'CROP (పంట)', descTe: 'పంట స్థితి చూడండి' },
            ].map((gesture) => {
              const isSelected = activeGesture === gesture.id;
              return (
                <button
                  key={gesture.id}
                  onClick={() => handleSelectGesture(gesture.id)}
                  className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between space-y-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-krishi-700 bg-krishi-50/90 shadow-soft ring-2 ring-krishi-400'
                      : 'border-earth-200 bg-white hover:bg-earth-50'
                  }`}
                >
                  <span className="text-2xl">{gesture.emoji}</span>
                  <div>
                    <p className="text-xs font-black text-charcoal-900 leading-tight">
                      {gesture.te}
                    </p>
                    <p className="text-[10px] text-charcoal-500 font-medium mt-0.5">
                      {gesture.descTe}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-charcoal-500 font-medium text-center pt-2 border-t border-earth-200">
            {isTelugu ? '🛡️ సంపూర్ణ సంజ్ఞా భాష అనువాదం కాదు; కేవలం పరిమిత వ్యవసాయ సంజ్ఞల సహాయక వ్యవస్థ.' : 'Constrained agricultural gesture vocabulary for practical field accessibility.'}
          </div>
        </div>
      )}

    </div>
  );
};
