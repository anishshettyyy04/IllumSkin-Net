import * as ort from 'onnxruntime-web';

// Optional: Configure WebAssembly paths if necessary, but default usually works for Vite
// ort.env.wasm.wasmPaths = '/'; 

let session = null;

/**
 * Initializes the ONNX InferenceSession.
 * This runs as soon as the Web Worker is instantiated.
 */
async function initSession() {
  try {
    console.log("⏳ Initializing ONNX session...");
    // Load the ONNX model from the public directory. 
    // The execution provider is set to 'wasm' to run efficiently in the browser via WebAssembly.
    session = await ort.InferenceSession.create('/illumskin_net.onnx', { executionProviders: ['wasm'] });
    console.log("✅ ONNX InferenceSession successfully loaded in Web Worker.");
    
    // Notify the main thread that the model is ready for inference
    postMessage({ type: 'READY' });
  } catch (error) {
    console.error("❌ Failed to load ONNX model in worker:", error);
    postMessage({ type: 'ERROR', error: error.message });
  }
}

// Start the asynchronous loading process
initSession();

/**
 * Listen for messages from the main React thread.
 */
self.onmessage = async (event) => {
  const { type, payload } = event.data;
  
  // Handle INFERENCE requests
  if (type === 'INFERENCE') {
    if (!session) {
      console.warn("⚠️ ONNX Session is not yet initialized. Dropping frame.");
      return;
    }
    
    try {
      // The payload must be a Float32Array containing the 256x256 image data
      // already normalized and arranged in planar format (R, G, B channels).
      const float32Data = payload;
      
      // 1. Convert the Float32Array into an ONNX runtime Tensor
      // The shape MUST match the PyTorch export: [batch_size=1, channels=3, height=256, width=256]
      const tensor = new ort.Tensor('float32', float32Data, [1, 3, 256, 256]);
      
      // 2. Prepare the input feeds object. 
      // The key 'input_frame' matches the input_names used during torch.onnx.export
      const feeds = { 'input_frame': tensor };
      
      // 3. Execute the forward pass (mathematical inference)
      const results = await session.run(feeds);
      
      // 4. Extract the output array. 
      // 'estimated_illumination' matches the output_names used during torch.onnx.export
      const outputData = results.estimated_illumination.data;
      
      // 5. Send the result back to the main thread
      postMessage({ type: 'RESULT', output: outputData });
      
    } catch (error) {
      console.error("❌ Inference error during session.run():", error);
      postMessage({ type: 'ERROR', error: error.message });
    }
  }
};
