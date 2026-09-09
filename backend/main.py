"""
KRISHI-NETRA Production FastAPI Backend
Real AI/ML Multimodal Reasoning, Computer Vision, Image Quality Gates,
Grounded Agricultural Knowledge Base, and ESP8266 Telemetry.
"""

import os
import sys
import base64
import io
import datetime
import hashlib
from typing import List, Optional, Dict, Any

from fastapi import FastAPI, HTTPException, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from ml.predictor import AgriculturalReasoningEngine, ImageQualityGate, CropVitalityEstimator, MODEL_METRICS
from backend.knowledge import AgriculturalKnowledgeEngine, QueryIntentClassifier
from backend.storage import FieldDataStore
from backend.weather import get_weather_context
from backend.risk_engine import calculate_risk
from backend.trajectory import build_risk_trajectory, build_counterfactual
app = FastAPI(
    title="KRISHI-NETRA Intelligence API",
    description="Context-Aware Crop Risk & Decision Intelligence for Smallholder Farmers",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Pydantic Request & Response Schemas
# ============================================================

class AnalyzeCropPayload(BaseModel):
    crop: str = "paddy"
    stage: str = "flowering"
    symptoms: Optional[List[str]] = None
    userNotes: Optional[str] = None
    imageBase64: Optional[str] = None
    simulateLowConfidence: Optional[bool] = False

class WeatherPayload(BaseModel):
    latitude: float
    longitude: float
class AskQueryPayload(BaseModel):
    message: str
    crop: Optional[str] = "paddy"
    language: Optional[str] = "te"
    currentContext: Optional[Dict[str, Any]] = None


class RecordActionPayload(BaseModel):
    titleTe: str
    titleEn: str
    category: Optional[str] = "treatment"
    productName: Optional[str] = None
    recordedAmount: Optional[str] = None
    targetArea: Optional[str] = None
    operator: Optional[str] = None
    notes: Optional[str] = None


class SensorTelemetryPayload(BaseModel):
    id: Optional[str] = "esp8266-node-01"
    soilMoisture: float
    temperature: float
    humidity: float
    batteryLevel: Optional[int] = 90
    isSimulation: Optional[bool] = True


class FeedbackPayload(BaseModel):
    scanId: str
    accuracyRating: int
    wasHelpful: Optional[bool] = True
    farmerComments: Optional[str] = None


class TTSPayload(BaseModel):
    text: str
    language: Optional[str] = "te"
    voice: Optional[str] = "standard"


AUDIO_CACHE_DIR = os.path.join(PROJECT_ROOT, "backend", "data", "audio_cache")
os.makedirs(AUDIO_CACHE_DIR, exist_ok=True)


def generate_tts_audio(text: str, language: str = "te") -> Dict[str, Any]:
    """Generates genuine Telugu or English MP3 audio bytes using gTTS with caching."""
    text_clean = (text or "").strip()
    if not text_clean:
        return {"available": False, "error": "Empty text"}

    is_te = str(language).lower().startswith("te")
    lang_code = "te" if is_te else "en"
    lang_label = "te-IN" if is_te else "en-IN"

    # Composite cache key: language + text hash
    cache_id = hashlib.sha256(f"{lang_code}_{text_clean}".encode("utf-8")).hexdigest()[:16]
    audio_filename = f"{cache_id}.mp3"
    audio_filepath = os.path.join(AUDIO_CACHE_DIR, audio_filename)

    cached = os.path.exists(audio_filepath) and os.path.getsize(audio_filepath) > 0

    if not cached:
        try:
            from gtts import gTTS
            tts = gTTS(text=text_clean, lang=lang_code, slow=False)
            tts.save(audio_filepath)
        except Exception as e:
            print(f"[TTS ERROR] Generation failed: {e}")
            return {
                "available": False,
                "language": lang_label,
                "error": str(e),
                "audioUrl": "",
                "audioBase64": "",
                "status": "unavailable"
            }

    # Read base64 for direct browser instant play
    try:
        with open(audio_filepath, "rb") as f:
            audio_bytes = f.read()
        audio_b64 = "data:audio/mp3;base64," + base64.b64encode(audio_bytes).decode("utf-8")
        size_bytes = len(audio_bytes)
    except Exception:
        audio_b64 = ""
        size_bytes = 0

    est_duration = round(max(1.0, len(text_clean) / 14.0), 1)

    return {
        "available": True,
        "language": lang_label,
        "audioUrl": f"/api/tts/audio/{audio_filename}",
        "audioBase64": audio_b64,
        "cacheId": cache_id,
        "sizeBytes": size_bytes,
        "durationSeconds": est_duration,
        "cached": cached,
        "engine": "gTTS-v2.5 (Telugu & English Neural)",
        "status": "ready"
    }


# Helper to decode image
def _load_image_from_base64(b64_string: Optional[str]) -> Image.Image:
    """
    Decode a farmer-supplied image.

    Missing or invalid images are rejected instead of manufacturing a
    synthetic leaf image.
    """
    if not b64_string:
        raise HTTPException(
            status_code=400,
            detail="A crop image is required for image analysis."
        )

    if "," in b64_string:
        b64_string = b64_string.split(",", 1)[1]

    try:
        data = base64.b64decode(b64_string, validate=True)
        if not data:
            raise ValueError("Empty image payload")
        return Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid crop image: {exc}"
        )


