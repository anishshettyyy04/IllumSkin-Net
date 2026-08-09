import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Heart, Eye, ShoppingBag, Sparkles, Star } from 'lucide-react';

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
      className="glass-card p-4 hover:border-white/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] group flex flex-col h-full bg-white/5 relative cursor-pointer"
      tabIndex={0}
      role="button"
      onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(); }}
      aria-label={`View details for ${brand} ${name} in shade ${shade}`}
    >
      {/* Discount Badge */}
      {discount && (
        <div className="absolute top-2 left-2 z-10 bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest">
          {discount}% OFF
        </div>
      )}

      {/* Wishlist Button */}
      <button 
        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/40 text-slate-300 hover:text-rose-400 hover:bg-black/60 transition-colors backdrop-blur-sm"
        aria-label="Add to wishlist"
        onClick={(e) => e.stopPropagation()}
      >
        <Heart className="w-4 h-4" />
      </button>

      <div className="aspect-square rounded-xl mb-4 bg-gradient-to-br from-black/60 to-black/20 flex items-center justify-center relative overflow-hidden flex-shrink-0">
        {/* Abstract product representation */}
        <div 
          className="w-24 h-24 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-transform duration-700 group-hover:scale-125 group-hover:rotate-12" 
          style={{ backgroundColor: hex }}
        />
        
        {/* Hover Overlay Actions */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-[2px]">
          <button 
            onClick={handleTryOn}
            className="w-full max-w-[160px] bg-white text-black font-semibold py-2.5 rounded-full flex items-center justify-center gap-2 hover:scale-105 transition-transform"
            aria-label={`Live try-on for ${name}`}
          >
            <Camera className="w-4 h-4" />
            <span className="text-sm">Live Try-On</span>
          </button>
          <button 
            className="w-full max-w-[160px] glass-button border border-white/40 text-white font-medium py-2.5 rounded-full flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
            aria-label={`Quick view for ${name}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">Quick View</span>
          </button>
        </div>
      </div>
      
      <div className="flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-1">
          <p className="text-[10px] text-indigo-300 font-semibold tracking-widest uppercase">{brand}</p>
          {isAiCompatible && (
            <div className="flex items-center gap-1 text-indigo-400" title="AI Compatible">
              <Sparkles className="w-3 h-3" />
            </div>
          )}
        </div>
        
        <h3 className="font-medium text-base leading-tight mb-1 text-slate-100 group-hover:text-white transition-colors line-clamp-2">{name}</h3>
        
        <div className="flex items-center gap-1 mb-3">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-xs text-slate-300 font-medium">{rating}</span>
          <span className="text-xs text-slate-500">({reviews})</span>
        </div>
        
        <div className="mt-auto flex items-end justify-between pt-4 border-t border-white/10">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium mb-0.5">Shade</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border border-white/20 shadow-inner" style={{ backgroundColor: hex }} />
              <span className="text-xs font-medium text-slate-200">{shade}</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            {discount && (
              <span className="text-xs text-slate-500 line-through mb-0.5">${(price / (1 - discount/100)).toFixed(2)}</span>
            )}
            <p className="font-semibold text-lg text-white leading-none">${price.toFixed(2)}</p>
          </div>
        </div>
      </div>
      
      {/* Mobile-friendly Add to Cart (always visible on very small screens, or we can just rely on the layout) */}
      <button 
        className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-colors md:hidden"
        aria-label={`Add ${name} to cart`}
        onClick={(e) => e.stopPropagation()}
      >
        <ShoppingBag className="w-4 h-4" />
        <span className="text-sm">Add to Cart</span>
      </button>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
