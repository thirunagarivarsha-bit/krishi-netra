# Known Limitations & Honest Engineering Disclosures — KRISHI-NETRA

In adherence to scientific integrity and responsible AI deployment, this document details known limitations of the prototype.

---

## 1. Baseline Model Performance
- The current visual classifier baseline (ResNet-18) achieves approximately **49.1% held-out test accuracy** and **42.6% macro-F1** across 10 disease classes.
- While it reliably distinguishes healthy foliage from severe necrotic lesions and leaf curling, subtle early-stage foliar spotting requires regional field validation and localized dataset fine-tuning.
- We do **NOT** claim 100% diagnostic accuracy. The system enforces an honest **Low Confidence Fallback / VERIFY FIRST** state whenever confidence drops below 45% or signals clash.

---

## 2. Chemical Dosage Safety & Protective Boundaries
- KRISHI-NETRA **never freely generates or hallucinates chemical pesticide dosages**.
- When chemical or bio-fungicide interventions are displayed, they are strictly restricted to verified non-lethal organic formulations (e.g. 5ml/L Neem Oil, Trichoderma bio-agents) or university extension advisories (ICAR/ANGRAU).
- The system includes a mandatory safety warning: `DO NOT EXCEED DOSAGE. Consult your local Agriculture Extension Officer (AEO) before applying synthetic chemicals.`

---

## 3. Chlorophyll vs. Leaf Vitality Estimation
- A phone camera RGB sensor does **not** directly measure biological chlorophyll concentrations.
- KRISHI-NETRA honestly refers to its metric as a **"Leaf Vitality Estimate"** computed via color space heuristics (Excess Green Index, Green/Yellow ratio, and lesion percentage).
- Physical chlorophyll readings require specialized optical absorption sensors (SPAD meters), which are supported as future hardware integrations.

---

## 4. IoT Sensor Telemetry
- The low-cost ESP8266 field node architecture is designed for capacitive soil moisture, DHT22 ambient temperature/humidity, and BH1750 ambient light.
- When physical hardware is not tethered via serial/MQTT, telemetry readings are clearly labeled **`SIMULATED`** in the interface.
- Parameters such as soil pH and NPK require specialized analog electrodes (e.g. via ADS1115 ADC multiplexers) and are not simulated as fake live values.

---

## 5. Offline & Network Dependency
- The React application is structured as an installable Progressive Web App (PWA) with client-side caching.
- However, complex image reasoning requires a lightweight connection to the local or cloud FastAPI inference service. If offline, the interface explicitly alerts the farmer rather than providing fake offline diagnoses.

---

## 6. Out-of-Domain (OOD) Visual Gate
- The system includes a foliar presence gate requiring at least 10% green vegetation pixels before inference.
- Highly abnormal non-plant objects (e.g., walls, shoes, roads, faces) are rejected. Extremely low lighting (<35 lx) or heavy motion blur triggers an immediate prompt to retake the photo in daylight.
