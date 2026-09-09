import React, { useState, useEffect } from 'react';
import { 
  Language, 
  TimelineEntry, 
  FieldNodeSensor, 
  ActionItem, 
  SprayLogEntry, 
  BeforeAfterComparison, 
  CropType 
} from '../types';
import { te } from '../translations/te';
import { en } from '../translations/en';
import { apiService } from '../services/api';
import { 
  Layers, 
  Camera, 
  Clock, 
  AlertTriangle, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  ArrowRight,
  ShieldCheck,
  Droplets,
  Thermometer,
  CloudRain,
  Sun,
  Activity,
  Check,
  RefreshCw,
  Sparkles,
  Sliders,
  FileText,
  Wifi
} from 'lucide-react';
import { speechService } from '../utils/speech';

interface MyFieldScreenProps {
  language: Language;
  initialTab?: 'vitality' | 'sensors' | 'actions' | 'timeline';
  onScanAgain: () => void;
  onNavigateToScan?: () => void;
  onActionStatusChanged?: (id: string, completed: boolean) => void;
}

export const MyFieldScreen: React.FC<MyFieldScreenProps> = ({
  language,
  initialTab = 'vitality',
  onScanAgain,
  onNavigateToScan,
  onActionStatusChanged
}) => {
  const isTelugu = language === 'te';
  const t = language === 'te' ? te : en;

  // Active Sub-Tab inside My Field: 'vitality' | 'sensors' | 'actions' | 'timeline'
  const [fieldTab, setFieldTab] = useState<'vitality' | 'sensors' | 'actions' | 'timeline'>(initialTab);

  // Selected crop
  const [selectedCrop, setSelectedCrop] = useState<CropType>('cotton');

  // Data states
  const [sensors, setSensors] = useState<FieldNodeSensor[]>([]);
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [sprayLogs, setSprayLogs] = useState<SprayLogEntry[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [beforeAfter, setBeforeAfter] = useState<BeforeAfterComparison | null>(null);

  // Before/After Slider percentage
  const [sliderPosition, setSliderPosition] = useState(50);

  // Spray Animation playback
  const [isSprayingAnimation, setIsSprayingAnimation] = useState(false);
  const [sprayAnimationCompleted, setSprayAnimationCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [sData, aData, spData, tData, baData] = await Promise.all([
        apiService.getSensors(),
        apiService.getActions(),
        apiService.getSprayLogs(),
        apiService.getFieldTimeline(),
        apiService.getBeforeAfter()
      ]);
      setSensors(sData);
      setActions(aData);
      setSprayLogs(spData);
      setTimeline(tData);
      setBeforeAfter(baData);
    };
    fetchData();
  }, []);

  const handleToggleAction = async (actionId: string) => {
    speechService.playChime('click');
    setActions(prev => prev.map(a => {
      if (a.id === actionId) {
        const nextStatus = a.status === 'completed' ? 'pending' : 'completed';
        if (nextStatus === 'completed') speechService.playChime('success');
        if (onActionStatusChanged) {
          onActionStatusChanged(actionId, nextStatus === 'completed');
        }
        return { ...a, status: nextStatus };
      }
      return a;
    }));
    await apiService.toggleAction(actionId);
  };

  const handleTriggerSprayAnimation = async () => {
    setIsSprayingAnimation(true);
    speechService.playChime('click');

    await apiService.recordAction({
      titleTe: 'బయో-ఫంగిసైడ్ పిచికారీ పూర్తయింది',
      titleEn: 'Bio-Fungicide Foliar Spray Completed',
      recordedAmount: '40g / 16L knapsack',
      targetArea: 'Block 4 South',
      notes: 'Applied during low wind conditions. 48h follow-up scheduled.'
    });

    setTimeout(() => {
      setIsSprayingAnimation(false);
      setSprayAnimationCompleted(true);
      speechService.playChime('success');
      if (onActionStatusChanged) {
        onActionStatusChanged('act-01', true);
      }
    }, 2200);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-5 animate-fade-in pb-16">
      
      {/* Field Profile Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-krishi-100 shadow-card space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌱</span>
              <h1 className="text-xl sm:text-2xl font-black text-charcoal-900 tracking-tight">
                {isTelugu ? 'రాము వారి పత్తి చేను' : "Ramu's Cotton Field"}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-krishi-100 text-krishi-800 text-[10px] font-black uppercase">
                {isTelugu ? 'బ్లాక్ 4 • 2.5 ఎకరాలు' : 'Block 4 • 2.5 Acres'}
              </span>
            </div>
            <p className="text-xs text-charcoal-500 font-medium mt-0.5">
              {isTelugu ? 'పత్తి • పూత దశ (Day 35) • సమగ్ర క్షేత్ర నిఘా' : 'Cotton • Flowering Stage (Day 35) • Holistic Field Intelligence'}
            </p>
          </div>

          <button
            onClick={onScanAgain}
            className="px-4 py-2.5 rounded-xl bg-krishi-800 hover:bg-krishi-900 text-white font-bold text-xs shadow-soft flex items-center justify-center gap-1.5 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span>{isTelugu ? 'కొత్త స్కాన్' : 'New Scan'}</span>
          </button>
        </div>

        {/* 4 Internal Sub-Tabs inside MY FIELD */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 rounded-2xl bg-earth-100/80 border border-earth-200">
          {[
            { id: 'vitality' as const, te: '🌿 పంట తేజస్సు', en: 'Crop Vitality' },
            { id: 'sensors' as const, te: '📡 నేల & సెన్సార్లు', en: 'Soil & Sensors' },
            { id: 'actions' as const, te: '📝 పనులు & స్ప్రే', en: 'Actions & Log' },
            { id: 'timeline' as const, te: '📅 కాలక్రమం & పోలిక', en: 'Timeline & Compare' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                speechService.playChime('click');
                setFieldTab(tab.id);
              }}
              className={`py-2 px-2 text-xs font-black rounded-xl transition-all flex items-center justify-center cursor-pointer ${
                fieldTab === tab.id
                  ? 'bg-white text-krishi-900 shadow-soft'
                  : 'text-charcoal-600 hover:text-krishi-900'
              }`}
            >
              {isTelugu ? tab.te : tab.en}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-TAB 1: CROP VITALITY ENGINE */}
      {fieldTab === 'vitality' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Main Vitality Visual Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-7 border border-krishi-100 shadow-card space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-charcoal-500">
                  {isTelugu ? 'పంట ఆరోగ్య స్థితి' : 'CROP VITALITY STATUS'}
                </span>
                <h2 className="text-lg sm:text-xl font-black text-charcoal-900 mt-0.5">
                  {isTelugu ? 'ఆరోగ్యంగా ఉంది (HEALTHY)' : 'Overall State: HEALTHY'}
                </h2>
              </div>
              <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 font-black text-sm flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                <span>82% {isTelugu ? 'తేజస్సు' : 'Vitality'}</span>
              </div>
            </div>

            {/* Vitality Progress Bar */}
            <div className="space-y-1">
              <div className="w-full bg-earth-200 h-3 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-krishi-700 h-full rounded-full transition-all duration-700"
                  style={{ width: '82%' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-charcoal-500 font-semibold px-1">
                <span>0% Critical</span>
                <span>50% Stressed</span>
                <span className="text-emerald-800 font-black">82% Healthy</span>
                <span>100% Thriving</span>
              </div>
            </div>

            {/* Image-Derived RGB Leaf Vitality Indicators */}
            <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-charcoal-800 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-krishi-700" />
                  <span>{isTelugu ? 'ఆకు తేజస్సు అంచనా (RGB Leaf Vitality)' : 'Leaf Vitality Estimate'}</span>
                </span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-earth-200 text-charcoal-700 uppercase">
                  ESTIMATE • NOT SENSOR CHLOROPHYLL
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-xl bg-white border border-earth-200">
                  <p className="text-[10px] text-charcoal-500 font-bold">Excess Green (ExG)</p>
                  <p className="text-sm font-black text-emerald-800 mt-0.5">+0.28</p>
                  <p className="text-[9px] text-charcoal-500 font-medium">Healthy canopy</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-earth-200">
                  <p className="text-[10px] text-charcoal-500 font-bold">Green/Yellow Ratio</p>
                  <p className="text-sm font-black text-emerald-800 mt-0.5">2.4x</p>
                  <p className="text-[9px] text-charcoal-500 font-medium">Normal foliar</p>
                </div>

                <div className="p-2.5 rounded-xl bg-white border border-earth-200">
                  <p className="text-[10px] text-charcoal-500 font-bold">Lesion Coverage</p>
                  <p className="text-sm font-black text-amber-800 mt-0.5">6.2%</p>
                  <p className="text-[9px] text-charcoal-500 font-medium">Controlled spots</p>
                </div>
              </div>

              <p className="text-[10px] text-charcoal-500 font-medium text-center">
                {isTelugu 
                  ? '🛡️ స్మార్ట్‌ఫోన్ ఫోటో రంగుల ఆధారంగా లెక్కించిన సూచిక. ప్రయోగశాల క్లోరోఫిల్ కొలత కాదు.' 
                  : '🛡️ Image-derived vegetation index. Visual indicator distinct from physical sensor chlorophyll measurement.'}
              </p>
            </div>
          </div>

          {/* Environmental Correlation Insight */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-300 text-xs text-amber-950 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-amber-900">
                {isTelugu ? 'వాతావరణ ప్రభావ సూచన (Midday Heat Alert)' : 'Contextual Vitality Alert: Midday Heat'}
              </p>
              <p className="font-medium text-charcoal-700 mt-0.5 leading-relaxed">
                {isTelugu 
                  ? 'ప్రస్తుతం పగటి ఉష్ణోగ్రత 29.4°C మరియు నేల తేమ 42% ఉండడం వల్ల మధ్యాహ్న సమయాల్లో స్వల్ప ఆకు వాడటం సహజం. ఇది వ్యాధి కాదు. సాయంత్రం వేళ తేలికపాటి నీటి తడి ఇవ్వండి.'
                  : 'Current 29.4°C temperature and 42% soil moisture cause transient midday foliar wilting. This is physiological moisture stress, not fungal blast. Light evening irrigation advised.'}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 2: SOIL & IOT SENSORS */}
      {fieldTab === 'sensors' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* IoT Node Telemetry Header */}
          <div className="bg-white rounded-3xl p-5 border border-krishi-100 shadow-card space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-earth-200 pb-3">
              <div className="flex items-center gap-2">
                <Wifi className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="text-xs font-black text-charcoal-900">NODE: ESP8266-FIELD-01</span>
                <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 uppercase">
                  SIMULATED TELEMETRY
                </span>
              </div>
              <span className="text-[11px] text-charcoal-500 font-medium">
                {isTelugu ? 'చివరి సింక్: 2 నిమిషాల క్రితం' : 'Synced 2 mins ago'}
              </span>
            </div>

            {/* 6 Real/Simulated Sensor Readings */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Soil Moisture */}
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                  <span className="flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-amber-700" />
                    <span>{isTelugu ? 'నేలలో తేమ' : 'Soil Moisture'}</span>
                  </span>
                  <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">
                    {isTelugu ? 'తక్కువ' : 'LOW'}
                  </span>
                </div>
                <p className="text-2xl font-black text-amber-950">42%</p>
                <p className="text-[10px] text-charcoal-500 font-medium">Target: 45% - 65%</p>
              </div>

              {/* Temperature */}
              <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-charcoal-700">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-krishi-700" />
                    <span>{isTelugu ? 'ఉష్ణోగ్రత' : 'Temperature'}</span>
                  </span>
                  <span className="text-[10px] text-charcoal-500">DHT22</span>
                </div>
                <p className="text-2xl font-black text-charcoal-900">29.4°C</p>
                <p className="text-[10px] text-charcoal-500 font-medium">{isTelugu ? 'పగటి వెచ్చదనం' : 'Warm midday'}</p>
              </div>

              {/* Humidity */}
              <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-charcoal-700">
                  <span className="flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5 text-blue-700" />
                    <span>{isTelugu ? 'గాలిలో తేమ' : 'Humidity'}</span>
                  </span>
                  <span className="text-[10px] text-charcoal-500">RH</span>
                </div>
                <p className="text-2xl font-black text-charcoal-900">68%</p>
                <p className="text-[10px] text-charcoal-500 font-medium">{isTelugu ? 'సాధారణం' : 'Normal range'}</p>
              </div>

              {/* Soil pH */}
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{isTelugu ? 'నేల pH' : 'Soil pH'}</span>
                  </span>
                  <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">
                    NORMAL
                  </span>
                </div>
                <p className="text-2xl font-black text-emerald-950">6.8</p>
                <p className="text-[10px] text-charcoal-500 font-medium">{isTelugu ? 'పత్తికి అనుకూలం' : 'Ideal for Cotton'}</p>
              </div>

              {/* Light Intensity */}
              <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-charcoal-700">
                  <span className="flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isTelugu ? 'కాంతి' : 'Light (LDR)'}</span>
                  </span>
                  <span className="text-[10px] text-charcoal-500">Lux</span>
                </div>
                <p className="text-2xl font-black text-charcoal-900">840 lx</p>
                <p className="text-[10px] text-charcoal-500 font-medium">{isTelugu ? 'మంచి వెలుతురు' : 'Optimal sun'}</p>
              </div>

              {/* Battery & Health */}
              <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-charcoal-700">
                  <span>{isTelugu ? 'బ్యాటరీ' : 'Node Battery'}</span>
                  <span className="text-[10px] text-emerald-700 font-bold">18650 Cell</span>
                </div>
                <p className="text-2xl font-black text-charcoal-900">92%</p>
                <p className="text-[10px] text-charcoal-500 font-medium">{isTelugu ? 'సోలార్ ఛార్జ్ చురుకుగా' : 'Solar charging'}</p>
              </div>
            </div>

            {/* Sensor Anomaly Detection Filter */}
            <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 flex items-center justify-between text-xs">
              <span className="font-bold text-charcoal-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{isTelugu ? 'సెన్సార్ తనిఖీ: EWMA ఫిల్టర్ యాక్టివ్ • డేటా స్థిరంగా ఉంది' : 'Sensor Quality: EWMA smoothed • Telemetry reliable'}</span>
              </span>
              <span className="text-[10px] font-bold text-charcoal-500">NO ANOMALIES</span>
            </div>
          </div>

          {/* SENSOR TO DECISION FUSION CARD */}
          <div className="p-4 rounded-3xl bg-krishi-50/80 border border-krishi-300 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-krishi-950 uppercase tracking-wider">
                {isTelugu ? 'సెన్సార్ + AI విశ్లేషణ (Sensor-to-Decision Intelligence)' : 'Sensor-to-Decision Fusion'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-krishi-200 text-krishi-900">
                DECISION CONTEXT
              </span>
            </div>
            <p className="text-xs font-semibold text-charcoal-800 leading-relaxed">
              {isTelugu 
                ? 'నేలలో తేమ 42% తక్కువగా ఉండడం వల్ల పంట పసుపు రంగులోకి మారినట్లు సెన్సార్లు ధృవీకరిస్తున్నాయి. తెగులు సోకలేదు. మందులు పిచికారీ చేయడం వల్ల ఖర్చు వృధా అవుతుంది.'
                : 'Soil telemetry (42% moisture) confirms physiological yellowing rather than foliar disease. Sensor fusion suppresses unnecessary pesticide expense.'}
            </p>
          </div>

        </div>
      )}

      {/* SUB-TAB 3: ACTIONS & SPRAY LOGBOOK */}
      {fieldTab === 'actions' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* Action Tasks Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-krishi-100 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-earth-200 pb-3">
              <div>
                <h2 className="text-base sm:text-lg font-black text-charcoal-900">
                  {isTelugu ? 'క్షేత్ర పనుల నిర్వహణ' : 'Closed-Loop Field Actions'}
                </h2>
                <p className="text-xs text-charcoal-500 font-medium">
                  {isTelugu ? 'సిఫార్సులను కేవలం చదవడం కాకుండా, పూర్తి చేసినట్లు నమోదు చేయండి' : 'Track verified implementation of agronomic advisories'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              {actions.map((act) => {
                const isDone = act.status === 'completed';
                return (
                  <div
                    key={act.id}
                    onClick={() => handleToggleAction(act.id)}
                    className={`p-4 rounded-2xl border-2 transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      isDone 
                        ? 'bg-krishi-50/60 border-krishi-400 opacity-80' 
                        : 'bg-white border-earth-200 hover:border-krishi-300 shadow-soft'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                          act.priority === 'urgent' ? 'bg-red-100 text-red-900' : 'bg-earth-100 text-charcoal-800'
                        }`}>
                          {act.priority}
                        </span>
                        <h3 className={`text-xs sm:text-sm font-black text-charcoal-900 ${isDone ? 'line-through text-charcoal-500' : ''}`}>
                          {isTelugu ? act.titleTe : act.titleEn}
                        </h3>
                      </div>
                      <p className="text-xs text-charcoal-600 font-medium leading-relaxed">
                        {isTelugu ? act.descriptionTe : act.descriptionEn}
                      </p>
                    </div>

                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isDone ? 'bg-krishi-800 border-krishi-800 text-white' : 'border-earth-300 bg-white'
                    }`}>
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SPRAY ANIMATION DEMO BOX */}
          <div className="bg-white rounded-3xl p-5 border border-krishi-200 shadow-card text-center space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-black text-charcoal-900">
                {isTelugu ? 'పిచికారీ రికార్డ్ & పంట ప్రతిస్పందన' : 'Treatment Spray Simulation & Countdown'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                JUDGE DEMO MOMENT
              </span>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-[16/9] border border-earth-300 bg-earth-900 flex items-center justify-center">
              <img 
                src="https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80" 
                alt="Leaf treatment" 
                className={`w-full h-full object-cover transition-all duration-1000 ${
                  sprayAnimationCompleted ? 'brightness-105 saturate-125' : 'brightness-90'
                }`}
              />

              {/* Spray Particle Mist Overlay */}
              {isSprayingAnimation && (
                <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-[1px] flex items-center justify-center animate-pulse">
                  <div className="text-white text-xs font-black bg-black/60 px-4 py-2 rounded-full flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-300 animate-bounce" />
                    <span>{isTelugu ? 'పిచికారీ జరుగుతోంది...' : 'Fine Mist Deposition...'}</span>
                  </div>
                </div>
              )}

              {/* Countdown overlay after completion */}
              {sprayAnimationCompleted && !isSprayingAnimation && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-krishi-900/90 text-white text-xs font-bold flex items-center gap-1.5 shadow-elevated">
                  <Clock className="w-3.5 h-3.5 text-krishi-300" />
                  <span>{isTelugu ? '48 గంటల తదుపరి పరీక్ష సమయం షెడ్యూల్ అయింది' : 'Follow-up Re-scan in 48:00:00'}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleTriggerSprayAnimation}
              disabled={isSprayingAnimation}
              className="px-5 py-2.5 rounded-xl bg-krishi-800 hover:bg-krishi-900 text-white font-black text-xs shadow-soft active:scale-95 transition-all cursor-pointer"
            >
              {isTelugu ? '💦 పిచికారీ నిర్ధారించండి (Confirm Spray)' : '💦 Confirm Treatment Spray'}
            </button>
          </div>

          {/* Real-Looking Spray Logbook */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-earth-200 shadow-card space-y-3">
            <div className="flex items-center justify-between border-b border-earth-200 pb-2">
              <span className="text-xs font-black uppercase text-charcoal-800">
                {isTelugu ? 'స్ప్రే లాగ్‌బుక్ (Spray Logbook)' : 'Spray Logbook Records'}
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 uppercase">
                SOURCE VERIFIED
              </span>
            </div>

            <div className="space-y-2">
              {sprayLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-earth-50 border border-earth-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-charcoal-900">
                      {isTelugu ? log.productTe : log.productEn}
                    </span>
                    <span className="text-[10px] font-bold text-charcoal-500">{log.date}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-charcoal-700">
                    <div>
                      <span className="text-charcoal-500">Tank: </span>
                      <span className="font-bold">{log.tankCapacity}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Recorded: </span>
                      <span className="font-bold text-krishi-800">{log.recordedVolume}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Dose: </span>
                      <span className="font-bold">{log.recommendedDose}</span>
                    </div>
                    <div>
                      <span className="text-charcoal-500">Operator: </span>
                      <span className="font-bold">{log.operator}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* SUB-TAB 4: TIMELINE & BEFORE/AFTER */}
      {fieldTab === 'timeline' && (
        <div className="space-y-4 animate-fade-in">
          
          {/* INTERACTIVE BEFORE/AFTER SLIDER */}
          {beforeAfter && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-krishi-100 shadow-card space-y-3">
              <div className="flex items-center justify-between border-b border-earth-200 pb-2">
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-charcoal-900">
                    {isTelugu ? 'ముందు / తర్వాత పోలిక (Before / After Comparison)' : 'Foliar Before / After Comparison'}
                  </h3>
                  <p className="text-[11px] text-charcoal-500 font-medium">
                    {isTelugu ? 'మందు పిచికారీ తర్వాత ఆకులో వచ్చిన మార్పు' : 'Measured recovery 7 days post-treatment'}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs">
                  -54% {isTelugu ? 'మచ్చల తగ్గింపు' : 'Lesion Area'}
                </span>
              </div>

              {/* Slider View */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] border border-earth-300 select-none">
                {/* After Image (Full background) */}
                <img 
                  src={beforeAfter.afterImage} 
                  alt="After treatment" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <span className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-krishi-900/80 text-white text-[10px] font-black z-10">
                  {isTelugu ? 'తర్వాత (Day 35)' : 'After (Day 35)'}
                </span>

                {/* Before Image (Clipped by slider position) */}
                <div 
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img 
                    src={beforeAfter.beforeImage} 
                    alt="Before treatment" 
                    className="absolute inset-0 w-full h-full object-cover max-w-none"
                    style={{ width: '100%', height: '100%' }}
                  />
                  <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-md bg-black/70 text-white text-[10px] font-black">
                    {isTelugu ? 'ముందు (Day 28)' : 'Before (Day 28)'}
                  </span>
                </div>

                {/* Slider Divider Line */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-xl cursor-ew-resize"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-white border-2 border-krishi-800 text-krishi-900 flex items-center justify-center text-[10px] font-black shadow-lg">
                    ⇄
                  </div>
                </div>
              </div>

              {/* Slider Control Input */}
              <div className="space-y-1 pt-1">
                <input 
                  type="range" 
                  min="5" 
                  max="95" 
                  value={sliderPosition} 
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="w-full h-2 bg-earth-200 rounded-lg appearance-none cursor-pointer accent-krishi-800"
                />
                <p className="text-[10px] text-charcoal-500 font-medium text-center">
                  {isTelugu ? 'స్లైడర్‌ను జరిపి మార్పును పరిశీలించండి' : 'Slide to inspect lesion area resolution'}
                </p>
              </div>
            </div>
          )}

          {/* Longitudinal Day 1-35 Timeline */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-earth-200 shadow-card space-y-3">
            <h3 className="text-xs sm:text-sm font-black text-charcoal-900 border-b border-earth-200 pb-2">
              {isTelugu ? 'పంట కాలక్రమ చరిత్ర (Day 1 - 35)' : 'Longitudinal Crop History (Day 1 - 35)'}
            </h3>

            <div className="space-y-2.5">
              {timeline.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-earth-50 border border-earth-200 flex items-start gap-3 text-xs">
                  <span className="w-8 h-8 rounded-xl bg-white border border-earth-300 text-krishi-900 font-black flex items-center justify-center text-xs flex-shrink-0">
                    D{item.day}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-charcoal-900">
                        {isTelugu ? item.titleTe : item.titleEn}
                      </span>
                      <span className="text-[10px] text-charcoal-500">{item.date}</span>
                    </div>
                    <p className="text-charcoal-600 mt-0.5 leading-snug">
                      {isTelugu ? item.descriptionTe : item.descriptionEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
