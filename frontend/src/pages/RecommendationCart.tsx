import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Sparkles, ShoppingBag, Trash2, Minus, Plus } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function RecommendationCart() {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart } = useStore();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen p-12 flex flex-col items-center justify-center text-center bg-[#050505] text-white">
        <h1 className="text-3xl mb-4 font-light">Your Cart is Empty</h1>
        <button onClick={() => navigate('/shop')} className="glass-button px-6 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
          Return to Shop
        </button>
      </div>
    );
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.00;
  
  // Calculate potential bundle discount if there are multiple items
  const discount = cart.length > 2 ? subtotal * 0.1 : 0;
  
  const total = subtotal + shipping - discount;

  const handleCheckout = () => {
    // Mock checkout process
    alert('Checkout flow initiated! (Mock)');
    clearCart();
    navigate('/');
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-5xl mx-auto flex flex-col bg-[#050505] text-white">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-max mb-8"
      >
        <ChevronLeft className="w-5 h-5" />
        Back
      </button>
      
      <div className="mb-12 flex items-center gap-4">
        {cart.length > 2 ? <Sparkles className="w-10 h-10 text-indigo-400" /> : <ShoppingBag className="w-10 h-10 text-indigo-400" />}
        <div>
          <h1 className="text-4xl font-light">Your <span className="font-semibold text-indigo-400">Cart</span></h1>
          <p className="text-slate-400 mt-2">Review your items before purchasing.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 border border-white/10 rounded-2xl">
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
              
              <div className="flex items-center gap-4 sm:gap-6 self-start sm:self-auto mt-4 sm:mt-0">
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
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="text-xl font-semibold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</div>
                
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-2 rounded-full hover:bg-rose-500/10"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-96 glass-card p-8 h-max rounded-3xl border border-white/10 bg-white/5">
          <h2 className="text-2xl font-medium mb-6">Order Summary</h2>
          <div className="space-y-4 text-slate-300 mb-6">
            <div className="flex justify-between">
              <span>Subtotal ({cart.reduce((a,b)=>a+b.quantity,0)} items)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className={shipping === 0 ? "text-green-400" : ""}>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="flex items-center gap-1 text-indigo-300">
                  <Sparkles className="w-3 h-3" /> Bundle Discount
                </span>
                <span className="text-green-400">-${discount.toFixed(2)}</span>
              </div>
            )}
          </div>
          
          <div className="border-t border-white/10 pt-6 mb-8 flex justify-between items-end">
            <span className="text-lg">Total</span>
            <span className="text-3xl font-semibold">${total.toFixed(2)}</span>
          </div>

          <button 
            onClick={handleCheckout}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-4 rounded-xl flex items-center justify-center gap-2 text-lg transition-colors"
          >
            <Check className="w-5 h-5" />
            Checkout Now
          </button>
        </div>
      </div>
    </div>
  );
}
