"""
KRISHI-NETRA Persistent Data Layer

Maintains:
- Closed-loop crop timeline
- Recorded farmer actions
- Follow-up verification tracking
- Sensor telemetry
- Farmer feedback
- Alerts data

Uses local file-backed JSON storage with atomic writes.
"""

import os
import json
import datetime
from typing import Dict, Any, List


DATA_DIR = os.path.join(
    os.path.dirname(os.path.abspath(__file__)),
    "data"
)

os.makedirs(DATA_DIR, exist_ok=True)

ACTIONS_FILE = os.path.join(DATA_DIR, "actions.json")
TIMELINE_FILE = os.path.join(DATA_DIR, "timeline.json")
SENSORS_FILE = os.path.join(DATA_DIR, "sensors.json")
FEEDBACK_FILE = os.path.join(DATA_DIR, "feedback.json")


# ============================================================
# JSON STORAGE HELPERS
# ============================================================

def _read_json(filepath: str, default: Any) -> Any:
    if not os.path.exists(filepath):
        return default

    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default


def _write_json(filepath: str, data: Any):
    """
    Atomic JSON write.
    Writes to a temporary file first and then replaces
    the original file.
    """
    tmp_path = filepath + ".tmp"

    with open(tmp_path, "w", encoding="utf-8") as f:
        json.dump(
            data,
            f,
            ensure_ascii=False,
            indent=2
        )

    os.replace(tmp_path, filepath)


# ============================================================
# FIELD DATA STORE
# ============================================================

