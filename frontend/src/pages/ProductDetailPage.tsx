import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ProductService } from '../services/products';
import type { ProductDetail, ProductBase } from '../services/products';
import { useStore } from '../store/useStore';
import { ChevronRight, Star, Heart, Share2, Camera, ShoppingBag, Sparkles, AlertCircle } from 'lucide-react';
import { formatINR } from '../utils/currency';
import toast from 'react-hot-toast';

const categoryImages: Record<string, string> = {
  foundation: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=600&auto=format&fit=crop',
  lipstick: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop',
  blush: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?q=80&w=600&auto=format&fit=crop',
  'eye makeup': 'https://images.unsplash.com/photo-1583241475880-083f84372725?q=80&w=600&auto=format&fit=crop'
};

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addToCart = useStore(state => state.addToCart);

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [, setRelatedProducts] = useState<ProductBase[]>([]);
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
            className="mt-6 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl shadow-sm transition-colors font-medium"
          >
            Return to Shop
          </button>
        </div>
      </div>
    );
  }

  const fallbackImage = categoryImages[product.category.toLowerCase()] || categoryImages['foundation'];
  const images = product.images && product.images.length > 0 ? product.images : [fallbackImage];

  const handleTryOn = () => {
    navigate('/studio', { state: { product, activeShade, category: product.category } });
  };

  const handleAddToCart = () => {
    addToCart({
      product_id: Number(product.id),
      name: product.name,
      brand: product.brand,
      price: product.price,
      shade: activeShade?.name,
      hex: activeShade?.hex,
      quantity: 1,
      image: images[0]
    });
    toast.success('Added to cart');
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans">
      <Navbar />

      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 mb-8 overflow-x-auto whitespace-nowrap">
          <button onClick={() => navigate('/')} className="hover:text-slate-900 transition-colors">Home</button>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <button onClick={() => navigate('/shop')} className="hover:text-slate-900 transition-colors">Marketplace</button>
          <ChevronRight className="w-3 h-3 flex-shrink-0" />
          <span className="text-slate-900 truncate max-w-[200px] sm:max-w-none">{product.name}</span>
        </nav>

        {/* Product Layout */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-20">

          {/* IMAGE SIDE */}
          <div className="flex flex-col-reverse md:flex-row gap-4 lg:sticky lg:top-32 h-fit">
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-visible scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all shadow-sm ${
                    activeImage === idx ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            <div className="flex-1 bg-white rounded-3xl overflow-hidden relative group aspect-square md:aspect-auto md:min-h-[600px] border border-slate-200 shadow-sm">
              {activeShade && activeShade.id !== 'default' && (
                <div
                  className="absolute inset-0 opacity-10 mix-blend-multiply transition-colors duration-500 pointer-events-none z-10"
                  style={{ backgroundColor: activeShade.hex }}
                />
              )}
              <img
                src={images[activeImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {product.discount && (
                <div className="absolute top-6 left-6 z-20 bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-md">
                  {product.discount}% OFF
                </div>
              )}

              <div className="absolute top-6 right-6 z-20 flex gap-2">
                <button className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-rose-500 hover:bg-rose-50 transition-all">
                  <Heart className="w-5 h-5" />
                </button>
                <button className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all hidden md:flex">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* PRODUCT INFO SIDE (Matches user request Mobile stacking) */}
          <div className="flex flex-col">

            {/* Name */}
            <h1 className="text-3xl md:text-5xl font-light leading-tight mb-2 text-slate-900 tracking-tight">{product.name}</h1>

            {/* Brand */}
            <h2 className="text-sm text-indigo-600 font-bold tracking-widest uppercase mb-4">{product.brand}</h2>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-6">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold text-slate-900">{product.rating}</span>
              <span className="text-sm text-slate-500">({product.reviews} reviews)</span>
            </div>

            {/* Price */}
            <div className="flex items-end gap-3 mb-8 pb-8 border-b border-slate-200">
              <span className="text-4xl font-semibold text-slate-900 tracking-tight">{formatINR(product.price)}</span>
              {product.discount && (
                <span className="text-lg text-slate-400 line-through mb-1 ml-2">{formatINR(product.price / (1 - product.discount/100))}</span>
              )}
            </div>

            {/* Description (Moved up based on mobile stacking request) */}
            <div className="mb-8 text-slate-600 text-base leading-relaxed font-light">
               <p>{product.description || 'Premium quality cosmetic designed to enhance your natural beauty. Experience true color match and lasting wear.'}</p>
            </div>

            {/* AI Match */}
            {product.isAiCompatible && (
              <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 flex items-start gap-4 mb-8 shadow-sm">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 mt-1">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-indigo-900 mb-1">AI Recommendation Available</h3>
                  <p className="text-sm text-indigo-800/80 leading-relaxed font-light">
                    Use our Virtual Try-On Studio to receive a personalized shade recommendation based on your unique skin albedo and facial landmarks.
                  </p>
                </div>
              </div>
            )}

            {/* Shades */}
            {product.shades && (
              <div className="mb-8">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-slate-900">Select Shade</h3>
                    <p className="text-sm text-slate-500 mt-1">{activeShade?.name}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {product.shades.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setActiveShade(s)}
                      className={`w-14 h-14 rounded-full transition-all flex items-center justify-center ${
                        activeShade?.id === s.id
                          ? 'ring-2 ring-offset-4 ring-offset-[#FDFCFB] ring-indigo-500 scale-110 shadow-md'
                          : 'ring-1 ring-slate-200 hover:ring-slate-300 hover:scale-105'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full shadow-inner border border-slate-100" style={{ backgroundColor: s.hex }} />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Try On & Add to Cart */}
            <div className="flex flex-col md:flex-row gap-4 mb-12">
              <button
                onClick={handleTryOn}
                className="w-full md:flex-1 bg-white border-2 border-slate-900 text-slate-900 font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm min-h-[56px]"
              >
                <Camera className="w-5 h-5" />
                <span className="text-base">Live Try-On</span>
              </button>
              <button
                onClick={handleAddToCart}
                className="w-full md:flex-1 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg min-h-[56px]"
              >
                <ShoppingBag className="w-5 h-5" />
                <span className="text-base">Add to Cart</span>
              </button>
            </div>

            {/* Additional Info Tabs */}
            <div className="border-t border-slate-200 pt-8">
              <div className="flex border-b border-slate-200 mb-6 overflow-x-auto scrollbar-hide">
                {['highlights', 'ingredients', 'usage'].map(tab => (
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

              <div className="text-slate-600 text-sm leading-relaxed min-h-[120px] font-light">
                {activeTab === 'highlights' && (
                  <ul className="list-disc pl-5 space-y-2">
                    {product.highlights ? product.highlights.map((h, i) => <li key={i}>{h}</li>) : <li>Premium quality formulation</li>}
                  </ul>
                )}
                {activeTab === 'ingredients' && (
                  <p>{product.ingredients || 'Ingredients list currently unavailable. Please refer to product packaging.'}</p>
                )}
                {activeTab === 'usage' && (
                  <p>{product.usage || 'Apply as desired for a flawless finish. Reapply as needed.'}</p>
                )}
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
