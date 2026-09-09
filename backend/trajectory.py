from typing import Any, Dict


def _clamp(value: float, low: float = 0.0, high: float = 100.0) -> float:
    return round(max(low, min(high, value)), 1)


def build_risk_trajectory(
    current_risk: float,
    risk_state: str,
    humidity: float,
    rain_probability: float,
    rainfall_mm: float,
    intervention: bool = False,
) -> Dict[str, Any]:
    """
    Deterministic scenario trajectory.

    This is decision-support modelling, NOT a biological
    disease-progression probability.
    """

    current = float(current_risk)

    environmental_pressure = 0.0

    if humidity >= 85:
        environmental_pressure += 8
    elif humidity >= 75:
        environmental_pressure += 5

    if rain_probability >= 70:
        environmental_pressure += 7
    elif rain_probability >= 40:
        environmental_pressure += 3

    if rainfall_mm >= 10:
        environmental_pressure += 4

    if intervention:
        pressure_delta = -6
    else:
        pressure_delta = environmental_pressure * 0.55

    risk_24 = _clamp(current + pressure_delta)
    risk_48 = _clamp(risk_24 + pressure_delta * 0.8)
    risk_7d = _clamp(risk_48 + pressure_delta * 1.2)

    def state(score: float) -> str:
        if score >= 70:
            return "HIGH"
        if score >= 45:
            return "MODERATE"
        if score >= 25:
            return "LOW"
        return "MINIMAL"

    return {
        "method": "Deterministic scenario trajectory",
        "disclaimer": (
            "These are model-based decision scenarios, not biological "
            "disease-progression probabilities."
        ),
        "current": {
            "horizon": "NOW",
            "risk_score": _clamp(current),
            "state": risk_state,
        },
        "h24": {
            "horizon": "24H",
            "risk_score": risk_24,
            "state": state(risk_24),
        },
        "h48": {
            "horizon": "48H",
            "risk_score": risk_48,
            "state": state(risk_48),
        },
        "d7": {
            "horizon": "7D",
            "risk_score": risk_7d,
            "state": state(risk_7d),
        },
    }


def build_counterfactual(
    current_risk: float,
    humidity: float,
    rain_probability: float,
) -> Dict[str, Any]:

    pressure = 0

    if humidity >= 75:
        pressure += 5

    if rain_probability >= 60:
        pressure += 5

    act_score = _clamp(current_risk - 8)
    wait_score = _clamp(current_risk + pressure)

    if act_score < current_risk:
        act_trend = "decreasing"
    else:
        act_trend = "stable"

    if wait_score > current_risk:
        wait_trend = "increasing"
    else:
        wait_trend = "stable"

    return {
        "label": "MODEL SCENARIO — NOT A BIOLOGICAL GUARANTEE",
        "if_act_today": {
            "risk_score": act_score,
            "risk_trend": act_trend,
            "outcome_en": (
                "Model scenario: timely field inspection and "
                "appropriate crop-management action reduce the decision risk."
            ),
            "outcome_te": (
                "మోడల్ పరిస్థితి: సమయానికి పొలాన్ని పరిశీలించి, "
                "తగిన పంట నిర్వహణ చర్య తీసుకుంటే నిర్ణయ ప్రమాదం తగ్గవచ్చు."
            ),
        },
        "if_wait": {
            "risk_score": wait_score,
            "risk_trend": wait_trend,
            "outcome_en": (
                "Model scenario: delaying verification or intervention "
                "can keep environmental risk elevated."
            ),
            "outcome_te": (
                "మోడల్ పరిస్థితి: పరిశీలన లేదా చర్య ఆలస్యం చేస్తే "
                "పర్యావరణ ప్రమాదం ఎక్కువగా ఉండవచ్చు."
            ),
        },
    }
