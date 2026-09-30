import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { 
  GraduationCap, 
  Search, 
  LineChart, 
  BookOpen, 
  Star, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] font-sans">
      {/* Left Column - Branding (Approx 55%) */}
      <div className="w-full md:w-[55%] bg-[#F0f4f8] flex-col relative overflow-hidden hidden md:flex border-r border-gray-100">
        {/* Background Decorative Element */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-200 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="p-10 lg:p-14 z-10 flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center mb-16">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-sm">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="text-[19px] font-extrabold text-gray-900 leading-none block tracking-tight">CareerScout AI</span>
              <span className="text-[11px] text-gray-500 font-semibold tracking-wide uppercase mt-0.5">Discover • Prepare • Grow</span>
            </div>
          </div>

          {/* Hero Content */}
          <div className="max-w-xl mb-12">
            <h1 className="text-4xl xl:text-[44px] font-extrabold text-gray-900 leading-[1.15] mb-6 tracking-tight">
              Find the Right <br />
              Opportunities for <br />
              <span className="text-blue-600">Your Career Journey</span>
            </h1>
            <p className="text-[15px] text-gray-600 font-medium leading-relaxed max-w-[420px]">
              AI-powered platform to help students and early professionals discover internships, jobs, hackathons, competitions and more.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-7 gap-x-6 max-w-2xl mb-auto">
            <div className="flex items-start">
              <div className="w-11 h-11 rounded-xl bg-blue-100/80 flex items-center justify-center mr-4 flex-shrink-0 shadow-sm border border-blue-200/50">
                <Search className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-1">Personalized Opportunities</h4>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed pr-2">Get recommendations based on your skills and goals</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-11 h-11 rounded-xl bg-blue-100/80 flex items-center justify-center mr-4 flex-shrink-0 shadow-sm border border-blue-200/50">
                <LineChart className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-1">AI-Powered Matching</h4>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed pr-2">Find the most relevant opportunities for you</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-11 h-11 rounded-xl bg-blue-100/80 flex items-center justify-center mr-4 flex-shrink-0 shadow-sm border border-blue-200/50">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-1">Learn & Grow</h4>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed pr-2">Access resources, guides and career insights</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-11 h-11 rounded-xl bg-blue-100/80 flex items-center justify-center mr-4 flex-shrink-0 shadow-sm border border-blue-200/50">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-gray-900 mb-1">Stay Ahead</h4>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed pr-2">Never miss important deadlines and updates</p>
              </div>
            </div>
          </div>

          {/* Bottom Illustration & Stats */}
          <div className="relative h-48 mt-12 w-full max-w-2xl">
            <div className="absolute right-0 bottom-0 w-[80%] h-full">
               {/* Gradient fade on left side of image so it blends smoothly */}
               <div className="absolute inset-0 bg-gradient-to-r from-[#F0f4f8] to-transparent z-10"></div>
               <img src={heroImg} alt="Campus" className="w-full h-full object-cover object-right-bottom mix-blend-multiply opacity-85 rounded-lg" />
            </div>
            <div className="absolute left-0 bottom-2 bg-white/80 backdrop-blur-md border border-white/80 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex gap-6 z-20">
              <div>
                <p className="text-[22px] font-extrabold text-gray-900 leading-tight">10K+</p>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mt-0.5">Students<br/>Trust Us</p>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div>
                <p className="text-[22px] font-extrabold text-gray-900 leading-tight">500+</p>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mt-0.5">Companies<br/>& Orgs</p>
              </div>
              <div className="w-px bg-gray-200"></div>
              <div>
                <p className="text-[22px] font-extrabold text-gray-900 leading-tight">10K+</p>
                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-wide mt-0.5">Opportunities</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form (Approx 45%) */}
      <div className="w-full md:w-[45%] bg-[#F8FAFC] flex flex-col justify-center items-center p-6 sm:p-10 relative">
        {/* Top Right Sign up link */}
        <div className="absolute top-8 right-10 text-[14px] font-semibold text-gray-600 hidden sm:block">
          New here? <Link to="/register" className="text-blue-600 font-bold hover:underline">Sign up →</Link>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-[440px] bg-white p-8 sm:p-10 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative z-10">
          
          {/* Mobile Logo Fallback */}
          <div className="md:hidden flex items-center mb-8 justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-[18px] font-extrabold text-gray-900 leading-none tracking-tight">CareerScout AI</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl sm:text-[28px] font-extrabold text-gray-900 mb-2.5 tracking-tight">Welcome Back 👋</h2>
            <p className="text-[14px] text-gray-500 font-medium leading-relaxed">Sign in to continue your career journey with CareerScout AI.</p>
          </div>

          {/* User Type Tabs */}
          <div className="flex p-1 bg-gray-50 rounded-xl mb-8 border border-gray-100">
            <button 
              type="button"
              onClick={() => setActiveTab('Student')}
              className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all duration-200 ${activeTab === 'Student' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Student
            </button>
            <button 
              type="button"
              onClick={() => setActiveTab('Recruiter')}
              className={`flex-1 py-2 text-[13px] font-bold rounded-lg transition-all duration-200 ${activeTab === 'Recruiter' ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Recruiter
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 text-[13px] font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-gray-700 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  className="w-full pl-[42px] pr-4 py-3 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-shadow placeholder-gray-400 font-medium"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-gray-700 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-[42px] pr-12 py-3 bg-white border border-gray-200 rounded-xl text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-shadow placeholder-gray-400 font-medium"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                  type="button" 
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 pb-2 px-1">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer" 
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-[13px] font-semibold text-gray-600 cursor-pointer select-none">
                  Remember me
                </label>
              </div>
              <a href="#" className="text-[13px] font-bold text-blue-600 hover:text-blue-700 hover:underline">
                Forgot password?
              </a>
            </div>

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl py-3.5 h-auto font-bold text-[14px] transition-all border-0"
            >
              {isLoading ? 'Signing In...' : 'Sign In →'}
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <div className="relative flex justify-center text-[12px] font-semibold">
                <span className="px-4 bg-white text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <button type="button" className="flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
              </button>
              <button type="button" className="flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="h-[18px] w-[18px] text-gray-800" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
              </button>
              <button type="button" className="flex justify-center items-center py-2.5 px-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                <svg className="h-[18px] w-[18px] text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </button>
            </div>
          </div>
          
          {/* Mobile Only Sign-up link */}
          <div className="mt-8 text-center text-[13px] font-semibold text-gray-600 sm:hidden">
            Don't have an account? <Link to="/register" className="text-blue-600 font-bold hover:underline ml-1">Sign up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
