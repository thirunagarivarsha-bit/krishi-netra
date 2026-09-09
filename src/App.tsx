import React, { useState, useEffect } from 'react';
import { Language, ActiveTab, CropType, CropStage, AnalysisResult } from './types';
import { AccessibilityProvider, useAccessibility } from './context/AccessibilityContext';
import { apiService, MOCK_ANALYSIS_COTTON } from './services/api';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { OnboardingModal } from './components/OnboardingModal';
import { HomeScreen } from './components/HomeScreen';
import { CropScanFlow } from './components/CropScanFlow';
import { AIAnalysisScreen } from './components/AIAnalysisScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { AccessibilityScreen } from './components/AccessibilityScreen';
import { AlertsScreen } from './components/AlertsScreen';
import { MyCropsScreen } from './components/MyCropsScreen';
import { ActionsScreen } from './components/ActionsScreen';
import { FieldScreen } from './components/FieldScreen';
import { AskScreen } from './components/AskScreen';
import { MyFieldScreen } from './components/MyFieldScreen';
import { FeasibilityScreen } from './components/FeasibilityScreen';
import { TechnicalView } from './components/TechnicalView';
import { DemoController } from './components/DemoController';
import { speechService } from './utils/speech';

function MainAppContent() {
  const { settings, setLanguage, toggleSetting } = useAccessibility();
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Scan lifecycle: 'input' -> 'analyzing' -> 'results'
  const [scanState, setScanState] = useState<'idle' | 'input' | 'analyzing' | 'results'>('idle');
  const [scanCrop, setScanCrop] = useState<CropType>('cotton');
  const [scanPhotoUrl, setScanPhotoUrl] = useState<string>(
    'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80'
  );
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(MOCK_ANALYSIS_COTTON);

  // Global action status tracking for living crop health visual
  const [isActionCompleted, setIsActionCompleted] = useState(false);

  // Demo mode state for hackathon judges
  const [isDemoActive, setIsDemoActive] = useState(false);

  // Check if first visit in localStorage (default show on first load)
  useEffect(() => {
    const visited = localStorage.getItem('krishi_netra_visited');
    if (!visited) {
      setShowOnboarding(true);
      localStorage.setItem('krishi_netra_visited', 'true');
    }
  }, []);

  const handleToggleAudioMute = () => {
    toggleSetting('voiceEnabled');
    if (settings.voiceEnabled) {
      speechService.stop();
    }
  };

  // Start Crop Scan Flow from anywhere
  const handleStartScan = (crop: CropType = 'cotton') => {
    setScanCrop(crop);
    setScanState('input');
    setActiveTab('scan');
  };

  // Crop Scan Flow completed -> Start live progressive analysis
  const handleCompleteScanInput = async (data: {
    crop: CropType;
    stage: CropStage;
    symptoms: string[];
    userNotes: string;
    photoUrl: string;
    isLowConfidence: boolean;
  }) => {
    setScanCrop(data.crop);
    setScanPhotoUrl(data.photoUrl);
    setScanState('analyzing');

    // Run backend / local ML arbitration in parallel
    try {
      const result = await apiService.analyzeCrop({
        crop: data.crop,
        stage: data.stage,
        symptoms: data.symptoms,
        userNotes: data.userNotes,
        imageBase64: data.photoUrl,
        simulateLowConfidence: data.isLowConfidence
      });
      setAnalysisResult(result);
    } catch {
      setAnalysisResult(MOCK_ANALYSIS_COTTON);
    }
  };

  // 7-step analysis animation finished -> display Results
  const handleAnalysisFinished = () => {
    setScanState('results');
    speechService.playChime('success');
  };

  // Demo step driver for hackathon presentation
  const handleExecuteDemoStep = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        // 1. Home Dashboard with Today's Priority
        setActiveTab('home');
        setScanState('idle');
        break;
      case 2:
        // 2. Scan: Image Quality Check & Presets
        setActiveTab('scan');
        setScanCrop('cotton');
        setScanState('input');
        break;
      case 3:
        // 3. Progressive Multimodal Fusion
        setActiveTab('scan');
        setScanState('analyzing');
        break;
      case 4:
      case 5:
      case 6:
        // 4, 5, 6. Diagnostic Results, Evidence Arbitration & What-If
        setActiveTab('scan');
        setScanState('results');
        setAnalysisResult(MOCK_ANALYSIS_COTTON);
        break;
      case 7:
        // 7. Action Loop & Treatment Spray Animation
        setActiveTab('actions');
        setScanState('idle');
        break;
      case 8:
        // 8. Ask: Voice, Notes & Gesture Mode
        setActiveTab('ask');
        setScanState('idle');
        break;
      case 9:
        // 9. My Field: Sensors, Vitality & Slider
        setActiveTab('field');
        setScanState('idle');
        break;
      case 10:
        // 10. Judge Technical Lab & Feasibility
        setActiveTab('technical');
        setScanState('idle');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-earth-50 text-charcoal-900 font-sans selection:bg-krishi-200 selection:text-krishi-900 pb-20 md:pb-6">
      
      {/* Sticky Top Navbar */}
      <Navbar
        language={settings.language}
        onLanguageChange={(lang) => setLanguage(lang)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'scan' && scanState === 'idle') {
            setScanState('input');
          }
        }}
        onOpenOnboarding={() => setShowOnboarding(true)}
        onStartDemo={() => {
          setIsDemoActive(true);
          handleExecuteDemoStep(1);
        }}
        isAudioMuted={!settings.voiceEnabled}
        onToggleAudioMute={handleToggleAudioMute}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto pb-6">
        
        {/* AREA 1: HOME */}
        {activeTab === 'home' && (
          <HomeScreen
            language={settings.language}
            onStartScan={(crop) => handleStartScan(crop || 'cotton')}
            onViewField={() => setActiveTab('field')}
            onOpenHowToUse={() => setShowOnboarding(true)}
            onNavigateToActions={() => setActiveTab('field')}
            onNavigateToAsk={() => setActiveTab('ask')}
            onNavigateToAlerts={() => setActiveTab('alerts')}
            isActionCompleted={isActionCompleted}
            onToggleActionCompleted={() => setIsActionCompleted(prev => !prev)}
          />
        )}

        {/* AREA 2: CROP SCAN & DIAGNOSIS FLOW */}
        {activeTab === 'scan' && (
          <>
            {scanState === 'input' && (
              <CropScanFlow
                language={settings.language}
                initialCrop={scanCrop}
                onCompleteScan={handleCompleteScanInput}
                onCancel={() => {
                  setScanState('idle');
                  setActiveTab('home');
                }}
              />
            )}

            {scanState === 'analyzing' && (
              <AIAnalysisScreen
                language={settings.language}
                crop={scanCrop}
                photoUrl={scanPhotoUrl}
                onAnalysisFinished={handleAnalysisFinished}
              />
            )}

            {scanState === 'results' && (
              <ResultsScreen
                language={settings.language}
                result={analysisResult}
                onScanAgain={() => {
                  setScanState('input');
                }}
                onSaveToField={() => {
                  setTimeout(() => {
                    setActiveTab('field');
                    setScanState('idle');
                  }, 800);
                }}
                onViewIntelligence={() => setActiveTab('technical')}
                onNavigateToActions={() => setActiveTab('field')}
              />
            )}
          </>
        )}

        {/* AREA 3: ASK (Voice, Telugu, Audio Notes & Gesture Mode) */}
        {activeTab === 'ask' && (
          <AskScreen
            language={settings.language}
            onNavigateToScan={() => handleStartScan('cotton')}
          />
        )}

        {/* AREA 4: MY FIELD (Consolidated Hub: Vitality, Sensors, Spray Log, Timeline & Before/After) */}
        {(activeTab === 'field' || activeTab === 'crops' || activeTab === 'actions') && (
          <MyFieldScreen
            language={settings.language}
            initialTab={activeTab === 'actions' ? 'actions' : activeTab === 'crops' ? 'timeline' : 'vitality'}
            onScanAgain={() => handleStartScan('cotton')}
            onNavigateToScan={() => handleStartScan('cotton')}
            onActionStatusChanged={(_id, completed) => {
              if (completed) setIsActionCompleted(true);
            }}
          />
        )}

        {/* AREA 5: ALERTS & REAL-TIME RISK MONITOR */}
        {activeTab === 'alerts' && (
          <AlertsScreen
            language={settings.language}
            onNavigateToScan={() => handleStartScan('cotton')}
          />
        )}

        {/* TAB 7: DEDICATED ACCESSIBILITY SCREEN */}
        {activeTab === 'accessibility' && (
          <AccessibilityScreen
            language={settings.language}
            onNavigateToScan={() => handleStartScan('cotton')}
          />
        )}

        {/* TAB 8: JUDGE LAB & TECHNICAL ARCHITECTURE */}
        {(activeTab === 'technical' || activeTab === 'insights') && (
          <TechnicalView language={settings.language} />
        )}

        {/* TAB 9: ECONOMIC FEASIBILITY & AFFORDABILITY */}
        {activeTab === 'feasibility' && (
          <FeasibilityScreen language={settings.language} />
        )}

      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab === 'scan' && scanState === 'idle') {
            setScanState('input');
          }
        }}
        language={settings.language}
      />

      {/* First-Screen / How-To-Use Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        language={settings.language}
        onStartCropCheck={() => handleStartScan('cotton')}
      />

      {/* Hackathon Judge Demo Controller */}
      <DemoController
        language={settings.language}
        isActive={isDemoActive}
        onClose={() => setIsDemoActive(false)}
        onExecuteDemoStep={handleExecuteDemoStep}
      />

    </div>
  );
}

export function App() {
  return (
    <AccessibilityProvider>
      <MainAppContent />
    </AccessibilityProvider>
  );
}

export default App;
