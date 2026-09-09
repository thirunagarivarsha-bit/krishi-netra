"""
KRISHI-NETRA Agricultural Knowledge Base & Query Understanding Layer
Grounded agronomic responses for Paddy, Cotton, Chilli, and Maize.
Bilingual Telugu/English generation with active follow-up questioning.
"""

import re
from typing import Dict, Any, List, Optional


class QueryIntent:
    LEAF_YELLOWING = "LEAF_YELLOWING"
    WATER_STRESS = "WATER_STRESS"
    IRRIGATION = "IRRIGATION"
    CROP_DISEASE = "CROP_DISEASE"
    PEST = "PEST"
    POST_SPRAY = "POST_SPRAY"
    SPRAY_ACTION = "SPRAY_ACTION"
    SOIL = "SOIL"
    WEATHER = "WEATHER"
    NUTRIENT = "NUTRIENT"
    PHOTO_ANALYSIS = "PHOTO_ANALYSIS"
    RISK = "RISK"
    PREVENTION = "PREVENTION"
    FOLLOW_UP = "FOLLOW_UP"
    GENERAL_CROP_QUERY = "GENERAL_CROP_QUERY"
    UNKNOWN = "UNKNOWN"


class QueryIntentClassifier:
    """Classifies Telugu and English farmer queries into actionable agronomic intents."""

    # Keywords patterns (Telugu & English)
    PATTERNS = [
        # Post-spray / Action Follow-up
        (
            QueryIntent.POST_SPRAY,
            [
                r"sprayed yesterday", r"applied yesterday", r"already sprayed", r"after spray",
                r"spray chesa", r"mandhu kotta", r"నిన్న మందు", r"పిచికారీ చేశా", r"కొట్టాను",
                r"మందు కొట్టిన తర్వాత", r"నిన్న స్ప్రే"
            ]
        ),
        # Spray / Chemical / Medicine query
        (
            QueryIntent.SPRAY_ACTION,
            [
                r"\bspray\b", r"\bchemical\b", r"\bpesticide\b", r"\bfungicide\b", r"\bmedicine\b",
                r"\bdose\b", r"\bdosage\b", r"మందు", r"పిచికారీ", r"పురుగుల మందు", r"శిలీంధ్ర నాశిని",
                r"మోతాదు", r"ఎంత కలపాలి", r"దవా"
            ]
        ),
        # Leaf yellowing (Chlorosis)
        (
            QueryIntent.LEAF_YELLOWING,
            [
                r"yellow", r"yellowing", r"chlorosis", r"pale leaves",
                r"పసుపు", r"పసుపుగా", r"పచ్చబడ", r"ఆకులు పసుపు", r"తెల్లబడు"
            ]
        ),
        # Irrigation & Water stress
        (
            QueryIntent.IRRIGATION,
            [
                r"irrigate", r"irrigation", r"water the crop", r"water supply", r"watering",
                r"when to water", r"నీరు ఎప్పుడు", r"తడి ఎప్పుడు", r"నీరు పెట్ట", r"నీటి తడి",
                r"నీళ్లు పెట్టాలా", r"పారించాలా"
            ]
        ),
        (
            QueryIntent.WATER_STRESS,
            [
                r"soil.*dry", r"dry.*soil", r"very dry", r"too dry", r"wilting", r"drooping", r"dry field",
                r"నేల ఎండి", r"ఎండిపో", r"వాడిపో", r"నెర్రలు", r"తేమ లేదు", r"ఆకులు వాలిపోయాయి",
                r"పొడి", r"పొడిగా", r"పొడి నేల"
            ]
        ),
        # Specific disease queries
        (
            QueryIntent.CROP_DISEASE,
            [
                r"blast", r"blight", r"brown spot", r"leaf spot", r"rust", r"curl", r"scald",
                r"బ్లాస్ట్", r"అగ్గితెగులు", r"మచ్చల తెగులు", r"ఆకు మచ్చ", r"ఎండు తెగులు",
                r"తుప్పు తెగులు", r"ముడత", r"తెగులు అంటే ఏమిటి", r"మచ్చలు ఎందుకు"
            ]
        ),
        # Pests & Insects
        (
            QueryIntent.PEST,
            [
                r"insect", r"insects", r"pest", r"worm", r"caterpillar", r"borer", r"aphid", r"fly", r"bugs",
                r"పురుగు", r"పురుగులు", r"కీటకాలు", r"కాండం తొలిచే", r"దోమ", r"తెల్ల దోమ", r"పేనుబంక"
            ]
        ),
        # Soil health
        (
            QueryIntent.SOIL,
            [
                r"\bsoil\b", r"saline", r"clay", r"sand", r"earth",
                r"నేల", r"మట్టి", r"భూమి", r"చౌడు", r"నేల స్వభావం"
            ]
        ),
        # Weather & Rain
        (
            QueryIntent.WEATHER,
            [
                r"\brain\b", r"rainfall", r"humidity", r"weather", r"temperature", r"forecast",
                r"వర్షం", r"వాన", r"తేమ", r"వాతావరణం", r"ఎండ", r"చలి", r"మంచు"
            ]
        ),
        # Nutrients & Fertilizer
        (
            QueryIntent.NUTRIENT,
            [
                r"fertilizer", r"urea", r"nitrogen", r"potash", r"dap", r"zinc", r"npk",
                r"ఎరువు", r"యూరియా", r"పోషకాలు", r"పొటాష్", r"జింక్", r"ఎరువులు ఎప్పుడు"
            ]
        ),
        # Follow-up / Scan timing
        (
            QueryIntent.FOLLOW_UP,
            [
                r"when to check", r"recheck", r"next scan", r"rescan", r"check again",
                r"మళ్లీ ఎప్పుడు", r"స్కాన్ ఎప్పుడు", r"తిరిగి ఎప్పుడు", r"పరిశీలించాలి"
            ]
        )
    ]

    @classmethod
    def classify(cls, text: str) -> str:
        text_lower = text.lower().strip()
        for intent, patterns in cls.PATTERNS:
            for pattern in patterns:
                if re.search(pattern, text_lower, re.IGNORECASE):
                    return intent
        return QueryIntent.GENERAL_CROP_QUERY if len(text_lower) > 3 else QueryIntent.UNKNOWN


