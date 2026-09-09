export type Language = 'te' | 'en';

export type ActiveTab = 
  | 'home' 
  | 'scan' 
  | 'ask'
  | 'field' 
  | 'alerts' 
  | 'crops' 
  | 'actions' 
  | 'judge' 
  | 'technical'
  | 'feasibility'
  | 'insights'
  | 'accessibility';

export type DecisionState = 'act_now' | 'monitor' | 'verify';

export interface VoiceNote {
  id: string;
  transcriptTe: string;
  transcriptEn: string;
  recordedAt: string;
  durationSeconds: number;
}

export interface FarmerFeedback {
  helpful?: 'yes' | 'no' | 'not_sure';
  observationCorrect?: 'yes' | 'no' | 'not_sure';
  timestamp: string;
}

export interface MultiPhotoItem {
  id: string;
  url: string;
  labelTe: string;
  labelEn: string;
  predictionTe: string;
  predictionEn: string;
  isConsistent: boolean;
}

export type CropType = 'cotton' | 'paddy' | 'chilli' | 'maize';

export type CropStage = 'seedling' | 'growing' | 'flowering' | 'fruiting' | 'maturity';

export interface ActionItem {
  id: string;
  titleTe: string;
  titleEn: string;
  category: 'spray' | 'inspection' | 'irrigation' | 'fertilizer';
  status: 'pending' | 'completed' | 'due';
  priority: 'urgent' | 'recommended' | 'routine';
  dueDateTe: string;
  dueDateEn: string;
  followUpHours: number;
  descriptionTe: string;
  descriptionEn: string;
  productRecommendedTe?: string;
  productRecommendedEn?: string;
}

export interface SprayLogEntry {
  id: string;
  date: string;
  productTe: string;
  productEn: string;
  tankCapacity: string;
  recordedVolume: string;
  recommendedDose: string;
  targetArea: string;
  operator: string;
  status: 'completed' | 'verified';
}

export interface FieldNodeSensor {
  id: string;
  name: string;
  status: 'online' | 'offline';
  isSimulation: boolean;
  soilMoisture: number; // percentage
  temperature: number; // Celsius
  humidity: number; // percentage
  batteryLevel: number; // percentage
  lastSync: string;
  rssi: number; // dBm
}

export interface BeforeAfterComparison {
  beforeImage: string;
  afterImage: string;
  beforeDate: string;
  afterDate: string;
  beforeLabelTe: string;
  beforeLabelEn: string;
  afterLabelTe: string;
  afterLabelEn: string;
  status: 'improving' | 'stable' | 'resolved';
  changePercent: number;
}

export interface AccessibilitySettings {
  largeText: boolean;
  highContrast: boolean;
  voiceEnabled: boolean;
  subtitlesEnabled: boolean;
  language: Language;
}

export interface CropOption {
  id: CropType;
  teluguName: string;
  englishName: string;
  icon: string;
  descriptionTe: string;
  descriptionEn: string;
  image: string;
}

export interface SymptomOption {
  id: string;
  teluguText: string;
  englishText: string;
  icon: string;
  color: string;
  category: 'leaf' | 'pest' | 'growth' | 'water';
}

export type HealthStatus = 'healthy' | 'watch' | 'warning' | 'critical';

export interface EvidenceItem {
  id: string;
  factorTe: string;
  factorEn: string;
  observationTe: string;
  observationEn: string;
  status: 'strong' | 'compatible' | 'conflict' | 'neutral';
  statusTe: string;
  statusEn: string;
  weight: number;
}

export interface RiskForecastPoint {
  timeframe: 'now' | '24h' | '48h' | '7d';
  labelTe: string;
  labelEn: string;
  riskLevel: 'stable' | 'watch' | 'warning' | 'high';
  riskScore: number; // 0 - 100
  noteTe: string;
  noteEn: string;
}

export interface WhatIfScenario {
  actNow: {
    titleTe: string;
    titleEn: string;
    riskTrend: 'down';
    expectedRiskScore: number;
    descriptionTe: string;
    descriptionEn: string;
    outcomeTe: string;
    outcomeEn: string;
  };
  waitAndWatch: {
    titleTe: string;
    titleEn: string;
    riskTrend: 'up';
    expectedRiskScore: number;
    descriptionTe: string;
    descriptionEn: string;
    outcomeTe: string;
    outcomeEn: string;
  };
}

