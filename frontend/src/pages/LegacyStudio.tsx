import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Camera, ShoppingBag, ShieldAlert } from 'lucide-react';
import { formatINR } from '../utils/currency';

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
    const setupLegacySandbox = () => {
      console.log(`[Legacy Sandbox] Initializing legacy environment for ${category}`);
    };

    setupLegacySandbox();

    return () => {
      console.log(`[Legacy Sandbox] Tearing down legacy environment. Freeing resources.`);
    };
  }, [category]);

  const handleAddToCart = () => {
    if (selectedSwatch) {
      navigate('/cart', { state: { selectedProduct: selectedSwatch } });
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:h-screen lg:overflow-hidden bg-[#FDFCFB] font-sans">
      {/* Top Nav */}
      <div className="absolute top-0 w-full p-6 z-20 flex justify-between items-start pointer-events-none">
        <button
          onClick={() => navigate(-1)}
          className="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors text-slate-700"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          <div className="bg-orange-50 px-4 py-2 rounded-full flex items-center gap-2 border border-orange-200 shadow-sm">
            <ShieldAlert className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold tracking-widest text-orange-600 uppercase">Legacy Sandbox</span>
          </div>
        </div>
      </div>

      {/* Main Layout (Desktop Split, Mobile Stack) */}
      <div className="flex-1 flex flex-col lg:flex-row w-full lg:h-full mt-20 lg:mt-0">
        {/* Camera / Sandbox View */}
        <div className="relative w-full h-[50vh] lg:h-full lg:w-[65%] bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center" ref={videoContainerRef}>
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-slate-900/80 p-6">
            <Camera className="w-16 h-16 text-slate-500 mb-6" />
            <h2 className="text-2xl md:text-3xl font-light text-white tracking-wide text-center">Legacy Try-On Engine</h2>
            <p className="text-slate-400 mt-4 max-w-md text-center text-sm md:text-base leading-relaxed">
              This secure sandbox is ready to mount older facial landmark scripts.
            </p>
          </div>

          <video
            className="absolute min-w-full min-h-full object-cover transform -scale-x-100 opacity-20"
            muted
            playsInline
          />
        </div>

        {/* Bottom / Side Dashboard */}
        <div className="flex-1 bg-white lg:w-[35%] lg:h-full z-20 overflow-y-auto border-l border-slate-200 shadow-xl flex flex-col">
          <div className="p-6 md:p-8 flex-1 flex flex-col">
            <div className="mb-8">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold tracking-wide mb-4 border border-slate-200 uppercase">
                {category} Selection
              </div>

              {selectedSwatch ? (
                <>
                  <h2 className="text-3xl font-light mb-2 text-slate-900">{selectedSwatch.brand} <span className="font-semibold">{selectedSwatch.product_name}</span></h2>
                  <p className="text-slate-500 text-sm">Shade: <span className="text-slate-900 font-semibold">{selectedSwatch.shade_name}</span></p>
                </>
              ) : (
                <h2 className="text-3xl font-light text-slate-400">Select a shade...</h2>
              )}
            </div>

            {/* Scrollable Swatch Grid/Strip */}
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Available Shades</h3>
              <div className="flex flex-wrap gap-4 mb-8">
                {swatches.map((swatch) => (
                  <button
                    key={swatch.id}
                    onClick={() => setSelectedSwatch(swatch)}
                    className={`w-14 h-14 rounded-full transition-all flex items-center justify-center ${
                      selectedSwatch?.id === swatch.id
                        ? 'ring-2 ring-offset-4 ring-offset-white ring-slate-900 scale-110 shadow-md'
                        : 'ring-1 ring-slate-200 hover:ring-slate-300 hover:scale-105'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-full shadow-inner border border-slate-100"
                      style={{ backgroundColor: swatch.hex_code }}
                    />
                  </button>
                ))}
              </div>
            </div>

            {selectedSwatch && (
              <button
                onClick={handleAddToCart}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md min-h-[56px] mt-auto"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="text-base">Add to Cart - {formatINR(selectedSwatch.price)}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
