import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ChevronRight, Activity, Palette, Camera, Database,
  Sun, ScanFace, Droplet, Search, Eye, Server, CheckCircle2,
  AlertCircle, FlaskConical, LayoutGrid, Cpu, Layers, ShoppingBag
} from 'lucide-react';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-indigo-100">
      <Navbar />

      {/* SECTION 1 — HERO */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 min-h-[90vh] flex items-center overflow-hidden">
        {/* Soft abstract background blobs */}
        <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-rose-50/50 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10 w-full">
          <div className="flex flex-col items-start text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white/50 backdrop-blur-sm text-slate-600 text-xs font-semibold tracking-widest uppercase mb-8 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>IllumSkin-Net</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-light tracking-tight mb-6 leading-[1.1] text-slate-900">
              AI-Powered Skin Analysis & <span className="font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">Virtual Try-On</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-600 max-w-xl mb-10 font-light leading-relaxed">
              An illumination-aware foundation shade recommendation system that combines facial analysis, ONNX-based skin estimation, perceptual color science, and real-time virtual try-on.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <button
                onClick={() => navigate('/studio')}
                className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-xl font-medium flex items-center justify-center gap-2 text-base hover:bg-slate-800 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
              >
                Launch Virtual Studio
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate('/shop')}
                className="w-full sm:w-auto bg-white px-8 py-4 rounded-xl font-medium flex items-center justify-center gap-2 text-base hover:bg-slate-50 transition-all border border-slate-200 shadow-sm text-slate-700 hover:-translate-y-0.5"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-500" />
                Explore Shop
              </button>
              <a
                href="https://github.com/anishshettyyy04/IllumSkin-Net"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto bg-transparent px-8 py-4 rounded-xl font-medium flex items-center justify-center gap-2 text-base hover:bg-slate-100 transition-colors border border-transparent text-slate-600"
              >
                Research & GitHub
              </a>
            </div>
          </div>

          <div className="relative h-[500px] w-full mt-12 lg:mt-0 lg:h-[600px] flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-rose-100 rounded-full blur-3xl opacity-50" />
             <div className="relative z-10 glass-card p-10 rounded-3xl border border-white shadow-2xl flex flex-col items-center gap-8 bg-white/80 backdrop-blur-xl w-full max-w-md text-center">
               <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-inner">
                 <ScanFace className="w-10 h-10 text-indigo-500" />
               </div>
               <div>
                 <p className="text-xs text-indigo-500 font-bold tracking-widest uppercase mb-2">Analysis Complete</p>
                 <p className="text-2xl font-medium text-slate-900 mb-2">True Albedo Extracted</p>
                 <p className="text-base text-slate-500">CIEDE2000 Mapping Active</p>
               </div>
               <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                 <div className="w-full h-full bg-gradient-to-r from-indigo-500 to-rose-500 animate-[pulse_2s_ease-in-out_infinite]"></div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* SECTION 2 — WHAT IS ILLUMSKIN-NET? */}
      <section className="py-24 px-6 bg-[#FAF9F6] relative border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-600 text-xs font-semibold tracking-widest uppercase mb-8">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Research Project</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-light mb-8 text-slate-900">What is <span className="font-medium text-indigo-600">IllumSkin-Net?</span></h2>
          <p className="text-lg md:text-xl text-slate-600 font-light leading-relaxed mb-12">
            IllumSkin-Net is an AI-assisted cosmetic shade recommendation and virtual try-on system designed to reduce the limitations of manual foundation shade selection.
          </p>
          <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-12 text-left shadow-sm">
            <p className="text-slate-600 leading-relaxed mb-8 text-lg font-light">
              The system combines multiple computational techniques to analyze the face and recommend products:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                  <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
                  <span className="text-slate-700 font-medium">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3 — HOW IT WORKS */}
      <section id="pipeline" className="py-24 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center text-slate-900">How It <span className="font-medium text-rose-500">Works</span></h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-10 relative">
            {/* Steps */}
            {[
              { num: '01', title: 'CAPTURE', desc: 'Use your device camera to capture facial information safely in the browser.', icon: Camera },
              { num: '02', title: 'ANALYZE', desc: 'Facial landmarks and skin-region information are processed to estimate characteristics.', icon: ScanFace },
              { num: '03', title: 'MATCH', desc: 'Perceptual color analysis compares the estimated skin color with available shades.', icon: Search },
              { num: '04', title: 'TRY ON', desc: 'Recommended products can be visualized instantly through the virtual try-on experience.', icon: Eye },
            ].map((step) => (
              <div key={step.num} className="relative z-10 flex flex-col items-center text-center w-full group bg-[#FAF9F6] p-8 rounded-3xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
                <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shrink-0 mb-6 shadow-sm relative overflow-hidden group-hover:border-indigo-200 transition-colors">
                  <step.icon className="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </div>
                <div className="inline-flex items-center justify-center px-3 py-1 bg-white rounded-full text-xs font-mono font-bold text-indigo-500 mb-4 border border-slate-200 shadow-sm">{step.num}</div>
                <h3 className="text-lg lg:text-xl font-semibold text-slate-900 mb-3 tracking-wide">{step.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4 — WHY ILLUMSKIN-NET? */}
      <section className="py-24 px-6 bg-[#FAF9F6] border-y border-slate-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center text-slate-900">From Manual Shade Selection to <span className="font-medium text-indigo-600">AI-Assisted Matching</span></h2>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-xl font-medium text-slate-900 mb-8 flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-slate-500" />
                </div>
                Traditional Approach
              </h3>
              <ul className="space-y-5">
                {[
                  'Manual shade selection',
                  'Typically strong dependence on store lighting',
                  'Simple visual comparison',
                  'Limited personalization',
                  'No integrated virtual preview'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-slate-600">
                    <div className="w-2 h-2 rounded-full bg-slate-300 mt-2 shrink-0" />
                    <span className="font-light text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-10 rounded-3xl border border-indigo-200 shadow-lg shadow-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-[80px] -z-10"></div>
              <h3 className="text-xl font-medium text-slate-900 mb-8 flex items-center gap-4 relative z-10">
                <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                </div>
                IllumSkin-Net
              </h3>
              <ul className="space-y-5 relative z-10">
                {[
                  'AI-assisted skin analysis',
                  'Illumination-aware processing',
                  'Perceptual color comparison',
                  'Personalized shade recommendations',
                  'Integrated virtual try-on'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-slate-700">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                    <span className="font-medium text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5 — TECHNICAL PIPELINE */}
      <section className="py-24 px-6 bg-white overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center text-slate-900">From Camera Input to <span className="font-medium text-rose-500">Shade Recommendation</span></h2>

          {/* Responsive Grid Pipeline for Desktop/Tablet */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[
              { name: 'Camera Input', icon: Camera },
              { name: 'MediaPipe Face Landmarks', icon: ScanFace },
              { name: 'Skin Region / Quality', icon: Activity },
              { name: 'ONNX Skin Analysis', icon: Cpu },
              { name: 'True Albedo', icon: Droplet },
              { name: 'RGB → Linear RGB', icon: Palette },
              { name: 'CIELAB', icon: Layers },
              { name: 'CIEDE2000', icon: Database },
              { name: 'Shade Matching', icon: Search },
              { name: 'Virtual Try-On', icon: Eye }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center bg-[#FAF9F6] p-6 rounded-2xl border border-slate-200 text-center relative group shadow-sm hover:shadow-md transition-shadow">
                <div className="absolute top-4 left-4 text-xs font-mono font-bold text-slate-300 group-hover:text-indigo-300">{(i + 1).toString().padStart(2, '0')}</div>
                <div className="w-14 h-14 rounded-full bg-white border border-slate-200 flex items-center justify-center mb-4 text-slate-400 group-hover:text-indigo-500 group-hover:border-indigo-200 transition-colors shadow-sm">
                  <step.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold tracking-wide text-slate-700">{step.name}</span>
              </div>
            ))}
          </div>

          {/* Vertical Timeline for Mobile */}
          <div className="flex md:hidden flex-col items-center gap-2 relative">
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-slate-100 -translate-x-1/2 z-0"></div>
            {[
              { name: 'Camera Input', icon: Camera },
              { name: 'Face Landmarks', icon: ScanFace },
              { name: 'Skin Region / Quality', icon: Activity },
              { name: 'ONNX Skin Analysis', icon: Cpu },
              { name: 'True Albedo', icon: Droplet },
              { name: 'RGB → Linear RGB', icon: Palette },
              { name: 'CIELAB', icon: Layers },
              { name: 'CIEDE2000', icon: Database },
              { name: 'Shade Matching', icon: Search },
              { name: 'Virtual Try-On', icon: Eye }
            ].map((step, i) => (
              <div key={i} className="flex flex-col items-center w-full z-10 py-2">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col items-center gap-3 w-64 shadow-sm relative">
                  <div className="absolute top-2 left-2 text-[10px] font-mono font-bold text-slate-300">{(i + 1).toString().padStart(2, '0')}</div>
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-500">
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-700 text-center">{step.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6 — TECHNICAL ARCHITECTURE */}
      <section className="py-24 px-6 bg-[#FAF9F6] border-y border-slate-200">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center text-slate-900">Technical <span className="font-medium text-indigo-600">Architecture</span></h2>

          <div className="grid lg:grid-cols-3 gap-8 items-start">

            {/* Frontend / Client */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <LayoutGrid className="w-8 h-8 text-indigo-500" />
                <h3 className="text-xl font-medium text-slate-900">Client / Browser</h3>
              </div>
              <p className="text-sm font-light text-slate-600 leading-relaxed">
                The web client executes heavy AI models entirely in the browser to protect privacy and minimize latency.
              </p>
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">MediaPipe</span>
                  <span className="text-xs text-slate-400 font-mono">Vision</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">ONNX Runtime Web</span>
                  <span className="text-xs text-slate-400 font-mono">WASM</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">React + WebGL</span>
                  <span className="text-xs text-slate-400 font-mono">UI/Render</span>
                </div>
              </div>
            </div>

            {/* AI / Recommendation */}
            <div className="bg-white p-8 rounded-3xl border border-indigo-200 shadow-md shadow-indigo-100 flex flex-col gap-6 relative overflow-hidden transform lg:-translate-y-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 blur-[50px] rounded-full"></div>
              <div className="flex items-center gap-4 pb-6 border-b border-indigo-100 relative z-10">
                <Search className="w-8 h-8 text-indigo-600" />
                <h3 className="text-xl font-medium text-slate-900">Perceptual Engine</h3>
              </div>
              <p className="text-sm font-light text-slate-600 leading-relaxed relative z-10">
                The core recommendation algorithm bridging the gap between raw pixel data and cosmetic product databases.
              </p>
              <div className="space-y-3 relative z-10">
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Colorimetry</span>
                  <span className="text-xs text-indigo-500 font-mono">CIELAB</span>
                </div>
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Perceptual Math</span>
                  <span className="text-xs text-indigo-500 font-mono">CIEDE2000</span>
                </div>
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Match Resolution</span>
                  <span className="text-xs text-indigo-500 font-mono">k-NN</span>
                </div>
              </div>
            </div>

            {/* Backend / Cloud */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6">
              <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <Server className="w-8 h-8 text-rose-500" />
                <h3 className="text-xl font-medium text-slate-900">Backend API</h3>
              </div>
              <p className="text-sm font-light text-slate-600 leading-relaxed">
                Secure state management, authentication, user data, and commerce interactions managed on scalable cloud infrastructure.
              </p>
              <div className="space-y-3">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">FastAPI</span>
                  <span className="text-xs text-slate-400 font-mono">Render</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">PostgreSQL</span>
                  <span className="text-xs text-slate-400 font-mono">Supabase</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Auth / JWT</span>
                  <span className="text-xs text-slate-400 font-mono">Security</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 7 — RESEARCH NOVELTY */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center text-slate-900">What is the <span className="font-medium text-indigo-600">Research Contribution?</span></h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <div className="bg-[#FAF9F6] p-10 rounded-3xl border border-slate-200 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 border border-slate-100">
                <Sun className="w-6 h-6 text-indigo-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">1. Illumination-Aware Analysis</h3>
              <p className="text-slate-600 font-light leading-relaxed">
                Separating illumination effects from observed facial color to obtain a more useful, normalized representation for accurate shade matching in varying real-world conditions.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-10 rounded-3xl border border-slate-200 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 border border-slate-100">
                <Droplet className="w-6 h-6 text-rose-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">2. Perceptual Color Matching</h3>
              <p className="text-slate-600 font-light leading-relaxed">
                Utilizing CIELAB color spaces and the CIEDE2000 algorithm to compare skin tones and cosmetic shades using true human perceptual color difference rather than simple RGB distance.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-10 rounded-3xl border border-slate-200 hover:shadow-lg transition-shadow duration-300">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 border border-slate-100">
                <Search className="w-6 h-6 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">3. AI-Assisted Recommendation</h3>
              <p className="text-slate-600 font-light leading-relaxed">
                Combining computationally estimated skin characteristics with a structured cosmetic shade database to yield highly personalized and scientifically grounded product recommendations.
              </p>
            </div>

            <div className="bg-[#FAF9F6] p-10 rounded-3xl border border-slate-200 hover:shadow-lg transition-shadow duration-300 xl:col-span-1 md:col-span-2">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 border border-slate-100">
                <Eye className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">4. Integrated Virtual Try-On</h3>
              <p className="text-slate-600 font-light leading-relaxed">
                Connecting the shade recommendation engine directly with a real-time, face-aware WebGL visualization layer to immediately preview the physical appearance of the suggested cosmetics.
              </p>
            </div>

            <div className="bg-indigo-50 p-10 rounded-3xl border border-indigo-100 shadow-inner hover:shadow-lg transition-shadow duration-300 md:col-span-2">
              <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 border border-indigo-100">
                <Cpu className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-4">5. Browser-Based Pipeline</h3>
              <p className="text-slate-600 font-light leading-relaxed">
                Engineering a complete privacy-first architecture using MediaPipe and ONNX Runtime Web. This ensures that sensitive facial imagery and biometrics are processed entirely within the user's local browser without transmitting video data to the cloud.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8 — USER MANUAL */}
      <section className="py-24 px-6 bg-[#FAF9F6] border-y border-slate-200">
        <div className="max-w-[1400px] mx-auto">
          <h2 className="text-3xl md:text-4xl font-light mb-16 text-center text-slate-900">User <span className="font-medium text-indigo-600">Manual</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Create an account', desc: 'Register using your email, username, and secure password.' },
              { num: '02', title: 'Open Virtual Studio', desc: 'Allow camera access when prompted by the browser.' },
              { num: '03', title: 'Position your face', desc: 'Ensure good lighting and align with the on-screen guide.' },
              { num: '04', title: 'Analyze', desc: 'Let the ONNX model estimate your skin characteristics.' },
              { num: '05', title: 'View recommendations', desc: 'Explore foundation shades matched to your exact tone.' },
              { num: '06', title: 'Try virtually', desc: 'Preview the products live directly on your face.' },
              { num: '07', title: 'Shop', desc: 'Add items to your cart and use Cash on Delivery at checkout.' }
            ].map((step, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between h-full hover:-translate-y-1 transition-transform">
                <div>
                  <span className="text-indigo-200 font-mono text-3xl font-bold mb-4 block">{step.num}</span>
                  <h3 className="text-slate-900 font-semibold mb-3 text-lg">{step.title}</h3>
                </div>
                <p className="text-slate-600 text-sm font-light leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9 — RESPONSIBLE AI & LIMITATIONS */}
      <section className="py-24 px-6 bg-white border-y border-slate-200 text-center">
         <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-light text-slate-900 mb-8 flex items-center justify-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              Limitations & Responsible AI
            </h3>
            <div className="text-base text-slate-700 font-light leading-relaxed space-y-4 max-w-2xl mx-auto text-left bg-amber-50/50 p-8 md:p-10 rounded-3xl border border-amber-100">
              <ul className="space-y-4 list-disc pl-4 marker:text-amber-300">
                <li>Camera quality and sensor calibration can influence results.</li>
                <li>Ambient lighting conditions heavily affect skin-color estimation accuracy.</li>
                <li>Facial occlusion such as glasses, hair, or severe angles may disrupt analysis.</li>
                <li>Device displays and monitor color-gamuts will produce varying visual appearances.</li>
                <li>Recommendations are intended strictly as assistive cosmetic guidance.</li>
                <li>Virtual try-on remains an approximation of physical product appearance.</li>
                <li>Results should not be interpreted as medical or dermatological advice.</li>
              </ul>
            </div>
         </div>
      </section>

      {/* SECTION 10 — FINAL CTA */}
      <section className="py-32 px-6 bg-[#FAF9F6] text-center border-b border-slate-200 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full bg-indigo-50 blur-[100px] rounded-full -z-10 opacity-70"></div>
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-light mb-6 text-slate-900">Experience <span className="font-medium text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-rose-500">AI-Assisted Shade Matching</span></h2>
        <p className="text-slate-600 text-lg md:text-xl font-light mb-12 max-w-2xl mx-auto">
          Analyze, discover, and preview cosmetic shades through the IllumSkin-Net Virtual Studio in real-time.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto max-w-md mx-auto">
          <button
            onClick={() => navigate('/studio')}
            className="w-full sm:w-auto bg-slate-900 text-white px-10 py-4 rounded-xl font-medium flex items-center justify-center transition-all hover:bg-slate-800 shadow-md hover:-translate-y-0.5 hover:shadow-lg"
          >
            Launch Virtual Studio
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="w-full sm:w-auto bg-white px-10 py-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
          >
            Explore Shop
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-16 px-6 bg-white text-center md:text-left">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 sm:col-span-2 flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">I</span>
              </div>
              <span className="text-2xl font-light tracking-widest uppercase text-slate-900">IllumSkin-Net</span>
            </div>
            <p className="text-slate-500 text-sm max-w-sm text-center md:text-left leading-relaxed">
              An AI-assisted cosmetic shade recommendation and virtual try-on research project. Built for the modern web.
            </p>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-slate-900 font-semibold mb-6 tracking-wide uppercase text-sm">Application</h4>
            <ul className="space-y-4 text-sm text-slate-600 font-light">
              <li><button onClick={() => navigate('/shop')} className="hover:text-indigo-600 transition-colors">Shop All Products</button></li>
              <li><button onClick={() => navigate('/categories')} className="hover:text-indigo-600 transition-colors">Browse Categories</button></li>
              <li><button onClick={() => navigate('/studio')} className="hover:text-indigo-600 transition-colors">Virtual Try-On Studio</button></li>
            </ul>
          </div>
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-slate-900 font-semibold mb-6 tracking-wide uppercase text-sm">Project & Code</h4>
            <ul className="space-y-4 text-sm text-slate-600 font-light">
              <li><button onClick={() => navigate('/login')} className="hover:text-indigo-600 transition-colors">Login / My Profile</button></li>
              <li><button onClick={() => navigate('/')} className="hover:text-indigo-600 transition-colors">Research Information</button></li>
              <li>
                <a href="https://github.com/anishshettyyy04/IllumSkin-Net" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto pt-8 border-t border-slate-100 text-slate-400 text-xs flex flex-col md:flex-row items-center justify-between gap-4 font-light">
          <p>© 2026 IllumSkin-Net. All rights reserved.</p>
          <p>Designed with a premium light aesthetic.</p>
        </div>
      </footer>
    </div>
  );
}
