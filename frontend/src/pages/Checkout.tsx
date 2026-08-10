import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { OrderService } from '../services/orders';
import type { OrderCreatePayload } from '../services/orders';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';
import Navbar from '../components/Navbar';

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, clearCart, addOrder } = useStore();
  const { isAuthenticated, user } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // Auth Guard
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isAuthenticated) {
      toast.error('Please log in to checkout');
      navigate('/login', { state: { from: '/checkout' } });
    }
  }, [isAuthenticated, navigate]);

  const [formData, setFormData] = useState({
    name: user?.username || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 5000 ? 0 : 500;
  const aiItems = cart.filter(item => item.isAiRecommended);
  const discount = aiItems.length > 2 ? aiItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 0.1 : 0;
  const total = subtotal + shipping - discount;

  if (cart.length === 0 && !isProcessing) {
    navigate('/cart');
    return null;
  }

  if (!isAuthenticated) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const payload: OrderCreatePayload = {
        items: cart,
        shipping_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`,
        name: formData.name,
        phone: formData.phone
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
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans">
      <Navbar />

      <div className="pt-28 pb-20 px-6 md:px-12 max-w-7xl mx-auto flex flex-col">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors w-max mb-8 text-sm font-semibold uppercase tracking-widest"
          disabled={isProcessing}
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Cart
        </button>

        <div className="mb-8">
          <h1 className="text-4xl lg:text-5xl font-light tracking-tight text-slate-900">Secure <span className="font-semibold">Checkout</span></h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-10 lg:gap-16">
          {/* Checkout Form */}
          <div className="flex-1 space-y-8">
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-8">
              {/* Shipping */}
              <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-3xl shadow-sm">
                <h2 className="text-xl font-medium mb-6 text-slate-900">Shipping Address</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Full Name</label>
                    <input
                      required
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Phone</label>
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Address</label>
                    <input
                      required
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all shadow-sm"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">City</label>
                      <input
                        required
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">State</label>
                      <input
                        required
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all shadow-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Pincode</label>
                      <input
                        required
                        type="text"
                        name="zip"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white p-6 md:p-8 border border-slate-200 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-medium text-slate-900">Payment Details</h2>
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <div className="space-y-4">
                  <div className="p-5 border-2 border-indigo-500 bg-indigo-50 rounded-2xl flex items-center justify-between shadow-sm">
                    <div>
                      <p className="font-semibold text-slate-900">Cash on Delivery</p>
                      <p className="text-sm text-slate-600 font-medium">Pay when your order is delivered.</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border-[5px] border-indigo-500"></div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Order Summary sidebar */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white p-6 lg:p-8 rounded-3xl border border-slate-200 shadow-xl lg:sticky lg:top-32">
              <h2 className="text-2xl font-light mb-6 text-slate-900">Order Summary</h2>

              <div className="space-y-4 mb-6 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm" style={item.hex ? { backgroundColor: item.hex } : { backgroundColor: '#f8fafc' }}>
                        {item.image && !item.hex && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                        <p className="text-slate-500 font-medium text-xs mt-0.5">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-semibold text-slate-900">{formatINR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4 text-slate-600 font-medium border-t border-slate-100 pt-6 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-900">{formatINR(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? "text-indigo-600" : "text-slate-900"}>{shipping === 0 ? "Free" : formatINR(shipping)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-indigo-600">
                    <span>AI Bundle Discount</span>
                    <span>-{formatINR(discount)}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 pt-6 mb-8 flex justify-between items-end">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Total</span>
                <span className="text-4xl font-semibold text-slate-900 tracking-tight">{formatINR(total)}</span>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={isProcessing}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 text-lg transition-colors shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
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
              <p className="text-center text-xs text-slate-400 mt-4 font-medium flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Secured with 256-bit encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
