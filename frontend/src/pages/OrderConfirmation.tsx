import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronRight, Package, Truck, Sparkles } from 'lucide-react';
import { OrderService } from '../services/orders';
import type { OrderRecord } from '../store/useStore';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
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
    <div className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto flex flex-col items-center bg-[#050505] text-white pt-24">
      
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>

      <h1 className="text-4xl font-light mb-2 text-center">Thank you for your order!</h1>
      <p className="text-slate-400 mb-10 text-center">Your order <span className="font-medium text-white">{order.id}</span> has been placed and is being processed.</p>

      {hasAiBundle && (
        <div className="mb-8 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 flex items-center gap-4 max-w-lg w-full">
          <Sparkles className="w-8 h-8 text-indigo-400 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-indigo-300">Complete AI Look Purchased</h3>
            <p className="text-sm text-slate-300">Get ready to shine with your personalized IllumSkin-Net bundle.</p>
          </div>
        </div>
      )}

      <div className="w-full grid md:grid-cols-2 gap-6 mb-10">
        <div className="glass-card p-6 rounded-2xl border border-white/10 flex items-start gap-4">
          <div className="p-3 bg-white/5 rounded-full">
            <Truck className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-medium text-lg mb-1">Estimated Delivery</h3>
            <p className="text-slate-300">{formattedDate}</p>
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-white/10 flex items-start gap-4">
          <div className="p-3 bg-white/5 rounded-full">
            <Package className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <h3 className="font-medium text-lg mb-1">Order Status</h3>
            <p className="text-slate-300 capitalize">{order.status}</p>
          </div>
        </div>
      </div>

      <div className="w-full glass-card p-6 md:p-8 rounded-3xl border border-white/10 mb-10">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium">Order Summary</h2>
            <div className="text-right">
                <span className="text-sm text-slate-400 block">Payment Method</span>
                <span className="font-medium text-indigo-400">Cash on Delivery</span>
            </div>
        </div>
        
        <div className="space-y-4 mb-6">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-white/5">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ backgroundColor: item.hex }} />
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="text-slate-400">{item.brand} {item.shade ? `| Shade: ${item.shade}` : ''}</p>
                  <p className="text-slate-500 text-xs">Qty: {item.quantity}</p>
                </div>
              </div>
              <span className="font-medium text-white">{formatINR(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-6 flex justify-between items-end">
          <span className="text-lg text-slate-300">Amount</span>
          <span className="text-3xl font-semibold">{formatINR(order.total)}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
        <button 
          onClick={() => navigate('/shop')}
          className="accent-button px-8 py-3 rounded-xl flex items-center justify-center gap-2"
        >
          Continue Shopping <ChevronRight className="w-4 h-4" />
        </button>
        <button 
          onClick={() => navigate('/')}
          className="glass-button px-8 py-3 rounded-xl border border-white/20 hover:bg-white/10 transition-colors"
        >
          Back to Home
        </button>
      </div>

    </div>
  );
}
