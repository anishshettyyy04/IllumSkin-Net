import { useEffect, useRef, useState } from "react";

function App() {
  const videoLeftRef = useRef<HTMLVideoElement>(null);
  const videoRightRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [wsConnected, setWsConnected] = useState(false);
  const [metrics, setMetrics] = useState({
    raw_rgb: [0, 0, 0],
    corrected_rgb: [0, 0, 0],
    delta_e_raw: 0.0,
    delta_e_corrected: 0.0,
    matched_shade: "Calibrating...",
  });

  useEffect(() => {
    // 1. Initialize Webcam
    navigator.mediaDevices
      .getUserMedia({ video: { width: 640, height: 480 } })
      .then((stream) => {
        if (videoLeftRef.current) videoLeftRef.current.srcObject = stream;
        if (videoRightRef.current) videoRightRef.current.srcObject = stream;
      })
      .catch((err) => console.error("Camera error:", err));

    // 2. Initialize WebSocket
    const connectWS = () => {
      const ws = new WebSocket("ws://localhost:8000/ws/stream");

      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => {
        setWsConnected(false);
        setTimeout(connectWS, 2000); // Auto-reconnect
      };
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setMetrics(data);
      };
      wsRef.current = ws;
    };
    connectWS();

    // 3. Capture & Stream Loop (30 FPS)
    const interval = setInterval(() => {
      if (
        wsRef.current?.readyState === WebSocket.OPEN &&
        videoLeftRef.current &&
        canvasRef.current
      ) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoLeftRef.current, 0, 0, 256, 256);
          canvasRef.current.toBlob(
            (blob) => {
              if (blob) wsRef.current?.send(blob);
            },
            "image/jpeg",
            0.5
          );
        }
      }
    }, 1000 / 30);

    return () => clearInterval(interval);
  }, []);

  // UI Helpers
  const rgbToCss = (rgb: number[]) => `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-mono p-6">
      {/* Hidden canvas for extracting frames */}
      <canvas ref={canvasRef} width="256" height="256" className="hidden" />

      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-neutral-100">
            IllumSkin-Net
          </h1>
          <p className="text-sm text-neutral-500">
            IEEE Real-Time Color Constancy Demo
          </p>
        </div>
        <div
          className={`px-4 py-1 rounded-full text-sm font-bold ${
            wsConnected
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {wsConnected ? "🟢 BACKEND CONNECTED" : "🔴 BACKEND DISCONNECTED"}
        </div>
      </header>

      {/* Split Screen Grid */}
      <div className="grid grid-cols-2 gap-8">
        {/* Left Pane: Industry Standard */}
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden relative">
            <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 text-xs rounded z-10">
              Standard Extraction
            </div>
            <video
              ref={videoLeftRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto aspect-video object-cover"
            />
          </div>

          <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800 flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400 mb-1">
                Raw Detected Albedo
              </p>
              <div className="text-xl font-bold">
                ΔE: {metrics.delta_e_raw.toFixed(1)}
              </div>
              {metrics.delta_e_raw > 5.0 && (
                <span className="text-xs text-red-400">
                  High Drift Detected
                </span>
              )}
            </div>
            <div
              className="w-16 h-16 rounded shadow-inner border border-neutral-700"
              style={{ backgroundColor: rgbToCss(metrics.raw_rgb) }}
            />
          </div>
        </div>

        {/* Right Pane: IllumSkin-Net */}
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-blue-900/50 rounded-lg overflow-hidden relative shadow-[0_0_15px_rgba(30,58,138,0.2)]">
            <div className="absolute top-2 left-2 bg-blue-600/80 px-2 py-1 text-xs rounded z-10 text-white">
              IllumSkin-Net Corrected
            </div>
            <video
              ref={videoRightRef}
              autoPlay
              playsInline
              muted
              className="w-full h-auto aspect-video object-cover"
            />
          </div>

          <div className="bg-blue-950/30 p-4 rounded-lg border border-blue-900/50 flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300 mb-1">True Skin Albedo</p>
              <div className="text-xl font-bold text-blue-100">
                ΔE: {metrics.delta_e_corrected.toFixed(1)}
              </div>
              {metrics.delta_e_corrected < 3.0 && (
                <span className="text-xs text-green-400">Stable Match</span>
              )}
            </div>
            <div
              className="w-16 h-16 rounded shadow-inner border border-neutral-700"
              style={{ backgroundColor: rgbToCss(metrics.corrected_rgb) }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Recommendation Bar */}
      <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-lg p-6 text-center">
        <h2 className="text-neutral-400 text-sm mb-2">
          Real-Time Foundation Match
        </h2>
        <div className="text-3xl font-bold text-white tracking-wider">
          {metrics.matched_shade}
        </div>
      </div>
    </div>
  );
}

export default App;
