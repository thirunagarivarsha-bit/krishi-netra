# KRISHI-NETRA (కృషి-నేత్ర)
### AI-Powered Crop Health & Risk Advisory Platform for Smallholder Farmers

> **మీ పంటను చూసుకోండి. సరైన నిర్ణయం తీసుకోండి.**  
> *"Watch your crop. Make the right decision."*

KRISHI-NETRA is a farmer-first, mobile-first agricultural intelligence platform engineered specifically for smallholder farmers. It delivers instant leaf diagnosis, spatio-temporal disease risk forecasting, cross-modal evidence arbitration, counterfactual "what-if" simulations, and natural Telugu voice and sign-assistance guidance.

---

## 🌾 Key Highlights & Innovation

1. **Farmer-First First Screen ("How to Use KRISHI-NETRA")**:
   - 4 large visual steps (📷 Take Photo, 🌱 Select Crop, 🎤 Speak in Telugu, 🤖 Get AI Advice).
   - Instant audio read-aloud button (**🔊 వినండి**) in simple, natural Telugu.
   - Zero confusing machine learning jargon on farmer screens.

2. **Bilingual Telugu-Primary Interface (`తెలుగు | English`)**:
   - Natural, respectful Telugu terminology designed for low digital literacy.
   - 1-click seamless toggle between Telugu and English.

3. **Guided 4-Step Crop Scan Wizard**:
   - **Step 1 (Photo)**: Camera viewfinder, gallery upload, leaf positioning tips, plus 4 pre-loaded crop leaves (Cotton, Paddy, Chilli, Maize) for quick demonstration.
   - **Step 2 (Crop)**: 🌾 Paddy (వరి), 🌱 Cotton (పత్తి), 🌶 Chilli (మిర్చి), 🌽 Maize (మొక్కజొన్న).
   - **Step 3 (Stage)**: Seedling, Growing, Flowering, Fruiting, Maturity.
   - **Step 4 (Symptoms & Voice)**: Visual selectable symptom cards + active Telugu speech-to-text recording with animated audio feedback.

4. **Progressive Live AI Analysis Timeline**:
   - Real-time 7-stage pipeline animation:
     1. Photo quality checked
     2. Crop analyzed
     3. Symptoms detected
     4. Weather checked
     5. Crop stage considered
     6. Risk calculated
     7. Recommendation prepared

5. **Decision Support & Explainability**:
   - **Status Badge**: *గమనించాలి* (Watch) / *సాధ్యమైన సమస్య* (Cotton Leaf Disease).
   - **AI Confidence**: 84% calibrated confidence with an honest **Low Confidence Fallback** state when evidence is insufficient.
   - **"Why?" Section (*ఇలా ఎందుకు చెబుతున్నాం?*)**: Plain-language field factors (leaf spots, humidity > 82%, rainfall, flowering stage, farmer notes).
   - **Risk Forecast (*రాబోయే రోజుల్లో పంట ప్రమాదం*)**: Temporal trajectory across Now, 24h, 48h, 7d with clear *AI అంచనా* (prediction, not guarantee) labels.
   - **Evidence Check (*ఆధారాల పరిశీలన*)**: Cross-modal verification between Photo, Weather, Stage, and Farmer Observation with conflict warnings if signals clash.
   - **Priority Action (*ఇప్పుడు ఏమి చేయాలి?*)**: Single clear priority action, observation checklist, and re-scan schedule without unsafe chemical dosages.
   - **"What If I Wait?" (*నేను ఇప్పుడు ఏమీ చేయకపోతే?*)**: Comparative simulation of immediate intervention (Risk ↓) vs delaying action (Risk ↑).

6. **Telugu Voice Interaction**:
   - High-clarity Telugu text-to-speech with Play (🔊), Pause (⏸), and Replay (🔁) controls.
   - Synchronized visual subtitles.

7. **🤟 Gesture & Sign Assistance**:
   - Dedicated accessibility mode for farmers with hearing or speech challenges.
   - Camera interface recognizing 9 constrained agricultural intents (*Disease, Water, Pest, Help, Yes, No, Stop, Treatment, Worsening*) with immediate Telugu translations and advice.

8. **Continuous Field Health & Timeline**:
   - Not a one-time disease detector: tracks Day 1, Day 4, Day 7, Day 10 progress.
   - Trajectory markers (*Improving, Stable, Worsening*) and "Scan Again" comparison.

9. **Live Crop Risk Monitor & Alerts**:
   - Multi-sensor tracking of humidity, rainfall, temperature, stage, and disease signals.
   - Proactive risk escalation alerts and follow-up reminders.

10. **Judge / Intelligence View**:
    - Complete 9-step end-to-end architecture pipeline diagram.
    - Model calibration and multi-task confidence meters.
    - SHAP-style Explainable AI feature contribution bar chart.

11. **1-Click Hackathon Demo Mode**:
    - Floating judge controller providing an automated or step-by-step walkthrough across the full 10-step evaluation journey.

---

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Canvas Confetti.
- **Speech & Audio**: Web Speech API (`SpeechSynthesis` & `SpeechRecognition` in `te-IN`), Web Audio API chime synthesis.
- **Backend API Layer**: FastAPI (Python 3.14) with REST endpoints:
  - `POST /api/analyze-image`
  - `GET /api/risk-prediction`
  - `GET /api/evidence-check`
  - `GET /api/recommendation`
  - `POST /api/gesture/recognize`
  - `GET /api/field`
  - `GET /api/alerts`
  - `GET /api/live-risk`
  - `POST /api/feedback`

---

## 🚀 Running the Project

### Frontend
```bash
# Install dependencies
npm install

# Run Vite dev server
npm run dev

# Build for production
npm run build
```

### Backend (FastAPI)
```bash
# Install Python backend dependencies
pip install -r backend/requirements.txt

# Run FastAPI server on port 8000
python backend/main.py
# Or with uvicorn:
uvicorn backend.main:app --reload --port 8000
```
