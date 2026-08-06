import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Camera, ShoppingBag, ShieldAlert } from 'lucide-react';

// Generate some dynamic dummy swatches based on category
const getDummySwatches = (category: string) => {
  const baseCategory = category || 'Product';
  return [
    { id: 101, type: baseCategory, category: baseCategory, brand: 'MAC', product_name: 'Classic Matte', shade_name: 'Shade 1', price: 21, hex_code: '#A31321' },
    { id: 102, type: baseCategory, category: baseCategory, brand: 'Fenty', product_name: 'Gloss Bomb', shade_name: 'Shade 2', price: 24, hex_code: '#E8A3B2' },
    { id: 103, type: baseCategory, category: baseCategory, brand: 'NARS', product_name: 'Velvet', shade_name: 'Shade 3', price: 28, hex_code: '#8B2C3C' },
    { id: 104, type: baseCategory, category: baseCategory, brand: 'Charlotte Tilbury', product_name: 'K.I.S.S.', shade_name: 'Shade 4', price: 34, hex_code: '#D17C7A' },
    { id: 105, type: baseCategory, category: baseCategory, brand: 'Rare Beauty', product_name: 'Soft Pinch', shade_name: 'Shade 5', price: 23, hex_code: '#B25D6B' }
  ];
};

export default function LegacyStudio() {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || 'Legacy Product';
  
  const [swatches, setSwatches] = useState<any[]>([]);
  const [selectedSwatch, setSelectedSwatch] = useState<any>(null);
  
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Load dummy swatches
    const loadedSwatches = getDummySwatches(category);
    setSwatches(loadedSwatches);
    setSelectedSwatch(loadedSwatches[0]);

    // 2. Sandbox Setup for Legacy Scripts
    // This provides a clean, isolated DOM injection point for older landmark models
    // (e.g. face-api.js or old OpenCV.js scripts) to be mounted manually later.
    const setupLegacySandbox = () => {
      console.log(`[Legacy Sandbox] Initializing legacy environment for ${category}`);
      // Future: Inject <script src="/legacy_assets/face_model.js"></script> here
    };

    setupLegacySandbox();

    // 3. Cleanup function to ensure scripts/camera unmount cleanly
    return () => {
      console.log(`[Legacy Sandbox] Tearing down legacy environment. Freeing resources.`);
      // Future: Remove injected scripts and stop MediaStream tracks here
    };
  }, [category]);

  const handleAddToCart = () => {
    if (selectedSwatch) {
      // Maintains standardized payload structure for RecommendationCart
      navigate('/cart', { state: { selectedProduct: selectedSwatch } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col h-screen overflow-hidden bg-black">
      {/* Top Nav */}
      <div className="absolute top-0 w-full p-6 z-20 flex justify-between items-start pointer-events-none">
        <button 
          onClick={() => navigate('/categories')} 
          className="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full glass-card hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <div className="glass-card px-4 py-2 flex items-center gap-2 border-orange-500/30">
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-semibold tracking-widest text-orange-400 uppercase">Legacy Sandbox Active</span>
          </div>
        </div>
      </div>

      {/* Main Camera / Sandbox View */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden" ref={videoContainerRef}>
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/50">
          <Camera className="w-16 h-16 text-slate-600 mb-4" />
          <h2 className="text-2xl font-light text-slate-400 tracking-wide uppercase">Legacy Try-On Engine</h2>
          <p className="text-slate-500 mt-2 max-w-md text-center text-sm">
            This secure sandbox is ready to mount the older facial landmark scripts from the `public/legacy_assets` folder.
          </p>
        </div>
        
        {/* Placeholder for the actual legacy video element */}
        <video 
          className="absolute min-w-full min-h-full object-cover transform -scale-x-100 opacity-20" 
          muted 
          playsInline
        />
      </div>

      {/* Bottom Dashboard */}
      <div className="h-64 bg-[#0a0a0a] border-t border-white/10 p-6 flex flex-col relative z-20">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-slate-400 text-sm font-medium tracking-wider uppercase mb-1">{category} Selection</p>
            {selectedSwatch ? (
              <>
                <h2 className="text-3xl font-light">{selectedSwatch.brand} <span className="font-semibold">{selectedSwatch.product_name}</span></h2>
                <p className="text-slate-400 mt-1">Shade: <span className="text-white font-medium">{selectedSwatch.shade_name}</span></p>
              </>
            ) : (
              <h2 className="text-3xl font-light text-slate-500">Select a shade...</h2>
            )}
          </div>
          {selectedSwatch && (
            <button 
              onClick={handleAddToCart}
              className="bg-white text-black hover:bg-slate-200 transition-colors px-8 py-3 rounded-full flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="font-medium">Add to Cart - ${selectedSwatch.price}</span>
            </button>
          )}
        </div>

        {/* Scrollable Swatch Strip */}
        <div className="flex-1 flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {swatches.map((swatch) => (
            <div 
              key={swatch.id}
              onClick={() => setSelectedSwatch(swatch)}
              className={`flex-shrink-0 cursor-pointer flex flex-col items-center gap-2 transition-transform ${
                selectedSwatch?.id === swatch.id ? 'scale-110' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <div 
                className={`w-14 h-14 rounded-full shadow-lg ${selectedSwatch?.id === swatch.id ? 'ring-2 ring-offset-2 ring-offset-[#0a0a0a] ring-white' : ''}`}
                style={{ backgroundColor: swatch.hex_code }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