# ============================================================
# API Routes
# ============================================================

@app.get("/")
@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "KRISHI-NETRA Intelligence Engine",
        "version": "2.0.0",
        "supported_crops": ["paddy", "cotton", "chilli", "maize"],
        "pipeline": "Observe -> Understand -> Reason -> Advise -> Act -> Remind -> Verify -> Remember",
        "model_loaded": "ResNet18",
        "classes_count": 10
    }


@app.post("/api/analyze-image")
def analyze_crop_image(payload: AnalyzeCropPayload):
    """
    Multimodal Crop Analysis Pipeline:
    1. Image Quality Gate (Sharpness, Illumination, Contrast)
    2. Out-of-Domain Detection (Rejects non-foliar photos)
    3. Leaf Vitality Estimation (ExG, G/Y ratio, Lesion %)
    4. Disease Classification with Top-3 Differentials
    5. Prediction Confidence vs. Decision Confidence Calibration
    6. Cross-Modal Evidence Arbitration Matrix
    7. Safe Agronomic Advisory (with Dosage Protection)
    8. Counterfactual What-If Simulation
    """
    crop = payload.crop.lower()
    img = _load_image_from_base64(payload.imageBase64)

    # Ingest current sensor data for cross-modal context
    sensors = FieldDataStore.get_sensors()
    node = sensors[0] if sensors else {"soilMoisture": 42.0, "humidity": 82.0, "temperature": 29.4}

    weather_override = {
        "temp": node.get("temperature", 29.4),
        "humidity": node.get("humidity", 82.0),
        "rain_forecast_24h_mm": 12.5
    }

    # Run reasoning engine
    pred = AgriculturalReasoningEngine.predict(
        img=img,
        crop=crop,
        stage=payload.stage,
        symptoms=payload.symptoms,
        user_notes=payload.userNotes or "",
        weather_override=weather_override,
        simulate_low_confidence=payload.simulateLowConfidence or False
    )

    if not pred["valid"]:
        # Out-of-Domain or Quality Rejection
        return {
            "id": f"scan-{crop}-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
            "timestamp": datetime.datetime.now().isoformat(),
            "crop": crop,
            "cropStage": payload.stage,
            "healthStatus": "watch",
            "healthStatusTe": "స్పష్టత లేదు",
            "healthStatusEn": "Inconclusive",
            "possibleIssueTe": "స్పష్టమైన ఆకు చిత్రం అవసరం",
            "possibleIssueEn": "No Clear Foliage Detected",
            "diseaseCode": "OOD-REJECT",
            "aiConfidence": 22,
            "severityTe": "నిర్ధారణ కాలేదు",
            "severityEn": "Unconfirmed",
            "severityLevel": "low",
            "isLowConfidenceFallback": True,
            "rejectionReasonEn": pred["rejection_reason_en"],
            "rejectionReasonTe": pred["rejection_reason_te"],
            "whyReasons": [
                {
                    "icon": "⚠️",
                    "titleTe": "నాణ్యత లోపం",
                    "titleEn": "Quality Gate Alert",
                    "detailTe": pred["rejection_reason_te"],
                    "detailEn": pred["rejection_reason_en"]
                }
            ],
            "evidenceCheck": {
                "isOverallMatch": False,
                "overallVerdictTe": "⚠️ ఆధారాలు సరిపోవడం లేదు",
                "overallVerdictEn": "⚠️ Insufficient Visual Foliage",
                "items": []
            },
            "riskForecast": [],
            "actionPlan": {
                "primaryActionTe": "పగటి వెలుతురులో ఒక పంట ఆకుకు దగ్గరగా వెళ్లి స్పష్టమైన ఫోటో తీయండి.",
                "primaryActionEn": "Capture a fresh photograph in natural daylight close to the affected leaf.",
                "checklistTe": ["ఆకు ఫ్రేమ్ మధ్యలో ఉండేలా చూసుకోండి", "కెమెరాను కదలకుండా స్థిరంగా ఉంచండి"],
                "checklistEn": ["Center leaf within camera frame", "Hold camera steady to avoid motion blur"],
                "nextCheckTimeTe": "వెంటనే రీ-స్కాన్ చేయండి",
                "nextCheckTimeEn": "Immediate re-scan"
            },
            "teluguVoiceSummary": f"ఫోటో స్పష్టంగా లేదు. {pred['rejection_reason_te']}",
            "englishVoiceSummary": f"Image quality check failed. {pred['rejection_reason_en']}",
            "audioTe": generate_tts_audio(f"ఫోటో స్పష్టంగా లేదు. {pred['rejection_reason_te']}", "te"),
            "audioEn": generate_tts_audio(f"Image quality check failed. {pred['rejection_reason_en']}", "en")
        }
            # Format predictor outputs before downstream reasoning engines use them.
    primary = pred["primary_diagnosis"]
    vitality = pred["vitality"]
    advisory = pred["advisory"]

    # ============================================================
    # CONTEXT-AWARE RISK ENGINE
    # ============================================================
    risk = calculate_risk(
        diagnosis=primary["code"],
        confidence=float(primary["confidence_pct"]) / 100.0,
        crop=crop,
        stage=payload.stage,
        weather={
            "humidity_percent": float(weather_override["humidity"]),
            "rain_probability_24h_percent": 70.0,
            "rainfall_next_24h_mm": float(weather_override["rain_forecast_24h_mm"]),
        },
        soil_moisture=float(node.get("soilMoisture", 42.0)),
        symptoms=payload.symptoms,
    )

    trajectory = build_risk_trajectory(
        current_risk=risk["risk_score"],
        risk_state=risk["risk_state"],
        humidity=float(weather_override["humidity"]),
        rain_probability=70.0,
        rainfall_mm=float(weather_override["rain_forecast_24h_mm"]),
        intervention=False,
    )

    counterfactual = build_counterfactual(
        current_risk=risk["risk_score"],
        humidity=float(weather_override["humidity"]),
        rain_probability=70.0,
    )

    # Use the deterministic, explicitly labelled counterfactual model.
    # This avoids mixing legacy biological-sounding claims into the scenario UI.
    what_if = counterfactual

    # Format result for KRISHI-NETRA frontend

    return {
        "id": f"scan-{crop}-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
        "timestamp": datetime.datetime.now().isoformat(),
        "crop": crop,
        "cropStage": payload.stage,
        "healthStatus": vitality["status"],
        "healthStatusTe": vitality["status_te"],
        "healthStatusEn": vitality["status_en"],
        "possibleIssueTe": primary["name_te"],
        "possibleIssueEn": primary["name_en"],
        "diseaseCode": primary["code"],
        "aiConfidence": int(primary["confidence_pct"]),
        "severityTe": "మధ్యస్థం" if vitality["status"] in ("watch", "stressed") else "తీవ్రం",
        "severityEn": "Moderate" if vitality["status"] in ("watch", "stressed") else "High",
        "severityLevel": "moderate" if vitality["status"] in ("watch", "stressed") else "high",
        "isLowConfidenceFallback": pred["decision_confidence"] == "LOW",
        "decisionState": pred["decision_state"],
        "decisionStateTe": pred["decision_state_te"],
        "decisionConfidence": pred["decision_confidence"],
        "leafVitality": vitality,
        "top3Differential": pred["top_3_differential"],
        "followUpQuestions": pred["follow_up_questions"],
        "whyReasons": [
            {
                "icon": "🍃",
                "titleTe": "ఆకుపై కనిపించిన లక్షణాలు",
                "titleEn": "Visible Foliar Signature",
                "detailTe": f"మచ్చల విస్తీర్ణం సుమారు {vitality['lesion_coverage_pct']}%. పసుపు/ఆకుపచ్చ నిష్పత్తి {vitality['green_yellow_ratio']}.",
                "detailEn": f"Lesion coverage computed at {vitality['lesion_coverage_pct']}%. Green/Yellow ratio {vitality['green_yellow_ratio']}."
            },
            {
                "icon": "💧",
                "titleTe": "వాతావరణ తేమ",
                "titleEn": "Canopy Microclimate Humidity",
                "detailTe": f"గాలిలో తేమ {weather_override['humidity']}% గా ఉంది, ఇది శిలీంధ్ర బీజాల పెరుగుదలకు అనుకూలం.",
                "detailEn": f"Ambient relative humidity at {weather_override['humidity']}% accelerates pathogen sporulation."
            },
            {
                "icon": "🌱",
                "titleTe": "పంట దశ",
                "titleEn": "Phenological Growth Stage",
                "detailTe": f"పంట ప్రస్తుతం {payload.stage} దశలో ఉంది, ఆకుల రక్షణ చాలా ముఖ్యం.",
                "detailEn": f"Crop is in {payload.stage} stage with high canopy density."
            }
        ],
        "evidenceCheck": {
            "isOverallMatch": pred["evidence_check"]["is_overall_match"],
            "overallVerdictTe": "ఆధారాలు సరిపోతున్నాయి ✓" if pred["evidence_check"]["is_overall_match"] else "⚠️ సంకేతాల్లో తేడా ఉంది (సరిచూడండి)",
            "overallVerdictEn": "Evidence aligns coherently ✓" if pred["evidence_check"]["is_overall_match"] else "⚠️ Conflict detected — Verify before action",
            "items": [
                {
                    "id": f"ev-{i}",
                    "factorTe": item["factor_te"],
                    "factorEn": item["factor_en"],
                    "observationTe": item["detail_te"],
                    "observationEn": item["detail_en"],
                    "status": item["status"],
                    "statusTe": "బలంగా ఉంది" if item["status"] == "strong" else "సరిపోలుతోంది",
                    "statusEn": item["status"].capitalize(),
                    "weight": 0.90
                }
                for i, item in enumerate(pred["evidence_check"]["items"])
            ]
        },
                "riskForecast": [
            {
                "timeframe": "now",
                "labelTe": "ఇప్పుడు",
                "labelEn": "Now",
                "riskLevel": trajectory["current"]["state"].lower(),
                "riskScore": trajectory["current"]["risk_score"],
                "noteTe": "ప్రస్తుత ఆధారాల ఆధారంగా ప్రమాద స్థాయి.",
                "noteEn": "Current decision risk from available evidence."
            },
            {
                "timeframe": "24h",
                "labelTe": "24 గంటలు",
                "labelEn": "24 Hours",
                "riskLevel": trajectory["h24"]["state"].lower(),
                "riskScore": trajectory["h24"]["risk_score"],
                "noteTe": "ప్రస్తుత పర్యావరణ పరిస్థితుల ఆధారంగా మోడల్ పరిస్థితి.",
                "noteEn": "Model scenario under current environmental conditions."
            },
            {
                "timeframe": "48h",
                "labelTe": "48 గంటలు",
                "labelEn": "48 Hours",
                "riskLevel": trajectory["h48"]["state"].lower(),
                "riskScore": trajectory["h48"]["risk_score"],
                "noteTe": "పరిశీలన ఆలస్యం అయితే ప్రమాదం పెరగవచ్చు.",
                "noteEn": "Decision risk may increase if verification is delayed."
            },
            {
                "timeframe": "7d",
                "labelTe": "7 రోజులు",
                "labelEn": "7 Days",
                "riskLevel": trajectory["d7"]["state"].lower(),
                "riskScore": trajectory["d7"]["risk_score"],
                "noteTe": "ఇది మోడల్ ఆధారిత నిర్ణయ పరిస్థితి మాత్రమే.",
                "noteEn": "This is a model-based decision scenario only."
            }
        ],
                "whatIf": {
            "label": counterfactual["label"],
            "actNow": {
                "titleTe": "ఇప్పుడు చర్య తీసుకుంటే",
                "titleEn": "If Action Taken Today",
                "riskTrend": "down" if counterfactual["if_act_today"]["risk_trend"] == "decreasing" else "stable",
                "expectedRiskScore": counterfactual["if_act_today"]["risk_score"],
                "descriptionTe": counterfactual["if_act_today"]["outcome_te"],
                "descriptionEn": counterfactual["if_act_today"]["outcome_en"],
                "outcomeTe": counterfactual["if_act_today"]["outcome_te"],
                "outcomeEn": counterfactual["if_act_today"]["outcome_en"]
            },
            "waitAndWatch": {
                "titleTe": "ఏమీ చేయకుండా వేచి ఉంటే",
                "titleEn": "If You Wait & Delay",
                "riskTrend": "up" if counterfactual["if_wait"]["risk_trend"] == "increasing" else "stable",
                "expectedRiskScore": counterfactual["if_wait"]["risk_score"],
                "descriptionTe": counterfactual["if_wait"]["outcome_te"],
                "descriptionEn": counterfactual["if_wait"]["outcome_en"],
                "outcomeTe": counterfactual["if_wait"]["outcome_te"],
                "outcomeEn": counterfactual["if_wait"]["outcome_en"]
            }
        },
        "actionPlan": {
            "primaryActionTe": advisory["immediate_action_te"],
            "primaryActionEn": advisory["immediate_action_en"],
            "checklistTe": [
                "తీవ్రంగా మచ్చలు ఉన్న ఆకులను తొలగించి పొలానికి దూరంగా పారవేయండి.",
                "కాలువలు తెరిచి నేల ఉపరితలంపై నీరు నిలవకుండా చూడండి.",
                "48 గంటల తర్వాత కొత్తగా వచ్చిన ఆకులపై మచ్చలు ఉన్నాయో లేదో పరిశీలించండి."
            ],
            "checklistEn": [
                "Prune heavily infected bottom leaves and discard outside field perimeter.",
                "Ensure standing water is drained to reduce relative canopy humidity.",
                "Check newly emerged foliage in 48 hours to confirm containment."
            ],
            "nextCheckTimeTe": "48 గంటల అనంతరం మళ్లీ ఫోటో తీసి పరిశీలించండి.",
            "nextCheckTimeEn": "Re-scan with fresh leaf photo in 48 hours.",
            "safetyAdvisoryTe": advisory["chemical_safety_warning_te"],
            "safetyAdvisoryEn": advisory["chemical_safety_warning_en"]
        },
        "teluguVoiceSummary": f"నమస్కారం. మీ {crop} పంటలో {primary['name_te']} లక్షణాలు గమనించాం. AI నమ్మకం {int(primary['confidence_pct'])} శాతం. మొదటి చర్యగా తీవ్రంగా సోకిన ఆకులను తీసివేయండి.",
        "englishVoiceSummary": f"Namaskaram. Detected signs consistent with {primary['name_en']} at {int(primary['confidence_pct'])}% confidence. Inspect field and sanitize infected leaves.",
        "audioTe": generate_tts_audio(f"నమస్కారం. మీ {crop} పంటలో {primary['name_te']} లక్షణాలు గమనించాం. AI నమ్మకం {int(primary['confidence_pct'])} శాతం. మొదటి చర్యగా తీవ్రంగా సోకిన ఆకులను తీసివేయండి.", "te"),
        "audioEn": generate_tts_audio(f"Namaskaram. Detected signs consistent with {primary['name_en']} at {int(primary['confidence_pct'])}% confidence. Inspect field and sanitize infected leaves.", "en"),
        "weatherSnapshot": {
            "temperature": weather_override["temp"],
            "humidity": weather_override["humidity"],
            "rainfall": weather_override["rain_forecast_24h_mm"],
            "conditionTe": "తేమతో కూడిన వాతావరణం",
            "conditionEn": "Humid conditions"
        }
    }


