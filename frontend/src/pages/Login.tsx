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

  const getErrorMessage = (errorMsg: string) => {
    if (errorMsg.includes('401')) return "Invalid email or password.";
    if (errorMsg.includes('404')) return "Authentication service is temporarily unavailable.\nPlease try again.";
    if (errorMsg.includes('409')) return "An account with this email or username already exists.";
    if (errorMsg.includes('400')) return "Invalid input data provided.";
    if (errorMsg.includes('500')) return "Something went wrong on the server. Please try again.";
    if (errorMsg.toLowerCase().includes('failed to fetch') || errorMsg.toLowerCase().includes('network')) {
      return "Unable to connect to IllumSkin-Net.";
    }
    return errorMsg;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      if (response.access_token && response.user) {
        login(response.user, response.access_token);
        toast.success(isRegister ? 'Account created successfully!' : 'Welcome back!');
        navigate(from, { replace: true });
      } else {
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
      const displayMessage = getErrorMessage(error.message || 'Authentication failed.');
      toast.error(displayMessage, { duration: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FDFCFB] relative overflow-hidden font-sans">
      {/* Subtle cosmetic visual treatment */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-rose-200/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-200/40 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8 text-rose-500" />
            <h1 className="text-3xl font-light tracking-wide text-slate-900">IllumSkin<span className="font-semibold text-rose-500">Net</span></h1>
          </div>
          <p className="text-slate-500 text-sm tracking-wider uppercase font-semibold">AI-Powered Skin Intelligence</p>
        </div>

        {/* Premium Light Card */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6 text-center">
            {isRegister ? 'Create your account' : 'Welcome back'}
          </h2>

          <form onSubmit={handleSubmit} className="w-full space-y-5">
            {isRegister && (
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="Jane Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all placeholder:text-slate-400 shadow-sm"
                placeholder="jane@example.com"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pr-12 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all placeholder:text-slate-400 shadow-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 pr-12 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all placeholder:text-slate-400 shadow-sm"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-slate-400 hover:text-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              disabled={isLoading}
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-900/50 disabled:cursor-not-allowed text-white rounded-xl py-3.5 mt-2 flex items-center justify-center gap-2 font-medium transition-colors focus:outline-none shadow-md"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Camera className="w-5 h-5" />
              )}
              <span>{isLoading ? 'Processing...' : (isRegister ? 'Create Account' : 'Sign In')}</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-sm text-slate-500 hover:text-slate-800 font-medium transition-colors focus:outline-none focus:underline"
            >
              {isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
