import os
import sys
import cv2
import torch
import numpy as np

# Ensure src is in the python path so we can import model.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from model import IlluminationNet

def main():
    # Setup Device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Running inference on {device}...")

    # 1. Model Loading
    model = IlluminationNet(pretrained=False).to(device)
    
    # Safely construct the path to weights (using current working directory)
    project_root = os.getcwd()
    weights_path = os.path.join(project_root, "weights", "best_model.pth")
    
    if not os.path.exists(weights_path):
        print(f"Error: Could not find model weights at {weights_path}")
        print("Please train the model first so it can generate 'weights/best_model.pth'.")
        return

    # Load weights and set to evaluation mode
    model.load_state_dict(torch.load(weights_path, map_location=device))
    model.eval()
    
    # Initialize webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not connect to the webcam.")
        return
    
    # Disable hardware Auto White Balance so it doesn't fight the neural network
    cap.set(cv2.CAP_PROP_AUTO_WB, 0)
        
    print("Webcam successfully opened. Press 'q' inside the video window to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            print("Failed to grab webcam frame.")
            break
            
        # 1. Color Space: Convert original BGR frame to RGB
        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        
        # 2. Inverse Gamma (Linearization): [0, 1] and ** 2.2
        frame_linear = (frame_rgb.astype(np.float32) / 255.0) ** 2.2
        
        # 3. Model Inference (on resized linear image)
        input_frame = cv2.resize(frame_linear, (256, 256))
        # Convert to PyTorch Tensor format [Batch, Channels, Height, Width]
        input_tensor = torch.from_numpy(input_frame).permute(2, 0, 1).unsqueeze(0).to(device)
        
        with torch.no_grad():
            est_ill = model(input_tensor)
            # 1. Positive Clamping: Ensure no channel is zero or negative
            est_ill = torch.clamp(est_ill, min=0.1)
            est_ill = est_ill.squeeze(0).cpu().numpy()
            
        # L2 Normalize the estimated RGB illumination vector
        est_ill = est_ill / (np.linalg.norm(est_ill) + 1e-8)
        
        # 4. Linear Von Kries Chromatic Adaptation
        # Normalize the illuminant by its mean to prevent drastic brightness shifts
        est_ill_mean_norm = est_ill / (np.mean(est_ill) + 1e-8)
        gains = 1.0 / est_ill_mean_norm
        
        # Apply the diagonal transformation directly to the linear high-res RGB frame
        wb_linear = frame_linear.copy()
        wb_linear[:, :, 0] *= gains[0] # Red
        wb_linear[:, :, 1] *= gains[1] # Green
        wb_linear[:, :, 2] *= gains[2] # Blue
        
        # 5. Gamma Correction: bring back to sRGB display space
        # Clip to [0, 1] before gamma correction to avoid NaNs from negative values or blowouts
        wb_linear = np.clip(wb_linear, 0, 1.0)
        wb_srgb = wb_linear ** (1.0 / 2.2)
        
        # 6. Display: Convert back to BGR and scale to uint8
        wb_bgr = cv2.cvtColor((wb_srgb * 255.0).astype(np.uint8), cv2.COLOR_RGB2BGR)
        
        # Horizontally stack the original frame and the white balanced frame
        combined = np.hstack((frame, wb_bgr))
        
        # Overlay the numerical RGB vector
        text = f"RGB Illum: [{est_ill[0]:.2f}, {est_ill[1]:.2f}, {est_ill[2]:.2f}]"
        cv2.putText(combined, text, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        
        # Add labels to differentiate sides
        cv2.putText(combined, "Original", (10, frame.shape[0] - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        cv2.putText(combined, "White Balanced", (frame.shape[1] + 10, frame.shape[0] - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)

        # Show the resulting dashboard
        cv2.imshow("IllumSkin-Net: Real-Time Color Constancy", combined)
        
        # Exit on 'q'
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
            
    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
