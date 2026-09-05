import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Sun, Search, BarChart3, Rocket, PlayCircle, Briefcase, ArrowRight, GraduationCap, LineChart, User } from 'lucide-react';
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
    <div className="min-h-screen bg-[#070b19] flex flex-col px-6 lg:px-10 xl:px-16 text-white overflow-hidden relative selection:bg-purple-500/30">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none transform -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] pointer-events-none transform translate-x-1/3 translate-y-1/3"></div>

      {/* Top Navigation */}
      <nav className="w-full flex items-center justify-between py-6 relative z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <User className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">CareerScout AI</h1>
        </div>
        
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link to="#" className="text-white">Home</Link>
          <Link to="#" className="hover:text-white transition-colors">Jobs</Link>
          <Link to="#" className="hover:text-white transition-colors">Internships</Link>
          <Link to="#" className="hover:text-white transition-colors">Learn</Link>
          <Link to="#" className="hover:text-white transition-colors">Community</Link>
          <Link to="#" className="hover:text-white transition-colors">About</Link>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-slate-400">
          <Sun className="w-5 h-5 hover:text-white cursor-pointer transition-colors" />
          <span className="hidden sm:inline">Better Careers, Brighter Tomorrows</span>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col lg:flex-row items-center justify-between pb-10">
        
        {/* 1. LEFT COLUMN: INFORMATION */}
        <div className="w-full lg:w-auto lg:max-w-[400px] xl:max-w-[440px] flex flex-col justify-center relative z-20 shrink-0 lg:pr-8">
          
          {/* Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/50 border border-slate-700/50 text-[10px] sm:text-xs font-semibold text-slate-300 tracking-wider uppercase mb-6 w-max">
            AI-POWERED CAREER INTELLIGENCE
          </div>

          {/* Main Headline */}
          <div className="mb-6">
            <h2 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.1] mb-4">
              Your Skills.<br/>
              Real Opportunities.<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">A Brighter Tomorrow.</span>
            </h2>
            <p className="text-sm lg:text-base text-slate-400 leading-relaxed max-w-md">
              CareerScout AI helps you discover the right jobs, internships and learning paths — personalized to your skills, interests and goals.
            </p>
          </div>

          {/* Feature Rows */}
          <div className="flex flex-col gap-5 mb-8">
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-[#111827] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-blue-500/50 transition-colors">
                <Search className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-200">Smart Matching</h3>
                <p className="text-xs text-slate-500">Find opportunities that fit you.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-[#111827] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-blue-500/50 transition-colors">
                <BarChart3 className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-200">Personalized Insights</h3>
                <p className="text-xs text-slate-500">Get data-driven career recommendations.</p>
              </div>
            </div>

            <div className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full bg-[#111827] border border-white/10 flex items-center justify-center shrink-0 group-hover:border-blue-500/50 transition-colors">
                <Rocket className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-200">Faster Growth</h3>
                <p className="text-xs text-slate-500">Learn, apply and move forward with confidence.</p>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 mb-10">
            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-sm font-semibold text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
              Explore Opportunities →
            </button>
            <button className="px-6 py-3 rounded-xl bg-transparent border border-white/20 hover:bg-white/5 text-sm font-semibold text-white flex items-center gap-2 transition-all">
              <PlayCircle className="w-4 h-4" />
              Watch Video
            </button>
          </div>

          {/* Statistics */}
          <div className="flex items-center gap-8">
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white mb-0.5">10K+</div>
              <div className="text-[10px] sm:text-xs text-slate-500">Opportunities</div>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-white mb-0.5">5K+</div>
              <div className="text-[10px] sm:text-xs text-slate-500">Students Placed</div>
            </div>
            <div className="w-px h-8 bg-white/10"></div>
            <div>
              <div className="text-xl sm:text-2xl font-bold text-blue-400 mb-0.5">95%</div>
              <div className="text-[10px] sm:text-xs text-slate-500">Positive Feedback</div>
            </div>
          </div>
        </div>

        {/* 2. CENTER COLUMN: 3D VISUALIZATION */}
        <div className="hidden lg:flex flex-1 relative justify-center items-center px-4 z-10 [perspective:1200px]">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-[400px] aspect-square bg-gradient-to-tr from-blue-600/20 via-purple-600/20 to-transparent blur-[80px] rounded-full pointer-events-none"></div>

          <div className="relative w-full max-w-[500px] h-[600px] flex items-center justify-center">
            
            {/* SVG Connecting Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ filter: 'drop-shadow(0 0 4px rgba(59,130,246,0.3))' }}>
               <path d="M 250 160 L 250 120" fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
               <path d="M 150 300 L 100 300 L 100 270" fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
               <path d="M 350 300 L 400 300 L 400 270" fill="none" stroke="rgba(148,163,184,0.3)" strokeWidth="1.5" strokeDasharray="4 4" />
               
               <circle cx="250" cy="120" r="3" fill="#60a5fa" />
               <circle cx="100" cy="270" r="3" fill="#60a5fa" />
               <circle cx="400" cy="270" r="3" fill="#60a5fa" />
               
               <circle cx="250" cy="160" r="3" fill="#60a5fa" />
               <circle cx="150" cy="300" r="3" fill="#60a5fa" />
               <circle cx="350" cy="300" r="3" fill="#60a5fa" />
            </svg>

            {/* Top Floating Card (Job Match) */}
            <div className="absolute top-[12%] left-[50%] -translate-x-1/2 w-48 p-3 rounded-xl bg-[#0d142b]/90 backdrop-blur-xl border border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.2)] flex items-center gap-3 z-30">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-0.5">
                  <p className="text-[11px] text-white font-medium">Job Match</p>
                  <ArrowRight className="w-3 h-3 text-slate-500" />
                </div>
                <p className="text-[9px] text-slate-400">92% match</p>
                <div className="w-full h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
                  <div className="w-[92%] h-full bg-blue-400 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Left Floating Card (Learn) */}
            <div className="absolute top-[38%] left-[0%] w-[120px] p-3 rounded-xl bg-[#0d142b]/90 backdrop-blur-xl border border-white/10 shadow-lg flex flex-col gap-2 z-30">
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-slate-300" />
              </div>
              <div>
                <p className="text-[11px] text-white font-medium">Learn</p>
                <p className="text-[10px] text-slate-400">New Skills</p>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-500 absolute top-3 right-3" />
            </div>

            {/* Right Floating Card (Track Progress) */}
            <div className="absolute top-[38%] right-[0%] w-[120px] p-3 rounded-xl bg-[#0d142b]/90 backdrop-blur-xl border border-white/10 shadow-lg flex flex-col gap-2 z-30">
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                <LineChart className="w-4 h-4 text-slate-300" />
              </div>
              <div>
                <p className="text-[11px] text-white font-medium">Track</p>
                <p className="text-[10px] text-slate-400">Progress</p>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-500 absolute bottom-3 right-3" />
            </div>

            {/* Central Glowing Card */}
            <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[180px] h-[240px] rounded-2xl bg-gradient-to-b from-[#161f42]/90 to-[#0a0f24]/90 backdrop-blur-2xl border-[2px] border-blue-400 flex flex-col items-center justify-center shadow-[0_0_40px_rgba(59,130,246,0.5),inset_0_0_20px_rgba(59,130,246,0.3)] z-40 transform hover:-translate-y-2 transition-transform duration-500">
              <div className="w-14 h-14 rounded-full bg-blue-500/20 flex items-center justify-center mb-5 border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                <User className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-[22px] font-bold text-white text-center leading-[1.1]">
                Your<br/>Future<br/>Starts Here
              </h3>
              {/* Base reflection */}
              <div className="absolute -bottom-1 left-4 right-4 h-1 bg-blue-400 blur-[2px]"></div>
            </div>

            {/* Isometric Platform Container */}
            <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-[300px] h-[150px] z-20 pointer-events-none">
              
              {/* Top Surface */}
              <div className="absolute top-[30px] left-0 w-full h-[100px] bg-[#0d142b] border border-blue-500/30 transform origin-bottom [transform:rotateX(70deg)] shadow-[0_0_50px_rgba(59,130,246,0.2)] flex items-center justify-center">
                 <div className="w-[180px] h-[80px] bg-blue-500/10 blur-xl rounded-full"></div>
              </div>
              
              {/* Front Face of Platform */}
              <div className="absolute top-[130px] left-0 w-full h-[35px] bg-[#080d1e] border-b border-l border-r border-blue-500/20 flex">
                <div className="flex-1 border-r border-blue-500/20 flex items-center justify-center"><span className="text-[8px] font-bold text-slate-500 tracking-[0.15em]">EXPLORE</span></div>
                <div className="flex-1 border-r border-blue-500/20 flex items-center justify-center"><span className="text-[8px] font-bold text-slate-500 tracking-[0.15em]">LEARN</span></div>
                <div className="flex-1 border-r border-blue-500/20 flex items-center justify-center"><span className="text-[8px] font-bold text-slate-500 tracking-[0.15em]">APPLY</span></div>
                <div className="flex-1 flex items-center justify-center"><span className="text-[8px] font-bold text-slate-500 tracking-[0.15em]">GROW</span></div>
              </div>

              {/* Glowing Platform Base */}
              <div className="absolute top-[165px] left-1/2 -translate-x-1/2 w-[250px] h-2 bg-blue-500/80 blur-[8px]"></div>
            </div>

            {/* Futuristic Path extending downwards */}
            <div className="absolute top-[75%] left-1/2 -translate-x-1/2 w-[400px] h-[150px] overflow-hidden z-10 pointer-events-none">
               {/* 3D rotated floor path */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[300px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent [transform:perspective(200px)_rotateX(60deg)]"></div>
               {/* Path borders */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[300px] border-l border-r border-blue-400/30 [transform:perspective(200px)_rotateX(60deg)] drop-shadow-[0_0_5px_rgba(59,130,246,0.5)]"></div>
            </div>

            {/* Bottom Text */}
            <div className="absolute bottom-[0%] left-1/2 -translate-x-1/2 text-center z-30">
              <p className="text-[10px] font-bold text-blue-400/80 tracking-[0.2em] uppercase leading-tight">Same You.<br/>Bigger Tomorrow.</p>
            </div>
            
          </div>
        </div>

        {/* 3. RIGHT COLUMN: LOGIN CARD */}
        <div className="w-full lg:w-auto lg:max-w-[400px] flex items-center justify-center relative z-20 shrink-0">
          
          {/* Glass Card */}
          <div className="w-full pt-8 pb-10 px-8 rounded-[24px] bg-[#111827]/80 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.5)] relative overflow-hidden group hover:border-white/[0.12] transition-all duration-500">
            
            {/* Subtle Card Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[50px] pointer-events-none"></div>

            <div className="flex flex-col items-center mb-8 relative z-10">
              <h2 className="text-2xl sm:text-[28px] font-bold text-white mb-2 tracking-tight">Welcome back!</h2>
              <p className="text-sm text-slate-400 text-center">Sign in to continue your journey</p>
            </div>

            <form className="space-y-5 relative z-10" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center font-medium">
                  {error}
                </div>
              )}
              
              <div className="space-y-2">
                <label className="block text-[13px] font-medium text-slate-300">Email address</label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-500 group-focus-within/input:text-blue-400 transition-colors" />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-4 py-3 bg-[#0b1221] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[13px] font-medium text-slate-300">Password</label>
                  <a href="#" className="text-[13px] font-medium text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
                </div>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-[#0b1221] border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-purple-500/50 transition-all text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none transition-colors"
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
                className="mt-6 w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-[0_4px_14px_rgba(59,130,246,0.3)]"
              >
                {loading ? 'Signing in...' : 'Sign in →'}
              </button>
            </form>

            {/* Social Login */}
            <div className="mt-8 mb-6 relative z-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-[#111827] text-slate-500">Or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 relative z-10">
              <button type="button" className="flex justify-center items-center py-2.5 px-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button type="button" className="flex justify-center items-center py-2.5 px-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
              </button>
              <button type="button" className="flex justify-center items-center py-2.5 px-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                <svg className="w-5 h-5 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0zM7.12 20.452H3.558V9h3.562v11.452zM5.34 7.434a2.064 2.064 0 110-4.125 2.063 2.063 0 010 4.125zm15.112 13.018h-3.558v-5.569c0-1.326-.024-3.037-1.852-3.037-1.851 0-2.133 1.448-2.133 2.944v5.662H9.356V9h3.414v1.566h.048c.476-.9 1.637-1.85 3.37-1.85 3.605 0 4.27 2.372 4.27 5.455v6.281z"/>
                </svg>
              </button>
            </div>

            <div className="mt-8 text-center relative z-10">
              <p className="text-[13px] text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
                  Sign up
                </Link>
              </p>
            </div>

          </div>
        </div>
        
      </main>
    </div>
  );
}
