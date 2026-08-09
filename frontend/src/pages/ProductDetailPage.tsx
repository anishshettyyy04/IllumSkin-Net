import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { ProductService } from '../services/products';
import type { ProductDetail, ProductBase } from '../services/products';
import { useStore } from '../store/useStore';
import { ChevronRight, Star, Heart, Share2, Camera, ShoppingBag, Sparkles, AlertCircle } from 'lucide-react';
import { formatINR } from '../utils/currency';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToCart = useStore(state => state.addToCart);
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<ProductBase[]>([]);
  const [activeShade, setActiveShade] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('description');
  const [activeImage, setActiveImage] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const res = await ProductService.getProductById(Number(id));
        if (res.success && res.data) {
          setProduct(res.data);
          if (res.data.shades && res.data.shades.length > 0) {
            const defaultShade = res.data.shades.find(s => s.hex === res.data.hex) || res.data.shades[0];
            setActiveShade(defaultShade);
          } else {
            setActiveShade({ id: 'default', name: res.data.shade, hex: res.data.hex });
          }
          
          // Fetch related
          const relRes = await ProductService.getProducts(res.data.category);
          if (relRes.success) {
            setRelatedProducts(relRes.data.filter(p => p.id !== res.data.id).slice(0, 4));
          }
        } else {
          throw new Error('Product not found');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-slate-600 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-light">Product Not Found</h1>
          <p className="text-slate-400 mt-2">{error}</p>
          <button 
            onClick={() => navigate('/shop')}
            className="mt-6 glass-button px-6 py-2 rounded-full"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  const images = product.images || [
    'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=800&auto=format&fit=crop'
  ];

  const handleTryOn = () => {
    if (product.category.toLowerCase() === 'foundation') {
      navigate('/studio', { state: { product, activeShade } });
    } else {
      navigate('/studio', { state: { product, activeShade } });
    }
  };

  const handleAddToCart = () => {
    addToCart({
      product_id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      shade: activeShade?.name,
      hex: activeShade?.hex,
      quantity: 1,
      image: images[0]
    });
    // Maybe show a toast, or navigate to cart
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-rose-500/30">
      <Navbar />

      <main className="pt-28 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-slate-500 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-white transition-colors">Home</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => navigate('/shop')} className="hover:text-white transition-colors">Marketplace</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-300">{product.name}</span>
        </nav>

        {/* Product Hero */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
          
          <div className="flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-32 h-fit">
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible scrollbar-hide py-2 md:py-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-indigo-400 opacity-100' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            
            <div className="flex-1 bg-white/5 rounded-2xl overflow-hidden relative group aspect-[4/5] md:aspect-auto md:min-h-[600px] flex items-center justify-center">
              {activeShade && activeShade.id !== 'default' && (
                <div 
                  className="absolute inset-0 opacity-20 mix-blend-color transition-colors duration-500 pointer-events-none"
                  style={{ backgroundColor: activeShade.hex }} 
                />
              )}
              <img 
                src={images[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {product.discount && (
                <div className="absolute top-6 left-6 bg-rose-600 text-white text-xs font-bold px-3 py-1.5 rounded-sm uppercase tracking-widest shadow-xl">
                  {product.discount}% OFF
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm text-indigo-300 font-bold tracking-widest uppercase">{product.brand}</h2>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-300 hover:text-rose-400 hover:bg-white/10 transition-colors">
                  <Heart className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 transition-colors">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-light leading-tight mb-4">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-white/10">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                ))}
                <span className="text-sm font-medium ml-2">{product.rating}</span>
                <span className="text-sm text-slate-500 ml-1">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="flex items-end gap-3 mb-8">
              {product.discount && (
                <span className="text-lg text-slate-500 line-through mb-1">{formatINR(product.price / (1 - product.discount/100))}</span>
              )}
              <span className="text-4xl font-medium">{formatINR(product.price)}</span>
            </div>

            {product.highlights && (
              <ul className="flex flex-wrap gap-2 mb-8">
                {product.highlights.map(h => (
                  <li key={h} className="text-xs font-medium uppercase tracking-widest text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    {h === 'AI Compatible' ? <Sparkles className="w-3 h-3 text-indigo-400" /> : <div className="w-1 h-1 rounded-full bg-slate-500" />}
                    {h}
                  </li>
                ))}
              </ul>
            )}

            {product.isAiCompatible && (
              <div className="glass-card p-4 rounded-xl border border-indigo-500/30 bg-indigo-900/10 flex items-start gap-4 mb-10">
                <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex-shrink-0 flex items-center justify-center text-indigo-400 mt-0.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-medium text-white mb-1">AI Compatible Product</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Use IllumSkin-Net Live Try-On to receive a personalized shade recommendation based on your unique skin albedo.
                  </p>
                </div>
              </div>
            )}

            {product.shades && (
              <div className="mb-10">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="font-medium text-lg">Select Shade</h3>
                    <p className="text-sm text-slate-400">{activeShade?.name}</p>
                  </div>
                  <button onClick={handleTryOn} className="text-xs font-medium text-indigo-400 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-300">
                    Find my shade <Sparkles className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  {product.shades.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setActiveShade(s)}
                      className={`w-12 h-12 rounded-full transition-all flex items-center justify-center ${
                        activeShade?.id === s.id 
                          ? 'ring-2 ring-offset-4 ring-offset-[#050505] ring-indigo-400 scale-110' 
                          : 'ring-1 ring-white/10 hover:ring-white/30'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full shadow-inner" style={{ backgroundColor: s.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={handleTryOn}
                className="flex-1 bg-white text-black font-medium px-6 py-4 rounded-full flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors group"
              >
                <Camera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-base">Live Try-On</span>
              </button>
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-6 py-4 rounded-full flex items-center justify-center gap-2 transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="text-base">Add to Cart - {formatINR(product.price)}</span>
              </button>
            </div>

            <div className="border-t border-white/10 pt-8">
              <div className="flex border-b border-white/10 mb-6 overflow-x-auto scrollbar-hide">
                {['description', 'ingredients', 'usage'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-medium uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab ? 'border-white text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              <div className="text-slate-300 text-sm leading-relaxed min-h-[120px]">
                {activeTab === 'description' && (
                  <p>{product.description || 'No description available for this product.'}</p>
                )}
                {activeTab === 'ingredients' && (
                  <p>{product.ingredients || 'Ingredients list not available.'}</p>
                )}
                {activeTab === 'usage' && (
                  <p>{product.usage || 'Usage instructions not available.'}</p>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Reviews Section */}
        <div className="py-20 border-t border-white/10">
          <h2 className="text-3xl font-light mb-12 text-center">Customer <span className="font-medium text-white">Reviews</span></h2>
          
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-1 flex flex-col items-center md:items-start">
              <span className="text-6xl font-light mb-2">{product.rating}</span>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                ))}
              </div>
              <p className="text-slate-400 text-sm mb-6">Based on {product.reviews} reviews</p>
              <button className="glass-button w-full py-3 rounded-full font-medium">
                Write a Review
              </button>
            </div>
            
            <div className="md:col-span-3 space-y-8">
              {product.reviewsList ? product.reviewsList.map(review => (
                <div key={review.id} className="pb-8 border-b border-white/5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-white">{review.user}</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{review.date}</span>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{review.comment}</p>
                </div>
              )) : (
                <p className="text-slate-500 italic">No reviews yet for this product.</p>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="py-20 border-t border-white/5">
            <h2 className="text-2xl font-light mb-8">You Might Also <span className="font-medium text-white">Like</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map(p => (
                <ProductCard key={p.id} {...(p as any)} />
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
