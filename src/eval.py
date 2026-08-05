import os
import torch
import numpy as np
import time
from dataset import get_dataloader
from model import IlluminationNet
from train import calculate_angular_errors

def evaluate_model(data_dir="../data", weights_path="../weights/best_model.pth"):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Starting IEEE formal evaluation on {device}...")

    # 1. Load Dataset (Using train split for benchmark if test isn't separated)
    dataloader = get_dataloader(root_dir=data_dir, batch_size=1, split='train')
    
    # 2. Load Model
    model = IlluminationNet(pretrained=False).to(device)
    if not os.path.exists(weights_path):
        print(f"Error: Weights not found at {weights_path}")
        return
    model.load_state_dict(torch.load(weights_path, map_location=device))
    model.eval()

    all_errors = []
    inference_times = []

    # 3. Run Inference and Track Metrics
    with torch.no_grad():
        for images, gt_illuminants in dataloader:
            images = images.to(device)
            gt_illuminants = gt_illuminants.to(device)

            # Benchmark Speed
            start_time = time.perf_counter()
            outputs = model(images)
            end_time = time.perf_counter()
            inference_times.append((end_time - start_time) * 1000) # Convert to ms

            # Calculate Error
            batch_errors = calculate_angular_errors(outputs, gt_illuminants)
            all_errors.extend(batch_errors)

    # 4. Compute IEEE Standard Metrics
    all_errors = np.array(all_errors)
    all_errors.sort()
    
    mean_ae = np.mean(all_errors)
    median_ae = np.median(all_errors)
    
    # Trimean: (Q1 + 2*Median + Q3) / 4
    q1 = np.percentile(all_errors, 25)
    q3 = np.percentile(all_errors, 75)
    trimean_ae = (q1 + 2 * median_ae + q3) / 4.0
    
    # Best 25% and Worst 25%
    n_25 = len(all_errors) // 4
    best_25_mean = np.mean(all_errors[:n_25])
    worst_25_mean = np.mean(all_errors[-n_25:])

    # Speed metrics
    avg_inference_ms = np.mean(inference_times)
    fps = 1000.0 / avg_inference_ms

    # 5. Print Output Table
    print("\n" + "="*50)
    print(" IEEE BENCHMARK RESULTS")
    print("="*50)
    print(f"Total Images Evaluated : {len(all_errors)}")
    print(f"Mean Angular Error     : {mean_ae:.2f}°")
    print(f"Median Angular Error   : {median_ae:.2f}°")
    print(f"Trimean Angular Error  : {trimean_ae:.2f}°")
    print(f"Best 25% Mean Error    : {best_25_mean:.2f}°")
    print(f"Worst 25% Mean Error   : {worst_25_mean:.2f}°")
    print("-" * 50)
    print(f"Average Latency        : {avg_inference_ms:.2f} ms/frame")
    print(f"Throughput (FPS)       : {fps:.1f} FPS")
    print("="*50 + "\n")

if __name__ == "__main__":
    # Ensure paths are correct relative to where you run the script
    project_root = os.getcwd()
    evaluate_model(
        data_dir=os.path.join(project_root, "data"), 
        weights_path=os.path.join(project_root, "weights", "best_model.pth")
    )