import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const cart = useStore(state => state.cart);

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Shop', path: '/shop' },
    { name: 'Categories', path: '/categories' },
    { name: 'Virtual Studio', path: '/studio' }
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          isScrolled || !isHome || mobileMenuOpen
            ? 'bg-[#050505]/90 backdrop-blur-xl py-3 border-b border-white/5 shadow-2xl shadow-black/50' 
            : 'bg-transparent py-6'
        }`}
        aria-label="Main Navigation"
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <button 
              onClick={() => navigate('/')} 
              className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-lg group"
              aria-label="IllumSkin Home"
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-600 flex items-center justify-center group-hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-shadow">
                <span className="text-white font-bold text-lg leading-none mt-0.5">I</span>
              </div>
              <span className="text-xl font-light tracking-widest uppercase hidden sm:block">IllumSkin</span>
            </button>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <button 
                    key={link.name}
                    onClick={() => navigate(link.path)} 
                    className={`text-sm tracking-widest uppercase transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded relative py-2 ${
                      isActive ? 'text-white font-medium' : 'text-slate-400 hover:text-white'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.name}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-indigo-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              className="p-2.5 text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-full hidden sm:block"
              aria-label="Search"
              onClick={() => navigate('/shop')}
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              className="p-2.5 text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-full hidden sm:block"
              aria-label="User Profile"
              onClick={() => navigate('/profile')}
            >
              <User className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/cart')}
              className="p-2.5 text-slate-400 hover:text-white transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-full"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 border-2 border-[#050505] rounded-full"></span>
              )}
            </button>
            <button 
              className="md:hidden p-2.5 text-slate-400 hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={() => setMobileMenuOpen(false)}
      >
        <div 
          className={`absolute top-0 right-0 w-3/4 max-w-sm h-full bg-[#0a0a0a] border-l border-white/10 p-6 flex flex-col transition-transform duration-300 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="flex items-center gap-4 border-b border-white/10 pb-6 mb-6 mt-16 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-colors"
            onClick={() => {
              navigate('/profile');
              setMobileMenuOpen(false);
            }}
          >
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-white">My Profile</p>
              <p className="text-xs text-slate-400">Saved Looks & Orders</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button 
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`text-left text-lg py-2 ${location.pathname === link.path ? 'text-indigo-400 font-medium' : 'text-slate-300'}`}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
