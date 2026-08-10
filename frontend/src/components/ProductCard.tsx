import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Heart, Eye, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { formatINR } from '../utils/currency';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

interface ProductCardProps {
  id: number | string;
  brand: string;
  name: string;
  price: number;
  hex: string;
  shade: string;
  category: string;
  rating?: number;
  reviews?: number;
  discount?: number;
}

const categoryImages: Record<string, string> = {
  foundation: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?q=80&w=600&auto=format&fit=crop',
  lipstick: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=600&auto=format&fit=crop',
  blush: 'https://images.unsplash.com/photo-1515688594390-b649af70d282?q=80&w=600&auto=format&fit=crop',
  'eye makeup': 'https://images.unsplash.com/photo-1583241475880-083f84372725?q=80&w=600&auto=format&fit=crop'
};

const ProductCard = memo(({ id, brand, name, price, hex, shade, category, rating = 4.5, reviews = 128, discount }: ProductCardProps) => {
  const navigate = useNavigate();
  const addToCart = useStore(state => state.addToCart);

  const handleTryOn = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (category.toLowerCase() === 'foundation') {
      navigate('/studio');
    } else {
      navigate('/studio', { state: { product: { id, brand, name, price, hex, shade, category, rating, reviews, discount }, activeShade: { hex, name: shade }, category } });
    }
  };

  const isAiCompatible = ['foundation', 'lipstick', 'blush', 'eye makeup'].includes(category.toLowerCase());

  const handleCardClick = () => {
    navigate(`/product/${id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      product_id: Number(id) || 0,
      name,
      brand,
      price,
      shade,
      hex,
      quantity: 1,
      image: categoryImages[category.toLowerCase()] || categoryImages['foundation']
    });
    toast.success('Added to cart');
  };

  const fallbackImage = categoryImages[category.toLowerCase()] || categoryImages['foundation'];

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-3xl border border-slate-200 p-4 hover:border-indigo-200 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl group flex flex-col h-full relative cursor-pointer"
      tabIndex={0}
      role="button"
      onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(); }}
      aria-label={`View details for ${brand} ${name} in shade ${shade}`}
    >
      {/* Discount Badge */}
      {discount && (
        <div className="absolute top-6 left-6 z-10 bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
          {discount}% OFF
        </div>
      )}

      {/* Wishlist Button */}
      <button
        className="absolute top-6 right-6 z-10 p-2.5 min-w-[44px] min-h-[44px] rounded-full bg-white/80 backdrop-blur-sm text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shadow-sm flex items-center justify-center"
        aria-label="Add to wishlist"
        onClick={(e) => e.stopPropagation()}
      >
        <Heart className="w-5 h-5" />
      </button>

      {/* Image Area */}
      <div className="aspect-[4/5] rounded-2xl mb-5 bg-slate-50 relative overflow-hidden flex-shrink-0 w-full border border-slate-100">
        <img
          src={fallbackImage}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Desktop Hover Overlay Actions */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-[2px]">
          <button
            onClick={handleTryOn}
            className="w-full max-w-[180px] bg-white text-slate-900 font-semibold py-3 rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg min-h-[44px]"
            aria-label={`Live try-on for ${name}`}
          >
            <Camera className="w-4 h-4" />
            <span className="text-sm">Live Try-On</span>
          </button>
          <button
            className="w-full max-w-[180px] bg-slate-900/60 border border-white/40 text-white font-medium py-3 rounded-full flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors backdrop-blur-md min-h-[44px]"
            aria-label={`Quick view for ${name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Details Area */}
      <div className="flex flex-col flex-grow px-1">
        <div className="flex items-start justify-between mb-2">
          <p className="text-[11px] text-slate-500 font-bold tracking-widest uppercase">{brand}</p>
          {isAiCompatible && (
            <div className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px] font-semibold border border-indigo-100" title="AI Try-On Compatible">
              <Sparkles className="w-3 h-3" />
              <span>AI</span>
            </div>
          )}
        </div>

        <h3 className="font-medium text-base leading-snug mb-2 text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{name}</h3>

        <div className="flex items-center gap-1.5 mb-5">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span className="text-sm text-slate-700 font-medium">{rating}</span>
          <span className="text-xs text-slate-400 font-light">({reviews} reviews)</span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4 border-t border-slate-100 mb-4">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1.5">Selected Shade</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: hex }} />
              <span className="text-sm font-medium text-slate-700">{shade}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            {discount && discount > 0 ? (
              <span className="text-xs text-slate-400 line-through mb-0.5">{formatINR(price / (1 - discount/100))}</span>
            ) : null}
            <p className="font-semibold text-xl text-slate-900 leading-none">{formatINR(price)}</p>
          </div>
        </div>
      </div>

      {/* Mobile-friendly Add to Cart (Visible on both, but specifically sized for mobile tap targets) */}
      <div className="flex gap-2">
        <button
          className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-colors min-h-[48px] shadow-sm"
          aria-label={`Add ${name} to cart`}
          onClick={handleAddToCart}
        >
          <ShoppingBag className="w-4 h-4" />
          <span className="text-sm">Add to Cart</span>
        </button>
        <button
          className="md:hidden flex-none w-[48px] bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-100 font-medium py-3 rounded-xl flex items-center justify-center transition-colors min-h-[48px]"
          aria-label={`Live try-on for ${name}`}
          onClick={handleTryOn}
        >
          <Camera className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
