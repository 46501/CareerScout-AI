import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Award, Target, Zap, TrendingUp, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-[#050816] flex flex-col lg:flex-row text-white overflow-hidden relative selection:bg-purple-500/30">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none transform translate-x-1/3 translate-y-1/3"></div>

      {/* LEFT COLUMN: BRANDING & MARKETING */}
      <div className="lg:w-[55%] flex flex-col p-8 lg:p-16 xl:p-24 relative z-10">
        
        {/* Branding */}
        <div className="flex items-center gap-3 mb-8 lg:mb-12">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">CareerScout AI</h1>
            <p className="text-xs text-blue-300/80 font-medium tracking-wide uppercase">Your Personal AI Career Scout</p>
          </div>
        </div>

        {/* Main Headline */}
        <div className="max-w-xl mb-8 lg:mb-12">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Discover opportunities that <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">launch your future</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed font-medium">
            AI-powered matching. Real-time opportunities.<br />
            Curated for your growth and success.
          </p>
        </div>

        {/* CSS/SVG Futuristic Centerpiece (Glowing Door Concept) */}
        <div className="hidden sm:flex relative h-48 w-full max-w-md mb-12 items-end">
          {/* Path */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-gradient-to-t from-purple-500/20 to-transparent blur-md transform [transform:perspective(500px)_rotateX(45deg)]"></div>
          {/* Portal Door */}
          <div className="relative mx-auto w-32 h-48 border-2 border-blue-400/50 rounded-t-xl bg-black/40 shadow-[0_0_30px_rgba(59,130,246,0.3)_inset,0_0_20px_rgba(168,85,247,0.4)] flex flex-col justify-end overflow-hidden group">
             {/* Inner glow lines */}
             <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent"></div>
             {/* City silhouette illusion */}
             <div className="w-full flex items-end justify-center gap-1 px-2 opacity-50">
                <div className="w-3 h-12 bg-blue-300 rounded-t-sm"></div>
                <div className="w-4 h-20 bg-purple-400 rounded-t-sm"></div>
                <div className="w-5 h-24 bg-blue-400 rounded-t-sm"></div>
                <div className="w-4 h-16 bg-purple-300 rounded-t-sm"></div>
                <div className="w-3 h-10 bg-blue-200 rounded-t-sm"></div>
             </div>
             <div className="absolute bottom-0 w-full h-[1px] bg-white/50 shadow-[0_0_10px_#fff]"></div>
          </div>
          
          {/* Floating icons on path */}
          <div className="absolute bottom-8 left-[30%] w-8 h-8 rounded-full bg-blue-900/80 border border-blue-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse">
            <Target className="w-4 h-4 text-blue-300" />
          </div>
          <div className="absolute bottom-16 right-[30%] w-8 h-8 rounded-full bg-purple-900/80 border border-purple-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-pulse" style={{ animationDelay: '1s' }}>
            <Award className="w-4 h-4 text-purple-300" />
          </div>
        </div>

        {/* Feature Blocks */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-6 max-w-2xl mb-12">
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Target className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="font-semibold text-sm text-slate-200">Smart Matching</h3>
            <p className="text-xs text-slate-500 leading-relaxed">AI finds the best opportunities tailored just for you.</p>
          </div>
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
              <Zap className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="font-semibold text-sm text-slate-200">Real-time Updates</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Never miss new jobs, internships or contests.</p>
          </div>
          <div className="flex flex-col gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-colors">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-sm text-slate-200">Career Growth</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Track, apply and grow with confidence.</p>
          </div>
        </div>

        {/* Testimonial */}
        <div className="hidden sm:block mt-auto max-w-sm p-5 rounded-2xl bg-gradient-to-br from-white/[0.05] to-transparent border border-white/[0.05] backdrop-blur-sm relative">
           <div className="text-3xl text-blue-500/40 absolute top-2 left-3 font-serif">"</div>
           <p className="text-sm text-slate-300 italic relative z-10 pl-4 mb-4">
             CareerScout AI helped me find the perfect internship that matched my skills.
           </p>
           <div className="flex items-center gap-3 pl-4">
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-700">
                AV
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">Aman Verma</p>
                <p className="text-xs text-slate-500">Data Science Intern</p>
              </div>
           </div>
        </div>

      </div>

      {/* RIGHT COLUMN: LOGIN CARD */}
      <div className="lg:w-[45%] flex items-center justify-center p-6 lg:p-12 relative z-10">
        
        {/* Glass Card */}
        <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl backdrop-blur-xl bg-[#0b1021]/80 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-white/20 transition-all duration-500">
          
          {/* Subtle Card Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[50px] group-hover:bg-blue-500/20 transition-all duration-500"></div>

          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1c2340] to-[#0b1021] border border-white/10 flex items-center justify-center shadow-inner mb-6">
              <Award className="w-7 h-7 text-blue-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 tracking-tight">Welcome back!</h2>
            <p className="text-sm text-slate-400 text-center">Sign in to continue your career journey</p>
          </div>

          <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center font-medium">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300 ml-1">Email address</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all sm:text-sm shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-300 ml-1">Password</label>
              <div className="relative group/input">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all sm:text-sm shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.3)] text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b1021] focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:-translate-y-0.5 active:translate-y-0"
            >
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-white hover:text-blue-300 transition-colors">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-500 relative z-10">
            <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
            <span>Your data is protected with enterprise-grade security</span>
          </div>

        </div>
      </div>
      
    </div>
  );
}