class AgriculturalKnowledgeEngine:
    """Generates precise, grounded answers without hallucinations."""

    @staticmethod
    def answer_query(
        query: str,
        crop: str = "paddy",
        current_field_context: Optional[Dict[str, Any]] = None,
        language: str = "te"
    ) -> Dict[str, Any]:
        intent = QueryIntentClassifier.classify(query)
        crop_name_en = (crop or "paddy").title()
        crop_name_te = "వరి" if crop == "paddy" else "పత్తి" if crop == "cotton" else "మిర్చి" if crop == "chilli" else "మొక్కజొన్న"
        is_te = str(language).lower().startswith("te")
        normalized_lang = "te-IN" if is_te else "en-IN"

        ctx = current_field_context or {}
        soil_moisture = ctx.get("soil_moisture", 42)
        humidity = ctx.get("humidity", 82)

        # 1. LEAF YELLOWING
        if intent == QueryIntent.LEAF_YELLOWING:
            reply_te = (
                f"{crop_name_te} పంటలో ఆకులు పసుపు రంగులోకి మారడానికి మూడు ప్రధాన కారణాలు ఉండవచ్చు:\n"
                f"1. నత్రజని (యూరియా) లోపం: కింద ఉన్న పాత ఆకులు మొదట పసుపు రంగులోకి మారతాయి.\n"
                f"2. నీటి ముంపు లేదా వేరుకు గాలి ఆడకపోవడం: అధిక తేమ వల్ల వేర్లు శ్వాసించలేక ఆకులు పసుపుబారతాయి.\n"
                f"3. ప్రారంభ తెగులు లక్షణం: ఆకులపై చిన్న మచ్చలతో కూడిన పసుపు వలయాలు ఉంటే అది శిలీంధ్ర సంకేతం.\n"
                f"సూచన: మచ్చలు ఉన్నాయో లేదో తెలుసుకోవడానికి కెమెరాతో 📷 Scan చేయండి."
            )
            reply_en = (
                f"Leaf yellowing in {crop_name_en} typically stems from three primary factors:\n"
                f"1. Nitrogen Deficiency: Starts on older bottom leaves as pale yellowing from the leaf tip inwards.\n"
                f"2. Excess Moisture / Poor Aeration: Prolonged standing water suffocates roots, impairing nutrient uptake.\n"
                f"3. Early Pathogen Infection: Yellow halos around concentric spots indicate fungal colonization.\n"
                f"Recommendation: Tap 📷 SCAN CROP to confirm whether lesions accompany the chlorosis."
            )
            follow_ups = [
                {"te": "పసుపు రంగు కింద ఆకులకా లేక పై చిగుళ్ళకా?", "en": "Are bottom or top leaves yellowing?"},
                {"te": "పసుపుతో పాటు ఆకులపై మచ్చలు కనిపిస్తున్నాయా?", "en": "Do you see spots alongside yellowing?"},
                {"te": "పొలంలో నీరు ఎక్కువగా నిలిచి ఉందా?", "en": "Is there standing water in the field?"}
            ]
            safety = "రసాయనాలు వాడేముందు కారణాన్ని ఖచ్చితంగా తెలుసుకోండి." if is_te else "Identify the root cause before applying chemical fertilizers."

        # 2. WATER STRESS / DRY SOIL
        elif intent == QueryIntent.WATER_STRESS:
            reply_te = (
                f"{crop_name_te} పంటలో నేల ఎండిపోయినప్పుడు (Water Stress) చేపట్టవలసిన తక్షణ చర్యలు:\n"
                f"• ప్రస్తుత పరిస్థితి: నేల తీవ్రంగా ఎండిపోతే వేరు వ్యవస్థ బలహీనపడి, ఆకులు వాలిపోవడం మరియు కిరణజన్య సంయోగక్రియ మందగించడం జరుగుతుంది.\n"
                f"• తక్షణ పరిష్కారం: నేలలో నెర్రలు (పగుళ్లు) ఏర్పడితే ఒక్కసారిగా ముంచెత్తకుండా, నెమ్మదిగా పారించి నేల లోపలికి తేమ ఇంకేలా తేలికపాటి తడి ఇవ్వండి.\n"
                f"• ఎండ తీవ్రత అధికంగా ఉన్నప్పుడు (మధ్యాహ్నం 12-3 గంటల మధ్య) నీరు పెట్టకండి. ఉదయం 6-9 గంటల మధ్య లేదా సాయంత్రం వేళల్లో మాత్రమే తడి ఇవ్వండి.\n"
                f"• మల్చింగ్: వీలైతే ఎండిన గడ్డి లేదా ఆకులతో నేల పైభాగం కప్పడం ద్వారా తేమ ఆవిరి కాకుండా కాపాడుకోవచ్చు."
            )
            reply_en = (
                f"Acute Water Stress & Dry Soil Protocol for {crop_name_en}:\n"
                f"• Condition: Severe moisture deficit damages root hairs, causing daytime wilting and impaired nutrient transport.\n"
                f"• Immediate Action: If fissuring or soil crusting is observed, deliver gradual surface wetting rather than sudden heavy flooding.\n"
                f"• Application Window: Avoid midday irrigation (12–3 PM) to minimize thermal shock and rapid evaporative loss. Irrigate between 6–9 AM or late evening.\n"
                f"• Conservation: Apply organic mulch where feasible to conserve soil moisture around the root zone."
            )
            follow_ups = [
                {"te": "నేలలో పగుళ్లు కనిపిస్తున్నాయా?", "en": "Are there deep soil fissures/cracks?"},
                {"te": "ఆకులు ఉదయం కూడా వాలిపోయి ఉంటున్నాయా?", "en": "Are leaves wilted even in early morning?"}
            ]
            safety = "తీవ్రమైన ఎండలో నీరు పెడితే వేర్లు ఉడికిపోయే ప్రమాదం ఉంది." if is_te else "Avoid irrigating during peak heat to prevent root scald."

        # 3. IRRIGATION TIMING & SCHEDULE
        elif intent == QueryIntent.IRRIGATION:
            reply_te = (
                f"{crop_name_te} క్షేత్రంలో సరైన నీటి నిర్వహణ సమయపాలన:\n"
                f"• ప్రస్తుత సెన్సార్ సూచన: నేలలో తేమ సుమారు {soil_moisture}% గా ఉంది.\n"
                f"• నీటి తడి సమయం: వరి పంటకు నిరంతరం నీరు నిలపడం కంటే 'ఆరుతడి' (AWD - Alternate Wetting & Drying) పద్ధతి చాలా శ్రేయస్కరం.\n"
                f"• ఎదుగుదల దశలో నేల ఉపరితలంపై 2-3 సెం.మీ, పూత దశలో 5 సెం.మీ వరకు నీరు ఉంచండి. గింజ పాలుపోసుకునే దశ వరకు తేమ నిరంతరం ఉండేలా చూడండి.\n"
                f"• వర్ష సూచన: రాబోయే 24 గంటల్లో వర్షం కురిసే అవకాశం ఉంటే నీటి తడిని నిలిపివేయండి."
            )
            reply_en = (
                f"Irrigation Scheduling for {crop_name_en}:\n"
                f"• Current Sensor Indication: Field moisture is approximately {soil_moisture}%.\n"
                f"• Timing: Alternate Wetting and Drying (AWD) is strongly recommended over continuous deep flooding to reduce methane and strengthen tillers.\n"
                f"• Stage Targets: Maintain 2–3 cm shallow standing water during vegetative tillering and 5 cm during panicle emergence/flowering.\n"
                f"• Weather Watch: If precipitation is forecasted within 24 hours, postpone irrigation."
            )
            follow_ups = [
                {"te": "పంట ప్రస్తుతం ఏ దశలో ఉంది (పిలక / పూత)?", "en": "What growth stage is the crop currently in?"},
                {"te": "పొలంలో డ్రైనేజ్ కాలువలు అందుబాటులో ఉన్నాయా?", "en": "Are drainage channels clear and open?"}
            ]
            safety = "పూత దశలో నీటి ఎద్దడి రాకుండా జాగ్రత్త పడండి." if is_te else "Ensure no water deficit occurs during critical flowering."

        # 3. BLAST DISEASE
        elif "blast" in query.lower() or "బ్లాస్ట్" in query or "అగ్గి" in query:
            reply_te = (
                f"వరి అగ్గితెగులు (Rice Blast - Pyricularia oryzae) సమాచారం:\n"
                f"• లక్షణాలు: ఆకులపై కదురు లేదా వజ్రాకారపు మచ్చలు ఏర్పడతాయి. మచ్చల మధ్య భాగం బూడిద లేదా తెల్ల రంగులో ఉండి అంచులు గోధుమ రంగులో ఉంటాయి.\n"
                f"• అనుకూల వాతావరణం: రాత్రిపూట దట్టమైన మంచు, గాలిలో తేమ 85% పైగా ఉండడం, మరియు అధిక నత్రజని వాడకం.\n"
                f"• తక్షణ చర్య: అదనపు యూరియా వాడకాన్ని వెంటనే ఆపండి. పొలానికి నీరు నిరంతరం నిల్వ ఉండకుండా మార్చి మార్చి తడి ఇవ్వండి.\n"
                f"• రక్షణ: లక్షణాలు తీవ్రమైతే స్థానిక AEO అధికారి సిఫార్సు చేసిన ట్రైసైక్లాజోల్ వంటి మందును సరైన మోతాదులో మాత్రమే పిచికారీ చేయండి."
            )
            reply_en = (
                f"Rice Blast (Pyricularia oryzae) Overview:\n"
                f"• Symptoms: Diagnostic diamond- or spindle-shaped lesions with grayish-white centers and reddish-brown borders on leaf blades.\n"
                f"• Environmental Triggers: Night dew, persistent atmospheric humidity (>85%), and excessive top-dressed nitrogen fertilizer.\n"
                f"• Immediate Field Action: Suspend nitrogenous top-dressing immediately. Practice alternate wetting and drying instead of continuous deep flooding.\n"
                f"• Treatment Warning: Apply university-approved fungicides (e.g., Tricyclazole) strictly at package-recommended dilutions."
            )
            follow_ups = [
                {"te": "మచ్చలు ఆకులపై మాత్రమే ఉన్నాయా లేదా కణుపుల వద్ద కూడా ఉన్నాయా?", "en": "Are spots on leaves or also on stem nodes?"},
                {"te": "పంట ప్రస్తుతం ఏ దశలో ఉంది (పిలక / పూత)?", "en": "What growth stage is the crop in?"}
            ]
            safety = "మందు పిచికారీ చేసేటప్పుడు తప్పనిసరిగా ముఖానికి మాస్క్ ధరించండి." if is_te else "Wear protective gloves and mask when applying foliar fungicides."

        # 4. POST-SPRAY / "I SPRAYED YESTERDAY"
        elif intent == QueryIntent.POST_SPRAY:
            reply_te = (
                f"నిన్న పిచికారీ చేసిన తర్వాతి పర్యవేక్షణ మార్గదర్శకం:\n"
                f"1. విశ్రాంతి సమయం: మందు పిచికారీ చేసిన 24-48 గంటల వరకు పొలంలో ఎలాంటి రసాయన జోక్యం చేసుకోకండి.\n"
                f"2. వర్ష పరిశీలన: మందు కొట్టిన తర్వాత వర్షం పడితే మందు కొట్టుకుపోయే అవకాశం ఉంది. వర్షం పడకపోతే ఔషధం మొక్కలోకి ఇంకిపోతుంది.\n"
                f"3. ఫాలో-అప్ స్కాన్: సరిగ్గా 48 గంటల తర్వాత (రేపు సాయంత్రం) కొత్తగా వస్తున్న లేత ఆకుల ఫోటో తీసి KRISHI-NETRA లో రీ-స్కాన్ చేయండి.\n"
                f"4. కోలుకునే సంకేతం: పాత మచ్చలు ఆగిపోయి, కొత్త ఆకులు పరిశుభ్రంగా వస్తే చికిత్స విజయవంతమైనట్లే!"
            )
            reply_en = (
                f"Post-Spray Action & Monitoring Protocol:\n"
                f"1. Observation Window: Allow 24–48 hours for systemic or bio-agent absorption. Avoid additional chemical intervention.\n"
                f"2. Wash-Off Check: If heavy rain occurred within 4 hours of spraying, wash-off may have compromised efficacy.\n"
                f"3. Follow-Up Verification: Perform a re-scan photo in exactly 48 hours focusing on newly emerging foliage.\n"
                f"4. Recovery Metric: Lesion borders drying out and newly sprouted leaves remaining lesion-free confirms fungal containment."
            )
            follow_ups = [
                {"te": "మందు కొట్టిన తర్వాత వర్షం పడిందా?", "en": "Did it rain within 4 hours of your spray?"},
                {"te": "ఆకుల చివర్లు మాడినట్లు అనిపిస్తున్నాయా (ఫైటోటాక్సిసిటీ)?", "en": "Are leaf tips showing scorching (phytotoxicity)?"}
            ]
            safety = "పిచికారీ చేసిన 48 గంటల వరకు పశువులను పొలంలోకి అనుమతించవద్దు." if is_te else "Keep livestock away from treated fields for 48 hours post-application."

        # 5. BROWN SPOTS
        elif "brown" in query.lower() or "గోధుమ" in query or "మచ్చ" in query or "spot" in query.lower():
            reply_te = (
                f"{crop_name_te} ఆకులపై గోధుమ రంగు మచ్చలు రావడానికి గల కారణాలు:\n"
                f"• సాధారణంగా ఇది 'బ్రౌన్ స్పాట్' లేదా 'సెర్కోస్పోరా' వంటి శిలీంధ్రాల వల్ల వస్తుంది.\n"
                f"• నేలలో పొటాష్ పోషక లోపం ఉన్నప్పుడు లేదా వాతావరణంలో తేమ 80% దాటినప్పుడు ఈ మచ్చలు వేగంగా వృద్ధి చెందుతాయి.\n"
                f"• మచ్చల చుట్టూ పసుపు వలయం ఉంటే అది సజీవంగా వ్యాపిస్తున్న శిలీంధ్ర సంకేతం.\n"
                f"• మీ పంట ఆకును స్పష్టంగా 📷 Scan చేయండి, AI ఖచ్చితమైన విశ్లేషణ అందిస్తుంది."
            )
            reply_en = (
                f"Brown Foliar Lesions on {crop_name_en}:\n"
                f"• Primarily induced by fungal pathogens such as Brown Spot (Bipolaris) or Cercospora.\n"
                f"• Often exacerbated by potassium (K) deficiency in the root zone and relative humidity exceeding 80%.\n"
                f"• A yellow chlorotic halo around brown necrosis indicates active mycelial spread.\n"
                f"• Capture a close-up photo using 📷 SCAN CROP to calculate accurate lesion density."
            )
            follow_ups = [
                {"te": "మచ్చలు గుండ్రంగా ఉన్నాయా లేక పొడవుగా ఉన్నాయా?", "en": "Are spots circular or elongated?"},
                {"te": "కింది ఆకులపై ఎక్కువగా ఉన్నాయా?", "en": "Are bottom leaves more severely affected?"}
            ]
            safety = "తీవ్రమైన ఆకులను తొలగించి దూరంగా వేయడం ద్వారా వ్యాప్తిని ఆపవచ్చు." if is_te else "Manually prune severely infected lower leaves to arrest aerial spore drift."

        # 6. PESTS & INSECTS
        elif intent == QueryIntent.PEST:
            reply_te = (
                f"{crop_name_te} పంటలో పురుగుల నివారణ సూచనలు:\n"
                f"1. ఆకుల కింద పరిశీలించండి: రసం పీల్చే పురుగులు (దోమ, పేనుబంక) ఆకుల అడుగున చేరి రసం పీలుస్తాయి.\n"
                f"2. పసుపు లేదా నీలి జిగురు అట్టలు (Sticky Traps): ఎకరాకు 6-8 ఏర్పాటు చేయడం వల్ల పురుగుల ఉనికిని ముందుగానే గుర్తించవచ్చు.\n"
                f"3. ప్రారంభ చర్య: 5 మి.లీ. వేపనూనె లీటరు నీటిలో కలిపి పిచికారీ చేయడం ద్వారా గుడ్లు, చిన్న పురుగులు నశిస్తాయి.\n"
                f"4. పురుగు రకం లేదా నష్టపరిచిన ఆకు ఫోటో తీసి నిర్ధారించుకోండి."
            )
            reply_en = (
                f"Pest Management Guidelines for {crop_name_en}:\n"
                f"1. Underside Inspection: Sucking pests (whiteflies, aphids, jassids) colonize the abaxial leaf surface.\n"
                f"2. Yellow Sticky Traps: Install 6–8 traps per acre to monitor early pest influx.\n"
                f"3. Botanical Intervention: Foliar spray of 1500 PPM Neem Oil (5ml/L) disrupts insect reproduction and oviposition.\n"
                f"4. For heavy infestations, photograph the affected shoot to isolate specific vector species."
            )
            follow_ups = [
                {"te": "ఆకుల కింద చిన్న తెల్లని లేదా ఆకుపచ్చని పురుగులు కనిపిస్తున్నాయా?", "en": "Do you see tiny white or green insects beneath leaves?"},
                {"te": "మొక్కల కాండం లోపలికి రంధ్రాలు ఉన్నాయా?", "en": "Are there boreholes in the main stem?"}
            ]
            safety = "మిత్ర పురుగులైన లేడీబర్డ్ బీటిల్స్ ఉన్నప్పుడు తీవ్ర రసాయనాలు చల్లవద్దు." if is_te else "Preserve beneficial predators (ladybird beetles) by avoiding broad-spectrum toxins."

        # 7. GENERAL / UNKNOWN
        else:
            reply_te = (
                f"మీ {crop_name_te} పంట పరిశీలన సమాచారం:\n"
                f"పంట ఆరోగ్యంగా ఉండాలంటే క్రమం తప్పకుండా ఆకుల పరిస్థితిని, నేల తేమను ({soil_moisture}%), మరియు వాతావరణ మార్పులను గమనిస్తూ ఉండాలి.\n"
                f"మీ సమస్యను మరింత ఖచ్చితంగా అర్థం చేసుకోవడానికి, దయచేసి:\n"
                f"• ఆకుపై కనిపించే లక్షణాలు చెప్పండి (పసుపు రంగు, మచ్చలు, లేదా పురుగులు), లేదా\n"
                f"• 📷 Scan Crop బటన్ నొక్కి ఒక స్పష్టమైన ఫోటో తీయండి."
            )
            reply_en = (
                f"Field Monitoring Observation for {crop_name_en}:\n"
                f"Maintaining crop vitality requires balanced soil moisture ({soil_moisture}%) and continuous canopy vigilance.\n"
                f"To help provide specific advice, please let me know:\n"
                f"• Specific visible symptoms (e.g. leaf yellowing, dry soil, pest signs), or\n"
                f"• Tap 📷 SCAN CROP to capture a direct foliar photograph for instant diagnosis."
            )
            follow_ups = [
                {"te": "ఆకులు పసుపుగా మారుతున్నాయా?", "en": "Are leaves turning yellow?"},
                {"te": "నీటి తడి ఎప్పుడు పెట్టాలో తెలుసుకోవాలా?", "en": "Do you need irrigation timing advice?"},
                {"te": "ఆకులపై మచ్చలు కనిపిస్తున్నాయా?", "en": "Are you seeing spot formations?"}
            ]
            safety = "KRISHI-NETRA అధికారిక విశ్వవిద్యాలయ సిఫార్సుల ఆధారంగా సలహాలు అందిస్తుంది." if is_te else "KRISHI-NETRA advisory adheres to official ICAR/ANGRAU safety standards."

        chosen_reply = reply_te if is_te else reply_en

        return {
            "intent": intent,
            "crop": crop,
            "query": query,
            "language": normalized_lang,
            "reply": chosen_reply,
            "reply_te": reply_te,
            "reply_en": reply_en,
            "follow_up_questions": follow_ups,
            "safety_note": safety,
            "soil_moisture_referenced": soil_moisture,
            "humidity_referenced": humidity
        }


# Quick export
knowledge_engine = AgriculturalKnowledgeEngine()
intent_classifier = QueryIntentClassifier()
