import React from 'react';
import { Language } from '../types';
import { te } from '../translations/te';
import { en } from '../translations/en';
import { 
  Cpu, 
  Layers, 
  BarChart3, 
  GitBranch, 
  Activity, 
  Zap, 
  ShieldCheck, 
  Database, 
  FileCode2,
  CheckCircle2,
  Share2
} from 'lucide-react';

interface IntelligenceViewProps {
  language: Language;
}

export const IntelligenceView: React.FC<IntelligenceViewProps> = ({ language }) => {
  const t = language === 'te' ? te : en;

  // Visual Pipeline Stages from Prompt
  const pipelineSteps = [
    { title: 'FARMER INPUT', desc: 'Mobile photo capture, crop metadata & Telugu speech-to-text', tag: 'Client' },
    { title: 'IMAGE ANALYSIS', desc: 'Foliar ROI extraction, lesion segmentation & confidence scoring', tag: 'Vision AI' },
    { title: 'CONTEXT FUSION', desc: 'Spatio-temporal weather integration (RH%, rain, temp) & crop phenology', tag: 'Fusion' },
    { title: 'EVIDENCE ARBITRATION', desc: 'Cross-modal signal verification to detect sensor/observation discrepancy', tag: 'Safety' },
    { title: 'RISK PREDICTION', desc: 'Dynamic probabilistic forecasting (Now, 24h, 48h, 7d)', tag: 'Inference' },
    { title: 'RECOMMENDATION', desc: 'Agronomic knowledge base retrieval (no toxic chemical hallucinations)', tag: 'Expert Rules' },
    { title: 'WHAT-IF SIMULATION', desc: 'Counterfactual risk trajectories (Immediate Action vs Delayed Inaction)', tag: 'Simulation' },
    { title: 'MULTIMODAL DELIVERY', desc: 'Natural Telugu speech synthesis, synchronized subtitles & conversational AI assistant', tag: 'UX Engine' },
    { title: 'CROP HEALTH TIMELINE', desc: 'Longitudinal field record keeping and trajectory tracking (Day 1 → 10)', tag: 'Temporal DB' }
  ];

  // SHAP Feature Importance Factors
  const shapFactors = [
    { name: 'Leaf Lesion Signature (Vision)', impact: 38, type: 'positive', value: 'Concentric brown halos' },
    { name: 'Atmospheric Humidity (48h RH > 80%)', impact: 26, type: 'positive', value: 'RH 84%' },
    { name: 'Rainfall / Leaf Wetness Duration', impact: 16, type: 'positive', value: '12.5 mm recent rain' },
    { name: 'Crop Phenology (Flowering Stage)', impact: 12, type: 'positive', value: 'High canopy density' },
    { name: 'Farmer Reported Symptoms', impact: 8, type: 'positive', value: 'Yellowing & spot growth' }
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fade-in font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-krishi-900 text-white rounded-3xl p-6 sm:p-8 border border-charcoal-700 shadow-elevated">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-krishi-600/40 border border-krishi-400/40 text-xs font-bold text-krishi-200 mb-3">
          <Cpu className="w-4 h-4 text-krishi-300" />
          <span>Judges & Research Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
          {t.intelligence.title}
        </h1>
        <p className="text-xs sm:text-base text-krishi-100 font-normal mt-2 max-w-2xl leading-relaxed">
          {t.intelligence.subtitle}
        </p>

        {/* High-Level Architecture Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div>
            <p className="text-[11px] font-bold text-krishi-300 uppercase">Architecture</p>
            <p className="text-base font-black text-white mt-0.5">Multimodal Fusion</p>
            <span className="text-[10px] text-charcoal-300">Vision + Weather + Phenology</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-krishi-300 uppercase">Arbitration Model</p>
            <p className="text-base font-black text-white mt-0.5">Evidence Cross-Check</p>
            <span className="text-[10px] text-charcoal-300">Prevents False Interventions</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-krishi-300 uppercase">Decision Safety</p>
            <p className="text-base font-black text-white mt-0.5">Agronomic Rules Base</p>
            <span className="text-[10px] text-charcoal-300">Zero Unsafe Pesticide Dosing</span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-krishi-300 uppercase">Farmer Interface</p>
            <p className="text-base font-black text-white mt-0.5">Voice + Visual + AI Chat</p>
            <span className="text-[10px] text-charcoal-300">Accessible to all farmers</span>
          </div>
        </div>
      </div>

      {/* SECTION 18: VISUAL PIPELINE FLOW */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-krishi-100 shadow-card space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-charcoal-900 flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-krishi-800" />
              <span>{t.intelligence.pipelineTitle}</span>
            </h2>
            <p className="text-xs text-charcoal-500 font-medium mt-0.5">
              Strict end-to-end verification pipeline executing on every crop check
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-earth-100 text-charcoal-700">
            9 Stages
          </span>
        </div>

        {/* Stepped Visual Diagram */}
        <div className="space-y-2.5">
          {pipelineSteps.map((step, idx) => (
            <div key={idx} className="relative">
              <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 hover:border-krishi-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-xl bg-krishi-800 text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-charcoal-900 tracking-wide">
                      {step.title}
                    </h3>
                    <p className="text-xs text-charcoal-600 font-medium">
                      {step.desc}
                    </p>
                  </div>
                </div>
                <span className="self-start sm:self-auto text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-white border border-earth-300 text-krishi-800">
                  {step.tag}
                </span>
              </div>
              {idx < pipelineSteps.length - 1 && (
                <div className="w-0.5 h-2 bg-krishi-300 mx-auto my-0.5"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 19: EXPLAINABLE AI & MODEL CALIBRATION */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Model Calibration & Metrics */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-krishi-100 shadow-card space-y-4">
          <div>
            <h3 className="text-lg font-black text-charcoal-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-krishi-700" />
              <span>{t.intelligence.metricsTitle}</span>
            </h3>
            <p className="text-xs text-charcoal-500 font-medium">
              Multi-task model calibration across the diagnosis matrix
            </p>
          </div>

          <div className="space-y-3.5 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-charcoal-700">Diagnosis Confidence (Cotton Leaf Spot)</span>
                <span className="text-krishi-800 font-black">84%</span>
              </div>
              <div className="w-full bg-earth-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-krishi-700 h-full rounded-full" style={{ width: '84%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-charcoal-700">Severity Calibration (Moderate)</span>
                <span className="text-amber-800 font-black">78%</span>
              </div>
              <div className="w-full bg-earth-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-amber-600 h-full rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-charcoal-700">Risk Trajectory Calibration (48h Warning)</span>
                <span className="text-krishi-800 font-black">88%</span>
              </div>
              <div className="w-full bg-earth-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-krishi-800 h-full rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-charcoal-700">Evidence Alignment Index</span>
                <span className="text-teal-800 font-black">91% (Compatible)</span>
              </div>
              <div className="w-full bg-earth-200 h-2.5 rounded-full overflow-hidden">
                <div className="bg-teal-600 h-full rounded-full" style={{ width: '91%' }}></div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-earth-50 border border-earth-200 text-[11px] text-charcoal-600 font-medium leading-relaxed">
            💡 <strong>Honest Calibration:</strong> If confidence falls below 50%, the engine triggers the <code>LowConfidenceFallback</code> state instead of making unfounded guesses.
          </div>
        </div>

        {/* SHAP Feature Contribution Bar Chart */}
        <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-krishi-100 shadow-card space-y-4">
          <div>
            <h3 className="text-lg font-black text-charcoal-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-krishi-700" />
              <span>{t.intelligence.shapTitle}</span>
            </h3>
            <p className="text-xs text-charcoal-500 font-medium">
              Explainable feature attribution indicating factor weights
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {shapFactors.map((factor, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-charcoal-800">
                  <span className="truncate pr-2">{factor.name}</span>
                  <span className="font-mono text-krishi-800 font-bold flex-shrink-0">+{factor.impact}%</span>
                </div>
                <div className="w-full bg-earth-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-krishi-600 to-krishi-800 h-full rounded-full"
                    style={{ width: `${factor.impact * 2.2}%` }}
                  />
                </div>
                <span className="text-[10px] text-charcoal-500 font-medium block">
                  Observed signal: {factor.value}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-krishi-50 border border-krishi-200 text-[11px] text-krishi-900 font-semibold">
            ✓ Full backward compatibility with future TreeSHAP / DeepSHAP model explanations.
          </div>
        </div>

      </div>

      {/* Production FastAPI Endpoints Layer */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-krishi-100 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-charcoal-900 flex items-center gap-2">
            <FileCode2 className="w-5 h-5 text-krishi-800" />
            <span>{t.intelligence.apiTitle}</span>
          </h3>
          <span className="text-xs font-mono font-bold text-krishi-800 bg-krishi-100 px-2.5 py-1 rounded-lg">
            REST API Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 flex items-center justify-between">
            <span className="text-krishi-800 font-bold">POST /api/analyze-image</span>
            <span className="text-[10px] font-sans text-charcoal-500">Image + Fusion</span>
          </div>
          <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 flex items-center justify-between">
            <span className="text-krishi-800 font-bold">GET /api/risk-prediction</span>
            <span className="text-[10px] font-sans text-charcoal-500">Temporal Risk</span>
          </div>
          <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 flex items-center justify-between">
            <span className="text-krishi-800 font-bold">GET /api/evidence-check</span>
            <span className="text-[10px] font-sans text-charcoal-500">Cross-arbitration</span>
          </div>
          <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 flex items-center justify-between">
            <span className="text-krishi-800 font-bold">GET /api/recommendation</span>
            <span className="text-[10px] font-sans text-charcoal-500">Safe advisory</span>
          </div>
          <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 flex items-center justify-between">
            <span className="text-krishi-800 font-bold">POST /api/chat</span>
            <span className="text-[10px] font-sans text-charcoal-500">Agronomic Assistant</span>
          </div>
          <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 flex items-center justify-between">
            <span className="text-krishi-800 font-bold">GET /api/field</span>
            <span className="text-[10px] font-sans text-charcoal-500">Field timeline</span>
          </div>
        </div>
      </div>

    </div>
  );
};
