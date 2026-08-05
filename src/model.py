import torch
import torch.nn as nn
import torchvision.models as models

class IlluminationNet(nn.Module):
    """
    Lightweight CNN model using MobileNetV3-Small backbone for real-time 
    illumination-invariant skin tone estimation.
    """
    def __init__(self, pretrained=True):
        super(IlluminationNet, self).__init__()
        
        # Load pretrained MobileNetV3-Small
        weights = models.MobileNet_V3_Small_Weights.DEFAULT if pretrained else None
        mobilenet = models.mobilenet_v3_small(weights=weights)
        
        # Strip the final classification head (classifier)
        # MobileNetV3's features module extracts the feature maps
        self.features = mobilenet.features
        
        # Global Average Pooling
        self.gap = nn.AdaptiveAvgPool2d((1, 1))
        
        # Determine the number of output channels from the features module
        # For MobileNetV3-Small, the last feature layer outputs 576 channels
        in_features = 576
        
        # Fully connected layer to output a 3-dimensional RGB illuminant vector
        self.fc = nn.Linear(in_features, 3)
        
    def forward(self, x):
        # Extract features: [B, C, H, W]
        x = self.features(x)
        
        # Global Average Pooling: [B, C, 1, 1]
        x = self.gap(x)
        
        # Flatten: [B, C]
        x = torch.flatten(x, 1)
        
        # Fully connected layer: [B, 3]
        x = self.fc(x)
        
        # Softplus activation: guarantees strictly positive light predictions
        x = torch.nn.functional.softplus(x)
        
        # L2 Normalize the output to represent the illumination direction
        # x = nn.functional.normalize(x, p=2, dim=1) # optional, loss handles scale
        return x

if __name__ == "__main__":
    # Quick test to ensure model works and outputs correct shape
    model = IlluminationNet()
    dummy_input = torch.randn(1, 3, 256, 256)
    output = model(dummy_input)
    print("Output shape:", output.shape) # Expected: [1, 3]
