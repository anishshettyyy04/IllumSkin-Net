import os
import torch
from torch.utils.data import Dataset, DataLoader
import torchvision.transforms as transforms
import numpy as np
import scipy.io
import cv2

class ColorCheckerDataset(Dataset):
    """
    Dataset class for the ColorChecker RECommended dataset.
    """
    def __init__(self, root_dir, split='train', transform=None):
        """
        Args:
            root_dir (str): Path to the directory containing images and ground truth.
                            Assumes a structure like root_dir/images, root_dir/groundtruth.mat, 
                            and root_dir/macbeth_pts.mat
            split (str): 'train', 'val', or 'test'
            transform (callable, optional): Optional transform to be applied on a sample.
        """
        self.root_dir = root_dir
        self.split = split
        self.image_dir = os.path.join(root_dir, 'images')
        
        gt_path = os.path.join(root_dir, 'groundtruth.mat')
        macbeth_path = os.path.join(root_dir, 'macbeth_pts.mat')
        
        # 1. Parse the MAT files
        ground_truths = []
        image_names = []
        if os.path.exists(gt_path):
            gt_mat = scipy.io.loadmat(gt_path)
            
            # Attempt to find filenames in cell arrays
            for key, val in gt_mat.items():
                if not key.startswith('__') and isinstance(val, np.ndarray):
                    flat_val = val.flatten()
                    if len(flat_val) > 0:
                        first_item = flat_val[0]
                        if isinstance(first_item, np.ndarray) and len(first_item) > 0:
                            first_str = str(first_item[0])
                        else:
                            first_str = str(first_item)
                            
                        # Check if this variable contains image names
                        if 'png' in first_str.lower() or 'jpg' in first_str.lower() or 'tiff' in first_str.lower():
                            image_names = []
                            for item in flat_val:
                                if isinstance(item, np.ndarray) and len(item) > 0:
                                    image_names.append(str(item[0]))
                                else:
                                    image_names.append(str(item))
                            
            # Attempt to find ground truth RGB vectors
            for key, val in gt_mat.items():
                if not key.startswith('__') and isinstance(val, np.ndarray):
                    if len(val.shape) == 2 and val.shape[-1] == 3:
                        ground_truths = val
                        break

        # Extract MacBeth points for the mask
        macbeth_points = []
        if os.path.exists(macbeth_path):
            macbeth_mat = scipy.io.loadmat(macbeth_path)
            for key, val in macbeth_mat.items():
                if not key.startswith('__') and isinstance(val, np.ndarray):
                    if val.dtype.kind == 'O':
                        macbeth_points = [item for item in val.flatten()]
                    elif len(val.shape) >= 2:
                        macbeth_points = val
                    break

        # Map them together
        if len(image_names) == 0 and os.path.exists(self.image_dir):
            # Fallback to alphabetically sorted directory contents if image names aren't in the .mat file
            image_names = sorted([f for f in os.listdir(self.image_dir) if f.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff'))])
        elif len(image_names) == 0:
            # Fallback dummy for testing if neither exists
            image_names = [f"dummy_{i}.png" for i in range(len(ground_truths) if len(ground_truths) > 0 else 100)]
        
        self.data_map = []
        for i, name in enumerate(image_names):
            gt = ground_truths[i] if i < len(ground_truths) else np.array([0.5, 0.5, 0.5])
            pts = macbeth_points[i] if i < len(macbeth_points) else None
            self.data_map.append((name, gt, pts))

        # Setup transforms (working directly on tensors to avoid scaling distortions)
        if transform is None:
            if self.split == 'train':
                self.transform = transforms.Compose([
                    transforms.Resize((288, 288), antialias=True),
                    transforms.RandomCrop((256, 256)),
                    transforms.RandomHorizontalFlip(),
                    # NO ImageNet Normalization applied here
                ])
            else:
                self.transform = transforms.Compose([
                    transforms.Resize((256, 256), antialias=True)
                ])
        else:
            self.transform = transform

    def __len__(self):
        return len(self.data_map)

    def __getitem__(self, idx):
        img_name, gt_illuminant, macbeth_pts = self.data_map[idx]
        img_path = os.path.join(self.image_dir, img_name)
        
        # Load image
        if os.path.exists(img_path):
            # Read as unchanged to preserve linear raw depths (e.g. 16-bit)
            image = cv2.imread(img_path, cv2.IMREAD_UNCHANGED)
            if image is None:
                raise FileNotFoundError(f"Image {img_path} could not be read.")
            
            # Convert BGR to RGB if it has 3 channels
            if len(image.shape) == 3 and image.shape[2] == 3:
                image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        else:
            # Fallback dummy image
            image = np.zeros((500, 500, 3), dtype=np.uint16)
            
        # 2. Apply the Chart Mask
        if macbeth_pts is not None:
            pts = macbeth_pts
            # Handle different shape encodings from MATLAB
            if hasattr(pts, 'shape'):
                if pts.shape == (2, 4):
                    pts = pts.T
                elif len(pts.shape) == 3 and pts.shape[0] == 1:
                    pts = pts[0]
            
            if hasattr(pts, 'shape') and pts.shape[0] >= 4 and pts.shape[1] == 2:
                pts = np.array(pts, dtype=np.int32)
                # Draw black polygon (zeros) over the chart to hide it from the network
                cv2.fillPoly(image, [pts], (0, 0, 0))

        # 3. Convert to float32 tensors and scale to a [0, 1] range
        # This keeps the image relative intensities intact without normalization shifts.
        if image.dtype == np.uint16:
            image = image.astype(np.float32) / 65535.0
        elif image.dtype == np.uint8:
            image = image.astype(np.float32) / 255.0
        else:
            image = image.astype(np.float32)
            max_val = image.max()
            if max_val > 1.0:
                image = image / max_val

        # Convert to Tensor (shape: [C, H, W])
        if len(image.shape) == 3:
            image_tensor = torch.from_numpy(image).permute(2, 0, 1)
        else:
            # Grayscale case handling
            image_tensor = torch.from_numpy(image).unsqueeze(0).repeat(3, 1, 1)

        # Normalize the ground truth illuminant vector
        gt_illuminant = gt_illuminant / (np.linalg.norm(gt_illuminant) + 1e-8)
        gt_illuminant = torch.tensor(gt_illuminant, dtype=torch.float32)

        # Apply spatial augmentations directly on the tensor
        if self.transform:
            image_tensor = self.transform(image_tensor)

        return image_tensor, gt_illuminant

def get_dataloader(root_dir, batch_size=32, split='train', num_workers=4):
    """
    Returns a DataLoader for the ColorChecker dataset.
    """
    dataset = ColorCheckerDataset(root_dir=root_dir, split=split)
    shuffle = (split == 'train')
    dataloader = DataLoader(dataset, batch_size=batch_size, shuffle=shuffle, num_workers=num_workers)
    return dataloader