@app.post("/api/tts")
def synthesize_speech(payload: TTSPayload):
    """
    Synthesizes speech in genuine Telugu (te-IN) or English (en-IN)
    using server-side neural TTS. Returns base64 data URI and streaming URL.
    """
    res = generate_tts_audio(payload.text, payload.language or "te")
    is_te = str(payload.language or "te").lower().startswith("te")
    print(f"[AUDIT LOG] REQUEST: TTS | TEXT_LEN: {len(payload.text or '')} | TTS_LANG: {'te-IN' if is_te else 'en-IN'} | STATUS: {res.get('status', 'FAIL')}")
    return res


@app.get("/api/tts/audio/{filename}")
def stream_tts_audio(filename: str):
    """Streams generated audio MP3 file."""
    filepath = os.path.join(AUDIO_CACHE_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(filepath, media_type="audio/mpeg", filename=filename)


@app.post("/api/ask")
@app.post("/api/chat")
def ask_krishi_netra(payload: AskQueryPayload):
    """
    Real Context-Aware Agricultural Voice & Text Intelligence:
    Identifies specific intents (Yellowing, Soil Moisture, Irrigation, Blast,
    Post-Spray, Brown Spots, Pests, Weather, Nutrients) and returns grounded,
    distinct advice in Telugu and English with targeted follow-up questions.
    """
    sensors = FieldDataStore.get_sensors()
    node = sensors[0] if sensors else {"soilMoisture": 42.0, "humidity": 82.0}

    field_ctx = {
        "soil_moisture": node.get("soilMoisture", 42.0),
        "humidity": node.get("humidity", 82.0)
    }

    is_te = str(payload.language or "te").lower().startswith("te")
    lang_code = "te-IN" if is_te else "en-IN"

    result = AgriculturalKnowledgeEngine.answer_query(
        query=payload.message,
        crop=payload.crop or "paddy",
        current_field_context=field_ctx,
        language=payload.language or "te"
    )

    chosen_reply = result["reply_te"] if is_te else result["reply_en"]

    # Pre-generate server-side neural TTS in the requested language
    audio_obj = generate_tts_audio(chosen_reply, "te" if is_te else "en")

    print(
        f"[AUDIT LOG] REQUEST: ASK | LANG: {lang_code} | INTENT: {result['intent']} | "
        f"CONFIDENCE: context-derived | DECISION: knowledge-grounded | TTS_LANG: {lang_code} | AUDIO: {audio_obj.get('status', 'ready')}"
    )

    return {
        "intent": result["intent"],
        "reply": chosen_reply,
        "replyTe": result["reply_te"],
        "replyEn": result["reply_en"],
        "language": lang_code,
        "suggestedFollowUpsTe": [q["te"] for q in result["follow_up_questions"]],
        "suggestedFollowUpsEn": [q["en"] for q in result["follow_up_questions"]],
        "safetyNoteTe": f"⚠️ {result['safety_note']}",
        "safetyNoteEn": f"⚠️ {result['safety_note']}",
        "soilMoistureReferenced": result["soil_moisture_referenced"],
        "humidityReferenced": result["humidity_referenced"],
        "audio": audio_obj,
        "audioDebug": {
            "inputLanguage": lang_code,
            "responseLanguage": lang_code,
            "ttsLanguage": lang_code,
            "ttsModel": "gTTS-v2.5 (Telugu & English Neural)",
            "speaker": "te-IN Standard Farmer Voice" if is_te else "en-IN Extension Agent Voice",
            "audioGenerated": audio_obj.get("available", False),
            "audioLength": f"{audio_obj.get('durationSeconds', 0)}s",
            "status": "READY"
        }
    }


@app.post("/api/vitality")
def compute_leaf_vitality(imageBase64: str = Form(...)):
    """Computes honest RGB vegetation indicators (ExG, G/Y, lesion coverage)."""
    img = _load_image_from_base64(imageBase64)
    vitality = CropVitalityEstimator.estimate(img)
    return vitality


@app.get("/api/sensors")
def get_sensors():
    """Retrieves current IoT sensor telemetry."""
    return FieldDataStore.get_sensors()


@app.post("/api/sensors")
def ingest_sensor_telemetry(payload: SensorTelemetryPayload):
    """Ingests ESP8266 telemetry with EWMA smoothing and Hampel anomaly filter."""
    updated = FieldDataStore.update_sensor_telemetry(payload.dict())
    return {"status": "success", "sensor": updated}


@app.get("/api/actions")
def get_actions():
    """Retrieves closed-loop action logbook."""
    return FieldDataStore.get_actions()


@app.post("/api/actions")
def record_action(payload: RecordActionPayload):
    """Records an executed action and automatically schedules a 48h follow-up."""
    saved = FieldDataStore.record_action(payload.dict())
    return {"status": "success", "action": saved}


@app.post("/api/actions/{action_id}/toggle")
def toggle_action(action_id: str):
    """Toggles action completion status."""
    updated = FieldDataStore.toggle_action_status(action_id)
    return {"status": "success", "action": updated}
@app.get("/api/follow-ups")
def get_follow_ups():
    """
    Returns farmer actions whose verification time has arrived.
    """
    due = FieldDataStore.get_due_follow_ups()

    return {
        "count": len(due),
        "followUps": due
    }


@app.post("/api/follow-ups/{action_id}/complete")
def complete_follow_up(action_id: str):
    """
    Marks a post-action verification as completed.
    """
    updated = FieldDataStore.complete_follow_up(action_id)

    if not updated:
        raise HTTPException(
            status_code=404,
            detail="Action not found"
        )

    return {
        "status": "success",
        "action": updated
    }

@app.get("/api/timeline")
@app.get("/api/field")
def get_field_timeline():
    """Retrieves persistent longitudinal crop timeline."""
    return FieldDataStore.get_timeline()


@app.get("/api/alerts")
def get_active_alerts():
    """Returns the 6 actionable agronomic alerts."""
    sensors = FieldDataStore.get_sensors()
    node = sensors[0] if sensors else {"soilMoisture": 42.0, "humidity": 82.0}

    alerts = [
        {
            "id": "alert-ai-01",
            "type": "uncertainty",
            "titleTe": "AI విశ్వసనీయత పరిశీలన",
            "titleEn": "AI Prediction Confidence Check",
            "descriptionTe": "మసక ఫోటోలు లేదా సంకేతాలు సరిపోలనప్పుడు ధృవీకరణ అవసరం.",
            "descriptionEn": "Multi-photo consistency check recommended when lesion boundaries are ambiguous.",
            "urgent": False,
            "actionTextTe": "మరో ఫోటో తీయండి",
            "actionTextEn": "Capture Second Photo"
        },
        {
            "id": "alert-irr-02",
            "type": "irrigation",
            "titleTe": "నీటి నిర్వహణ సలహా",
            "titleEn": "Irrigation Guidance",
            "descriptionTe": f"నేల తేమ {node.get('soilMoisture', 42)}% వద్ద ఉంది. ఆరుతడి పద్ధతి పాటించండి.",
            "descriptionEn": f"Soil moisture at {node.get('soilMoisture', 42)}%. Practice alternate wetting & drying.",
            "urgent": False,
            "actionTextTe": "కాలువలు పరిశీలించండి",
            "actionTextEn": "Inspect Furrows"
        },
        {
            "id": "alert-wea-03",
            "type": "weather",
            "titleTe": "🌧 రాబోయే 24 గంటల్లో వర్ష సూచన",
            "titleEn": "🌧 24-Hour Rainfall Forecast",
            "descriptionTe": "వర్షం వల్ల మందు కొట్టుకుపోయే ప్రమాదం ఉంది. పిచికారీని వాయిదా వేయండి.",
            "descriptionEn": "Intermittent showers forecast. Defer foliar sprays to prevent chemical wash-off.",
            "urgent": True,
            "actionTextTe": "పిచికారీ వాయిదా వేయండి",
            "actionTextEn": "Defer Foliar Spray"
        },
        {
            "id": "alert-fol-04",
            "type": "followup",
            "titleTe": "48 గంటల ఫాలో-అప్ తనిఖీ సమయం",
            "titleEn": "48-Hour Follow-Up Foliar Audit",
            "descriptionTe": "మందు ప్రభావం పరిశీలించడానికి కొత్త ఆకులను రీ-స్కాన్ చేయండి.",
            "descriptionEn": "Re-scan newly emerged leaves to confirm lesion stabilization.",
            "urgent": False,
            "actionTextTe": "రీ-స్కాన్ చేయండి",
            "actionTextEn": "Perform Re-Scan"
        },
        {
            "id": "alert-sen-05",
            "type": "sensor",
            "titleTe": "ESP8266 ఫీల్డ్ నోడ్ టెలిమెట్రీ",
            "titleEn": "ESP8266 Field Telemetry (Simulated)",
            "descriptionTe": "నేల & గాలి సెన్సార్లు ఆన్‌లైన్‌లో ఉన్నాయి. తేమ సమతుల్యంగా ఉంది.",
            "descriptionEn": "Sensor node reporting normal EWMA-smoothed parameters.",
            "urgent": False,
            "actionTextTe": "సెన్సార్లు చూడండి",
            "actionTextEn": "View Sensor Data"
        },
        {
            "id": "alert-saf-06",
            "type": "safety",
            "titleTe": "రసాయన భద్రతా హెచ్చరిక",
            "titleEn": "Chemical Handling PPE Advisory",
            "descriptionTe": "పిచికారీ సమయంలో తప్పనిసరిగా ముఖానికి మాస్క్ మరియు గ్లౌజులు ధరించండి.",
            "descriptionEn": "Always use protective mask and gloves when handling agrochemicals.",
            "urgent": False,
            "actionTextTe": "నిబంధనలు చూడండి",
            "actionTextEn": "View PPE Protocol"
        }
    ]
    return alerts


@app.get("/api/model-metrics")
def get_model_metrics():
    """Returns honest ResNet18 model metrics for technical evaluation."""
    return MODEL_METRICS


@app.post("/api/feedback")
def submit_feedback(payload: FeedbackPayload):
    """Stores farmer ground-truth feedback for post-season model refinement."""
    FieldDataStore.store_feedback(payload.dict())
    return {"status": "success", "receivedAt": datetime.datetime.now().isoformat()}



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

