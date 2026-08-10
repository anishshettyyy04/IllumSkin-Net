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
      <div className="min-h-screen bg-[#FDFCFB] text-slate-900 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] text-slate-900 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h1 className="text-2xl font-light text-slate-800">Product Not Found</h1>
          <p className="text-slate-500 mt-2">{error}</p>
          <button 
            onClick={() => navigate('/shop')}
            className="mt-6 bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-full shadow-sm transition-colors"
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
    navigate('/studio', { state: { product, activeShade, category: product.category } });
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
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 selection:bg-rose-500/20 font-sans">
      <Navbar />

      <main className="pt-28 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-400 mb-8">
          <button onClick={() => navigate('/')} className="hover:text-slate-900 transition-colors">Home</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={() => navigate('/shop')} className="hover:text-slate-900 transition-colors">Marketplace</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-700">{product.name}</span>
        </nav>

        {/* Product Hero */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 mb-20">
          
          <div className="flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-32 h-fit">
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-visible scrollbar-hide py-2 md:py-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all shadow-sm ${
                    activeImage === idx ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            
            <div className="flex-1 bg-white rounded-3xl overflow-hidden relative group aspect-[4/5] md:aspect-auto md:min-h-[600px] flex items-center justify-center border border-slate-100 shadow-sm">
              {activeShade && activeShade.id !== 'default' && (
                <div 
                  className="absolute inset-0 opacity-10 mix-blend-multiply transition-colors duration-500 pointer-events-none"
                  style={{ backgroundColor: activeShade.hex }} 
                />
              )}
              <img 
                src={images[activeImage]} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {product.discount && (
                <div className="absolute top-6 left-6 bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                  {product.discount}% OFF
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs text-indigo-600 font-bold tracking-widest uppercase">{product.brand}</h2>
              <div className="flex gap-2">
                <button className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-all">
                  <Heart className="w-4 h-4" />
                </button>
                <button className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-light leading-tight mb-4 text-slate-900 tracking-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-200">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                ))}
                <span className="text-sm font-semibold text-slate-800 ml-2">{product.rating}</span>
                <span className="text-sm text-slate-500 ml-1">({product.reviews} reviews)</span>
              </div>
            </div>

            <div className="flex items-end gap-3 mb-8">
              {product.discount && (
                <span className="text-lg text-slate-400 line-through mb-1">{formatINR(product.price / (1 - product.discount/100))}</span>
              )}
              <span className="text-4xl font-semibold text-slate-900 tracking-tight">{formatINR(product.price)}</span>
            </div>

            {product.highlights && (
              <ul className="flex flex-wrap gap-2 mb-8">
                {product.highlights.map(h => (
                  <li key={h} className="text-xs font-bold uppercase tracking-widest text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                    {h === 'AI Compatible' ? <Sparkles className="w-3 h-3 text-indigo-500" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                    {h}
                  </li>
                ))}
              </ul>
            )}

            {product.isAiCompatible && (
              <div className="bg-indigo-50/80 p-5 rounded-2xl border border-indigo-100 flex items-start gap-4 mb-10 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 mt-0.5 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-900 mb-1">AI Compatible Product</h3>
                  <p className="text-sm text-indigo-800/80 leading-relaxed">
                    Use IllumSkin-Net Live Try-On to receive a personalized shade recommendation based on your unique skin albedo.
                  </p>
                </div>
              </div>
            )}

            {product.shades && (
              <div className="mb-10">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">Select Shade</h3>
                    <p className="text-sm text-slate-500 font-medium mt-1">{activeShade?.name}</p>
                  </div>
                  <button onClick={handleTryOn} className="text-xs font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">
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
                          ? 'ring-2 ring-offset-4 ring-offset-[#FDFCFB] ring-indigo-500 scale-110 shadow-md' 
                          : 'ring-1 ring-slate-200 hover:ring-slate-300 hover:scale-105'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full shadow-inner border border-slate-100" style={{ backgroundColor: s.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={handleTryOn}
                className="flex-1 bg-white border-2 border-slate-900 text-slate-900 font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Camera className="w-5 h-5" />
                <span className="text-base">Live Try-On</span>
              </button>
              <button 
                onClick={handleAddToCart}
                className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="text-base">Add to Cart</span>
              </button>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <div className="flex border-b border-slate-200 mb-6 overflow-x-auto scrollbar-hide">
                {['description', 'ingredients', 'usage'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-sm font-bold uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${
                      activeTab === tab ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              
              <div className="text-slate-600 text-sm leading-relaxed min-h-[120px]">
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
        <div className="py-20 border-t border-slate-200">
          <h2 className="text-3xl font-light mb-12 text-center text-slate-900">Customer <span className="font-medium text-rose-500">Reviews</span></h2>
          
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-1 flex flex-col items-center md:items-start">
              <span className="text-6xl font-light mb-2 text-slate-900 tracking-tight">{product.rating}</span>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                ))}
              </div>
              <p className="text-slate-500 text-sm font-medium mb-6">Based on {product.reviews} reviews</p>
              <button className="w-full py-3 rounded-full font-semibold border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                Write a Review
              </button>
            </div>
            
            <div className="md:col-span-3 space-y-8">
              {product.reviewsList ? product.reviewsList.map(review => (
                <div key={review.id} className="pb-8 border-b border-slate-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-slate-900">{review.user}</p>
                      <div className="flex gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-400">{review.date}</span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                </div>
              )) : (
                <p className="text-slate-500 italic">No reviews yet for this product.</p>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="py-20 border-t border-slate-200">
            <h2 className="text-2xl font-light mb-8 text-slate-900">You Might Also <span className="font-medium text-rose-500">Like</span></h2>
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
