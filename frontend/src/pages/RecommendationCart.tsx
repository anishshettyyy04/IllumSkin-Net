import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Check, Sparkles, ShoppingBag } from 'lucide-react';

export default function RecommendationCart() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the selected foundation or legacy product from the router state
  const selectedFoundation = location.state?.selectedFoundation;
  const selectedProduct = location.state?.selectedProduct; // From legacy studio

  // Fallback if accessed directly without selecting a foundation
  if (!selectedFoundation && !selectedProduct) {
    return (
      <div className="min-h-screen p-12 flex flex-col items-center justify-center text-center">
        <h1 className="text-3xl mb-4 font-light">Your Cart is Empty</h1>
        <button onClick={() => navigate('/categories')} className="accent-button px-6 py-2 rounded-full">
          Return to Shop
        </button>
      </div>
    );
  }

  // --- LEGACY CHECKOUT VIEW ---
  if (selectedProduct) {
    return (
      <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto flex flex-col">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-max mb-8"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Shop
        </button>
        
        <div className="mb-12 flex items-center gap-4">
          <ShoppingBag className="w-10 h-10 text-indigo-400" />
          <div>
            <h1 className="text-4xl font-light">Standard <span className="font-semibold text-indigo-400">Checkout</span></h1>
            <p className="text-slate-400 mt-2">Review your selected item before purchasing.</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="glass-card p-6 flex items-center gap-6">
              <div 
                className="w-16 h-16 rounded-lg shadow-inner flex-shrink-0"
                style={{ backgroundColor: selectedProduct.hex_code }}
              />
              <div className="flex-1">
                <p className="text-xs text-indigo-300 font-medium tracking-wider uppercase mb-1">{selectedProduct.type || selectedProduct.category}</p>
                <h3 className="text-xl font-medium">{selectedProduct.brand}</h3>
                <p className="text-slate-300">{selectedProduct.product_name || selectedProduct.name} - Shade {selectedProduct.shade_name || selectedProduct.shade}</p>
              </div>
              <div className="text-xl font-semibold">${selectedProduct.price}</div>
            </div>
          </div>

          <div className="w-full lg:w-96 glass-card p-8 h-max">
            <h2 className="text-2xl font-medium mb-6">Order Summary</h2>
            <div className="space-y-4 text-slate-300 mb-6">
              <div className="flex justify-between">
                <span>Subtotal (1 item)</span>
                <span>${selectedProduct.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-slate-400">$5.00</span>
              </div>
            </div>
            
            <div className="border-t border-white/10 pt-6 mb-8 flex justify-between items-end">
              <span className="text-lg">Total</span>
              <span className="text-3xl font-semibold">${(selectedProduct.price + 5).toFixed(2)}</span>
            </div>

            <button className="w-full accent-button py-4 rounded-xl flex items-center justify-center gap-2 text-lg">
              <Check className="w-5 h-5" />
              Complete Purchase
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- AI RECOMMENDATION CHECKOUT VIEW ---
  
  // Generate complementary products based on undertone
  const undertone = selectedFoundation.undertone?.toLowerCase() || 'neutral';
  
  const complementaryProducts = [];
  
  if (undertone === 'warm') {
    complementaryProducts.push({ id: 2, type: 'Lipstick', brand: 'MAC', name: 'Matte Lipstick', shade: 'Tropic Tonic (Coral)', price: 21, hex: '#F26D68' });
    complementaryProducts.push({ id: 3, type: 'Blush', brand: 'NARS', name: 'Powder Blush', shade: 'Torrid (Warm Peach)', price: 32, hex: '#F08D79' });
  } else if (undertone === 'cool') {
    complementaryProducts.push({ id: 2, type: 'Lipstick', brand: 'MAC', name: 'Retro Matte', shade: 'Ruby Woo (Cool Red)', price: 21, hex: '#A31321' });
    complementaryProducts.push({ id: 3, type: 'Blush', brand: 'Fenty Beauty', name: 'Cream Blush', shade: 'Cool Berry', price: 24, hex: '#993B57' });
  } else {
    // Neutral
    complementaryProducts.push({ id: 2, type: 'Lipstick', brand: 'Charlotte Tilbury', name: 'Matte Revolution', shade: 'Pillow Talk', price: 35, hex: '#C68882' });
    complementaryProducts.push({ id: 3, type: 'Blush', brand: 'Rare Beauty', name: 'Soft Pinch', shade: 'Hope (Nude Mauve)', price: 23, hex: '#D68988' });
  }

  // The full bundle
  const bundle = [
    {
      id: 1,
      type: 'Foundation',
      brand: selectedFoundation.brand,
      name: selectedFoundation.product_name,
      shade: selectedFoundation.shade_name,
      price: selectedFoundation.price,
      hex: selectedFoundation.hex_code
    },
    ...complementaryProducts
  ];

  const total = bundle.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto flex flex-col">
      <button 
        onClick={() => navigate('/studio')} 
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-max mb-8"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Studio
      </button>
      
      <div className="mb-12 flex items-center gap-4">
        <Sparkles className="w-10 h-10 text-indigo-400" />
        <div>
          <h1 className="text-4xl font-light">Best Matches <span className="font-semibold text-indigo-400">For You</span></h1>
          <p className="text-slate-400 mt-2">Based on your {selectedFoundation.undertone} undertone, our AI has curated this perfect bundle.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {bundle.map((item) => (
            <div key={item.id} className="glass-card p-6 flex items-center gap-6">
              <div 
                className="w-16 h-16 rounded-lg shadow-inner flex-shrink-0"
                style={{ backgroundColor: item.hex }}
              />
              <div className="flex-1">
                <p className="text-xs text-indigo-300 font-medium tracking-wider uppercase mb-1">{item.type}</p>
                <h3 className="text-xl font-medium">{item.brand}</h3>
                <p className="text-slate-300">{item.name} - Shade {item.shade}</p>
              </div>
              <div className="text-xl font-semibold">${item.price}</div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-96 glass-card p-8 h-max">
          <h2 className="text-2xl font-medium mb-6">Order Summary</h2>
          <div className="space-y-4 text-slate-300 mb-6">
            <div className="flex justify-between">
              <span>Subtotal (3 items)</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-green-400">Free</span>
            </div>
            <div className="flex justify-between">
              <span>AI Bundle Discount</span>
              <span className="text-green-400">-10%</span>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-6 mb-8 flex justify-between items-end">
            <span className="text-lg">Total</span>
            <span className="text-3xl font-semibold">${(total * 0.9).toFixed(2)}</span>
          </div>

          <button className="w-full accent-button py-4 rounded-xl flex items-center justify-center gap-2 text-lg">
            <Check className="w-5 h-5" />
            Checkout Now
          </button>
        </div>
      </div>
    </div>
  );
}
