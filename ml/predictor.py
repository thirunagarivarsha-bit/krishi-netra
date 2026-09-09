"""
KRISHI-NETRA Crop Health & Disease Predictor Engine
Multimodal computer vision, image quality gate, out-of-domain rejection,
leaf vitality estimation, and cross-modal evidence arbitration.
"""

import os
import json
import base64
import io
import math
import numpy as np
from PIL import Image
from ml.onnx_predictor import get_onnx_predictor

# Load classes metadata
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
CLASSES_FILE = os.path.join(CURRENT_DIR, "models", "classes.json")
METRICS_FILE = os.path.join(CURRENT_DIR, "models", "metrics.json")

try:
    with open(CLASSES_FILE, "r", encoding="utf-8") as f:
        DISEASE_CLASSES = json.load(f)
except Exception:
    DISEASE_CLASSES = []

try:
    with open(METRICS_FILE, "r", encoding="utf-8") as f:
        MODEL_METRICS = json.load(f)
except Exception:
    MODEL_METRICS = {}


class ImageQualityGate:
    """Evaluates image sharpness, illumination, contrast, and foliar validity."""

    @staticmethod
    def evaluate(img: Image.Image):
        # Resize to standard analysis resolution
        img_rgb = img.convert("RGB")
        w, h = img_rgb.size
        
        # Check minimum resolution
        if w < 160 or h < 160:
            return {
                "passed": False,
                "reason_en": "Resolution too low (minimum 160x160 required).",
                "reason_te": "ఫోటో పరిమాణం చాలా చిన్నదిగా ఉంది (కనీసం 160x160 ఉండాలి).",
                "blur_score": 0,
                "brightness": 0,
                "contrast": 0,
                "vegetation_ratio": 0.0,
                "is_foliar": False
            }

        # Downsample for fast analysis
        analysis_img = img_rgb.resize((256, 256))
        np_img = np.array(analysis_img, dtype=np.float32)
        r, g, b = np_img[:, :, 0], np_img[:, :, 1], np_img[:, :, 2]
        gray = 0.2989 * r + 0.5870 * g + 0.1140 * b

        # 1. Brightness & Contrast
        brightness = float(np.mean(gray))
        contrast = float(np.std(gray))

        # 2. Sharpness / Blur check using discrete Laplacian approximation
        # Kernel: [[0, 1, 0], [1, -4, 1], [0, 1, 0]]
        laplacian = (
            np.roll(gray, 1, axis=0) +
            np.roll(gray, -1, axis=0) +
            np.roll(gray, 1, axis=1) +
            np.roll(gray, -1, axis=1) -
            4.0 * gray
        )
        blur_score = float(np.var(laplacian[1:-1, 1:-1]))

        # 3. Foliar / Vegetation check (Excess Green Index: ExG = 2G - R - B)
        exg = 2.0 * g - r - b
        vegetation_mask = (exg > 8.0) | ((g > r) & (g > b) & (g > 35.0))
        vegetation_pixels = int(np.sum(vegetation_mask))
        total_pixels = 256 * 256
        vegetation_ratio = float(vegetation_pixels / total_pixels)

        # 4. Out-of-domain rejection
        # If vegetation ratio is less than 10%, it is likely a wall, shoe, face, road, or sky
        is_foliar = vegetation_ratio >= 0.10

        # Quality thresholds
        is_too_blurry = blur_score < 35.0
        is_too_dark = brightness < 35.0
        is_too_bright = brightness > 235.0
        is_low_contrast = contrast < 15.0

        passed = not is_too_blurry and not is_too_dark and not is_too_bright and not is_low_contrast and is_foliar

        if not is_foliar:
            reason_en = "No crop leaf detected. Please photograph an agricultural leaf."
            reason_te = "ఈ ఫోటోలో పంట ఆకు కనిపించడం లేదు. దయచేసి పంట ఆకును స్పష్టంగా తీయండి."
        elif is_too_blurry:
            reason_en = "Photo is blurry. Hold camera steady and capture in good focus."
            reason_te = "ఫోటో మసకగా ఉంది. కెమెరాను స్థిరంగా ఉంచి స్పష్టంగా తీయండి."
        elif is_too_dark:
            reason_en = "Photo is too dark. Use natural daylight."
            reason_te = "వెలుతురు సరిపోవడం లేదు. పగటి వెలుతురులో ఫోటో తీయండి."
        elif is_too_bright:
            reason_en = "Photo has intense glare. Avoid direct reflection."
            reason_te = "తీవ్రమైన ఎండ ప్రతిబింబం ఉంది. నీడలో లేదా స్పష్టమైన వెలుతురులో తీయండి."
        elif is_low_contrast:
            reason_en = "Low contrast. Move closer to the affected leaf."
            reason_te = "కాంట్రాస్ట్ సరిపోలేదు. ప్రభావితమైన ఆకుకు దగ్గరగా వెళ్లి తీయండి."
        else:
            reason_en = "Image quality passed all pre-flight gates."
            reason_te = "ఫోటో నాణ్యత బాగుంది."

        return {
            "passed": passed,
            "reason_en": reason_en,
            "reason_te": reason_te,
            "blur_score": round(blur_score, 1),
            "brightness": round(brightness, 1),
            "contrast": round(contrast, 1),
            "vegetation_ratio": round(vegetation_ratio, 3),
            "is_foliar": is_foliar
        }


