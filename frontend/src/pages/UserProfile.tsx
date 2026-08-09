import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, Sparkles, ChevronRight, Calendar, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export default function UserProfile() {
  const navigate = useNavigate();
  const { savedLooks, orderHistory, removeLook, addToCart } = useStore();
  const [activeTab, setActiveTab] = useState<'looks' | 'orders'>('looks');

  const handleAddLookToCart = (look: any) => {
    // Generate a new bundle ID
    const bundleId = `bundle-${Date.now()}`;
    look.items.forEach((item: any) => {
      addToCart({
        ...item,
        quantity: 1,
        isAiRecommended: true,
        bundleId
      });
    });
    toast.success('Saved look added to cart!');
    navigate('/cart');
  };

  const handleRemoveLook = (id: string) => {
    removeLook(id);
    toast.success('Look removed');
  };

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto flex flex-col bg-[#050505] text-white pt-24">
      
      {/* Header */}
      <div className="flex items-center gap-6 mb-12">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <User className="w-10 h-10 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-light">My <span className="font-semibold text-indigo-400">Profile</span></h1>
          <p className="text-slate-400">Manage your saved AI looks and view order history.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-white/10 mb-8">
        <button 
          onClick={() => setActiveTab('looks')}
          className={`pb-4 px-2 text-lg font-medium transition-colors relative ${activeTab === 'looks' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Saved Looks
          </div>
          {activeTab === 'looks' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500 rounded-t-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-4 px-2 text-lg font-medium transition-colors relative ${activeTab === 'orders' ? 'text-indigo-400' : 'text-slate-400 hover:text-white'}`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Order History
          </div>
          {activeTab === 'orders' && <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500 rounded-t-full" />}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1">
        
        {/* Saved Looks Tab */}
        {activeTab === 'looks' && (
          <div className="space-y-6">
            {savedLooks.length === 0 ? (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center border border-white/10 rounded-3xl">
                <Sparkles className="w-12 h-12 text-slate-700 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Saved Looks Yet</h3>
                <p className="text-slate-400 mb-6 max-w-md">Try our Virtual Beauty Studio to analyze your skin tone and get AI-curated recommendations.</p>
                <button onClick={() => navigate('/studio')} className="accent-button px-6 py-3 rounded-full">
                  Try AI Studio
                </button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {savedLooks.map(look => (
                  <div key={look.id} className="glass-card rounded-2xl border border-indigo-500/20 overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-lg">{look.name || 'My Curated Look'}</h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(look.date).toLocaleDateString()}
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRemoveLook(look.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-2 rounded-full hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-6 flex-1 space-y-4">
                      {look.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full flex-shrink-0 border border-white/20" style={{ backgroundColor: item.hex }} />
                          <div>
                            <p className="text-xs text-indigo-300 font-medium uppercase tracking-wide">{item.brand}</p>
                            <p className="text-sm font-medium">{item.name}</p>
                            <p className="text-xs text-slate-400">Shade: {item.shade}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t border-white/10 bg-black/20">
                      <button 
                        onClick={() => handleAddLookToCart(look)}
                        className="w-full bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Order History Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orderHistory.length === 0 ? (
              <div className="glass-card p-12 flex flex-col items-center justify-center text-center border border-white/10 rounded-3xl">
                <Package className="w-12 h-12 text-slate-700 mb-4" />
                <h3 className="text-xl font-medium mb-2">No Orders Yet</h3>
                <p className="text-slate-400 mb-6 max-w-md">When you place an order, it will appear here.</p>
                <button onClick={() => navigate('/shop')} className="glass-button px-6 py-3 rounded-full border border-white/20 hover:bg-white/10 transition-colors">
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {orderHistory.map(order => (
                  <div key={order.id} className="glass-card rounded-2xl border border-white/10 p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-lg text-white">{order.id}</span>
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 mb-1">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
                      <p className="text-sm text-slate-300">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items • ${order.total.toFixed(2)}</p>
                    </div>
                    
                    <button 
                      onClick={() => navigate(`/order-confirmation/${order.id}`)}
                      className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium"
                    >
                      View Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
