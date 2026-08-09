import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ChevronRight, Activity, Palette, Camera, Database,
  Sun, ScanFace, Droplet, Search, Eye, ArrowRight, Server, CheckCircle2,
  AlertCircle, ArrowDown, FlaskConical, LayoutGrid, Cpu, Layers, ShoppingBag
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-rose-500/30 font-sans">
      <Navbar />

      {/* SECTION 1 — HERO */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-[#050505] to-[#050505] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-medium tracking-widest uppercase mb-8">
              <Sparkles className="w-3 h-3" />
              <span>IllumSkin-Net</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6 leading-[1.1]">
              AI-Powered Skin Analysis, Perceptual Shade Matching & <span className="font-normal bg-clip-text text-transparent bg-gradient-to-r from-white via-rose-100 to-indigo-200">Virtual Try-On</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-10 font-light leading-relaxed">
              An illumination-aware foundation shade recommendation system that combines facial analysis, ONNX-based skin estimation, perceptual color science, and real-time virtual try-on.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate('/studio')}
                className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 text-base hover:scale-105 transition-transform"
              >
                Launch Virtual Studio
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="w-full sm:w-auto glass-button px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 text-base hover:bg-white/10 transition-colors border border-white/20"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                Explore Shop
              </button>
            </div>
          </div>

          <div className="hidden lg:block relative h-[600px] w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-rose-500/10 rounded-full blur-3xl mix-blend-screen" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/10 rounded-full animate-[spin_30s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-indigo-500/20 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 glass-card p-8 rounded-3xl border border-white/20 shadow-2xl flex flex-col items-center gap-6">
              <ScanFace className="w-20 h-20 text-indigo-400 stroke-1" />
              <div className="text-center">
                <p className="text-xs text-indigo-300 font-bold tracking-widest uppercase mb-1">Analysis Complete</p>
                <p className="text-xl font-medium text-white mb-1">True Albedo Extracted</p>
                <p className="text-sm text-slate-400">CIEDE2000 Mapping Active</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHAT IS ILLUMSKIN-NET? */}
      <section className="py-24 px-6 bg-black relative border-t border-white/5">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium tracking-widest uppercase mb-8">
            <FlaskConical className="w-3 h-3" />
            <span>Research Project</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-light mb-8">What is <span className="font-medium text-indigo-400">IllumSkin-Net?</span></h2>
          <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed mb-12">
            IllumSkin-Net is an AI-assisted cosmetic shade recommendation and virtual try-on system designed to reduce the limitations of manual foundation shade selection.
          </p>
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 text-left">
            <p className="text-slate-400 leading-relaxed mb-6">
              The system combines multiple computational techniques to analyze the face and recommend products:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                'Facial landmark detection',
                'Skin-region analysis',
                'ONNX-based inference',
                'Illumination-aware color processing',
                'CIELAB color representation',
                'CIEDE2000 perceptual color difference',
                'Foundation shade matching',
                'Virtual try-on visualization'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span className="text-slate-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — HOW IT WORKS */}
      <section id="pipeline" className="py-24 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center">How It <span className="font-medium text-rose-400">Works</span></h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            <div className="hidden lg:block absolute top-12 left-12 right-12 h-[2px] bg-gradient-to-r from-indigo-500/20 via-rose-500/20 to-indigo-500/20" />

            {[
              { num: '01', title: 'CAPTURE', desc: 'Use your device camera to capture facial information.', icon: Camera },
              { num: '02', title: 'ANALYZE', desc: 'Facial landmarks and skin-region information are processed to estimate skin characteristics.', icon: ScanFace },
              { num: '03', title: 'MATCH', desc: 'Perceptual color analysis compares the estimated skin color with available foundation shades.', icon: Search },
              { num: '04', title: 'TRY ON', desc: 'Recommended products can be visualized through the virtual try-on experience.', icon: Eye },
            ].map((step) => (
              <div key={step.num} className="relative z-10 flex flex-col items-start md:items-center text-left md:text-center w-full group glass-card p-6 rounded-3xl border-white/5 hover:border-indigo-500/30 transition-colors">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center shrink-0 mb-6 shadow-xl relative overflow-hidden group-hover:border-indigo-400 transition-colors">
                  <step.icon className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <div className="inline-flex items-center justify-center px-3 py-1 bg-white/5 rounded-full text-xs font-mono text-slate-400 mb-4 border border-white/5">{step.num}</div>
                <h3 className="text-lg md:text-xl font-medium text-white mb-3 tracking-wide">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — WHY ILLUMSKIN-NET? */}
      <section className="py-24 px-6 bg-black border-y border-white/5">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center">From Manual Shade Selection to <span className="font-medium text-indigo-400">AI-Assisted Matching</span></h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card p-8 rounded-3xl border-white/5">
              <h3 className="text-xl font-medium text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <Eye className="w-4 h-4 text-slate-400" />
                </div>
                Traditional Approach
              </h3>
              <ul className="space-y-4">
                {[
                  'Manual shade selection',
                  'Typically strong dependence on store lighting',
                  'Simple visual comparison',
                  'Limited personalization',
                  'No integrated virtual preview'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="glass-card p-8 rounded-3xl border-indigo-500/20 bg-indigo-950/10">
              <h3 className="text-xl font-medium text-white mb-6 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                IllumSkin-Net
              </h3>
              <ul className="space-y-4">
                {[
                  'AI-assisted skin analysis',
                  'Illumination-aware processing',
                  'Perceptual color comparison',
                  'Personalized shade recommendations',
                  'Integrated virtual try-on'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — TECHNICAL PIPELINE */}
      <section className="py-24 px-6 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center">From Camera Input to <span className="font-medium text-rose-400">Shade Recommendation</span></h2>

          <div className="glass-card p-8 md:p-12 rounded-3xl border border-white/5 overflow-x-auto hide-scrollbar">
            {/* Desktop Pipeline (Horizontal) */}
            <div className="hidden md:flex flex-row items-center justify-between min-w-[800px]">
              {[
                { name: 'Camera Input', icon: Camera },
                { name: 'MediaPipe Face Landmarks', icon: ScanFace },
                { name: 'Skin Region / Quality Analysis', icon: Activity },
                { name: 'ONNX Skin Analysis', icon: Cpu },
                { name: 'True Albedo', icon: Droplet },
                { name: 'RGB → Linear RGB', icon: Palette },
                { name: 'CIELAB', icon: Layers },
                { name: 'CIEDE2000', icon: Database },
                { name: 'Shade Matching', icon: Search },
                { name: 'Virtual Try-On', icon: Eye }
              ].map((step, i, arr) => (
                <div key={i} className="flex flex-row items-center">
                  <div className="flex flex-col items-center group w-24 text-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-3 group-hover:border-rose-400 transition-colors shadow-lg shadow-black/50">
                      <step.icon className="w-5 h-5 text-slate-400 group-hover:text-rose-400 transition-colors" />
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 group-hover:text-white transition-colors">{step.name}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="w-8 mx-2 border-t border-dashed border-white/20 relative">
                      <ArrowRight className="w-3 h-3 absolute -right-1 -top-1.5 text-white/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile Pipeline (Vertical) */}
            <div className="flex md:hidden flex-col items-center">
              {[
                { name: 'Camera Input', icon: Camera },
                { name: 'MediaPipe Face Landmarks', icon: ScanFace },
                { name: 'Skin Region / Quality Analysis', icon: Activity },
                { name: 'ONNX Skin Analysis', icon: Cpu },
                { name: 'True Albedo', icon: Droplet },
                { name: 'RGB → Linear RGB', icon: Palette },
                { name: 'CIELAB', icon: Layers },
                { name: 'CIEDE2000', icon: Database },
                { name: 'Shade Matching', icon: Search },
                { name: 'Virtual Try-On', icon: Eye }
              ].map((step, i, arr) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center gap-4 w-64">
                     <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                       <step.icon className="w-5 h-5 text-slate-400" />
                     </div>
                     <span className="text-xs uppercase tracking-wider text-slate-300">{step.name}</span>
                  </div>
                  {i < arr.length - 1 && (
                    <div className="h-6 border-l border-dashed border-white/20 my-1 relative">
                      <ArrowDown className="w-3 h-3 absolute -bottom-1 -left-1.5 text-white/30" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — TECHNICAL ARCHITECTURE */}
      <section className="py-24 px-6 bg-black border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center">Technical <span className="font-medium text-white">Architecture</span></h2>

          <div className="flex flex-col items-center w-full relative">

            {/* User */}
            <div className="glass-card px-8 py-4 border-slate-500/30 rounded-2xl font-medium flex items-center gap-3 w-64 justify-center">
              <Eye className="w-5 h-5 text-slate-400" />
              USER
            </div>

            <div className="h-8 border-l border-dashed border-white/20 my-1 relative">
              <ArrowDown className="w-4 h-4 absolute -bottom-2 -left-2 text-white/30" />
            </div>

            {/* Vercel Frontend */}
            <div className="glass-card px-8 py-4 border-indigo-500/30 bg-indigo-500/5 rounded-2xl font-medium flex items-center gap-3 w-64 justify-center text-indigo-300">
              <LayoutGrid className="w-5 h-5" />
              Vercel Frontend
            </div>

            <div className="h-8 border-l border-dashed border-white/20 my-1 relative">
              <ArrowDown className="w-4 h-4 absolute -bottom-2 -left-2 text-white/30" />
            </div>

            {/* Browser AI Block */}
            <div className="glass-card p-6 rounded-3xl border-rose-500/20 bg-rose-500/5 w-full max-w-2xl relative">
              <div className="absolute top-0 right-0 px-3 py-1 bg-rose-500/20 text-rose-300 text-xs uppercase tracking-wider rounded-bl-xl rounded-tr-3xl">Browser Side</div>
              <h3 className="text-center font-medium text-rose-300 mb-6 text-lg">Camera / Browser AI</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-black/50 border border-white/10 p-4 rounded-xl text-center">
                  <p className="text-slate-300 text-sm">MediaPipe</p>
                </div>
                <div className="bg-black/50 border border-white/10 p-4 rounded-xl text-center">
                  <p className="text-slate-300 text-sm">ONNX Runtime Web</p>
                </div>
                <div className="bg-black/50 border border-white/10 p-4 rounded-xl text-center">
                  <p className="text-slate-300 text-sm">Colorimetry</p>
                </div>
              </div>
            </div>

            <div className="h-8 border-l border-dashed border-white/20 my-1 relative">
              <ArrowDown className="w-4 h-4 absolute -bottom-2 -left-2 text-white/30" />
            </div>

            {/* Shade Recommendation */}
            <div className="glass-card px-8 py-4 border-amber-500/30 bg-amber-500/5 rounded-2xl font-medium flex items-center gap-3 w-64 justify-center text-amber-300">
              <Search className="w-5 h-5" />
              Shade Recommendation
            </div>

            <div className="h-8 border-l border-dashed border-white/20 my-1 relative">
              <ArrowDown className="w-4 h-4 absolute -bottom-2 -left-2 text-white/30" />
            </div>

            {/* Render / Virtual Try-On */}
            <div className="glass-card px-8 py-4 border-purple-500/30 bg-purple-500/5 rounded-2xl font-medium flex items-center gap-3 w-64 justify-center text-purple-300 text-center leading-tight">
              <Activity className="w-5 h-5 shrink-0" />
              Render / Virtual Try-On
            </div>

            <div className="h-8 border-l border-dashed border-white/20 my-1 relative">
              <ArrowDown className="w-4 h-4 absolute -bottom-2 -left-2 text-white/30" />
            </div>

            {/* Backend Block */}
            <div className="glass-card p-6 rounded-3xl border-emerald-500/20 bg-emerald-500/5 w-full max-w-2xl relative flex flex-col items-center">
              <div className="absolute top-0 left-0 px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs uppercase tracking-wider rounded-br-xl rounded-tl-3xl">Server Side</div>
              <div className="w-full flex flex-col items-center gap-4 mt-6">
                <div className="bg-black/50 border border-white/10 px-8 py-4 rounded-2xl text-center w-64 flex items-center justify-center gap-3">
                  <Server className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-300 text-sm font-medium">Render FastAPI</span>
                </div>
                <div className="h-6 border-l border-dashed border-white/20 relative">
                  <ArrowDown className="w-4 h-4 absolute -bottom-2 -left-2 text-white/30" />
                </div>
                <div className="bg-black/50 border border-white/10 px-8 py-4 rounded-2xl text-center w-64 flex items-center justify-center gap-3">
                  <Database className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-300 text-sm font-medium">Supabase PostgreSQL</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-xs text-slate-500 max-w-xl">
              Note: AI processing and computer vision take place entirely within the browser client to minimize latency and ensure privacy. The backend is dedicated to data persistence, authentication, and commerce logic.
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 7 — RESEARCH NOVELTY */}
      <section className="py-24 px-6 bg-[#050505]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center">What is the <span className="font-medium text-indigo-400">Research Contribution?</span></h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="glass-card p-8 rounded-3xl border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-6">
                <Sun className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="text-xl font-medium mb-3">1. Illumination-Aware Skin Analysis</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Separating illumination effects from observed facial color to obtain a more useful representation for shade matching.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center mb-6">
                <Droplet className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="text-xl font-medium mb-3">2. Perceptual Color Matching</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Using CIELAB and CIEDE2000 to compare skin and cosmetic shades using perceptual color difference rather than simple RGB distance.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                <Search className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-xl font-medium mb-3">3. AI-Assisted Shade Recommendation</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Combining estimated skin characteristics with a structured cosmetic shade database.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-6">
                <Eye className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-medium mb-3">4. Integrated Virtual Try-On</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Connecting shade recommendation with real-time face-aware visualization.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border-white/5 hover:border-white/10 transition-colors md:col-span-2">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mb-6">
                <Cpu className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="text-xl font-medium mb-3">5. Browser-Based AI Pipeline</h3>
              <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                Using MediaPipe and ONNX Runtime Web to perform key analysis directly in the browser.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — VIRTUAL TRY-ON SHOWCASE */}
      <section className="py-24 px-6 bg-black border-y border-white/5 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="order-2 lg:order-1 relative">
             <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
             <div className="relative z-10 h-[400px] w-full rounded-3xl border border-white/10 bg-[#111] flex items-center justify-center overflow-hidden">
               <Camera className="w-16 h-16 text-white/10" />
               <div className="absolute bottom-4 left-4 right-4 p-4 glass-card rounded-2xl flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-500/30">
                   <Activity className="w-5 h-5 text-rose-400" />
                 </div>
                 <div>
                   <p className="text-sm font-medium text-white">Live Rendering Active</p>
                   <p className="text-xs text-slate-400">WebGL Compositing</p>
                 </div>
               </div>
             </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-xs font-medium tracking-widest uppercase mb-6">
              <Camera className="w-3 h-3" />
              Virtual Try-On Showcase
            </div>
            <h2 className="text-3xl md:text-5xl font-light mb-6">Experience <span className="font-medium text-white">Virtual Studio</span></h2>
            <p className="text-slate-400 font-light leading-relaxed mb-6">
              Utilize your device camera to preview cosmetic products directly on your face. Our dynamic rendering engine handles foundations, lipsticks, and blushes in real-time.
            </p>
            <p className="text-indigo-300 text-sm font-medium leading-relaxed mb-8 bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/20 inline-block">
              After analysis, recommended cosmetic shades can be previewed using the Virtual Studio.
            </p>
            <div>
              <button
                onClick={() => navigate('/studio')}
                className="bg-white text-black px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors w-full sm:w-auto"
              >
                Try It Yourself
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 9 — USER MANUAL */}
      <section className="py-24 px-6 bg-[#050505]">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center">User <span className="font-medium text-white">Manual</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Create an account', desc: 'Register using your email, username, and password.' },
              { num: '02', title: 'Open Virtual Studio', desc: 'Allow camera access when prompted.' },
              { num: '03', title: 'Position your face', desc: 'Follow the on-screen face guide.' },
              { num: '04', title: 'Analyze', desc: 'Allow the system to estimate skin characteristics.' },
              { num: '05', title: 'View recommendations', desc: 'Explore foundation shades matched to the estimated skin characteristics.' },
              { num: '06', title: 'Try virtually', desc: 'Preview selected products using the virtual try-on experience.' },
              { num: '07', title: 'Shop', desc: 'Add products to your cart and use Cash on Delivery at checkout.' }
            ].map((step, i) => (
              <div key={i} className="glass-card p-6 rounded-2xl border border-white/5">
                <span className="text-indigo-400 font-mono text-xl mb-3 block">{step.num}</span>
                <h3 className="text-white font-medium mb-2">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 10 — RESPONSIBLE AI & LIMITATIONS */}
      <section className="py-24 px-6 bg-black border-y border-white/5 text-center">
         <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-light text-slate-200 mb-8 flex items-center justify-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              Limitations & Responsible AI
            </h3>
            <div className="text-sm text-slate-400 font-light leading-relaxed space-y-4 max-w-2xl mx-auto text-left px-4 bg-[#0a0a0a] p-8 rounded-3xl border border-white/5">
              <ul className="space-y-4 list-disc pl-4">
                <li>Camera quality can influence results.</li>
                <li>Lighting conditions can affect skin-color estimation.</li>
                <li>Facial occlusion such as glasses, hair, or other objects may affect analysis.</li>
                <li>Different devices and displays may produce different visual appearance.</li>
                <li>Recommendations are intended as assistive cosmetic guidance.</li>
                <li>Virtual try-on is an approximation of product appearance.</li>
                <li>Results should not be interpreted as medical or dermatological advice.</li>
              </ul>
            </div>
         </div>
      </section>

      {/* SECTION 11 — RESEARCH / PROJECT INFORMATION */}
      <section className="py-24 px-6 bg-[#050505]">
         <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 md:p-12 rounded-3xl border-indigo-500/30 bg-indigo-950/20 shadow-[0_0_40px_rgba(79,70,229,0.1)] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                 <FlaskConical className="w-48 h-48 text-indigo-400" />
               </div>
               <div className="relative z-10">
                 <h2 className="text-2xl md:text-3xl font-light text-white mb-8">IllumSkin-Net Research Project</h2>

                 <div className="grid sm:grid-cols-3 gap-6 mb-10">
                   <div>
                     <p className="text-indigo-300 text-xs uppercase tracking-wider mb-2">Domain</p>
                     <p className="text-slate-300 text-sm font-medium leading-relaxed">AI + Computer Vision + Color Science + Virtual Try-On</p>
                   </div>
                   <div>
                     <p className="text-indigo-300 text-xs uppercase tracking-wider mb-2">Core Methods</p>
                     <p className="text-slate-300 text-sm font-medium leading-relaxed">MediaPipe, ONNX Runtime Web, CIELAB, CIEDE2000, Facial Landmark Analysis</p>
                   </div>
                   <div>
                     <p className="text-indigo-300 text-xs uppercase tracking-wider mb-2">System</p>
                     <p className="text-slate-300 text-sm font-medium leading-relaxed">Vercel, Render, Supabase PostgreSQL</p>
                   </div>
                 </div>

                 <div className="flex flex-col sm:flex-row gap-4">
                   <button
                     onClick={() => navigate('/studio')}
                     className="bg-indigo-500 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors text-sm"
                   >
                     Explore IllumSkin-Net
                   </button>
                   <button
                     onClick={() => navigate('/shop')}
                     className="glass-button px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border border-white/20 text-sm"
                   >
                     Explore Products
                   </button>
                 </div>
               </div>
            </div>
         </div>
      </section>

      {/* SECTION 12 — EXPERIMENTAL RESULTS */}
      <section className="py-16 px-6 bg-black border-y border-white/5 text-center">
         <div className="max-w-3xl mx-auto glass-card p-6 rounded-2xl border-dashed border-white/20">
            <h3 className="text-lg font-medium text-slate-300 mb-3 flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 text-slate-500" />
              Experimental evaluation
            </h3>
            <p className="text-sm text-slate-500 font-light leading-relaxed max-w-xl mx-auto">
              Quantitative evaluation metrics will be reported after controlled testing across representative lighting conditions, devices, and skin-tone samples.
            </p>
         </div>
      </section>

      {/* SECTION 13 — FINAL CTA */}
      <section className="py-32 px-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#050505] to-[#050505] text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6">Experience <span className="font-medium text-white">AI-Assisted Shade Matching</span></h2>
        <p className="text-slate-400 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto">
          Analyze, discover, and preview cosmetic shades through the IllumSkin-Net Virtual Studio.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto max-w-md mx-auto">
          <button
            onClick={() => navigate('/studio')}
            className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-medium flex items-center justify-center transition-transform hover:scale-105"
          >
            Launch Virtual Studio
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="w-full sm:w-auto glass-button px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border border-white/20"
          >
            Explore Shop
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 bg-black text-center md:text-left border-t border-white/5">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 sm:col-span-2 flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-rose-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">I</span>
              </div>
              <span className="text-xl font-light tracking-widest uppercase">IllumSkin-Net</span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm text-center md:text-left">
              An AI-assisted cosmetic shade recommendation and virtual try-on research project.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-white font-medium mb-4">Application</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><button onClick={() => navigate('/shop')} className="hover:text-white transition-colors">Shop</button></li>
              <li><button onClick={() => navigate('/categories')} className="hover:text-white transition-colors">Categories</button></li>
              <li><button onClick={() => navigate('/studio')} className="hover:text-white transition-colors">Virtual Studio</button></li>
            </ul>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-white font-medium mb-4">Project</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><button onClick={() => navigate('/login')} className="hover:text-white transition-colors">Login / Profile</button></li>
              <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors">Research</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-slate-600 text-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 IllumSkin-Net. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
