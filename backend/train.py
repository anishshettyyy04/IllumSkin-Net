import os
import torch
import torch.nn as nn
import torch.optim as optim
import numpy as np
from tqdm import tqdm
from dataset import get_dataloader
from model import IlluminationNet
import math

class AngularErrorLoss(nn.Module):
    """
    Custom Angular Error Loss function.
    Formula: Loss = arccos( (v_est * v_gt) / (||v_est|| * ||v_gt||) )
    """
    def __init__(self, eps=1e-7):
        super(AngularErrorLoss, self).__init__()
        self.eps = eps

    def forward(self, v_est, v_gt):
        # Compute dot product
        dot_product = torch.sum(v_est * v_gt, dim=1)
        
        # Compute L2 norms
        norm_est = torch.norm(v_est, p=2, dim=1)
        norm_gt = torch.norm(v_gt, p=2, dim=1)
        
        # Cosine similarity
        cos_sim = dot_product / (norm_est * norm_gt + self.eps)
        
        # Clamp to avoid NaN in arccos due to numerical instability
        cos_sim = torch.clamp(cos_sim, -1.0 + self.eps, 1.0 - self.eps)
        
        # Compute angular error in radians
        angular_error = torch.acos(cos_sim)
        
        # Return mean loss over the batch
        return torch.mean(angular_error)

def calculate_angular_errors(v_est, v_gt, eps=1e-7):
    """
    Calculate angular errors in degrees for evaluation.
    """
    dot_product = torch.sum(v_est * v_gt, dim=1)
    norm_est = torch.norm(v_est, p=2, dim=1)
    norm_gt = torch.norm(v_gt, p=2, dim=1)
    cos_sim = dot_product / (norm_est * norm_gt + eps)
    cos_sim = torch.clamp(cos_sim, -1.0 + eps, 1.0 - eps)
    
    # Convert to degrees
    angular_error_rad = torch.acos(cos_sim)
    angular_error_deg = angular_error_rad * (180.0 / math.pi)
    
    return angular_error_deg.detach().cpu().numpy()

def train(data_dir, num_epochs=50, batch_size=32, lr=1e-4, device='cuda' if torch.cuda.is_available() else 'cpu'):
    # Prepare data
    train_loader = get_dataloader(root_dir=data_dir, batch_size=batch_size, split='train')
    
    # Initialize model, loss, and optimizer
    model = IlluminationNet().to(device)
    criterion = AngularErrorLoss().to(device)
    optimizer = optim.Adam(model.parameters(), lr=lr)
    
    print(f"Starting training on {device}...")
    
    # Initialize metrics logging (resolve paths relative to this file)
    _dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.join(_dir, "..")
    results_file = os.path.join(project_root, "RESULTS.md")
    weights_dir = os.path.join(project_root, "weights")
    os.makedirs(weights_dir, exist_ok=True)
    
    with open(results_file, "a") as f:
        f.write("\n## New Training Run\n")
        f.write("| Epoch | Loss | Mean AE | Median AE |\n")
        f.write("|---|---|---|---|\n")
        
    best_mean_ae = float('inf')
    
    # Training Loop
    for epoch in range(num_epochs):
        model.train()
        running_loss = 0.0
        all_errors = []
        
        progress_bar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{num_epochs}")
        for images, gt_illuminants in progress_bar:
            images = images.to(device)
            gt_illuminants = gt_illuminants.to(device)
            
            # Forward pass
            optimizer.zero_grad()
            outputs = model(images)
            
            # Compute loss
            loss = criterion(outputs, gt_illuminants)
            
            # Backward pass and optimize
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * images.size(0)
            
            # Calculate errors for logging
            batch_errors = calculate_angular_errors(outputs, gt_illuminants)
            all_errors.extend(batch_errors)
            
            progress_bar.set_postfix({'loss': loss.item()})
            
        # Epoch statistics
        epoch_loss = running_loss / len(train_loader.dataset)
        mean_ae = np.mean(all_errors)
        median_ae = np.median(all_errors)
        
        print(f"Epoch [{epoch+1}/{num_epochs}] | Loss: {epoch_loss:.4f} | Mean Angular Error: {mean_ae:.2f}° | Median Angular Error: {median_ae:.2f}°")
        
        # Log to RESULTS.md
        with open(results_file, "a") as f:
            f.write(f"| {epoch+1} | {epoch_loss:.4f} | {mean_ae:.2f}&deg; | {median_ae:.2f}&deg; |\n")
            
        # Save best model weights
        if mean_ae < best_mean_ae:
            best_mean_ae = mean_ae
            save_path = os.path.join(weights_dir, "best_model.pth")
            torch.save(model.state_dict(), save_path)
            print(f"--> Saved new best model to {save_path} (Mean AE improved to {best_mean_ae:.2f}°)")

if __name__ == "__main__":
    # data/ is at the monorepo root: backend/../data
    _dir = os.path.dirname(os.path.abspath(__file__))
    DATA_DIR = os.path.join(_dir, "..", "data")
    train(data_dir=DATA_DIR, num_epochs=50)
