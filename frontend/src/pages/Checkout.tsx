import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { OrderService } from '../services/orders';
import type { OrderCreatePayload } from '../services/orders';
import toast from 'react-hot-toast';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, addOrder } = useStore();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    zip: '',
    cardName: '',
    cardNumber: '',
    exp: '',
    cvc: ''
  });

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 50 ? 0 : 5.00;
  const aiItems = cart.filter(item => item.isAiRecommended);
  const discount = aiItems.length > 2 ? aiItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.1 : 0;
  const total = subtotal + shipping - discount;

  if (cart.length === 0 && !isProcessing) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate real order creation
    try {
      const payload: OrderCreatePayload = {
        items: cart,
        subtotal,
        shipping,
        discount,
        total,
        shipping_address: `${formData.address}, ${formData.city} ${formData.zip}`,
        email: formData.email,
        name: formData.name
      };
      
      const order = await OrderService.createOrder(payload);
      addOrder(order);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      toast.error('Checkout failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-7xl mx-auto flex flex-col bg-[#050505] text-white">
      <button 
        onClick={() => navigate('/cart')} 
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors w-max mb-8"
        disabled={isProcessing}
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Cart
      </button>

      <div className="mb-8">
        <h1 className="text-4xl font-light">Secure <span className="font-semibold text-indigo-400">Checkout</span></h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-1 space-y-8">
          <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
            {/* Contact */}
            <div className="glass-card p-6 border border-white/10 rounded-2xl">
              <h2 className="text-xl font-medium mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email</label>
                  <input 
                    required 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                  />
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="glass-card p-6 border border-white/10 rounded-2xl">
              <h2 className="text-xl font-medium mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Address</label>
                  <input 
                    required 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">City</label>
                    <input 
                      required 
                      type="text" 
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">ZIP Code</label>
                    <input 
                      required 
                      type="text" 
                      name="zip"
                      value={formData.zip}
                      onChange={handleInputChange}
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="glass-card p-6 border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-medium">Payment Details</h2>
                <Lock className="w-4 h-4 text-slate-400" />
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Name on Card</label>
                  <input 
                    required 
                    type="text" 
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Card Number</label>
                  <input 
                    required 
                    type="text" 
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="0000 0000 0000 0000"
                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Expiry Date</label>
                    <input 
                      required 
                      type="text" 
                      name="exp"
                      value={formData.exp}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">CVC</label>
                    <input 
                      required 
                      type="text" 
                      name="cvc"
                      value={formData.cvc}
                      onChange={handleInputChange}
                      placeholder="123"
                      className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-indigo-500 transition-colors" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary sidebar */}
        <div className="w-full lg:w-96">
          <div className="glass-card p-6 lg:p-8 rounded-3xl border border-white/10 bg-white/5 sticky top-24">
            <h2 className="text-xl font-medium mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-white/5">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full" style={{ backgroundColor: item.hex }} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white line-clamp-1">{item.name}</p>
                      <p className="text-slate-400">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium text-white">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-slate-300 border-t border-white/10 pt-4 mb-6">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-indigo-300">
                  <span>AI Bundle Discount</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
            </div>
            
            <div className="border-t border-white/10 pt-4 mb-6 flex justify-between items-end">
              <span className="text-lg">Total</span>
              <span className="text-3xl font-semibold">${total.toFixed(2)}</span>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={isProcessing}
              className="w-full accent-button py-4 rounded-xl flex items-center justify-center gap-2 text-lg disabled:opacity-70"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Place Order
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">
              Secured with 256-bit encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
