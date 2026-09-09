# Automated Test Suite Results — KRISHI-NETRA

Test execution timestamp: 2026-09-09T18:33:34+05:30  
Environment: Windows 11, Python 3.14, FastAPI 0.141.1, Uvicorn 0.52.4, Node.js v20.18.0

---

## 🧪 Summary of Test Results

| Test Phase | Component / Endpoint | Scenarios Tested | Status |
|---|---|---|---|
| **Phase 1** | `GET /health` | Service online check, classes count | **PASS (100%)** |
| **Phase 2** | `POST /api/ask` | 5 distinct queries (Yellowing, Soil dry, Blast, Post-spray, Brown spots) | **PASS (100% Unique Responses)** |
| **Phase 3** | `POST /api/analyze-image` | Valid leaf image inference, vitality estimation, top-3 differentials | **PASS (100%)** |
| **Phase 4** | `POST /api/analyze-image` | Out-of-Domain rejection (synthetic sky/non-leaf) | **PASS (Rejected properly)** |
| **Phase 5** | `POST /api/sensors` | ESP8266 telemetry ingestion, EWMA smoothing, Hampel outlier filter | **PASS (100%)** |
| **Phase 6** | `POST /api/actions` | Action recorded, dosage stored, 48h timeline event created | **PASS (100%)** |
| **Phase 7** | `GET /api/model-metrics` | ResNet18 benchmarks (49.1% test acc, 42.6% macro-F1) | **PASS (100%)** |
| **Phase 8** | `POST /api/tts` & `/audio` | Neural TTS audio generation in Telugu (64KB MP3) & English (46KB MP3) | **PASS (100%)** |
| **Phase 9** | `test_repeated_responses.py` | 5 core Telugu queries -> 5 unique intents, 5 unique replies, 5 unique audio streams | **PASS (100% Zero Deduplication)** |
| **Phase 10** | `test_language_parity.py` | Telugu mode (100% Telugu text/audio/followups) & English mode (100% English) | **PASS (100% Strict Parity)** |

---

## 📋 Critical Test: Non-Repeated Agronomic Queries

```text
Query 1: 'My paddy leaves are becoming yellow.'
  -> Detected Intent: LEAF_YELLOWING
  -> Reply: వరి పంటలో ఆకులు పసుపు రంగులోకి మారడానికి మూడు ప్రధాన కారణాలు... (Nitrogen vs. waterlogging vs. early chlorosis)

Query 2: 'My soil is dry. Should I irrigate?'
  -> Detected Intent: IRRIGATION
  -> Reply: వరి క్షేత్రంలో సరైన నీటి నిర్వహణ సమయపాలన: • ప్రస్తుత సెన్సార్ సూచన... (Alternate Wetting & Drying AWD)

Query 3: 'What is blast disease?'
  -> Detected Intent: CROP_DISEASE
  -> Reply: వరి అగ్గితెగులు (Rice Blast - Pyricularia oryzae) సమాచారం: • లక్షణాలు... (Diamond/spindle lesions, dew)

Query 4: 'I sprayed yesterday. What should I do now?'
  -> Detected Intent: POST_SPRAY
  -> Reply: నిన్న పిచికారీ చేసిన తర్వాతి పర్యవేక్షణ మార్గదర్శకం: 1. విశ్రాంతి సమయం... (48h follow-up re-scan)

Query 5: 'Why are my leaves having brown spots?'
  -> Detected Intent: CROP_DISEASE
  -> Reply: వరి ఆకులపై గోధుమ రంగు మచ్చలు రావడానికి గల కారణాలు: • సాధారణంగా... (Bipolaris / Cercospora halo)

Result: 5 Queries tested -> 5 Unique, grounded, distinct responses generated. ZERO duplicates.
```

---

## 📷 Critical Test: Image Analysis & Quality Gate

```text
Test A: Valid Leaf Image
  -> Result Valid: True
  -> Primary Diagnosis: Healthy Leaf (88.7% confidence)
  -> Decision State: MONITOR (calibrated)
  -> Leaf Vitality: Healthy & Thriving (Excess Green Index: 0.63)
  -> Cross-Modal Evidence Check: Coherent

Test B: Non-Foliar / Sky Image (Out-of-Domain)
  -> Result Valid: False
  -> Rejection Code: OOD-REJECT
  -> Reason: "No crop leaf detected / Low contrast. Move closer to the affected leaf."
  -> Action: Prompted farmer to retake photo in natural daylight.
```

---

## ⚡ Frontend Bundle & TypeScript Verification

```bash
$ npm run build
vite v8.2.2 building client environment for production...
✓ 1870 modules transformed.
dist/index.html                   1.41 kB │ gzip:   0.83 kB
dist/assets/index-Cps66kk6.css   55.09 kB │ gzip:   9.48 kB
dist/assets/index-CvzZOEup.js   521.00 kB │ gzip: 137.13 kB
✓ built in 7.51s
```
**Exit Code**: `0` (Zero TypeScript or bundling errors).
