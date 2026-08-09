import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Sparkles, ShoppingBag, Trash2, Minus, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { CartItem } from '../store/useStore';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';

export default function RecommendationCart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart } = useStore();
  const [expandedBundles, setExpandedBundles] = useState<Record<string, boolean>>({});

  if (cart.length === 0) {
    return (
      <div className="min-h-screen p-12 flex flex-col items-center justify-center text-center bg-[#050505] text-white">
        <ShoppingBag className="w-16 h-16 text-slate-800 mb-6" />
        <h1 className="text-3xl mb-4 font-light">Your Cart is Empty</h1>
        <p className="text-slate-400 mb-8 max-w-md">Discover your perfect shade with our AI studio or explore our catalog.</p>
        <div className="flex gap-4">
          <button onClick={() => navigate('/studio')} className="accent-button px-6 py-2 rounded-full">
            AI Studio
          </button>
          <button onClick={() => navigate('/shop')} className="glass-button px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.00;
  
  // Calculate potential bundle discount if there are AI recommended items
  const aiItems = cart.filter(item => item.isAiRecommended);
  const discount = aiItems.length > 2 ? aiItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.1 : 0;
  
  const total = subtotal + shipping - discount;

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const toggleBundle = (bundleId: string) => {
    setExpandedBundles(prev => ({ ...prev, [bundleId]: !prev[bundleId] }));
  };

  const removeBundle = (bundleId: string) => {
    cart.filter(i => i.bundleId === bundleId).forEach(i => removeFromCart(i.id));
    toast.success('Bundle removed from cart');
  };

  // Group items by bundleId
  const bundles: Record<string, CartItem[]> = {};
  const regularItems: CartItem[] = [];

  cart.forEach(item => {
    if (item.isAiRecommended && item.bundleId) {
      if (!bundles[item.bundleId]) bundles[item.bundleId] = [];
      bundles[item.bundleId].push(item);
    } else {
      regularItems.push(item);
    }
  });

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <div className="p-6 md:p-12 max-w-5xl mx-auto flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <button 
            onClick={() => navigate('/shop')} 
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-max"
          >
            <ChevronLeft className="w-5 h-5" />
            Continue Shopping
          </button>
          <button 
            onClick={() => {
              clearCart();
              toast.success('Cart cleared');
            }}
            className="text-sm text-slate-500 hover:text-rose-400 transition-colors"
          >
            Clear Cart
          </button>
        </div>
        
        <main className="max-w-4xl mx-auto w-full">
          <header className="mb-10 text-center sm:text-left">
            <h1 className="text-4xl font-light mb-4">Your Beauty Cart</h1>
            <p className="text-slate-400">Review your customized makeup bundles and items.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="lg:col-span-2 flex flex-col gap-8" aria-label="Cart Items">
            
            {/* Render AI Bundles */}
            {Object.entries(bundles).map(([bundleId, items]) => {
              const isExpanded = expandedBundles[bundleId] !== false; // true by default
              const bundleTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

              return (
                <div key={bundleId} className="glass-card rounded-2xl overflow-hidden border border-indigo-500/30 bg-indigo-900/10">
                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-500/20 bg-indigo-500/5">
                    <div>
                      <div className="flex items-center gap-2 text-indigo-400 font-medium mb-1">
                        <Sparkles className="w-4 h-4" />
                        Recommended by IllumSkin-Net
                      </div>
                      <p className="text-sm text-slate-300">Complete AI-Curated Look (Based on your Albedo Map)</p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="font-semibold text-lg">{formatINR(bundleTotal)}</span>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => removeBundle(bundleId)}
                          className="text-slate-400 hover:text-rose-400 p-2 rounded-full hover:bg-rose-500/10 transition-colors"
                          title="Remove Entire Bundle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => toggleBundle(bundleId)}
                          className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-4 sm:p-6 space-y-4">
                      {items.map(item => (
                        <CartItemRow 
                          key={item.id} 
                          item={item} 
                          updateQuantity={updateQuantity} 
                          removeFromCart={(id) => {
                            removeFromCart(id);
                            toast.success('Item removed');
                          }} 
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Render Regular Items */}
            {regularItems.length > 0 && (
              <div className="space-y-4">
                {Object.keys(bundles).length > 0 && <h3 className="text-lg font-medium text-slate-300 mb-2">Individual Items</h3>}
                {regularItems.map(item => (
                  <div key={item.id} className="glass-card rounded-2xl border border-white/10 p-4 sm:p-6">
                    <CartItemRow 
                      item={item} 
                      updateQuantity={updateQuantity} 
                      removeFromCart={(id) => {
                        removeFromCart(id);
                        toast.success('Item removed');
                      }} 
                    />
                  </div>
                ))}
              </div>
            )}
            </section>

          {/* Order Summary */}
          <aside className="lg:col-span-1" aria-label="Order Summary">
            <div className="w-full lg:w-96 glass-card p-8 h-max rounded-3xl border border-white/10 bg-white/5 sticky top-24">
              <h2 className="text-2xl font-medium mb-6">Order Summary</h2>
              <div className="space-y-4 text-slate-300 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.reduce((a,b)=>a+b.quantity,0)} items)</span>
                  <span>{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-green-400" : ""}>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1 text-indigo-300">
                      <Sparkles className="w-3 h-3" /> AI Bundle Discount
                    </span>
                    <span className="text-green-400">-{formatINR(discount)}</span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-white/10 pt-6 mb-8 flex justify-between items-end">
                <span className="text-lg">Total</span>
                <span className="text-3xl font-semibold">{formatINR(total)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full accent-button py-4 rounded-xl flex items-center justify-center gap-2 text-lg"
              >
                <Check className="w-5 h-5" />
                Proceed to Checkout
              </button>
            </div>
          </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper component for rendering individual rows
function CartItemRow({ item, updateQuantity, removeFromCart }: { 
  item: CartItem, 
  updateQuantity: (id: string | number, quantity: number) => void,
  removeFromCart: (id: string | number) => void
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      <div 
        className="w-16 h-16 rounded-lg shadow-inner flex-shrink-0 relative overflow-hidden bg-white/5"
        style={item.hex ? { backgroundColor: item.hex } : {}}
      >
        {item.image && !item.hex && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1">
        <p className="text-xs text-indigo-300 font-medium tracking-wider uppercase mb-1">{item.brand}</p>
        <h3 className="text-lg font-medium">{item.name}</h3>
        {item.shade && <p className="text-slate-400 text-sm">Shade: {item.shade}</p>}
      </div>
      
      <div className="flex items-center gap-4 sm:gap-6 self-start sm:self-auto mt-2 sm:mt-0">
        <div className="flex items-center gap-3 bg-white/5 rounded-full px-3 py-1 border border-white/10">
          <button 
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
          <button 
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="text-slate-400 hover:text-white transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none rounded"
            aria-label={`Increase quantity for ${item.name}`}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="text-xl font-semibold w-24 text-right" aria-label={`Price: ${formatINR(item.price * item.quantity)}`}>{formatINR(item.price * item.quantity)}</div>
        
        <button 
          onClick={() => removeFromCart(item.id)}
          className="text-slate-500 hover:text-rose-400 transition-colors p-2 rounded-full hover:bg-rose-500/10 focus-visible:ring-2 focus-visible:ring-rose-400 outline-none"
          aria-label={`Remove ${item.name} from cart`}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
