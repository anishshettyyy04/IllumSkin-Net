import os
import torch
from model import IlluminationNet

def export_to_onnx():
    print("🚀 Starting ONNX export process...")
    
    # 1. Define paths
    _DIR = os.path.dirname(os.path.abspath(__file__))
    WEIGHTS_PATH = os.path.join(_DIR, "..", "weights", "best_model.pth")
    ONNX_PATH = os.path.join(_DIR, "..", "weights", "illumskin_net.onnx")
    
    # 2. Initialize model and load weights
    DEVICE = torch.device("cpu") # Export on CPU for maximum compatibility
    model = IlluminationNet(pretrained=False).to(DEVICE)
    
    if os.path.exists(WEIGHTS_PATH):
        model.load_state_dict(torch.load(WEIGHTS_PATH, map_location=DEVICE))
        print(f"✅ Loaded PyTorch weights from {WEIGHTS_PATH}")
    else:
        print(f"⚠️ Warning: Weights not found at {WEIGHTS_PATH}. Exporting with random weights.")
        
    model.eval()
    
    # 3. Create a dummy input tensor matching the webcam feed dimensions (1 batch, 3 channels, 256x256)
    dummy_input = torch.randn(1, 3, 256, 256, device=DEVICE)
    
    # 4. Export the model
    torch.onnx.export(
        model, 
        dummy_input, 
        ONNX_PATH, 
        export_params=True, 
        opset_version=11, 
        do_constant_folding=True,
        input_names=['input_frame'], 
        output_names=['estimated_illumination'],
        dynamic_axes={'input_frame': {0: 'batch_size'}, 'estimated_illumination': {0: 'batch_size'}}
    )
    
    print(f"🎉 Successfully exported IllumSkin-Net to {ONNX_PATH}")

if __name__ == "__main__":
    export_to_onnx()
