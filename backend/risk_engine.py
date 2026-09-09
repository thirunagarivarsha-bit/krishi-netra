"""
KRISHI-NETRA Context-Aware Agricultural Risk Engine.

Deterministic rules only.
No random scores.
No LLM diagnosis.
"""

from typing import Any, Dict, List


DISEASE_GROUPS = {
    "blast": "fungal",
    "brown_spot": "fungal",
    "downy_mildew": "fungal",
    "bacterial_leaf_blight": "bacterial",
    "bacterial_leaf_streak": "bacterial",
    "bacterial_panicle_blight": "bacterial",
    "hispa": "insect",
    "dead_heart": "insect",
    "tungro": "viral",
    "normal": "healthy",
}


def calculate_risk(
    diagnosis: str,
    confidence: float,
    crop: str,
    stage: str,
    weather: Dict[str, Any],
    soil_moisture: float | None = None,
    symptoms: List[str] | None = None,
) -> Dict[str, Any]:
    """
    Calculate context-aware risk from model evidence + field context.

    Risk is an explainable heuristic, not a biological prediction.
    """

    diagnosis_key = diagnosis.lower().strip()
    disease_group = DISEASE_GROUPS.get(
        diagnosis_key,
        "unknown",
    )

    score = 0.0
    evidence = []

    # ---------------------------------------------------------
    # 1. Vision evidence
    # ---------------------------------------------------------

    confidence = max(0.0, min(1.0, float(confidence)))

    if diagnosis_key != "normal":
        vision_points = confidence * 40.0
        score += vision_points

        evidence.append({
            "factor": "vision",
            "effect": round(vision_points, 1),
            "reason": f"AI visual confidence is {confidence:.0%}",
        })

    # ---------------------------------------------------------
    # 2. Humidity
    # ---------------------------------------------------------

    humidity = float(
        weather.get("humidity_percent", 0) or 0
    )

    if humidity >= 85:
        points = 20
        score += points

        evidence.append({
            "factor": "humidity",
            "effect": points,
            "reason": "Very high humidity can increase disease-favorable conditions.",
        })

    elif humidity >= 75:
        points = 12
        score += points

        evidence.append({
            "factor": "humidity",
            "effect": points,
            "reason": "High humidity increases environmental disease pressure.",
        })

    # ---------------------------------------------------------
    # 3. Rain probability
    # ---------------------------------------------------------

    rain_probability = float(
        weather.get(
            "rain_probability_24h_percent",
            0,
        ) or 0
    )

    rainfall = float(
        weather.get(
            "rainfall_next_24h_mm",
            0,
        ) or 0
    )

    if rain_probability >= 70:
        points = 15
        score += points

        evidence.append({
            "factor": "rain_forecast",
            "effect": points,
            "reason": f"Rain probability is {rain_probability:.0f}% in the next 24 hours.",
        })

    elif rain_probability >= 40:
        points = 7
        score += points

        evidence.append({
            "factor": "rain_forecast",
            "effect": points,
            "reason": f"Moderate rain probability of {rain_probability:.0f}%.",
        })

    if rainfall >= 10:
        points = 10
        score += points

        evidence.append({
            "factor": "rainfall",
            "effect": points,
            "reason": f"Forecast rainfall is {rainfall:.1f} mm.",
        })

    # ---------------------------------------------------------
    # 4. Crop stage
    # ---------------------------------------------------------

    stage_key = stage.lower().strip()

    if stage_key in {
        "seedling",
        "vegetative",
        "flowering",
        "reproductive",
    } and diagnosis_key != "normal":

        points = 5
        score += points

        evidence.append({
            "factor": "crop_stage",
            "effect": points,
            "reason": f"Crop is in {stage} stage and requires continued monitoring.",
        })

    # ---------------------------------------------------------
    # 5. Soil moisture
    # ---------------------------------------------------------

    if soil_moisture is not None:

        moisture = float(soil_moisture)

        if moisture >= 80:
            points = 10
            score += points

            evidence.append({
                "factor": "soil_moisture",
                "effect": points,
                "reason": "Very high soil moisture detected.",
            })

        elif moisture <= 20:
            evidence.append({
                "factor": "soil_moisture",
                "effect": 0,
                "reason": "Low soil moisture detected; irrigation decision should consider crop stage.",
            })

    # ---------------------------------------------------------
    # 6. Context compatibility
    # ---------------------------------------------------------

    context_support = 0

    if disease_group == "fungal":
        if humidity >= 75:
            context_support += 1
        if rain_probability >= 60:
            context_support += 1

    elif disease_group == "bacterial":
        if humidity >= 75:
            context_support += 1
        if rainfall > 0:
            context_support += 1

    if context_support >= 2:
        evidence.append({
            "factor": "context_alignment",
            "effect": 10,
            "reason": "Weather conditions support the visual disease hypothesis.",
        })

        score += 10

    # ---------------------------------------------------------
    # Clamp risk
    # ---------------------------------------------------------

    risk_score = round(
        max(0.0, min(100.0, score)),
        1,
    )

    # ---------------------------------------------------------
    # Risk state
    # ---------------------------------------------------------

    if diagnosis_key == "normal":
        risk_state = "LOW"

    elif confidence < 0.55:
        risk_state = "VERIFY"

    elif risk_score >= 70:
        risk_state = "HIGH"

    elif risk_score >= 45:
        risk_state = "MODERATE"

    else:
        risk_state = "LOW"

    # ---------------------------------------------------------
    # Context conflict
    # ---------------------------------------------------------

    conflict = False
    conflict_reason = ""

    if (
        diagnosis_key != "normal"
        and confidence >= 0.55
        and disease_group in {"fungal", "bacterial"}
        and humidity < 60
        and rain_probability < 30
    ):
        conflict = True
        conflict_reason = (
            "Visual evidence suggests disease, "
            "but current weather conditions provide weak environmental support."
        )

        risk_state = "VERIFY"

    # ---------------------------------------------------------
    # Action
    # ---------------------------------------------------------

    if risk_state == "HIGH":
        action = (
            "Inspect nearby plants and follow locally approved "
            "crop-management guidance. Re-scan within 24 hours."
        )

    elif risk_state == "MODERATE":
        action = (
            "Monitor the affected area closely and re-scan "
            "within 24–48 hours."
        )

    elif risk_state == "VERIFY":
        action = (
            "Take another clear photo of the affected leaf "
            "and verify the diagnosis before treatment."
        )

    else:
        action = (
            "Continue routine crop monitoring."
        )

    return {
        "risk_score": risk_score,
        "risk_state": risk_state,
        "disease_group": disease_group,
        "context_conflict": conflict,
        "conflict_reason": conflict_reason,
        "action": action,
        "evidence": evidence,
        "method": "Deterministic Context Rule Engine",
        "disclaimer": (
            "Risk score is an explainable decision-support heuristic, "
            "not a biological disease-progression probability."
        ),
    }