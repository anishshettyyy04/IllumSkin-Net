import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, Activity, ShieldCheck, Zap, Palette, ShoppingBag, Quote, Mail, Star } from 'lucide-react';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';

const featuredProducts = [
  { id: 101, brand: 'Fenty Beauty', name: "Pro Filt'r Soft Matte Longwear Foundation", price: 40, hex: '#DBB39B', shade: '240', category: 'Foundation', rating: 4.8, reviews: 342 },
  { id: 102, brand: 'Charlotte Tilbury', name: 'Matte Revolution Lipstick', price: 35, hex: '#C25D60', shade: 'Pillow Talk', category: 'Lipstick', rating: 4.9, reviews: 892 },
  { id: 103, brand: 'Rare Beauty', name: 'Soft Pinch Liquid Blush', price: 23, hex: '#D67272', shade: 'Joy', category: 'Blush', rating: 4.7, reviews: 512 },
  { id: 104, brand: 'Urban Decay', name: 'Naked Heat Eyeshadow Palette', price: 54, hex: '#9E5B40', shade: 'Warm Brown', category: 'Eye Makeup', rating: 4.6, reviews: 215 },
];

const trendingLooks = [
  { name: 'Summer Glow', theme: 'Dewy & Radiant', image: 'https://images.unsplash.com/photo-1512496015851-a1dc8a47159c?q=80&w=800&auto=format&fit=crop', products: 4 },
  { name: 'Natural Everyday', theme: 'Minimalist Beauty', image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=800&auto=format&fit=crop', products: 3 },
  { name: 'Evening Glam', theme: 'Bold & Dramatic', image: 'https://images.unsplash.com/photo-1596704017254-9b121068fb31?q=80&w=800&auto=format&fit=crop', products: 5 },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-rose-500/30">
      <Navbar />

      {/* 1. Hero Section (Beauty First) */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
        {/* Cinematic Background Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-medium tracking-widest uppercase mb-8 animate-pulse">
              <Sparkles className="w-3 h-3" />
              <span>The Future of Beauty is Here</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-light tracking-tight mb-6 leading-[1.1]">
              Discover Your <br />
              <span className="font-normal bg-clip-text text-transparent bg-gradient-to-r from-white via-rose-100 to-indigo-200">True Match</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-10 font-light leading-relaxed">
              Experience personalized luxury. Our advanced AI analyzes your unique complexion to mathematically match you with perfect foundation shades and complementary cosmetics.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button 
                onClick={() => navigate('/shop')}
                className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 text-base hover:scale-105 transition-transform"
              >
                Shop The Collection
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/studio')}
                className="w-full sm:w-auto glass-button px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 text-base hover:bg-white/10 transition-colors border border-white/20"
              >
                <Activity className="w-4 h-4 text-indigo-400" />
                Live AI Try-On
              </button>
            </div>
          </div>
          
          {/* Hero Abstract Visual */}
          <div className="hidden lg:block relative h-[600px] w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-rose-500/10 rounded-full blur-3xl mix-blend-screen" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/10 rounded-full animate-[spin_20s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-white/5 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
            {/* Mock scanning UI element */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass-card p-6 rounded-2xl border border-white/20 shadow-2xl flex flex-col items-center gap-4 animate-bounce hover:animate-none">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-200 to-amber-500 shadow-[0_0_20px_rgba(251,191,36,0.4)]" />
              <div className="text-center">
                <p className="text-xs text-indigo-300 font-bold tracking-widest uppercase">Match Found</p>
                <p className="text-lg font-medium">Warm Sand</p>
                <p className="text-xs text-slate-400">98.4% Confidence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured Products */}
      <section className="py-24 px-6 relative z-20 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-light mb-2">Featured <span className="font-medium text-white">Essentials</span></h2>
              <p className="text-slate-400 font-light">Curated top picks powered by our community and AI.</p>
            </div>
            <button 
              onClick={() => navigate('/shop')}
              className="hidden md:flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory scrollbar-hide md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 md:snap-none">
            {featuredProducts.map(product => (
              <div key={product.id} className="w-[85vw] md:w-auto flex-shrink-0 snap-start">
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Trending Looks (Shop the Look) */}
      <section className="py-24 px-6 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-12 text-center">Trending <span className="font-medium text-rose-400">Looks</span></h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {trendingLooks.map((look) => (
              <div key={look.name} className="group cursor-pointer">
                <div className="relative h-[400px] rounded-2xl overflow-hidden mb-6">
                  <img 
                    src={look.image} 
                    alt={look.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 w-full">
                    <p className="text-xs text-rose-300 font-bold tracking-widest uppercase mb-1">{look.theme}</p>
                    <h3 className="text-2xl font-medium text-white">{look.name}</h3>
                  </div>
                  {/* Hover Action */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                    <button className="bg-white text-black px-6 py-3 rounded-full font-medium flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Shop Complete Look ({look.products} Items)
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Why IllumSkin-Net */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: ShieldCheck, title: 'Flawless Accuracy', desc: 'Our edge AI removes lighting bias to find your exact undertone.' },
              { icon: Zap, title: 'Real-Time Try On', desc: 'Instantly preview products with zero latency using on-device inference.' },
              { icon: Palette, title: 'Curated Ecosystem', desc: 'Every recommended product mathematically matches your unique profile.' },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-8 rounded-2xl border border-white/5 hover:border-white/10 transition-colors flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-medium mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. How It Works */}
      <section className="py-24 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light mb-16">How It <span className="font-medium text-indigo-400">Works</span></h2>
          <div className="grid md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-8 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            {[
              { step: '01', title: 'Launch Studio', desc: 'Enable your camera securely in the browser. No data leaves your device.' },
              { step: '02', title: 'AI Analysis', desc: 'IllumSkin-Net analyzes your albedo map and calculates exact Euclidean distances.' },
              { step: '03', title: 'Perfect Match', desc: 'Shop with absolute confidence using your personalized AI beauty profile.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center relative z-10">
                <div className="w-16 h-16 rounded-full bg-[#0a0a0a] border border-white/20 flex items-center justify-center text-xl font-medium text-white mb-6 shadow-xl">
                  {item.step}
                </div>
                <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed max-w-xs text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Shop by Category */}
      <section className="py-24 px-6 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-12 text-center">Shop by <span className="font-medium text-white">Category</span></h2>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: 'Foundation', desc: 'AI Matched', color: 'bg-amber-900/40' },
              { title: 'Lipstick', desc: 'AR Try-On', color: 'bg-rose-900/40' },
              { title: 'Blush', desc: 'Perfect Blends', color: 'bg-pink-900/40' },
              { title: 'Eye Makeup', desc: 'Dynamic Styles', color: 'bg-purple-900/40' },
            ].map((cat) => (
              <div 
                key={cat.title}
                onClick={() => navigate('/shop')}
                className={`group cursor-pointer relative aspect-square rounded-2xl overflow-hidden glass-card hover:border-white/30 transition-all duration-500 flex flex-col items-center justify-center text-center p-6 ${cat.color}`}
                tabIndex={0}
                aria-label={`Shop ${cat.title}`}
              >
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors duration-500" />
                <div className="relative z-10">
                  <h3 className="text-xl md:text-2xl font-medium text-white mb-2">{cat.title}</h3>
                  <p className="text-slate-300 text-xs tracking-widest uppercase opacity-80 group-hover:opacity-100">{cat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Testimonials */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light mb-16">Real <span className="font-medium text-rose-400">Results</span></h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah L.', text: "I've struggled for years to find a foundation that doesn't look orange. IllumSkin matched me instantly. It's flawless." },
              { name: 'Jessica M.', text: "The live try-on for lipsticks is unbelievable. It tracks my lips perfectly even when I talk." },
              { name: 'Elena R.', text: "Buying makeup online used to be a gamble. Now I trust the AI more than in-store lighting!" },
            ].map((quote, i) => (
              <div key={i} className="glass-card p-8 rounded-2xl border border-white/5 text-left relative">
                <Quote className="absolute top-6 right-6 w-8 h-8 text-white/5" />
                <div className="flex text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-amber-400" />)}
                </div>
                <p className="text-slate-300 mb-6 italic leading-relaxed">"{quote.text}"</p>
                <p className="font-medium text-white">{quote.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Newsletter */}
      <section className="py-24 px-6 bg-[#050505] border-y border-white/5">
        <div className="max-w-3xl mx-auto text-center glass-card p-12 rounded-3xl border border-indigo-500/20 bg-indigo-900/5">
          <Mail className="w-8 h-8 text-indigo-400 mx-auto mb-6" />
          <h2 className="text-3xl font-light mb-4">Join the <span className="font-medium text-white">Beauty Revolution</span></h2>
          <p className="text-slate-400 mb-8 max-w-lg mx-auto">Subscribe for early access to new AI models, exclusive product drops, and beauty insights.</p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-grow bg-white/5 border border-white/10 rounded-full px-6 py-3 text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
              required
            />
            <button className="bg-white text-black font-medium px-8 py-3 rounded-full hover:bg-slate-200 transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="py-12 px-6 bg-black text-center md:text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 justify-center md:justify-start mb-4">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-rose-600 flex items-center justify-center">
                <span className="text-white font-bold text-xs">I</span>
              </div>
              <span className="text-lg font-light tracking-widest uppercase">IllumSkin</span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm mx-auto md:mx-0">
              The premier AI Beauty Commerce Platform. Powered by on-device computational color constancy.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Shop</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><button onClick={() => navigate('/shop')} className="hover:text-white transition-colors">Foundation</button></li>
              <li><button onClick={() => navigate('/shop')} className="hover:text-white transition-colors">Lipstick</button></li>
              <li><button onClick={() => navigate('/shop')} className="hover:text-white transition-colors">Blush</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Technology</h4>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><button className="hover:text-white transition-colors">Virtual Studio</button></li>
              <li><button className="hover:text-white transition-colors">AI Research</button></li>
              <li><button className="hover:text-white transition-colors">IEEE Documentation</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-slate-600 text-xs flex flex-col md:flex-row items-center justify-between">
          <p>© 2026 IllumSkin-Net Platform. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <button className="hover:text-white transition-colors">Privacy Policy</button>
            <button className="hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
