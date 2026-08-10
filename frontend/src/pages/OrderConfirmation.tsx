import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Truck, Sparkles, Package } from 'lucide-react';
import { OrderService } from '../services/orders';
import type { OrderRecord } from '../store/useStore';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';
import Navbar from '../components/Navbar';

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      OrderService.getOrder(id)
        .then(setOrder)
        .catch(() => {
          toast.error("Could not load order details.");
          navigate('/');
        })
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFCFB]">
        <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!order) return null;

  const hasAiBundle = order.items.some(item => item.isAiRecommended);
  const formattedDate = new Date(order.estimated_delivery).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans">
      <Navbar />

      <div className="pt-32 pb-24 px-6 max-w-3xl mx-auto flex flex-col items-center">

        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8 border border-green-100 shadow-sm">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>

        <h1 className="text-4xl md:text-5xl font-light mb-4 text-center tracking-tight text-slate-900">Thank you for your order</h1>
        <p className="text-slate-500 mb-12 text-center text-lg max-w-md">Your order <span className="font-semibold text-slate-900">#{order.id.split('-')[0]}</span> has been placed and is being processed.</p>

        {hasAiBundle && (
          <div className="mb-10 p-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 flex items-start gap-4 w-full shadow-sm">
            <Sparkles className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-indigo-900 mb-1">Complete AI Look Purchased</h3>
              <p className="text-sm text-indigo-800/80 leading-relaxed">Get ready to shine with your personalized IllumSkin-Net curated bundle. Expertly matched to your exact skin albedo.</p>
            </div>
          </div>
        )}

        <div className="w-full grid md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-slate-50 rounded-full border border-slate-100">
              <Truck className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Estimated Delivery</h3>
              <p className="text-slate-900 font-medium">{formattedDate}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-slate-50 rounded-full border border-slate-100">
              <Package className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Order Status</h3>
              <p className="text-slate-900 font-medium capitalize">{order.status}</p>
            </div>
          </div>
        </div>

        {/* Receipt Style Box */}
        <div className="w-full bg-white p-8 md:p-10 rounded-3xl border border-slate-200 shadow-xl mb-12 relative overflow-hidden">
          {/* Decorative jagged edge effect for receipt at top/bottom (optional but premium borders usually prefer clean) */}

          <div className="flex justify-between items-end mb-8 border-b border-slate-100 pb-6">
              <div>
                <h2 className="text-2xl font-light text-slate-900">Order Summary</h2>
                <p className="text-sm text-slate-500 mt-1">Order #{order.id}</p>
              </div>
              <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">Payment Method</span>
                  <span className="font-semibold text-slate-900 bg-slate-100 px-3 py-1 rounded-md text-sm">Cash on Delivery</span>
              </div>
          </div>

          <div className="space-y-6 mb-8">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between items-start text-sm">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 bg-slate-50">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full" style={{ backgroundColor: item.hex }} />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.name}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{item.brand} {item.shade ? `• Shade: ${item.shade}` : ''}</p>
                    <p className="text-slate-500 text-xs mt-0.5 font-medium">Qty: {item.quantity}</p>
                  </div>
                </div>
                <span className="font-semibold text-slate-900 mt-1">{formatINR(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-slate-200 pt-6 flex justify-between items-end">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Total Paid</span>
            <span className="text-4xl font-semibold text-slate-900 tracking-tight">{formatINR(order.total)}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <button
            onClick={() => navigate('/shop')}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-medium px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
          >
            Continue Shopping <ChevronRight className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto bg-white text-slate-700 font-medium px-8 py-4 rounded-xl border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
          >
            Back to Home
          </button>
        </div>

      </div>
    </div>
  );
}