class CropVitalityEstimator:
    """Computes honest RGB vegetation indicators (ExG, G/Y, lesion coverage)."""

    @staticmethod
    def estimate(img: Image.Image):
        img_rgb = img.convert("RGB").resize((256, 256))
        np_img = np.array(img_rgb, dtype=np.float32)
        r, g, b = np_img[:, :, 0], np_img[:, :, 1], np_img[:, :, 2]

        # Leaf mask
        exg = 2.0 * g - r - b
        leaf_mask = (exg > 5.0) | ((g > b) & (r > b) & (g > 30.0))
        total_leaf_pixels = max(1, int(np.sum(leaf_mask)))

        # 1. Excess Green Index on leaf area
        leaf_exg = float(np.mean(exg[leaf_mask])) / 255.0

        # 2. Green / Yellow ratio
        # Yellowing is characterized by R approx G and R > B
        yellow_pixels = int(np.sum((r > 90.0) & (g > 90.0) & (b < 80.0) & leaf_mask))
        green_pixels = int(np.sum((g > r + 15.0) & (g > b + 15.0) & leaf_mask))
        gy_ratio = float(green_pixels / max(1, yellow_pixels))

        # 3. Lesion & Necrosis Spot Detection (dark, necrotic brown/black regions on leaf)
        lesion_mask = (
            ((r > 40.0) & (r < 120.0) & (g < 90.0) & (b < 70.0)) |
            ((r < 60.0) & (g < 60.0) & (b < 60.0))
        ) & leaf_mask
        lesion_pixels = int(np.sum(lesion_mask))
        lesion_coverage_pct = float((lesion_pixels / total_leaf_pixels) * 100.0)

        # Classify vitality state
        if lesion_coverage_pct > 30.0 or gy_ratio < 0.6:
            status = "critical"
            status_en = "Critical Foliar Stress"
            status_te = "తీవ్రమైన ఒత్తిడి / నష్టం"
        elif lesion_coverage_pct > 12.0 or gy_ratio < 1.1:
            status = "stressed"
            status_en = "Stressed Foliage"
            status_te = "సమస్య ఉంది (Stressed)"
        elif lesion_coverage_pct > 4.0 or gy_ratio < 1.6:
            status = "watch"
            status_en = "Mild Chlorosis / Early Lesions"
            status_te = "గమనించాలి (Watch)"
        else:
            status = "healthy"
            status_en = "Healthy & Thriving"
            status_te = "ఆరోగ్యంగా ఉంది"

        return {
            "status": status,
            "status_en": status_en,
            "status_te": status_te,
            "excess_green_index": round(leaf_exg, 2),
            "green_yellow_ratio": round(min(gy_ratio, 4.0), 2),
            "lesion_coverage_pct": round(lesion_coverage_pct, 1),
            "method": "RGB Camera Heuristic (Honest Leaf Indicator, Not Chlorophyll Probe)"
        }


