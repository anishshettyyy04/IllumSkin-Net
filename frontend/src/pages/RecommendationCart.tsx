import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Sparkles, ShoppingBag, Trash2, Minus, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { CartItem } from '../store/useStore';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';
import Navbar from '../components/Navbar';

export default function RecommendationCart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart } = useStore();
  const [expandedBundles, setExpandedBundles] = useState<Record<string, boolean>>({});

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FDFCFB] text-slate-900 font-sans">
        <Navbar />
        <div className="flex-1 p-12 flex flex-col items-center justify-center text-center mt-20">
          <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-200">
            <ShoppingBag className="w-10 h-10 text-slate-400" />
          </div>
          <h1 className="text-3xl mb-4 font-light text-slate-900 tracking-tight">Your Cart is Empty</h1>
          <p className="text-slate-500 mb-10 max-w-md leading-relaxed">Discover your perfect shade with our AI studio or explore our catalog of premium cosmetics.</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <button onClick={() => navigate('/studio')} className="flex-1 bg-slate-900 text-white font-medium px-6 py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors shadow-sm">
              <CameraIcon />
              AI Studio
            </button>
            <button onClick={() => navigate('/shop')} className="flex-1 bg-white text-slate-700 font-medium px-6 py-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
              Return to Shop
            </button>
          </div>
        </div>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 500; // Using INR realistic numbers

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
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans">
      <Navbar />

      <div className="pt-28 pb-20 px-6 md:px-12 max-w-6xl mx-auto flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/shop')}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors w-max text-sm font-semibold uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4" />
            Continue Shopping
          </button>
          <button
            onClick={() => {
              clearCart();
              toast.success('Cart cleared');
            }}
            className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <main className="w-full">
          <header className="mb-10">
            <h1 className="text-4xl lg:text-5xl font-light mb-4 text-slate-900 tracking-tight">Your Beauty <span className="font-semibold">Bag</span></h1>
            <p className="text-slate-500">Review your customized makeup bundles and items.</p>
          </header>

          <div className="flex flex-col lg:flex-row gap-10">
            <section className="flex-1 flex flex-col gap-8" aria-label="Cart Items">

            {/* Render AI Bundles */}
            {Object.entries(bundles).map(([bundleId, items]) => {
              const isExpanded = expandedBundles[bundleId] !== false; // true by default
              const bundleTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

              return (
                <div key={bundleId} className="bg-white rounded-3xl overflow-hidden border border-indigo-100 shadow-sm">
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-50 bg-indigo-50/50">
                    <div>
                      <div className="flex items-center gap-1.5 text-indigo-600 font-bold uppercase tracking-widest text-xs mb-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        IllumSkin-Net AI Bundle
                      </div>
                      <p className="text-sm text-slate-600 font-medium">Complete Curated Look</p>
                    </div>
                    <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                      <span className="font-semibold text-xl text-slate-900">{formatINR(bundleTotal)}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeBundle(bundleId)}
                          className="text-slate-400 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 transition-colors"
                          title="Remove Entire Bundle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleBundle(bundleId)}
                          className="text-slate-500 hover:text-slate-900 p-2 rounded-full hover:bg-slate-200 transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 sm:p-6 flex flex-col gap-6">
                      {items.map((item, idx) => (
                        <div key={item.id}>
                          <CartItemRow
                            item={item}
                            updateQuantity={updateQuantity}
                            removeFromCart={(id) => {
                              removeFromCart(id);
                              toast.success('Item removed');
                            }}
                          />
                          {idx < items.length - 1 && <hr className="mt-6 border-slate-100" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Render Regular Items */}
            {regularItems.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {Object.keys(bundles).length > 0 && (
                  <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Individual Items</h3>
                  </div>
                )}
                <div className="p-5 sm:p-6 flex flex-col gap-6">
                  {regularItems.map((item, idx) => (
                    <div key={item.id}>
                      <CartItemRow
                        item={item}
                        updateQuantity={updateQuantity}
                        removeFromCart={(id) => {
                          removeFromCart(id);
                          toast.success('Item removed');
                        }}
                      />
                      {idx < regularItems.length - 1 && <hr className="mt-6 border-slate-100" />}
                    </div>
                  ))}
                </div>
              </div>
            )}
            </section>

          {/* Order Summary */}
          <aside className="w-full lg:w-[380px] flex-shrink-0" aria-label="Order Summary">
            <div className="w-full bg-white p-8 h-max rounded-3xl border border-slate-200 shadow-xl lg:sticky lg:top-32">
              <h2 className="text-2xl font-light mb-8 text-slate-900">Order Summary</h2>

              <div className="space-y-4 text-slate-600 mb-8 font-medium">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Subtotal ({cart.reduce((a,b)=>a+b.quantity,0)} items)</span>
                  <span className="text-slate-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Shipping</span>
                  <span className={shipping === 0 ? "text-indigo-600 font-semibold" : "text-slate-900"}>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center bg-indigo-50 px-3 py-2 rounded-lg mt-2">
                    <span className="flex items-center gap-1.5 text-indigo-600 text-sm font-semibold">
                      <Sparkles className="w-3.5 h-3.5" /> AI Bundle Discount
                    </span>
                    <span className="text-indigo-600 font-bold">-{formatINR(discount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-6 mb-8 flex justify-between items-end">
                <span className="text-slate-500 uppercase tracking-widest font-bold text-xs mb-1">Total</span>
                <span className="text-4xl font-semibold text-slate-900 tracking-tight">{formatINR(total)}</span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-slate-900 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 text-lg hover:bg-slate-800 transition-colors shadow-md hover:shadow-lg"
              >
                <Check className="w-5 h-5" />
                Proceed to Checkout
              </button>

              <p className="text-center text-xs text-slate-400 mt-4 font-medium flex items-center justify-center gap-1">
                <LockIcon /> Secure encrypted checkout
              </p>
            </div>
          </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

// Helper components
function CartItemRow({ item, updateQuantity, removeFromCart }: {
  item: CartItem,
  updateQuantity: (id: string | number, quantity: number) => void,
  removeFromCart: (id: string | number) => void
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
      <div
        className="w-20 h-20 rounded-2xl flex-shrink-0 relative overflow-hidden border border-slate-100 shadow-sm"
        style={item.hex ? { backgroundColor: item.hex } : { backgroundColor: '#f8fafc' }}
      >
        {item.image && !item.hex && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1">
        <p className="text-[10px] text-indigo-600 font-bold tracking-widest uppercase mb-1">{item.brand}</p>
        <h3 className="text-lg font-medium text-slate-900 leading-tight">{item.name}</h3>
        {item.shade && (
           <p className="text-slate-500 text-sm mt-1 flex items-center gap-1.5">
             Shade: <span className="font-semibold text-slate-700">{item.shade}</span>
           </p>
        )}
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-8 w-full sm:w-auto mt-4 sm:mt-0">
        <div className="flex items-center gap-3 bg-slate-50 rounded-full px-2 py-1 border border-slate-200">
          <button
            onClick={() => updateQuantity(item.id, item.quantity - 1)}
            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 bg-white rounded-full shadow-sm border border-slate-100 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-6 text-center text-sm font-semibold text-slate-700">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item.id, item.quantity + 1)}
            className="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 bg-white rounded-full shadow-sm border border-slate-100 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>

        <div className="text-xl font-semibold text-slate-900 w-24 text-right">{formatINR(item.price * item.quantity)}</div>

        <button
          onClick={() => removeFromCart(item.id)}
          className="text-slate-400 hover:text-rose-500 transition-colors p-2 -mr-2 rounded-full hover:bg-rose-50 hidden sm:block"
          aria-label={`Remove ${item.name} from cart`}
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function CameraIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
      <circle cx="12" cy="13" r="3"/>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}
