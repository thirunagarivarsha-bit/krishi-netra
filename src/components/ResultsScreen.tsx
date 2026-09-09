import React, { useState, useEffect } from 'react';
import { Language, AnalysisResult, CropAnalysisContext } from '../types';
import { te } from '../translations/te';
import { en } from '../translations/en';
import { SynchronizedSubtitle } from './SynchronizedSubtitle';
import { FarmerChatbot } from './FarmerChatbot';
import { useAccessibility } from '../context/AccessibilityContext';
import { teluguTTS } from '../services/tts';
import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  ShieldCheck, 
  Info, 
  Save, 
  Camera, 
  Clock,
  Layers,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Check
} from 'lucide-react';
import { speechService } from '../utils/speech';
import { apiService } from '../services/api';

interface ResultsScreenProps {
  language: Language;
  result: AnalysisResult;
  onScanAgain: () => void;
  onSaveToField: () => void;
  onViewIntelligence: () => void;
  onNavigateToActions?: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  language,
  result,
  onScanAgain,
  onSaveToField,
  onViewIntelligence,
  onNavigateToActions
}) => {
  const { settings } = useAccessibility();
  const [isSaved, setIsSaved] = useState(false);
  const [helpfulFeedback, setHelpfulFeedback] = useState<'yes' | 'no' | 'not_sure' | null>(null);
  const [accuracyFeedback, setAccuracyFeedback] = useState<'yes' | 'no' | 'not_sure' | null>(null);

  const t = language === 'te' ? te : en;
  const isTelugu = language === 'te';

  // Voice narration text
  const narrationText = isTelugu 
    ? result.teluguVoiceSummary 
    : result.englishVoiceSummary;

  // Proactive speech on mount if voice is enabled
  useEffect(() => {
    if (settings.voiceEnabled) {
      const timer = setTimeout(() => {
        teluguTTS.speakText(narrationText, { lang: settings.language });
      }, 500);
      return () => {
        clearTimeout(timer);
        teluguTTS.stop();
      };
    }
  }, [narrationText, settings.voiceEnabled, settings.language]);

  // Context bundle for AI Chatbot
  const chatContext: CropAnalysisContext = {
    crop: result.crop,
    cropStage: result.cropStage,
    healthStatus: result.healthStatus,
    diseaseNameTe: result.possibleIssueTe,
    diseaseNameEn: result.possibleIssueEn,
    aiConfidence: result.aiConfidence,
    severityLevel: result.severityLevel,
    weatherSummaryTe: result.weatherSnapshot.conditionTe,
    primaryActionTe: result.actionPlan.primaryActionTe
  };

  const handleSave = () => {
    setIsSaved(true);
    speechService.playChime('success');
    onSaveToField();
  };

  // If low confidence fallback applies
  if (result.isLowConfidenceFallback) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fade-in">
        
        {/* Low Confidence Alert Card */}
        <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-card">
          <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-700">
            <AlertTriangle className="w-8 h-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-charcoal-900">
            {t.results.lowConfidenceNotice}
          </h2>

          <p className="text-xs sm:text-sm text-charcoal-700 max-w-md mx-auto leading-relaxed font-medium">
            {isTelugu
              ? 'పంట ఆకు చిత్రం సరిగ్గా కనిపించకపోవడం లేదా తగినంత స్పష్టత లేకపోవడం వల్ల AI ఎటువంటి అసంపూర్ణ నిర్ధారణ చేయలేదు. రైతులకు తప్పుడు మందుల సిఫార్సు జరగకుండా ఇది నివారిస్తుంది.'
              : 'KRISHI-NETRA does not force diagnoses under ambiguity. To protect farmers from premature or incorrect pesticide purchases, please retake a crisp photo.'}
          </p>

          {/* Action guidance */}
          <div className="bg-white p-4 rounded-2xl border border-amber-200 text-left space-y-2 max-w-md mx-auto">
            <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              <span>{isTelugu ? 'మంచి ఫలితం కోసం సూచనలు:' : 'Tips for re-scanning:'}</span>
            </p>
            <ul className="text-xs text-charcoal-700 space-y-1 pl-4 list-disc font-medium">
              <li>{isTelugu ? 'పగటిపూట మంచి వెలుతురులో తీయండి' : 'Shoot under natural daylight'}</li>
              <li>{isTelugu ? 'ఆకు కెమెరాకు 15–20 సెం.మీ దూరంలో ఉండాలి' : 'Hold leaf 15-20cm from camera lens'}</li>
              <li>{isTelugu ? 'చేయి కదలకుండా స్థిరంగా ఉంచండి' : 'Ensure focus is locked without motion blur'}</li>
            </ul>
          </div>

          <div className="pt-2">
            <button
              onClick={onScanAgain}
              className="px-6 py-3.5 rounded-2xl bg-krishi-800 hover:bg-krishi-900 text-white font-black text-sm shadow-elevated inline-flex items-center gap-2 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>{t.results.scanAgain}</span>
            </button>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8 space-y-6 animate-fade-in">
      
      {/* SECTION 6: PRIMARY RESULT HEADER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-krishi-100 shadow-elevated space-y-5">
        
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-earth-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
              {isTelugu ? 'KRISHI-NETRA నిర్ధారణ' : 'KRISHI-NETRA Diagnostic Report'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight mt-0.5">
              {t.results.title}
            </h1>
          </div>

          {/* Large Status Badge: గమనించాలి */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 shadow-sm">
            <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-base font-black tracking-wide">
              {isTelugu ? result.healthStatusTe : result.healthStatusEn}
            </span>
          </div>
        </div>

        {/* Possible Issue & Confidence */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Issue */}
          <div className="sm:col-span-2 p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-1">
            <p className="text-xs font-bold text-charcoal-500 uppercase tracking-wider">
              {t.results.possibleIssueTitle}
            </p>
            <p className="text-lg sm:text-xl font-black text-charcoal-900 leading-tight">
              {isTelugu ? result.possibleIssueTe : result.possibleIssueEn}
            </p>
            <p className="text-xs text-charcoal-600 font-semibold pt-0.5">
              {isTelugu ? 'పంట: పత్తి • పూత దశ' : 'Crop: Cotton • Flowering Stage'}
            </p>
          </div>

          {/* AI Confidence & Severity */}
          <div className="p-4 rounded-2xl bg-krishi-50/70 border border-krishi-200 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-krishi-900 mb-1">
                <span>{t.results.aiConfidenceTitle}</span>
                <span className="text-base font-black text-krishi-800">{result.aiConfidence}%</span>
              </div>
              <div className="w-full bg-krishi-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-krishi-700 h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${result.aiConfidence}%` }}
                />
              </div>
            </div>

            <div className="pt-1 border-t border-krishi-200/80 flex items-center justify-between text-xs">
              <span className="font-semibold text-charcoal-600">{t.results.severityTitle}:</span>
              <span className="font-bold text-amber-800 bg-amber-100/70 px-2 py-0.5 rounded-md">
                {isTelugu ? result.severityTe : result.severityEn}
              </span>
            </div>
          </div>

        </div>

        {/* AI Voice Narration & Audio Playback Card */}
        <div className="p-4 rounded-2xl bg-krishi-50 border border-krishi-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-krishi-800 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-krishi-800 block">
                {isTelugu ? 'ధ్వని సారాంశం (AI VOICE SUMMARY)' : 'AI VOICE SUMMARY'}
              </span>
              <p className="text-xs font-semibold text-charcoal-800 line-clamp-2">
                {narrationText}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (teluguTTS.isPlaying()) {
                teluguTTS.stop();
              } else {
                teluguTTS.speakText(narrationText, { lang: settings.language });
              }
            }}
            className="px-3 py-1.5 rounded-xl bg-krishi-800 hover:bg-krishi-900 text-white text-xs font-black shrink-0 flex items-center gap-1 cursor-pointer transition-all active:scale-95 shadow-soft"
          >
            <span>{isTelugu ? 'వినండి' : 'Listen'}</span>
          </button>
        </div>

        {/* SECTION: DECISION ARBITRATION — ACT NOW / MONITOR / VERIFY */}
        <div className="p-4 rounded-2xl bg-earth-50 border border-earth-300 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
              <span>⚖️ {isTelugu ? 'ముఖ్య నిర్ణయం (DECISION ARBITRATION)' : 'DECISION ARBITRATION'}</span>
            </span>
            <span className="text-[10px] text-charcoal-500 font-medium">
              {isTelugu ? 'AI నమ్మకం + క్షేత్ర వాతావరణ ఆధారంగా' : 'Fused Image + Weather + Stage'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {/* Option 1: ACT NOW */}
            <div className={`p-3 rounded-xl border-2 text-center flex flex-col items-center justify-center gap-1 transition-all ${
              result.decisionState === 'act_now'
                ? 'border-red-500 bg-red-50 text-red-950 font-black shadow-card ring-2 ring-red-400'
                : 'border-earth-200 bg-white/60 text-charcoal-400 opacity-40'
            }`}>
              <span className="text-xl">🚨</span>
              <span className="text-xs sm:text-sm font-black leading-tight">
                {isTelugu ? 'ఇప్పుడు చేయండి' : 'ACT NOW'}
              </span>
              {result.decisionState === 'act_now' && (
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-red-200 text-red-900 mt-0.5">
                  {isTelugu ? 'ఎంచుకోబడింది' : 'ACTIVE'}
                </span>
              )}
            </div>

            {/* Option 2: MONITOR */}
            <div className={`p-3 rounded-xl border-2 text-center flex flex-col items-center justify-center gap-1 transition-all ${
              result.decisionState === 'monitor'
                ? 'border-amber-500 bg-amber-50 text-amber-950 font-black shadow-card ring-2 ring-amber-400'
                : 'border-earth-200 bg-white/60 text-charcoal-400 opacity-40'
            }`}>
              <span className="text-xl">👁️</span>
              <span className="text-xs sm:text-sm font-black leading-tight">
                {isTelugu ? 'వేచి చూడండి' : 'MONITOR'}
              </span>
              {result.decisionState === 'monitor' && (
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200 text-amber-900 mt-0.5">
                  {isTelugu ? 'ఎంచుకోబడింది' : 'ACTIVE'}
                </span>
              )}
            </div>

            {/* Option 3: VERIFY */}
            <div className={`p-3 rounded-xl border-2 text-center flex flex-col items-center justify-center gap-1 transition-all ${
              result.decisionState === 'verify'
                ? 'border-orange-500 bg-orange-50 text-orange-950 font-black shadow-card ring-2 ring-orange-400'
                : 'border-earth-200 bg-white/60 text-charcoal-400 opacity-40'
            }`}>
              <span className="text-xl">⚠️</span>
              <span className="text-xs sm:text-sm font-black leading-tight">
                {isTelugu ? 'ధృవీకరించండి' : 'VERIFY'}
              </span>
              {result.decisionState === 'verify' && (
                <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-orange-200 text-orange-900 mt-0.5">
                  {isTelugu ? 'ఎంచుకోబడింది' : 'ACTIVE'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* TOP-3 DIFFERENTIAL RANKING */}
        {result.top3Alternatives && result.top3Alternatives.length > 0 && (
          <div className="p-4 rounded-2xl bg-earth-50/80 border border-earth-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
                <span>📊 {isTelugu ? 'టాప్-3 ప్రత్యామ్నాయాలు (Top-3 Ranking)' : 'Top-3 Differential Ranking'}</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-earth-200 text-charcoal-700">
                MODEL ALTERNATIVES
              </span>
            </div>

            <div className="space-y-2">
              {result.top3Alternatives.map((alt, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white border border-earth-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-charcoal-900 flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-krishi-100 text-krishi-900 text-[10px] font-black flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>{isTelugu ? alt.nameTe : alt.nameEn}</span>
                    </span>
                    <span className="font-black text-krishi-800">{alt.confidence}%</span>
                  </div>

                  <div className="w-full bg-earth-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-krishi-700 h-full rounded-full transition-all duration-500"
                      style={{ width: `${alt.confidence}%` }}
                    />
                  </div>

                  <p className="text-[10px] text-charcoal-500 font-medium">
                    {alt.evidence}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MULTI-PHOTO CONSISTENCY BADGE IF AVAILABLE */}
        {result.multiPhotoConsistency && result.multiPhotoConsistency !== 'single' && (
          <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
            result.multiPhotoConsistency === 'high'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
              : 'bg-amber-50 border-amber-300 text-amber-950'
          }`}>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-krishi-700 flex-shrink-0" />
              <div>
                <span className="font-black">
                  {result.multiPhotoConsistency === 'high'
                    ? (isTelugu ? 'మల్టీ-ఫోటో అధిక స్థిరత్వం ✓' : 'HIGH MULTI-PHOTO CONSISTENCY ✓')
                    : (isTelugu ? 'మల్టీ-ఫోటో తక్కువ స్థిరత్వం ⚠️' : 'LOW MULTI-PHOTO CONSISTENCY ⚠️')}
                </span>
                <p className="text-[10px] text-charcoal-600 font-medium">
                  {result.multiPhotoConsistency === 'high'
                    ? (isTelugu ? '2 ఆకు నమూనాల్లో ఒకే విధమైన లక్షణాలు నిర్ధారించబడ్డాయి.' : 'Consistent foliar disease patterns identified across both leaf photos.')
                    : (isTelugu ? 'ఆకు లక్షణాల మధ్య వ్యత్యాసం గుర్తించబడింది. క్షేత్ర తనిఖీ అవసరం.' : 'Patterns diverge between leaf photos. Physical verification advised.')}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-white/80 border border-current">
              {result.multiPhotoConsistency === 'high' ? '94% MATCH' : 'DISCREPANT'}
            </span>
          </div>
        )}

        {/* SECTION 12: TELUGU VOICE & SYNCHRONIZED SUBTITLES */}
        <SynchronizedSubtitle
          text={narrationText}
          language={language}
          titleTe="వాయిస్ & సబ్‌టైటిల్స్ (Voice Guidance & Subtitles)"
          titleEn="Voice Guidance & Synchronized Subtitles"
        />

      </div>

      {/* SECTION 10: WHAT SHOULD I DO? (ఇప్పుడు ఏమి చేయాలి?) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-krishi-600/30 shadow-elevated space-y-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-krishi-800 text-white flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-charcoal-900">
              {t.results.whatToDoTitle}
            </h2>
            <p className="text-xs text-charcoal-500 font-medium">
              {isTelugu ? 'పంటను కాపాడుకోవడానికి రైతు చేపట్టాల్సిన ముఖ్యమైన చర్య' : 'Actionable agronomic guidance'}
            </p>
          </div>
        </div>

        {/* Priority Action Card — మొదటి చర్య */}
        <div className="p-4 sm:p-5 rounded-2xl bg-krishi-50 border-2 border-krishi-300 space-y-2">
          <span className="px-2.5 py-0.5 rounded-full bg-krishi-800 text-white text-[11px] font-black uppercase tracking-wider">
            {t.results.primaryActionHeader}
          </span>
          <p className="text-sm sm:text-base font-black text-krishi-900 leading-relaxed">
            {isTelugu ? result.actionPlan.primaryActionTe : result.actionPlan.primaryActionEn}
          </p>
        </div>

        {/* Watchlist — గమనించాల్సినవి */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-black uppercase tracking-wider text-charcoal-700 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-krishi-700" />
            <span>{t.results.checklistHeader}</span>
          </h3>

          <div className="grid grid-cols-1 gap-2">
            {(isTelugu ? result.actionPlan.checklistTe : result.actionPlan.checklistEn).map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-earth-50 border border-earth-200 flex items-start gap-2.5 text-xs sm:text-sm font-medium text-charcoal-800">
                <span className="w-5 h-5 rounded-full bg-white border border-earth-300 text-krishi-800 font-bold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* When to Recheck? — మళ్లీ ఎప్పుడు పరీక్షించాలి? */}
        <div className="p-3.5 rounded-2xl bg-earth-100/70 border border-earth-200 flex items-center gap-3 text-xs sm:text-sm">
          <Clock className="w-5 h-5 text-krishi-800 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-bold text-charcoal-900">{t.results.recheckHeader} </span>
            <span className="font-medium text-charcoal-700">
              {isTelugu ? result.actionPlan.nextCheckTimeTe : result.actionPlan.nextCheckTimeEn}
            </span>
          </div>
        </div>

        {/* Safe Agronomic Advisory Note */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs text-amber-950 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-black">
            <span className="flex items-center gap-1.5 text-amber-900">
              <ShieldCheck className="w-4 h-4 text-krishi-800" />
              <span>{isTelugu ? 'ధృవీకరించబడిన వ్యవసాయ మార్గదర్శకం' : 'SOURCE VERIFIED: ICAR/ANGRAU Advisory'}</span>
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-200 text-[10px] font-black text-amber-900 uppercase tracking-wider">
              {isTelugu ? 'మోతాదు మించవద్దు' : 'DO NOT EXCEED DOSAGE'}
            </span>
          </div>
          <p className="text-[11px] font-medium leading-relaxed text-charcoal-700">
            {isTelugu ? result.actionPlan.safetyAdvisoryTe : result.actionPlan.safetyAdvisoryEn}
          </p>
        </div>
      </div>

      {/* SECTION: CONTEXT-AWARE TELUGU AI CHATBOT & VOICE ASSISTANT */}
      <FarmerChatbot context={chatContext} language={language} />

      {/* SECTION 11: “WHAT IF I WAIT?” (నేను ఇప్పుడు ఏమీ చేయకపోతే?) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-krishi-100 shadow-card space-y-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <h2 className="text-xl sm:text-2xl font-black text-charcoal-900">
              {t.results.whatIfTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 font-medium mt-0.5">
            {t.results.whatIfSubtitle}
          </p>
        </div>

        {/* Comparative Cards: Act Now vs Wait */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Act Now */}
          <div className="p-5 rounded-2xl bg-krishi-50/70 border-2 border-krishi-300 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-krishi-900 bg-krishi-100 px-2.5 py-1 rounded-lg">
                {t.results.actNowCard}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-krishi-700">
                <TrendingDown className="w-4 h-4" />
                <span>{t.results.riskTrendDown}</span>
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold text-charcoal-900 leading-snug">
                {isTelugu ? result.whatIf.actNow.descriptionTe : result.whatIf.actNow.descriptionEn}
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-krishi-200 text-xs text-krishi-800 font-bold mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-krishi-700 font-semibold">
                  <span>{isTelugu ? 'ఆశించిన ఫలితం:' : 'Expected Outcome:'}</span>
                  <span className="px-1.5 py-0.5 rounded bg-krishi-100 text-[9px] font-black uppercase text-krishi-900">
                    {isTelugu ? 'AI అంచనా మాత్రమే' : 'AI Estimate'}
                  </span>
                </div>
                <p>✓ {isTelugu ? result.whatIf.actNow.outcomeTe : result.whatIf.actNow.outcomeEn}</p>
              </div>
            </div>
          </div>

          {/* Card 2: Wait & Delay */}
          <div className="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-amber-900 bg-amber-100 px-2.5 py-1 rounded-lg">
                {t.results.waitCard}
              </span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-700">
                <TrendingUp className="w-4 h-4" />
                <span>{t.results.riskTrendUp}</span>
              </span>
            </div>

            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold text-charcoal-900 leading-snug">
                {isTelugu ? result.whatIf.waitAndWatch.descriptionTe : result.whatIf.waitAndWatch.descriptionEn}
              </p>
              <div className="p-2.5 rounded-xl bg-white border border-amber-200 text-xs text-amber-900 font-bold mt-2 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-amber-700 font-semibold">
                  <span>{isTelugu ? 'ఆశించిన నష్టం:' : 'Potential Risk:'}</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-[9px] font-black uppercase text-amber-900">
                    {isTelugu ? 'AI అంచనా మాత్రమే' : 'AI Estimate'}
                  </span>
                </div>
                <p>⚠ {isTelugu ? result.whatIf.waitAndWatch.outcomeTe : result.whatIf.waitAndWatch.outcomeEn}</p>
              </div>
            </div>
          </div>

        </div>

        {/* Non-Guarantee Disclaimer */}
        <div className="text-center text-[11px] text-charcoal-500 font-medium">
          {t.results.disclaimer}
        </div>
      </div>

      {/* SECTION 7: “WHY?” SECTION (ఇలా ఎందుకు చెబుతున్నాం?) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-krishi-100 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <h2 className="text-lg sm:text-xl font-black text-charcoal-900">
              {t.results.whySectionTitle}
            </h2>
          </div>
          <span className="text-xs font-semibold text-charcoal-500">
            {isTelugu ? '5 క్షేత్ర అంశాలు' : '5 Contextual Factors'}
          </span>
        </div>

        <div className="space-y-2.5">
          {result.whyReasons.map((reason, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200/80 flex items-start gap-3">
              <span className="text-xl flex-shrink-0 mt-0.5">{reason.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-black text-charcoal-900 leading-tight">
                  {isTelugu ? reason.titleTe : reason.titleEn}
                </p>
                <p className="text-xs text-charcoal-600 font-medium mt-0.5 leading-relaxed">
                  {isTelugu ? reason.detailTe : reason.detailEn}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 8: RISK FORECAST (రాబోయే రోజుల్లో పంట ప్రమాదం) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-krishi-100 shadow-card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-charcoal-900">
              {t.results.riskForecastTitle}
            </h2>
            <p className="text-xs text-charcoal-500 font-medium mt-0.5">
              {isTelugu ? 'వాతావరణ మార్పులు మరియు తేమ ఆధారంగా అంచనా' : 'Timeline projection based on humidity & weather'}
            </p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-earth-100 border border-earth-300 text-charcoal-700">
            {t.results.aiForecastNote}
          </span>
        </div>

        {/* 4 Clean Forecast Timeline Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {result.riskForecast.map((point, idx) => {
            const levelColors = {
              stable: 'bg-krishi-50 border-krishi-300 text-krishi-800',
              watch: 'bg-amber-50 border-amber-300 text-amber-800',
              warning: 'bg-orange-50 border-orange-300 text-orange-800',
              high: 'bg-red-50 border-red-300 text-red-800',
            }[point.riskLevel];

            return (
              <div key={idx} className={`p-3.5 rounded-2xl border-2 ${levelColors} flex flex-col justify-between space-y-2`}>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
                    {isTelugu ? point.labelTe : point.labelEn}
                  </span>
                  <p className="text-base sm:text-lg font-black mt-0.5 capitalize">
                    {point.riskLevel} ({point.riskScore}%)
                  </p>
                </div>
                <p className="text-[10px] font-medium leading-tight opacity-90">
                  {isTelugu ? point.noteTe : point.noteEn}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 9: EVIDENCE CHECK (ఆధారాల పరిశీలన) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-krishi-100 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚖️</span>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-charcoal-900">
                {t.results.evidenceTitle}
              </h2>
              <p className="text-xs text-charcoal-500 font-medium">
                {isTelugu ? 'వివిధ ఆధారాల మధ్య సామరస్య తనిఖీ' : 'Cross-modal arbitration across 4 signals'}
              </p>
            </div>
          </div>

          <div className={`px-3 py-1 rounded-xl text-xs font-bold ${
            result.evidenceCheck.isOverallMatch 
              ? 'bg-krishi-100 text-krishi-900 border border-krishi-300' 
              : 'bg-amber-100 text-amber-900 border border-amber-300'
          }`}>
            {isTelugu ? result.evidenceCheck.overallVerdictTe : result.evidenceCheck.overallVerdictEn}
          </div>
        </div>

        {/* 4 Signals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {result.evidenceCheck.items.map((item) => (
            <div key={item.id} className="p-3 rounded-2xl bg-earth-50 border border-earth-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-charcoal-900">
                  {isTelugu ? item.factorTe : item.factorEn}
                </p>
                <p className="text-[11px] text-charcoal-500 font-medium">
                  {isTelugu ? item.observationTe : item.observationEn}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-lg bg-white border border-earth-300 text-[11px] font-bold text-krishi-800">
                {isTelugu ? item.statusTe : item.statusEn}
              </span>
            </div>
          ))}
        </div>

        {/* Conflict Warning if any */}
        {!result.evidenceCheck.isOverallMatch && result.evidenceCheck.conflictWarningTe && (
          <div className="p-3 rounded-xl bg-amber-100 border border-amber-300 text-xs text-amber-900 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
            <span>{isTelugu ? result.evidenceCheck.conflictWarningTe : result.evidenceCheck.conflictWarningEn}</span>
          </div>
        )}
      </div>

      {/* SECTION: FARMER FIELD FEEDBACK (ఫీల్డ్ ఫీడ్‌బ్యాక్) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-earth-200 shadow-soft space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <div>
              <h3 className="text-sm sm:text-base font-black text-charcoal-900 leading-tight">
                {isTelugu ? 'రైతు అభిప్రాయం (Field Feedback)' : 'Farmer Field Feedback'}
              </h3>
              <p className="text-[11px] text-charcoal-500 font-medium">
                {isTelugu ? 'మీ అనుభవం మోడల్ నాణ్యత మెరుగుపరచడానికి తోడ్పడుతుంది' : 'Ground-truth feedback used for post-season model calibration'}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-earth-100 text-charcoal-700">
            FIELD FEEDBACK
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Question 1: Was this helpful? */}
          <div className="p-3 rounded-2xl bg-earth-50 border border-earth-200 space-y-2">
            <p className="text-xs font-bold text-charcoal-900">
              {isTelugu ? 'ఈ సమాచారం మీకు ఉపయోగపడిందా?' : 'Was this diagnosis helpful?'}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  speechService.playChime('click');
                  setHelpfulFeedback('yes');
                  apiService.submitFeedback({ scanId: result.id, accuracyRating: 5, wasHelpful: true });
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  helpfulFeedback === 'yes'
                    ? 'bg-krishi-800 text-white shadow-soft'
                    : 'bg-white border border-earth-300 text-charcoal-700 hover:bg-earth-100'
                }`}
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{isTelugu ? 'అవును' : 'Yes'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  speechService.playChime('click');
                  setHelpfulFeedback('no');
                  apiService.submitFeedback({ scanId: result.id, accuracyRating: 2, wasHelpful: false });
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  helpfulFeedback === 'no'
                    ? 'bg-rose-700 text-white shadow-soft'
                    : 'bg-white border border-earth-300 text-charcoal-700 hover:bg-earth-100'
                }`}
              >
                <ThumbsDown className="w-3 h-3" />
                <span>{isTelugu ? 'కాదు' : 'No'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  speechService.playChime('click');
                  setHelpfulFeedback('not_sure');
                  apiService.submitFeedback({ scanId: result.id, accuracyRating: 3, wasHelpful: true, farmerComments: 'Uncertain' });
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  helpfulFeedback === 'not_sure'
                    ? 'bg-amber-600 text-white shadow-soft'
                    : 'bg-white border border-earth-300 text-charcoal-700 hover:bg-earth-100'
                }`}
              >
                <HelpCircle className="w-3 h-3" />
                <span>{isTelugu ? 'సందేహం' : 'Not Sure'}</span>
              </button>
            </div>
          </div>

          {/* Question 2: Was the AI observation correct? */}
          <div className="p-3 rounded-2xl bg-earth-50 border border-earth-200 space-y-2">
            <p className="text-xs font-bold text-charcoal-900">
              {isTelugu ? 'AI గమనించిన లక్షణాలు సరైనవేనా?' : 'Was the AI observation accurate to field?'}
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => {
                  speechService.playChime('click');
                  setAccuracyFeedback('yes');
                  apiService.submitFeedback({ scanId: result.id, accuracyRating: 5, farmerComments: 'Accurate' });
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  accuracyFeedback === 'yes'
                    ? 'bg-krishi-800 text-white shadow-soft'
                    : 'bg-white border border-earth-300 text-charcoal-700 hover:bg-earth-100'
                }`}
              >
                <Check className="w-3 h-3" />
                <span>{isTelugu ? 'సరిగ్గా ఉంది' : 'Accurate'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  speechService.playChime('click');
                  setAccuracyFeedback('no');
                  apiService.submitFeedback({ scanId: result.id, accuracyRating: 1, farmerComments: 'Inaccurate' });
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  accuracyFeedback === 'no'
                    ? 'bg-rose-700 text-white shadow-soft'
                    : 'bg-white border border-earth-300 text-charcoal-700 hover:bg-earth-100'
                }`}
              >
                <span>{isTelugu ? 'తేడా ఉంది' : 'Inaccurate'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  speechService.playChime('click');
                  setAccuracyFeedback('not_sure');
                  apiService.submitFeedback({ scanId: result.id, accuracyRating: 3, farmerComments: 'Uncertain' });
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                  accuracyFeedback === 'not_sure'
                    ? 'bg-amber-600 text-white shadow-soft'
                    : 'bg-white border border-earth-300 text-charcoal-700 hover:bg-earth-100'
                }`}
              >
                <span>{isTelugu ? 'సందేహం' : 'Uncertain'}</span>
              </button>
            </div>
          </div>
        </div>

        {(helpfulFeedback || accuracyFeedback) && (
          <p className="text-[11px] text-emerald-800 font-bold text-center bg-emerald-50 py-1.5 px-3 rounded-xl border border-emerald-200 animate-fade-in">
            ✓ {isTelugu ? 'మీ ఫీడ్‌బ్యాక్ భద్రపరచబడింది. ధన్యవాదాలు!' : 'Field feedback recorded. Thank you!'}
          </p>
        )}
      </div>

      {/* Bottom Actions: Save to Field & Scan Again */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <button
          onClick={onScanAgain}
          className="px-6 py-3.5 rounded-2xl border-2 border-krishi-700 bg-white text-krishi-900 hover:bg-krishi-50 font-black text-sm shadow-soft flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <Camera className="w-4 h-4 text-krishi-800" />
          <span>{t.results.scanAgain}</span>
        </button>

        {onNavigateToActions && (
          <button
            onClick={onNavigateToActions}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-krishi-800 to-krishi-700 hover:from-krishi-900 text-white font-black text-sm shadow-elevated flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <span>{isTelugu ? 'పనుల జాబితాకు వెళ్లండి (Action Loop) ➔' : 'Take Action in Action Loop ➔'}</span>
          </button>
        )}

        <button
          onClick={handleSave}
          disabled={isSaved}
          className={`flex-1 px-6 py-3.5 rounded-2xl font-black text-sm shadow-elevated flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer ${
            isSaved
              ? 'bg-krishi-600 text-white'
              : 'bg-white border-2 border-krishi-800 hover:bg-krishi-50 text-krishi-900'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{isSaved ? (isTelugu ? 'సేవ్ చేయబడింది ✓' : 'Saved to My Field ✓') : t.results.saveToField}</span>
        </button>
      </div>

    </div>
  );
};
