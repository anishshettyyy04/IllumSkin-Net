import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { Search, Filter as FilterIcon, SlidersHorizontal, X, PackageOpen, LayoutGrid, AlertTriangle } from 'lucide-react';
import { ProductService } from '../services/products';
import type { ProductBase } from '../services/products';

const categoryCards = [
  { id: 'all', name: 'All', icon: LayoutGrid, color: 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' },
  { id: 'foundation', name: 'Foundation', icon: PackageOpen, color: 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900' },
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
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

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

  const FilterSidebar = () => (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="font-semibold text-slate-900 mb-4 tracking-wide">CATEGORIES</h3>
        <ul className="space-y-3">
          {categoryCards.map(cat => (
            <li key={cat.id}>
              <button
                onClick={() => handleCategoryClick(cat.id)}
                className={`text-sm w-full text-left transition-colors ${activeCategoryId === cat.id ? 'font-semibold text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-semibold text-slate-900 mb-4 tracking-wide">SORT BY</h3>
        <ul className="space-y-3">
          {['Recommended', 'Top Rated', 'Price: Low to High', 'Price: High to Low'].map(opt => (
            <li key={opt}>
              <button
                onClick={() => setSortOption(opt)}
                className={`text-sm flex items-center gap-2 w-full text-left transition-colors ${sortOption === opt ? 'font-semibold text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}
              >
                <div className={`w-3 h-3 rounded-full border ${sortOption === opt ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}></div>
                {opt}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans">
      <Navbar />

      <main className="pt-28 pb-20 px-6 max-w-[1400px] mx-auto w-full">

        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-light mb-4 text-slate-900 tracking-tight">
              The <span className="font-medium text-rose-500">Marketplace</span>
            </h1>
            <p className="text-slate-500 text-lg max-w-2xl font-light">
              Explore premium cosmetics enhanced by AI. Try on any product live using our virtual studio.
            </p>
          </div>

          <div className="relative w-full md:w-80 flex-shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search brands, products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors shadow-sm text-slate-900 placeholder:text-slate-400"
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

        {/* Mobile controls */}
        <div className="flex md:hidden items-center justify-between py-4 border-y border-slate-200 mb-8">
          <button
            onClick={() => setShowFiltersMobile(true)}
            className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filter & Sort
          </button>
          <span className="text-sm text-slate-500 font-medium">{filteredProducts.length} Results</span>
        </div>

        {/* Mobile Filters Drawer */}
        <div
          className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden transition-opacity duration-300 ${
            showFiltersMobile ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setShowFiltersMobile(false)}
        >
          <div
            className={`absolute bottom-0 left-0 w-full bg-white rounded-t-3xl p-6 transition-transform duration-300 shadow-2xl ${
              showFiltersMobile ? 'translate-y-0' : 'translate-y-full'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-semibold text-slate-900">Filter & Sort</h2>
              <button onClick={() => setShowFiltersMobile(false)} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:text-slate-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-8">
              <FilterSidebar />
            </div>

            <button
              onClick={() => setShowFiltersMobile(false)}
              className="w-full bg-slate-900 text-white py-4 rounded-xl font-medium shadow-md"
            >
              Show {filteredProducts.length} Results
            </button>
          </div>
        </div>

        {/* Desktop Layout: Sidebar + Grid */}
        <div className="flex flex-col md:flex-row gap-10">

          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="sticky top-32">
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200">
                <h2 className="font-semibold text-slate-900 text-lg">Filters</h2>
                {(activeCategoryId !== 'all' || searchQuery) && (
                  <button
                    onClick={() => { handleCategoryClick('all'); setSearchQuery(''); }}
                    className="text-xs text-rose-500 hover:text-rose-600 font-medium tracking-wide uppercase transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <FilterSidebar />
            </div>
          </aside>

          {/* Product Grid Area */}
          <div className="flex-1">
            <div className="hidden md:flex justify-between items-center mb-6 text-sm text-slate-500 font-medium">
              <span>Showing {filteredProducts.length} Results</span>
            </div>

            {error && (
              <div className="mb-8 p-8 bg-red-50 border border-red-200 rounded-3xl flex flex-col items-center text-center shadow-sm">
                <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                <h3 className="text-xl font-medium text-red-700 mb-2">We couldn't load products</h3>
                <p className="text-red-600/70 text-base mb-6 max-w-md">{error}</p>
                <button onClick={fetchProducts} className="bg-white border border-red-200 hover:bg-red-50 text-red-700 px-8 py-3 rounded-xl text-sm font-medium transition-colors shadow-sm">
                  Retry Connection
                </button>
              </div>
            )}

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <div key={i} className="bg-white border border-slate-100 shadow-sm p-4 h-[400px] animate-pulse rounded-3xl">
                    <div className="aspect-[4/5] rounded-2xl bg-slate-100 mb-6" />
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-3" />
                    <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                    <div className="mt-auto flex justify-between pt-4">
                      <div className="h-5 bg-slate-200 rounded w-1/4" />
                      <div className="h-8 bg-slate-200 rounded-full w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} {...(product as any)} />
                ))}
              </div>
            ) : !error && (
              <div className="py-24 text-center flex flex-col items-center bg-white rounded-3xl border-dashed border-2 border-slate-200 max-w-2xl mx-auto shadow-sm">
                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-6 border border-slate-100">
                  <FilterIcon className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-xl font-medium text-slate-800 mb-3">No products found</h3>
                <p className="text-slate-500 mb-8 max-w-sm font-light">We couldn't find any products matching your current search or filter criteria in this category.</p>
                <button
                  onClick={() => { handleCategoryClick('all'); setSearchQuery(''); }}
                  className="bg-slate-900 text-white px-8 py-4 rounded-xl text-sm font-medium transition-colors shadow-md hover:bg-slate-800 hover:-translate-y-0.5"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
