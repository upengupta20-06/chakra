# Cyclone Intelligence — AI-Based Tropical Cyclone Identification, Classification, Prediction & Early-Warning Platform

[![Smart India Hackathon](https://img.shields.io/badge/SIH-2026-blue.svg)](https://sih.gov.in/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite%20%2B%20TS-61DAFB.svg)](https://react.dev/)
[![TensorFlow](https://img.shields.io/badge/ML-ConvLSTM%20%2B%20Transformer-FF6F00.svg)](https://tensorflow.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

An operational scientific meteorological intelligence platform developed for the **Smart India Hackathon (SIH)** problem statement:

> *"To develop an Artificial Intelligence (AI) / Machine Learning (ML) based system for identification, classification, and prediction of different tropical cyclone patterns using multi-source satellite data."*

---

## 🌪️ Executive Summary & Workflow

The platform provides an end-to-end, scientifically validated spatiotemporal pipeline:

$$\mathbf{OBSERVE} \longrightarrow \mathbf{IDENTIFY} \longrightarrow \mathbf{CLASSIFY} \longrightarrow \mathbf{CHARACTERIZE} \longrightarrow \mathbf{DETECT\ EVOLUTION} \longrightarrow \mathbf{PREDICT} \longrightarrow \mathbf{EXPLAIN} \longrightarrow \mathbf{VISUALIZE}$$

```
MULTI-CHANNEL SATELLITE SEQUENCE (T=4: t-9h, t-6h, t-3h, t) [128×128×4]
                         │
                         ▼
        TimeDistributed 2D CNN (Spatial Feature Extraction)
                         │
                         ▼
             ConvLSTM2D (Temporal Feature Extraction)
                         │
                         ▼
       Temporal Tokens + Positional Embedding + Transformer Encoder
                         │
                         ▼
             SHARED CYCLONE REPRESENTATION (32-D Embedding)
                         │
        ┌────────────────┼────────────────┬────────────────┐
        ▼                ▼                ▼                ▼
   Vmax (kt)        Intensity Class     MSLP (hPa)       R35 Hazard
   Regression        (7 Categories)     Inference        Footprint
        │                │                │                │
        └────────────────┼────────────────┴────────────────┘
                         │
                         ▼
          Temporal Trend / Life-Cycle / Forecast Engine
                         │
                         ▼
          Explainable AI (Grad-CAM) + Uncertainty Analysis
                         │
                         ▼
       Cyclone Intelligence Meteorological Dashboard & Windy Live
```

---

## 🛰️ Multi-Source Satellite Datasets

The platform integrates two principal historical datasets with strict data provenance badges:

1. **TCIR-Derived Multi-Spectral Satellite Data** (`[TCIR]`):
   - **IR1 (Infrared 10.8 µm)**: Resolves cloud-top brightness temperature; depicts eyewall convection.
   - **WV (Water Vapor 6.7 µm)**: Highlights upper-tropospheric humidity and dry environmental intrusions.
   - **VIS (Visible 0.65 µm)**: High-resolution daytime solar reflectance and cloud texture.
   - **PMW (Passive Microwave 85–91 GHz)**: Penetrates upper cirrus to reveal internal eyewall rings and rainbands.
   - Image Dimensions: $128 \times 128 \times 4$ across 21,076 historical timestamps.
2. **NOAA ADT-HURSAT Historical Descriptors** (`[NOAA ADT-HURSAT]`):
   - Current Intensity (CI), Raw T-number, Final T-number, Eye Size, Cloud Symmetry, Central Dense Overcast (CDO) Size, and Radius of Maximum Wind (RMW).
   - Segregated as a secondary ground-truth verification layer.
3. **Live Windy.com Integration** (`[LIVE WINDY]`):
   - Real-time ECMWF atmospheric streamlines, satellite radar, and wind field comparative monitoring.

---

## 🔬 Core Capabilities & SIH Differentiation

| Module | Technical Implementation | Metric / Output |
| :--- | :--- | :--- |
| **Intensity Estimation** | ConvLSTM + Transformer sequence regression | Numerical $V_{max}$ in knots (MAE = 7.98 kt, $R^2 = 0.76$) |
| **Intensity Classification** | 7-Class Saffir-Simpson / WMO scheme | TD (&lt;34 kt), TS (34-63), Cat 1 (64-82), Cat 2 (83-95), Cat 3 (96-112), Cat 4 (113-136), Cat 5 (≥137 kt) |
| **Rapid Intensification (RI)** | Multi-step temporal velocity engine ($\Delta V_{max} / \Delta t$) | Flagged when $\Delta V_{max} \ge 10\text{ kt}/6\text{h}$ or $\ge 30\text{ kt}/24\text{h}$ |
| **Life-Cycle Analysis** | Thermodynamic trend and organization state | `GENESIS` $\rightarrow$ `ORGANIZATION` $\rightarrow$ `INTENSIFICATION` $\rightarrow$ `MATURE` $\rightarrow$ `WEAKENING` $\rightarrow$ `DISSIPATION` |
| **Short-Term Forecasting** | Inertial damped temporal projection | Horizon $+3\text{h}$ and $+6\text{h}$ (longer horizons marked unavailable) |
| **R35 Hazard Footprint** | Geodesic gale-force wind radius | Visualized as an interactive footprint circle on Leaflet map |
| **Explainable AI (XAI)** | Grad-CAM spatial heatmap + channel gradient energy | Attribution heatmap overlay + sensor contribution % (IR%, WV%, VIS%, PMW%) |
| **Missing-Sensor Robustness** | Dynamic sensor dropout simulation | Evaluates model confidence under degraded conditions (e.g. IR only, nighttime) |
| **Historical Similarity** | 32-D latent embedding cosine distance | Top-4 most similar historical benchmark patterns with % similarity |
| **Early-Warning Alerts** | Algorithmic hazard trigger engine | Real-time alerts for RI, Major Category 3+, and expansive wind fields |

---

## 🚀 Quickstart & Installation

### Prerequisites
- Python 3.10 or 3.11
- Node.js 18+ and npm

### 1. Configure Paths
Copy the environment template:
```bash
cp .env.example .env
```
Edit `.env` to point to your local dataset files (defaults to `C:\SIH26` with automatic path discovery):
```env
DATA_ROOT=C:\SIH26
CYCLONE_H5_PATH=C:\SIH26\Cyclone_Images.h5
CYCLONE_METADATA_PATH=C:\SIH26\cyclone_metadata.csv
MODEL_PATH=C:\SIH26\best_cyclone_model.keras
```

### 2. Run Single-Click Launcher (Windows)
```cmd
start_platform.bat
```

### 3. Or Launch Manually

#### Backend:
```bash
cd backend
python -m pip install -r requirements.txt
python run_backend.py
```
Backend API will be available at: `http://127.0.0.1:8000` (Swagger UI at `/docs`).

#### Frontend:
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Client will be available at: `http://127.0.0.1:5173`.

---

## 🧪 Verification & Test Suite

Run the automated backend test suite:
```bash
python backend/test_backend.py
```
The suite verifies:
1. Auto-discovery and `.env` resolution.
2. Lazy HDF5 reading and base64 PNG satellite rendering across 4 channels.
3. ConvLSTM + Transformer forward-pass inference.
4. Missing-sensor robustness masking.
5. Grad-CAM spatial feature attribution.
6. Short-term $+3\text{h}$ and $+6\text{h}$ forecasting.
7. Latent representation similarity matching.
8. Offline test set evaluation metrics computation.

---

## 📊 Scientific Honesty & Data Integrity

In strict adherence to meteorological validation standards:
- **No Fabricated Predictions**: If data layers (such as live NOAA or $+12\text{h}/+24\text{h}$ horizons) are unsupported, the UI explicitly displays `[DATA UNAVAILABLE]` or `[LAYER NOT CONNECTED]`.
- **Traceable Badges**: Every telemetry value displays its exact source:
  - `[TCIR]`: Physical multi-source satellite observations.
  - `[AI PREDICTION]`: Neural network forward-pass estimation.
  - `[NOAA ADT-HURSAT]`: Independent NOAA reference layer.
  - `[DERIVED]`: Scientifically formulated meteorological derivation.
  - `[LIVE WINDY]`: External ECMWF live weather data.
  - `[OFFLINE TEST SET]`: Out-of-sample statistical evaluation.
