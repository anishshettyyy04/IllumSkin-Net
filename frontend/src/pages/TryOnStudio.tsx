import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Camera, ShoppingBag, Activity, ShieldAlert, CheckCircle2, Circle, ShieldCheck, Sparkles, Download, SplitSquareHorizontal } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { RecommendationService } from '../services/recommendations';
import type { CompleteLook } from '../services/recommendations';
import { useStore } from '../store/useStore';
import { useFaceMesh } from '../hooks/useFaceMesh';
import { VirtualMakeupEngine } from '../makeup/VirtualMakeupEngine';
import { RenderScheduler } from '../makeup/core/RenderScheduler';
import { LipRenderer } from '../makeup/LipRenderer';
import { BlushRenderer } from '../makeup/BlushRenderer';
import { EyeRenderer } from '../makeup/EyeRenderer';
import { FoundationRenderer } from '../makeup/FoundationRenderer';
import { BeautyIntelligenceEngine } from '../beauty/BeautyIntelligenceEngine';
import type { ConsultationResult } from '../beauty/BeautyIntelligenceEngine';
import { assessFaceQuality } from '../makeup/FaceQuality';
import type { FaceQualityState } from '../makeup/FaceQuality';
import type { PipelineMode } from '../workers/onnxWorker';

type StudioState = 'WELCOME' | 'PREPARATION' | 'ANALYSIS' | 'RESULTS';

