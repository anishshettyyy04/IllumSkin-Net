# 🔬 IllumSkin-Net

**Real-Time AI Color Constancy for Skin Tone Analysis**

A deep-learning system using a MobileNetV3-Small backbone with Confidence-Weighted Spatial Pooling (CWSP) to perform real-time illumination estimation and Von Kries chromatic adaptation — designed for accurate skin tone measurement under arbitrary lighting.

---

## 📁 Monorepo Structure

```
IllumSkin-Net/
├── backend/             ← Python / PyTorch / FastAPI
│   ├── model.py         # IlluminationNet (MobileNetV3-Small + CWSP)
│   ├── server.py        # FastAPI WebSocket server
│   ├── infer.py         # Standalone OpenCV webcam inference
│   ├── train.py         # Training loop with Angular Error Loss
│   ├── eval.py          # IEEE benchmark evaluation
│   ├── dataset.py       # ColorChecker dataset loader
│   └── requirements.txt # Python dependencies
│
├── frontend/            ← Next.js 16 (App Router) + Tailwind CSS
│   ├── src/app/         # Pages & layouts
│   ├── src/components/  # UI components (Header, VideoFeed, etc.)
│   ├── src/hooks/       # useWebSocket, useWebcam
│   └── package.json
│
├── weights/             ← Model checkpoints (.pth)
│   └── best_model.pth
│
├── data/                ← Training datasets
├── notebooks/           ← Jupyter exploration
├── RESULTS.md           ← Training metrics log
└── README.md            ← You are here
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+** with CUDA (optional, for GPU inference)
- **Node.js 18+** and npm

### 1. Backend (FastAPI + PyTorch)

```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

The WebSocket server will be live at `ws://localhost:8000/ws/stream`.

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

The UI will be available at `http://localhost:3000`.

### 3. Standalone Inference (no web UI)

```bash
cd backend
python infer.py
```

Opens an OpenCV window with real-time before/after white-balancing.

---

## 🏗️ Architecture

| Component | Technology |
|---|---|
| **Backbone** | MobileNetV3-Small (pretrained ImageNet) |
| **Pooling** | Confidence-Weighted Spatial Pooling (CWSP) |
| **Correction** | Linear Von Kries Chromatic Adaptation |
| **Loss** | Angular Error Loss (arccos-based) |
| **Backend** | FastAPI + WebSocket (binary frames) |
| **Frontend** | Next.js 16 + Tailwind CSS + Lucide Icons |

---

## 📊 Training

```bash
cd backend
python train.py
```

Trains on the ColorChecker RECommended dataset. Weights are saved to `weights/best_model.pth`. Metrics are appended to `RESULTS.md`.

---

## 📈 Evaluation

```bash
cd backend
python eval.py
```

Reports IEEE standard metrics: Mean AE, Median AE, Trimean AE, Best/Worst 25%, and FPS throughput.

---

## 📄 License

Research / academic use only.