# 🔬 IllumSkin-Net

**AI-Powered Virtual Beauty & Cosmetic Virtual Try-On System**

IllumSkin-Net is a state-of-the-art virtual try-on system designed for accurate skin tone measurement under arbitrary lighting conditions, coupled with a real-time virtual cosmetic rendering engine.

This repository represents the production-ready architecture, featuring browser-side ONNX inference, facial landmark tracking via MediaPipe, and an Illumination-aware CIEDE2000 colorimetry pipeline for foundation matching.

---

## 🌟 Main Features

- **Illumination-Aware Skin Analysis:** Robust skin albedo estimation in real-time, independent of ambient lighting.
- **CIEDE2000 Perceptual Color Matching:** High-accuracy shade matching against a verified product catalog.
- **Real-Time Browser Inference:** Fast, private, on-device AI processing using ONNX Runtime Web and WebAssembly.
- **Facial-Region-Aware Masking:** Precision foundation masking driven by MediaPipe facial landmarks.
- **Cosmetic Rendering:** Product-specific foundation opacity and temporal stabilization for a flicker-free virtual try-on experience.
- **Production API Integration:** FastAPI backend seamlessly connecting to a Supabase PostgreSQL database.

---

## 🏗️ System Architecture

```text
Browser
  ↓
Vercel (React + Vite Frontend)
  ↓ HTTPS API
Render (FastAPI Backend)
  ↓
Supabase PostgreSQL
```

### Components

**Frontend:**
- React, Vite, TypeScript
- Browser Camera (`getUserMedia`)
- ONNX Runtime Web
- MediaPipe / Facial Landmark Processing
- WASM assets
- Virtual makeup rendering engine

**Backend:**
- Python, FastAPI, Uvicorn
- SQLAlchemy, Alembic
- PostgreSQL

**Database:**
- Supabase PostgreSQL (Initialized, Alembic revision `initial_001`)
- Seeded with 23 cosmetic products
- Existing `orders` table preserved

---

## 📁 Repository Structure

```text
IllumSkin-Net/
├── backend/                   ← FastAPI application
│   ├── alembic/               ← Database migration scripts
│   ├── app/                   ← Core API, routing, schemas, and colorimetry logic
│   └── ...
├── docs/                      ← Quality Assurance (QA) and architecture reports
├── frontend/                  ← Vite + React application
│   ├── public/
│   │   ├── illumskin_net.onnx ← Frozen production ONNX model
│   │   └── wasm/              ← ONNX and MediaPipe WASM runtime assets
│   ├── src/
│   │   ├── makeup/            ← Core rendering, masking, and virtual try-on engine
│   │   ├── workers/           ← Web Workers for off-main-thread inference (onnxWorker)
│   │   └── ...
└── README.md
```

---

## 🧠 AI & Virtual Try-On Pipeline

Our comprehensive real-time processing pipeline operates entirely within the browser:

1. **Camera/Image Acquisition:** Capture high-resolution video frames via `getUserMedia`.
2. **Face Detection & Landmark Extraction:** Locate the user's face and extract precise features using MediaPipe.
3. **Face Quality Analysis:** Ensure sufficient lighting, frontal pose, and stability.
4. **Illumination Estimation:** Run the `illumskin_net.onnx` model to predict scene lighting.
5. **Skin Albedo Estimation:** Compute true skin color by factoring out estimated illumination.
6. **Shade Matching:** Convert colors and find the closest product.
7. **Foundation Mask Generation:** Create a smooth, region-aware mask avoiding eyes and lips.
8. **Cosmetic Rendering:** Apply product-specific opacity and blend modes.
9. **Temporal Stabilization:** Smooth results over time to prevent flickering.
10. **Virtual Try-On Result:** Output the final composite to the user interface.

### Color Pipeline

To ensure perceptually accurate matches, the colorimetry engine performs the following transformations:
**RGB → Linear RGB → CIELAB → CIEDE2000 → Closest Product Shade**

> **Note on Glasses Occlusion:** The current MediaPipe facial landmark implementation does *not* provide dedicated glasses or object segmentation. Glasses-frame occlusion remains a known limitation of the current pipeline.

---

## 🔬 Research & IEEE Relevance

This project demonstrates several advanced techniques suitable for IEEE research presentation:
- **Illumination-aware processing** and **skin albedo estimation** for objective color measurement.
- **CIEDE2000 perceptual color matching** for scientifically accurate shade recommendations.
- **Real-time browser-side ONNX inference** enabling zero-latency, privacy-first processing.
- **Temporal stabilization** and **facial-region-aware foundation masking**.
- **Separation of foundation coverage** from generic cosmetic style intensity.

