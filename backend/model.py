import torch
import torch.nn as nn
import torchvision.models as models
import torch.nn.functional as F

class IlluminationNet(nn.Module):
    """
    Lightweight CNN model using MobileNetV3-Small backbone with 
    Confidence-Weighted Spatial Pooling for real-time color constancy.
    """
    def __init__(self, pretrained=True):
        super(IlluminationNet, self).__init__()
        
        # Load pretrained MobileNetV3-Small
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        mobilenet = models.mobilenet_v3_small(weights=weights)
        
        # Strip the final classification head
        self.features = mobilenet.features
        
        in_features = 576
        
        # 1. The Confidence Branch: Predicts spatial weights (attention map)
        self.confidence_layer = nn.Conv2d(in_features, 1, kernel_size=1)
        
        # 2. The Illuminant Estimator
        self.fc = nn.Linear(in_features, 3)
        
    def forward(self, x):
        # Extract features: [B, C, H, W]
        x = self.features(x)
        
        B, C, H, W = x.shape
        
        # Generate spatial confidence weights
        # Shape: [B, 1, H, W]
        conf = self.confidence_layer(x)
        
        # Flatten spatial dimensions to apply softmax: [B, 1, H*W]
        conf_flat = conf.view(B, 1, -1)
        
        # Apply Softmax so all spatial weights sum to 1
        conf_weights = F.softmax(conf_flat, dim=2)
        
        # Reshape back to spatial dimensions: [B, 1, H, W]
        conf_weights = conf_weights.view(B, 1, H, W)
        
        # Multiply features by confidence weights (Confidence-Weighted Pooling)
        weighted_features = x * conf_weights
        
        # Sum over spatial dimensions (replaces Global Average Pooling)
        # Shape: [B, C]
        pooled = torch.sum(weighted_features, dim=(2, 3))
        
        # Fully connected layer: [B, 3]
        out = self.fc(pooled)
        
        # Force strict positive light prediction
        out = F.softplus(out)
        
        return out

if __name__ == "__main__":
    model = IlluminationNet()
    dummy_input = torch.randn(1, 3, 256, 256)
    output = model(dummy_input)
    print("Output shape:", output.shape) # Expected: [1, 3]