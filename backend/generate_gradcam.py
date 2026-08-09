import os
import cv2
import torch
import numpy as np
import matplotlib.pyplot as plt
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
from model import IlluminationNet

def generate_gradcam():
    print("📸 Starting Grad-CAM generation for IllumSkin-Net...")
    
    # Paths
    _DIR = os.path.dirname(os.path.abspath(__file__))
    PTH_PATH = os.path.join(_DIR, "..", "weights", "best_model.pth")
    OUTPUT_PATH = os.path.join(_DIR, "gradcam_figure_1.png")
    
    # 1. Initialize model and load weights
    DEVICE = torch.device("cpu")
    model = IlluminationNet(pretrained=False).to(DEVICE)
    
    if os.path.exists(PTH_PATH):
        model.load_state_dict(torch.load(PTH_PATH, map_location=DEVICE))
        print(f"✅ Loaded PyTorch weights from {PTH_PATH}")
    else:
        print(f"⚠️ Warning: Weights not found at {PTH_PATH}. Using random weights.")
    
    model.eval()
    
    # 2. Target the final convolutional block of MobileNetV3-Small features
    # This is the last Conv2dNormActivation module before the confidence branch
    target_layers = [model.features[-1]]
    
    # Initialize Grad-CAM
    cam = GradCAM(model=model, target_layers=target_layers)
    
    # 3. Load or generate a test image
    print("⏳ Loading test image...")
    # Load real image
    img = cv2.imread('test_face.jpg')
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    # --- Face Cropping ---
    _DIR = os.path.dirname(os.path.abspath(__file__))
    face_cascade = cv2.CascadeClassifier(os.path.join(_DIR, 'haarcascade_frontalface_default.xml'))
    # cv2 cascade requires grayscale image (0-255 uint8)
    gray = cv2.cvtColor(rgb_img, cv2.COLOR_RGB2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
    
    if len(faces) > 0:
        # Get largest face
        best_face = max(faces, key=lambda rect: rect[2] * rect[3])
        x, y, w, h = best_face
        rgb_img = rgb_img[y:y+h, x:x+w]
    else:
        print("❌ No face detected by OpenCV Cascade Classifier! Exiting gracefully to avoid uncropped processing.")
        return

    rgb_img = cv2.resize(rgb_img, (256, 256))
    rgb_img = rgb_img.astype(np.float32) / 255.0
    
    input_tensor = torch.from_numpy(rgb_img).permute(2, 0, 1).unsqueeze(0).to(DEVICE)
    
    # 4. Compute Grad-CAM heatmap
    # We target index 0 (Red channel of the illuminant). You can also sum targets.
    targets = [ClassifierOutputTarget(0)]
    
    print("🧠 Computing forward pass and generating heatmap...")
    grayscale_cam = cam(input_tensor=input_tensor, targets=targets)
    grayscale_cam = grayscale_cam[0, :]
    
    # 5. Overlay heatmap onto the original image
    visualization = show_cam_on_image(rgb_img, grayscale_cam, use_rgb=True)
    
    # 6. Plot and save the publication-ready figure
    plt.figure(figsize=(10, 5))
    
    plt.subplot(1, 2, 1)
    plt.imshow(rgb_img)
    plt.title("Original Image (Input)", fontsize=14)
    plt.axis("off")
    
    plt.subplot(1, 2, 2)
    plt.imshow(visualization)
    plt.title("Grad-CAM Activation Map", fontsize=14)
    plt.axis("off")
    
    plt.tight_layout()
    plt.savefig(OUTPUT_PATH, dpi=300, bbox_inches='tight')
    plt.close()
    
    print(f"🎉 Successfully saved Grad-CAM figure to {OUTPUT_PATH}")

if __name__ == "__main__":
    generate_gradcam()