class AgriculturalReasoningEngine:
    """Combines vision, weather, crop phenology, and farmer notes."""

    @staticmethod
    def predict(
        img: Image.Image,
        crop: str = "paddy",
        stage: str = "flowering",
        symptoms: list = None,
        user_notes: str = "",
        weather_override: dict = None,
        simulate_low_confidence: bool = False
    ):
        symptoms = symptoms or []
        crop = (crop or "paddy").lower()

        # Step 1: Quality Gate
        quality = ImageQualityGate.evaluate(img)
        if not quality["passed"]:
            return {
                "valid": False,
                "rejection_reason_en": quality["reason_en"],
                "rejection_reason_te": quality["reason_te"],
                "quality_details": quality,
                "is_out_of_domain": not quality["is_foliar"]
            }

        # Step 2: Crop Vitality
        vitality = CropVitalityEstimator.estimate(img)

        # Step 3: Candidate Diseases for this crop
        crop_candidates = [d for d in DISEASE_CLASSES if d["crop"] == crop or d["crop"] == "all"]
        if not crop_candidates:
            crop_candidates = DISEASE_CLASSES

                # Step 4: Real ResNet18 ONNX classification for paddy.
        #
        # The trained checkpoint is a paddy-only model. For paddy,
        # use the real ONNX inference output instead of the legacy
        # RGB heuristic disease scorer.
        #
        # Other crops remain on the existing contextual fallback until
        # crop-specific models are trained and validated.

        if crop == "paddy":
            onnx_predictor = get_onnx_predictor()
            model_prediction = onnx_predictor.predict(
                img,
                top_k=3,
            )

            MODEL_TO_METADATA = {
                "bacterial_leaf_blight": {
                    "code": "PAD-BLB-003",
                    "name_en": "Paddy Bacterial Leaf Blight",
                    "name_te": "వరి బాక్టీరియా ఆకు ఎండు తెగులు (BLB)",
                    "scientific_name": "Xanthomonas oryzae pv. oryzae",
                },
                "bacterial_leaf_streak": {
                    "code": "PAD-BLS-011",
                    "name_en": "Paddy Bacterial Leaf Streak",
                    "name_te": "వరి బాక్టీరియా ఆకు చార తెగులు",
                    "scientific_name": "Xanthomonas oryzae pv. oryzicola",
                },
                "bacterial_panicle_blight": {
                    "code": "PAD-BPB-012",
                    "name_en": "Paddy Bacterial Panicle Blight",
                    "name_te": "వరి కంకి బాక్టీరియా తెగులు",
                    "scientific_name": "Bacterial panicle disease",
                },
                "blast": {
                    "code": "PAD-BLA-001",
                    "name_en": "Paddy Blast",
                    "name_te": "వరి అగ్గితెగులు (Rice Blast)",
                    "scientific_name": "Pyricularia oryzae",
                },
                "brown_spot": {
                    "code": "PAD-BRS-002",
                    "name_en": "Paddy Brown Spot",
                    "name_te": "వరి ఆకు మచ్చ తెగులు (Brown Spot)",
                    "scientific_name": "Bipolaris oryzae",
                },
                "dead_heart": {
                    "code": "PAD-DHT-013",
                    "name_en": "Paddy Dead Heart",
                    "name_te": "వరి ఎండు గుండె లక్షణం (Dead Heart)",
                    "scientific_name": "Stem borer damage",
                },
                "downy_mildew": {
                    "code": "PAD-DWM-014",
                    "name_en": "Paddy Downy Mildew",
                    "name_te": "వరి డౌనీ మిల్డ్యూ తెగులు",
                    "scientific_name": "Downy mildew",
                },
                "hispa": {
                    "code": "PAD-HIS-015",
                    "name_en": "Paddy Hispa",
                    "name_te": "వరి హిస్పా పురుగు నష్టం",
                    "scientific_name": "Dicladispa armigera",
                },
                "normal": {
                    "code": "GEN-HLT-010",
                    "name_en": "Healthy Paddy Leaf",
                    "name_te": "ఆరోగ్యకరమైన వరి ఆకు",
                    "scientific_name": "Normal Plant Foliage",
                },
                "tungro": {
                    "code": "PAD-TUN-016",
                    "name_en": "Paddy Tungro",
                    "name_te": "వరి టుంగ్రో తెగులు",
                    "scientific_name": "Rice tungro disease",
                },
            }

            top_candidates = []

            for item in model_prediction["top_predictions"]:
                label = item["class"]
                metadata = MODEL_TO_METADATA.get(label)

                if metadata is None:
                    continue

                top_candidates.append(
                    {
                        "id": label,
                        "code": metadata["code"],
                        "name_en": metadata["name_en"],
                        "name_te": metadata["name_te"],
                        "scientific_name": metadata["scientific_name"],
                        "confidence_pct": item["confidence_percent"],
                        "probability": item["confidence"],
                    }
                )

            if not top_candidates:
                return {
                    "valid": False,
                    "rejection_reason_en": "The vision model could not produce a valid class.",
                    "rejection_reason_te": "విజన్ మోడల్ సరైన వర్గాన్ని గుర్తించలేకపోయింది.",
                    "quality_details": quality,
                    "is_out_of_domain": False,
                }

            primary = top_candidates[0]

            # Preserve the existing decision-confidence logic,
            # but now base it on the real model probability.
            top_prob = float(primary["probability"])

            pred_confidence_pct = float(
                primary["confidence_pct"]
            )

            if simulate_low_confidence or top_prob < 0.45:
                decision_confidence = "LOW"
                decision_state = "VERIFY"
                decision_state_te = "ధృవీకరించండి (VERIFY)"
            elif top_prob < 0.70:
                decision_confidence = "MODERATE"
                decision_state = "MONITOR"
                decision_state_te = "వేచి చూడండి (MONITOR)"
            else:
                decision_confidence = "HIGH"
                decision_state = "ACT_NOW"
                decision_state_te = "ఇప్పుడు చేయండి (ACT NOW)"

        else:
            # Legacy contextual fallback for crops without a trained
            # crop-specific model. This is deliberately not presented
            # as ResNet inference.
            lesion_pct = vitality["lesion_coverage_pct"]
            gy_ratio = vitality["green_yellow_ratio"]

            crop_candidates = [
                d
                for d in DISEASE_CLASSES
                if d["crop"] == crop or d["crop"] == "all"
            ]

            if not crop_candidates:
                crop_candidates = DISEASE_CLASSES

            scores = {}

            for c in crop_candidates:
                base = 10.0
                name_lower = c["name_en"].lower()

                if (
                    "blast" in name_lower
                    and (
                        "మచ్చ" in user_notes
                        or "spot" in user_notes
                        or lesion_pct > 8
                    )
                ):
                    base += 40.0

                if (
                    "brown spot" in name_lower
                    and (
                        "brown" in user_notes
                        or "గోధుమ" in user_notes
                        or lesion_pct > 5
                    )
                ):
                    base += 35.0

                if (
                    "blight" in name_lower
                    and (
                        "ఎండు" in user_notes
                        or "blight" in user_notes
                        or gy_ratio < 1.0
                    )
                ):
                    base += 38.0

                if (
                    "curl" in name_lower
                    and (
                        "ముడత" in user_notes
                        or "curl" in user_notes
                    )
                ):
                    base += 45.0

                if (
                    "rust" in name_lower
                    and (
                        "తుప్పు" in user_notes
                        or "rust" in user_notes
                    )
                ):
                    base += 42.0

                if "healthy" in name_lower:
                    if lesion_pct < 3.0 and gy_ratio > 2.0:
                        base += 60.0
                    else:
                        base = 5.0

                scores[c["id"]] = base + (
                    c["id"] * 3.7
                ) % 15.0

            if simulate_low_confidence:
                for k in scores:
                    scores[k] = 30.0 + (k % 7)

            exp_scores = {
                k: math.exp(v / 15.0)
                for k, v in scores.items()
            }

            sum_exp = sum(exp_scores.values())

            probs = {
                k: exp_scores[k] / sum_exp
                for k in exp_scores
            }

            sorted_candidates = sorted(
                probs.items(),
                key=lambda x: x[1],
                reverse=True,
            )

            top_candidates = []

            for class_id, prob in sorted_candidates[:3]:
                cls_info = next(
                    (
                        d
                        for d in DISEASE_CLASSES
                        if d["id"] == class_id
                    ),
                    None,
                )

                if cls_info:
                    top_candidates.append(
                        {
                            "id": cls_info["id"],
                            "code": cls_info["code"],
                            "name_en": cls_info["name_en"],
                            "name_te": cls_info["name_te"],
                            "scientific_name": cls_info[
                                "scientific_name"
                            ],
                            "confidence_pct": round(
                                prob * 100,
                                1,
                            ),
                            "probability": round(
                                prob,
                                3,
                            ),
                        }
                    )

            primary = top_candidates[0]
            top_prob = primary["probability"]

            pred_confidence_pct = primary[
                "confidence_pct"
            ]

            if (
                simulate_low_confidence
                or top_prob < 0.45
            ):
                decision_confidence = "LOW"
                decision_state = "VERIFY"
                decision_state_te = (
                    "ధృవీకరించండి (VERIFY)"
                )
            elif top_prob < 0.70:
                decision_confidence = "MODERATE"
                decision_state = "MONITOR"
                decision_state_te = (
                    "వేచి చూడండి (MONITOR)"
                )
            else:
                decision_confidence = "HIGH"
                decision_state = "ACT_NOW"
                decision_state_te = (
                    "ఇప్పుడు చేయండి (ACT NOW)"
                )

        # Step 5: Weather context
        weather = weather_override or {
            "temp": 29.2,
            "humidity": 82,
            "rain_forecast_24h_mm": 12.0
        }

        # Step 6: Evidence Cross-Modal Arbitration
        evidence_items = [
            {
                "factor_en": "Photo Lesion Morphology",
                "factor_te": "ఫోటో లక్షణాలు",
                "status": "strong" if lesion_pct > 6 else "moderate",
                "detail_en": f"Visible leaf lesion coverage calculated at {vitality['lesion_coverage_pct']}%.",
                "detail_te": f"ఆకుపై మచ్చల విస్తీర్ణం {vitality['lesion_coverage_pct']}% గా లెక్కించబడింది."
            },
            {
                "factor_en": "Microclimate Humidity",
                "factor_te": "వాతావరణ తేమ",
                "status": "strong" if weather["humidity"] >= 80 else "neutral",
                "detail_en": f"Atmospheric humidity at {weather['humidity']}% supports fungal sporulation.",
                "detail_te": f"గాలిలో తేమ {weather['humidity']}% ఉంది, ఇది శిలీంధ్ర వ్యాప్తికి అనుకూలం."
            },
            {
                "factor_en": "Crop Phenology Stage",
                "factor_te": "పంట ఎదుగుదల దశ",
                "status": "compatible",
                "detail_en": f"Canopy susceptibility typical during {stage} stage.",
                "detail_te": f"{stage} దశలో మొక్కలకు రక్షణ ముఖ్యం."
            }
        ]

        if user_notes:
            evidence_items.append({
                "factor_en": "Farmer Field Observation",
                "factor_te": "రైతు గమనింపు",
                "status": "compatible",
                "detail_en": f"Reported: '{user_notes[:80]}'",
                "detail_te": f"రైతు నివేదించిన అంశం: '{user_notes[:80]}'"
            })

        # Step 7: Active Information-Gathering Questions if confidence is not definitive
        follow_up_questions = []
        if decision_confidence != "HIGH":
            follow_up_questions = [
                {
                    "id": "q1",
                    "question_en": "Where are the lesions primarily localized?",
                    "question_te": "మచ్చలు ప్రధానంగా ఎక్కడ కనిపిస్తున్నాయి?",
                    "options": [
                        {"en": "Lower mature leaves only", "te": "కింది ముదిరిన ఆకులపై మాత్రమే"},
                        {"en": "Newly emerged top shoots", "te": "పైనున్న లేత చిగుళ్ళపై"},
                        {"en": "Scattered across the entire canopy", "te": "మొత్తం చెట్టు అంతటా"}
                    ]
                },
                {
                    "id": "q2",
                    "question_en": "What does the lesion margin look like?",
                    "question_te": "మచ్చల అంచులు ఎలా ఉన్నాయి?",
                    "options": [
                        {"en": "Concentric rings with yellow halo", "te": "వలయాకారపు పసుపు రంగు అంచు"},
                        {"en": "Irregular water-soaked edges", "te": "నీటి తడితో కూడిన క్రమరహిత అంచులు"},
                        {"en": "Dry powder on surface", "te": "ఉపరితలంపై పొడి బూడిద పొర"}
                    ]
                }
            ]

        # Step 8: Safe Agronomic Advisory (Never invent unauthorized chemical dosages)
        advisory = {
            "immediate_action_en": "Sanitize field: Remove heavily affected bottom leaves and discard outside field borders.",
            "immediate_action_te": "పొలం పరిశుభ్రత: తీవ్రంగా తెగులు సోకిన కింది ఆకులను తొలగించి చేనుకు దూరంగా పారవేయండి.",
            "chemical_safety_warning_en": "DO NOT EXCEED DOSAGE. Only use approved bio-formulations (e.g. Trichoderma or 5ml/L Neem oil) or consult your local Agricultural Extension Officer (AEO).",
            "chemical_safety_warning_te": "సిఫార్సు చేసిన మోతాదును మించవద్దు. వేపనూనె లేదా వ్యవసాయ అధికారి (AEO) సూచించిన మందులను మాత్రమే సరైన మోతాదులో వాడండి.",
            "rescan_schedule_hours": 48
        }

        # Step 9: What-if Simulation (Labeled clearly as model scenarios)
        what_if = {
            "if_act_today": {
                "outcome_en": "Prompt canopy aeration and foliar hygiene arrests fungal progression within 48 hours.",
                "outcome_te": "వెంటనే తెగులు సోకిన ఆకులు తీసివేసి తేమ తగ్గిస్తే 48 గంటల్లో వ్యాప్తి ఆగిపోతుంది (AI మోడల్ దృశ్యం).",
                "risk_trend": "decreasing"
            },
            "if_wait": {
                "outcome_en": "High humidity (>80%) without intervention risks secondary sporulation to neighboring plants.",
                "outcome_te": "చర్యలు తీసుకోకపోతే అధిక తేమ వల్ల 2–3 రోజుల్లో పక్క మొక్కలకు విస్తరించే ప్రమాదం ఉంది (AI మోడల్ దృశ్యం).",
                "risk_trend": "increasing"
            }
        }

        return {
            "valid": True,
            "crop": crop,
            "crop_stage": stage,
            "quality": quality,
            "vitality": vitality,
            "primary_diagnosis": primary,
            "top_3_differential": top_candidates,
            "prediction_confidence_pct": pred_confidence_pct,
            "decision_confidence": decision_confidence,
            "decision_state": decision_state,
            "decision_state_te": decision_state_te,
            "evidence_check": {
                "is_overall_match": decision_state != "VERIFY",
                "items": evidence_items
            },
            "follow_up_questions": follow_up_questions,
            "advisory": advisory,
            "what_if": what_if,
            "weather": weather
        }


# Quick test interface
predictor = AgriculturalReasoningEngine()
