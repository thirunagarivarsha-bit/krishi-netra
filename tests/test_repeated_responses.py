# -*- coding: utf-8 -*-
"""
KRISHI-NETRA Automated Test Suite — Zero Response Duplication & Critical Voice Tests
Validates that 5 completely distinct agricultural queries produce:
1. 5 DISTINCT Intents
2. 5 DISTINCT Agricultural Responses
3. 5 DISTINCT Audio Hashes / Audio URLs
Zero generic fallback answers.
"""

import urllib.request
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:8000"

TEST_QUERIES = [
    {
        "query": "నా వరి ఆకులు పసుపు రంగులోకి మారుతున్నాయి.",
        "expected_intent": "LEAF_YELLOWING",
        "description": "Leaf Yellowing (Chlorosis / Nitrogen)"
    },
    {
        "query": "నా పొలంలో నేల చాలా పొడిగా ఉంది.",
        "expected_intent": "WATER_STRESS",
        "description": "Soil Moisture & Water Stress"
    },
    {
        "query": "వరి బ్లాస్ట్ వ్యాధి అంటే ఏమిటి?",
        "expected_intent": "CROP_DISEASE",
        "description": "Rice Blast Pathogen Overview"
    },
    {
        "query": "నేను నిన్న మందు పిచికారీ చేశాను.",
        "expected_intent": "POST_SPRAY",
        "description": "Post-Spray Protocol & 48h Follow-Up"
    },
    {
        "query": "నా పంటలో పురుగులు కనిపిస్తున్నాయి.",
        "expected_intent": "PEST",
        "description": "Insect Vector Identification & Sticky Traps"
    }
]


def run_repeated_response_test():
    print("==================================================")
    print("KRISHI-NETRA CRITICAL VOICE & INTENT DEDUPLICATION TEST")
    print("==================================================")

    seen_intents = set()
    seen_replies = set()
    seen_audio_urls = set()

    for idx, test_case in enumerate(TEST_QUERIES, 1):
        q = test_case["query"]
        expected = test_case["expected_intent"]
        desc = test_case["description"]

        print(f"\n[QUERY {idx}]: '{q}' ({desc})")

        req = urllib.request.Request(
            f"{BASE_URL}/api/ask",
            data=json.dumps({"message": q, "crop": "paddy", "language": "te-IN"}).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        res = urllib.request.urlopen(req)
        assert res.status == 200, f"Expected 200, got {res.status}"
        data = json.loads(res.read().decode("utf-8"))

        intent = data.get("intent")
        reply = data.get("reply", "")
        audio_info = data.get("audio", {})
        audio_url = audio_info.get("audioUrl", "")
        audio_status = audio_info.get("status", "")

        print(f"  -> Detected Intent: {intent} (Expected: {expected})")
        print(f"  -> Telugu Reply Snippet: {reply[:65]}...")
        print(f"  -> Audio Status: {audio_status} ({audio_info.get('durationSeconds', 0)}s, URL: {audio_url})")

        # Assert correct intent classification
        assert intent == expected, f"Intent mismatch for '{q}': got {intent}, expected {expected}"

        # Assert no identical answers
        assert reply not in seen_replies, f"CRITICAL FAILURE: Query {idx} returned a duplicated reply!"
        assert audio_url not in seen_audio_urls, f"CRITICAL FAILURE: Query {idx} returned a duplicated audio stream!"

        seen_intents.add(intent)
        seen_replies.add(reply)
        seen_audio_urls.add(audio_url)

    print("\n--------------------------------------------------")
    print(f"Total Unique Queries Evaluated: {len(TEST_QUERIES)}")
    print(f"Total Unique Intents Found:     {len(seen_intents)} / {len(TEST_QUERIES)}")
    print(f"Total Unique Telugu Responses:  {len(seen_replies)} / {len(TEST_QUERIES)}")
    print(f"Total Unique Audio Streams:     {len(seen_audio_urls)} / {len(TEST_QUERIES)}")
    print("--------------------------------------------------")

    assert len(seen_replies) == 5, "Expected 5 completely distinct replies!"
    assert len(seen_audio_urls) == 5, "Expected 5 completely distinct audio streams!"
    print("SUCCESS: 0 duplicate replies, 0 reused audio files. Every response is dynamically grounded!")


if __name__ == "__main__":
    try:
        run_repeated_response_test()
    except Exception as e:
        print(f"\nTEST FAILED: {e}")
        sys.exit(1)
