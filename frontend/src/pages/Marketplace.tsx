import React, { useState, useEffect, useMemo } from 'react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { Search, Filter as FilterIcon, SlidersHorizontal, X, ChevronDown, PackageOpen, LayoutGrid, Clock, AlertTriangle } from 'lucide-react';
import { ProductService } from '../services/products';
import type { ProductBase } from '../services/products';

const categoryCards = [
  { name: 'All', icon: LayoutGrid, color: 'bg-white/5 hover:bg-white/10' },
  { name: 'Foundation', icon: PackageOpen, color: 'bg-amber-900/20 hover:bg-amber-900/40 border-amber-500/20' },
  { name: 'Lipstick', icon: PackageOpen, color: 'bg-rose-900/20 hover:bg-rose-900/40 border-rose-500/20' },
  { name: 'Blush', icon: PackageOpen, color: 'bg-pink-900/20 hover:bg-pink-900/40 border-pink-500/20' },
  { name: 'Eye', icon: PackageOpen, color: 'bg-purple-900/20 hover:bg-purple-900/40 border-purple-500/20' },
];

export default function Marketplace() {
  const [products, setProducts] = useState<ProductBase[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('Recommended');
  const [showFilters, setShowFilters] = useState(false);
  
  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const categoryParam = activeCategory !== 'All' ? activeCategory : undefined;
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
  }, [activeCategory]);

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
    
    // Sort
    if (sortOption === 'Price: Low to High') {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOption === 'Price: High to Low') {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortOption === 'Top Rated') {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }
    
    return result;
  }, [products, searchQuery, sortOption]);

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <Navbar />

      <main className="pt-24 pb-20 px-6 md:px-12 max-w-7xl mx-auto">
        
        {/* Header Area */}
        <div className="mb-8 pt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-light mb-4">
              The <span className="font-medium text-rose-400">Marketplace</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">
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
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-full pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors shadow-inner"
              aria-label="Search Marketplace"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Cards */}
        <div className="flex gap-4 overflow-x-auto pb-6 mb-4 scrollbar-hide snap-x">
          {categoryCards.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`snap-start flex-shrink-0 flex items-center gap-3 px-5 py-3.5 rounded-2xl border transition-all duration-300 ${
                  isActive 
                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] scale-105' 
                    : `${cat.color} text-slate-300 border-white/5 hover:border-white/20`
                }`}
                aria-pressed={isActive}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isActive ? 'bg-black/10' : 'bg-black/20'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium leading-none mb-1">{cat.name}</p>
                </div>
              </button>
            )
          })}
        </div>

        {/* Advanced Filters Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-y border-white/10 mb-8 gap-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-md ${showFilters ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-300 hover:text-white hover:bg-white/5'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters {showFilters ? 'Active' : ''}
            </button>
            {(activeCategory !== 'All' || searchQuery) && (
              <button 
                onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium tracking-wide uppercase transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3 self-end sm:self-auto relative group">
            <span className="text-sm text-slate-400">Sort by:</span>
            <div className="flex items-center gap-1 cursor-pointer text-sm font-medium hover:text-indigo-300 transition-colors">
              {sortOption} <ChevronDown className="w-4 h-4" />
            </div>
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#111] border border-white/10 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
              {['Recommended', 'Top Rated', 'Price: Low to High', 'Price: High to Low'].map(opt => (
                <button 
                  key={opt}
                  onClick={() => setSortOption(opt)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors ${sortOption === opt ? 'text-indigo-400 font-medium' : 'text-slate-300'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 rounded-2xl flex flex-col items-center text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
            <h3 className="text-lg font-medium text-red-300 mb-2">We couldn't load recommendations</h3>
            <p className="text-red-200/70 text-sm mb-4 max-w-md">There was an issue connecting to the IllumSkin-Net server. Please try again.</p>
            <button onClick={fetchProducts} className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-6 py-2 rounded-full text-sm transition-colors">
              Retry
            </button>
          </div>
        )}

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="glass-card p-4 h-[350px] animate-pulse bg-white/5 rounded-3xl">
                <div className="aspect-square rounded-xl bg-white/10 mb-4" />
                <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
                <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
                <div className="mt-auto flex justify-between pt-4">
                  <div className="h-4 bg-white/10 rounded w-1/4" />
                  <div className="h-6 bg-white/10 rounded w-1/4" />
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
          <div className="py-24 text-center flex flex-col items-center glass-card rounded-3xl border-dashed border-2 border-white/10 max-w-2xl mx-auto">
            <FilterIcon className="w-12 h-12 text-slate-600 mb-6" />
            <h3 className="text-2xl font-light mb-2">No products found</h3>
            <p className="text-slate-400 mb-8 max-w-sm">We couldn't find any products matching your current search or filter criteria.</p>
            <button 
              onClick={() => { setActiveCategory('All'); setSearchQuery(''); }}
              className="glass-button px-6 py-3 rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        )}

      </main>
    </div>
  );
}
