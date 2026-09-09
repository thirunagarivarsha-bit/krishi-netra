import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { 
  Play, 
  Pause, 
  FastForward, 
  RotateCcw, 
  X, 
  Sparkles, 
  CheckCircle2 
} from 'lucide-react';
import { speechService } from '../utils/speech';

interface DemoControllerProps {
  language: Language;
  isActive: boolean;
  onClose: () => void;
  onExecuteDemoStep: (stepNumber: number) => void;
}

export const DemoController: React.FC<DemoControllerProps> = ({
  language,
  isActive,
  onClose,
  onExecuteDemoStep
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(true);

  const demoSteps = [
    { num: 1, title: 'Home: Today\'s Priority', desc: 'Farmer greeting, urgent action card & living crop vitality graphic' },
    { num: 2, title: 'Scan: Image Quality Check', desc: 'Pre-flight sharpness, lighting, centering, and foliar ROI verification' },
    { num: 3, title: 'Multimodal Analysis', desc: 'Real-time progressive fusion of vision, weather, and phenology' },
    { num: 4, title: 'Diagnosis: 78% AI Confidence', desc: 'Clear why-factors, severity calibration & synchronized Telugu voice' },
    { num: 5, title: 'Evidence Arbitration Matrix', desc: 'Cross-modal verification: ACT NOW / MONITOR / VERIFY safeguards' },
    { num: 6, title: 'What-If Simulation', desc: 'Immediate bio-fungicide treatment vs 48h unchecked risk escalation' },
    { num: 7, title: 'Action Loop & Spray Animation', desc: 'Interactive mist animation, dosage logbook & 48h follow-up scheduler' },
    { num: 8, title: 'Ask: Voice, Notes & Gesture Mode', desc: 'Telugu speech recognition, structured audio logger & sign gesture assistance' },
    { num: 9, title: 'My Field: Sensors, Vitality & Slider', desc: 'RGB ExG index, ESP8266 node telemetry & before/after recovery slider' },
    { num: 10, title: 'Judge Technical Lab & Feasibility', desc: 'ResNet18 benchmarks, Grad-CAM heatmap, domain shift & economics' }
  ];

  useEffect(() => {
    if (!isActive || !isPlaying) return;

    onExecuteDemoStep(currentStep);

    const timer = setTimeout(() => {
      if (currentStep < 10) {
        setCurrentStep(prev => prev + 1);
        speechService.playChime('click');
      } else {
        setIsPlaying(false);
        speechService.playChime('success');
      }
    }, 4500);

    return () => clearTimeout(timer);
  }, [isActive, isPlaying, currentStep]);

  if (!isActive) return null;

  const handleStepClick = (stepNum: number) => {
    setCurrentStep(stepNum);
    onExecuteDemoStep(stepNum);
    speechService.playChime('click');
  };

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setIsPlaying(true);
    onExecuteDemoStep(1);
    speechService.playChime('start');
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 bg-charcoal-900/95 text-white rounded-2xl p-4 shadow-2xl border border-charcoal-700 backdrop-blur-md animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-charcoal-700 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
          <span className="text-xs font-black uppercase tracking-wider text-amber-300">
            Hackathon Judge Demo
          </span>
          <span className="text-[10px] bg-charcoal-800 px-2 py-0.5 rounded text-charcoal-300 font-mono">
            {currentStep}/10
          </span>
        </div>

        <button 
          onClick={onClose}
          className="w-6 h-6 rounded-md hover:bg-charcoal-800 flex items-center justify-center text-charcoal-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Active Step Information */}
      <div className="space-y-1 mb-3">
        <h4 className="text-sm font-black text-white flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{demoSteps[currentStep - 1].title}</span>
        </h4>
        <p className="text-xs text-charcoal-300 font-medium">
          {demoSteps[currentStep - 1].desc}
        </p>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-1 mb-3">
        {demoSteps.map((step) => (
          <button
            key={step.num}
            onClick={() => handleStepClick(step.num)}
            className={`flex-1 h-1.5 rounded-full transition-all ${
              step.num === currentStep
                ? 'bg-amber-400'
                : step.num < currentStep
                ? 'bg-krishi-500'
                : 'bg-charcoal-700'
            }`}
            title={`Go to step ${step.num}: ${step.title}`}
          />
        ))}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-charcoal-900 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          <button
            onClick={handleRestart}
            className="p-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 text-charcoal-300 hover:text-white transition-colors"
            title="Restart Demo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() => {
            if (currentStep < 10) handleStepClick(currentStep + 1);
          }}
          disabled={currentStep >= 10}
          className="px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-700 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1 transition-colors"
        >
          <span>Next</span>
          <FastForward className="w-3 h-3" />
        </button>
      </div>

    </div>
  );
};
