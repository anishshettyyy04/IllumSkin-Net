import { useNavigate } from 'react-router-dom';
import { Sparkles, ChevronRight, Activity, ShieldCheck, Palette, ShoppingBag, Camera, Database, Fingerprint, Eye, Droplet, Sun, ScanFace } from 'lucide-react';
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
              AI-Powered Personalized Beauty & <span className="font-normal bg-clip-text text-transparent bg-gradient-to-r from-white via-rose-100 to-indigo-200">Virtual Try-On</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-400 max-w-xl mb-10 font-light leading-relaxed">
              Analyze your skin characteristics, understand your undertone, discover personalized cosmetic recommendations, and visualize products through AI-powered virtual try-on.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button 
                onClick={() => navigate('/shop')}
                className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 text-base hover:scale-105 transition-transform"
              >
                Explore IllumSkin
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/studio')}
                className="w-full sm:w-auto glass-button px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 text-base hover:bg-white/10 transition-colors border border-white/20"
              >
                <Activity className="w-4 h-4 text-indigo-400" />
                Try Virtual Studio
              </button>
              <button 
                onClick={() => {
                  document.getElementById('pipeline')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 text-base text-slate-300 hover:text-white transition-colors hidden sm:flex"
              >
                How It Works
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
          <h2 className="text-3xl md:text-5xl font-light mb-8">What is <span className="font-medium text-indigo-400">IllumSkin-Net?</span></h2>
          <p className="text-lg md:text-xl text-slate-300 font-light leading-relaxed mb-12">
            IllumSkin-Net is a next-generation beauty platform that bridges the gap between artificial intelligence and personalized cosmetics. 
            By combining advanced skin tone estimation, real-time virtual makeup rendering, and an integrated cosmetic marketplace, we provide an unparalleled personalized shopping experience.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            {[
              { title: 'Skin Analysis', desc: 'Accurate undertone detection.' },
              { title: 'Virtual Try-On', desc: 'Real-time webcam rendering.' },
              { title: 'Marketplace', desc: 'Curated beauty products.' },
              { title: 'Seamless Checkout', desc: 'INR pricing with Cash on Delivery.' }
            ].map(item => (
              <div key={item.title} className="glass-card p-6 rounded-2xl border-white/5">
                <h3 className="font-medium text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3 — HOW IT WORKS */}
      <section id="pipeline" className="py-24 px-6 bg-[#050505]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center">The <span className="font-medium text-rose-400">Process</span></h2>
          
          <div className="flex flex-col md:flex-row items-start justify-between relative">
            <div className="hidden md:block absolute top-12 left-12 right-12 h-[2px] bg-gradient-to-r from-indigo-500/20 via-rose-500/20 to-indigo-500/20" />
            
            {[
              { num: '01', title: 'Capture Image', desc: 'Access secure, local webcam stream.' },
              { num: '02', title: 'Face & Skin Analysis', desc: 'Detect facial landmarks and extract skin regions.' },
              { num: '03', title: 'Albedo & Undertone', desc: 'Estimate true skin color excluding illumination.' },
              { num: '04', title: 'AI Match & Try-On', desc: 'Recommend cosmetics and visualize in real-time.' },
            ].map((step) => (
              <div key={step.num} className="relative z-10 flex flex-row md:flex-col items-center md:items-start text-left md:text-center w-full md:w-1/4 mb-8 md:mb-0 px-4 group">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-xl md:text-2xl font-bold text-slate-500 group-hover:border-indigo-400 group-hover:text-indigo-400 transition-colors shrink-0 mr-6 md:mr-0 md:mx-auto md:mb-6 shadow-xl">
                  {step.num}
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-medium text-white mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — AI / TECHNICAL PIPELINE */}
      <section className="py-24 px-6 bg-[#0a0a0a] border-y border-white/5">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-light mb-6">Technical <span className="font-medium text-indigo-400">Pipeline</span></h2>
            <p className="text-slate-400 font-light leading-relaxed mb-8">
              Designed for robust performance, IllumSkin-Net leverages a sophisticated browser-based AI pipeline utilizing Web Workers and ONNX Runtime to ensure privacy and low latency.
            </p>
            <div className="space-y-4">
              {[
                'Face Landmark Detection (MediaPipe)',
                'Skin Region Extraction & Quality Assessment',
                'True Albedo Estimation via ONNX',
                'Color Space Transformation (sRGB → Linear → CIELAB)',
                'Colorimetric Analysis (CIEDE2000)',
                'Undertone Classification & Algorithmic Recommendation',
                'Virtual Try-On WebGL Compositing'
              ].map((tech, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/5 border border-white/5 rounded-xl p-4">
                  <Database className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span className="text-sm text-slate-200">{tech}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-card rounded-3xl p-8 border border-indigo-500/20 relative overflow-hidden">
             <div className="absolute inset-0 bg-indigo-500/5 blur-[50px] rounded-3xl" />
             <div className="relative z-10 flex flex-col gap-4">
               <div className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/10">
                 <span className="text-sm text-slate-400">ONNX Inference Time</span>
                 <span className="font-mono text-green-400">~45ms</span>
               </div>
               <div className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/10">
                 <span className="text-sm text-slate-400">Face Landmarks</span>
                 <span className="font-mono text-indigo-300">478 Points</span>
               </div>
               <div className="flex justify-between items-center p-4 bg-black/40 rounded-xl border border-white/10">
                 <span className="text-sm text-slate-400">Color Metric</span>
                 <span className="font-mono text-rose-300">CIEDE2000</span>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — NOVELTY / RESEARCH CONTRIBUTION */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-light mb-12">Research & <span className="font-medium text-rose-400">Innovation</span></h2>
          <p className="text-lg text-slate-400 font-light mb-12">What makes IllumSkin-Net different?</p>
          
          <div className="grid md:grid-cols-2 gap-8 text-left">
            <div className="glass-card p-8 rounded-3xl border-white/5 hover:border-white/20 transition-colors">
              <Sun className="w-8 h-8 text-amber-400 mb-4" />
              <h3 className="text-xl font-medium mb-3">Illumination-Aware Analysis</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Rather than relying on raw RGB pixels which are heavily distorted by environmental lighting, the system estimates the true albedo (intrinsic color) of the skin, enabling highly reliable undertone detection across varied lighting environments.
              </p>
            </div>
            <div className="glass-card p-8 rounded-3xl border-white/5 hover:border-white/20 transition-colors">
              <Droplet className="w-8 h-8 text-rose-400 mb-4" />
              <h3 className="text-xl font-medium mb-3">Colorimetric Accuracy</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Cosmetic matching utilizes the perceptually uniform CIELAB color space and the CIEDE2000 color difference formula, mimicking human visual perception to guarantee mathematically complementary aesthetic results.
              </p>
            </div>
            <div className="glass-card p-8 rounded-3xl border-white/5 hover:border-white/20 transition-colors">
              <Eye className="w-8 h-8 text-indigo-400 mb-4" />
              <h3 className="text-xl font-medium mb-3">Privacy-First Architecture</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                By deploying ONNX models and MediaPipe processing directly in the browser via WebAssembly, user video streams never leave the device, ensuring strict biometric privacy and reduced server latency.
              </p>
            </div>
            <div className="glass-card p-8 rounded-3xl border-white/5 hover:border-white/20 transition-colors">
              <ShoppingBag className="w-8 h-8 text-emerald-400 mb-4" />
              <h3 className="text-xl font-medium mb-3">End-to-End Commerce Integration</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Combines advanced computer vision with a fully functional E-commerce backend, supporting personalized product discovery, cart management, INR pricing, and Cash on Delivery logic in a unified application.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6 — KEY FEATURES */}
      <section className="py-24 px-6 bg-[#050505] border-t border-white/5">
        <div className="max-w-7xl mx-auto">
           <h2 className="text-3xl md:text-4xl font-light mb-16 text-center">Platform <span className="font-medium text-white">Features</span></h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
             {[
               { title: 'AI Skin Analysis', icon: Fingerprint, color: 'text-indigo-400' },
               { title: 'Undertone Detection', icon: Palette, color: 'text-rose-400' },
               { title: 'Foundation Matching', icon: ShieldCheck, color: 'text-emerald-400' },
               { title: 'Virtual Try-On', icon: Camera, color: 'text-purple-400' },
               { title: 'Real-Time Tracking', icon: Activity, color: 'text-blue-400' },
               { title: 'Cosmetic Marketplace', icon: ShoppingBag, color: 'text-amber-400' },
             ].map(feature => (
               <div key={feature.title} className="glass-card p-6 rounded-2xl flex items-center gap-4 hover:bg-white/10 transition-colors">
                 <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
                   <feature.icon className={`w-6 h-6 ${feature.color}`} />
                 </div>
                 <h3 className="font-medium text-slate-200">{feature.title}</h3>
               </div>
             ))}
           </div>
        </div>
      </section>

      {/* SECTION 7 — VIRTUAL TRY-ON SHOWCASE */}
      <section className="py-24 px-6 bg-[#0a0a0a] border-y border-white/5 overflow-hidden">
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
              See Before You Buy
            </div>
            <h2 className="text-3xl md:text-5xl font-light mb-6">Experience <span className="font-medium text-white">Virtual Studio</span></h2>
            <p className="text-slate-400 font-light leading-relaxed mb-8">
              Utilize your device camera to preview cosmetic products directly on your face. Our dynamic rendering engine handles foundations, lipsticks, and blushes in real-time.
            </p>
            <button 
              onClick={() => navigate('/studio')}
              className="bg-white text-black px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors w-full sm:w-auto"
            >
              Launch Virtual Studio
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 8 — USER MANUAL */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center">How to Use <span className="font-medium text-indigo-400">IllumSkin</span></h2>
          <div className="grid sm:grid-cols-2 gap-x-12 gap-y-12">
             <div className="space-y-6">
               <h3 className="text-xl font-medium text-white mb-6 border-b border-white/10 pb-4">Virtual Try-On</h3>
               <ul className="space-y-4 text-slate-400 text-sm">
                 <li className="flex gap-3"><span className="text-indigo-400 font-mono">01.</span> Enter the Virtual Studio</li>
                 <li className="flex gap-3"><span className="text-indigo-400 font-mono">02.</span> Allow secure camera access</li>
                 <li className="flex gap-3"><span className="text-indigo-400 font-mono">03.</span> Position your face inside the guide</li>
                 <li className="flex gap-3"><span className="text-indigo-400 font-mono">04.</span> Wait for AI processing to complete</li>
                 <li className="flex gap-3"><span className="text-indigo-400 font-mono">05.</span> Review your personalized recommendations</li>
                 <li className="flex gap-3"><span className="text-indigo-400 font-mono">06.</span> Preview products in real-time</li>
               </ul>
             </div>
             <div className="space-y-6">
               <h3 className="text-xl font-medium text-white mb-6 border-b border-white/10 pb-4">Shopping & Orders</h3>
               <ul className="space-y-4 text-slate-400 text-sm">
                 <li className="flex gap-3"><span className="text-rose-400 font-mono">07.</span> Add desired items to your Cart</li>
                 <li className="flex gap-3"><span className="text-rose-400 font-mono">08.</span> Sign in or create a user account</li>
                 <li className="flex gap-3"><span className="text-rose-400 font-mono">09.</span> Enter delivery information securely</li>
                 <li className="flex gap-3"><span className="text-rose-400 font-mono">10.</span> Select Cash on Delivery (COD)</li>
                 <li className="flex gap-3"><span className="text-rose-400 font-mono">11.</span> Confirm and view your order history</li>
               </ul>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 9 — RESPONSIBLE USE / LIMITATIONS */}
      <section className="py-16 px-6 bg-[#050505] border-t border-white/5 text-center">
         <div className="max-w-3xl mx-auto">
            <h3 className="text-lg font-medium text-slate-300 mb-6 flex items-center justify-center gap-2">
              <ShieldCheck className="w-5 h-5 text-slate-500" />
              Responsible Use & Limitations
            </h3>
            <div className="text-xs sm:text-sm text-slate-500 font-light leading-relaxed space-y-4 max-w-2xl mx-auto text-left sm:text-center px-4">
              <p>Virtual try-on provides an AI-generated visualization and should not be treated as a guarantee of physical appearance. Actual cosmetic results may vary.</p>
              <p>System performance depends on user lighting conditions. Extreme shadows, occlusions (e.g., thick glasses), or low-light environments may impact landmark detection and color extraction accuracy.</p>
              <p>Users should verify product suitability and perform patch tests where necessary. IllumSkin-Net is a digital recommendation tool and does not provide dermatological advice.</p>
            </div>
         </div>
      </section>

      {/* SECTION 10 — PROJECT / RESEARCH SECTION */}
      <section className="py-24 px-6 bg-indigo-950/20 border-y border-indigo-500/20">
         <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-light text-white mb-6">Academic Project Presentation</h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed mb-8">
              <strong>IllumSkin-Net: AI-Powered Personalized Cosmetic Analysis and Virtual Try-On.</strong><br/><br/>
              Addressing the challenge of illumination-biased skin analysis, this project proposes a robust pipeline combining computational color constancy (via ONNX models) with perceptually uniform color spaces (CIELAB) to extract true albedo and recommend cosmetics precisely matched via CIEDE2000 mathematical formulations. The research demonstrates a fully integrated system from browser-based WebAssembly inference to a complete backend commerce architecture.
            </p>
         </div>
      </section>

      {/* SECTION 11 — ARCHITECTURE */}
      <section className="py-24 px-6 bg-black">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center">System <span className="font-medium text-white">Architecture</span></h2>
          
          <div className="flex flex-col items-center gap-4 w-full">
            <div className="glass-card px-8 py-4 border-indigo-500/30 rounded-full text-indigo-300 font-medium text-sm md:text-base w-full sm:w-auto text-center">User / Browser Client</div>
            <div className="h-8 w-px bg-white/20" />
            <div className="glass-card p-6 md:px-8 md:py-6 rounded-2xl w-full max-w-lg flex flex-col sm:flex-row justify-between items-center gap-6 bg-[#0a0a0a]">
               <div className="text-center w-full sm:w-auto">
                 <p className="text-xs text-slate-400 mb-1">UI & Routing</p>
                 <p className="font-medium">React / Vite</p>
               </div>
               <div className="text-center w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
                 <p className="text-xs text-slate-400 mb-1">AI Inference</p>
                 <p className="font-medium">ONNX Worker</p>
               </div>
               <div className="text-center w-full sm:w-auto border-t sm:border-t-0 sm:border-l border-white/10 pt-4 sm:pt-0 sm:pl-6">
                 <p className="text-xs text-slate-400 mb-1">Vision</p>
                 <p className="font-medium">MediaPipe</p>
               </div>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="glass-card px-8 py-4 border-rose-500/30 rounded-full text-rose-300 font-medium text-sm md:text-base w-full sm:w-auto text-center">FastAPI Backend (Render)</div>
            <div className="h-8 w-px bg-white/20" />
            <div className="glass-card px-8 py-4 border-emerald-500/30 rounded-full text-emerald-300 font-medium text-sm md:text-base w-full sm:w-auto text-center">Supabase PostgreSQL (Database)</div>
          </div>
        </div>
      </section>

      {/* SECTION 12 — FINAL CTA */}
      <section className="py-32 px-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/30 via-[#050505] to-[#050505] border-t border-white/5 text-center">
        <h2 className="text-4xl md:text-6xl font-light mb-8">Ready to experience <br/><span className="font-medium text-white">personalized beauty?</span></h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto max-w-md mx-auto">
          <button 
            onClick={() => navigate('/shop')}
            className="w-full sm:w-auto bg-white text-black px-8 py-4 rounded-full font-medium flex items-center justify-center transition-transform hover:scale-105"
          >
            Launch IllumSkin
          </button>
          <button 
            onClick={() => navigate('/studio')}
            className="w-full sm:w-auto glass-button px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-colors border border-white/20"
          >
            Try Virtual Studio
          </button>
        </div>
      </section>

      {/* SECTION 13 — FOOTER */}
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
              The premier AI Beauty Commerce Platform. Powered by on-device computational color constancy and exact CIEDE2000 math.
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
              <li><button className="hover:text-white transition-colors">User Manual</button></li>
              <li><button className="hover:text-white transition-colors">Research / Technology</button></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-slate-600 text-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2026 IllumSkin-Net. All rights reserved.</p>
          <div className="flex gap-4">
            <button className="hover:text-white transition-colors">Privacy Policy</button>
            <button className="hover:text-white transition-colors">Terms of Service</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
