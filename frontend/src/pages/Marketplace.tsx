import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { Search, Filter as FilterIcon, SlidersHorizontal, X, ChevronDown, PackageOpen, LayoutGrid, AlertTriangle } from 'lucide-react';
import { ProductService } from '../services/products';
import type { ProductBase } from '../services/products';

const categoryCards = [
  { id: 'all', name: 'All', icon: LayoutGrid, color: 'bg-white hover:bg-slate-50 border-slate-200' },
  { id: 'foundation', name: 'Foundation', icon: PackageOpen, color: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-900' },
  { id: 'lipstick', name: 'Lipstick', icon: PackageOpen, color: 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-900' },
  { id: 'blush', name: 'Blush', icon: PackageOpen, color: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-900' },
  { id: 'eye-makeup', name: 'Eye Makeup', icon: PackageOpen, color: 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-900' },
];

const routeToCategory: Record<string, string> = {
  'foundation': 'Foundation',
  'lipstick': 'Lipstick',
  'blush': 'Blush',
  'eye-makeup': 'Eye',
  'all': 'All'
};

export default function Marketplace() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<ProductBase[]>([]);
  const activeCategoryId = categoryId && routeToCategory[categoryId] ? categoryId : 'all';
  const activeCategoryDbValue = routeToCategory[activeCategoryId];

  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Recommended');
  const [showFilters, setShowFilters] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const categoryParam = activeCategoryDbValue !== 'All' ? activeCategoryDbValue : undefined;
      const res = await ProductService.getProducts(categoryParam);
      if (res.success) {
        setProducts(res.data);
      } else {
        throw new Error(res.message || 'Failed to fetch products');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeCategoryDbValue]);

  const filteredProducts = useMemo(() => {
    let result = products;
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    
    if (sortOption === 'Price: Low to High') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOption === 'Price: High to Low') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortOption === 'Top Rated') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }
    
    return result;
  }, [products, searchQuery, sortOption]);

  const handleCategoryClick = (id: string) => {
    if (id === 'all') {
      navigate('/shop');
    } else {
      navigate(`/shop/${id}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans">
      <Navbar />

      <main className="pt-24 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        
        <div className="mb-8 pt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-light mb-4 text-slate-900 tracking-tight">
              The <span className="font-medium text-rose-500">Marketplace</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl">
              Explore premium cosmetics enhanced by IllumSkin-Net. Try on any product live using our edge AI.
            </p>
          </div>
          
          <div className="relative w-full md:w-72 flex-shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search brands, products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-full pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors shadow-sm text-slate-900 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-6 mb-4 scrollbar-hide snap-x">
          {categoryCards.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`snap-start flex-shrink-0 flex items-center gap-3 px-5 py-3.5 rounded-2xl border transition-all duration-300 ${
                  isActive 
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105' 
                    : `${cat.color} text-slate-600 hover:border-slate-300 shadow-sm`
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-black/5'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium leading-none mb-1">{cat.name}</p>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-y border-slate-200 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${showFilters ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters {showFilters ? 'Active' : ''}
            </button>
            {(activeCategoryId !== 'all' || searchQuery) && (
              <button 
                onClick={() => { handleCategoryClick('all'); setSearchQuery(''); }}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium tracking-wide uppercase transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto relative group z-10">
            <span className="text-sm text-slate-500">Sort by:</span>
            <div className="flex items-center gap-1 cursor-pointer text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors">
              {sortOption} <ChevronDown className="w-4 h-4" />
            </div>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all overflow-hidden">
              {['Recommended', 'Top Rated', 'Price: Low to High', 'Price: High to Low'].map(opt => (
                <button 
                  key={opt}
                  onClick={() => setSortOption(opt)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${sortOption === opt ? 'text-indigo-600 font-medium' : 'text-slate-600'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex flex-col items-center text-center shadow-sm">
            <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
            <h3 className="text-lg font-medium text-red-700 mb-2">We couldn't load recommendations</h3>
            <p className="text-red-600/70 text-sm mb-4 max-w-md">{error}</p>
            <button onClick={fetchProducts} className="bg-red-100 hover:bg-red-200 text-red-700 px-6 py-2 rounded-full text-sm font-medium transition-colors">
              Retry
            </button>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white border border-slate-100 shadow-sm p-4 h-[380px] animate-pulse rounded-3xl">
                <div className="aspect-square rounded-2xl bg-slate-100 mb-4" />
                <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                <div className="mt-auto flex justify-between pt-4">
                  <div className="h-4 bg-slate-200 rounded w-1/4" />
                  <div className="h-6 bg-slate-200 rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} {...(product as any)} />
            ))}
          </div>
        ) : !error && (
          <div className="py-24 text-center flex flex-col items-center bg-white rounded-3xl border-dashed border-2 border-slate-200 max-w-2xl mx-auto shadow-sm">
            <FilterIcon className="w-12 h-12 text-slate-400 mb-6" />
            <h3 className="text-lg font-medium text-slate-800 mb-2">No products available in this category yet.</h3>
            <p className="text-slate-500 mb-8 max-w-sm">We couldn't find any products matching your current search or filter criteria.</p>
            <button 
              onClick={() => { handleCategoryClick('all'); setSearchQuery(''); }}
              className="bg-white border border-slate-200 px-6 py-3 rounded-full text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              Clear All Filters
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
