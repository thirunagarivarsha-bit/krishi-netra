"""
KRISHI-NETRA Automated Test Suite — TTS Pipeline Verification
Tests server-side neural TTS (/api/tts) for genuine Telugu (te-IN) and English (en-IN).
Validates MIME type, byte integrity, non-zero duration, and streaming endpoint.
"""

import urllib.request
import json
import sys

BASE_URL = "http://127.0.0.1:8000"


def test_telugu_tts():
    print("=== TEST 1: Telugu Neural TTS (/api/tts) ===")
    payload = {
        "text": "నమస్కారం రైతు సోదరులారా. మీ వరి పంటను రక్షించడానికి కృషి-నేత్ర సిద్ధంగా ఉంది.",
        "language": "te-IN"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/tts",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    assert res.status == 200, f"Expected 200, got {res.status}"
    data = json.loads(res.read().decode("utf-8"))

    assert data["available"] is True, "TTS marked as unavailable"
    assert data["language"] == "te-IN", f"Expected te-IN, got {data['language']}"
    assert data["sizeBytes"] > 1000, f"Expected >1000 bytes, got {data['sizeBytes']}"
    assert data["durationSeconds"] > 0, "Duration must be positive"
    assert "data:audio/mp3;base64," in data["audioBase64"], "Base64 data URI missing or invalid"
    assert data["audioUrl"].startswith("/api/tts/audio/"), "Audio URL path invalid"

    print(f"PASS: Telugu TTS generated {data['sizeBytes']} bytes ({data['durationSeconds']}s, engine: {data['engine']})")
    return data["audioUrl"]


def test_english_tts():
    print("\n=== TEST 2: English Neural TTS (/api/tts) ===")
    payload = {
        "text": "Hello farmers. Welcome to KRISHI-NETRA context-aware crop health advisor.",
        "language": "en-IN"
    }
    req = urllib.request.Request(
        f"{BASE_URL}/api/tts",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    assert res.status == 200, f"Expected 200, got {res.status}"
    data = json.loads(res.read().decode("utf-8"))

    assert data["available"] is True, "TTS marked as unavailable"
    assert data["language"] == "en-IN", f"Expected en-IN, got {data['language']}"
    assert data["sizeBytes"] > 1000, f"Expected >1000 bytes, got {data['sizeBytes']}"
    print(f"PASS: English TTS generated {data['sizeBytes']} bytes ({data['durationSeconds']}s)")


def test_audio_streaming(audio_url: str):
    print(f"\n=== TEST 3: Audio Streaming Endpoint ({audio_url}) ===")
    res = urllib.request.urlopen(f"{BASE_URL}{audio_url}")
    assert res.status == 200, f"Expected 200, got {res.status}"
    content_type = res.headers.get("Content-Type", "")
    assert "audio/mpeg" in content_type, f"Expected audio/mpeg, got {content_type}"
    audio_bytes = res.read()
    assert len(audio_bytes) > 1000, "Streamed audio bytes too small"
    print(f"PASS: Streamed {len(audio_bytes)} bytes of audio/mpeg successfully")


if __name__ == "__main__":
    try:
        url = test_telugu_tts()
        test_english_tts()
        test_audio_streaming(url)
        print("\n==========================================")
        print("ALL TTS PIPELINE TESTS PASSED WITH 100% SUCCESS!")
        print("==========================================")
    except Exception as e:
        print(f"\nFAIL: {e}")
        sys.exit(1)