> **Production Model Status:** The ONNX model (`illumskin_net.onnx`) and its weights are treated as frozen production assets and were explicitly preserved without modification during production integration.

---

## 🔌 API Documentation

**Base URL:** `https://illumskin-net.onrender.com/api` (Production)

### Endpoints

- **`GET /api/health`**
  Returns the current health status of the API.
- **`GET /api/products`**
  Fetches the active cosmetic product catalog.
- **`POST /api/match-shade`**
  Accepts a user's estimated skin albedo and returns the best matching foundation shades.

**Example Request (`POST /api/match-shade`):**
```json
{
  "user_albedo": [0.5, 0.5, 0.5]
}
```

---

## 🚀 Local Development Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Frontend

Configure your local environment variables in `frontend/.env.local`:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

```bash
cd frontend
npm install
npm run dev
```

---

## ☁️ Production Deployment

### 1. Database (Supabase PostgreSQL)

1. Provision a Supabase PostgreSQL instance.
2. The connection string (`DATABASE_URL`) should be stored securely in your Render environment variables.
3. To initialize the schema and populate the catalog, execute the following from the Render shell or a connected local environment:

```bash
cd backend
alembic upgrade head
python -m app.db.seed
```

> **Note:** If an existing production database already contains the schema but the migration tracker table (`alembic_version`) is missing, reconciliation may require running `alembic stamp head` instead of `upgrade head`. Do **not** wipe the production database to resolve migration sync issues.

### 2. Backend (Render)

- **Framework:** FastAPI
- **Environment Variables:**
  - `DATABASE_URL` (Your Supabase connection string)
  - `ALLOWED_ORIGINS` (Your Vercel frontend URL, e.g., `https://<your-vercel-domain>`)

### 3. Frontend (Vercel)

- **Root Directory:** `frontend`
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Environment Variables:**
  - `VITE_API_BASE_URL=https://illumskin-net.onrender.com/api`

---

## 🔒 Security Notes

- **Never commit `.env` files.**
- **Never commit `DATABASE_URL` or database passwords.**
- **Never expose Supabase service-role keys to the frontend.**
- Production database credentials belong **only** in the Render backend environment.
- Vercel only needs `VITE_API_BASE_URL` for the current architecture.
- **Camera access requires HTTPS in production.**
- CORS must be configured securely on the backend using `ALLOWED_ORIGINS`.

---

## 🛠️ Troubleshooting

- **Vercel build failure / incorrect Root Directory:** Ensure Vercel's "Root Directory" setting is explicitly set to `frontend`.
- **Frontend calling `localhost` in production:** Verify that the `VITE_API_BASE_URL` environment variable is correctly set in Vercel.
- **Render cold-start delay:** Free tier Render instances spin down after inactivity. Initial API requests may take 30-60 seconds.
- **Camera permission denied:** Browsers block `getUserMedia` on non-HTTPS origins (except localhost). Ensure your Vercel deployment is accessed via `https://`.
- **CORS errors:** Ensure the Render backend's `ALLOWED_ORIGINS` environment variable includes the exact frontend domain.
- **DATABASE_URL missing:** The backend will fail to boot without this variable.
- **Alembic DATABASE_URL containing encoded `%` characters:** URL-encoded passwords (e.g., `%40` for `@`) can cause ConfigParser interpolation errors in Alembic. The repository contains a runtime fix in `alembic/env.py` to escape these characters automatically.
- **Empty product catalog:** The API is up, but the database is empty. Run `python -m app.db.seed` to populate it.
- **Database migration synchronization:** If `relation already exists` errors occur during `alembic upgrade head`, investigate using `alembic current` and consider `alembic stamp head` if the schema is already correct.

---

## ✅ Production Validation & Release

**Release:** `v1.0.0-production`
- **Production deployment configuration commit:** `386dfc6`
- **Alembic encoded DATABASE_URL fix:** `10cbb79`
- **Stage 5 final pipeline commit:** `ddb2d63`
- **Main merge commit:** `760956f`

### Production Status

- **Frontend:** Ready / Vercel
- **Backend:** Live / Render
- **Database:** Connected / Supabase PostgreSQL
- **API:** Verified
- **AI Pipeline:** Verified
- **Build:** Passing
- **Release:** v1.0.0-production