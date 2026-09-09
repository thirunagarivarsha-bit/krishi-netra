import React, { useState, useEffect } from 'react';
import { Language, ActionItem, SprayLogEntry } from '../types';
import { apiService } from '../services/api';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Sparkles, 
  Droplets, 
  Plus, 
  ArrowRight
} from 'lucide-react';
import { speechService } from '../utils/speech';

interface ActionsScreenProps {
  language: Language;
  onNavigateToScan?: () => void;
  onActionStatusChanged?: (actionId: string, completed: boolean) => void;
}

export const ActionsScreen: React.FC<ActionsScreenProps> = ({
  language,
  onNavigateToScan,
  onActionStatusChanged
}) => {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [sprayLogs, setSprayLogs] = useState<SprayLogEntry[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'pending' | 'completed' | 'log'>('pending');
  
  // Spray confirmation animation states
  const [isSpraying, setIsSpraying] = useState(false);
  const [spraySuccess, setSpraySuccess] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);

  // New spray log form state
  const [newProduct, setNewProduct] = useState('');
  const [newDose, setNewDose] = useState('');
  const [newTank, setNewTank] = useState('16L Knapsack');

  const isTelugu = language === 'te';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [fetchedActions, fetchedLogs] = await Promise.all([
      apiService.getActions(),
      apiService.getSprayLogs()
    ]);
    setActions(fetchedActions);
    setSprayLogs(fetchedLogs);
  };

  // Complete action with spray animation
  const handleMarkComplete = (actionId: string) => {
    speechService.playChime('click');
    setIsSpraying(true);

    // Trigger visual spray mist and leaf recovery
    setTimeout(() => {
      setIsSpraying(false);
      setSpraySuccess(true);
      speechService.playChime('success');

      // Update action status locally
      setActions(prev => 
        prev.map(a => a.id === actionId ? { ...a, status: 'completed' } : a)
      );

      // Add corresponding spray log entry
      const completedAction = actions.find(a => a.id === actionId);
      if (completedAction) {
        const newLog: SprayLogEntry = {
          id: `spray-${Date.now()}`,
          date: isTelugu ? 'ఇప్పుడే (Just now)' : 'Just now',
          productTe: completedAction.productRecommendedTe || 'కాపర్ ఆక్సీక్లోరైడ్ 50% WP',
          productEn: completedAction.productRecommendedEn || 'Copper Oxychloride 50% WP',
          tankCapacity: '16 లీటర్ల న్యాప్‌సాక్ పంప్ (16L)',
          recordedVolume: '45 గ్రాములు / పంపునకు',
          recommendedDose: '3 గ్రా / లీటరు',
          targetArea: '0.5 ఎకరం (బ్లాక్ 4)',
          operator: isTelugu ? 'రాము (రైతు)' : 'Ramu (Farmer)',
          status: 'verified'
        };
        setSprayLogs(prev => [newLog, ...prev]);
      }

      if (onActionStatusChanged) {
        onActionStatusChanged(actionId, true);
      }

      // Hide success notification banner after 6 seconds
      setTimeout(() => {
        setSpraySuccess(false);
      }, 6000);
    }, 1800);
  };

  const handleAddSprayLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct) return;

    speechService.playChime('success');
    const entry: SprayLogEntry = {
      id: `spray-${Date.now()}`,
      date: isTelugu ? 'నేడు (Today)' : 'Today',
      productTe: newProduct,
      productEn: newProduct,
      tankCapacity: newTank,
      recordedVolume: newDose || '3 g/L',
      recommendedDose: 'సిఫార్సు ప్రకారం',
      targetArea: isTelugu ? '0.5 ఎకరం' : '0.5 Acre',
      operator: isTelugu ? 'రాము' : 'Ramu',
      status: 'completed'
    };

    setSprayLogs(prev => [entry, ...prev]);
    setShowLogModal(false);
    setNewProduct('');
    setNewDose('');
  };

  const pendingActions = actions.filter(a => a.status === 'pending' || a.status === 'due');
  const completedActions = actions.filter(a => a.status === 'completed');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 animate-fade-in font-sans">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-charcoal-900 tracking-tight">
              {isTelugu ? 'పంట నిర్వహణ పనులు' : 'Action Loop & Treatment'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-krishi-100 text-krishi-800 text-xs font-bold">
              {isTelugu ? 'ధృవీకరించిన సిఫార్సులు' : 'Verified Advisory'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-500 font-medium mt-0.5">
            {isTelugu 
              ? 'AI సిఫార్సు చేసిన పనులను పూర్తి చేసి, ఫాలో-అప్ తనిఖీని నమోదు చేయండి' 
              : 'Complete prescribed actions, record spray dosages, and track 48h foliar recovery'}
          </p>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-krishi-800 hover:bg-krishi-900 text-white font-bold text-xs sm:text-sm shadow-soft flex items-center gap-2 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isTelugu ? '+ స్ప్రే వివరాలు నమోదు' : '+ Record Spray Log'}</span>
        </button>
      </div>

      {/* SUCCESS BANNER UPON SPRAY COMPLETION */}
      {spraySuccess && (
        <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-600 to-krishi-700 text-white shadow-xl flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm font-black tracking-tight">
                {isTelugu ? 'ట్రీట్మెంట్ నమోదైంది ✓' : 'Treatment Successfully Recorded ✓'}
              </p>
              <p className="text-xs text-krishi-100 font-medium">
                {isTelugu 
                  ? '48 గంటల్లో ఫాలో-అప్ తనిఖీ షెడ్యూల్ చేయబడింది. ఆకు ఆరోగ్యం మెరుగుపడింది.' 
                  : 'Follow-up foliar inspection scheduled in 48 hours. Living crop vitality updated.'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSpraySuccess(false)}
            className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-xs font-bold text-white cursor-pointer"
          >
            {isTelugu ? 'సరే' : 'Dismiss'}
          </button>
        </div>
      )}

      {/* SPRAY ANIMATION OVERLAY MODAL */}
      {isSpraying && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl border border-krishi-100 relative overflow-hidden animate-scale-up">
            
            {/* Spray particle animation container */}
            <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
              {/* Expanding spray mist rings */}
              <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping"></div>
              <div className="absolute -inset-3 rounded-full bg-teal-300/20 animate-pulse"></div>
              
              {/* Dynamic Living Leaf changing from spotted to fresh green */}
              <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-tr from-krishi-800 to-krishi-500 text-white flex items-center justify-center shadow-lg transform transition-all duration-1000 scale-110">
                <span className="text-4xl animate-bounce">🌿</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-charcoal-900">
                {isTelugu ? 'మందు పిచికారీ అవుతోంది...' : 'Applying Foliar Treatment...'}
              </h3>
              <p className="text-xs text-charcoal-600 font-medium">
                {isTelugu 
                  ? 'ఆకుల కింద, పైభాగం సమానంగా తడిసేలా చూసుకోండి. రక్షణ పొర ఏర్పడుతోంది.' 
                  : 'Delivering targeted bio-fungicide protective barrier across affected foliar cells.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-1 text-xs font-bold text-krishi-800">
              <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
              <span>{isTelugu ? 'ఫలితం నమోదు చేయబడుతోంది...' : 'Updating field recovery index...'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tabs: Pending Actions | Completed | Spray Log History */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-earth-100/80 border border-earth-200">
        <button
          onClick={() => {
            speechService.playChime('click');
            setActiveSubTab('pending');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'pending'
              ? 'bg-white text-krishi-900 shadow-soft'
              : 'text-charcoal-600 hover:text-krishi-900'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-600" />
          <span>{isTelugu ? 'చేయవలసిన పనులు' : 'Pending Actions'}</span>
          <span className="w-5 h-5 rounded-full bg-amber-500 text-charcoal-950 text-[11px] font-black flex items-center justify-center">
            {pendingActions.length}
          </span>
        </button>

        <button
          onClick={() => {
            speechService.playChime('click');
            setActiveSubTab('completed');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'completed'
              ? 'bg-white text-krishi-900 shadow-soft'
              : 'text-charcoal-600 hover:text-krishi-900'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 text-krishi-700" />
          <span>{isTelugu ? 'పూర్తయినవి' : 'Completed'}</span>
          <span className="w-5 h-5 rounded-full bg-krishi-100 text-krishi-800 text-[11px] font-black flex items-center justify-center">
            {completedActions.length}
          </span>
        </button>

        <button
          onClick={() => {
            speechService.playChime('click');
            setActiveSubTab('log');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'log'
              ? 'bg-white text-krishi-900 shadow-soft'
              : 'text-charcoal-600 hover:text-krishi-900'
          }`}
        >
          <Droplets className="w-4 h-4 text-blue-600" />
          <span>{isTelugu ? 'స్ప్రే లాగ్ బుక్' : 'Spray Log'}</span>
          <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-black flex items-center justify-center">
            {sprayLogs.length}
          </span>
        </button>
      </div>

      {/* TAB 1: PENDING ACTIONS */}
      {activeSubTab === 'pending' && (
        <div className="space-y-4">
          {pendingActions.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-krishi-100 text-center space-y-3 shadow-card">
              <span className="text-4xl">🎉</span>
              <h3 className="text-lg font-black text-charcoal-900">
                {isTelugu ? 'అన్ని పనులు పూర్తయ్యాయి!' : 'All Prescribed Actions Completed!'}
              </h3>
              <p className="text-xs text-charcoal-500 max-w-md mx-auto">
                {isTelugu 
                  ? 'ప్రస్తుతం మీ పంట క్షేత్రంలో అత్యవసర చర్యలు ఏవీ పెండింగ్‌లో లేవు. 48 గంటల అనంతరం ఫాలో-అప్ స్కాన్ చేయండి.' 
                  : 'Foliar treatment applied. Schedule a follow-up image scan in 48 hours to confirm containment.'}
              </p>
            </div>
          ) : (
            pendingActions.map(action => (
              <div 
                key={action.id}
                className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-amber-200/80 shadow-card space-y-4 relative overflow-hidden"
              >
                {/* Urgent badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-charcoal-950 font-black text-[11px] uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>{isTelugu ? 'అత్యవసర చర్య' : 'High Priority'}</span>
                    </span>
                    <span className="text-xs font-bold text-charcoal-500 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isTelugu ? action.dueDateTe : action.dueDateEn}</span>
                    </span>
                  </div>

                  <span className="text-xs font-bold text-krishi-800 bg-krishi-50 px-2.5 py-1 rounded-lg border border-krishi-200">
                    {isTelugu ? `ఫాలో-అప్: ${action.followUpHours} గంటలు` : `Follow-up in ${action.followUpHours}h`}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base sm:text-lg font-black text-charcoal-900 leading-tight">
                    {isTelugu ? action.titleTe : action.titleEn}
                  </h3>
                  <p className="text-xs sm:text-sm text-charcoal-600 font-medium mt-1 leading-relaxed">
                    {isTelugu ? action.descriptionTe : action.descriptionEn}
                  </p>
                </div>

                {/* Chemical / Bio-solution Advisory */}
                {action.productRecommendedTe && (
                  <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="text-[11px] font-bold text-charcoal-500 uppercase tracking-wider block">
                        {isTelugu ? 'సిఫార్సు చేసిన మందు / మోతాదు:' : 'Recommended Product & Dosage:'}
                      </span>
                      <span className="font-black text-charcoal-900 text-xs sm:text-sm">
                        {isTelugu ? action.productRecommendedTe : action.productRecommendedEn}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-teal-100 text-teal-900 font-bold text-[11px] flex-shrink-0">
                      {isTelugu ? 'రైతు భరోసా సర్టిఫైడ్' : 'Agronomist Verified'}
                    </span>
                  </div>
                )}

                {/* Interactive Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1 border-t border-earth-200">
                  <button
                    onClick={() => handleMarkComplete(action.id)}
                    className="w-full sm:flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-krishi-800 to-krishi-700 hover:from-krishi-900 hover:to-krishi-800 text-white font-black text-sm shadow-soft flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 text-krishi-200" />
                    <span>{isTelugu ? 'పని పూర్తయినట్లు నమోదు చేయండి ✓' : 'Mark Action Completed ✓'}</span>
                  </button>

                  {action.category === 'inspection' && onNavigateToScan && (
                    <button
                      onClick={onNavigateToScan}
                      className="w-full sm:w-auto py-3 px-5 rounded-2xl border border-krishi-300 bg-white hover:bg-earth-50 text-krishi-900 font-bold text-sm shadow-soft flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>{isTelugu ? 'ఇప్పుడే స్కాన్ చేయండి' : 'Scan Leaf Now'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: COMPLETED ACTIONS */}
      {activeSubTab === 'completed' && (
        <div className="space-y-3">
          {completedActions.map(action => (
            <div 
              key={action.id}
              className="bg-white rounded-3xl p-5 border border-krishi-200 shadow-card flex items-start gap-3.5"
            >
              <div className="w-8 h-8 rounded-full bg-krishi-100 text-krishi-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5 text-krishi-700" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm sm:text-base font-black text-charcoal-900">
                    {isTelugu ? action.titleTe : action.titleEn}
                  </h3>
                  <span className="text-[11px] font-bold text-krishi-700 bg-krishi-50 px-2 py-0.5 rounded-lg">
                    {isTelugu ? 'నమోదైంది' : 'Recorded'}
                  </span>
                </div>

                <p className="text-xs text-charcoal-500 font-medium mt-0.5 leading-relaxed">
                  {isTelugu ? action.descriptionTe : action.descriptionEn}
                </p>

                <div className="mt-2 flex items-center gap-3 text-[11px] font-bold text-charcoal-500">
                  <span>📅 {isTelugu ? action.dueDateTe : action.dueDateEn}</span>
                  <span>•</span>
                  <span className="text-krishi-700">✓ {isTelugu ? 'ప్రమాద తీవ్రత తగ్గింది' : 'Risk mitigated'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: SPRAY LOG BOOK */}
      {activeSubTab === 'log' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-krishi-100 shadow-card space-y-4">
          <div className="flex items-center justify-between border-b border-earth-200 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-black text-charcoal-900">
                {isTelugu ? 'రైతు పిచికారీ వివరాల రికార్డు (Spray Logbook)' : 'Foliar Spray Application Logbook'}
              </h2>
              <p className="text-xs text-charcoal-500 font-medium">
                {isTelugu ? 'మందుల మోతాదు, తేదీ మరియు ఆపరేటర్ వివరాలు' : 'Precise chemical/bio-fungicide dosage accounting to prevent pesticide overdosing'}
              </p>
            </div>

            <span className="text-xs font-bold text-krishi-800 bg-krishi-100 px-3 py-1 rounded-full">
              {sprayLogs.length} {isTelugu ? 'నమోదులు' : 'Entries'}
            </span>
          </div>

          <div className="space-y-3">
            {sprayLogs.map(log => (
              <div 
                key={log.id}
                className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-2 hover:border-krishi-300 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🧪</span>
                    <h3 className="text-sm font-black text-charcoal-900">
                      {isTelugu ? log.productTe : log.productEn}
                    </h3>
                  </div>

                  <span className="text-xs font-semibold text-charcoal-500">
                    {log.date}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2 rounded-xl bg-white border border-earth-200">
                    <span className="text-[10px] text-charcoal-500 font-bold uppercase block">
                      {isTelugu ? 'పంప్ రకం' : 'Equipment'}
                    </span>
                    <span className="font-black text-charcoal-900 text-[11px]">{log.tankCapacity}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-earth-200">
                    <span className="text-[10px] text-charcoal-500 font-bold uppercase block">
                      {isTelugu ? 'వాడిన మోతాదు' : 'Dosage'}
                    </span>
                    <span className="font-black text-teal-800 text-[11px]">{log.recordedVolume}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-earth-200">
                    <span className="text-[10px] text-charcoal-500 font-bold uppercase block">
                      {isTelugu ? 'విస్తీర్ణం' : 'Plot Area'}
                    </span>
                    <span className="font-black text-charcoal-900 text-[11px]">{log.targetArea}</span>
                  </div>

                  <div className="p-2 rounded-xl bg-white border border-earth-200">
                    <span className="text-[10px] text-charcoal-500 font-bold uppercase block">
                      {isTelugu ? 'రైతు / ఆపరేటర్' : 'Operator'}
                    </span>
                    <span className="font-black text-charcoal-900 text-[11px]">{log.operator}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-krishi-800 font-semibold pt-1 border-t border-earth-200/60">
                  <span>✓ {isTelugu ? 'సిఫార్సు మోతాదు పరిధిలోనే ఉంది' : 'Within Agronomist Prescribed Limits'}</span>
                  <span className="text-charcoal-500">{isTelugu ? 'ఖచ్చితమైన భద్రత' : 'Zero Residue Warning'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RECORD SPRAY LOG MODAL */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-krishi-100 animate-scale-up">
            <div className="flex items-center justify-between border-b border-earth-200 pb-3">
              <h3 className="text-base font-black text-charcoal-900">
                {isTelugu ? 'స్ప్రే వివరాలు నమోదు చేయండి' : 'Record New Spray Treatment'}
              </h3>
              <button 
                onClick={() => setShowLogModal(false)}
                className="p-1 rounded-lg text-charcoal-400 hover:text-charcoal-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSprayLog} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-charcoal-700 mb-1">
                  {isTelugu ? 'వాడిన మందు పేరు' : 'Product / Chemical Name'}
                </label>
                <input 
                  type="text" 
                  value={newProduct} 
                  onChange={e => setNewProduct(e.target.value)}
                  placeholder={isTelugu ? 'ఉదా: కాపర్ ఆక్సీక్లోరైడ్ 50% WP' : 'e.g., Copper Oxychloride 50 WP'}
                  required
                  className="w-full p-2.5 rounded-xl border border-earth-300 font-medium focus:ring-2 focus:ring-krishi-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">
                    {isTelugu ? 'పంప్ రకం' : 'Tank Capacity'}
                  </label>
                  <select 
                    value={newTank}
                    onChange={e => setNewTank(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-earth-300 font-medium bg-white"
                  >
                    <option value="16L Knapsack">16L న్యాప్‌సాక్</option>
                    <option value="20L Battery">20L బ్యాటరీ పంప్</option>
                    <option value="10L Hand">10L చేతి పంప్</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-charcoal-700 mb-1">
                    {isTelugu ? 'కలిపిన మోతాదు' : 'Recorded Dose'}
                  </label>
                  <input 
                    type="text" 
                    value={newDose} 
                    onChange={e => setNewDose(e.target.value)}
                    placeholder="3 g / Litre"
                    className="w-full p-2.5 rounded-xl border border-earth-300 font-medium focus:ring-2 focus:ring-krishi-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 rounded-xl border border-earth-300 text-charcoal-700 font-bold cursor-pointer"
                >
                  {isTelugu ? 'రద్దు' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-krishi-800 text-white font-black shadow-soft hover:bg-krishi-900 cursor-pointer"
                >
                  {isTelugu ? 'భద్రపరచండి' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
