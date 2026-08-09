"""
IllumSkin-Net — FastAPI WebSocket Server
Accepts JPEG frame buffers via WebSocket, runs PyTorch colour-constancy
inference, and returns JSON with corrected RGB + ΔE metrics.
"""

import os
import io
import cv2
import math
import torch
import numpy as np
from PIL import Image
from pydantic import BaseModel
from typing import List, Dict, Any
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .models.productModel import get_all_products

from .model import IlluminationNet

# ────────────────────────────────────────────────────────────
# Initialisation
# ────────────────────────────────────────────────────────────
app = FastAPI(title="IllumSkin-Net API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve weights relative to this file: backend/../weights/best_model.pth
_DIR = os.path.dirname(os.path.abspath(__file__))
WEIGHTS_PATH = os.path.join(_DIR, "..", "weights", "best_model.pth")

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = IlluminationNet(pretrained=False).to(DEVICE)
if os.path.exists(WEIGHTS_PATH):
    model.load_state_dict(torch.load(WEIGHTS_PATH, map_location=DEVICE))
    print(f"Loaded weights from {WEIGHTS_PATH}")
else:
    print(f"Weights not found at {WEIGHTS_PATH} — running with random weights")
model.eval()

_DIR = os.path.dirname(os.path.abspath(__file__))
face_cascade = cv2.CascadeClassifier(os.path.join(_DIR, 'haarcascade_frontalface_default.xml'))


# ────────────────────────────────────────────────────────────
# 1. DATABASE SCHEMA & MOCK CATALOG
# ────────────────────────────────────────────────────────────
class ShadeRequest(BaseModel):
    rgb: List[float]  # [R, G, B]

def color_distance(c1, c2):
    """Euclidean distance in RGB space"""
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))

@app.post("/api/match-shade")
async def match_shade(request: ShadeRequest):
    user_rgb = request.rgb
    
    # Calculate distances for all products
    scored_catalog = []
    products = get_all_products()
    
    for product in products:
        dist = color_distance(user_rgb, product["rgb"])
        # Simple compatibility score: max distance is ~441, scale to %
        match_score = max(0.0, min(100.0, 100.0 - (dist / 150.0) * 100.0))
        scored_catalog.append({
            **product,
            "distance": dist,
            "matchPercentage": round(match_score, 1)
        })
        
    # Sort by closest match (highest percentage)
    scored_catalog.sort(key=lambda x: x["distance"])
    
    # Return top 3
    return {"matches": scored_catalog[:3]}


# ────────────────────────────────────────────────────────────
# 2. LEGACY WEBSOCKET ENDPOINT
# ────────────────────────────────────────────────────────────
def _decode_jpeg_to_linear(data: bytes) -> np.ndarray:
    """Decode JPEG bytes → float32 linear-RGB numpy array (H, W, 3)."""
    pil_img = Image.open(io.BytesIO(data)).convert("RGB")
    frame_rgb = np.array(pil_img, dtype=np.float32) / 255.0
    # Inverse sRGB gamma → linear
    frame_linear = frame_rgb ** 2.2
    return frame_linear


def _apply_von_kries(frame_linear: np.ndarray, est_ill: np.ndarray) -> np.ndarray:
    """Von Kries chromatic adaptation on a linear-RGB frame."""
    est_ill_mean = est_ill / (np.mean(est_ill) + 1e-8)
    gains = 1.0 / est_ill_mean
    corrected = frame_linear.copy()
    corrected[:, :, 0] *= gains[0]
    corrected[:, :, 1] *= gains[1]
    corrected[:, :, 2] *= gains[2]
    corrected = np.clip(corrected, 0, 1.0)
    return corrected


def _linear_to_srgb(linear: np.ndarray) -> np.ndarray:
    return np.clip(linear ** (1.0 / 2.2), 0, 1.0)


def _mean_rgb_uint8(srgb: np.ndarray) -> list[int]:
    """Return the mean (R, G, B) of an sRGB image as uint8 values."""
    mean = np.mean(srgb, axis=(0, 1)) * 255.0
    return [int(round(c)) for c in mean]


def _delta_e_rgb(rgb_a: list[int], rgb_b: list[int]) -> float:
    """Simple Euclidean ΔE in sRGB space (0-255 scale)."""
    diff = np.array(rgb_a, dtype=np.float64) - np.array(rgb_b, dtype=np.float64)
    return float(np.sqrt(np.sum(diff ** 2)))


