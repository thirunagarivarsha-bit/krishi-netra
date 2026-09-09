export const te = {
  appTitle: 'KRISHI-NETRA',
  appSubtitle: 'మీ పంటను చూసుకోండి. సరైన నిర్ణయం తీసుకోండి.',
  tagline: 'రైతులకు నమ్మకమైన AI పంట రక్షణ సహాయకుడు',
  
  nav: {
    home: 'హోమ్',
    scan: 'స్కాన్',
    ask: 'అడగండి',
    myField: 'నా చేను',
    crops: 'నా పంటలు',
    actions: 'పనులు',
    field: 'నా చేను',
    alerts: 'హెచ్చరికలు',
    more: 'వివరాలు',
    insights: 'AI విశ్లేషణ',
    feasibility: 'ఆర్థిక సాధ్యాసాధ్యాలు',
    technical: 'సాంకేతిక వివరాలు',
    intelligence: 'AI ఇంటెలిజెన్స్',
    accessibility: 'సహాయక సెట్టింగ్స్',
    demo: 'డెమో మోడ్',
    languageToggle: 'English'
  },

  onboarding: {
    title: 'KRISHI-NETRA ఎలా ఉపయోగించాలి?',
    subtitle: 'మీ పంటను చూసుకోండి. సరైన నిర్ణయం తీసుకోండి.',
    listenAudio: 'వినండి',
    startCheck: 'పంట పరీక్ష ప్రారంభించండి',
    audioText: 'నమస్కారం రైతు సోదరులారా. కృషి-నేత్ర ఉపయోగించడం చాలా సులభం. మొదట మీ పంట ఆకు స్పష్టమైన ఫోటో తీయండి. మీ పంటను ఎంచుకోండి. మీ సమస్యను తెలుగులో చెప్పండి. మా AI వ్యవస్థ వాతావరణాన్ని, పంట దశను పరిశీలించి సరైన సలహా ఇస్తుంది.',
    steps: [
      {
        stepNumber: '1',
        icon: '📷',
        title: 'పంట ఫోటో తీయండి',
        description: 'సమస్య ఉన్న ఆకు లేదా మొక్కను స్పష్టంగా ఫోటో తీయండి.'
      },
      {
        stepNumber: '2',
        icon: '🌱',
        title: 'మీ పంటను ఎంచుకోండి',
        description: 'పత్తి, వరి, మిర్చి లేదా మొక్కజొన్నను ఎంచుకోండి.'
      },
      {
        stepNumber: '3',
        icon: '🎤',
        title: 'మీ సమస్యను చెప్పండి',
        description: 'మీరు గమనించిన విషయాన్ని తెలుగులో మాట్లాడండి లేదా టైప్ చేయండి.'
      },
      {
        stepNumber: '4',
        icon: '🤖',
        title: 'AI సలహా పొందండి',
        description: 'పంట, వాతావరణం పరిశీలించి KRISHI-NETRA సరైన సూచన ఇస్తుంది.'
      }
    ]
  },

  home: {
    greeting: 'నమస్కారం 👋',
    greetingSub: 'మీ వ్యవసాయ క్షేత్రం ఈరోజు ఎలా ఉంది?',
    mainActionTitle: 'మీ పంటను పరీక్షించండి',
    scanCropBtn: 'పంటను స్కాన్ చేయండి (Scan Crop)',
    askVoiceBtn: 'తెలుగులో అడగండి',
    voiceListening: 'మీ మాట వింటున్నాం... మాట్లాడండి',
    voiceProcessing: 'మీ మాట అర్థం చేసుకుంటున్నాం...',
    fieldSummaryTitle: 'నా పంట సారాంశం',
    cropLabel: 'పంట',
    healthLabel: 'ఆరోగ్యం',
    riskLabel: 'ప్రమాద తీవ్రత',
    lastCheckedLabel: 'చివరిసారి చూసింది',
    cotton: 'పత్తి (Cotton)',
    watch: 'గమనించాలి',
    moderate: 'మధ్యస్థం',
    daysAgo: '2 రోజుల క్రితం',
    viewFullField: 'పూర్తి వివరాలు చూడండి →',
    quickAlertBanner: 'తేమ ఎక్కువగా ఉంది. తెగులు వచ్చే అవకాశం ఉంది.'
  },

  scanFlow: {
    step1Title: 'పంట ఆకును స్పష్టంగా ఫోటో తీయండి',
    takePhotoBtn: 'కెమెరాతో ఫోటో తీయండి',
    uploadPhotoBtn: 'గ్యాలరీ నుండి ఫోటో ఎంచుకోండి',
    samplePhotoTitle: 'లేదా ఈ నమూనా ఆకులను ప్రయత్నించండి:',
    sampleLeaves: [
      { label: 'పత్తి ఆకు మచ్చ', type: 'cotton', id: 'cotton_spot' },
      { label: 'వరి అగ్గితెగులు', type: 'paddy', id: 'paddy_blast' },
      { label: 'మిర్చి ఆకుముడత', type: 'chilli', id: 'chilli_curl' },
      { label: 'మొక్కజొన్న తెగులు', type: 'maize', id: 'maize_blight' },
      { label: 'ఆరోగ్యకరమైన ఆకు', type: 'healthy', id: 'healthy_leaf' }
    ],
    tipsTitle: 'మంచి ఫోటో కోసం సూచనలు:',
    tips: [
      'మంచి వెలుతురులో ఫోటో తీయండి',
      'ఆకును కెమెరాకు దగ్గరగా ఉంచండి',
      'ఫోటో మసకగా (Blur) ఉండకూడదు'
    ],
    step2Title: 'మీ పంటను ఎంచుకోండి',
    step3Title: 'పంట ఏ దశలో ఉంది?',
    step4Title: 'మీరు ఆకుపై ఏమి గమనించారు?',
    tellUsVoice: 'చెప్పండి (మాట్లాడండి)',
    tellUsPlaceholder: 'ఉదాహరణ: ఆకులపై నల్లటి మచ్చలు వచ్చాయి, చివర్లు ఎండిపోతున్నాయి...',
    analyzingBtn: 'విశ్లేషిస్తోంది...',
    submitBtn: 'AI విశ్లేషణ ప్రారంభించండి',
    nextBtn: 'తరువాత',
    backBtn: 'వెనుకకు'
  },

  crops: {
    cotton: { name: 'పత్తి', icon: '🌱', english: 'Cotton' },
    paddy: { name: 'వరి', icon: '🌾', english: 'Paddy' },
    chilli: { name: 'మిర్చి', icon: '🌶', english: 'Chilli' },
    maize: { name: 'మొక్కజొన్న', icon: '🌽', english: 'Maize' }
  },

  stages: {
    seedling: 'మొలక దశ (Seedling)',
    growing: 'ఎదుగుదల దశ (Growing)',
    flowering: 'పూత దశ (Flowering)',
    fruiting: 'కాయ / పిందె దశ (Fruiting)',
    maturity: 'పక్వ దశ (Maturity)'
  },

  symptoms: [
    { id: 'yellowing', text: 'ఆకులు పసుపు రంగులోకి మారడం', icon: '🟡' },
    { id: 'spots', text: 'ఆకులపై మచ్చలు రావడం', icon: '🔴' },
    { id: 'insects', text: 'పురుగులు / కీటకాలు కనిపించడం', icon: '🐛' },
    { id: 'wilting', text: 'మొక్కలు వాడిపోవడం', icon: '💧' },
    { id: 'stunted', text: 'ఎదుగుదల ఆగిపోవడం', icon: '🌿' },
    { id: 'spreading', text: 'సమస్య ఇతర మొక్కలకు వ్యాపిస్తోంది', icon: '📈' }
  ],

  analysisProgress: {
    title: 'పంటను పరిశీలిస్తున్నాం...',
    subtitle: 'దయచేసి కాసేపు వేచి ఉండండి. KRISHI-NETRA మీ పంటను తనిఖీ చేస్తోంది.',
    steps: [
      'ఫోటో నాణ్యత పరిశీలించబడింది (Photo quality checked)',
      'పంట విశ్లేషించబడింది (Crop analyzed)',
      'లక్షణాలు గుర్తించబడ్డాయి (Symptoms detected)',
      'స్థానిక వాతావరణం తనిఖీ చేయబడింది (Weather checked)',
      'పంట దశ పరిగణించబడింది (Crop stage considered)',
      'ప్రమాద తీవ్రత లెక్కించబడింది (Risk calculated)',
      'సరైన సలహా సిద్ధమైంది (Recommendation prepared)'
    ]
  },

  results: {
    title: 'మీ పంట పరిస్థితి',
    statusBadge: 'గమనించాలి',
    possibleIssueTitle: 'సాధ్యమైన సమస్య',
    defaultIssue: 'పత్తి ఆకు మచ్చల తెగులు (Cotton Leaf Spot)',
    aiConfidenceTitle: 'AI నమ్మకం',
    severityTitle: 'తీవ్రత',
    severityModerate: 'మధ్యస్థం (Moderate)',
    lowConfidenceNotice: 'AIకి స్పష్టమైన ఆధారం లేదు. మరో ఫోటో తీసి ప్రయత్నించండి.',
    whySectionTitle: 'ఇలా ఎందుకు చెబుతున్నాం?',
    riskForecastTitle: 'రాబోయే రోజుల్లో పంట ప్రమాదం',
    aiForecastNote: 'AI అంచనా మాత్రమే — ఖచ్చితమైన హామీ కాదు',
    evidenceTitle: 'ఆధారాల పరిశీలన',
    evidenceMatchOverall: 'ఆధారాలు సరిపోతున్నాయి ✓',
    evidenceConflictWarning: '⚠ ఆధారాల్లో తేడా ఉంది. చికిత్సకు ముందు మరోసారి పరిశీలించండి.',
    whatToDoTitle: 'ఇప్పుడు ఏమి చేయాలి?',
    primaryActionHeader: 'మొదటి చర్య',
    checklistHeader: 'గమనించాల్సినవి',
    recheckHeader: 'మళ్లీ ఎప్పుడు పరీక్షించాలి?',
    whatIfTitle: 'నేను ఇప్పుడు ఏమీ చేయకపోతే?',
    whatIfSubtitle: 'సమయానికి స్పందించడం వల్ల కలిగే ప్రయోజనం',
    actNowCard: 'ఇప్పుడు చర్య తీసుకుంటే',
    waitCard: 'ఏమీ చేయకుండా వేచి ఉంటే',
    riskTrendDown: 'అంచనా ప్రమాదం తగ్గుతుంది ↓',
    riskTrendUp: 'అంచనా ప్రమాదం పెరుగుతుంది ↑',
    disclaimer: 'ఇవి AI అంచనాలు మాత్రమే. ఖచ్చితమైన ఫలితాలకు హామీ కాదు.',
    voiceAudioTitle: 'వాయిస్ సలహా వినండి',
    play: 'వినండి (Play)',
    pause: 'ఆపండి (Pause)',
    replay: 'మళ్లీ వినండి (Replay)',
    saveToField: 'నా పంట రికార్డులలో సేవ్ చేయండి',
    scanAgain: 'మరోసారి పరీక్షించండి (Scan Again)'
  },

  field: {
    title: 'నా పంట క్షేత్రం',
    subtitle: 'మీ పంటల ఆరోగ్యం మరియు గత పరీక్షల చరిత్ర',
    fieldStatus: 'క్షేత్ర పరిస్థితి',
    currentHealth: 'ప్రస్తుత ఆరోగ్యం',
    currentRisk: 'ప్రస్తుత ప్రమాదం',
    lastScan: 'చివరి పరీక్ష',
    nextCheck: 'తదుపరి పరీక్ష',
    timelineTitle: 'పంట ఆరోగ్య చరిత్ర (Crop Health Timeline)',
    timelineSub: 'గత 10 రోజులలో పంట పరిస్థితి ఎలా మారింది?',
    improving: 'మెరుగుపడుతోంది',
    stable: 'నిలకడగా ఉంది',
    worsening: 'క్షీణిస్తోంది',
    scanAgainBtn: 'మళ్లీ స్కాన్ చేసి పోల్చండి'
  },

  alerts: {
    title: 'పంట హెచ్చరికలు & సమాచారం',
    subtitle: 'మీ ప్రాంతానికి సంబంధించి అత్యవసర హెచ్చరికలు',
    liveRiskTitle: 'Live Crop Risk మానిటర్',
    statusStable: 'నిలకడగా ఉంది (Stable)',
    statusWatch: 'గమనించాలి (Watch)',
    statusWarning: 'హెచ్చరిక (Warning)',
    statusCritical: 'ప్రమాదకరం (Critical)',
    humidity: 'గాలిలో తేమ',
    rainfall: 'వర్షపాతం',
    temperature: 'ఉష్ణోగ్రత',
    cropStage: 'పంట దశ',
    diseaseSignal: 'తెగులు సంకేతం',
    lastUpdated: 'చివరి అప్‌డేట్'
  },

  assistant: {
    title: '🌱 కృషి-నేత్ర AI సహాయకుడు',
    subtitle: 'మీ పంట విశ్లేషణపై ఏవైనా సందేహాలు ఉన్నాయా?',
    activeContextLabel: 'ప్రస్తుత పంట & వ్యాధి విశ్లేషణ ఆధారంగా:',
    askVoice: 'తెలుగులో మాట్లాడండి',
    listening: 'వింటున్నాం... మాట్లాడండి',
    transcribing: 'మాటలు గుర్తిస్తున్నాం...',
    thinking: 'సమాధానం ఆలోచిస్తోంది...',
    inputPlaceholder: 'ఉదా: వర్షం పడితే ఏమి చేయాలి? లేదా ప్రశ్న టైప్ చేయండి...',
    send: 'పంపు',
    quickQuestionsTitle: 'రైతులు తరచుగా అడిగే ప్రశ్నలు:',
    quickQuestions: [
      'వర్షం పడితే ఏమి చేయాలి?',
      'ఇది ఇతర మొక్కలకు వ్యాపిస్తుందా?',
      'మళ్లీ ఎప్పుడు స్కాన్ చేయాలి?',
      'నీటి తడి ఎంత ఇవ్వాలి?'
    ],
    audioControls: {
      play: 'వాయిస్ వినండి',
      pause: 'ఆపండి',
      replay: 'మళ్లీ వినండి'
    },
    disclaimer: '⚠️ KRISHI-NETRA సలహాలు అధికారిక వ్యవసాయ మార్గదర్శకాల ఆధారంగా ఇవ్వబడ్డాయి. స్థానిక వ్యవసాయ అధికారి లేదా KVK సూచనలను పరిగణించండి.'
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
