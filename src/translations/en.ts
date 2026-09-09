export const en = {
  appTitle: 'KRISHI-NETRA',
  appSubtitle: 'Watch your crop. Make the right decision.',
  tagline: 'Farmer-First AI Crop Health & Risk Advisory',
  
  nav: {
    home: 'Home',
    scan: 'Scan',
    ask: 'Ask',
    myField: 'My Field',
    crops: 'My Crops',
    actions: 'Actions',
    field: 'My Field',
    alerts: 'Alerts',
    more: 'More',
    insights: 'AI Insights',
    feasibility: 'Feasibility',
    technical: 'Technical View',
    intelligence: 'AI Intelligence',
    accessibility: 'Accessibility',
    demo: 'Demo Mode',
    languageToggle: 'తెలుగు'
  },

  onboarding: {
    title: 'How to use KRISHI-NETRA',
    subtitle: 'Watch your crop. Make the right decision.',
    listenAudio: 'Listen',
    startCheck: 'Start Crop Check',
    audioText: 'Welcome farmers. Using KRISHI-NETRA is simple. Take a clear photo of your crop leaf. Select your crop. Speak your problem in Telugu or English. Our AI analyzes weather, crop stage, and provides practical advice.',
    steps: [
      {
        stepNumber: '1',
        icon: '📷',
        title: 'Take Crop Photo',
        description: 'Take a clear photo of the affected leaf or plant.'
      },
      {
        stepNumber: '2',
        icon: '🌱',
        title: 'Select Your Crop',
        description: 'Choose Cotton, Paddy, Chilli, or Maize.'
      },
      {
        stepNumber: '3',
        icon: '🎤',
        title: 'Tell Us The Issue',
        description: 'Speak in Telugu or type what symptoms you observed.'
      },
      {
        stepNumber: '4',
        icon: '🤖',
        title: 'Get AI Advice',
        description: 'KRISHI-NETRA analyzes crop, weather, and provides simple recommendations.'
      }
    ]
  },

  home: {
    greeting: 'Namaskaram 👋',
    greetingSub: 'How is your field condition today?',
    mainActionTitle: 'Check Your Crop',
    scanCropBtn: 'Scan Crop',
    askVoiceBtn: 'Ask in Telugu / Voice',
    voiceListening: 'Listening to you... Please speak',
    voiceProcessing: 'Understanding your speech...',
    fieldSummaryTitle: 'My Crop Summary',
    cropLabel: 'Crop',
    healthLabel: 'Health',
    riskLabel: 'Risk Level',
    lastCheckedLabel: 'Last checked',
    cotton: 'Cotton',
    watch: 'Watch closely',
    moderate: 'Moderate',
    daysAgo: '2 days ago',
    viewFullField: 'View full field details →',
    quickAlertBanner: 'High humidity detected. Disease probability may increase.'
  },

  scanFlow: {
    step1Title: 'Take a clear photo of the crop leaf',
    takePhotoBtn: 'Take Photo with Camera',
    uploadPhotoBtn: 'Upload Photo from Gallery',
    samplePhotoTitle: 'Or test with these sample leaves:',
    sampleLeaves: [
      { label: 'Cotton Leaf Spot', type: 'cotton', id: 'cotton_spot' },
      { label: 'Paddy Blast', type: 'paddy', id: 'paddy_blast' },
      { label: 'Chilli Leaf Curl', type: 'chilli', id: 'chilli_curl' },
      { label: 'Maize Blight', type: 'maize', id: 'maize_blight' },
      { label: 'Healthy Leaf', type: 'healthy', id: 'healthy_leaf' }
    ],
    tipsTitle: 'Tips for accurate diagnosis:',
    tips: [
      'Take photo in good natural lighting',
      'Keep the leaf close to the camera',
      'Avoid blurry or out-of-focus images'
    ],
    step2Title: 'Select Your Crop',
    step3Title: 'What stage is your crop in?',
    step4Title: 'What did you notice on the leaf?',
    tellUsVoice: 'Tell Us (Voice Input)',
    tellUsPlaceholder: 'e.g., Noticed dark spots on edges, lower leaves drying up...',
    analyzingBtn: 'Analyzing...',
    submitBtn: 'Start AI Analysis',
    nextBtn: 'Next Step',
    backBtn: 'Back'
  },

  crops: {
    cotton: { name: 'Cotton', icon: '🌱', english: 'Cotton' },
    paddy: { name: 'Paddy (Rice)', icon: '🌾', english: 'Paddy' },
    chilli: { name: 'Chilli', icon: '🌶', english: 'Chilli' },
    maize: { name: 'Maize (Corn)', icon: '🌽', english: 'Maize' }
  },

  stages: {
    seedling: 'Seedling Stage',
    growing: 'Growing Stage',
    flowering: 'Flowering Stage',
    fruiting: 'Fruiting / Boll Stage',
    maturity: 'Maturity Stage'
  },

  symptoms: [
    { id: 'yellowing', text: 'Leaves turning yellow', icon: '🟡' },
    { id: 'spots', text: 'Spots on leaves', icon: '🔴' },
    { id: 'insects', text: 'Insects or pests observed', icon: '🐛' },
    { id: 'wilting', text: 'Leaves wilting or drooping', icon: '💧' },
    { id: 'stunted', text: 'Growth slowing down', icon: '🌿' },
    { id: 'spreading', text: 'Problem spreading to other plants', icon: '📈' }
  ],

  analysisProgress: {
    title: 'Analyzing crop condition...',
    subtitle: 'Please wait a moment. KRISHI-NETRA is evaluating multi-factor evidence.',
    steps: [
      'Photo quality checked',
      'Crop analyzed',
      'Symptoms detected',
      'Weather checked',
      'Crop stage considered',
      'Risk calculated',
      'Recommendation prepared'
    ]
  },

  results: {
    title: 'Your Crop Condition',
    statusBadge: 'Watch',
    possibleIssueTitle: 'Possible Problem',
    defaultIssue: 'Cotton Leaf Disease',
    aiConfidenceTitle: 'AI Confidence',
    severityTitle: 'Severity',
    severityModerate: 'Moderate',
    lowConfidenceNotice: 'AI does not have sufficient clear evidence. Please take another photo.',
    whySectionTitle: 'Why are we saying this?',
    riskForecastTitle: 'Crop Risk in Coming Days',
    aiForecastNote: 'AI estimate only — not a guaranteed outcome',
    evidenceTitle: 'Evidence Arbitration Check',
    evidenceMatchOverall: 'Evidence aligns coherently ✓',
    evidenceConflictWarning: '⚠ Conflict detected in evidence signals. Re-check before treating.',
    whatToDoTitle: 'What should I do now?',
    primaryActionHeader: 'Priority Action',
    checklistHeader: 'Watchlist',
    recheckHeader: 'When to re-test?',
    whatIfTitle: 'What if I wait and do nothing?',
    whatIfSubtitle: 'Impact of timely action versus waiting',
    actNowCard: 'If action taken now',
    waitCard: 'If you wait and do nothing',
    riskTrendDown: 'Estimated risk decreases ↓',
    riskTrendUp: 'Estimated risk increases ↑',
    disclaimer: 'These are AI estimates based on current signals, not guaranteed future facts.',
    voiceAudioTitle: 'Listen to Voice Guidance',
    play: 'Play',
    pause: 'Pause',
    replay: 'Replay',
    saveToField: 'Save to My Field Records',
    scanAgain: 'Scan Again'
  },

  field: {
    title: 'My Field',
    subtitle: 'Track your crop health trajectory and inspection history',
    fieldStatus: 'Field Status',
    currentHealth: 'Current Health',
    currentRisk: 'Current Risk',
    lastScan: 'Last Scan',
    nextCheck: 'Next Check',
    timelineTitle: 'Crop Health Timeline',
    timelineSub: 'How has crop health shifted over the last 10 days?',
    improving: 'Improving',
    stable: 'Stable',
    worsening: 'Worsening',
    scanAgainBtn: 'Scan Again & Compare'
  },

  alerts: {
    title: 'Crop Alerts & Advisory',
    subtitle: 'Critical notifications and regional risk monitors',
    liveRiskTitle: 'Live Crop Risk Monitor',
    statusStable: 'Stable',
    statusWatch: 'Watch',
    statusWarning: 'Warning',
    statusCritical: 'Critical',
    humidity: 'Air Humidity',
    rainfall: 'Rainfall',
    temperature: 'Temperature',
    cropStage: 'Crop Stage',
    diseaseSignal: 'Disease Signal',
    lastUpdated: 'Last Updated'
  },

  assistant: {
    title: '🌱 KRISHI-NETRA AI Assistant',
    subtitle: 'Do you have questions about your crop diagnosis?',
    activeContextLabel: 'Based on current crop & disease diagnosis:',
    askVoice: 'Speak in Telugu / English',
    listening: 'Listening... Please speak',
    transcribing: 'Recognizing speech...',
    thinking: 'AI thinking of advice...',
    inputPlaceholder: 'e.g. What to do if it rains? or type your query...',
    send: 'Send',
    quickQuestionsTitle: 'Frequently asked by farmers:',
    quickQuestions: [
      'What should I do if it rains?',
      'Will this spread to other plants?',
      'When should I scan again?',
      'How much irrigation is recommended?'
    ],
    audioControls: {
      play: 'Listen Voice',
      pause: 'Pause',
      replay: 'Replay'
    },
    disclaimer: '⚠️ KRISHI-NETRA advice is based on verified agricultural best practices. Always follow local Agriculture Officer or KVK guidelines.'
  },

  intelligence: {
    title: 'KRISHI-NETRA Intelligence View',
    subtitle: 'Agricultural ML Engine, Evidence Fusion & Explainable AI Architecture',
    pipelineTitle: 'End-to-End Decision Pipeline',
    metricsTitle: 'Model Confidence & Calibration',
    shapTitle: 'Contributing Factors (SHAP-aligned Feature Importance)',
    apiTitle: 'FastAPI Production Integration Layer'
  }
};
