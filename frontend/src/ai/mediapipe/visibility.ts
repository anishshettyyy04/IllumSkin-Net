import type { NormalizedLandmark } from '@mediapipe/tasks-vision';

export const calculateVisibilityScore = (landmarks: NormalizedLandmark[]): number => {
  // Check if key points are within bounds [0.0, 1.0]
  const isVisible = (index: number) => {
    const pt = landmarks[index];
    if (!pt) return false;
    return pt.x >= 0 && pt.x <= 1 && pt.y >= 0 && pt.y <= 1;
  };

  // Regions to check
  const regions = {
    nose: [1, 4],
    mouth: [0, 17, 61, 291],
    leftEye: [33, 133],
    rightEye: [362, 263],
    faceOval: [10, 152, 234, 454]
  };

  let visiblePoints = 0;
  let totalPoints = 0;

  for (const [_, indices] of Object.entries(regions)) {
    for (const index of indices) {
      totalPoints++;
      if (isVisible(index)) visiblePoints++;
    }
  }

  if (totalPoints === 0) return 0;
  
  return (visiblePoints / totalPoints) * 100;
};
