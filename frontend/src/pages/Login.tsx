import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import api from '../api';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#030509] text-white overflow-hidden selection:bg-blue-500/30">
      
      {/* LEFT SIDE: Brand & Visual Zone (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        {/* Animated Abstract Mesh Background */}
        <div className="absolute inset-0 bg-[#060913] z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-[pulse_10s_ease-in-out_infinite]"></div>
          <div className="absolute top-[40%] left-[20%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen animate-[pulse_12s_ease-in-out_infinite]"></div>
          {/* Subtle Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        </div>

        {/* Logo Area */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <User className="w-5 h-5 text-[#030509]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">CareerScout AI</h1>
        </div>

        {/* Brand Statement */}
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-[10px] font-semibold text-white tracking-wider uppercase mb-6 backdrop-blur-md">
            AI-POWERED CAREER INTELLIGENCE
          </div>
          <h2 className="text-4xl xl:text-5xl font-semibold tracking-tight leading-[1.15] text-white mb-6">
            Discover opportunities that <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">launch your future.</span>
          </h2>
          <p className="text-base text-slate-400 leading-relaxed">
            Your personal AI career scout. We analyze your skills and goals to connect you with the right jobs, internships, and learning paths.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: Action Zone (Login Form) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Subtle glow for mobile */}
        <div className="absolute top-0 right-0 w-full h-full bg-blue-900/5 blur-[150px] pointer-events-none lg:hidden"></div>

        <div className="w-full max-w-[420px] relative z-10">
          
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <User className="w-5 h-5 text-[#030509]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">CareerScout AI</h1>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-semibold text-white mb-2 tracking-tight">Welcome back</h2>
            <p className="text-slate-400 text-sm">Please enter your details to sign in.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300">Email</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500 group-focus-within/input:text-white transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Forgot password?</a>
              </div>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500 group-focus-within/input:text-white transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-white/30 focus:bg-white/[0.05] transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full flex justify-center items-center py-3.5 px-4 rounded-xl text-sm font-medium text-[#030509] bg-white hover:bg-slate-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Social Login */}
          <div className="mt-8 mb-6 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#030509] text-slate-500">Or continue with</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <button type="button" className="flex justify-center items-center py-2.5 px-4 border border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </button>
            <button type="button" className="flex justify-center items-center py-2.5 px-4 border border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all">
              <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </button>
            <button type="button" className="flex justify-center items-center py-2.5 px-4 border border-white/10 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all">
              <svg className="w-5 h-5 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0zM7.12 20.452H3.558V9h3.562v11.452zM5.34 7.434a2.064 2.064 0 110-4.125 2.063 2.063 0 010 4.125zm15.112 13.018h-3.558v-5.569c0-1.326-.024-3.037-1.852-3.037-1.851 0-2.133 1.448-2.133 2.944v5.662H9.356V9h3.414v1.566h.048c.476-.9 1.637-1.85 3.37-1.85 3.605 0 4.27 2.372 4.27 5.455v6.281z"/>
              </svg>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-white hover:text-blue-400 transition-colors">
                Sign up
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
