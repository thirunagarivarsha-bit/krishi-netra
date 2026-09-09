import { 
  AnalysisResult, 
  CropType, 
  CropStage, 
  TimelineEntry, 
  LiveRiskMetrics, 
  AlertNotification,
  ChatMessage,
  CropAnalysisContext,
  ChatRequest,
  ChatResponse,
  ActionItem,
  SprayLogEntry,
  FieldNodeSensor,
  BeforeAfterComparison
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
let useLiveBackend = true;

export const setUseLiveBackend = (val: boolean) => {
  useLiveBackend = val;
};

export const getUseLiveBackend = () => useLiveBackend;

// Mock database of detailed agronomic analysis by crop
export const MOCK_ANALYSIS_COTTON: AnalysisResult = {
  id: 'scan-cotton-001',
  timestamp: new Date().toISOString(),
  crop: 'cotton',
  cropStage: 'flowering',
  healthStatus: 'watch',
  healthStatusTe: 'గమనించాలి',
  healthStatusEn: 'Watch',
  possibleIssueTe: 'పత్తి ఆకు మచ్చల తెగులు (Cotton Leaf Spot / Cercospora)',
  possibleIssueEn: 'Cotton Leaf Spot (Cercospora)',
  diseaseCode: 'COT-DIS-021',
  aiConfidence: 84,
  severityTe: 'మధ్యస్థం',
  severityEn: 'Moderate',
  severityLevel: 'moderate',
  isLowConfidenceFallback: false,
  whyReasons: [
    {
      icon: '🍃',
      titleTe: 'ఆకుపై కనిపించిన లక్షణాలు',
      titleEn: 'Visible Leaf Symptoms',
      detailTe: 'ఆకుల అంచుల వెంబడి గోధుమ రంగు వలయాకార మచ్చలు మరియు మధ్యలో బూడిద రంగు కేంద్రం స్పష్టంగా కనిపిస్తోంది.',
      detailEn: 'Concentric brown circular spots with grayish centers observed primarily on mature foliage.'
    },
    {
      icon: '💧',
      titleTe: 'అధిక తేమ',
      titleEn: 'High Atmospheric Humidity',
      detailTe: 'గడిచిన 48 గంటల్లో గాలిలో తేమ 82% కంటే ఎక్కువగా నమోదైంది. ఇది శిలీంధ్రాల పెరుగుదలకు అత్యంత అనుకూలం.',
      detailEn: 'Relative humidity exceeded 82% across the past 48 hours, accelerating fungal sporulation.'
    },
    {
      icon: '🌧',
      titleTe: 'ఇటీవలి వర్షం',
      titleEn: 'Recent Rainfall & Leaf Wetness',
      detailTe: 'గత 3 రోజుల్లో పడిన వర్షం వల్ల ఆకులు ఎక్కువ సేపు తడిగా ఉన్నాయి.',
      detailEn: 'Persistent leaf surface wetness resulting from 28mm intermittent rainfall 2 days ago.'
    },
    {
      icon: '🌱',
      titleTe: 'పంట దశ',
      titleEn: 'Crop Growth Stage',
      detailTe: 'పత్తి ప్రస్తుతం పూత మరియు పిందె దశలో ఉంది. ఈ సమయంలో ఆకులకు పోషకాలు మరియు రక్షణ చాలా కీలకం.',
      detailEn: 'Crop is in peak flowering/boll formation, where canopy density increases foliar risk.'
    },
    {
      icon: '👨‍🌾',
      titleTe: 'రైతు చెప్పిన లక్షణాలు',
      titleEn: 'Farmer Observations',
      detailTe: 'రైతు తెలిపిన ఆకులపై మచ్చలు మరియు పసుపు రంగు మారడం AI గుర్తించిన లక్షణాలతో సరిగ్గా సరిపోలుతోంది.',
      detailEn: 'Farmer voice and check observations of spot formation and yellowing corroborate AI diagnosis.'
    }
  ],
  evidenceCheck: {
    isOverallMatch: true,
    overallVerdictTe: 'ఆధారాలు సరిపోతున్నాయి ✓',
    overallVerdictEn: 'Evidence aligns coherently ✓',
    items: [
      {
        id: 'ev-1',
        factorTe: 'ఫోటో నాణ్యత & రూపం',
        factorEn: 'Photo & Morphology',
        observationTe: 'ఆకు నమూనా స్పష్టంగా ఉంది',
        observationEn: 'Clear foliar lesion signature',
        status: 'strong',
        statusTe: 'బలంగా ఉంది',
        statusEn: 'Strong',
        weight: 0.92
      },
      {
        id: 'ev-2',
        factorTe: 'వాతావరణ పరిస్థితులు',
        factorEn: 'Weather Context',
        observationTe: 'అధిక తేమ (84%) & ఇటీవలి వర్షం',
        observationEn: 'High humidity (84%) & rainfall',
        status: 'strong',
        statusTe: 'బలంగా ఉంది',
        statusEn: 'Strong',
        weight: 0.88
      },
      {
        id: 'ev-3',
        factorTe: 'పంట దశ అనుకూలత',
        factorEn: 'Crop Stage Compatibility',
        observationTe: 'పూత దశలో తెగులు సాధారణం',
        observationEn: 'Typical susceptibility in flowering',
        status: 'compatible',
        statusTe: 'సరిపోలుతోంది',
        statusEn: 'Compatible',
        weight: 0.85
      },
      {
        id: 'ev-4',
        factorTe: 'రైతు గమనింపులు',
        factorEn: 'Farmer Observation',
        observationTe: 'మచ్చలు & పసుపు రంగు వివరణ',
        observationEn: 'Reports of lesions and yellowing',
        status: 'compatible',
        statusTe: 'సరిపోలుతోంది',
        statusEn: 'Compatible',
        weight: 0.86
      }
    ]
  },
  riskForecast: [
    {
      timeframe: 'now',
      labelTe: 'ఇప్పుడు (Now)',
      labelEn: 'Now',
      riskLevel: 'watch',
      riskScore: 42,
      noteTe: 'ప్రారంభ దశలో ఉంది, అదుపు చేయడం సులభం.',
      noteEn: 'Early stage foliar presence, manageable with prompt hygiene.'
    },
    {
      timeframe: '24h',
      labelTe: '24 గంటలు',
      labelEn: '24 Hours',
      riskLevel: 'watch',
      riskScore: 54,
      noteTe: 'తేమ కొనసాగితే మచ్చల పరిమాణం పెరగవచ్చు.',
      noteEn: 'Humid conditions likely to expand existing lesion halos.'
    },
    {
      timeframe: '48h',
      labelTe: '48 గంటలు',
      labelEn: '48 Hours',
      riskLevel: 'warning',
      riskScore: 68,
      noteTe: 'చర్యలు తీసుకోకపోతే చుట్టుపక్కల ఆకులకు వ్యాపిస్తుంది.',
      noteEn: 'Secondary sporulation risk to adjacent lower leaves without intervention.'
    },
    {
      timeframe: '7d',
      labelTe: '7 రోజులు',
      labelEn: '7 Days',
      riskLevel: 'high',
      riskScore: 82,
      noteTe: 'ఆకులు రాలిపోయి పూత రాలే ప్రమాదం ఉంది.',
      noteEn: 'Substantial defoliation and boll drop risk if left unattended.'
    }
  ],
  whatIf: {
    actNow: {
      titleTe: 'ఇప్పుడు చర్య తీసుకుంటే',
      titleEn: 'If Action Taken Today',
      riskTrend: 'down',
      expectedRiskScore: 18,
      descriptionTe: 'తెగులు సోకిన ఆకులను తీసివేసి, పొలంలో నీటి నిల్వను తగ్గించి సరైన పర్యవేక్షణ చేపడితే తెగులు వెంటనే అదుపులోకి వస్తుంది.',
      descriptionEn: 'Field sanitation, selective leaf pruning, and moisture management arrest fungal spread within 48 hours.',
      outcomeTe: 'ఆశించిన ప్రమాదం తగ్గుతుంది: తెగులు అదుపులోకి వచ్చి పంట రక్షణ మెరుగవుతుంది (AI అంచనా మాత్రమే).',
      outcomeEn: 'Estimated risk decreases: Fungal spread arrested and yield protected (AI advisory estimate).'
    },
    waitAndWatch: {
      titleTe: 'ఏమీ చేయకుండా వేచి ఉంటే',
      titleEn: 'If You Wait & Delay',
      riskTrend: 'up',
      expectedRiskScore: 84,
      descriptionTe: 'వర్షం మరియు రాత్రిపూట మంచు వల్ల శిలీంధ్రం మరింత వేగంగా వ్యాపించి పై భాగాన ఉన్న లేత ఆకులకు కూడా సోకుతుంది.',
      descriptionEn: 'Morning dew and canopy moisture trigger exponential spore dispersion to upper leaves.',
      outcomeTe: 'ఆశించిన ప్రమాదం పెరుగుతుంది: ఆకులు ఎండిపోయి దిగుబడి తగ్గే తీవ్ర అవకాశం ఉంది (AI అంచనా మాత్రమే).',
      outcomeEn: 'Estimated risk increases: Substantial defoliation and yield reduction likely (AI advisory estimate).'
    }
  },
  actionPlan: {
    primaryActionTe: 'పంటను మరోసారి పరిశీలించండి మరియు ప్రభావిత ప్రాంతం పెరుగుతుందా చూడండి. తెగులు సోకిన కొన్ని ఆకులను తొలగించి పొలానికి దూరంగా పారవేయండి.',
    primaryActionEn: 'Inspect the field again to monitor if affected area is growing. Manually remove severely spotted bottom leaves and dispose away from field.',
    checklistTe: [
      'కొత్త ఆకులకు సమస్య వస్తుందా లేదా కేవలం కింద ఆకులకే ఉందా?',
      'ఇతర మొక్కలకు లేదా పక్క వరుసలకు వేగంగా వ్యాపిస్తుందా?',
      'మచ్చల రంగు ముదురు గోధుమ లేదా నలుపు రంగులోకి మారుతుందా?'
    ],
    checklistEn: [
      'Are new top leaves developing spots or is it isolated to bottom foliage?',
      'Is the condition rapidly spreading across rows or neighboring plants?',
      'Are leaf spots changing color to dark brown or black necrosis?'
    ],
    nextCheckTimeTe: '2–3 రోజుల్లో మళ్లీ ఫోటో తీసి KRISHI-NETRA లో పరీక్షించండి.',
    nextCheckTimeEn: 'Re-scan with a fresh photo in 2–3 days to compare condition.',
    safetyAdvisoryTe: 'దయచేసి కారణం లేకుండా అధిక మోతాదులో రసాయన మందులు పిచికారీ చేయకండి. ఆధారాలు మరియు సిఫార్సుల ప్రకారమే నిర్ణయం తీసుకోండి.',
    safetyAdvisoryEn: 'Avoid unverified heavy chemical mixtures. Use certified agronomic guidelines for treatment.'
  },
  teluguVoiceSummary: 'నమస్కారం. మీ పత్తి పంటలో ఆకు మచ్చల తెగులు ప్రారంభ దశలో ఉన్నట్లు AI గుర్తించింది. AI నమ్మకం 84 శాతం. వాతావరణంలో తేమ ఎక్కువగా ఉండడం వల్ల ఈ సమస్య వచ్చింది. మొదటి చర్యగా తెగులు సోకిన ఆకులను తీసివేయండి. రెండు మూడు రోజుల్లో మళ్లీ ఫోటో తీసి పరీక్షించండి.',
  englishVoiceSummary: 'Namaskaram. KRISHI-NETRA identified early Cotton Leaf Spot with 84% confidence. High ambient humidity is driving this condition. As a priority action, remove heavily spotted lower leaves and re-scan in 2 to 3 days to compare trajectory.',
  weatherSnapshot: {
    temperature: 29.4,
    humidity: 84,
    rainfall: 12.5,
    conditionTe: 'తేమతో కూడిన ఆకాశం, స్వల్ప జల్లులు',
    conditionEn: 'Humid, partly cloudy with intermittent drizzle'
  },
  decisionState: 'act_now',
  top3Alternatives: [
    { nameEn: 'Cotton Leaf Spot (Cercospora)', nameTe: 'పత్తి ఆకు మచ్చల తెగులు', confidence: 84, evidence: 'Concentric brown circular spots with grayish center' },
    { nameEn: 'Alternaria Leaf Blight', nameTe: 'ఆల్టర్నేరియా తెగులు', confidence: 11, evidence: 'Irregular brown lesions without pale gray center' },
    { nameEn: 'Bacterial Blight / Angular Spot', nameTe: 'బ్యాక్టీరియల్ మచ్చలు', confidence: 5, evidence: 'Angular lesions delimited by veins' }
  ],
  multiPhotoConsistency: 'high'
};

export const MOCK_ANALYSIS_PADDY: AnalysisResult = {
  ...MOCK_ANALYSIS_COTTON,
  id: 'scan-paddy-002',
  crop: 'paddy',
  cropStage: 'growing',
  possibleIssueTe: 'వరి అగ్గితెగులు (Paddy Blast / Pyricularia oryzae)',
  possibleIssueEn: 'Paddy Blast (Pyricularia oryzae)',
  diseaseCode: 'PAD-BLA-012',
  aiConfidence: 87,
  severityTe: 'మధ్యస్థం',
  severityEn: 'Moderate',
  teluguVoiceSummary: 'మీ వరి పంటలో అగ్గితెగులు లక్షణాలు కనిపించాయి. AI నమ్మకం 87 శాతం. నత్రజని ఎరువుల వాడకాన్ని తగ్గించండి మరియు నీటి నిల్వను సరిగ్గా నిర్వహించండి.',
  englishVoiceSummary: 'Paddy blast symptoms detected with 87% confidence. Regulate standing water and defer additional urea application until resolved.'
};

export const MOCK_ANALYSIS_CHILLI: AnalysisResult = {
  ...MOCK_ANALYSIS_COTTON,
  id: 'scan-chilli-003',
  crop: 'chilli',
  cropStage: 'flowering',
  possibleIssueTe: 'మిర్చి ఆకుముడత తెగులు (Chilli Leaf Curl)',
  possibleIssueEn: 'Chilli Leaf Curl Virus (Gemini virus complex)',
  diseaseCode: 'CHI-LCV-005',
  aiConfidence: 82,
  severityTe: 'తీవ్రత అధికం కావొచ్చు',
  severityEn: 'High susceptibility',
  teluguVoiceSummary: 'మీ మిర్చి పంటలో ఆకుముడత లక్షణాలు గమనించాం. తెల్లదోమ లేదా పేనుబంక వ్యాపింపజేసే అవకాశం ఉంది. సేంద్రీయ వేప ద్రావణం పిచికారీ పరిశీలించండి.',
  englishVoiceSummary: 'Chilli leaf curl symptoms detected with 82% confidence. Vector whitefly control is recommended.'
};

export const MOCK_ANALYSIS_MAIZE: AnalysisResult = {
  ...MOCK_ANALYSIS_COTTON,
  id: 'scan-maize-004',
  crop: 'maize',
  cropStage: 'growing',
  possibleIssueTe: 'మొక్కజొన్న తుప్పు తెగులు (Maize Common Rust)',
  possibleIssueEn: 'Maize Common Rust (Puccinia sorghi)',
  diseaseCode: 'MAI-RST-008',
  aiConfidence: 86,
  severityTe: 'మధ్యస్థం',
  severityEn: 'Moderate',
  teluguVoiceSummary: 'మొక్కజొన్న ఆకులపై తుప్పు తెగులు పొక్కులు గుర్తించబడ్డాయి. AI నమ్మకం 86 శాతం. తేమ తగినట్లుగా ఉండేలా డ్రైనేజీ చూడండి.',
  englishVoiceSummary: 'Maize common rust detected with 86% confidence. Ensure field aeration and drainage.'
};

export const MOCK_ANALYSIS_LOW_CONFIDENCE: AnalysisResult = {
  ...MOCK_ANALYSIS_COTTON,
  id: 'scan-fallback-000',
  healthStatus: 'watch',
  healthStatusTe: 'స్పష్టత లేదు',
  healthStatusEn: 'Inconclusive',
  aiConfidence: 41,
  isLowConfidenceFallback: true,
  possibleIssueTe: 'AIకి స్పష్టమైన ఆధారం లేదు',
  possibleIssueEn: 'Insufficient Clear Evidence',
  evidenceCheck: {
    isOverallMatch: false,
    overallVerdictTe: '⚠ ఆధారాల్లో తేడా ఉంది',
    overallVerdictEn: '⚠ Discrepancy in Evidence',
    conflictWarningTe: 'చిత్రం తగినంత స్పష్టంగా లేదు లేదా లక్షణాలు బహుళ సమస్యలను సూచిస్తున్నాయి. చికిత్సకు ముందు మరోసారి పరిశీలించండి.',
    conflictWarningEn: 'Image lacks high-resolution foliar indicators or symptoms show mixed signals. Re-examine before chemical intervention.',
    items: [
      {
        id: 'ev-1',
        factorTe: 'ఫోటో నాణ్యత',
        factorEn: 'Photo Clarity',
        observationTe: 'మసకగా లేదా వెలుతురు తక్కువగా ఉంది',
        observationEn: 'Low lighting or blur',
        status: 'conflict',
        statusTe: 'తేడా ఉంది',
        statusEn: 'Conflict',
        weight: 0.45
      },
      {
        id: 'ev-2',
        factorTe: 'వాతావరణం',
        factorEn: 'Weather',
        observationTe: 'సాధారణ తేమ',
        observationEn: 'Moderate humidity',
        status: 'neutral',
        statusTe: 'తటస్థం',
        statusEn: 'Neutral',
        weight: 0.5
      }
    ]
  },
  actionPlan: {
    primaryActionTe: 'మంచి వెలుతురులో, ఆకును కెమెరాకు దగ్గరగా ఉంచి మరోసారి స్పష్టమైన ఫోటో తీయండి.',
    primaryActionEn: 'Capture a fresh photo in bright natural lighting with the leaf centered and close.',
    checklistTe: [
      'ఫోటోలో ఆకు నరాలు మరియు మచ్చలు స్పష్టంగా కనిపిస్తున్నాయా?',
      'సూర్యరశ్మి నేరుగా కెమెరా పై పడకుండా చూసుకోండి.',
      'మొక్కపై పురుగులు లేదా రంధ్రాలు ఏమైనా ఉన్నాయా?'
    ],
    checklistEn: [
      'Are leaf veins and lesion margins crisp and sharply focused?',
      'Avoid direct glare or dark shadows.',
      'Check if insects or chewing damage are present underneath leaves.'
    ],
    nextCheckTimeTe: 'వెంటనే మరో ఫోటో తీసి పరీక్షించండి.',
    nextCheckTimeEn: 'Take another photo now for an accurate assessment.',
    safetyAdvisoryTe: 'ఖచ్చితమైన నిర్ధారణ లేకుండా ఎటువంటి మందులు పిచికారీ చేయవద్దు.',
    safetyAdvisoryEn: 'Do not apply chemical sprays without conclusive diagnosis.'
  },
  decisionState: 'verify',
  top3Alternatives: [
    { nameEn: 'Unclear Foliar Anomaly', nameTe: 'అస్పష్టమైన ఆకు లక్షణం', confidence: 41, evidence: 'Blur, glare, or out-of-domain leaf sample' },
    { nameEn: 'Nitrogen / Zinc Deficiency', nameTe: 'పోషక లోపం', confidence: 33, evidence: 'General chlorosis without distinct pathogen margins' },
    { nameEn: 'Early Leaf Spot Candidate', nameTe: 'ప్రారంభ ఆకు మచ్చ', confidence: 26, evidence: 'Faint speckling requiring daylight macro confirmation' }
  ],
  multiPhotoConsistency: 'low',
  teluguVoiceSummary: 'AIకి ఖచ్చితంగా గుర్తించేంత సమాచారం లభించలేదు. దయచేసి మంచి వెలుతురులో ఆకును దగ్గరగా ఉంచి మరో ఫోటో తీయండి.',
  englishVoiceSummary: 'Evidence is currently inconclusive. Please retake a clear photo in daylight for a reliable assessment.'
};

export const MOCK_TIMELINE_HISTORY: TimelineEntry[] = [
  {
    day: 1,
    date: '2026-08-30',
    titleTe: 'మొదటి స్కాన్ (Day 1)',
    titleEn: 'Initial Scan (Day 1)',
    health: 'watch',
    risk: 45,
    condition: 'stable',
    conditionTe: 'నిలకడగా ఉంది',
    conditionEn: 'Stable',
    descriptionTe: 'కొద్దిపాటి మచ్చలు పత్తి ఆకులపై ప్రారంభమైనట్లు గుర్తించబడింది.',
    descriptionEn: 'Early minor spotting recorded on lower canopy foliage.',
    actionTakenTe: 'పొలంలో నిలిచిన నీటిని తీసివేసి నిఘా ఉంచడం జరిగింది.',
    actionTakenEn: 'Drainage furrow opened; moisture logged.'
  },
  {
    day: 4,
    date: '2026-09-02',
    titleTe: 'ప్రమాదం పెరిగింది (Day 4)',
    titleEn: 'Risk Escalation (Day 4)',
    health: 'warning',
    risk: 68,
    condition: 'worsening',
    conditionTe: 'క్షీణిస్తోంది',
    conditionEn: 'Worsening',
    descriptionTe: 'వర్షం పడిన తర్వాత తేమ పెరిగి మచ్చల సంఖ్య విస్తరించింది.',
    descriptionEn: 'Post-rain humidity wave triggered secondary lesions.',
    actionTakenTe: 'రైతుకు KRISHI-NETRA హెచ్చరిక అందింది.',
    actionTakenEn: 'Urgent advisory dispatched to farmer.'
  },
  {
    day: 7,
    date: '2026-09-05',
    titleTe: 'చర్యలు నమోదు (Day 7)',
    titleEn: 'Sanitation Action (Day 7)',
    health: 'watch',
    risk: 42,
    condition: 'improving',
    conditionTe: 'మెరుగుపడుతోంది',
    conditionEn: 'Improving',
    descriptionTe: 'రైతు తెగులు సోకిన ఆకులను ఏరివేసి, సేంద్రీయ వేప పిచికారీ చేశారు.',
    descriptionEn: 'Selective pruning of infected leaves + organic neem solution applied.',
    actionTakenTe: 'నెలకొన్న తేమ నియంత్రణలోకి వచ్చింది.',
    actionTakenEn: 'Canopy aeration restored.'
  },
  {
    day: 10,
    date: '2026-09-08',
    titleTe: 'ప్రమాదం తగ్గింది (Day 10 - నేడు)',
    titleEn: 'Risk Controlled (Day 10 - Today)',
    health: 'healthy',
    risk: 24,
    condition: 'improving',
    conditionTe: 'మెరుగుపడుతోంది',
    conditionEn: 'Improving',
    descriptionTe: 'కొత్తగా వచ్చిన ఆకులు ఆరోగ్యంగా ఉన్నాయి. పూత నిలబడింది.',
    descriptionEn: 'New flush of leaves emerging clean without lesion recurrence.',
    actionTakenTe: 'పంట సాధారణ స్థితికి చేరుకుంది.',
    actionTakenEn: 'Condition stabilized under safe parameters.'
  }
];

export const MOCK_LIVE_RISK: LiveRiskMetrics = {
  overallState: 'watch',
  overallStateTe: 'గమనించాలి (Watch)',
  overallStateEn: 'Watch',
  humidity: 82,
  rainfall: 18.2,
  temperature: 28.6,
  cropStageTe: 'పూత దశ (Flowering)',
  cropStageEn: 'Flowering Stage',
  diseaseSignalTe: 'మధ్యస్థం (Moderate Signal)',
  diseaseSignalEn: 'Moderate Signal',
  lastUpdated: '10 నిమిషాల క్రితం'
};

export const MOCK_ALERTS: AlertNotification[] = [
  {
    id: 'alert-1',
    type: 'risk',
    titleTe: '⚠️ AI నమ్మకంలో వ్యత్యాసం (AI Evidence Mixed)',
    titleEn: '⚠️ AI Evidence Mixed — Verify Before Spraying',
    messageTe: 'ఆకు చిత్రం మచ్చలను సూచిస్తుండగా, గాలిలో తేమ సాధారణంగా ఉంది. మందుల కొనుగోలుకు ముందు రెండో ఫోటోతో నిర్ధారించుకోండి.',
    messageEn: 'Photo shows potential fungal lesions but microclimate humidity is moderate. Confirm with a second angle before purchasing chemicals.',
    timestamp: 'ఈరోజు, ఉదయం 08:30 (Today)',
    urgent: true
  },
  {
    id: 'alert-2',
    type: 'risk',
    titleTe: '💧 నేలలో తేమ తక్కువగా ఉంది (Soil Moisture Low: 42%)',
    titleEn: '💧 Low Soil Moisture (42% < 45% Threshold)',
    messageTe: 'మధ్యాహ్న ఉష్ణోగ్రత 29.4°C ఉన్నప్పుడు నేల తేమ 42% కు పడిపోయింది. సాయంత్రం వేళ తేలికపాటి నీటి తడి ఇవ్వండి.',
    messageEn: 'Soil moisture dropped to 42% under 29.4°C heat. Provide light evening irrigation to alleviate foliar stress.',
    timestamp: 'ఈరోజు, ఉదయం 09:15',
    urgent: true
  },
  {
    id: 'alert-3',
    type: 'weather',
    titleTe: '🌧 రాబోయే 24 గంటల్లో వర్ష సూచన (Rain in 24h)',
    titleEn: '🌧 12.5mm Rainfall Predicted within 24 Hours',
    messageTe: 'రేపు సాయంత్రం జల్లులు కురిసే అవకాశం ఉంది. మందుల పిచికారీని తాత్కాలికంగా వాయిదా వేయండి (మందు కొట్టుకుపోకుండా).',
    messageEn: 'Evening rain anticipated tomorrow. Defer chemical foliar applications to prevent expensive chemical wash-off.',
    timestamp: 'ఈరోజు, ఉదయం 06:00',
    urgent: false
  },
  {
    id: 'alert-4',
    type: 'reminder',
    titleTe: '⏰ 48 గంటల రీ-స్కాన్ సమయం (48-Hour Re-scan Due)',
    titleEn: '⏰ 48-Hour Follow-Up Re-Scan Due',
    messageTe: 'ట్రైకోడెర్మా పిచికారీ చేసి 48 గంటలు గడిచింది. పంట కోలుకుంటుందో లేదో చూడటానికి తాజా ఫోటో తీయండి.',
    messageEn: '48 hours elapsed since bio-fungicide treatment. Capture a fresh photo to compare lesion resolution in My Field.',
    timestamp: 'నిన్న, సాయంత్రం 05:00',
    urgent: false
  },
  {
    id: 'alert-5',
    type: 'risk',
    titleTe: '📡 సెన్సార్ నాణ్యత తనిఖీ (Sensor Telemetry Verified)',
    titleEn: '📡 ESP8266 IoT Node Telemetry Stable',
    messageTe: 'ESP8266-01 నోడ్ ద్వారా EWMA ఫిల్టర్ చేయబడిన డేటా స్థిరంగా అందుతోంది. బ్యాటరీ స్థాయి 92%.',
    messageEn: 'ESP8266 capacitive and DHT22 telemetry is smooth and stable. Zero anomaly detection flags. Battery at 92%.',
    timestamp: 'ఈరోజు, ఉదయం 09:30',
    urgent: false
  },
  {
    id: 'alert-6',
    type: 'reminder',
    titleTe: '🛡️ సురక్షిత మోతాదు హెచ్చరిక (Safe Agronomic Dosage)',
    titleEn: '🛡️ Safe Chemical Dosage Compliance',
    messageTe: 'అధిక మోతాదులో రసాయన మందులను కలపవద్దు. కేవలం ఆమోదించబడిన ICAR/ANGRAU ప్రమాణాలనే పాటించండి.',
    messageEn: 'Never exceed recommended dosage rates. Adhere strictly to verified university/ICAR dilution instructions.',
    timestamp: '2 రోజుల క్రితం',
    urgent: false
  }
];

export const MOCK_ACTIONS: ActionItem[] = [
  {
    id: 'act-01',
    titleTe: 'పత్తి ఆకు మచ్చల నివారణకు కాపర్ ఆక్సీక్లోరైడ్ లేదా ట్రైకోడెర్మా పిచికారీ చేయండి',
    titleEn: 'Apply Copper Oxychloride 50 WP or Trichoderma foliar spray',
    category: 'spray',
    status: 'pending',
    priority: 'urgent',
    dueDateTe: 'నేడు సాయంత్రం 05:00 లోపు',
    dueDateEn: 'Today before 05:00 PM',
    followUpHours: 48,
    descriptionTe: 'పూత దశలో శిలీంధ్ర వ్యాప్తిని అరికట్టడానికి 1 లీటరు నీటికి 3 గ్రాములు కలిపి ఆకుల కింద కూడా తడిచేలా పిచికారీ చేయండి.',
    descriptionEn: 'To arrest fungal sporulation during flowering, mix 3g/L and ensure thorough under-leaf coverage.',
    productRecommendedTe: 'కాపర్ ఆక్సీక్లోరైడ్ 50% WP (లేదా ట్రైకోడెర్మా విరిడే 1%)',
    productRecommendedEn: 'Copper Oxychloride 50% WP (or Trichoderma viride 1%)'
  },
  {
    id: 'act-02',
    titleTe: 'పొలంలో కాలువలు తీసి నిలిచిన అదనపు తేమను తొలగించండి',
    titleEn: 'Clear field furrows to drain excess standing water',
    category: 'irrigation',
    status: 'completed',
    priority: 'recommended',
    dueDateTe: 'నిన్న మధ్యాహ్నం (Yesterday)',
    dueDateEn: 'Yesterday Afternoon',
    followUpHours: 24,
    descriptionTe: 'గాలిలో తేమ 80% దాటినందున నేల ఉపరితలం త్వరగా ఆరిపోయేలా గట్ల వెంబడి నీటిని బయటకు పంపించారు.',
    descriptionEn: 'Field furrows cleared to reduce microclimate humidity surrounding lower crop canopy.'
  },
  {
    id: 'act-03',
    titleTe: '48 గంటల అనంతరం కొత్త ఆకుల ఫాలో-అప్ ఫోటో తీయండి',
    titleEn: 'Capture 48-hour follow-up photo to verify lesion containment',
    category: 'inspection',
    status: 'due',
    priority: 'routine',
    dueDateTe: 'రేపు ఉదయం 08:00',
    dueDateEn: 'Tomorrow 08:00 AM',
    followUpHours: 48,
    descriptionTe: 'మందు పిచికారీ ప్రభావం పరిశీలించడానికి మరియు కొత్తగా వచ్చే ఆకులపై మచ్చలు రాకుండా ఉన్నాయో లేదో నిర్ధారించడానికి రీ-స్కాన్ తప్పనిసరి.',
    descriptionEn: 'Mandatory follow-up verification to confirm foliar disease stabilization.'
  }
];

export const MOCK_SPRAY_LOGS: SprayLogEntry[] = [
  {
    id: 'spray-01',
    date: 'నిన్న ఉదయం 08:30 (Yesterday)',
    productTe: 'ట్రైకోడెర్మా విరిడే 1% WP (జీవ శిలీంధ్ర నాశిని)',
    productEn: 'Trichoderma viride 1% WP (Bio-agent)',
    tankCapacity: '16 లీటర్ల న్యాప్‌సాక్ పంప్ (16L Knapsack)',
    recordedVolume: '40 గ్రాములు / పంపునకు (2.5 g/L)',
    recommendedDose: '2.5 - 3.0 గ్రా / లీటరు',
    targetArea: '0.5 ఎకరం (బ్లాక్ 4 - దక్షిణ భాగం)',
    operator: 'రాము (రైతు)',
    status: 'verified'
  },
  {
    id: 'spray-02',
    date: '5 రోజుల క్రితం (5 days ago)',
    productTe: 'వేపనూనె 1500 PPM (Neem Oil)',
    productEn: 'Neem Oil 1500 PPM Botanical Spray',
    tankCapacity: '16 లీటర్ల న్యాప్‌సాక్ పంప్',
    recordedVolume: '50 మి.లీ / పంపునకు',
    recommendedDose: '3 మి.లీ / లీటరు',
    targetArea: '1.0 ఎకరం (మొత్తం చేను)',
    operator: 'రాము (రైతు)',
    status: 'completed'
  }
];

export const MOCK_SENSORS: FieldNodeSensor[] = [
  {
    id: 'esp8266-node-01',
    name: 'ESP8266-NODE-01 (దక్షిణ పత్తి క్షేత్రం)',
    status: 'online',
    isSimulation: true,
    soilMoisture: 42,
    temperature: 29.4,
    humidity: 68,
    batteryLevel: 92,
    lastSync: '2 నిమిషాల క్రితం (2m ago)',
    rssi: -64
  },
  {
    id: 'esp8266-node-02',
    name: 'ESP8266-NODE-02 (ఉత్తర వరి క్షేత్రం)',
    status: 'online',
    isSimulation: true,
    soilMoisture: 58,
    temperature: 28.2,
    humidity: 74,
    batteryLevel: 87,
    lastSync: '4 నిమిషాల క్రితం (4m ago)',
    rssi: -71
  }
];

export const MOCK_BEFORE_AFTER: BeforeAfterComparison = {
  beforeImage: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80',
  afterImage: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80',
  beforeDate: 'డే 32 (3 రోజుల క్రితం)',
  afterDate: 'డే 35 (నేడు - చికిత్స అనంతరం)',
  beforeLabelTe: 'చికిత్సకు ముందు: తీవ్ర మచ్చలు (78% రిస్క్)',
  beforeLabelEn: 'Before: Active Cercospora Lesions (78% Risk)',
  afterLabelTe: 'చికిత్స తర్వాత: నియంత్రణలోకి వచ్చింది (24% రిస్క్)',
  afterLabelEn: 'After: Arrested Lesions & Green Recovery (24% Risk)',
  status: 'improving',
  changePercent: 54
};


export const generateAgronomicChatResponse = (req: ChatRequest): ChatResponse => {
  const query = req.message.toLowerCase();
  const ctx = req.context;
  const cropLabel = ctx.crop === 'cotton' ? 'పత్తి (Cotton)' : ctx.crop === 'paddy' ? 'వరి (Paddy)' : ctx.crop === 'chilli' ? 'మిర్చి (Chilli)' : 'మొక్కజొన్న (Maize)';
  const disease = ctx.diseaseNameTe || 'ఆకు మచ్చల తెగులు';

  // 1. Rainfall query
  if (query.includes('వర్షం') || query.includes('వాన') || query.includes('rain') || query.includes('నీళ్లు')) {
    return {
      replyTe: `ప్రస్తుతం ${cropLabel} పంటలో ${disease} గుర్తించబడింది. వర్షం వల్ల ఆకులపై తడి ఎక్కువై శిలీంధ్రాలు వేగంగా విస్తరిస్తాయి. వర్షం తగ్గే వరకు ఎలాంటి రసాయన పిచికారీ చేయకండి, మందు కొడితే వర్షపు నీటికి కొట్టుకుపోతుంది. పొలంలో నీరు నిలవకుండా మురుగు కాలువలు వెంటనే శుభ్రం చేయండి.`,
      replyEn: `Cotton leaf spot thrives in persistent wetness. Rain washes away foliar sprays. Do not spray chemicals during rain; ensure field drainage channels are clear to prevent water stagnation.`,
      suggestedFollowUpsTe: ['ఇది ఇతర మొక్కలకు వ్యాపిస్తుందా?', 'వర్షం తగ్గాక ఏమి చేయాలి?', 'మళ్లీ ఎప్పుడు స్కాన్ చేయాలి?'],
      safetyNoteTe: '⚠️ వర్షం తర్వాత మాత్రమే సిఫార్సు చేసిన వేపనూనె లేదా మందులను పిచికారీ చేయండి.'
    };
  }

  // 2. Spread query
  if (query.includes('వ్యాపి') || query.includes('మొక్కల') || query.includes('పక్క') || query.includes('spread') || query.includes('ఇతర')) {
    return {
      replyTe: `అవును, గాలిలోని అధిక తేమ (${ctx.weatherSummaryTe || '80% పైగా'}) మరియు గాలి ద్వారా ఈ శిలీంధ్ర బీజాలు పక్కనున్న ఆరోగ్యకరమైన మొక్కలకు వ్యాపించే అవకాశం ఉంది. వెంటనే తీవ్రంగా తెగులు సోకిన ఆకులను ఏరివేసి పొలానికి దూరంగా పారవేయండి. ఇది తెగులు వ్యాప్తిని 40% వరకు తగ్గిస్తుంది.`,
      replyEn: `Yes, high humidity facilitates airborne fungal spore dispersal to adjacent foliage. Mechanically remove heavily infected leaves and destroy them away from the field perimeter.`,
      suggestedFollowUpsTe: ['మళ్లీ ఎప్పుడు స్కాన్ చేయాలి?', 'నీటి తడి ఎంత ఇవ్వాలి?', 'వర్షం పడితే ఏమి చేయాలి?'],
      safetyNoteTe: '⚠️ తెగులు సోకిన ఆకులను పొలంలోనే ఉంచవద్దు, వెంటనే దూరంగా వేయండి.'
    };
  }

  // 3. Scan timing / Next check query
  if (query.includes('ఎప్పుడు') || query.includes('స్కాన్') || query.includes('scan') || query.includes('మళ్లీ') || query.includes('check') || query.includes('time')) {
    return {
      replyTe: `మీరు సూచించిన జాగ్రత్తలు (సోకిన ఆకులు తీసివేయడం, తేమ తగ్గించడం) చేపట్టిన తర్వాత సరిగ్గా 48 గంటలకు (2 రోజుల తర్వాత) కొత్తగా వచ్చిన ఆకులను మళ్లీ స్కాన్ చేయండి. కొత్త ఆకులపై మచ్చలు రాకపోతే పంట కోలుకుంటున్నట్లే!`,
      replyEn: `Perform a follow-up scan after 48 hours. Inspect newly emerged leaves to confirm whether fungal lesion progression has halted.`,
      suggestedFollowUpsTe: ['వర్షం పడితే ఏమి చేయాలి?', 'నీటి తడి ఎంత ఇవ్వాలి?', 'ఇది ఇతర మొక్కలకు వ్యాపిస్తుందా?'],
      safetyNoteTe: '⚠️ ప్రతి 2 రోజులకు ఒకసారి పరిశీలించడం ద్వారా తీవ్ర నష్టాన్ని నివారించవచ్చు.'
    };
  }

  // 4. Irrigation / Water query
  if (query.includes('నీరు') || query.includes('తడి') || query.includes('water') || query.includes('irrigation') || query.includes('పారించ')) {
    return {
      replyTe: `ప్రస్తుతం నేలలో తగినంత తేమ ఉంది. గాలిలో తేమ ఎక్కువగా ఉన్నప్పుడు అధిక నీరు పెడితే వేరుకు గాలి ఆడక శిలీంధ్రాల దాడి పెరుగుతుంది. రాబోయే 2 రోజులు నీటి తడి ఇవ్వకండి. నేల పైభాగం ఆరిన తర్వాత మాత్రమే తేలికపాటి తడి ఇవ్వండి.`,
      replyEn: `Soil moisture is already adequate. Over-irrigation under high atmospheric humidity exacerbates fungal colonization. Pause irrigation for the next 48 hours.`,
      suggestedFollowUpsTe: ['మళ్లీ ఎప్పుడు స్కాన్ చేయాలి?', 'వర్షం పడితే ఏమి చేయాలి?', 'ఇది ఇతర మొక్కలకు వ్యాపిస్తుందా?'],
      safetyNoteTe: '⚠️ సాయంత్రం వేళల్లో నీరు పెట్టవద్దు, ఉదయం పూట మాత్రమే తేలికపాటి తడి ఇవ్వండి.'
    };
  }

  // 5. Chemical / Spray / Medicine query
  if (query.includes('మందు') || query.includes('పిచికారీ') || query.includes('spray') || query.includes('chemical') || query.includes('పాయిజన్') || query.includes('దవా')) {
    return {
      replyTe: `ప్రారంభ దశలో 5 మి.లీ. వేపనూనె లీటరు నీటిలో కలిపి పిచికారీ చేయడం ఉత్తమం. ఒకవేళ మచ్చలు ఎక్కువగా ఉంటే, మీ స్థానిక వ్యవసాయ విస్తరణ అధికారి (AEO) లేదా కృషి విజ్ఞాన కేంద్రం (KVK) ఆమోదించిన శిలీంధ్ర నాశిని మాత్రమే సిఫార్సు చేసిన పరిమాణంలో వాడండి. ఇష్టానుసారం ఎక్కువ మోతాదు మందులు కలపవద్దు.`,
      replyEn: `For early stages, 5ml/L neem oil organic formulation is recommended. For severe progression, consult your local Agriculture Extension Officer for approved fungicide dosages. Avoid arbitrary over-application.`,
      suggestedFollowUpsTe: ['వర్షం పడితే ఏమి చేయాలి?', 'మళ్లీ ఎప్పుడు స్కాన్ చేయాలి?', 'ఇది ఇతర మొక్కలకు వ్యాపిస్తుందా?'],
      safetyNoteTe: '⚠️ రసాయనాలు వాడేటప్పుడు తప్పనిసరిగా ముఖానికి మాస్క్, చేతి తొడుగులు ధరించండి.'
    };
  }

  // 6. Cause / Reason query
  if (query.includes('ఎందుకు') || query.includes('కారణం') || query.includes('why') || query.includes('cause')) {
    return {
      replyTe: `ఈ తెగులు రావడానికి ప్రధాన కారణం: గాలిలో 82% పైగా తేమ ఉండడం మరియు ఇటీవలి వర్షం వల్ల ఆకులు ఎక్కువ సమయం తడిగా ఉండడం. పత్తి ${ctx.cropStage} దశలో ఆకుల సాంద్రత ఎక్కువగా ఉండడం వల్ల శిలీంధ్రాలకు అనుకూల వాతావరణం ఏర్పడింది.`,
      replyEn: `Primary drivers are high humidity (>82%), persistent leaf wetness from recent precipitation, and dense canopy in flowering stage promoting fungal sporulation.`,
      suggestedFollowUpsTe: ['ఇది ఇతర మొక్కలకు వ్యాపిస్తుందా?', 'వర్షం పడితే ఏమి చేయాలి?', 'మళ్లీ ఎప్పుడు స్కాన్ చేయాలి?'],
      safetyNoteTe: '⚠️ మొక్కల మధ్య గాలి, వెలుతురు ప్రసరించేలా చూడడం ద్వారా ఈ తెగులును నివారించవచ్చు.'
    };
  }

  // Default fallback answer
  return {
    replyTe: `మీ ${cropLabel} పంటలో ${disease} (${ctx.aiConfidence}% ఖచ్చితత్వం) గుర్తించబడింది. ప్రస్తుతానికి తీవ్రత ${ctx.severityLevel === 'moderate' ? 'మధ్యస్థంగా' : 'స్వల్పంగా'} ఉంది. ఆకులపై తేమ నిల్వ ఉండకుండా చూడండి మరియు 48 గంటల తర్వాత మళ్లీ స్కాన్ చేయండి. మీ సందేహాలపై మరింత సమాచారం కోసం క్రింది ప్రశ్నలను ఎంచుకోవచ్చు.`,
    replyEn: `Understood. For ${cropLabel} diagnosed with ${disease} at ${ctx.aiConfidence}% confidence, maintain canopy ventilation and re-scan in 48 hours. Select a prompt below for specific guidance.`,
    suggestedFollowUpsTe: ['వర్షం పడితే ఏమి చేయాలి?', 'ఇది ఇతర మొక్కలకు వ్యాపిస్తుందా?', 'మళ్లీ ఎప్పుడు స్కాన్ చేయాలి?', 'నీటి తడి ఎంత ఇవ్వాలి?'],
    safetyNoteTe: '⚠️ KRISHI-NETRA అధికారిక వ్యవసాయ పరిశోధనా మార్గదర్శకాల ఆధారంగా సమాచారం అందిస్తుంది.'
  };
};

export const apiService = {
  // 1. Analyze image endpoint
  async analyzeCrop(params: {
    crop: CropType;
    stage: CropStage;
    symptoms: string[];
    userNotes?: string;
    imageBase64?: string;
    simulateLowConfidence?: boolean;
  }): Promise<AnalysisResult> {
    if (useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/analyze-image`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('Live backend unavailable, falling back to local engine:', err);
      }
    }

    // Simulated local ML arbitration
    await new Promise(resolve => setTimeout(resolve, 800));

    if (params.simulateLowConfidence) {
      return MOCK_ANALYSIS_LOW_CONFIDENCE;
    }

    if (params.crop === 'paddy') return MOCK_ANALYSIS_PADDY;
    if (params.crop === 'chilli') return MOCK_ANALYSIS_CHILLI;
    if (params.crop === 'maize') return MOCK_ANALYSIS_MAIZE;
    return MOCK_ANALYSIS_COTTON;
  },

  // 2. Risk prediction endpoint
  async getRiskPrediction(crop: CropType) {
    if (useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/risk-prediction?crop=${crop}`);
        if (res.ok) return await res.json();
      } catch {}
    }
    return MOCK_ANALYSIS_COTTON.riskForecast;
  },

  // 3. Evidence check endpoint
  async getEvidenceCheck(scanId: string) {
    if (useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/evidence-check?id=${scanId}`);
        if (res.ok) return await res.json();
      } catch {}
    }
    return MOCK_ANALYSIS_COTTON.evidenceCheck;
  },

  // 4. Recommendation endpoint
  async getRecommendation(crop: CropType, diseaseCode: string) {
    if (useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/recommendation?crop=${crop}&code=${diseaseCode}`);
        if (res.ok) return await res.json();
      } catch {}
    }
    return MOCK_ANALYSIS_COTTON.actionPlan;
  },

  // 5. My Field profile and history
  async getFieldTimeline(): Promise<TimelineEntry[]> {
    if (useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/field`);
        if (res.ok) return await res.json();
      } catch {}
    }
    return MOCK_TIMELINE_HISTORY;
  },

  // 6. Real-time alerts
  async getAlerts(): Promise<AlertNotification[]> {
    if (useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/alerts`);
        if (res.ok) return await res.json();
      } catch {}
    }
    return MOCK_ALERTS;
  },

  // 7. Live Risk metrics
  async getLiveRisk(): Promise<LiveRiskMetrics> {
    if (useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/live-risk`);
        if (res.ok) return await res.json();
      } catch {}
    }
    return MOCK_LIVE_RISK;
  },

  // 8. Agricultural AI Chatbot & Ask Q&A
  async ask(query: string, crop: string = 'paddy', language: string = 'te') {
    if (useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/ask`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: query, crop, language })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Live Ask endpoint offline, falling back to local reasoning:', err);
      }
    }
    const isTe = language.toLowerCase().startsWith('te');
    return {
      intent: 'GENERAL_CROP_QUERY',
      reply: isTe 
        ? 'పంట ఆరోగ్యాన్ని కాపాడటానికి క్రమం తప్పకుండా పరిశీలన అవసరం. ఆకులను 📷 Scan చేయండి.' 
        : 'Regular monitoring is recommended. Tap 📷 Scan Crop to verify foliage condition.',
      replyTe: 'పంట ఆరోగ్యాన్ని కాపాడటానికి క్రమం తప్పకుండా పరిశీలన అవసరం. ఆకులను 📷 Scan చేయండి.',
      replyEn: 'Regular monitoring is recommended. Tap 📷 Scan Crop to verify foliage condition.',
      language: isTe ? 'te-IN' : 'en-IN',
      suggestedFollowUpsTe: ['ఆకులు పసుపుగా మారుతున్నాయా?', 'నీటి తడి ఎప్పుడు పెట్టాలి?'],
      suggestedFollowUpsEn: ['Are leaves turning yellow?', 'When should I irrigate?'],
      safetyNoteTe: '⚠️ అధికారిక వ్యవసాయ పరిశోధనా మార్గదర్శకాలను పాటించండి.',
      safetyNoteEn: '⚠️ Follow official agricultural extension guidelines.',
      audio: { available: false, status: 'offline' },
      audioDebug: {
        inputLanguage: isTe ? 'te-IN' : 'en-IN',
        responseLanguage: isTe ? 'te-IN' : 'en-IN',
        ttsLanguage: isTe ? 'te-IN' : 'en-IN',
        ttsModel: 'gTTS-v2.5 (Local fallback)',
        speaker: isTe ? 'te-IN Standard Farmer Voice' : 'en-IN Extension Agent Voice',
        audioGenerated: false,
        status: 'OFFLINE'
      }
    };
  },

  // 9. Real Server-Side Neural TTS API (gTTS Telugu & English)
  async tts(text: string, language: string = 'te') {
    if (useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/tts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language })
        });
        if (res.ok) return await res.json();
      } catch (err) {
        console.warn('Live TTS endpoint offline:', err);
      }
    }
    return { available: false, error: 'Offline' };
  },

  async sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
    if (useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(req)
        });
        if (res.ok) {
          const data = await res.json();
          return {
            replyTe: data.replyTe || data.reply,
            replyEn: data.replyEn || data.reply,
            suggestedFollowUpsTe: data.suggestedFollowUpsTe || [],
            safetyNoteTe: data.safetyNoteTe || '⚠️ KRISHI-NETRA అధికారిక సిఫార్సులను మాత్రమే అందిస్తుంది.'
          };
        }
      } catch (err) {
        console.warn('Backend chat service offline, using local agronomic engine:', err);
      }
    }
    // Natural fallback
    await new Promise(resolve => setTimeout(resolve, 300));
    return generateAgronomicChatResponse(req);
  },

  // 9. Actions loop
  async getActions(): Promise<ActionItem[]> {
    if (useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/actions`);
        if (res.ok) return await res.json();
      } catch {}
    }
    return MOCK_ACTIONS;
  },

  async recordAction(payload: {
    titleTe: string;
    titleEn: string;
    category?: string;
    productName?: string;
    recordedAmount?: string;
    targetArea?: string;
    operator?: string;
    notes?: string;
  }) {
    if (useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/actions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) return await res.json();
      } catch {}
    }
    return { status: 'recorded_locally' };
  },

  async toggleAction(actionId: string) {
    if (useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/actions/${actionId}/toggle`, { method: 'POST' });
        if (res.ok) return await res.json();
      } catch {}
    }
    return { status: 'toggled_locally' };
  },

  // 10. Spray logs
  async getSprayLogs(): Promise<SprayLogEntry[]> {
    return MOCK_SPRAY_LOGS;
  },

  // 11. IoT Field Node Telemetry
  async getSensors(): Promise<FieldNodeSensor[]> {
    if (useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/sensors`);
        if (res.ok) return await res.json();
      } catch {}
    }
    return MOCK_SENSORS;
  },

  // 12. Longitudinal Before/After Comparison
  async getBeforeAfter(): Promise<BeforeAfterComparison> {
    return MOCK_BEFORE_AFTER;
  },

  // 13. Farmer Ground-Truth Feedback
  async submitFeedback(payload: { scanId: string; accuracyRating: number; wasHelpful?: boolean; farmerComments?: string }) {
    if (useLiveBackend) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) return await res.json();
      } catch {}
    }
    return { status: 'saved_locally' };
  }
};

