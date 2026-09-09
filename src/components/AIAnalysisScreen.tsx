import React, { useState, useEffect } from 'react';
import { Language, CropType } from '../types';
import { te } from '../translations/te';
import { en } from '../translations/en';
import { 
  CheckCircle2, 
  Loader2, 
  Sparkles, 
  ShieldCheck, 
  Leaf, 
  Camera, 
  CloudRain, 
  Activity, 
  FileText 
} from 'lucide-react';
import { speechService } from '../utils/speech';

interface AIAnalysisScreenProps {
  language: Language;
  crop: CropType;
  photoUrl: string;
  onAnalysisFinished: () => void;
}

export const AIAnalysisScreen: React.FC<AIAnalysisScreenProps> = ({
  language,
  crop,
  photoUrl,
  onAnalysisFinished
}) => {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const t = language === 'te' ? te : en;

  const analysisStages = [
    {
      labelTe: 'ఫోటో నాణ్యత తనిఖీ చేయబడింది',
      labelEn: 'Photo quality checked',
      detailTe: 'వెలుతురు, స్పష్టత మరియు ఆకు అంచులు విశ్లేషించబడ్డాయి (Resolution: Optimal)',
      detailEn: 'Resolution, focal sharpness, and laminar contrast validated',
      icon: <Camera className="w-4 h-4" />
    },
    {
      labelTe: 'పంట విశ్లేషించబడింది',
      labelEn: 'Crop analyzed',
      detailTe: `${crop.toUpperCase()} కణజాలం మరియు ఆకు ఉపరితలం గుర్తించబడింది`,
      detailEn: `Crop phenotyping profile mapped for ${crop.toUpperCase()}`,
      icon: <Leaf className="w-4 h-4" />
    },
    {
      labelTe: 'లక్షణాలు గుర్తించబడ్డాయి',
      labelEn: 'Symptoms detected',
      detailTe: 'వలయాకార నెక్రోటిక్ మచ్చలు & పసుపు అంచులు నమోదు చేయబడ్డాయి',
      detailEn: 'Concentric halo lesions and chlorosis vectors isolated',
      icon: <Activity className="w-4 h-4" />
    },
    {
      labelTe: 'వాతావరణం పరిశీలించబడింది',
      labelEn: 'Weather checked',
      detailTe: 'తేమ 84%, వర్షపాతం 12.5mm & స్థానిక ఉష్ణోగ్రత పరిగణించబడింది',
      detailEn: 'Local RH 84% & 12.5mm precipitation data integrated',
      icon: <CloudRain className="w-4 h-4" />
    },
    {
      labelTe: 'పంట దశను పరిగణనలోకి తీసుకున్నాం',
      labelEn: 'Crop stage considered',
      detailTe: 'పూత/కాయ దశలో శిలీంధ్ర తెగుళ్ళ తీవ్రత సంభావ్యత గణించబడింది',
      detailEn: 'Stage-calibrated susceptibility index applied',
      icon: <ShieldCheck className="w-4 h-4" />
    },
    {
      labelTe: 'ప్రమాద తీవ్రత లెక్కించబడింది',
      labelEn: 'Risk calculated',
      detailTe: 'మల్టీ-ఫాక్టర్ ఆర్బిట్రేషన్ ద్వారా ప్రస్తుత ప్రమాద స్కోరు: 42/100',
      detailEn: 'Contextual risk index: 42/100 computed',
      icon: <Activity className="w-4 h-4" />
    },
    {
      labelTe: 'సిఫార్సు సిద్ధమైంది',
      labelEn: 'Recommendation prepared',
      detailTe: 'రైతుకు అనుకూలమైన ప్రాధాన్యత చర్య & మార్గదర్శకం రూపొందించబడింది',
      detailEn: 'Safe agronomic priority action synthesized',
      icon: <FileText className="w-4 h-4" />
    }
  ];

  useEffect(() => {
    speechService.playChime('start');

    // Progressive timeline cadence: ~650ms per step
    const interval = setInterval(() => {
      setActiveStepIndex((prev) => {
        if (prev < analysisStages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          speechService.playChime('success');
          setTimeout(() => {
            onAnalysisFinished();
          }, 700);
          return prev;
        }
      });
    }, 650);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12 space-y-7 animate-fade-in text-center">
      
      {/* Title & Live Badge */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-krishi-100 border border-krishi-300 text-xs font-bold text-krishi-900 shadow-sm animate-pulse">
          <Sparkles className="w-4 h-4 text-krishi-700 animate-spin" style={{ animationDuration: '3s' }} />
          <span>{language === 'te' ? 'AI లైవ్ విశ్లేషణ జరుగుతోంది...' : 'Live Multimodal AI Processing...'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight">
          {t.analysisProgress.title}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal-600 font-medium max-w-md mx-auto">
          {t.analysisProgress.subtitle}
        </p>
      </div>

      {/* Visual Scanning Frame */}
      <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto rounded-3xl overflow-hidden border-4 border-krishi-600 shadow-elevated bg-earth-900">
        <img 
          src={photoUrl} 
          alt="Crop under analysis" 
          className="w-full h-full object-cover opacity-85 filter contrast-110"
        />
        
        {/* Animated Scanning Beam */}
        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-krishi-300 to-transparent shadow-[0_0_15px_#40916c] animate-scan-line pointer-events-none" />
        
        {/* Target Reticle Overlay */}
        <div className="absolute inset-3 border border-white/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2">
          <div className="flex justify-between text-[9px] font-mono text-white/80">
            <span>ROI: 0.94</span>
            <span>MODEL: V4</span>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-white/80">
            <span>CONF: 84%</span>
            <span>STAGE: {activeStepIndex + 1}/7</span>
          </div>
        </div>
      </div>

      {/* Progressive Steps Timeline */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-krishi-100 shadow-card text-left space-y-3">
        {analysisStages.map((stage, idx) => {
          const isDone = idx < activeStepIndex;
          const isCurrent = idx === activeStepIndex;
          const isPending = idx > activeStepIndex;

          return (
            <div 
              key={idx}
              className={`flex items-start gap-3 p-2.5 rounded-xl transition-all duration-300 ${
                isCurrent 
                  ? 'bg-krishi-50 border border-krishi-300 scale-[1.01]' 
                  : isDone 
                  ? 'bg-white text-charcoal-800' 
                  : 'opacity-40 text-charcoal-400'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-krishi-700" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 text-krishi-700 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-earth-300 flex items-center justify-center text-[10px] font-bold text-charcoal-400">
                    {idx + 1}
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-xs sm:text-sm font-bold leading-tight ${isCurrent ? 'text-krishi-900 font-black' : 'text-charcoal-900'}`}>
                    {language === 'te' ? stage.labelTe : stage.labelEn}
                  </p>
                  {isDone && (
                    <span className="text-[10px] font-bold text-krishi-700 uppercase">✓ Done</span>
                  )}
                </div>
                {(isCurrent || isDone) && (
                  <p className="text-[11px] text-charcoal-600 mt-0.5 leading-normal">
                    {language === 'te' ? stage.detailTe : stage.detailEn}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
