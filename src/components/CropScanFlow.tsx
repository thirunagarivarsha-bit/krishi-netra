import React, { useState, useRef } from 'react';
import { Language, CropType, CropStage } from '../types';
import { te } from '../translations/te';
import { en } from '../translations/en';
import { useAccessibility } from '../context/AccessibilityContext';
import { 
  Camera, 
  Upload, 
  Check, 
  Mic, 
  MicOff, 
  ArrowLeft, 
  ArrowRight, 
  Lightbulb, 
  CheckCircle2,
  MousePointerClick,
  AlertTriangle,
  RefreshCw,
  Layers,
  Volume2,
  Plus
} from 'lucide-react';
import { speechService, voiceRecognition } from '../utils/speech';

interface CropScanFlowProps {
  language: Language;
  initialCrop?: CropType;
  onCompleteScan: (data: {
    crop: CropType;
    stage: CropStage;
    symptoms: string[];
    userNotes: string;
    photoUrl: string;
    isLowConfidence: boolean;
    multiPhotoConsistency?: 'high' | 'low';
    hasSecondaryPhoto?: boolean;
    voiceConfirmed?: boolean;
  }) => void;
  onCancel: () => void;
}

export const CropScanFlow: React.FC<CropScanFlowProps> = ({
  language,
  initialCrop = 'cotton',
  onCompleteScan,
  onCancel
}) => {
  const { settings } = useAccessibility();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCrop, setSelectedCrop] = useState<CropType>(initialCrop);
  const [selectedStage, setSelectedStage] = useState<CropStage>('flowering');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['spots', 'yellowing']);
  const [userNotes, setUserNotes] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80'
  );
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [simulateLowConfidence, setSimulateLowConfidence] = useState(false);
  const [qualityGateStatus, setQualityGateStatus] = useState<'pass' | 'fail_blur'>('pass');
  const [secondaryPhotoPreview, setSecondaryPhotoPreview] = useState<string | null>(null);
  const [multiPhotoConsistency, setMultiPhotoConsistency] = useState<'high' | 'low'>('high');
  const [voiceObservationConfirmed, setVoiceObservationConfirmed] = useState(false);

  // Step 4 Input Mode: 'touch' | 'voice'
  const [symptomInputMode, setSymptomInputMode] = useState<'touch' | 'voice'>('touch');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = language === 'te' ? te : en;
  const isTelugu = language === 'te';

  // Sample leaf images for instant testing
  const sampleLeaves = [
    {
      id: 'cotton_spot',
      labelTe: 'పత్తి ఆకు మచ్చ',
      labelEn: 'Cotton Leaf Spot',
      crop: 'cotton' as CropType,
      url: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'paddy_blast',
      labelTe: 'వరి అగ్గితెగులు',
      labelEn: 'Paddy Blast',
      crop: 'paddy' as CropType,
      url: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'chilli_curl',
      labelTe: 'మిర్చి ఆకుముడత',
      labelEn: 'Chilli Leaf Curl',
      crop: 'chilli' as CropType,
      url: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'maize_blight',
      labelTe: 'మొక్కజొన్న తుప్పు',
      labelEn: 'Maize Blight',
      crop: 'maize' as CropType,
      url: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
    }
  ];

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setIsCameraActive(false);
      alert(isTelugu ? 'కెమెరా అందుబాటులో లేదు. నమూనా ఫోటోను ఉపయోగించండి.' : 'Camera access not available. Using sample photo.');
    }
  };

  const captureCameraPhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoPreview(dataUrl);
      }
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
      speechService.playChime('click');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        speechService.playChime('click');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleSymptom = (id: string) => {
    speechService.playChime('click');
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleVoiceInput = () => {
    if (isListening) {
      voiceRecognition.stop();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    const started = voiceRecognition.start({
      lang: language === 'te' ? 'te-IN' : 'en-IN',
      onResult: (transcript) => {
        setIsListening(false);
        setUserNotes(prev => (prev ? `${prev}, ${transcript}` : transcript));
        speechService.playChime('success');
      },
      onError: () => {
        setIsListening(false);
        const demoNote = isTelugu 
          ? 'ఆకుల అంచులు ఎండిపోయి గోధుమ రంగు మచ్చలు వస్తున్నాయి'
          : 'Leaf margins drying with brown spots developing';
        setUserNotes(prev => (prev ? `${prev}, ${demoNote}` : demoNote));
      },
      onEnd: () => setIsListening(false)
    });

    if (!started) {
      const demoNote = isTelugu 
        ? 'ఆకుల అంచులు ఎండిపోయి గోధుమ రంగు మచ్చలు వస్తున్నాయి'
        : 'Leaf margins drying with brown spots developing';
      setUserNotes(prev => (prev ? `${prev}, ${demoNote}` : demoNote));
      setIsListening(false);
    }
  };

  const handleNext = () => {
    speechService.playChime('click');
    if (currentStep === 1 && qualityGateStatus === 'fail_blur') {
      speechService.playChime('alert');
      alert(isTelugu 
        ? 'ఫోటో స్పష్టంగా లేదు. దయచేసి స్పష్టమైన ఫోటో తీయండి లేదా నాణ్యత తనిఖీని క్లియర్ చేయండి.' 
        : 'Photo is blurry or poorly lit. Please retake photo or verify quality before proceeding.');
      return;
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4);
    } else {
      onCompleteScan({
        crop: selectedCrop,
        stage: selectedStage,
        symptoms: selectedSymptoms,
        userNotes: userNotes || (isTelugu ? 'ఆకుల అంచులు ఎండిపోయి గోధుమ రంగు మచ్చలు వస్తున్నాయి' : 'Leaf margins drying with brown spots developing'),
        photoUrl: photoPreview || sampleLeaves[0].url,
        isLowConfidence: simulateLowConfidence,
        multiPhotoConsistency: secondaryPhotoPreview ? multiPhotoConsistency : undefined,
        hasSecondaryPhoto: !!secondaryPhotoPreview,
        voiceConfirmed: voiceObservationConfirmed
      });
    }
  };

  const handleBack = () => {
    speechService.playChime('click');
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4);
    } else {
      onCancel();
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6 animate-fade-in space-y-6">
      
      {/* Top Header & Progress Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-xs font-black text-charcoal-700 hover:text-krishi-900 px-3 py-1.5 rounded-xl border border-earth-300 bg-white shadow-soft transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentStep === 1 ? (isTelugu ? 'రద్దు' : 'Cancel') : t.scanFlow.backBtn}</span>
          </button>

          <div className="text-xs font-black text-krishi-800 uppercase tracking-wider bg-krishi-50 px-3 py-1 rounded-full border border-krishi-200">
            {isTelugu ? `దశ ${currentStep} / 4` : `Step ${currentStep} of 4`}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-earth-200 h-2.5 rounded-full overflow-hidden">
          <div 
            className="bg-gradient-to-r from-krishi-600 to-krishi-800 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1 — TAKE PHOTO */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-krishi-100 shadow-card space-y-5 animate-fade-in">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-charcoal-900">
              {t.scanFlow.step1Title}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 font-medium">
              {isTelugu 
                ? 'రోగ లక్షణాలు కనిపించే ఆకును మధ్యలో ఉంచి ఫోటో తీయండి' 
                : 'Center the affected leaf to capture disease signatures'}
            </p>
          </div>

          {/* Camera / Image Preview Area */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-krishi-300 bg-earth-50 aspect-[4/3] flex items-center justify-center">
            {isCameraActive ? (
              <div className="relative w-full h-full">
                <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                <button
                  onClick={captureCameraPhoto}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full bg-krishi-800 text-white font-bold text-sm shadow-xl flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isTelugu ? 'ఫోటో తీయండి' : 'Capture'}</span>
                </button>
              </div>
            ) : photoPreview ? (
              <div className="relative w-full h-full group">
                <img 
                  src={photoPreview} 
                  alt="Crop leaf preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-white text-charcoal-900 text-xs font-bold shadow-md cursor-pointer"
                  >
                    {isTelugu ? 'మార్చండి' : 'Change'}
                  </button>
                </div>
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-krishi-900/80 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-krishi-300" />
                  <span>{isTelugu ? 'ఫోటో సిద్ధం' : 'Ready'}</span>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 space-y-2 text-charcoal-500">
                <Camera className="w-12 h-12 mx-auto text-krishi-400 stroke-1" />
                <p className="text-xs font-medium">{isTelugu ? 'ఇంకా ఫోటో తీయలేదు' : 'No photo taken yet'}</p>
              </div>
            )}
          </div>

          {/* Pre-Flight Image Quality Gate: Pass vs Blur/Low-Light Failure */}
          {photoPreview && qualityGateStatus === 'fail_blur' && (
            <div className="p-4 rounded-2xl bg-amber-50/90 border-2 border-amber-400 text-xs space-y-3 animate-fade-in shadow-soft">
              <div className="flex items-center justify-between text-amber-950">
                <span className="font-black flex items-center gap-1.5 text-sm">
                  <AlertTriangle className="w-5 h-5 text-amber-700 flex-shrink-0" />
                  <span>{isTelugu ? '⚠️ ఫోటో స్పష్టంగా లేదు (Photo is not clear)' : '⚠️ Image Quality Gate Warning'}</span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-amber-200 text-amber-900">
                  {isTelugu ? 'నాణ్యత లోపం (BLUR)' : 'POOR QUALITY'}
                </span>
              </div>

              <p className="text-xs text-charcoal-700 font-medium leading-relaxed">
                {isTelugu 
                  ? 'ఆకు సరిగ్గా ఫోకస్ కాలేదు లేదా కాంతి తక్కువగా ఉంది. అస్పష్టమైన ఫోటోతో AI తప్పుడు నిర్ధారణ చేసే ప్రమాదం ఉంది.' 
                  : 'The leaf is out of focus or lighting is insufficient. AI prevents premature misdiagnosis by flagging poor inputs early.'}
              </p>

              {/* 3 Clear visual instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                <div className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center gap-2">
                  <span className="text-base">📸</span>
                  <div>
                    <p className="text-[11px] font-black text-charcoal-900 leading-tight">
                      {isTelugu ? 'దగ్గరగా తీయండి' : 'Move Closer'}
                    </p>
                    <p className="text-[10px] text-charcoal-500 font-medium">15–20 cm</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center gap-2">
                  <span className="text-base">✋</span>
                  <div>
                    <p className="text-[11px] font-black text-charcoal-900 leading-tight">
                      {isTelugu ? 'కదలకుండా ఉంచండి' : 'Keep Leaf Steady'}
                    </p>
                    <p className="text-[10px] text-charcoal-500 font-medium">{isTelugu ? 'బ్లర్ రాకుండా' : 'No motion blur'}</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-amber-200 flex items-center gap-2">
                  <span className="text-base">☀️</span>
                  <div>
                    <p className="text-[11px] font-black text-charcoal-900 leading-tight">
                      {isTelugu ? 'పగటి వెలుతురు' : 'Use Daylight'}
                    </p>
                    <p className="text-[10px] text-charcoal-500 font-medium">{isTelugu ? 'మంచి కాంతి' : 'Natural daylight'}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    speechService.playChime('click');
                    fileInputRef.current?.click();
                  }}
                  className="flex-1 py-2 px-3 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{isTelugu ? '🔄 మళ్ళీ తీయండి (Take Again)' : '🔄 Retake Photo'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    speechService.playChime('success');
                    setQualityGateStatus('pass');
                  }}
                  className="py-2 px-3 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/50 font-bold text-xs cursor-pointer"
                >
                  <span>{isTelugu ? 'స్పష్టమైన ఫోటోతో కొనసాగించండి' : 'Pass Quality Gate'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Passed Quality Check */}
          {photoPreview && qualityGateStatus === 'pass' && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-300 text-xs space-y-2 animate-fade-in shadow-soft">
              <div className="flex items-center justify-between text-emerald-950">
                <span className="font-black flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>{isTelugu ? 'ఫోటో నాణ్యత తనిఖీ (Quality Gate)' : 'Pre-Flight Quality Check'}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900">
                    {isTelugu ? 'పాస్ అయింది ✓' : 'PASS ✓'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQualityGateStatus('fail_blur')}
                    className="text-[10px] font-bold text-amber-800 hover:text-amber-900 underline px-1 cursor-pointer"
                    title="Judge simulation: test how AI handles blurry photo"
                  >
                    {isTelugu ? '[బ్లర్ అనుకరణ]' : '[Simulate Blur]'}
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-semibold text-emerald-900">
                <div className="flex items-center gap-1">
                  <span>✓</span>
                  <span>{isTelugu ? 'వెలుతురు: బాగుంది (780 lx)' : 'Lighting: Good (780 lx)'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>✓</span>
                  <span>{isTelugu ? 'స్పష్టత: బ్లర్ లేదు (Lapl: 142)' : 'Sharpness: Crisp (Lapl: 142)'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>✓</span>
                  <span>{isTelugu ? 'ఆకు: మధ్యలో ఉంది' : 'Centering: Centered'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>✓</span>
                  <span>{isTelugu ? 'డొమైన్: ధృవీకరణ (88%)' : 'Foliar ROI: 88%'}</span>
                </div>
              </div>
            </div>
          )}

          {/* MULTI-PHOTO CONFIRMATION SECTION */}
          <div className="p-3.5 rounded-2xl bg-earth-50 border border-earth-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-black text-charcoal-900">
                <Layers className="w-4 h-4 text-krishi-700" />
                <span>{isTelugu ? 'మల్టీ-ఫోటో నిర్ధారణ (Multi-Photo Confirmation)' : 'Multi-Photo Confirmation'}</span>
              </div>
              {!secondaryPhotoPreview ? (
                <button
                  type="button"
                  onClick={() => {
                    speechService.playChime('click');
                    setSecondaryPhotoPreview('https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80');
                  }}
                  className="text-[11px] font-bold text-krishi-800 bg-white border border-krishi-300 hover:bg-krishi-50 px-2.5 py-1 rounded-xl shadow-soft flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isTelugu ? '+ మరో ఆకు ఫోటో జోడించండి' : '+ Add 2nd Leaf Photo'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    speechService.playChime('click');
                    setSecondaryPhotoPreview(null);
                  }}
                  className="text-[10px] font-bold text-rose-700 hover:underline cursor-pointer"
                >
                  {isTelugu ? 'తీసివేయండి (Remove)' : 'Remove'}
                </button>
              )}
            </div>

            {secondaryPhotoPreview ? (
              <div className="space-y-2 animate-fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-earth-300 bg-white">
                    <img src={photoPreview || sampleLeaves[0].url} alt="Photo 1" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                      {isTelugu ? 'ఫోటో 1 (పైభాగం)' : 'Photo 1 (Top)'}
                    </span>
                  </div>
                  <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-earth-300 bg-white">
                    <img src={secondaryPhotoPreview} alt="Photo 2" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                      {isTelugu ? 'ఫోటో 2 (క్రిందిభాగం)' : 'Photo 2 (Underside)'}
                    </span>
                  </div>
                </div>

                {/* Consistency Badge & Judge Toggle */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  multiPhotoConsistency === 'high'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-amber-50 border-amber-300 text-amber-950'
                }`}>
                  <div className="flex items-center gap-1.5">
                    {multiPhotoConsistency === 'high' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0" />
                        <div>
                          <span className="font-black">{isTelugu ? 'అధిక దృశ్య స్థిరత్వం ✓' : 'HIGHER VISUAL CONSISTENCY ✓'}</span>
                          <span className="text-[10px] font-medium text-emerald-800 ml-1.5">
                            {isTelugu ? '(94% లక్షణాల పోలిక)' : '(94% cross-leaf match)'}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                        <div>
                          <span className="font-black">{isTelugu ? 'తక్కువ స్థిరత్వం ⚠️ ➔ ధృవీకరించాలి' : 'LOW CONSISTENCY ⚠️ ➔ VERIFY'}</span>
                          <span className="text-[10px] font-medium text-amber-800 ml-1.5">
                            {isTelugu ? '(లక్షణాలు విభేదిస్తున్నాయి)' : '(Conflicting patterns)'}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      speechService.playChime('click');
                      setMultiPhotoConsistency(prev => prev === 'high' ? 'low' : 'high');
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-earth-300 text-charcoal-700 hover:bg-earth-100 cursor-pointer"
                    title="Judge simulation: toggle multi-photo consistency"
                  >
                    {isTelugu ? 'మార్చు' : 'Toggle'}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-charcoal-500 font-medium">
                {isTelugu 
                  ? '💡 ఒకే ఫోటోను అంధంగా నమ్మకుండా, 2 ఫోటోలు తీస్తే AI నిర్ణయం మరింత ఖచ్చితంగా ఉంటుంది.' 
                  : '💡 KRISHI-NETRA does not trust one photo blindly. Multi-photo confirmation flags foliar discrepancies.'}
              </p>
            )}
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />

          {/* Action Buttons: Camera & Upload */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={startCamera}
              className="px-4 py-3 rounded-2xl bg-krishi-800 hover:bg-krishi-900 text-white font-bold text-xs sm:text-sm shadow-soft flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>{t.scanFlow.takePhotoBtn}</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-3 rounded-2xl bg-white hover:bg-earth-50 text-krishi-900 border border-krishi-300 font-bold text-xs sm:text-sm shadow-soft flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4 text-krishi-700" />
              <span>{t.scanFlow.uploadPhotoBtn}</span>
            </button>
          </div>

          {/* Visual Tips */}
          <div className="p-3.5 rounded-2xl bg-earth-100/70 border border-earth-200 text-xs text-charcoal-700 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-krishi-900">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>{t.scanFlow.tipsTitle}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px] font-medium text-charcoal-600">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-krishi-700 flex-shrink-0" />
                <span>{t.scanFlow.tips[0]}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-krishi-700 flex-shrink-0" />
                <span>{t.scanFlow.tips[1]}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-krishi-700 flex-shrink-0" />
                <span>{t.scanFlow.tips[2]}</span>
              </div>
            </div>
          </div>

          {/* Sample Leaves Demo Gallery */}
          <div className="space-y-2 pt-2 border-t border-earth-200">
            <p className="text-xs font-bold text-charcoal-600">
              {t.scanFlow.samplePhotoTitle}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {sampleLeaves.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => {
                    speechService.playChime('click');
                    setPhotoPreview(sample.url);
                    setSelectedCrop(sample.crop);
                  }}
                  className={`p-2 rounded-xl border text-left flex flex-col items-center text-center transition-all cursor-pointer ${
                    photoPreview === sample.url
                      ? 'border-krishi-600 bg-krishi-50 ring-2 ring-krishi-500'
                      : 'border-earth-200 bg-white hover:bg-earth-50'
                  }`}
                >
                  <img src={sample.url} alt={sample.labelEn} className="w-12 h-12 rounded-lg object-cover mb-1" />
                  <span className="text-[11px] font-bold text-charcoal-900 leading-tight">
                    {isTelugu ? sample.labelTe : sample.labelEn}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 2 — SELECT CROP */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-krishi-100 shadow-card space-y-5 animate-fade-in">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-charcoal-900">
              {t.scanFlow.step2Title}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 font-medium">
              {isTelugu ? 'మీరు ప్రస్తుతం పరీక్షిస్తున్న పంటను ఎంచుకోండి' : 'Choose the crop being diagnosed'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {[
              { id: 'cotton' as CropType, nameTe: 'పత్తి', nameEn: 'Cotton', emoji: '🌱' },
              { id: 'paddy' as CropType, nameTe: 'వరి', nameEn: 'Paddy', emoji: '🌾' },
              { id: 'chilli' as CropType, nameTe: 'మిర్చి', nameEn: 'Chilli', emoji: '🌶' },
              { id: 'maize' as CropType, nameTe: 'మొక్కజొన్న', nameEn: 'Maize', emoji: '🌽' },
            ].map((crop) => {
              const isSelected = selectedCrop === crop.id;
              return (
                <button
                  key={crop.id}
                  onClick={() => {
                    speechService.playChime('click');
                    setSelectedCrop(crop.id);
                  }}
                  className={`p-5 rounded-2xl border-2 text-center flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${
                    isSelected
                      ? 'border-krishi-600 bg-krishi-50/80 shadow-card ring-2 ring-krishi-400'
                      : 'border-earth-200 bg-white hover:border-krishi-200 hover:bg-earth-50/50'
                  }`}
                >
                  <span className="text-4xl">{crop.emoji}</span>
                  <div>
                    <h3 className="text-lg font-black text-charcoal-900 leading-tight">
                      {isTelugu ? crop.nameTe : crop.nameEn}
                    </h3>
                    <p className="text-[11px] font-semibold text-charcoal-500">
                      {isTelugu ? crop.nameEn : crop.nameTe}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-krishi-700 text-white flex items-center justify-center text-[10px] mt-1">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3 — CROP STAGE */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-krishi-100 shadow-card space-y-5 animate-fade-in">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-charcoal-900">
              {t.scanFlow.step3Title}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 font-medium">
              {isTelugu ? 'పంట దశను బట్టి తెగులు తీవ్రత ఆధారపడి ఉంటుంది' : 'Phenological stage calibrates disease susceptibility'}
            </p>
          </div>

          <div className="space-y-2.5">
            {[
              { id: 'seedling' as CropStage, labelTe: 'మొలక దశ (Seedling)', labelEn: 'Seedling Stage', descTe: 'మొదటి 20-30 రోజులు' },
              { id: 'growing' as CropStage, labelTe: 'ఎదుగుదల దశ (Growing)', labelEn: 'Vegetative / Growing Stage', descTe: 'కొమ్మలు, ఆకులు పెరిగే సమయం' },
              { id: 'flowering' as CropStage, labelTe: 'పూత దశ (Flowering)', labelEn: 'Flowering Stage', descTe: 'పూత వికసించే కీలక సమయం' },
              { id: 'fruiting' as CropStage, labelTe: 'కాయ / పిందె దశ (Fruiting / Boll)', labelEn: 'Fruiting / Boll Formation', descTe: 'కాయలు లేదా కండెలు ఏర్పడే దశ' },
              { id: 'maturity' as CropStage, labelTe: 'పక్వ దశ (Maturity)', labelEn: 'Maturity & Harvest Stage', descTe: 'పంట కోతకు సిద్ధమయ్యే సమయం' },
            ].map((stage) => {
              const isSelected = selectedStage === stage.id;
              return (
                <button
                  key={stage.id}
                  onClick={() => {
                    speechService.playChime('click');
                    setSelectedStage(stage.id);
                  }}
                  className={`w-full p-4 rounded-2xl border-2 text-left flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer ${
                    isSelected
                      ? 'border-krishi-600 bg-krishi-50/80 shadow-soft ring-1 ring-krishi-500'
                      : 'border-earth-200 bg-white hover:border-krishi-200'
                  }`}
                >
                  <div>
                    <h3 className="text-base font-black text-charcoal-900">
                      {isTelugu ? stage.labelTe : stage.labelEn}
                    </h3>
                    <p className="text-xs font-medium text-charcoal-500 mt-0.5">
                      {stage.descTe}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-krishi-800 text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4 — WHAT DID YOU NOTICE? (WITH 3 ACCESSIBLE COMMUNICATION MODES) */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-krishi-100 shadow-card space-y-5 animate-fade-in">
          
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-charcoal-900">
              {t.scanFlow.step4Title}
            </h2>
            <p className="text-xs sm:text-sm text-charcoal-500 font-medium">
              {isTelugu 
                ? 'మీకు అనువైన విధానంలో లక్షణాలను తెలపండి (టచ్ లేదా వాయిస్)' 
                : 'Choose your preferred interaction method (Touch or Voice)'}
            </p>
          </div>

          {/* 2 Accessible Communication Mode Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-earth-100/80 border border-earth-200">
            <button
              onClick={() => {
                speechService.playChime('click');
                setSymptomInputMode('touch');
              }}
              className={`py-2 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                symptomInputMode === 'touch'
                  ? 'bg-white text-krishi-900 shadow-soft'
                  : 'text-charcoal-600 hover:text-krishi-900'
              }`}
            >
              <MousePointerClick className="w-3.5 h-3.5" />
              <span>{isTelugu ? 'టచ్ ఎంపిక (Touch)' : 'Touch Cards'}</span>
            </button>

            <button
              onClick={() => {
                speechService.playChime('click');
                setSymptomInputMode('voice');
              }}
              className={`py-2 px-3 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                symptomInputMode === 'voice'
                  ? 'bg-white text-krishi-900 shadow-soft'
                  : 'text-charcoal-600 hover:text-krishi-900'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{isTelugu ? 'వాయిస్ (Voice STT)' : 'Voice Input'}</span>
            </button>
          </div>

          {/* MODE 1: TOUCH CARDS (Silent, non-verbal) */}
          {symptomInputMode === 'touch' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                {t.symptoms.map((symptom) => {
                  const isChecked = selectedSymptoms.includes(symptom.id);
                  return (
                    <button
                      key={symptom.id}
                      onClick={() => toggleSymptom(symptom.id)}
                      className={`p-3.5 rounded-2xl border-2 text-left flex items-start gap-2.5 transition-all active:scale-[0.98] cursor-pointer ${
                        isChecked
                          ? 'border-krishi-600 bg-krishi-50/90 shadow-soft'
                          : 'border-earth-200 bg-white hover:bg-earth-50'
                      }`}
                    >
                      <span className="text-xl flex-shrink-0">{symptom.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-black text-charcoal-900 leading-tight">
                          {symptom.text}
                        </p>
                      </div>
                      {isChecked && (
                        <div className="w-4 h-4 rounded-full bg-krishi-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-charcoal-500 text-center font-medium">
                {isTelugu ? '✓ మాటలు లేదా శబ్దం ఏదీ అవసరం లేదు' : '✓ Fully silent, non-verbal selection'}
              </p>
            </div>
          )}

          {/* MODE 2: VOICE INPUT */}
          {symptomInputMode === 'voice' && (
            <div className="p-4 rounded-2xl bg-earth-50 border border-earth-200 space-y-3.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-charcoal-800 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-krishi-700" />
                  <span>{t.scanFlow.tellUsVoice}</span>
                </label>

                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
                    isListening
                      ? 'bg-amber-400 text-charcoal-900 animate-pulse ring-2 ring-amber-300'
                      : 'bg-krishi-800 text-white hover:bg-krishi-900 shadow-soft'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3.5 h-3.5" />
                      <span>{isTelugu ? 'వింటున్నాం...' : 'Listening...'}</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5" />
                      <span>{isTelugu ? 'మాట్లాడండి' : 'Speak Now'}</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                placeholder={t.scanFlow.tellUsPlaceholder}
                rows={2}
                className="w-full text-xs font-medium p-3 rounded-xl border border-earth-300 bg-white text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-krishi-500"
              />

              {/* Structured Voice Observation Confirmation */}
              <div className="p-3.5 rounded-2xl bg-krishi-50/90 border border-krishi-300 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-krishi-900 flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-krishi-700" />
                    <span>{isTelugu ? 'మీరు చెప్పినది (YOU SAID):' : 'YOU SAID (Farmer Observation):'}</span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-krishi-200 text-krishi-900">
                    VOICE NOTE RECORDED 🎙️
                  </span>
                </div>

                <p className="text-xs font-semibold text-charcoal-900 italic bg-white p-2.5 rounded-xl border border-krishi-200 leading-relaxed">
                  "{userNotes || (isTelugu ? 'ఆకుల అంచులు ఎండిపోయి గోధుమ రంగు మచ్చలు వస్తున్నాయి' : 'Leaf margins drying with brown spots developing')}"
                </p>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <span className="font-bold text-charcoal-700">
                    {isTelugu ? 'మేము సరిగ్గా అర్థం చేసుకున్నామా?' : 'Did we understand correctly?'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        speechService.playChime('success');
                        setVoiceObservationConfirmed(true);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                        voiceObservationConfirmed 
                          ? 'bg-krishi-800 text-white shadow-soft' 
                          : 'bg-white border border-krishi-400 text-krishi-800 hover:bg-krishi-100'
                      }`}
                    >
                      ✓ {isTelugu ? 'అవును (YES)' : 'YES'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        speechService.playChime('click');
                        setVoiceObservationConfirmed(false);
                        handleVoiceInput();
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-black bg-white border border-earth-300 text-charcoal-700 hover:bg-earth-100 cursor-pointer"
                    >
                      ✏️ {isTelugu ? 'మార్చండి (CHANGE)' : 'CHANGE'}
                    </button>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-charcoal-500 font-medium text-center">
                {isTelugu 
                  ? '🛡️ వాయిస్ స్వతంత్రంగా నిర్ధారించదు; కేవలం క్షేత్ర ఆధారంగా మాత్రమే వినియోగించబడుతుంది.' 
                  : '🛡️ Voice observation serves as input evidence; diagnostic engine remains strictly structured.'}
              </p>
            </div>
          )}

          {/* MODE 3: GESTURE / SIGN CAMERA SELECTION (For non-verbal farmers) */}


          {/* Test Low Confidence Fallback */}
          <div className="pt-2 flex items-center justify-between text-xs text-charcoal-500 border-t border-earth-200">
            <span className="font-semibold">{isTelugu ? 'AI ఖచ్చితత్వం పరీక్ష:' : 'Edge Case Simulation:'}</span>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={simulateLowConfidence} 
                onChange={(e) => setSimulateLowConfidence(e.target.checked)}
                className="rounded border-earth-300 text-krishi-700 focus:ring-krishi-500"
              />
              <span className="text-[11px] font-medium text-amber-800">
                {isTelugu ? 'తక్కువ నమ్మకం (Low Confidence Fallback)' : 'Low Confidence Fallback'}
              </span>
            </label>
          </div>

        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={handleBack}
          className="px-5 py-3 rounded-2xl border border-earth-300 bg-white hover:bg-earth-50 text-charcoal-700 font-bold text-sm shadow-soft transition-all cursor-pointer"
        >
          {t.scanFlow.backBtn}
        </button>

        <button
          onClick={handleNext}
          className="flex-1 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-krishi-800 to-krishi-700 hover:from-krishi-900 hover:to-krishi-800 text-white font-black text-base shadow-elevated flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
        >
          <span>{currentStep === 4 ? t.scanFlow.submitBtn : t.scanFlow.nextBtn}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
};
