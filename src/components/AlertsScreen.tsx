import React, { useState, useEffect } from 'react';
import { Language, AlertNotification, LiveRiskMetrics } from '../types';
import { te } from '../translations/te';
import { en } from '../translations/en';
import { apiService } from '../services/api';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  Droplets, 
  CloudRain, 
  Thermometer, 
  Layers, 
  Activity, 
  RefreshCw,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { speechService } from '../utils/speech';

interface AlertsScreenProps {
  language: Language;
  onNavigateToScan: () => void;
}

export const AlertsScreen: React.FC<AlertsScreenProps> = ({
  language,
  onNavigateToScan
}) => {
  const [alerts, setAlerts] = useState<AlertNotification[]>([]);
  const [liveRisk, setLiveRisk] = useState<LiveRiskMetrics | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const t = language === 'te' ? te : en;
  const isTelugu = language === 'te';

  const loadData = async () => {
    setIsRefreshing(true);
    const [fetchedAlerts, fetchedLiveRisk] = await Promise.all([
      apiService.getAlerts(),
      apiService.getLiveRisk()
    ]);
    setAlerts(fetchedAlerts);
    setLiveRisk(fetchedLiveRisk);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleManualRefresh = () => {
    speechService.playChime('click');
    loadData();
  };

  const riskStatusBadge = {
    stable: { bg: 'bg-krishi-100 text-krishi-900 border-krishi-300', dot: 'bg-krishi-600', labelTe: 'నిలకడగా ఉంది (Stable)', labelEn: 'Stable' },
    watch: { bg: 'bg-amber-100 text-amber-900 border-amber-300', dot: 'bg-amber-500', labelTe: 'గమనించాలి (Watch)', labelEn: 'Watch' },
    warning: { bg: 'bg-orange-100 text-orange-900 border-orange-300', dot: 'bg-orange-600', labelTe: 'హెచ్చరిక (Warning)', labelEn: 'Warning' },
    critical: { bg: 'bg-red-100 text-red-900 border-red-300', dot: 'bg-red-600', labelTe: 'ప్రమాదకరం (Critical)', labelEn: 'Critical' }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight">
              {t.alerts.title}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 font-medium mt-0.5">
            {t.alerts.subtitle}
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="p-2.5 rounded-xl border border-earth-300 bg-white hover:bg-earth-50 text-charcoal-700 shadow-soft transition-colors"
          title="Refresh real-time data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-krishi-700' : ''}`} />
        </button>
      </div>

      {/* SECTION 16: REAL-TIME RISK MONITOR (Live Crop Risk) */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-krishi-100 shadow-card space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-earth-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
              <h2 className="text-lg sm:text-xl font-black text-charcoal-900">
                {t.alerts.liveRiskTitle}
              </h2>
            </div>
            <p className="text-xs text-charcoal-500 font-medium mt-0.5">
              {isTelugu ? 'ప్రాంతీయ వాతావరణం & పంట దశ విశ్లేషణ' : 'Dynamic multi-sensor agro-climatic signals'}
            </p>
          </div>

          {/* Current State Badge */}
          {liveRisk && (
            <div className={`px-4 py-2 rounded-2xl border-2 flex items-center gap-2 ${riskStatusBadge[liveRisk.overallState].bg}`}>
              <span className={`w-3 h-3 rounded-full ${riskStatusBadge[liveRisk.overallState].dot} animate-pulse`}></span>
              <span className="text-sm font-black">
                {isTelugu ? riskStatusBadge[liveRisk.overallState].labelTe : riskStatusBadge[liveRisk.overallState].labelEn}
              </span>
            </div>
          )}
        </div>

        {/* 4 Status Indicator Spectrum */}
        <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-bold">
          <div className="p-2 rounded-xl bg-krishi-50 border border-krishi-200 text-krishi-900">
            🟢 {isTelugu ? 'నిలకడ' : 'Stable'}
          </div>
          <div className="p-2 rounded-xl bg-amber-100/80 border-2 border-amber-400 text-amber-900 font-black shadow-soft">
            🟡 {isTelugu ? 'గమనించాలి' : 'Watch'}
          </div>
          <div className="p-2 rounded-xl bg-orange-50 border border-orange-200 text-orange-900">
            🟠 {isTelugu ? 'హెచ్చరిక' : 'Warning'}
          </div>
          <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-red-900">
            🔴 {isTelugu ? 'ప్రమాదకరం' : 'Critical'}
          </div>
        </div>

        {/* Live Metrics Grid */}
        {liveRisk && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            
            <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-500">
                <Droplets className="w-4 h-4 text-blue-600" />
                <span>{t.alerts.humidity}</span>
              </div>
              <p className="text-lg font-black text-charcoal-900 mt-1">
                {liveRisk.humidity}%
              </p>
              <span className="text-[10px] text-amber-700 font-bold">శిలీంధ్ర తెగుళ్ళకు అనుకూలం</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-500">
                <CloudRain className="w-4 h-4 text-teal-600" />
                <span>{t.alerts.rainfall}</span>
              </div>
              <p className="text-lg font-black text-charcoal-900 mt-1">
                {liveRisk.rainfall} mm
              </p>
              <span className="text-[10px] text-charcoal-500 font-medium">ఇటీవలి 48 గంటలు</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-500">
                <Thermometer className="w-4 h-4 text-amber-600" />
                <span>{t.alerts.temperature}</span>
              </div>
              <p className="text-lg font-black text-charcoal-900 mt-1">
                {liveRisk.temperature}°C
              </p>
              <span className="text-[10px] text-charcoal-500 font-medium">సగటు పగటి ఉష్ణోగ్రత</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-500">
                <Layers className="w-4 h-4 text-krishi-700" />
                <span>{t.alerts.cropStage}</span>
              </div>
              <p className="text-sm font-black text-charcoal-900 mt-1">
                {isTelugu ? liveRisk.cropStageTe : liveRisk.cropStageEn}
              </p>
              <span className="text-[10px] text-charcoal-500 font-medium">సున్నితమైన సమయం</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-500">
                <Activity className="w-4 h-4 text-purple-600" />
                <span>{t.alerts.diseaseSignal}</span>
              </div>
              <p className="text-sm font-black text-charcoal-900 mt-1">
                {isTelugu ? liveRisk.diseaseSignalTe : liveRisk.diseaseSignalEn}
              </p>
              <span className="text-[10px] text-amber-700 font-bold">మచ్చల ప్రారంభ సూచన</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-charcoal-500">
                <Clock className="w-4 h-4 text-charcoal-500" />
                <span>{t.alerts.lastUpdated}</span>
              </div>
              <p className="text-sm font-bold text-charcoal-800 mt-1">
                {liveRisk.lastUpdated}
              </p>
              <span className="text-[10px] text-krishi-700 font-semibold">ఆటోమేటిక్ రిఫ్రెష్</span>
            </div>

          </div>
        )}
      </div>

      {/* SECTION 17: ALERTS LIST (పంట హెచ్చరికలు) */}
      <div className="space-y-3">
        <h2 className="text-lg font-black text-charcoal-900 flex items-center gap-2">
          <Bell className="w-5 h-5 text-krishi-800" />
          <span>{isTelugu ? 'రైతు అత్యవసర నోటిఫికేషన్లు' : 'Actionable Advisories'}</span>
        </h2>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div 
              key={alert.id}
              className={`bg-white rounded-3xl p-5 border shadow-card space-y-2.5 transition-all ${
                alert.urgent ? 'border-l-4 border-l-amber-500 border-amber-200' : 'border-krishi-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm sm:text-base font-black text-charcoal-900 leading-tight flex items-center gap-1.5">
                  <span>{isTelugu ? alert.titleTe : alert.titleEn}</span>
                </h3>
                <span className="text-[10px] font-semibold text-charcoal-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{alert.timestamp}</span>
                </span>
              </div>

              <p className="text-xs sm:text-sm font-medium text-charcoal-700 leading-relaxed">
                {isTelugu ? alert.messageTe : alert.messageEn}
              </p>

              <div className="pt-1 flex items-center justify-between">
                <button
                  onClick={onNavigateToScan}
                  className="px-4 py-2 rounded-xl bg-krishi-800 hover:bg-krishi-900 text-white font-bold text-xs shadow-soft active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {alert.id === 'alert-1' && <span>📷 {isTelugu ? 'రెండో ఫోటో తీయండి' : 'Verify with 2nd Photo'}</span>}
                  {alert.id === 'alert-2' && <span>💧 {isTelugu ? 'తడిని తనిఖీ చేయండి' : 'Check Irrigation'}</span>}
                  {alert.id === 'alert-3' && <span>🌧️ {isTelugu ? 'పిచికారీని వాయిదా వేయండి' : 'Acknowledge Deferral'}</span>}
                  {alert.id === 'alert-4' && <span>⏰ {isTelugu ? 'ఇప్పుడే రీ-స్కాన్ చేయండి' : 'Re-scan Crop Now'}</span>}
                  {alert.id === 'alert-5' && <span>📡 {isTelugu ? 'నోడ్ స్థితి చూడండి' : 'View Node Telemetry'}</span>}
                  {alert.id === 'alert-6' && <span>🛡️ {isTelugu ? 'మార్గదర్శకాలు చూడండి' : 'View ICAR Advisory'}</span>}
                </button>
                <span className="text-[10px] text-charcoal-500 font-semibold">
                  {alert.urgent ? (isTelugu ? 'అత్యవసరం' : 'Urgent') : (isTelugu ? 'సమాచారం' : 'Advisory')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
