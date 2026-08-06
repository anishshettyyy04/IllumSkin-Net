import os
import torch
import numpy as np
import onnxruntime as ort
from model import IlluminationNet

def verify_onnx_export():
    print("🔍 Starting Mathematical Verification: PyTorch vs ONNX...")
    
    # Paths
    _DIR = os.path.dirname(os.path.abspath(__file__))
    PTH_PATH = os.path.join(_DIR, "..", "weights", "best_model.pth")
    ONNX_PATH = os.path.join(_DIR, "..", "weights", "illumskin_net.onnx")
    
    # 1. Run PyTorch Inference
    DEVICE = torch.device("cpu")
    pytorch_model = IlluminationNet(pretrained=False).to(DEVICE)
    if os.path.exists(PTH_PATH):
        pytorch_model.load_state_dict(torch.load(PTH_PATH, map_location=DEVICE))
    pytorch_model.eval()
    
    # Create a dummy image tensor (1 batch, 3 channels, 256x256)
    dummy_input = torch.randn(1, 3, 256, 256, device=DEVICE)
    
    with torch.no_grad():
        torch_output = pytorch_model(dummy_input).numpy()
        
    # 2. Run ONNX Inference
    ort_session = ort.InferenceSession(ONNX_PATH)
    ort_inputs = {ort_session.get_inputs()[0].name: dummy_input.numpy()}
    onnx_output = ort_session.run(None, ort_inputs)[0]
    
    # 3. Compare Results
    max_diff = np.max(np.abs(torch_output - onnx_output))
    mean_diff = np.mean(np.abs(torch_output - onnx_output))
    
    print("-" * 50)
    print(f"PyTorch Output (First 3 vals): {torch_output[0][:3]}")
    print(f"ONNX Output    (First 3 vals): {onnx_output[0][:3]}")
    print("-" * 50)
    print(f"Max Absolute Difference:  {max_diff:.8f}")
    print(f"Mean Absolute Difference: {mean_diff:.8f}")
    print("-" * 50)
    
    if max_diff < 1e-4:
        print("✅ SUCCESS: The ONNX model is mathematically identical to PyTorch.")
    else:
        print("❌ FAILURE: Precision drop detected. The models do not match.")

if __name__ == "__main__":
    verify_onnx_export()
