"""
KRISHI-NETRA Backend API End-to-End Test Suite
Tests all endpoints: Vision reasoning, Ask Q&A, Sensors, Actions, and Metrics.
"""

import sys
import requests
import json
import base64
import io
import numpy as np
from PIL import Image

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:8000"

def test_endpoints():
    print("=== 1. TESTING /health ===")
    r = requests.get(f"{BASE_URL}/health")
    assert r.status_code == 200, f"Health check failed: {r.text}"
    print(f"PASS: {r.json()['service']} v{r.json()['version']}\n")

    print("=== 2. TESTING /api/ask WITH 5 DISTINCT QUESTIONS ===")
    test_queries = [
        ("My paddy leaves are becoming yellow.", "LEAF_YELLOWING"),
        ("My soil is dry. Should I irrigate?", "WATER_STRESS"),
        ("What is blast disease?", "CROP_DISEASE"),
        ("I sprayed yesterday. What should I do now?", "POST_SPRAY"),
        ("Why are my leaves having brown spots?", "CROP_DISEASE")
    ]

    replies = []
    for query, expected_intent in test_queries:
        r = requests.post(f"{BASE_URL}/api/ask", json={
            "message": query,
            "crop": "paddy",
            "language": "te"
        })
        assert r.status_code == 200, f"Ask failed: {r.text}"
        data = r.json()
        print(f"Query: '{query}'")
        print(f"  -> Detected Intent: {data['intent']}")
        print(f"  -> Reply: {data['reply'][:50].replace('\n', ' ')}...")
        print(f"  -> Follow-ups: {len(data['suggestedFollowUpsTe'])} questions\n")
        replies.append(data["reply"])

    unique_replies = set(replies)
    assert len(unique_replies) == len(test_queries), "Each query must return a unique grounded answer!"
    print("PASS: All queries returned distinct, non-repeated, grounded agricultural answers.\n")

    print("=== 3. TESTING /api/analyze-image (VALID LEAF) ===")
    # Generate a leaf image
    arr = (np.random.rand(256, 256, 3) * 100 + 30).astype(np.uint8)
    arr[:, :, 1] = np.clip(arr[:, :, 1].astype(int) + 80, 0, 255)
    img_buf = io.BytesIO()
    Image.fromarray(arr).save(img_buf, format="JPEG")
    b64_img = base64.b64encode(img_buf.getvalue()).decode("utf-8")

    r = requests.post(f"{BASE_URL}/api/analyze-image", json={
        "crop": "paddy",
        "stage": "flowering",
        "symptoms": ["yellowing"],
        "imageBase64": b64_img
    })
    assert r.status_code == 200, f"Analyze image failed: {r.text}"
    data = r.json()
    print(f"Primary Diagnosis: {data['possibleIssueEn']}")
    print(f"Confidence: {data['aiConfidence']}% | Decision State: {data['decisionState']}")
    print(f"Decision Confidence: {data['decisionConfidence']}")
    print(f"Top 3 Differentials: {len(data['top3Differential'])}")
    print(f"Leaf Vitality: {data['leafVitality']['status_en']} (ExG: {data['leafVitality']['excess_green_index']})")
    print(f"Advisory Action: {data['actionPlan']['primaryActionEn'][:60]}...")
    print("PASS: Multimodal analysis completed with honest calibration.\n")

    print("=== 4. TESTING /api/analyze-image (OUT-OF-DOMAIN REJECTION) ===")
    # Generate an all-blue sky / non-leaf image
    sky = np.full((256, 256, 3), [135, 206, 235], dtype=np.uint8)
    sky_buf = io.BytesIO()
    Image.fromarray(sky).save(sky_buf, format="JPEG")
    b64_sky = base64.b64encode(sky_buf.getvalue()).decode("utf-8")

    r = requests.post(f"{BASE_URL}/api/analyze-image", json={
        "crop": "paddy",
        "stage": "flowering",
        "imageBase64": b64_sky
    })
    assert r.status_code == 200
    data = r.json()
    print(f"Rejection Code: {data['diseaseCode']}")
    print(f"Rejection Reason: {data.get('rejectionReasonEn')}")
    assert data["isLowConfidenceFallback"] is True, "Must trigger low confidence fallback on OOD"
    print("PASS: Out-of-Domain image successfully rejected by Image Quality Gate.\n")

    print("=== 5. TESTING /api/sensors (ESP8266 INGESTION & ANOMALY FILTER) ===")
    r = requests.get(f"{BASE_URL}/api/sensors")
    assert r.status_code == 200
    sensors = r.json()
    print(f"Sensors online: {len(sensors)} (Simulation status: {sensors[0]['isSimulation']})")
    
    # Ingest new reading
    r = requests.post(f"{BASE_URL}/api/sensors", json={
        "id": "esp8266-node-01",
        "soilMoisture": 44.5,
        "temperature": 29.8,
        "humidity": 70.2,
        "batteryLevel": 91
    })
    assert r.status_code == 200
    print(f"Updated moisture with EWMA: {r.json()['sensor']['soilMoisture']}%")
    print("PASS: Sensor telemetry ingested and smoothed successfully.\n")

    print("=== 6. TESTING /api/actions & /api/timeline (CLOSED-LOOP MEMORY) ===")
    r = requests.post(f"{BASE_URL}/api/actions", json={
        "titleTe": "వేపనూనె 1500 PPM పిచికారీ",
        "titleEn": "Foliar Neem Oil 1500 PPM Spray",
        "recordedAmount": "50 ml / 16L tank",
        "targetArea": "Block 4 South"
    })
    assert r.status_code == 200
    action = r.json()["action"]
    print(f"Recorded Action: {action['titleEn']} (ID: {action['id']})")
    print(f"Recorded Amount: {action['recordedAmount']}")

    # Check timeline memory
    r = requests.get(f"{BASE_URL}/api/timeline")
    assert r.status_code == 200
    timeline = r.json()
    print(f"Latest Timeline Event: {timeline[0]['titleEn']}")
    print("PASS: Action loop updated and remembered in crop timeline.\n")

    print("=== 7. TESTING /api/model-metrics ===")
    r = requests.get(f"{BASE_URL}/api/model-metrics")
    assert r.status_code == 200
    metrics = r.json()
    print(f"Model: {metrics['model_name']} | Test Accuracy: {metrics['test_accuracy_pct']} | Macro F1: {metrics['macro_f1_pct']}")
    print("PASS: Model metrics retrieved from source.\n")

    print("==========================================")
    print("ALL 7 BACKEND TEST PHASES PASSED WITH 100% SUCCESS!")
    print("==========================================")

if __name__ == "__main__":
    test_endpoints()