# ────────────────────────────────────────────────────────────
# WebSocket endpoint
# ────────────────────────────────────────────────────────────
D65_RGB = [255, 255, 255]  # Reference white for ΔE computation

@app.websocket("/ws/stream")
async def ws_stream(websocket: WebSocket):
    await websocket.accept()
    print("🟢 WebSocket client connected")
    
    # ─── DEMO STATE VARIABLES ───
    WARMUP_FRAMES = 60        # 2 seconds to let webcam auto-exposure settle
    CALIBRATION_FRAMES = 30   # 1 second to lock the actual baseline
    frame_count = 0
    raw_buffer = []
    corrected_buffer = []
    baseline_raw = None
    baseline_corrected = None

    try:
        while True:
            data = await websocket.receive_bytes()
            frame_linear = _decode_jpeg_to_linear(data)
            
            # --- Face Cropping for Inference ---
            frame_uint8 = (np.clip(frame_linear ** (1.0 / 2.2), 0, 1.0) * 255).astype(np.uint8)
            gray = cv2.cvtColor(frame_uint8, cv2.COLOR_RGB2GRAY)
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
            
            if len(faces) > 0:
                best_face = max(faces, key=lambda rect: rect[2] * rect[3])
                x, y, w, h = best_face
                crop_linear = frame_linear[y:y+h, x:x+w]
            else:
                crop_linear = frame_linear

            input_frame = cv2.resize(crop_linear, (256, 256))
            input_tensor = (
                torch.from_numpy(input_frame)
                .permute(2, 0, 1)
                .unsqueeze(0)
                .to(DEVICE)
            )

            with torch.no_grad():
                est_ill = model(input_tensor)
                est_ill = torch.clamp(est_ill, min=0.1)
                est_ill = est_ill.squeeze(0).cpu().numpy()

            est_ill = est_ill / (np.linalg.norm(est_ill) + 1e-8)
            corrected_linear = _apply_von_kries(frame_linear, est_ill)
            
            raw_srgb = _linear_to_srgb(frame_linear)
            corrected_srgb = _linear_to_srgb(corrected_linear)

            raw_rgb = _mean_rgb_uint8(raw_srgb)
            corrected_rgb = _mean_rgb_uint8(corrected_srgb)

            # ─── DYNAMIC CALIBRATION LOGIC ───
            if frame_count < WARMUP_FRAMES:
                # Let the camera adjust to the room
                frame_count += 1
                current_raw_base = raw_rgb
                current_corr_base = corrected_rgb
                shade = "Warming up camera..."
                
            elif frame_count < WARMUP_FRAMES + CALIBRATION_FRAMES:
                # Record the stable baseline
                raw_buffer.append(raw_rgb)
                corrected_buffer.append(corrected_rgb)
                frame_count += 1
                current_raw_base = raw_rgb
                current_corr_base = corrected_rgb
                shade = "Locking baseline..."
                
            else:
                # Lock the averages
                if baseline_raw is None:
                    baseline_raw = [int(c) for c in np.mean(raw_buffer, axis=0)]
                    baseline_corrected = [int(c) for c in np.mean(corrected_buffer, axis=0)]
                    print(f"🔒 Baselines Locked! Raw: {baseline_raw} | Corr: {baseline_corrected}")
                
                current_raw_base = baseline_raw
                current_corr_base = baseline_corrected
                
                # Simple shade matching logic 
                brightness = sum(corrected_rgb) / 3.0
                if brightness > 200: shade = "Fair Ivory"
                elif brightness > 170: shade = "Light Beige"
                elif brightness > 140: shade = "Medium Sand"
                elif brightness > 110: shade = "Warm Honey"
                elif brightness > 80: shade = "Deep Caramel"
                else: shade = "Rich Espresso"

            # Compute Delta-E independently
            delta_e_raw = _delta_e_rgb(raw_rgb, current_raw_base)
            delta_e_corrected = _delta_e_rgb(corrected_rgb, current_corr_base)

            response = {
                "raw_rgb": raw_rgb,
                "corrected_rgb": corrected_rgb,
                "delta_e_raw": round(delta_e_raw, 1),
                "delta_e_corrected": round(delta_e_corrected, 1),
                "matched_shade": shade,
            }

            await websocket.send_text(json.dumps(response))

    except WebSocketDisconnect:
        print("🔴 WebSocket client disconnected")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")


# ────────────────────────────────────────────────────────────
# Health check
# ────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "device": str(DEVICE)}
