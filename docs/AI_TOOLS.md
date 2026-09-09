# AI Tools & Attribution Disclosure — KRISHI-NETRA

This document outlines the usage of AI development tools, models, and public datasets in accordance with hackathon governance and responsible AI principles.

---

## 🤖 Development Environment & AI Assistance
- **Development Tool**: Google DeepMind Antigravity AI agentic coding assistant.
- **Role of Tool**: Pair programming, refactoring frontend React/TypeScript components, scaffolding FastAPI endpoints, writing test suites, and setting up responsive Tailwind CSS layouts.
- **Engineering Principle**: Antigravity is the development accelerator; it is NOT the crop intelligence. The actual agricultural reasoning pipeline is composed of deterministic computer vision, the ResNet18 convolutional baseline, grounded agronomic knowledge rules, and calibrated decision arbitration.

---

## 🧠 ML Models & Computer Vision Components
1. **ResNet-18 (Residual Neural Network)**:
   - Architecture: Deep 18-layer residual CNN with skip connections.
   - Purpose: Baseline foliar pattern feature extraction and disease probability ranking.
   - Dataset: Public Agricultural benchmark dataset covering Paddy (Blast, Brown Spot, BLB, Scald, Sheath Blight), Cotton (Cercospora, BLB), Chilli (Leaf Curl), and Maize (Rust).
   - Baseline Metrics: ~49.1% held-out test accuracy, ~42.6% macro-F1 (reported honestly in `ml/models/metrics.json`).
2. **Deterministic Pre-Flight Quality Gate (OpenCV / Pillow)**:
   - Laplacian variance for blur detection ($\text{Var}(\nabla^2 I) \ge 35$).
   - Excess Green Index ($\text{ExG} = 2G - R - B$) and vegetation coverage ratio ($\ge 10\%$) for out-of-domain rejection.
   - Illumination & contrast evaluation.
3. **RGB Leaf Vitality Estimator**:
   - Excess Green Index (ExG) + Green-to-Yellow ratio ($G/Y$) + necrosis lesion surface coverage percentage.
   - Explicitly labeled as an *RGB Camera Estimate*, not a physical calibrated chlorophyll probe.

---

## 🗣️ Speech & Accessibility Services
- **Browser Web Speech API**: Native client-side speech recognition (`webkitSpeechRecognition` with `te-IN` and `en-IN` language codes) and speech synthesis (`SpeechSynthesisUtterance`).
- **Telemetry & Audio**: Native Web Audio API procedural synthesis for tactile interaction chimes and feedback.
- **Visual Fallback**: Synchronized on-screen subtitles and visual sign gesture mode ensuring full accessibility for farmers with hearing or speech challenges.