export interface PriorityAction {
  primaryActionTe: string;
  primaryActionEn: string;
  checklistTe: string[];
  checklistEn: string[];
  nextCheckTimeTe: string;
  nextCheckTimeEn: string;
  safetyAdvisoryTe: string;
  safetyAdvisoryEn: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  crop: CropType;
  cropStage: CropStage;
  healthStatus: HealthStatus;
  healthStatusTe: string;
  healthStatusEn: string;
  possibleIssueTe: string;
  possibleIssueEn: string;
  diseaseCode: string;
  aiConfidence: number; // e.g. 84
  severityTe: string;
  severityEn: string;
  severityLevel: 'low' | 'moderate' | 'high';
  isLowConfidenceFallback: boolean;
  whyReasons: Array<{
    icon: string;
    titleTe: string;
    titleEn: string;
    detailTe: string;
    detailEn: string;
  }>;
  evidenceCheck: {
    isOverallMatch: boolean;
    overallVerdictTe: string;
    overallVerdictEn: string;
    conflictWarningTe?: string;
    conflictWarningEn?: string;
    items: EvidenceItem[];
  };
  riskForecast: RiskForecastPoint[];
  whatIf: WhatIfScenario;
  actionPlan: PriorityAction;
  teluguVoiceSummary: string;
  englishVoiceSummary: string;
  weatherSnapshot: {
    temperature: number;
    humidity: number;
    rainfall: number;
    conditionTe: string;
    conditionEn: string;
  };
  decisionState: DecisionState; // 'act_now' | 'monitor' | 'verify'
  top3Alternatives?: Array<{
    nameEn: string;
    nameTe: string;
    confidence: number;
    evidence: string;
  }>;
  multiPhotoConsistency?: 'high' | 'low' | 'single';
  voiceNote?: VoiceNote;
  farmerFeedback?: FarmerFeedback;
  audioTe?: {
    available: boolean;
    audioUrl?: string;
    audioBase64?: string;
    durationSeconds?: number;
  };
  audioEn?: {
    available: boolean;
    audioUrl?: string;
    audioBase64?: string;
    durationSeconds?: number;
  };
}

export interface AudioDebugInfo {
  inputLanguage: string;
  responseLanguage: string;
  ttsLanguage: string;
  ttsModel: string;
  speaker: string;
  audioGenerated: boolean;
  audioLength?: string;
  status: string;
}

export interface TimelineEntry {
  day: number;
  date: string;
  titleTe: string;
  titleEn: string;
  health: HealthStatus;
  risk: number;
  condition: 'improving' | 'stable' | 'worsening';
  conditionTe: string;
  conditionEn: string;
  descriptionTe: string;
  descriptionEn: string;
  actionTakenTe?: string;
  actionTakenEn?: string;
}

export interface LiveRiskMetrics {
  overallState: 'stable' | 'watch' | 'warning' | 'critical';
  overallStateTe: string;
  overallStateEn: string;
  humidity: number;
  rainfall: number;
  temperature: number;
  cropStageTe: string;
  cropStageEn: string;
  diseaseSignalTe: string;
  diseaseSignalEn: string;
  lastUpdated: string;
}

export interface AlertNotification {
  id: string;
  type: 'risk' | 'reminder' | 'weather';
  titleTe: string;
  titleEn: string;
  messageTe: string;
  messageEn: string;
  timestamp: string;
  urgent: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'farmer' | 'assistant';
  text: string;
  audioUrl?: string;
  timestamp: string;
  category?: 'general' | 'urgency' | 'weather' | 'spread' | 'prevention';
}

export interface CropAnalysisContext {
  crop: CropType;
  cropStage: CropStage;
  healthStatus: HealthStatus;
  diseaseNameTe: string;
  diseaseNameEn: string;
  aiConfidence: number;
  severityLevel: 'low' | 'moderate' | 'high';
  weatherSummaryTe: string;
  primaryActionTe: string;
}

export interface ChatRequest {
  message: string;
  context: CropAnalysisContext;
  history?: Array<{ sender: 'farmer' | 'assistant'; text: string }>;
}

export interface ChatResponse {
  replyTe: string;
  replyEn: string;
  audioUrl?: string;
  suggestedFollowUpsTe?: string[];
  safetyNoteTe?: string;
}