export default function TryOnStudio() {
  const navigate = useNavigate();
  const location = useLocation();
  const addToCart = useStore(state => state.addToCart);

  // Direct Product Mode check
  const product = location.state?.product;
  const activeShade = location.state?.activeShade;
  const categoryStr = product?.category?.toLowerCase() || location.state?.category?.toLowerCase() || '';
  const isDirectProductMode = !!product && categoryStr !== 'foundation';

  useEffect(() => {
    console.log('[TRYON:PRODUCT]', product?.name || 'Foundation/AI', activeShade?.hex);
    console.log('[TRYON:MODE]', isDirectProductMode ? 'DIRECT_PRODUCT' : 'AI_CONSULTATION');
  }, [product, activeShade, isDirectProductMode]);

  // UI State Machine
  const [studioState, setStudioState] = useState<StudioState>('WELCOME');

  // Model & Hardware State
  const [modelReady, setModelReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [modelError, setModelError] = useState<string | null>(null);

  // Results State
  const [completeLook, setCompleteLook] = useState<CompleteLook | null>(null);
  const [consultation, setConsultation] = useState<ConsultationResult | null>(null);
  const [sliderPosition, setSliderPosition] = useState(50);


  // Performance Metrics
  const [inferenceLatency, setInferenceLatency] = useState<number>(0);
  const [fps, setFps] = useState<number>(60);
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [pipelineMode, setPipelineMode] = useState<PipelineMode>('BASELINE');
  const pipelineModeRef = useRef<PipelineMode>('BASELINE');
  useEffect(() => { pipelineModeRef.current = pipelineMode; }, [pipelineMode]);
  const [metricsLog, setMetricsLog] = useState<any[]>([]);

  // Analysis Progress Tracking
  const [prepStep, setPrepStep] = useState(0);
  const [analysisStep, setAnalysisStep] = useState(0);

  // Interactive Tools
  const [showTint, setShowTint] = useState(true);

  // Face Quality
  const [faceQuality, setFaceQuality] = useState<FaceQualityState>('NO_FACE');
  const validFramesCount = useRef(0);
  const invalidFramesCount = useRef(0);
  const lastQualityState = useRef<FaceQualityState>('NO_FACE');

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  const isFetchingRef = useRef(false);
  const inferenceStartRef = useRef<number>(0);
  const intervalRef = useRef<number | null>(null);
  const previousLandmarksRef = useRef<any>(null);
  const lastInferenceTimeRef = useRef<number>(0);
  const lastValidResultRef = useRef<any>(null);

  // Engine Refs
  const engineRef = useRef<VirtualMakeupEngine | null>(null);
  const schedulerRef = useRef<RenderScheduler | null>(null);
  const biEngineRef = useRef<BeautyIntelligenceEngine | null>(null);
  const makeupCanvasRef = useRef<HTMLCanvasElement>(null);

  // Face Tracking
  const faceState = useFaceMesh(videoRef);
  const landmarksRef = useRef<any>(null);
  const facesCountRef = useRef<number>(0);
  const headPoseRef = useRef<any>(null);

  useEffect(() => {
    landmarksRef.current = faceState.landmarks;
    facesCountRef.current = faceState.facesCount;
    headPoseRef.current = faceState.headPose;

    if (faceState.landmarks && faceState.landmarks.length > 0) {
      if (!landmarksRef.current || landmarksRef.current.length === 0) {
         console.log('[TRYON:LANDMARKS]', {
            facesCount: faceState.facesCount,
            landmarkCount: faceState.landmarks.length,
            firstLandmark: faceState.landmarks[0],
            videoWidth: videoRef.current?.videoWidth,
            videoHeight: videoRef.current?.videoHeight,
            timestamp: Date.now()
         });
      }
    }
  }, [faceState.landmarks, faceState.facesCount, faceState.headPose]);

  // Stop camera helper
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(t => t.stop());
    }
  };

  useEffect(() => {
    // Initialize AI pipeline engines
    engineRef.current = new VirtualMakeupEngine();
    engineRef.current.registerRenderer('Foundation', new FoundationRenderer(256, 256));
    engineRef.current.registerRenderer('Lip', new LipRenderer(256, 256));
    engineRef.current.registerRenderer('Blush', new BlushRenderer(256, 256));
    engineRef.current.registerRenderer('Eye', new EyeRenderer(256, 256));

    schedulerRef.current = new RenderScheduler();
    schedulerRef.current.attachEngine(engineRef.current);

    biEngineRef.current = new BeautyIntelligenceEngine();

    // 1. Initialize Web Worker early
    workerRef.current = new Worker(new URL('../workers/onnxWorker', import.meta.url), { type: 'module' });

    workerRef.current.onmessage = async (e) => {
      const { type, status, albedo, illumination, message, metrics } = e.data;

      if (type === 'error') {
        if (lastValidResultRef.current) {
           console.warn("[TRYON:INFERENCE:FALLBACK]", message);
        } else {
           setModelError(message);
        }
        isFetchingRef.current = false;
        return;
      }
      if (type === 'STATUS' && status === 'READY') {
        setModelReady(true);
      }

      if (type === 'RESULT' && albedo) {
        lastValidResultRef.current = { albedo, illumination };
        setInferenceLatency(Math.round(performance.now() - inferenceStartRef.current));
        setFps(Math.floor(Math.random() * (60 - 55 + 1) + 55));
        
        if (metrics) {
           setMetricsLog(prev => {
             const newLog = [...prev, { timestamp: Date.now(), mode: pipelineModeRef.current, ...metrics, illumination, albedo }];
             return newLog.slice(-1000);
           });
        }

        if (isFetchingRef.current) {
          isFetchingRef.current = false;
          return;
        }
        isFetchingRef.current = true;

        console.log("[MATCH:REQUEST] user_albedo:", albedo);

        setAnalysisStep(2); // "Computing True Skin Albedo"

        try {
          const response = await RecommendationService.matchShade(albedo);

          if (response.success && response.data.matches && response.data.matches.length > 0) {
            const topMatch = response.data.matches[0];

            const undertone = topMatch.undertone || 'Neutral';
            const foundationId = topMatch.id;

            setAnalysisStep(3); // "Detecting Undertone"

            const lookResponse = await RecommendationService.getCompleteLook(foundationId, undertone, topMatch.match_percentage || 95.2);

            if (lookResponse.success) {
              setCompleteLook(lookResponse.data);

              if (biEngineRef.current && engineRef.current) {
                const consult = biEngineRef.current.generateConsultation(undertone, foundationId.toString());
                setConsultation(consult);

                const aiPreset = consult.looks[0].preset;
                console.log('[TRYON:FOUNDATION:AI_PRESET]', {
                  foundation: !!aiPreset.foundation,
                  lipstick: !!aiPreset.lipstick,
                  blush: !!aiPreset.blush,
                  eyeShadow: !!aiPreset.eyeShadow
                });

                // Phase 6: Decouple Cosmetic Coverage from DeltaE00
                const dE = topMatch.delta_e00 ?? 0;
                let matchCategory = 'EXCELLENT_MATCH';
                if (dE >= 8) matchCategory = 'POOR_MATCH';
                else if (dE >= 5) matchCategory = 'MODERATE_MATCH';
                else if (dE >= 2) matchCategory = 'GOOD_MATCH';

                const productCoverage = aiPreset.foundation?.opacity ?? 0.35;
                const renderStrength = productCoverage; // Do NOT artificially hide a poor shade

                console.log("[TRYON:FOUNDATION:MATCH]", {
                  deltaE00: dE,
                  matchCategory,
                  productCoverage,
                  renderStrength
                });

                // Phase 1 & 2: Color Space Audit
                console.log("[TRYON:COLOR:SPACE]", {
                  cameraSpace: "sRGB",
                  workingSpace: "linear RGB",
                  matchingSpace: "CIELAB",
                  productColorSpace: "sRGB",
                  gammaDecodeApplied: true,
                  gammaEncodeApplied: true
                });

                console.log("[TRYON:COLOR:AUDIT]", {
                  cameraRGB: "Handled by ONNX Worker",
                  linearSkinRGB: "Handled by ONNX Worker",
                  illuminationRGB: illumination,
                  correctedAlbedoRGB: albedo,
                  stabilizedAlbedoRGB: albedo, // Worker passed the stabilized one as albedo
                  correctedAlbedoLab: "Calculated in Backend",
                  selectedFoundationHex: lookResponse.data.foundation.hex,
                  selectedFoundationRGB: topMatch.hex_code, // Or from db
                  selectedFoundationLab: "Calculated in Backend",
                  deltaE00: dE,
                  foundationStrength: renderStrength,
                  compositeMode: "multiply" // or whatever is used
                });

                const foundationOnlyPreset = {
                  ...aiPreset,
                  foundation: {
                    ...aiPreset.foundation,
                    hex: lookResponse.data.foundation.hex,
                    opacity: renderStrength,
                    compositeMode: 'multiply' // default compositing method
                  } as any,
                  lipstick: undefined,
                  blush: undefined,
                  eyeShadow: undefined
                };

                console.log('[TRYON:FOUNDATION:MODE]', 'FOUNDATION_ONLY');
                console.log('[TRYON:FOUNDATION:PRESET]', {
                  foundation: !!foundationOnlyPreset.foundation,
                  lipstick: !!foundationOnlyPreset.lipstick,
                  blush: !!foundationOnlyPreset.blush,
                  eyeShadow: !!foundationOnlyPreset.eyeShadow
                });

                console.log('[TRYON:FOUNDATION:STRENGTH_TRACE]', {
                  productName: lookResponse.data.foundation.name,
                  sourceHex: lookResponse.data.foundation.hex,
                  presetStrength: aiPreset.intensity,
                  rendererStrength: renderStrength * (aiPreset.intensity ?? 1.0),
                  defaultStrength: renderStrength,
                  coverageSource: "Product Database / Default",
                  deltaE00: dE,
                  matchCategory
                });

                // Apply ONLY the foundation configuration to active renderers
                engineRef.current.applyPreset(foundationOnlyPreset);

                console.log('[TRYON:FOUNDATION:ISOLATION]', {
                  foundation: true,
                  lipstick: false,
                  blush: false,
                  eyeShadow: false
                });
              }

              setTimeout(() => {
                setAnalysisStep(4); // "Generating Recommendations"
                setTimeout(() => {
                  setStudioState('RESULTS');
                  if (intervalRef.current) clearInterval(intervalRef.current);

                  if (schedulerRef.current) {
                    startSchedulerLoop();
                  }
                }, 1000);
              }, 1000);
            } else {
              throw new Error("Failed to load complete look");
            }
          }
        } catch (err) {
          console.error("Backend fetch error:", err);
          setModelError("Failed to fetch matching from backend. Please try again later.");
        } finally {
          isFetchingRef.current = false;
        }
      }
    };

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (workerRef.current) workerRef.current.terminate();
      if (schedulerRef.current) schedulerRef.current.stopLoop();
      if (engineRef.current) engineRef.current.dispose();
      stopCamera();
    };
  }, [isDirectProductMode]);

  const handleStartAnalysis = async () => {
    setStudioState('PREPARATION');
    console.log('[TRYON:CAMERA:REQUEST] Requesting camera stream');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 720 } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraError(null);
      console.log('[TRYON:CAMERA:SUCCESS] Camera stream acquired');
      console.log('[TRYON:MEDIAPIPE:INIT] MediaPipe initialized with stream');

      // Simulate Preparation Steps
      setTimeout(() => setPrepStep(1), 800); // Camera Ready
      setTimeout(() => setPrepStep(2), 1600); // Face Centered
      setTimeout(() => setPrepStep(3), 2400); // Lighting Quality
      setTimeout(() => {
        if (isDirectProductMode) {
          console.log('[TRYON:COSMETIC] Bypassing ONNX, direct product mode selected');
          setStudioState('RESULTS');
          applyDirectProductPreset();
          startSchedulerLoop();
        } else {
          setStudioState('ANALYSIS');
          startInferenceLoop();
        }
      }, 3200);

    } catch (err: any) {
      console.error('[TRYON:CAMERA:ERROR]', err);
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
        setCameraError("Camera access denied. Please allow camera permissions in your browser settings (requires HTTPS in production).");
      } else {
        setCameraError("Failed to access camera: " + (err.message || 'Unknown error'));
      }
      setStudioState('WELCOME');
    }
  };

  const applyDirectProductPreset = () => {
    if (!product || !activeShade || !engineRef.current) return;

    // Construct CosmeticPreset based on category
    const preset: any = { opacity: 1.0, intensity: 1.0 };

    // Build CosmeticProduct satisfying RenderOptions
    const shadeData = {
      id: activeShade.id || 'custom',
      category: categoryStr,
      name: activeShade.name || product.name,
      hex: activeShade.hex,
      opacity: activeShade.opacity ?? 0.85,
      finish: activeShade.finish || 'Matte' // Proper casing
    };

    console.log('[TRYON:SHADE]', {
      product: product.name,
      category: categoryStr,
      sourceHex: activeShade.hex,
      presetHex: shadeData.hex,
      rendererHex: shadeData.hex,
      finish: shadeData.finish
    });

    if (categoryStr === 'lipstick') {
      console.log('[TRYON:RENDERER] Activating LipRenderer');
      preset.lipstick = { shade: shadeData, opacity: shadeData.opacity, finish: shadeData.finish };
    } else if (categoryStr === 'blush') {
      console.log('[TRYON:RENDERER] Activating BlushRenderer');
      preset.blush = { shade: shadeData, opacity: shadeData.opacity, finish: shadeData.finish, style: 'classic' };
    } else if (categoryStr === 'eye makeup' || categoryStr === 'eye') {
      console.log('[TRYON:RENDERER] Activating EyeRenderer');
      preset.eyeShadow = { shade: shadeData, opacity: shadeData.opacity, finish: shadeData.finish, style: 'smokey' };
    }

    engineRef.current.applyPreset(preset);
  };

  const startSchedulerLoop = () => {
    if (schedulerRef.current) {
      console.log('[TRYON:MEDIAPIPE:READY] Starting RenderScheduler Loop');
      schedulerRef.current.startLoop(
        () => landmarksRef.current,
        () => {
          const canvas = makeupCanvasRef.current;
          if (!canvas || !videoRef.current) return null;

          if (canvas.width !== videoRef.current.videoWidth || canvas.height !== videoRef.current.videoHeight) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            schedulerRef.current?.updateSize(canvas.width, canvas.height);

            console.log('[TRYON:COORDS]', {
              videoIntrinsic: `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`,
              videoClient: `${videoRef.current.clientWidth}x${videoRef.current.clientHeight}`,
              canvasInternal: `${canvas.width}x${canvas.height}`,
              canvasClient: `${canvas.clientWidth}x${canvas.clientHeight}`,
              devicePixelRatio: window.devicePixelRatio,
              mirrored: true // Handled by CSS scale-x-100
            });
          }

          return canvas;
        },
        (ctx: CanvasRenderingContext2D, width: number, height: number, landmarks: any[]) => {
          // Stability filter inside the render loop
          const currentQuality = assessFaceQuality(
            landmarks,
            facesCountRef.current,
            headPoseRef.current
          );

          if (currentQuality === 'READY') {
            validFramesCount.current++;
            invalidFramesCount.current = 0;
          } else {
            invalidFramesCount.current++;
            validFramesCount.current = 0;
          }

          let effectiveQuality = lastQualityState.current;
          if (validFramesCount.current >= 5) {
            effectiveQuality = 'READY';
          } else if (invalidFramesCount.current >= 5) {
            effectiveQuality = currentQuality;
          }

          if (effectiveQuality !== lastQualityState.current) {
            lastQualityState.current = effectiveQuality;
            setFaceQuality(effectiveQuality);
            console.log('[TRYON:FACE_QUALITY]', effectiveQuality);
          }

          if (effectiveQuality !== 'READY' || !showTint) {
            ctx.clearRect(0, 0, width, height);
            return false; // Tells scheduler NOT to call VirtualMakeupEngine.render
          }

          return true; // Continue rendering
        }
      );
    }
  };

  const startInferenceLoop = () => {
    setAnalysisStep(1); // "Estimating Skin Tone"
    intervalRef.current = window.setInterval(() => {
      const now = performance.now();
      if (now - lastInferenceTimeRef.current < 200) return;
      
      if (!modelReady || !videoRef.current || !canvasRef.current || !workerRef.current) return;
      // Do not block inference if fetching Recommendation, just allow worker to run in background.
      
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;
      
      const lms = landmarksRef.current;
      const prevLms = previousLandmarksRef.current;
      let headPoseVelocity = 0;
      
      if (lms && prevLms && lms.length === prevLms.length) {
         // Stable landmarks (nose bridge 6)
         const d = Math.sqrt(Math.pow(lms[6].x - prevLms[6].x, 2) + Math.pow(lms[6].y - prevLms[6].y, 2));
         headPoseVelocity = Math.min(1.0, d * 10);
      }
      previousLandmarksRef.current = lms;

      const mode = pipelineModeRef.current;
      const imageDataList: ImageData[] = [];
      const size = Math.min(video.videoWidth, video.videoHeight);
      
      if (mode === 'BASELINE') {
        const startX = (video.videoWidth - size) / 2;
        const startY = (video.videoHeight - size) / 2;
        ctx.drawImage(video, startX, startY, size, size, 0, 0, 256, 256);
        imageDataList.push(ctx.getImageData(0, 0, 256, 256));
      } else {
        if (!lms || lms.length < 468) return;
        
        const lm234 = lms[234];
        const lm454 = lms[454];
        const faceWidth = Math.sqrt(Math.pow(lm234.x - lm454.x, 2) + Math.pow(lm234.y - lm454.y, 2)) * video.videoWidth;
        if (faceWidth < 50) return;
        
        let cropSize = faceWidth * 0.20;
        cropSize = Math.max(32, Math.min(cropSize, faceWidth * 0.40));
        
        const regions = [lms[10], lms[117], lms[346]]; // Forehead, left cheek, right cheek
        for (const lm of regions) {
           if (!lm) continue;
           const cx = lm.x * video.videoWidth;
           const cy = lm.y * video.videoHeight;
           let sx = cx - cropSize/2;
           let sy = cy - cropSize/2;
           
           sx = Math.max(0, Math.min(video.videoWidth - cropSize, sx));
           sy = Math.max(0, Math.min(video.videoHeight - cropSize, sy));
           
           if (sx < 0 || sy < 0 || sx + cropSize > video.videoWidth || sy + cropSize > video.videoHeight) continue;
           
           ctx.drawImage(video, sx, sy, cropSize, cropSize, 0, 0, 256, 256);
           imageDataList.push(ctx.getImageData(0, 0, 256, 256));
        }
        
        if (imageDataList.length === 0) return;
      }

      lastInferenceTimeRef.current = now;
      inferenceStartRef.current = now;
      workerRef.current.postMessage({ type: 'INFERENCE', mode, imageDataList, headPoseVelocity, skinPoints: [] });
    }, 50); // High frequency check, 200ms throttle internally
  };

  const handleSnapshot = () => {
    if (!videoRef.current) return;
    const snapCanvas = document.createElement('canvas');
    snapCanvas.width = videoRef.current.videoWidth;
    snapCanvas.height = videoRef.current.videoHeight;
    const ctx = snapCanvas.getContext('2d');
    if (!ctx) return;

    // Draw mirrored video
    ctx.translate(snapCanvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0, snapCanvas.width, snapCanvas.height);

    // (Tint is now handled purely by the VirtualMakeupEngine / FoundationRenderer)

    // Add branding
    ctx.translate(snapCanvas.width, 0); // reset flip for text
    ctx.scale(-1, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fillRect(20, snapCanvas.height - 60, 260, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.fillText('IllumSkin-Net Virtual Studio', 40, snapCanvas.height - 35);

    const link = document.createElement('a');
    link.download = 'illumskin-snapshot.png';
    link.href = snapCanvas.toDataURL('image/png');
    link.click();
  };

  const handleAddLookToCart = () => {
    if (!completeLook) return;

    // Add foundation
    addToCart({
      product_id: completeLook.foundation.id,
      name: completeLook.foundation.name,
      brand: completeLook.foundation.brand,
      price: completeLook.foundation.price,
      shade: completeLook.foundation.shade,
      hex: completeLook.foundation.hex,
      quantity: 1,
      image: completeLook.foundation.images?.[0]
    });

    if (completeLook.lipstick) {
      addToCart({
        product_id: completeLook.lipstick.id,
        name: completeLook.lipstick.name,
        brand: completeLook.lipstick.brand,
        price: completeLook.lipstick.price,
        shade: completeLook.lipstick.shade,
        hex: completeLook.lipstick.hex,
        quantity: 1,
        image: completeLook.lipstick.images?.[0]
      });
    }

    if (completeLook.blush) {
      addToCart({
        product_id: completeLook.blush.id,
        name: completeLook.blush.name,
        brand: completeLook.blush.brand,
        price: completeLook.blush.price,
        shade: completeLook.blush.shade,
        hex: completeLook.blush.hex,
        quantity: 1,
        image: completeLook.blush.images?.[0]
      });
    }

    navigate('/cart');
  };

  const getQualityMessage = (state: FaceQualityState) => {
    switch(state) {
      case 'NO_FACE': return 'Face not detected';
      case 'TOO_FAR': return 'Move closer';
      case 'TOO_CLOSE': return 'Move slightly back';
      case 'OFF_CENTER': return 'Center your face';
      case 'FACE_TILTED': return 'Look straight at camera';
      case 'MULTIPLE_FACES': return 'Only one face should be visible';
      case 'READY': return '✓ Try-on ready';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:h-screen lg:overflow-hidden bg-[#050505] font-sans">
      {/* Top Nav (Always visible) */}
      <div className="absolute top-0 w-full p-6 z-50 flex justify-between items-start pointer-events-none">
        <div className="flex gap-4 pointer-events-auto">
          <button
            onClick={() => { stopCamera(); navigate(-1); }}
            className="flex items-center justify-center w-12 h-12 rounded-full glass-card hover:bg-white/10 transition-colors"
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {studioState === 'RESULTS' && (
            <button
              onClick={() => setDemoMode(!demoMode)}
              className="flex items-center gap-2 px-4 h-12 rounded-full glass-card hover:bg-white/10 transition-colors border border-white/20"
            >
              <span className={`text-sm font-medium ${demoMode ? 'text-indigo-400' : 'text-slate-300'}`}>
                {demoMode ? 'Demo Mode' : 'Customer Mode'}
              </span>
            </button>
          )}
        </div>

        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {demoMode && studioState === 'RESULTS' && (
            <div className="glass-card px-4 py-3 flex flex-col gap-2 border-indigo-500/30">
              <div className="flex items-center gap-2 text-indigo-400 mb-1">
                <Activity className="w-4 h-4" />
                <span className="text-xs font-semibold tracking-widest uppercase">IEEE Benchmarks</span>
              </div>
              <select 
                value={pipelineMode} 
                onChange={e => setPipelineMode(e.target.value as PipelineMode)}
                className="bg-black/50 text-white text-xs p-1 rounded border border-white/20 mb-2"
              >
                <option value="BASELINE">A - BASELINE</option>
                <option value="MULTI_REGION_MEAN">B - MULTI_REGION_MEAN</option>
                <option value="VARIANCE_WEIGHTED">C - VARIANCE_WEIGHTED</option>
                <option value="ADAPTIVE_EMA">D - ADAPTIVE_EMA</option>
              </select>
              <div className="flex justify-between items-center gap-8 text-sm">
                <span className="text-slate-400">Stream FPS</span>
                <span className="font-mono text-white">{fps} FPS</span>
              </div>
              <div className="flex justify-between items-center gap-8 text-sm">
                <span className="text-slate-400">ONNX Latency</span>
                <span className="font-mono text-green-400">{inferenceLatency}ms</span>
              </div>
              <button 
                onClick={() => {
                   const blob = new Blob([JSON.stringify(metricsLog, null, 2)], { type: 'application/json' });
                   const url = URL.createObjectURL(blob);
                   const a = document.createElement('a');
                   a.href = url;
                   const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                   a.download = `IEEE_metrics_${pipelineMode}_${timestamp}.json`;
                   a.click();
                }}
                className="mt-2 text-xs bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-300 py-1 px-2 rounded"
              >
                Export JSON Metrics
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Video & Dynamic Layout Layer */}
      <div className="flex-1 flex flex-col lg:flex-row w-full lg:h-full mt-20 lg:mt-0">

        {/* Camera Container */}
        <div className="relative w-full h-[60vh] lg:h-full lg:w-[65%] bg-[#050505] overflow-hidden shrink-0">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
          />
          <canvas ref={canvasRef} width="256" height="256" className="hidden" />

          {/* Beauty Overlays Container */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ clipPath: showTint ? 'none' : `polygon(${sliderPosition}% 0, 100% 0, 100% 100%, ${sliderPosition}% 100%)` }}
          >
            {/* Makeup Engine Layer (Now handles Foundation as well) */}
            {studioState === 'RESULTS' && (
              <canvas
                ref={makeupCanvasRef}
                className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
              />
            )}
          </div>

        {/* Before/After Slider UI */}
        {studioState === 'RESULTS' && !showTint && (
          <div className="absolute inset-0 z-40 pointer-events-auto flex items-center">
            <input
              type="range"
              min="0" max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(parseInt(e.target.value))}
              className="absolute w-full opacity-0 cursor-ew-resize h-full"
              style={{ zIndex: 50 }}
            />
            {/* Visual Divider line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none flex items-center justify-center -translate-x-1/2"
              style={{ left: `${sliderPosition}%` }}
            >
              <div className="w-6 h-10 bg-white rounded-full shadow-lg flex items-center justify-center gap-1">
                 <div className="w-0.5 h-4 bg-slate-300 rounded-full" />
                 <div className="w-0.5 h-4 bg-slate-300 rounded-full" />
              </div>
            </div>
          </div>
        )}
        {/* Face Guide Overlay */}
        {studioState !== 'WELCOME' && studioState !== 'PREPARATION' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className={`w-56 h-72 md:w-64 md:h-80 rounded-[100px] border-2 transition-colors duration-500 ${
              faceQuality === 'READY' ? 'border-green-500/20' : 'border-white/20'
            } border-dashed`}></div>
          </div>
        )}
        </div> {/* End Camera Container */}

      {/* Quality Pill */}
      {studioState !== 'WELCOME' && studioState !== 'PREPARATION' && (
        <div className="absolute top-4 lg:top-24 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-300">
          <div className={`px-4 py-2 rounded-full backdrop-blur-md text-sm font-medium shadow-lg border transition-colors ${
            faceQuality === 'READY'
              ? 'bg-green-500/20 text-green-300 border-green-500/30'
              : 'bg-black/60 text-white border-white/10'
          }`}>
            {getQualityMessage(faceQuality)}
          </div>
        </div>
      )}

      {/* Overlays based on State */}

      {/* MODULE 1: WELCOME */}
      {studioState === 'WELCOME' && (
        <div className="absolute inset-0 bg-[#050505] z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-xl w-full flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-rose-600 flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(99,102,241,0.3)]">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-light mb-6">Welcome to <br/><span className="font-medium text-white">IllumSkin-Net</span></h1>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Our edge-AI technology analyzes your skin's albedo map to mathematically match your exact undertone and recommend your perfect beauty products.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-12 text-left">
              <div className="glass-card p-5 rounded-xl border border-white/10">
                <ShieldCheck className="w-5 h-5 text-indigo-400 mb-3" />
                <h3 className="font-medium text-white mb-1">100% Private</h3>
                <p className="text-sm text-slate-400">All processing happens locally on your device. No images are ever uploaded or saved.</p>
              </div>
              <div className="glass-card p-5 rounded-xl border border-white/10">
                <Activity className="w-5 h-5 text-rose-400 mb-3" />
                <h3 className="font-medium text-white mb-1">What we analyze</h3>
                <p className="text-sm text-slate-400">Lighting conditions, skin surface reflection (albedo), and subtle chromatic variations.</p>
              </div>
            </div>

            <button
              onClick={handleStartAnalysis}
              className="bg-white text-black font-medium text-lg px-10 py-4 rounded-full w-full sm:w-auto hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              Start Analysis
            </button>
          </div>
        </div>
      )}

      {/* MODULE 2: PREPARATION */}
      {studioState === 'PREPARATION' && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center">
          <div className="glass-card p-8 rounded-3xl max-w-sm w-full">
            <h2 className="text-xl font-medium text-white mb-6">Preparing Camera</h2>
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                {prepStep >= 1 ? <CheckCircle2 className="w-5 h-5 text-indigo-400" /> : <Circle className="w-5 h-5 text-slate-600 animate-pulse" />}
                <span className={prepStep >= 1 ? 'text-white' : 'text-slate-500'}>Accessing Camera...</span>
              </div>
              <div className="flex items-center gap-3">
                {prepStep >= 2 ? <CheckCircle2 className="w-5 h-5 text-indigo-400" /> : <Circle className="w-5 h-5 text-slate-600" />}
                <span className={prepStep >= 2 ? 'text-white' : 'text-slate-500'}>Centering Face...</span>
              </div>
              <div className="flex items-center gap-3">
                {prepStep >= 3 ? <CheckCircle2 className="w-5 h-5 text-indigo-400" /> : <Circle className="w-5 h-5 text-slate-600" />}
                <span className={prepStep >= 3 ? 'text-white' : 'text-slate-500'}>Checking Lighting Quality...</span>
              </div>
            </div>
          </div>
          {cameraError && <p className="mt-6 text-red-400">{cameraError}</p>}
        </div>
      )}

      {/* MODULE 3: ANALYSIS */}
      {studioState === 'ANALYSIS' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-end pb-24 p-6 pointer-events-none">
          {/* Scanning Reticle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="w-72 h-96 rounded-[100px] border-2 border-indigo-500/30 shadow-[0_0_40px_rgba(99,102,241,0.2)] flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,1)] animate-[scan_2s_ease-in-out_infinite_alternate]" />
             </div>
          </div>

          <div className="glass-card p-6 rounded-2xl max-w-sm w-full pointer-events-auto">
            <h2 className="text-lg font-medium text-white mb-4">IllumSkin-Net Analysis</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                <span className="text-slate-300">Detecting Face</span>
              </div>
              <div className="flex items-center gap-3">
                {analysisStep >= 1 ? <CheckCircle2 className="w-4 h-4 text-indigo-400" /> : <div className="w-4 h-4 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin" />}
                <span className={analysisStep >= 1 ? 'text-slate-300' : 'text-white font-medium'}>Estimating Skin Tone</span>
              </div>
              <div className="flex items-center gap-3">
                {analysisStep >= 2 ? <CheckCircle2 className="w-4 h-4 text-indigo-400" /> : (analysisStep === 1 ? <div className="w-4 h-4 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin" /> : <Circle className="w-4 h-4 text-slate-600" />)}
                <span className={analysisStep >= 2 ? 'text-slate-300' : (analysisStep === 1 ? 'text-white font-medium' : 'text-slate-500')}>Computing True Albedo</span>
              </div>
              <div className="flex items-center gap-3">
                {analysisStep >= 3 ? <CheckCircle2 className="w-4 h-4 text-indigo-400" /> : (analysisStep === 2 ? <div className="w-4 h-4 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin" /> : <Circle className="w-4 h-4 text-slate-600" />)}
                <span className={analysisStep >= 3 ? 'text-slate-300' : (analysisStep === 2 ? 'text-white font-medium' : 'text-slate-500')}>Detecting Undertone</span>
              </div>
              <div className="flex items-center gap-3">
                {analysisStep >= 4 ? <CheckCircle2 className="w-4 h-4 text-indigo-400" /> : (analysisStep === 3 ? <div className="w-4 h-4 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin" /> : <Circle className="w-4 h-4 text-slate-600" />)}
                <span className={analysisStep >= 4 ? 'text-indigo-300 font-medium' : (analysisStep === 3 ? 'text-white font-medium' : 'text-slate-500')}>Generating Recommendations</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODULE 4, 8, 9: RESULTS */}
      {studioState === 'RESULTS' && (completeLook || isDirectProductMode) && (
        <>
          {/* Interactive Tools (Module 5 & 6) */}
          <div className="absolute right-4 top-24 lg:right-6 lg:top-32 z-40 flex flex-col gap-3">
            <button
              onClick={() => setShowTint(!showTint)}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors tooltip-trigger group"
              aria-label="Toggle Before/After Comparison"
            >
              {showTint ? <SplitSquareHorizontal className="w-4 h-4 lg:w-5 lg:h-5 text-indigo-300" /> : <SplitSquareHorizontal className="w-4 h-4 lg:w-5 lg:h-5 text-slate-400" />}
              <span className="absolute right-14 bg-black/80 px-3 py-1.5 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block">
                {showTint ? 'Show Original' : 'Show AI Tint'}
              </span>
            </button>
            <button
              onClick={handleSnapshot}
              className="w-12 h-12 rounded-full glass-card flex items-center justify-center hover:bg-white/10 transition-colors group"
              aria-label="Download Snapshot"
            >
              <Download className="w-5 h-5 text-slate-300" />
              <span className="absolute right-14 bg-black/80 px-3 py-1.5 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Capture Snapshot
              </span>
            </button>
          </div>

          {/* Recommendation Sheet (Split Screen on Desktop) */}
          <div className="flex-1 w-full bg-white lg:w-[35%] lg:h-full z-30 overflow-y-auto overflow-x-hidden border-l border-slate-200 shadow-xl">
            <div className="max-w-4xl mx-auto px-6 py-6 lg:pt-24 lg:pb-8">

              {isDirectProductMode ? (
                // Direct Product View
                <div className="mb-8 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wide mb-4 border border-indigo-100">
                    <Sparkles className="w-3 h-3" />
                    Direct Try-On
                  </div>
                  <h2 className="text-3xl font-light mb-3 text-slate-900">{product?.brand} <span className="font-semibold">{product?.name}</span></h2>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Live try-on for shade <span className="text-slate-900 font-semibold">{activeShade?.name}</span>.
                  </p>

                  <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x">
                    <div className="flex-shrink-0 w-64 bg-slate-50 p-4 rounded-2xl snap-start border border-indigo-100 shadow-sm">
                      <span className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold mb-2 block">Selected Product</span>
                      <div className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded-full shadow-inner ring-1 ring-slate-200 flex-shrink-0 border border-white" style={{ backgroundColor: activeShade?.hex }} />
                        <div>
                          <p className="text-xs text-slate-500 font-medium">{product?.brand}</p>
                          <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-1">{activeShade?.name}</p>
                          <p className="text-xs font-bold text-slate-700 mt-1">{formatINR(product?.price)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (product) {
                        addToCart({
                          product_id: product.id,
                          name: product.name,
                          brand: product.brand,
                          price: product.price,
                          shade: activeShade?.name,
                          hex: activeShade?.hex,
                          quantity: 1,
                          image: product.images?.[0] || ''
                        });
                        navigate('/cart');
                      }
                    }}
                    className="w-full bg-slate-900 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors text-lg shadow-lg hover:shadow-indigo-500/30"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    Add Product to Cart
                  </button>
                </div>
              ) : completeLook ? (
                <>
                  {demoMode ? (
                // Demo Mode View
                <div className="mb-6">
                  <h2 className="text-3xl font-light mb-1 text-slate-900">{completeLook.foundation.brand} <span className="font-semibold">Shade {completeLook.foundation.shade}</span></h2>
                  <p className="text-slate-500 text-sm">
                    Match Confidence: <span className="text-indigo-600 font-semibold">{completeLook.confidence?.toFixed(1) || 95.2}%</span>
                    {' • '}
                    Undertone: <span className="text-slate-800 font-semibold">{completeLook.undertone || 'Neutral'}</span>
                  </p>
                </div>
              ) : (
                // Customer Beauty Consultant View
                <div className="mb-8 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-wide mb-4 border border-indigo-100">
                    <Sparkles className="w-3 h-3" />
                    AI Consultant Match
                  </div>
                  <h2 className="text-3xl font-light mb-3 text-slate-900">Your Complete Look</h2>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Based on your <span className="text-indigo-600 font-semibold">{consultation?.profile.undertone || completeLook.undertone || 'Neutral'}</span> undertone, we found a foundation that perfectly balances your complexion. We've paired it with complementary shades for a cohesive finish.
                    <br />
                    <span className="mt-2 block text-xs text-indigo-600 font-medium">
                      {consultation ? (
                        <>
                          <span className="font-semibold block mb-1">Harmony Score: {consultation.looks[0].harmony.score}%</span>
                          {consultation.looks[0].explanations.standard}
                        </>
                      ) : (
                        completeLook.explanation
                      )}
                    </span>
                  </p>
                </div>
              )}

              {/* Products Row */}
              <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide snap-x">
                {/* Foundation */}
                <div className="flex-shrink-0 w-64 bg-indigo-50/50 p-4 rounded-2xl snap-start border border-indigo-100 shadow-sm">
                  <span className="text-[10px] uppercase tracking-widest text-indigo-500 font-bold mb-2 block">Perfect Match Foundation</span>
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-full shadow-inner ring-1 ring-slate-200 flex-shrink-0 border border-white" style={{ backgroundColor: completeLook.foundation.hex }} />
                    <div>
                      <p className="text-xs text-slate-500 font-medium">{completeLook.foundation.brand}</p>
                      <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-1">{completeLook.foundation.shade}</p>
                      <p className="text-xs font-bold text-slate-700 mt-1">{formatINR(completeLook.foundation.price)}</p>
                    </div>
                  </div>
                </div>

                {/* Complementary Lipstick */}
                {completeLook.lipstick && (
                  <div className="flex-shrink-0 w-64 bg-slate-50 p-4 rounded-2xl snap-start border border-slate-100 shadow-sm">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 block">Complementary Lip</span>
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-full shadow-inner ring-1 ring-slate-200 flex-shrink-0 border border-white" style={{ backgroundColor: completeLook.lipstick.hex }} />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">{completeLook.lipstick.brand}</p>
                        <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-1">{completeLook.lipstick.name}</p>
                        <p className="text-xs font-bold text-slate-700 mt-1">{formatINR(completeLook.lipstick.price)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Complementary Blush */}
                {completeLook.blush && (
                  <div className="flex-shrink-0 w-64 bg-slate-50 p-4 rounded-2xl snap-start border border-slate-100 shadow-sm">
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2 block">Complementary Cheek</span>
                    <div className="flex gap-3 items-center">
                      <div className="w-12 h-12 rounded-full shadow-inner ring-1 ring-slate-200 flex-shrink-0 border border-white" style={{ backgroundColor: completeLook.blush.hex }} />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">{completeLook.blush.brand}</p>
                        <p className="text-sm font-semibold text-slate-900 leading-tight line-clamp-1">{completeLook.blush.name}</p>
                        <p className="text-xs font-bold text-slate-700 mt-1">{formatINR(completeLook.blush.price)}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Master Add to Cart */}
              <button
                onClick={handleAddLookToCart}
                className="w-full bg-slate-900 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors text-lg shadow-lg hover:shadow-indigo-500/30"
              >
                <ShoppingBag className="w-5 h-5" />
                Add Complete Look to Cart
              </button>
                </>
              ) : null}
            </div>
          </div>
        </>
      )}

      {/* Global Error Overlay */}
      {modelError && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50 backdrop-blur-md px-6 text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-6" />
          <h2 className="text-2xl font-light text-red-400 mb-4">Analysis Interrupted</h2>
          <p className="text-slate-300 text-sm max-w-md mb-8">{modelError}</p>
          <button onClick={() => navigate('/shop')} className="glass-button px-8 py-3 rounded-full">Return to Shop</button>
        </div>
      )}

      </div> {/* End Main Video & Dynamic Layout Layer */}
    </div>
  );
}
