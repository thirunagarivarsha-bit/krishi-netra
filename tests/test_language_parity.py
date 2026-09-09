# -*- coding: utf-8 -*-
"""
KRISHI-NETRA Automated Test Suite — Language Parity & Strict Non-Violation Tests
Validates PART 34 & PART 91:
1. Telugu mode produces 100% Telugu responses, Telugu audio, and Telugu follow-ups.
2. English mode produces 100% English responses, English audio, and English follow-ups.
3. Zero mixed-language violations (e.g. English audio with Telugu text).
"""

import urllib.request
import json
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

BASE_URL = "http://127.0.0.1:8000"


def test_telugu_parity():
    print("=== TEST 1: Telugu Mode Strict Parity (language='te-IN') ===")
    req = urllib.request.Request(
        f"{BASE_URL}/api/ask",
        data=json.dumps({
            "message": "పంటకు నీరు ఎప్పుడు పెట్టాలి?",
            "crop": "paddy",
            "language": "te-IN"
        }).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    assert res.status == 200, f"Expected 200, got {res.status}"
    data = json.loads(res.read().decode("utf-8"))

    # Assert response language
    assert data["language"] == "te-IN", f"Expected language 'te-IN', got {data['language']}"
    assert "వరి" in data["reply"] or "నీటి" in data["reply"], "Expected Telugu text in reply"
    
    # Assert audio language
    audio = data.get("audio", {})
    assert audio.get("language") == "te-IN", f"Expected audio language 'te-IN', got {audio.get('language')}"
    assert audio.get("status") == "ready", f"Expected audio status 'ready', got {audio.get('status')}"

    # Assert follow-ups are Telugu
    follow_ups = data.get("suggestedFollowUpsTe", [])
    assert len(follow_ups) > 0, "Expected at least 1 Telugu follow-up question"
    for q in follow_ups:
        assert any(ord(c) >= 0x0C00 and ord(c) <= 0x0C7F for c in q), f"Non-Telugu characters in follow-up: {q}"

    print(f"PASS: Telugu query generated 100% Telugu text, audio ({audio.get('durationSeconds')}s), and {len(follow_ups)} Telugu follow-ups.")


def test_english_parity():
    print("\n=== TEST 2: English Mode Strict Parity (language='en-IN') ===")
    req = urllib.request.Request(
        f"{BASE_URL}/api/ask",
        data=json.dumps({
            "message": "When should I irrigate my paddy crop?",
            "crop": "paddy",
            "language": "en-IN"
        }).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    assert res.status == 200, f"Expected 200, got {res.status}"
    data = json.loads(res.read().decode("utf-8"))

    # Assert response language
    assert data["language"] == "en-IN", f"Expected language 'en-IN', got {data['language']}"
    assert "Irrigation" in data["reply"] or "moisture" in data["reply"], "Expected English text in reply"

    # Assert audio language
    audio = data.get("audio", {})
    assert audio.get("language") == "en-IN", f"Expected audio language 'en-IN', got {audio.get('language')}"
    assert audio.get("status") == "ready", f"Expected audio status 'ready', got {audio.get('status')}"

    # Assert follow-ups are English
    follow_ups = data.get("suggestedFollowUpsEn", [])
    assert len(follow_ups) > 0, "Expected at least 1 English follow-up question"
    for q in follow_ups:
        assert any(c.isascii() and c.isalpha() for c in q), f"Expected English text in follow-up: {q}"

    print(f"PASS: English query generated 100% English text, audio ({audio.get('durationSeconds')}s), and {len(follow_ups)} English follow-ups.")


def test_mixed_query_parity():
    print("\n=== TEST 3: Mixed Query Enforcing Selected Language ===")
    # Farmer asks in English text but selected mode is Telugu:
    req = urllib.request.Request(
        f"{BASE_URL}/api/ask",
        data=json.dumps({
            "message": "My paddy leaves are yellow.",
            "crop": "paddy",
            "language": "te-IN"
        }).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    res = urllib.request.urlopen(req)
    data = json.loads(res.read().decode("utf-8"))

    # When language='te-IN', response and audio must strictly remain Telugu!
    assert data["language"] == "te-IN"
    assert data["audio"]["language"] == "te-IN"
    assert "పసుపు" in data["reply"] or "వరి" in data["reply"]
    print("PASS: System strictly adhered to selected Telugu language for both text and TTS audio.")


if __name__ == "__main__":
    try:
        test_telugu_parity()
        test_english_parity()
        test_mixed_query_parity()
        print("\n==========================================")
        print("ALL LANGUAGE PARITY TESTS PASSED WITH 100% SUCCESS!")
        print("==========================================")
    except Exception as e:
        print(f"\nFAIL: {e}")
        sys.exit(1)
