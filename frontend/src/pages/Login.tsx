import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/categories');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1515688594390-b649af70d282?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md glass-card p-8 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-light tracking-wider">IllumSkin<span className="font-bold text-indigo-400">Net</span></h1>
        </div>
        <p className="text-slate-400 mb-8 text-center text-sm">AI-Powered Cosmetic Matching</p>
        
        <form onSubmit={handleLogin} className="w-full space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
            <input 
              type="email" 
              defaultValue="demo@exhibition.com"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Password</label>
            <input 
              type="password" 
              defaultValue="password"
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
          
          <button type="submit" className="w-full accent-button rounded-lg py-3 mt-4 flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" />
            <span>Enter Studio</span>
          </button>
        </form>
      </div>
    </div>
  );
}