class FieldDataStore:
    """
    Persistent farmer field memory.

    Stores:
    - Farmer actions
    - Follow-up reminders
    - Crop timeline
    - Sensor readings
    - Farmer feedback
    """

    # ========================================================
    # ACTIONS
    # ========================================================

    @classmethod
    def get_actions(cls) -> List[Dict[str, Any]]:
        default_actions = [
            {
                "id": "act-01",
                "titleTe": "కింది ఆకులను పరిశీలించండి",
                "titleEn": "Inspect Lower Leaves",
                "category": "inspection",
                "status": "pending",
                "priority": "urgent",
                "dueDateTe": "ఈ రోజు సాయంత్రం",
                "dueDateEn": "Today",
                "followUpHours": 48,
                "followUpStatus": "pending",
                "recordedAmount": "",
                "targetArea": "Block 4 (0.5 acre)",
                "descriptionTe": "ప్రభావిత ఆకులను జాగ్రత్తగా పరిశీలించండి.",
                "descriptionEn": "Inspect affected leaves carefully."
            },
            {
                "id": "act-02",
                "titleTe": "పొలంలోని కాలువలను పరిశీలించండి",
                "titleEn": "Inspect Field Drainage",
                "category": "irrigation",
                "status": "completed",
                "priority": "recommended",
                "dueDateTe": "పూర్తయింది",
                "dueDateEn": "Completed",
                "followUpHours": 24,
                "followUpStatus": "completed",
                "recordedAmount": "Drainage checked",
                "targetArea": "Entire Field",
                "descriptionTe": "నీరు నిలిచే ప్రాంతాలను పరిశీలించండి.",
                "descriptionEn": "Check areas where standing water may accumulate."
            }
        ]

        return _read_json(
            ACTIONS_FILE,
            default_actions
        )

    # ========================================================
    # RECORD ACTION
    # ========================================================

    @classmethod
    def record_action(
        cls,
        action_payload: Dict[str, Any]
    ) -> Dict[str, Any]:

        actions = cls.get_actions()

        now = datetime.datetime.now()

        # Default follow-up period
        follow_up_hours = int(
            action_payload.get(
                "followUpHours",
                48
            )
        )

        follow_up_at = (
            now +
            datetime.timedelta(
                hours=follow_up_hours
            )
        )

        new_action = {
            "id": f"act-{now.strftime('%Y%m%d%H%M%S%f')}",

            "titleTe": action_payload.get(
                "titleTe",
                "నమోదు చేసిన వ్యవసాయ చర్య"
            ),

            "titleEn": action_payload.get(
                "titleEn",
                "Recorded Field Action"
            ),

            "category": action_payload.get(
                "category",
                "treatment"
            ),

            "status": "completed",

            "priority": action_payload.get(
                "priority",
                "routine"
            ),

            # ------------------------------------------------
            # ACTION TIMING
            # ------------------------------------------------

            "recordedDate": now.isoformat(),

            "followUpHours": follow_up_hours,

            "followUpAt": follow_up_at.isoformat(),

            "followUpStatus": "pending",

            "dueDateTe": (
                f"{follow_up_hours} గంటల తర్వాత "
                f"రీ-స్కాన్ చేయండి"
            ),

            "dueDateEn": (
                f"Re-scan due at "
                f"{follow_up_at.strftime('%Y-%m-%d %H:%M')}"
            ),

            # ------------------------------------------------
            # FARMER ACTION DETAILS
            # ------------------------------------------------

            "productName": action_payload.get(
                "productName"
            ),

            "recordedAmount": action_payload.get(
                "recordedAmount",
                "As recorded by farmer"
            ),

            "targetArea": action_payload.get(
                "targetArea",
                "Field"
            ),

            "operator": action_payload.get(
                "operator",
                "Farmer"
            ),

            "notes": action_payload.get(
                "notes",
                ""
            )
        }

        # Add newest action first
        actions.insert(
            0,
            new_action
        )

        _write_json(
            ACTIONS_FILE,
            actions
        )

        # ----------------------------------------------------
        # ADD ACTION TO CROP TIMELINE
        # ----------------------------------------------------

        cls.append_timeline_event(
            {
                "day": 0,

                "date": now.strftime(
                    "%d %b %Y"
                ),

                "titleTe": (
                    f"చర్య నమోదు: "
                    f"{new_action['titleTe']}"
                ),

                "titleEn": (
                    f"Action Recorded: "
                    f"{new_action['titleEn']}"
                ),

                "health": "watch",

                "risk": None,

                "condition": "action_taken",

                "conditionTe": "చర్య తీసుకున్నారు",

                "conditionEn": "Action Taken",

                "descriptionTe": (
                    f"చర్య: "
                    f"{new_action['titleTe']}. "
                    f"{follow_up_hours} గంటల తర్వాత "
                    f"ఫాలో-అప్ పరిశీలన షెడ్యూల్ చేయబడింది."
                ),

                "descriptionEn": (
                    f"Action recorded: "
                    f"{new_action['titleEn']}. "
                    f"Follow-up verification scheduled "
                    f"in {follow_up_hours} hours."
                ),

                "actionId": new_action["id"],

                "followUpAt": (
                    follow_up_at.isoformat()
                )
            }
        )

        return new_action

    # ========================================================
    # TOGGLE ACTION STATUS
    # ========================================================

    @classmethod
    def toggle_action_status(
        cls,
        action_id: str
    ) -> Dict[str, Any]:

        actions = cls.get_actions()

        for action in actions:

            if action["id"] == action_id:

                current_status = action.get(
                    "status",
                    "pending"
                )

                if current_status == "pending":
                    action["status"] = "completed"
                else:
                    action["status"] = "pending"

                _write_json(
                    ACTIONS_FILE,
                    actions
                )

                return action

        return {}

    # ========================================================
    # FOLLOW-UP STATUS
    # ========================================================

    @classmethod
    def get_follow_up_status(
        cls,
        action_id: str
    ) -> Dict[str, Any]:

        actions = cls.get_actions()

        for action in actions:

            if action["id"] != action_id:
                continue

            follow_up_at_raw = action.get(
                "followUpAt"
            )

            if not follow_up_at_raw:

                return {
                    "actionId": action_id,
                    "status": "not_scheduled"
                }

            try:
                follow_up_at = (
                    datetime.datetime.fromisoformat(
                        follow_up_at_raw
                    )
                )

                now = datetime.datetime.now()

                if action.get(
                    "followUpStatus"
                ) == "completed":

                    status = "completed"

                elif now >= follow_up_at:

                    status = "due"

                else:

                    status = "pending"

                return {
                    "actionId": action_id,
                    "status": status,
                    "followUpAt": follow_up_at.isoformat(),
                    "hoursRemaining": (
                        round(
                            (
                                follow_up_at - now
                            ).total_seconds() / 3600,
                            1
                        )
                        if status == "pending"
                        else 0
                    )
                }

            except Exception:

                return {
                    "actionId": action_id,
                    "status": "invalid_schedule"
                }

        return {}

    # ========================================================
    # GET DUE FOLLOW-UPS
    # ========================================================

    @classmethod
    def get_due_follow_ups(
        cls
    ) -> List[Dict[str, Any]]:

        actions = cls.get_actions()

        now = datetime.datetime.now()

        due_actions = []

        for action in actions:

            if action.get(
                "followUpStatus"
            ) == "completed":
                continue

            follow_up_at_raw = action.get(
                "followUpAt"
            )

            if not follow_up_at_raw:
                continue

            try:

                follow_up_at = (
                    datetime.datetime.fromisoformat(
                        follow_up_at_raw
                    )
                )

                if now >= follow_up_at:

                    action_copy = dict(action)

                    action_copy[
                        "followUpStatus"
                    ] = "due"

                    due_actions.append(
                        action_copy
                    )

            except Exception:
                continue

        return due_actions

    # ========================================================
    # COMPLETE FOLLOW-UP
    # ========================================================

    @classmethod
    def complete_follow_up(
        cls,
        action_id: str
    ) -> Dict[str, Any]:

        actions = cls.get_actions()

        for action in actions:

            if action["id"] == action_id:

                action[
                    "followUpStatus"
                ] = "completed"

                action[
                    "followUpCompletedAt"
                ] = datetime.datetime.now().isoformat()

                _write_json(
                    ACTIONS_FILE,
                    actions
                )

                cls.append_timeline_event(
                    {
                        "day": 0,

                        "date": datetime.datetime.now().strftime(
                            "%d %b %Y"
                        ),

                        "titleTe": "ఫాలో-అప్ పరిశీలన పూర్తయింది",

                        "titleEn": "Follow-Up Verification Completed",

                        "health": "watch",

                        "risk": None,

                        "condition": "verified",

                        "conditionTe": "ధృవీకరించబడింది",

                        "conditionEn": "Verified",

                        "descriptionTe": (
                            "చర్య తర్వాత ఫాలో-అప్ పరిశీలన పూర్తయింది."
                        ),

                        "descriptionEn": (
                            "Post-action follow-up verification completed."
                        ),

                        "actionId": action_id
                    }
                )

                return action

        return {}

    # ========================================================
    # TIMELINE
    # ========================================================

    @classmethod
    def get_timeline(
        cls
    ) -> List[Dict[str, Any]]:

        default_timeline = [
            {
                "day": 35,
                "date": "09 Sep",
                "titleTe": "పూత దశ — ఆకు మచ్చల పరిశీలన",
                "titleEn": "Day 35 — Flowering Foliar Assessment",
                "health": "watch",
                "risk": 42,
                "condition": "stable",
                "conditionTe": "స్థిరంగా ఉంది",
                "conditionEn": "Stable",
                "descriptionTe": "ఆకు మచ్చల విస్తీర్ణం 14%గా నమోదైంది.",
                "descriptionEn": "Lesion area calculated at 14%."
            },
            {
                "day": 32,
                "date": "06 Sep",
                "titleTe": "భారీ వర్షం — నీటి నిల్వ",
                "titleEn": "Day 32 — Heavy Rainfall & Saturation",
                "health": "stressed",
                "risk": 68,
                "condition": "worsening",
                "conditionTe": "ఒత్తిడి ఉంది",
                "conditionEn": "Stressed",
                "descriptionTe": "భారీ వర్షం తర్వాత డ్రైనేజ్ పరిశీలించబడింది.",
                "descriptionEn": "Drainage checked after heavy precipitation."
            },
            {
                "day": 20,
                "date": "25 Aug",
                "titleTe": "మొక్కల ఎదుగుదల — ఆరోగ్యకరమైన స్థితి",
                "titleEn": "Day 20 — Vegetative Vigor Check",
                "health": "healthy",
                "risk": 18,
                "condition": "improving",
                "conditionTe": "బాగుంది",
                "conditionEn": "Thriving",
                "descriptionTe": "మొక్కల పెరుగుదల ఆరోగ్యకరంగా ఉంది.",
                "descriptionEn": "Vigorous canopy development."
            },
            {
                "day": 1,
                "date": "06 Aug",
                "titleTe": "విత్తనం నాటడం & మొలక",
                "titleEn": "Day 1 — Sowing & Germination",
                "health": "healthy",
                "risk": 12,
                "condition": "improving",
                "conditionTe": "మొలక దశ",
                "conditionEn": "Germination",
                "descriptionTe": "విత్తనాలు నాటడం జరిగింది.",
                "descriptionEn": "Seed was sown."
            }
        ]

        return _read_json(
            TIMELINE_FILE,
            default_timeline
        )

    # ========================================================
    # APPEND TIMELINE EVENT
    # ========================================================

    @classmethod
    def append_timeline_event(
        cls,
        event: Dict[str, Any]
    ):

        timeline = cls.get_timeline()

        timeline.insert(
            0,
            event
        )

        _write_json(
            TIMELINE_FILE,
            timeline
        )

    # ========================================================
    # SENSOR DATA
    # ========================================================

    @classmethod
    def get_sensors(
        cls
    ) -> List[Dict[str, Any]]:

        default_sensors = [
            {
                "id": "esp8266-node-01",
                "name": "ESP8266-NODE-01",
                "status": "online",
                "isSimulation": True,
                "soilMoisture": 42.0,
                "temperature": 29.4,
                "humidity": 68.0,
                "batteryLevel": 92,
                "lastSync": "Live",
                "rssi": -64,
                "hasAnomaly": False
            },
            {
                "id": "esp8266-node-02",
                "name": "ESP8266-NODE-02",
                "status": "online",
                "isSimulation": True,
                "soilMoisture": 58.0,
                "temperature": 28.2,
                "humidity": 74.0,
                "batteryLevel": 87,
                "lastSync": "2 minutes ago",
                "rssi": -71,
                "hasAnomaly": False
            }
        ]

        return _read_json(
            SENSORS_FILE,
            default_sensors
        )

    # ========================================================
    # UPDATE SENSOR TELEMETRY
    # ========================================================

    @classmethod
    def update_sensor_telemetry(
        cls,
        payload: Dict[str, Any]
    ) -> Dict[str, Any]:

        sensors = cls.get_sensors()

        node_id = payload.get(
            "id",
            "esp8266-node-01"
        )

        # EWMA smoothing
        #
        # S_t = alpha * Y_t
        #       + (1-alpha) * S_(t-1)

        alpha = 0.35

        for sensor in sensors:

            if sensor["id"] != node_id:
                continue

            raw_moisture = float(
                payload.get(
                    "soilMoisture",
                    sensor["soilMoisture"]
                )
            )

            raw_temp = float(
                payload.get(
                    "temperature",
                    sensor["temperature"]
                )
            )

            raw_humidity = float(
                payload.get(
                    "humidity",
                    sensor["humidity"]
                )
            )

            # ------------------------------------------------
            # Physical sanity / anomaly check
            # ------------------------------------------------

            is_anomaly = (
                raw_moisture < 0
                or raw_moisture > 100
                or raw_temp < 5
                or raw_temp > 55
                or raw_humidity < 10
                or raw_humidity > 100
            )

            if not is_anomaly:

                sensor["soilMoisture"] = round(
                    alpha * raw_moisture
                    + (1 - alpha) * sensor["soilMoisture"],
                    1
                )

                sensor["temperature"] = round(
                    alpha * raw_temp
                    + (1 - alpha) * sensor["temperature"],
                    1
                )

                sensor["humidity"] = round(
                    alpha * raw_humidity
                    + (1 - alpha) * sensor["humidity"],
                    1
                )

            sensor["hasAnomaly"] = is_anomaly

            sensor["lastSync"] = (
                datetime.datetime.now().strftime(
                    "%H:%M:%S"
                )
            )

            sensor["isSimulation"] = payload.get(
                "isSimulation",
                True
            )

            break

        _write_json(
            SENSORS_FILE,
            sensors
        )

        return next(
            (
                sensor
                for sensor in sensors
                if sensor["id"] == node_id
            ),
            {}
        )

    # ========================================================
    # FEEDBACK
    # ========================================================

    @classmethod
    def store_feedback(
        cls,
        payload: Dict[str, Any]
    ):

        feedback_list = _read_json(
            FEEDBACK_FILE,
            []
        )

        feedback_list.append(
            {
                "timestamp": (
                    datetime.datetime.now().isoformat()
                ),
                **payload
            }
        )

        _write_json(
            FEEDBACK_FILE,
            feedback_list
        )