import * as ort from 'onnxruntime-web';

// Specify the path to the wasm binaries so they are loaded properly in Vite
ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.17.0/dist/';

let session: ort.InferenceSession | null = null;

async function init() {
  try {
    session = await ort.InferenceSession.create('/models/illumskin_net.onnx', {
      executionProviders: ['wasm']
    });
    console.log("ONNX Session Loaded Successfully in Web Worker");
    postMessage({ type: 'STATUS', status: 'READY' });
  } catch (e: any) {
    console.error("Failed to load ONNX model:", e);
    postMessage({ type: 'error', message: e.message || 'Failed to initialize ONNX session' });
  }
}

init();

self.onmessage = async (e: MessageEvent) => {
  if (!session) return;
  
  const { type, imageData } = e.data;
  
  if (type === 'INFERENCE' && imageData) {
    try {
      // imageData is an ImageData object from the 224x224 canvas
      const data = imageData.data; // Uint8ClampedArray of RGBA values
      
      // We need a Float32Array of size 1 * 3 * 224 * 224
      const float32Data = new Float32Array(3 * 224 * 224);
      
      // The model expects [1, 3, 224, 224] (NCHW format, RGB)
      // Normalize pixel values 0-255 to 0.0-1.0
      let i = 0;
      for (let y = 0; y < 224; y++) {
        for (let x = 0; x < 224; x++) {
          const rgbaIdx = (y * 224 + x) * 4;
          
          // R
          float32Data[i] = data[rgbaIdx] / 255.0;
          // G
          float32Data[i + 224 * 224] = data[rgbaIdx + 1] / 255.0;
          // B
          float32Data[i + 2 * 224 * 224] = data[rgbaIdx + 2] / 255.0;
          
          i++;
        }
      }
      
      const tensor = new ort.Tensor('float32', float32Data, [1, 3, 224, 224]);
      
      // The input node name needs to match the exported model (often 'input' or similar)
      // If we don't know the exact input name, we can get it from the session
      const inputName = session.inputNames[0];
      const feeds: Record<string, ort.Tensor> = {};
      feeds[inputName] = tensor;
      
      const results = await session.run(feeds);
      const outputName = session.outputNames[0];
      const outputData = results[outputName].data; // Float32Array of size 3
      
      // Expected output: [R, G, B] albedo
      const albedo = [outputData[0], outputData[1], outputData[2]];
      
      postMessage({ type: 'RESULT', albedo });
      
    } catch (error: any) {
      console.error("Inference Error:", error);
      postMessage({ type: 'error', message: error.message || 'Inference failed' });
    }
  }
};
