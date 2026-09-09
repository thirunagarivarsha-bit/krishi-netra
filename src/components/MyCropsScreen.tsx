import React, { useState, useEffect } from 'react';
import { Language, TimelineEntry, BeforeAfterComparison } from '../types';
import { apiService, MOCK_TIMELINE_HISTORY } from '../services/api';
import { 
  Layers, 
  Camera, 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  CheckCircle2, 
  Calendar, 
  ArrowRight,
  Sliders,
  Sparkles,
  ShieldCheck,
  SplitSquareVertical
} from 'lucide-react';
import { speechService } from '../utils/speech';

interface MyCropsScreenProps {
  language: Language;
  onScanAgain: () => void;
  onNavigateToActions?: () => void;
}

export const MyCropsScreen: React.FC<MyCropsScreenProps> = ({
  language,
  onScanAgain,
  onNavigateToActions
}) => {
  const [timeline, setTimeline] = useState<TimelineEntry[]>(MOCK_TIMELINE_HISTORY);
  const [selectedEntry, setSelectedEntry] = useState<TimelineEntry>(MOCK_TIMELINE_HISTORY[3]);
  const [beforeAfter, setBeforeAfter] = useState<BeforeAfterComparison | null>(null);
  
  // Interactive Before/After slider position (0 to 100)
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [activeCropField, setActiveCropField] = useState<'cotton_block4' | 'paddy_block1'>('cotton_block4');

  const isTelugu = language === 'te';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [fetchedTimeline, fetchedBA] = await Promise.all([
      apiService.getFieldTimeline(),
      apiService.getBeforeAfter()
    ]);
    setTimeline(fetchedTimeline);
    setBeforeAfter(fetchedBA);
  };

  const conditionBadges = {
    improving: {
      labelTe: 'మెరుగుపడుతోంది',
      labelEn: 'Improving',
      color: 'bg-krishi-100 text-krishi-900 border-krishi-300',
      icon: <TrendingDown className="w-3.5 h-3.5 text-krishi-700" />
    },
    stable: {
      labelTe: 'నిలకడగా ఉంది',
      labelEn: 'Stable',
      color: 'bg-blue-50 text-blue-900 border-blue-200',
      icon: <Minus className="w-3.5 h-3.5 text-blue-700" />
    },
    worsening: {
      labelTe: 'క్షీణిస్తోంది',
      labelEn: 'Worsening',
      color: 'bg-amber-100 text-amber-900 border-amber-300',
      icon: <TrendingUp className="w-3.5 h-3.5 text-amber-700" />
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fade-in font-sans">
      
      {/* Top Field Selector & Overview Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight">
              {isTelugu ? 'నా పంటల కాలక్రమం (My Crops)' : 'My Crops & Longitudinal History'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-krishi-100 text-krishi-800 text-xs font-bold">
              {isTelugu ? 'క్షేత్ర పర్యవేక్షణ' : 'Continuous Tracking'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 font-medium mt-0.5">
            {isTelugu 
              ? 'విత్తనం నాటినప్పటి నుండి నేటి వరకు పంట ఆరోగ్య చరిత్ర & ఫోటోల మార్పు' 
              : 'End-to-end crop trajectory from sowing to recovery with before/after visual verification'}
          </p>
        </div>

        {/* Scan / Update Action */}
        <button
          onClick={onScanAgain}
          className="px-5 py-3 rounded-2xl bg-krishi-800 hover:bg-krishi-900 text-white font-bold text-xs sm:text-sm shadow-soft flex items-center justify-center gap-2 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>{isTelugu ? 'ఫాలో-అప్ ఫోటో తీయండి' : 'Add Follow-Up Photo'}</span>
        </button>
      </div>

      {/* Field Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 max-w-md">
        <button
          onClick={() => {
            speechService.playChime('click');
            setActiveCropField('cotton_block4');
          }}
          className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
            activeCropField === 'cotton_block4'
              ? 'border-krishi-700 bg-white shadow-soft ring-2 ring-krishi-500'
              : 'border-earth-200 bg-earth-50 hover:bg-white text-charcoal-600'
          }`}
        >
          <span className="text-2xl">🌱</span>
          <div>
            <p className="text-xs font-black text-charcoal-900">
              {isTelugu ? 'పత్తి క్షేత్రం - బ్లాక్ 4' : 'Cotton Field - Block 4'}
            </p>
            <p className="text-[10px] text-krishi-700 font-bold">
              {isTelugu ? 'పూత దశ • రికవరీలో ఉంది' : 'Flowering • Improving'}
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            speechService.playChime('click');
            setActiveCropField('paddy_block1');
          }}
          className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
            activeCropField === 'paddy_block1'
              ? 'border-krishi-700 bg-white shadow-soft ring-2 ring-krishi-500'
              : 'border-earth-200 bg-earth-50 hover:bg-white text-charcoal-600'
          }`}
        >
          <span className="text-2xl">🌾</span>
          <div>
            <p className="text-xs font-black text-charcoal-900">
              {isTelugu ? 'వరి క్షేత్రం - బ్లాక్ 1' : 'Paddy Field - Block 1'}
            </p>
            <p className="text-[10px] text-charcoal-500 font-medium">
              {isTelugu ? 'దుబ్బు చేసే దశ • సాధారణం' : 'Tillering • Normal'}
            </p>
          </div>
        </button>
      </div>

      {/* BEFORE / AFTER VISUAL COMPARISON SLIDER */}
      {beforeAfter && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-krishi-100 shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-earth-200 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <SplitSquareVertical className="w-5 h-5 text-krishi-800" />
                <h2 className="text-base sm:text-lg font-black text-charcoal-900">
                  {isTelugu ? 'చికిత్సకు ముందు & తర్వాత ఆకు పోలిక (Before / After Inspection)' : 'Visual Recovery: Before vs After Treatment'}
                </h2>
              </div>
              <p className="text-xs text-charcoal-500 font-medium mt-0.5">
                {isTelugu 
                  ? 'మందు కొట్టక ముందు మరియు 48 గంటల తర్వాత ఆకులో వచ్చిన మార్పును స్లైడర్‌తో సరిచూడండి' 
                  : 'Slide across the foliar specimen to inspect lesion drying, margin recovery, and tissue health'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs">
                {isTelugu ? '✓ -54% తెగులు వ్యాప్తి తగ్గింది' : '✓ -54% Lesion Area Reduced'}
              </span>
            </div>
          </div>

          {/* Interactive Split-Screen Image Slider */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] sm:aspect-[21/9] max-h-96 select-none shadow-md border border-earth-200">
            {/* After Image (Background) */}
            <img 
              src={beforeAfter.afterImage} 
              alt="After Treatment" 
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Before Image (Clipped by slider position) */}
            <div 
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${sliderPos}%` }}
            >
              <img 
                src={beforeAfter.beforeImage} 
                alt="Before Treatment" 
                className="absolute inset-0 w-full h-full object-cover max-w-none"
                style={{ width: '100%', height: '100%' }}
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/70 text-white text-[11px] font-black backdrop-blur-sm">
                {isTelugu ? beforeAfter.beforeLabelTe : beforeAfter.beforeLabelEn}
              </div>
            </div>

            {/* After Label (Right side) */}
            <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-krishi-900/80 text-white text-[11px] font-black backdrop-blur-sm">
              {isTelugu ? beforeAfter.afterLabelTe : beforeAfter.afterLabelEn}
            </div>

            {/* Vertical Divider Handle Line */}
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-xl cursor-ew-resize flex items-center justify-center pointer-events-none"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-white text-krishi-900 shadow-elevated border-2 border-krishi-700 flex items-center justify-center font-bold text-xs">
                ↔
              </div>
            </div>

            {/* Invisible Range Slider on top */}
            <input 
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              aria-label="Comparison slider"
              className="absolute inset-0 opacity-0 cursor-ew-resize w-full h-full z-10"
            />
          </div>

          {/* Quantitative Diagnostic Indicators */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-earth-50 border border-earth-200">
              <p className="text-[10px] text-charcoal-500 font-bold uppercase">
                {isTelugu ? 'తెగులు విస్తీర్ణం' : 'Lesion Area'}
              </p>
              <p className="text-sm sm:text-base font-black text-krishi-800 mt-0.5">
                -54% <span className="text-[10px] font-semibold text-charcoal-500">తగ్గింది</span>
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-earth-50 border border-earth-200">
              <p className="text-[10px] text-charcoal-500 font-bold uppercase">
                {isTelugu ? 'పచ్చదనం / క్లోరోఫిల్' : 'Foliar Vitality'}
              </p>
              <p className="text-sm sm:text-base font-black text-krishi-800 mt-0.5">
                +38% <span className="text-[10px] font-semibold text-charcoal-500">పెరిగింది</span>
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-earth-50 border border-earth-200">
              <p className="text-[10px] text-charcoal-500 font-bold uppercase">
                {isTelugu ? 'కొత్త మచ్చలు' : 'Secondary Spores'}
              </p>
              <p className="text-sm sm:text-base font-black text-krishi-800 mt-0.5">
                0 <span className="text-[10px] font-semibold text-charcoal-500">పూర్తి నియంత్రణ</span>
              </p>
            </div>
          </div>

        </div>
      )}

      {/* LONGITUDINAL CROP HEALTH TIMELINE */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-krishi-100 shadow-card space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-earth-200 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-krishi-800" />
              <h2 className="text-base sm:text-lg font-black text-charcoal-900">
                {isTelugu ? 'కాలక్రమ రికార్డు (Day 1 → Day 35)' : 'Continuous Crop Health Trajectory'}
              </h2>
            </div>
            <p className="text-xs text-charcoal-500 font-medium mt-0.5">
              {isTelugu 
                ? 'ప్రతి స్కాన్ ఫలితం మరియు రైతు చర్య కాలక్రమంలో భద్రపరచబడుతుంది' 
                : 'Interactive timeline linking photo evidence, AI diagnosis, farmer treatment, and follow-up'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-charcoal-600">
            <span className="flex items-center gap-1 text-krishi-700">● {isTelugu ? 'మెరుగుపడుతోంది' : 'Improving'}</span>
            <span className="flex items-center gap-1 text-blue-700">● {isTelugu ? 'నిలకడ' : 'Stable'}</span>
            <span className="flex items-center gap-1 text-amber-700">● {isTelugu ? 'హెచ్చరిక' : 'Warning'}</span>
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {timeline.map((entry) => {
            const badge = conditionBadges[entry.condition];
            const isSelected = selectedEntry.day === entry.day;

            return (
              <button
                key={entry.day}
                onClick={() => {
                  speechService.playChime('click');
                  setSelectedEntry(entry);
                }}
                className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-[0.98] cursor-pointer ${
                  isSelected
                    ? 'border-krishi-700 bg-krishi-50/70 shadow-soft ring-2 ring-krishi-500'
                    : 'border-earth-200 bg-white hover:bg-earth-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black text-charcoal-900">
                    {isTelugu ? entry.titleTe : entry.titleEn}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${badge.color}`}>
                    {badge.icon}
                    <span>{isTelugu ? badge.labelTe : badge.labelEn}</span>
                  </span>
                </div>

                <p className="text-[11px] font-bold text-charcoal-500">
                  {entry.date}
                </p>

                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-xs text-charcoal-600 font-medium">
                    {isTelugu ? 'రిస్క్ స్కోరు:' : 'Risk Score:'}
                  </span>
                  <span className={`text-sm font-black ${entry.risk > 50 ? 'text-amber-700' : 'text-krishi-800'}`}>
                    {entry.risk}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detailed Timeline Record Drawer */}
        <div className="p-5 rounded-2xl bg-earth-50 border border-earth-200 space-y-3">
          <div className="flex items-center justify-between border-b border-earth-200 pb-2">
            <span className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">
              {isTelugu ? `${selectedEntry.titleTe} సమగ్ర పరిశీలన` : `Detailed Record: ${selectedEntry.titleEn}`}
            </span>
            <span className="text-xs font-semibold text-charcoal-500">{selectedEntry.date}</span>
          </div>

          <p className="text-xs sm:text-sm font-medium text-charcoal-800 leading-relaxed">
            {isTelugu ? selectedEntry.descriptionTe : selectedEntry.descriptionEn}
          </p>

          {selectedEntry.actionTakenTe && (
            <div className="p-3 rounded-xl bg-white border border-krishi-200 flex items-start gap-2.5 text-xs text-krishi-900 font-medium">
              <CheckCircle2 className="w-4 h-4 text-krishi-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">{isTelugu ? 'నమోదైన చర్య: ' : 'Action Recorded: '}</span>
                <span>{isTelugu ? selectedEntry.actionTakenTe : selectedEntry.actionTakenEn}</span>
              </div>
            </div>
          )}

          {onNavigateToActions && (
            <div className="pt-2 flex justify-end">
              <button
                onClick={onNavigateToActions}
                className="text-xs font-bold text-krishi-800 hover:text-krishi-900 flex items-center gap-1 cursor-pointer"
              >
                <span>{isTelugu ? 'పనుల రికార్డు చూడండి' : 'View In Action Loop'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
