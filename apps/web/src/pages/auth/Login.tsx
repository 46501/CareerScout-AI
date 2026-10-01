import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { 
  Search, 
  BarChart2, 
  BookOpen, 
  Star, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail,
  Send
} from 'lucide-react';
import heroImg from '../../assets/hero.png';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('Student');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setIsLoading(true);
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#F4F7F9] font-sans">
      {/* LEFT SIDE - BRANDING & HERO (55%) */}
      <div className="w-full lg:w-[55%] relative flex flex-col justify-between overflow-hidden bg-white border-b lg:border-b-0 lg:border-r border-gray-100 min-h-[400px] lg:min-h-screen">
        
        {/* Soft Background Gradients */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-blue-50/80 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-100/50 rounded-full blur-3xl pointer-events-none"></div>

        {/* Decorative Elements */}
        {/* Paper Plane & Handwritten Text */}
        <div className="absolute top-[18%] right-[10%] rotate-6 flex flex-col items-center pointer-events-none z-20">
          <div className="flex items-start">
            <Send className="w-4 h-4 text-blue-500 mr-2 -mt-1 transform -rotate-12" />
            <p className="font-['Caveat',cursive,sans-serif] text-blue-600 text-[18px] leading-tight text-center max-w-[120px] italic font-medium -rotate-3">
              Your next opportunity<br/>is closer than<br/>you think
            </p>
          </div>
          {/* Curved Arrow SVG */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="ml-12 mt-1 text-blue-500">
            <path d="M5 5 Q 35 10, 30 35 M 30 35 L 23 32 M 30 35 L 35 28" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        </div>

        {/* Leaves / Ambient decorations */}
        <svg className="absolute top-0 right-0 w-48 h-48 opacity-30 pointer-events-none text-green-700" viewBox="0 0 100 100">
          <path d="M 100 0 C 80 10, 60 0, 50 20 C 40 40, 60 50, 70 70 C 80 90, 100 80, 100 100 Z" fill="currentColor"/>
          <path d="M 80 -10 C 60 0, 40 -10, 30 10 C 20 30, 40 40, 50 60 C 60 80, 80 70, 80 90 Z" fill="currentColor"/>
        </svg>

        <div className="p-6 sm:p-10 lg:p-14 z-10 flex flex-col h-full relative">
          {/* Top Left Branding */}
          <div className="flex items-center mb-12">
            <img src="/branding/careerscout-logo.png" alt="CareerScout AI" className="h-10 w-auto object-contain" />
          </div>

          {/* Hero Heading & Description */}
          <div className="max-w-lg mb-10">
            <h1 className="text-4xl xl:text-[44px] font-extrabold text-gray-900 leading-[1.18] mb-6 tracking-tight">
              Find the Right <br />
              Opportunities for <br />
              <span className="text-blue-600">Your Career Journey</span>
            </h1>
            <p className="text-[15px] text-gray-500 font-medium leading-relaxed max-w-[420px]">
              AI-powered platform to help students and early professionals discover internships, jobs, hackathons, competitions and more.
            </p>
          </div>

          {/* Feature List */}
          <div className="hidden sm:flex flex-col gap-y-6 max-w-sm mb-auto">
            <div className="flex items-start group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mr-4 flex-shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-blue-100 group-hover:bg-blue-100 transition-colors">
                <Search className="h-4 w-4 text-blue-600 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-0.5">Personalized Opportunities</h4>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed">Get recommendations based on your skills and goals</p>
              </div>
            </div>
            
            <div className="flex items-start group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mr-4 flex-shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-blue-100 group-hover:bg-blue-100 transition-colors">
                <BarChart2 className="h-4 w-4 text-blue-600 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-0.5">AI-Powered Matching</h4>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed">Find the most relevant opportunities for you</p>
              </div>
            </div>

            <div className="flex items-start group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mr-4 flex-shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-blue-100 group-hover:bg-blue-100 transition-colors">
                <BookOpen className="h-4 w-4 text-blue-600 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-0.5">Learn & Grow</h4>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed">Access resources, guides and career insights</p>
              </div>
            </div>

            <div className="flex items-start group">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mr-4 flex-shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-blue-100 group-hover:bg-blue-100 transition-colors">
                <Star className="h-4 w-4 text-blue-600 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-0.5">Stay Ahead</h4>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed">Never miss important deadlines and updates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Illustration (Bottom Right) */}
        <div className="hidden sm:flex absolute right-0 bottom-0 w-[70%] max-w-[600px] h-[50%] z-0 items-end justify-end pointer-events-none">
           {/* Fade out to the left to blend image */}
           <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent z-10 w-[40%]"></div>
           <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent z-10 h-[20%] bottom-0"></div>
           <img src={heroImg} alt="Student on campus" className="w-full h-full object-cover object-right-bottom mix-blend-multiply opacity-95" />
        </div>

        {/* Trust Statistics Card (Bottom Left) */}
        <div className="absolute left-6 sm:left-10 lg:left-14 bottom-6 sm:bottom-8 z-20 hidden sm:block">
          <div className="bg-white/90 backdrop-blur-md border border-white p-4 sm:p-5 px-5 sm:px-7 rounded-2xl shadow-[0_12px_40px_rgb(0,0,0,0.06)] flex gap-4 sm:gap-7 items-center overflow-x-auto hide-scrollbar max-w-[calc(100vw-3rem)]">
            <div className="text-center">
              <div className="flex justify-center mb-1 text-blue-500"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg></div>
              <p className="text-[20px] font-black text-gray-900 leading-tight">10K+</p>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Students Trust Us</p>
            </div>
            <div className="w-[1px] h-10 bg-gray-200"></div>
            <div className="text-center">
              <div className="flex justify-center mb-1 text-blue-500"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg></div>
              <p className="text-[20px] font-black text-gray-900 leading-tight">500+</p>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Companies & Orgs</p>
            </div>
            <div className="w-[1px] h-10 bg-gray-200"></div>
            <div className="text-center">
              <div className="flex justify-center mb-1 text-blue-500"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg></div>
              <p className="text-[20px] font-black text-gray-900 leading-tight">10K+</p>
              <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">Opportunities</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN CARD (45%) */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center items-center p-4 sm:p-10 relative overflow-hidden flex-1 lg:min-h-screen">
        
        {/* Subtle Background Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/40 rounded-bl-[100px] pointer-events-none blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100/40 rounded-tr-[100px] pointer-events-none blur-2xl"></div>

        {/* Top Right Signup */}
        <div className="absolute top-8 right-10 text-[14px] font-medium text-gray-500 hidden sm:block z-20">
          New here? <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Sign up →</Link>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-[460px] bg-white p-9 sm:p-11 rounded-[32px] shadow-[0_10px_40px_rgb(0,0,0,0.04)] border border-gray-100/80 relative z-10">
          
          {/* Mobile Logo Fallback */}
          <div className="lg:hidden flex items-center mb-10 justify-center">
            <img src="/branding/careerscout-logo.png" alt="CareerScout AI" className="h-8 w-auto object-contain" />
          </div>

          <div className="mb-8">
            <h2 className="text-3xl sm:text-[32px] font-extrabold text-gray-900 mb-2.5 tracking-tight flex items-center">
              Welcome Back <span className="ml-2 text-[28px] animate-wave origin-bottom-right inline-block">👋</span>
            </h2>
            <p className="text-[14px] text-gray-500 font-medium leading-relaxed pr-4">
              Sign in to continue your career journey with CareerScout AI.
            </p>
          </div>

          {/* Student / Recruiter Tabs */}
          <div className="flex p-1.5 bg-gray-50/80 rounded-[14px] mb-8 border border-gray-100">
            <button 
              type="button"
              onClick={() => setActiveTab('Student')}
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-[10px] transition-all duration-200 ${
                activeTab === 'Student' 
                  ? 'bg-white text-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Student
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('Recruiter')}
              className={`flex-1 py-2.5 text-[14px] font-bold rounded-[10px] transition-all duration-200 ${
                activeTab === 'Recruiter' 
                  ? 'bg-white text-blue-600 shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Recruiter
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 text-[13px] font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-gray-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-[14px] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder-gray-400 font-medium hover:border-gray-300"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-gray-900 ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-blue-500 text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-11 pr-12 py-3.5 bg-white border border-gray-200 rounded-[14px] text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all placeholder-gray-400 font-medium hover:border-gray-300"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 pb-3 px-1">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-[4px] cursor-pointer" 
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-[13px] font-semibold text-gray-600 cursor-pointer select-none">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all">
                Forgot password?
              </a>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_14px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.3)] rounded-[14px] py-4 h-auto font-bold text-[15px] transition-all border-0 flex items-center justify-center group"
            >
              {isLoading ? 'Signing In...' : (
                <>
                  Sign In 
                  <span className="ml-1.5 transform group-hover:translate-x-1 transition-transform">→</span>
                </>
              )}
            </Button>
          </form>

          <div className="mt-9 mb-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[12px] font-semibold">
                <span className="px-4 bg-white text-gray-400 tracking-wide uppercase">Or continue with</span>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <button type="button" className="flex justify-center items-center py-3 px-4 border border-gray-200 rounded-[14px] hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                <span className="ml-2 font-bold text-[13px] text-gray-700 sm:hidden lg:block">Google</span>
              </button>
              <button type="button" className="flex justify-center items-center py-3 px-4 border border-gray-200 rounded-[14px] hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                <svg className="h-[20px] w-[20px] text-gray-900" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                <span className="ml-2 font-bold text-[13px] text-gray-700 sm:hidden lg:block">GitHub</span>
              </button>
              <button type="button" className="flex justify-center items-center py-3 px-4 border border-gray-200 rounded-[14px] hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                <svg className="h-[20px] w-[20px] text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                <span className="ml-2 font-bold text-[13px] text-gray-700 sm:hidden lg:block">LinkedIn</span>
              </button>
            </div>
          </div>
          
          <div className="text-center text-[14px] font-medium text-gray-500">
            Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:text-blue-700 transition-colors ml-1">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

