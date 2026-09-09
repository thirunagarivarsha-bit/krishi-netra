"""
KRISHI-NETRA Persistent Data Layer
Maintains closed-loop crop timeline, recorded actions, sensor telemetry, and alerts.
Uses local file-backed JSON store with atomic writes.
"""

import os
import json
import datetime
from typing import Dict, Any, List

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

ACTIONS_FILE = os.path.join(DATA_DIR, "actions.json")
TIMELINE_FILE = os.path.join(DATA_DIR, "timeline.json")
SENSORS_FILE = os.path.join(DATA_DIR, "sensors.json")
FEEDBACK_FILE = os.path.join(DATA_DIR, "feedback.json")


def _read_json(filepath: str, default: Any) -> Any:
    if not os.path.exists(filepath):
        return default
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def _write_json(filepath: str, data: Any):
    tmp_path = filepath + ".tmp"
    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    os.replace(tmp_path, filepath)


class FieldDataStore:
    """Manages farmer actions, sensor readings, and crop timeline memory."""

    @classmethod
    def get_actions(cls) -> List[Dict[str, Any]]:
        default_actions = [
            {
                "id": "act-01",
                "titleTe": "కింది ఆకులను పరిశీలించండి — వేపనూనె లేదా బయో-ఫంగిసైడ్ పిచికారీ చేయండి",
                "titleEn": "Inspect Lower Leaves — Apply Bio-Fungicide",
                "category": "treatment",
                "status": "pending",
                "priority": "urgent",
                "dueDateTe": "ఈరోజు సాయంత్రం 05:00 లోపు",
                "dueDateEn": "Today by 5:00 PM",
                "followUpHours": 48,
                "recordedAmount": "40 g / 16L knapsack",
                "targetArea": "Block 4 (0.5 acre)",
                "descriptionTe": "గాలిలో తేమ 80% దాటినందున ఆకు మచ్చల నివారణకు సిఫార్సు చేయబడింది.",
                "descriptionEn": "Foliar application to arrest fungal spore dissemination."
            },
            {
                "id": "act-02",
                "titleTe": "పొలంలో కాలువలు తీసి నిలిచిన అదనపు తేమను తొలగించండి",
                "titleEn": "Clear field furrows to drain standing water",
                "category": "irrigation",
                "status": "completed",
                "priority": "recommended",
                "dueDateTe": "నిన్న మధ్యాహ్నం (Completed)",
                "dueDateEn": "Yesterday Afternoon",
                "followUpHours": 24,
                "recordedAmount": "Drainage channels opened",
                "targetArea": "Entire Field",
                "descriptionTe": "నేల ఉపరితలం త్వరగా ఆరిపోయేలా గట్ల వెంబడి నీటిని బయటకు పంపించారు.",
                "descriptionEn": "Drainage cleared to lower canopy microclimate humidity."
            }
        ]
        return _read_json(ACTIONS_FILE, default_actions)

    @classmethod
    def record_action(cls, action_payload: Dict[str, Any]) -> Dict[str, Any]:
        actions = cls.get_actions()
        new_action = {
            "id": f"act-{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}",
            "titleTe": action_payload.get("titleTe", "రైతు నమోదు చేసిన చర్య"),
            "titleEn": action_payload.get("titleEn", "Recorded Field Action"),
            "category": action_payload.get("category", "treatment"),
            "status": "completed",
            "priority": "routine",
            "recordedDate": datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
            "dueDateTe": "48 గంటల అనంతరం రీ-స్కాన్",
            "dueDateEn": "Re-scan due in 48h",
            "followUpHours": 48,
            "productName": action_payload.get("productName", "Bio-Fungicide Formulation"),
            "recordedAmount": action_payload.get("recordedAmount", "As recorded by farmer"),
            "targetArea": action_payload.get("targetArea", "Field Block 4"),
            "operator": action_payload.get("operator", "Ramu (Farmer)"),
            "notes": action_payload.get("notes", "")
        }
        actions.insert(0, new_action)
        _write_json(ACTIONS_FILE, actions)

        # Append to timeline
        cls.append_timeline_event({
            "day": 35,
            "date": datetime.datetime.now().strftime("%d %b"),
            "titleTe": f"చర్య నమోదు: {new_action['titleTe']}",
            "titleEn": f"Action Recorded: {new_action['titleEn']}",
            "health": "watch",
            "risk": 38,
            "condition": "improving",
            "conditionTe": "మెరుగవుతోంది",
            "conditionEn": "Improving",
            "descriptionTe": f"మోతాదు: {new_action['recordedAmount']} • 48 గంటల ఫాలో-అప్ షెడ్యూల్ చేయబడింది.",
            "descriptionEn": f"Recorded dosage: {new_action['recordedAmount']} • Follow-up scheduled in 48h."
        })

        return new_action

    @classmethod
    def toggle_action_status(cls, action_id: str) -> Dict[str, Any]:
        actions = cls.get_actions()
        for a in actions:
            if a["id"] == action_id:
                a["status"] = "completed" if a["status"] == "pending" else "pending"
                _write_json(ACTIONS_FILE, actions)
                return a
        return {}

    @classmethod
    def get_timeline(cls) -> List[Dict[str, Any]]:
        default_timeline = [
            {
                "day": 35,
                "date": "09 సెప్టెంబర్ (నేడు)",
                "titleTe": "పూత దశ — ఆకు మచ్చల పరిశీలన",
                "titleEn": "Day 35 — Flowering Foliar Assessment",
                "health": "watch",
                "risk": 42,
                "condition": "stable",
                "conditionTe": "నిలకడగా ఉంది",
                "conditionEn": "Stable",
                "descriptionTe": "ఆకు మచ్చల విస్తీర్ణం 14% గా నమోదు. నివారణ చర్యలు ప్రారంభించబడ్డాయి.",
                "descriptionEn": "Lesion area calculated at 14%. Treatment spray scheduled."
            },
            {
                "day": 32,
                "date": "06 సెప్టెంబర్",
                "titleTe": "భారీ వర్షం — నీటి నిల్వ",
                "titleEn": "Day 32 — Heavy Rainfall & Saturation",
                "health": "stressed",
                "risk": 68,
                "condition": "worsening",
                "conditionTe": "ఒత్తిడి ఉంది",
                "conditionEn": "Stressed",
                "descriptionTe": "28 మి.మీ వర్షపాతం. కాలువలు శుభ్రం చేసి నీటిని బయటకు పంపించారు.",
                "descriptionEn": "28mm precipitation recorded. Drainage cleared to reduce humidity."
            },
            {
                "day": 20,
                "date": "25 ఆగస్టు",
                "titleTe": "మొక్కల ఎదుగుదల — ఆరోగ్యకరమైన చేను",
                "titleEn": "Day 20 — Vegetative Vigor Check",
                "health": "healthy",
                "risk": 18,
                "condition": "improving",
                "conditionTe": "బాగుంది",
                "conditionEn": "Thriving",
                "descriptionTe": "మొక్కలు ఏపుగా పెరిగాయి, ఆకులు ఆకుపచ్చగా ఉన్నాయి.",
                "descriptionEn": "Vigorous canopy development, zero pathogen signal."
            },
            {
                "day": 1,
                "date": "06 ఆగస్టు",
                "titleTe": "విత్తనం నాటడం & మొలక",
                "titleEn": "Day 1 — Sowing & Germination",
                "health": "healthy",
                "risk": 12,
                "condition": "improving",
                "conditionTe": "మొలక దశ",
                "conditionEn": "Germination",
                "descriptionTe": "విత్తన శుద్ధి చేసిన విత్తనాలు నాటడం జరిగింది.",
                "descriptionEn": "Certified treated seed sown under optimal soil moisture."
            }
        ]
        return _read_json(TIMELINE_FILE, default_timeline)

    @classmethod
    def append_timeline_event(cls, event: Dict[str, Any]):
        timeline = cls.get_timeline()
        timeline.insert(0, event)
        _write_json(TIMELINE_FILE, timeline)

    @classmethod
    def get_sensors(cls) -> List[Dict[str, Any]]:
        default_sensors = [
            {
                "id": "esp8266-node-01",
                "name": "ESP8266-NODE-01 (దక్షిణ పత్తి చేను)",
                "status": "online",
                "isSimulation": True,
                "soilMoisture": 42.0,
                "temperature": 29.4,
                "humidity": 68.0,
                "batteryLevel": 92,
                "lastSync": "ఇప్పుడే (Live)",
                "rssi": -64,
                "hasAnomaly": False
            },
            {
                "id": "esp8266-node-02",
                "name": "ESP8266-NODE-02 (ఉత్తర వరి చేను)",
                "status": "online",
                "isSimulation": True,
                "soilMoisture": 58.0,
                "temperature": 28.2,
                "humidity": 74.0,
                "batteryLevel": 87,
                "lastSync": "2 నిమిషాల క్రితం",
                "rssi": -71,
                "hasAnomaly": False
            }
        ]
        return _read_json(SENSORS_FILE, default_sensors)

    @classmethod
    def update_sensor_telemetry(cls, payload: Dict[str, Any]) -> Dict[str, Any]:
        sensors = cls.get_sensors()
        node_id = payload.get("id", "esp8266-node-01")

        # EWMA Smoothing: S_t = alpha * Y_t + (1 - alpha) * S_{t-1}
        alpha = 0.35
        for s in sensors:
            if s["id"] == node_id:
                raw_moisture = float(payload.get("soilMoisture", s["soilMoisture"]))
                raw_temp = float(payload.get("temperature", s["temperature"]))
                raw_humidity = float(payload.get("humidity", s["humidity"]))

                # Outlier / Anomaly filter (Hampel-style physical sanity check)
                is_anomaly = (
                    raw_moisture < 0 or raw_moisture > 100 or
                    raw_temp < 5 or raw_temp > 55 or
                    raw_humidity < 10 or raw_humidity > 100
                )

                if not is_anomaly:
                    s["soilMoisture"] = round(alpha * raw_moisture + (1 - alpha) * s["soilMoisture"], 1)
                    s["temperature"] = round(alpha * raw_temp + (1 - alpha) * s["temperature"], 1)
                    s["humidity"] = round(alpha * raw_humidity + (1 - alpha) * s["humidity"], 1)
                
                s["hasAnomaly"] = is_anomaly
                s["lastSync"] = datetime.datetime.now().strftime("%H:%M:%S")
                s["isSimulation"] = payload.get("isSimulation", True)
                break

        _write_json(SENSORS_FILE, sensors)
        return next((s for s in sensors if s["id"] == node_id), {})

    @classmethod
    def store_feedback(cls, payload: Dict[str, Any]):
        feedback_list = _read_json(FEEDBACK_FILE, [])
        feedback_list.append({
            "timestamp": datetime.datetime.now().isoformat(),
            **payload
        })
        _write_json(FEEDBACK_FILE, feedback_list)
