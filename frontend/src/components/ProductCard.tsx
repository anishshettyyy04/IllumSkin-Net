import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Heart, Eye, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { formatINR } from '../utils/currency';

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

const ProductCard = memo(({ id, brand, name, price, hex, shade, category, rating = 4.5, reviews = 128, discount }: ProductCardProps) => {
  const navigate = useNavigate();

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

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-2xl border border-slate-100 p-4 hover:border-indigo-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group flex flex-col h-full relative cursor-pointer"
      tabIndex={0}
      role="button"
      onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(); }}
      aria-label={`View details for ${brand} ${name} in shade ${shade}`}
    >
      {/* Discount Badge */}
      {discount && (
        <div className="absolute top-2 left-2 z-10 bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
          {discount}% OFF
        </div>
      )}

      {/* Wishlist Button */}
      <button 
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors shadow-sm"
        aria-label="Add to wishlist"
        onClick={(e) => e.stopPropagation()}
      >
        <Heart className="w-4 h-4" />
      </button>

      <div className="aspect-square rounded-xl mb-4 bg-slate-50 flex items-center justify-center relative overflow-hidden flex-shrink-0">
        {/* Abstract product representation */}
        <div 
          className="w-24 h-24 rounded-full shadow-lg transition-transform duration-700 group-hover:scale-110 group-hover:rotate-12 border-4 border-white" 
          style={{ backgroundColor: hex }}
        />
        
        {/* Hover Overlay Actions */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-[2px]">
          <button 
            onClick={handleTryOn}
            className="w-full max-w-[160px] bg-white text-slate-900 font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-transform shadow-lg"
            aria-label={`Live try-on for ${name}`}
          >
            <Camera className="w-4 h-4" />
            <span className="text-sm">Live Try-On</span>
          </button>
          <button 
            className="w-full max-w-[160px] bg-slate-900/60 border border-white/40 text-white font-medium py-2.5 rounded-full flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors backdrop-blur-md"
            aria-label={`Quick view for ${name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">Quick View</span>
          </button>
        </div>
      </div>
      
      <div className="flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-1.5">
          <p className="text-[10px] text-indigo-500 font-bold tracking-widest uppercase">{brand}</p>
          {isAiCompatible && (
            <div className="flex items-center gap-1 text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px] font-semibold" title="AI Compatible">
              <Sparkles className="w-3 h-3" />
            </div>
          )}
        </div>
        
        <h3 className="font-semibold text-sm leading-snug mb-1.5 text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{name}</h3>
        
        <div className="flex items-center gap-1.5 mb-4">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs text-slate-700 font-semibold">{rating}</span>
          <span className="text-xs text-slate-400">({reviews})</span>
        </div>
        
        <div className="mt-auto flex items-end justify-between pt-4 border-t border-slate-100">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mb-1">Shade</span>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-slate-200 shadow-sm" style={{ backgroundColor: hex }} />
              <span className="text-xs font-semibold text-slate-700">{shade}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            {discount && discount > 0 ? (
              <span className="text-[10px] text-slate-400 line-through mb-0.5">{formatINR(price / (1 - discount/100))}</span>
            ) : null}
            <p className="font-bold text-lg text-slate-900 leading-none">{formatINR(price)}</p>
          </div>
        </div>
      </div>
      
      {/* Mobile-friendly Add to Cart */}
      <button 
        className="mt-4 w-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors md:hidden"
        aria-label={`Add ${name} to cart`}
        onClick={(e) => { e.stopPropagation(); }}
      >
        <ShoppingBag className="w-4 h-4" />
        <span className="text-sm">Add to Cart</span>
      </button>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
