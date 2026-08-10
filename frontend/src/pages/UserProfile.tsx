import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, Sparkles, ChevronRight, Calendar, ShoppingBag, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useAuthStore } from '../store/useAuthStore';
import { OrderService } from '../services/orders';
import toast from 'react-hot-toast';
import { formatINR } from '../utils/currency';
import Navbar from '../components/Navbar';

export default function UserProfile() {
  const navigate = useNavigate();
  const { savedLooks, removeLook, addToCart } = useStore();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'looks' | 'orders'>('looks');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (activeTab === 'orders') {
      setLoadingOrders(true);
      OrderService.getUserOrders()
        .then(data => {
            setOrders(data);
        })
        .catch(() => {
            toast.error("Failed to load order history");
        })
        .finally(() => {
            setLoadingOrders(false);
        });
    }
  }, [activeTab, isAuthenticated, navigate]);

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

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Logged out successfully');
  };

  if (!isAuthenticated || !user) return null;

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans">
      <Navbar />

      <div className="pt-28 pb-20 px-6 md:px-12 max-w-6xl mx-auto flex flex-col md:flex-row gap-10 lg:gap-16">

        {/* Sidebar / Header Information */}
        <div className="w-full md:w-72 lg:w-80 flex-shrink-0">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm md:sticky md:top-32">
            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm mb-4">
                <User className="w-10 h-10 text-slate-400" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">{user.username}</h1>
              <p className="text-slate-500 text-sm">{user.email}</p>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('looks')}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-medium transition-colors ${
                  activeTab === 'looks'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className={`w-5 h-5 ${activeTab === 'looks' ? 'text-indigo-600' : 'text-slate-400'}`} />
                Saved Looks
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Package className={`w-5 h-5 ${activeTab === 'orders' ? 'text-indigo-600' : 'text-slate-400'}`} />
                Order History
              </button>
            </div>

            <hr className="my-6 border-slate-100" />

            <button
              onClick={handleLogout}
              className="w-full text-left px-5 py-3 text-sm font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="mb-8">
            <h2 className="text-3xl font-light text-slate-900 tracking-tight">
              {activeTab === 'looks' ? 'My Saved Looks' : 'Order History'}
            </h2>
            <p className="text-slate-500 mt-2">
              {activeTab === 'looks'
                ? 'Your personalized beauty bundles saved from the AI studio.'
                : 'Track and manage your past purchases.'}
            </p>
          </div>

          {/* Saved Looks Tab */}
          {activeTab === 'looks' && (
            <div className="space-y-6">
              {savedLooks.length === 0 ? (
                <div className="bg-white p-12 flex flex-col items-center justify-center text-center border border-slate-200 rounded-3xl shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                    <Sparkles className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-3 text-slate-900">No Saved Looks Yet</h3>
                  <p className="text-slate-500 mb-8 max-w-md">Try our Virtual Beauty Studio to analyze your skin tone and get AI-curated recommendations.</p>
                  <button onClick={() => navigate('/studio')} className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm">
                    Try AI Studio
                  </button>
                </div>
              ) : (
                <div className="grid lg:grid-cols-2 gap-6">
                  {savedLooks.map(look => (
                    <div key={look.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg text-slate-900 mb-1">{look.name || 'My Curated Look'}</h3>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5" /> {new Date(look.date).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveLook(look.id)}
                          className="text-slate-400 hover:text-rose-500 transition-colors p-2 rounded-full hover:bg-rose-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-6 flex-1 space-y-5">
                        {look.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex-shrink-0 border border-slate-100 shadow-sm" style={{ backgroundColor: item.hex }} />
                            <div>
                              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest mb-0.5">{item.brand}</p>
                              <p className="text-sm font-semibold text-slate-900 line-clamp-1">{item.name}</p>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">Shade: <span className="text-slate-700">{item.shade}</span></p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-5 border-t border-slate-100">
                        <button
                          onClick={() => handleAddLookToCart(look)}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm"
                        >
                          <ShoppingBag className="w-4 h-4" />
                          Add Look to Cart
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
              {loadingOrders ? (
                <div className="flex justify-center p-12">
                  <div className="w-8 h-8 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white p-12 flex flex-col items-center justify-center text-center border border-slate-200 rounded-3xl shadow-sm">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                    <Package className="w-8 h-8 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-medium mb-3 text-slate-900">No Orders Yet</h3>
                  <p className="text-slate-500 mb-8 max-w-md">When you place an order, it will appear here.</p>
                  <button onClick={() => navigate('/shop')} className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-sm">
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {orders.map(order => (
                    <div key={order.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                          <span className="font-semibold text-lg text-slate-900">#{order.id.split('-')[0]}</span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                            {order.status}
                          </span>
                          <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
                            {order.paymentMethod || 'COD'}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 mb-1 font-medium">Placed on {new Date(order.date || order.created_at).toLocaleDateString()}</p>
                        <p className="text-sm text-slate-700 font-semibold">{order.items?.reduce((sum: any, item: any) => sum + item.quantity, 0) || 0} items • {formatINR(order.total)}</p>
                      </div>

                      <button
                        onClick={() => navigate(`/order-confirmation/${order.id}`)}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 px-5 py-3 rounded-xl transition-colors text-sm font-semibold"
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
    </div>
  );
}
