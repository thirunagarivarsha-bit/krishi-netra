import React, { useState, useEffect } from 'react';
import { Language, FieldNodeSensor } from '../types';
import { apiService } from '../services/api';
import { 
  Wifi, 
  Battery, 
  Droplets, 
  Thermometer, 
  CloudRain, 
  Plus, 
  RefreshCw, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  ArrowRight,
  Sparkles,
  Signal
} from 'lucide-react';
import { speechService } from '../utils/speech';

interface FieldScreenProps {
  language: Language;
  onScanAgain?: () => void;
}

export const FieldScreen: React.FC<FieldScreenProps> = ({
  language,
  onScanAgain
}) => {
  const [sensors, setSensors] = useState<FieldNodeSensor[]>([]);
  const [selectedNode, setSelectedNode] = useState<FieldNodeSensor | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNodeName, setNewNodeName] = useState('');

  const isTelugu = language === 'te';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsRefreshing(true);
    const fetched = await apiService.getSensors();
    setSensors(fetched);
    if (fetched.length > 0 && !selectedNode) {
      setSelectedNode(fetched[0]);
    }
    setIsRefreshing(false);
  };

  const handleRefresh = () => {
    speechService.playChime('click');
    loadData();
  };

  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNodeName) return;

    speechService.playChime('success');
    const newNode: FieldNodeSensor = {
      id: `esp8266-node-${Date.now().toString().slice(-4)}`,
      name: newNodeName,
      status: 'online',
      isSimulation: true,
      soilMoisture: 45,
      temperature: 29.0,
      humidity: 65,
      batteryLevel: 98,
      lastSync: isTelugu ? 'ఇప్పుడే (Just now)' : 'Just now',
      rssi: -58
    };

    setSensors(prev => [...prev, newNode]);
    setSelectedNode(newNode);
    setShowAddModal(false);
    setNewNodeName('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 animate-fade-in font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight">
              {isTelugu ? 'పొలం & IoT నోడ్స్ పర్యవేక్షణ' : 'Field & Low-Cost IoT Telemetry'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
              SIMULATION
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 font-medium mt-0.5">
            {isTelugu 
              ? 'ESP8266 సరసమైన సెన్సార్ నోడ్ ద్వారా నేల తేమ, ఉష్ణోగ్రత మరియు గాలిలో తేమ లైవ్ ట్రాకింగ్' 
              : 'Sub-₹600 ESP8266 solar nodes continuously transmitting soil moisture & canopy microclimate'}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-2xl bg-white border border-earth-300 hover:bg-earth-50 text-charcoal-700 shadow-soft cursor-pointer"
            title="Refresh Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-krishi-700' : ''}`} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-krishi-800 hover:bg-krishi-900 text-white font-bold text-xs sm:text-sm shadow-soft flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isTelugu ? '+ కొత్త నోడ్ జతచేయండి' : '+ Add Field Node'}</span>
          </button>
        </div>
      </div>

      {/* ACTIVE IOT NODES CAROUSEL / SELECTOR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sensors.map(node => {
          const isSelected = selectedNode?.id === node.id;
          return (
            <div
              key={node.id}
              onClick={() => {
                speechService.playChime('click');
                setSelectedNode(node);
              }}
              className={`p-5 rounded-3xl border-2 transition-all cursor-pointer bg-white ${
                isSelected 
                  ? 'border-krishi-700 shadow-elevated ring-2 ring-krishi-500' 
                  : 'border-earth-200 hover:border-krishi-300 shadow-card'
              }`}
            >
              <div className="flex items-center justify-between border-b border-earth-200 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-krishi-50 border border-krishi-200 flex items-center justify-center text-krishi-800">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-charcoal-900">
                      {node.name}
                    </h3>
                    <span className="text-[10px] font-mono text-charcoal-500 font-medium">
                      {node.id} • {node.lastSync}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-black text-emerald-800 uppercase tracking-wider">
                    ONLINE
                  </span>
                </div>
              </div>

              {/* 4 Telemetry Metrics */}
              <div className="grid grid-cols-3 gap-2.5 pt-3">
                <div className="p-2.5 rounded-xl bg-earth-50 border border-earth-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-charcoal-500">
                    <Droplets className="w-3 h-3 text-blue-600" />
                    <span>{isTelugu ? 'నేల తేమ' : 'Soil Moist'}</span>
                  </div>
                  <p className="text-base font-black text-charcoal-900 mt-0.5">
                    {node.soilMoisture}%
                  </p>
                  <span className="text-[9px] font-semibold text-krishi-700">
                    {node.soilMoisture > 35 ? (isTelugu ? 'తగినంత' : 'Optimal') : (isTelugu ? 'తక్కువ' : 'Dry')}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-earth-50 border border-earth-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-charcoal-500">
                    <Thermometer className="w-3 h-3 text-amber-600" />
                    <span>{isTelugu ? 'ఉష్ణోగ్రత' : 'Temp'}</span>
                  </div>
                  <p className="text-base font-black text-charcoal-900 mt-0.5">
                    {node.temperature}°C
                  </p>
                  <span className="text-[9px] font-semibold text-charcoal-500">
                    {isTelugu ? 'పగటి వేళ' : 'Ambient'}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-earth-50 border border-earth-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-charcoal-500">
                    <CloudRain className="w-3 h-3 text-teal-600" />
                    <span>{isTelugu ? 'గాలి తేమ' : 'RH%'}</span>
                  </div>
                  <p className="text-base font-black text-charcoal-900 mt-0.5">
                    {node.humidity}%
                  </p>
                  <span className="text-[9px] font-semibold text-amber-700">
                    {node.humidity > 70 ? (isTelugu ? 'అధికం' : 'High') : (isTelugu ? 'సాధారణం' : 'Normal')}
                  </span>
                </div>
              </div>

              {/* Node hardware status pill */}
              <div className="mt-3 pt-2.5 border-t border-earth-200/60 flex items-center justify-between text-[11px] text-charcoal-500">
                <span className="flex items-center gap-1">
                  <Battery className="w-3.5 h-3.5 text-krishi-700" />
                  <span>{node.batteryLevel}% {isTelugu ? 'సౌర బ్యాటరీ' : 'Solar LFP'}</span>
                </span>

                <span className="flex items-center gap-1">
                  <Signal className="w-3.5 h-3.5 text-blue-600" />
                  <span>{node.rssi} dBm (WiFi 802.11 b/g/n)</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* HOW IOT ENHANCES DECISION INTELLIGENCE (THE "WHY") */}
      <div className="bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-krishi-950 text-white rounded-3xl p-6 sm:p-8 border border-charcoal-700 shadow-elevated space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-base sm:text-lg font-black uppercase tracking-wider">
            {isTelugu ? 'సెన్సార్ డేటా AI నిర్ణయాలను ఎలా బలోపేతం చేస్తుంది?' : 'How Field Telemetry Enhances AI Decision Intelligence'}
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-krishi-100 leading-relaxed max-w-3xl">
          {isTelugu 
            ? 'కేవలం ఆకు ఫోటోను మాత్రమే చూస్తే, రోగం సోకిన తర్వాతే గుర్తించగలుగుతాం. కానీ ఈ ESP8266 నోడ్ ద్వారా గాలిలో తేమ 80% పైగా ఉండి, ఉష్ణోగ్రత 26-29°C మధ్య ఉన్నప్పుడు శిలీంధ్ర బీజాల వృద్ధిని ముందే గుర్తించి రైతుకు హెచ్చరిక జారీ చేయవచ్చు.' 
            : 'Foliar vision models alone can only detect symptoms after cellular necrosis begins. Continuous ESP8266 microclimate telemetry (detecting RH > 80% sustained across 48 hours within 26–29°C temperature thresholds) enables preventive intervention before irreversible fungal spore colonization occurs.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15">
            <p className="text-xs font-black text-amber-300">
              {isTelugu ? '1. ముందస్తు హెచ్చరిక (Early Warning)' : '1. Pre-Symptomatic Warning'}
            </p>
            <p className="text-[11px] text-charcoal-300 mt-1">
              {isTelugu ? 'ఆకుపై మచ్చలు కనిపించక ముందే రిస్క్ అంచనా వేస్తుంది.' : 'Identifies high-risk sporulation windows 24–48h ahead.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15">
            <p className="text-xs font-black text-teal-300">
              {isTelugu ? '2. తప్పుడు పిచికారీ నివారణ' : '2. Zero Chemical Waste'}
            </p>
            <p className="text-[11px] text-charcoal-300 mt-1">
              {isTelugu ? 'వాతావరణం అనుకూలంగా లేకపోతే మందు కొట్టకుండా ఆపుతుంది.' : 'Defers sprays during forecasted rainfall to stop runoff.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15">
            <p className="text-xs font-black text-krishi-300">
              {isTelugu ? '3. అత్యల్ప ఖర్చు (< ₹600)' : '3. Ultra-Low BOM (< ₹600)'}
            </p>
            <p className="text-[11px] text-charcoal-300 mt-1">
              {isTelugu ? 'సాధారణ రైతు కూడా సులభంగా అమర్చుకునే చవకైన డిజైన్.' : 'Accessible to smallholders without expensive gateways.'}
            </p>
          </div>
        </div>
      </div>

      {/* IOT PROGRESSION ROADMAP (NOW -> NEXT -> FUTURE) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-krishi-100 shadow-card space-y-6">
        <div className="flex items-center justify-between border-b border-earth-200 pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-charcoal-900">
              {isTelugu ? 'IoT సాంకేతిక విస్తరణ ప్రణాళిక (Progression Roadmap)' : 'IoT Hardware & Telemetry Roadmap'}
            </h2>
            <p className="text-xs text-charcoal-500 font-medium">
              Realistic, phased hardware progression tailored to smallholder farm economics
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-krishi-100 text-krishi-800">
            Phase 1 Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Phase 1: NOW */}
          <div className="p-5 rounded-2xl bg-krishi-50/70 border-2 border-krishi-600 space-y-2 relative">
            <span className="px-2 py-0.5 rounded bg-krishi-700 text-white text-[10px] font-black uppercase tracking-wider">
              NOW (ప్రస్తుతం)
            </span>
            <h3 className="text-sm font-black text-charcoal-900 pt-1">
              {isTelugu ? 'విజన్ + వాతావరణ API' : 'Vision-First + Virtual Weather'}
            </h3>
            <ul className="text-xs text-charcoal-600 space-y-1.5 font-medium pt-1">
              <li>• Mobile camera foliar image diagnostic</li>
              <li>• Open-Meteo hyper-local weather fusion</li>
              <li>• Telugu voice symptom elicitation</li>
              <li>• Single primary farmer action plan</li>
            </ul>
            <div className="pt-2">
              <span className="text-[11px] font-bold text-krishi-800">Status: LIVE PROTOTYPE ✓</span>
            </div>
          </div>

          {/* Phase 2: NEXT */}
          <div className="p-5 rounded-2xl bg-earth-50 border-2 border-earth-300 space-y-2">
            <span className="px-2 py-0.5 rounded bg-amber-500 text-charcoal-950 text-[10px] font-black uppercase tracking-wider">
              NEXT (రాబోయే దశ)
            </span>
            <h3 className="text-sm font-black text-charcoal-900 pt-1">
              {isTelugu ? 'ESP8266 సోలార్ నోడ్ (< ₹600)' : 'ESP8266 Sub-₹600 Node'}
            </h3>
            <ul className="text-xs text-charcoal-600 space-y-1.5 font-medium pt-1">
              <li>• Capacitive soil moisture sensor v1.2</li>
              <li>• DHT22 ambient canopy temp & humidity</li>
              <li>• Solar TP4056 + 18650 LiFePO4 battery</li>
              <li>• Edge thresholding alert engine</li>
            </ul>
            <div className="pt-2">
              <span className="text-[11px] font-bold text-amber-800">Status: HARDWARE LAB BENCH TEST</span>
            </div>
          </div>

          {/* Phase 3: FUTURE */}
          <div className="p-5 rounded-2xl bg-earth-50 border-2 border-earth-200 space-y-2 opacity-80">
            <span className="px-2 py-0.5 rounded bg-charcoal-600 text-white text-[10px] font-black uppercase tracking-wider">
              FUTURE (భవిష్యత్)
            </span>
            <h3 className="text-sm font-black text-charcoal-900 pt-1">
              {isTelugu ? 'పూర్తి స్మార్ట్ క్షేత్రం' : 'Multi-Spectral & Flow Meter'}
            </h3>
            <ul className="text-xs text-charcoal-600 space-y-1.5 font-medium pt-1">
              <li>• Optical NPK and soil pH probe</li>
              <li>• Spray nozzle flow rate telemetry</li>
              <li>• LoRaWAN long-range mesh network</li>
              <li>• Village-wide community early warning</li>
            </ul>
            <div className="pt-2">
              <span className="text-[11px] font-bold text-charcoal-500">Status: PLANNED FOR FPO CO-OP</span>
            </div>
          </div>

        </div>
      </div>

      {/* ADD NODE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-krishi-100 animate-scale-up">
            <div className="flex items-center justify-between border-b border-earth-200 pb-3">
              <h3 className="text-base font-black text-charcoal-900">
                {isTelugu ? 'కొత్త ESP8266 నోడ్‌ను జతచేయండి' : 'Pair New ESP8266 Node'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddNode} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">
                  {isTelugu ? 'నోడ్ పేరు లేదా స్థానం' : 'Node Label / Location'}
                </label>
                <input 
                  type="text" 
                  value={newNodeName} 
                  onChange={e => setNewNodeName(e.target.value)}
                  placeholder={isTelugu ? 'ఉదా: ఉత్తర పత్తి చేను - నోడ్ 3' : 'e.g., North Cotton Plot - Node 03'}
                  required
                  className="w-full p-2.5 rounded-xl border border-earth-300 font-medium focus:ring-2 focus:ring-krishi-500 outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-earth-50 border border-earth-200 text-[11px] text-charcoal-600 space-y-1">
                <p className="font-bold text-charcoal-800">
                  {isTelugu ? 'కనెక్టివిటీ సూచన:' : 'Pairing Protocol:'}
                </p>
                <p>ESP8266 node broadcasts WiFi SSID <code>KRISHI_NODE_xxxx</code>. Once paired, live telemetry updates every 5 minutes.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-earth-300 text-charcoal-700 font-bold cursor-pointer"
                >
                  {isTelugu ? 'రద్దు' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-krishi-800 text-white font-black shadow-soft hover:bg-krishi-900 cursor-pointer"
                >
                  {isTelugu ? 'జతచేయండి' : 'Pair Node'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
