import { useEffect, useRef, useState, useCallback } from 'react';
import { FaceLandmarker } from '@mediapipe/tasks-vision';
import { MEDIAPIPE_CONFIG, createFilesetResolver } from '../ai/mediapipe/config';
import type { FaceTrackingState, QualityLevel } from '../ai/mediapipe/types';
import { calculateHeadPose, getOrientationScore } from '../ai/mediapipe/headPose';
import { StabilityTracker } from '../ai/mediapipe/stability';
import { calculateFaceScaling } from '../ai/mediapipe/scaling';
import { calculateVisibilityScore } from '../ai/mediapipe/visibility';

export function useFaceMesh(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [state, setState] = useState<FaceTrackingState>({
    landmarks: null,
    isTracking: false,
    faceDetected: false,
    loading: true,
    error: null,
    fps: 0,
    processingTime: 0,
    lightingQuality: 'Good',
    captureQuality: 'Good',
    captureScore: 0,
    captureReady: false,
    facesCount: 0,
    headPose: null,
    faceScaling: null,
    metrics: null,
    stabilityScore: 100
  });

  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const requestRef = useRef<number>(0);
  const lastVideoTimeRef = useRef<number>(-1);
  const fpsFrameCountRef = useRef<number>(0);
  const fpsLastTimeRef = useRef<number>(performance.now());
  const lightingCheckTimeRef = useRef<number>(0);
  const stabilityTrackerRef = useRef(new StabilityTracker());

  // Hidden canvas for lighting estimation
  const lightCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const estimateLighting = useCallback((video: HTMLVideoElement): { score: number, quality: QualityLevel } => {
    if (!lightCanvasRef.current) {
      lightCanvasRef.current = document.createElement('canvas');
      lightCanvasRef.current.width = 64;
      lightCanvasRef.current.height = 64;
    }
    const canvas = lightCanvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { score: 75, quality: 'Good' };

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let sum = 0;
    
    // Calculate relative luminance for each pixel
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      sum += luminance;
    }
    
    const avgLuminance = sum / (canvas.width * canvas.height);
    
    // Map luminance to 0-100 score (assuming max typical luminance is around 200)
    const score = Math.min(100, (avgLuminance / 200) * 100);
    
    let quality: QualityLevel = 'Poor';
    if (avgLuminance > 160) quality = 'Excellent';
    else if (avgLuminance > 100) quality = 'Good';
    else if (avgLuminance > 50) quality = 'Fair';
    
    return { score, quality };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeMediaPipe = async () => {
      try {
        const vision = await createFilesetResolver();
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MEDIAPIPE_CONFIG.MODEL_PATH,
            delegate: 'GPU',
          },
          numFaces: MEDIAPIPE_CONFIG.OPTIONS?.numFaces,
          runningMode: MEDIAPIPE_CONFIG.OPTIONS?.runningMode,
          outputFaceBlendshapes: MEDIAPIPE_CONFIG.OPTIONS?.outputFaceBlendshapes,
          outputFacialTransformationMatrixes: MEDIAPIPE_CONFIG.OPTIONS?.outputFacialTransformationMatrixes,
        });

        if (isMounted) {
          landmarkerRef.current = landmarker;
          setState(prev => ({ ...prev, loading: false }));
        }
      } catch (err) {
        console.error("Failed to initialize MediaPipe FaceLandmarker:", err);
        if (isMounted) {
          setState(prev => ({ ...prev, loading: false, error: 'Failed to initialize face tracking.' }));
        }
      }
    };

    initializeMediaPipe();

    return () => {
      isMounted = false;
      if (landmarkerRef.current) {
        landmarkerRef.current.close();
      }
    };
  }, []);

  const trackFace = useCallback(() => {
    if (!landmarkerRef.current || !videoRef.current) return;
    
    const video = videoRef.current;
    
    if (video.readyState >= 2) {
      const loopStart = performance.now();
      
      // Calculate FPS
      fpsFrameCountRef.current += 1;
      if (loopStart - fpsLastTimeRef.current >= 1000) {
        setState(prev => ({ ...prev, fps: fpsFrameCountRef.current }));
        fpsFrameCountRef.current = 0;
        fpsLastTimeRef.current = loopStart;
      }

      if (video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime;
        
        try {
          const inferenceStart = performance.now();
          const results = landmarkerRef.current.detectForVideo(video, inferenceStart);
          const processingTime = performance.now() - inferenceStart;
          
          const facesCount = results.faceLandmarks ? results.faceLandmarks.length : 0;
          const faceDetected = facesCount > 0;
          const landmarks = faceDetected ? results.faceLandmarks[0] : null;

          if (landmarks) {
            const headPose = calculateHeadPose(landmarks);
            const faceScaling = calculateFaceScaling(landmarks);
            const stabilityScore = stabilityTrackerRef.current.update(landmarks);
            const visibilityScore = calculateVisibilityScore(landmarks);
            const orientationScore = getOrientationScore(headPose);
            
            // Check lighting less frequently to save performance
            let lightingRes = { score: 75, quality: 'Good' as QualityLevel };
            if (loopStart - lightingCheckTimeRef.current >= 1000) {
              lightingRes = estimateLighting(video);
              lightingCheckTimeRef.current = loopStart;
            } else {
              // Retrieve previous lighting score from state if possible, but since we are in a tight loop, 
              // we can just use a ref or pass it through state. For now, rely on state merge.
            }

            setState(prev => {
              const currentLightingScore = (loopStart - lightingCheckTimeRef.current < 1000) ? 
                (prev.metrics?.lightingScore || 75) : lightingRes.score;


              // Capture Quality = 0.30 * Lighting + 0.25 * Orientation + 0.25 * Stability + 0.20 * Visibility
              const captureScore = 
                (0.30 * currentLightingScore) + 
                (0.25 * orientationScore) + 
                (0.25 * stabilityScore) + 
                (0.20 * visibilityScore);
              
              let captureQuality: QualityLevel = 'Poor';
              if (captureScore >= 90) captureQuality = 'Excellent';
              else if (captureScore >= 70) captureQuality = 'Good';
              else if (captureScore >= 50) captureQuality = 'Fair';
              else if (!faceDetected) captureQuality = 'Lost';

              const captureReady = captureScore >= 82;

              return {
                ...prev,
                landmarks,
                faceDetected,
                facesCount,
                isTracking: true,
                processingTime,
                headPose,
                faceScaling,
                stabilityScore,
                lightingQuality: captureQuality,
                captureScore,
                captureReady,
                metrics: {
                  lightingScore: currentLightingScore,
                  orientationScore,
                  stabilityScore,
                  visibilityScore
                }
              };
            });
          } else {
            // Face lost
            stabilityTrackerRef.current.reset();
            setState(prev => ({
              ...prev,
              landmarks: null,
              faceDetected: false,
              facesCount: 0,
              isTracking: true,
              processingTime,
              captureQuality: 'Lost',
              captureScore: 0,
              captureReady: false
            }));
          }
        } catch (e) {
          console.error("FaceLandmarker detection error:", e);
        }
      }
    }
    
    requestRef.current = requestAnimationFrame(trackFace);
  }, [videoRef, estimateLighting]);

  useEffect(() => {
    if (!state.loading && !state.error) {
      requestRef.current = requestAnimationFrame(trackFace);
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [state.loading, state.error, trackFace]);

  return state;
}
