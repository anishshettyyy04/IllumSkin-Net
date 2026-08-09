import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { fetchApi } from '../services/api';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(state => state.login);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const from = location.state?.from || '/shop';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const body = isRegister 
        ? { email, password, username } 
        : { email, password };
        
      const response: any = await fetchApi<any>(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      });
      
      login(response.user, response.access_token);
      toast.success(isRegister ? 'Account created successfully!' : 'Welcome back!');
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      const response: any = await fetchApi<any>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      
      login(response.user, response.access_token);
      toast.success('Successfully logged in with Google');
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Google authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[url('https://images.unsplash.com/photo-1515688594390-b649af70d282?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>
      
      <div className="relative z-10 w-full max-w-md glass-card p-8 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-light tracking-wider">IllumSkin<span className="font-bold text-indigo-400">Net</span></h1>
        </div>
        <p className="text-slate-400 mb-8 text-center text-sm">{isRegister ? 'Create your account' : 'AI-Powered Cosmetic Matching'}</p>
        
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {isRegister && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Full Name</label>
              <input 
                type="text" 
                required
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Jane Doe"
              />
            </div>
          )}
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="••••••••"
            />
          </div>
          
          <button disabled={isLoading} type="submit" className="w-full accent-button rounded-lg py-3 mt-4 flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" />
            <span>{isLoading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}</span>
          </button>
        </form>
        
        <div className="w-full mt-6">
            <div className="relative flex py-3 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs uppercase tracking-wider">Or continue with</span>
                <div className="flex-grow border-t border-white/10"></div>
            </div>
            
            <div className="flex justify-center mt-4">
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => toast.error('Google Sign In failed')}
                    theme="filled_black"
                    size="large"
                    shape="pill"
                />
            </div>
        </div>

        <button 
          onClick={() => setIsRegister(!isRegister)}
          className="mt-6 text-sm text-slate-400 hover:text-white transition-colors"
        >
          {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
        </button>
      </div>
    </div>
  );
}
