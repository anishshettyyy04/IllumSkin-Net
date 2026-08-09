import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Camera, Sparkles, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { fetchApi } from '../services/api';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore(state => state.login);

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const from = location.state?.from || '/shop';

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!email || !password) {
      toast.error('Email and password are required');
      return;
    }

    if (!validateEmail(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (isRegister) {
      if (!username) {
        toast.error('Username is required');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    }

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
      
      // Some APIs might not return JWT on register, but this specific one does.
      // If it didn't, we would automatically log in here by calling /auth/login
      if (response.access_token && response.user) {
        login(response.user, response.access_token);
        toast.success(isRegister ? 'Account created successfully!' : 'Welcome back!');
        navigate(from, { replace: true });
      } else {
        // Fallback if backend suddenly stops sending token on register
        if (isRegister) {
           const loginRes: any = await fetchApi<any>('/auth/login', {
             method: 'POST',
             body: JSON.stringify({ email, password })
           });
           login(loginRes.user, loginRes.access_token);
           toast.success('Account created successfully!');
           navigate(from, { replace: true });
        } else {
           throw new Error("Invalid response from server");
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed. Please check your credentials.');
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
        <p className="text-slate-400 mb-8 text-center text-sm">{isRegister ? 'Create your account' : 'Sign in to your account'}</p>
        
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {isRegister && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Username</label>
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
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white focus:outline-none"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
          
          <button disabled={isLoading} type="submit" className="w-full accent-button rounded-lg py-3 mt-4 flex items-center justify-center gap-2">
            <Camera className="w-5 h-5" />
            <span>{isLoading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}</span>
          </button>
        </form>

        <button 
          onClick={() => {
            setIsRegister(!isRegister);
            // Optional: reset fields when switching modes
            setPassword('');
            setConfirmPassword('');
          }}
          className="mt-6 text-sm text-slate-400 hover:text-white transition-colors"
        >
          {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
        </button>
      </div>
    </div>
  );
}
