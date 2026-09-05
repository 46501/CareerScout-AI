import { 
  Sparkles, Search, Compass, LineChart, BookOpen, 
  Book, BarChart3, Users, ChevronRight
} from 'lucide-react';
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '../store/filterStore';
import { useAuthStore } from '../store/authStore';
import LoginModal from '../components/LoginModal';

// Import the generated image asset
import heroImage from '../assets/hero-student.jpg';

interface LandingProps {
  initialLoginOpen?: boolean;
}

export default function Landing({ initialLoginOpen = false }: LandingProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(initialLoginOpen);
  const [heroSearch, setHeroSearch] = useState('');
  
  const navigate = useNavigate();
  const { setSearchQuery } = useFilterStore();
  const { isAuthenticated } = useAuthStore();
  
  const featuresRef = useRef<HTMLElement>(null);

  const handleSearch = () => {
    if (!heroSearch.trim()) return;
    setSearchQuery(heroSearch);
    if (isAuthenticated) {
      navigate('/');
    } else {
      setIsLoginOpen(true);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      
      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {/* Top Navigation */}
      <div className="w-full bg-white border-b border-slate-100 sticky top-0 z-50">
        <nav className="w-full flex items-center justify-between px-6 lg:px-8 py-3 relative max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm leading-none">A</span>
            </div>
            <span className="text-lg font-bold text-[#0f172a] tracking-tight">CareerScout</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-6">
            <a href="#" className="text-[13px] font-semibold text-blue-600 border-b-2 border-blue-600 pb-[14px] -mb-[15px]">Home</a>
            <a href="#" className="text-[13px] font-medium text-slate-600 hover:text-blue-600 transition-colors">Jobs</a>
            <a href="#" className="text-[13px] font-medium text-slate-600 hover:text-blue-600 transition-colors">Internships</a>
            <a href="#" className="text-[13px] font-medium text-slate-600 hover:text-blue-600 transition-colors">Learn</a>
            <a href="#" className="text-[13px] font-medium text-slate-600 hover:text-blue-600 transition-colors">Resources</a>
            <a href="#" className="text-[13px] font-medium text-slate-600 hover:text-blue-600 transition-colors">Success Stories</a>
            <a href="#" className="text-[13px] font-medium text-slate-600 hover:text-blue-600 transition-colors">About</a>
          </div>

          <div className="hidden lg:flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                value={heroSearch}
                onChange={(e) => setHeroSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search jobs, skills, or roles..." 
                className="pl-8 pr-4 py-1.5 w-60 bg-slate-50 border border-slate-200 rounded-full text-[12px] focus:outline-none focus:border-blue-500 transition-colors"
                aria-label="Search"
              />
            </div>
            <button onClick={() => setIsLoginOpen(true)} className="px-4 py-1.5 rounded-full border border-slate-200 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              Login
            </button>
            <button onClick={() => setIsLoginOpen(true)} className="px-5 py-1.5 rounded-full bg-blue-600 text-[13px] font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
              Get Started →
            </button>
          </div>
        </nav>
      </div>

      {/* Hero Section */}
      <section className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-12 pb-16 flex flex-col lg:flex-row items-center justify-between gap-10">
        
        {/* Background Gradients (Subtle) */}
        <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-bl from-[#f8fafc] to-transparent -z-10 rounded-bl-[100px]"></div>

        {/* Hero Left */}
        <div className="w-full lg:w-[48%] flex flex-col items-start z-10 pt-4 lg:pt-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-600 text-[10px] font-bold tracking-wider uppercase mb-5 border border-purple-100/50">
            <Sparkles className="w-3 h-3" />
            AI-POWERED CAREER PLATFORM
          </div>
          
          <h1 className="text-[3.2rem] lg:text-[4.5rem] font-extrabold text-[#0f172a] leading-[1.05] tracking-tight mb-5">
            Discover. Learn.<br/>
            <span className="text-blue-600">Get Hired.</span>
          </h1>
          
          <p className="text-[15px] text-slate-600 leading-relaxed mb-8 max-w-[440px]">
            CareerScout helps students and professionals find the right jobs, internships, and learning opportunities — all in one place, powered by AI.
          </p>
          
          <div className="flex items-center gap-4 mb-12">
            <button onClick={() => setIsLoginOpen(true)} className="px-7 py-2.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-[14px] font-semibold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5">
              Get Started <ChevronRight className="w-4 h-4" />
            </button>
            <button onClick={scrollToFeatures} className="px-7 py-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[14px] font-semibold transition-all flex items-center gap-1.5">
              Explore Features
            </button>
          </div>

          <div className="flex items-center gap-6 lg:gap-10">
            <div>
              <div className="text-2xl font-extrabold text-[#0f172a] mb-0.5">10K+</div>
              <div className="text-[11px] text-slate-500 font-medium">Active Opportunities</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <div className="text-2xl font-extrabold text-[#0f172a] mb-0.5">5K+</div>
              <div className="text-[11px] text-slate-500 font-medium">Students Placed</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div>
              <div className="text-2xl font-extrabold text-[#0f172a] mb-0.5">95%</div>
              <div className="text-[11px] text-slate-500 font-medium">Positive Feedback</div>
            </div>
          </div>
        </div>

        {/* Hero Right (Graphic) */}
        <div className="w-full lg:w-[52%] relative flex justify-center lg:justify-end z-10 lg:pr-16 mt-16 lg:mt-0">
          
          {/* Main Rounded Container */}
          <div className="relative w-full max-w-[420px] lg:max-w-[440px] h-[520px] mx-auto lg:mx-0 lg:mr-4">
            
            {/* The Image itself with rounded corners */}
            <div className="absolute inset-0 bg-[#eef2f6] rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
              <img src={heroImage} alt="Student" className="w-full h-full object-cover object-bottom" />
            </div>
            
            {/* Handwritten Text */}
            <div className="absolute top-[-30px] right-[25%] -rotate-6 z-0 hidden lg:block">
              <h3 className="text-2xl font-medium text-slate-400" style={{ fontFamily: 'cursive' }}>Better<br/>skills</h3>
            </div>

            {/* Floating UI: Personalized Menu */}
            <div className="absolute top-[30%] lg:top-[25%] -left-[10%] lg:-left-[18%] w-48 lg:w-52 bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-slate-100 z-30">
              <h4 className="font-extrabold text-[#0f172a] text-[13px] mb-3 leading-tight">Personalized<br/>for Your Growth</h4>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-medium text-slate-600">AI Job Matching</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-medium text-slate-600">Skill Recommendations</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-medium text-slate-600">Career Insights</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <LineChart className="w-3.5 h-3.5 text-blue-600" />
                  <span className="text-[11px] font-medium text-slate-600">Learning Resources</span>
                </div>
              </div>
            </div>

            {/* Floating UI: Search Mockup -> REAL INTERACTIVE SEARCH */}
            <div className="absolute -top-[5%] lg:-top-[10%] -right-[5%] lg:-right-[15%] w-[250px] lg:w-[280px] bg-white rounded-2xl p-3 shadow-[0_8px_30px_rgba(0,0,0,0.1)] border border-slate-100 z-40">
              <div className="flex gap-2 mb-2">
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-full px-3 py-1 flex items-center focus-within:border-blue-400 focus-within:bg-white transition-colors cursor-text">
                  <input 
                    type="text"
                    value={heroSearch}
                    onChange={(e) => setHeroSearch(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Find your next opportunity..."
                    className="w-full bg-transparent border-none focus:outline-none text-[11px] text-slate-700 placeholder-slate-400"
                    aria-label="Search opportunities"
                  />
                </div>
                <button 
                  onClick={handleSearch}
                  className="w-6 h-6 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center shrink-0 transition-colors"
                  aria-label="Submit search"
                >
                  <Search className="w-3 h-3 text-white" />
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => { setHeroSearch('Software Engineer'); setTimeout(handleSearch, 50); }}>Software Engineer</span>
                <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => { setHeroSearch('Data Analyst'); setTimeout(handleSearch, 50); }}>Data Analyst</span>
                <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] text-slate-500 cursor-pointer hover:bg-slate-100" onClick={() => { setHeroSearch('Product Manager'); setTimeout(handleSearch, 50); }}>Product Manager</span>
              </div>
            </div>

            {/* Floating UI: Job Cards */}
            <div className="absolute top-[28%] lg:top-[30%] -right-[10%] lg:-right-[22%] w-60 lg:w-64 flex flex-col gap-3 z-30">
              <div className="bg-white rounded-xl p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-slate-100 flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                  <span className="font-bold text-[#EA4335] text-xs">G</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-[11px] font-bold text-slate-800">Software Engineer Intern</h4>
                  <p className="text-[9px] text-slate-500 mb-1">Google</p>
                  <div className="flex items-center gap-1.5 text-[8px] text-slate-400">
                    <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-blue-400"></span> Remote</span>
                    <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-green-400"></span> Internship</span>
                    <span className="font-semibold text-slate-600 ml-auto">₹80K/mo</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-slate-100 flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                  <div className="grid grid-cols-2 gap-[1px]"><div className="w-1.5 h-1.5 bg-[#F25022]"></div><div className="w-1.5 h-1.5 bg-[#7FBA00]"></div><div className="w-1.5 h-1.5 bg-[#00A4EF]"></div><div className="w-1.5 h-1.5 bg-[#FFB900]"></div></div>
                </div>
                <div className="flex-1">
                  <h4 className="text-[11px] font-bold text-slate-800">Data Analyst</h4>
                  <p className="text-[9px] text-slate-500 mb-1">Microsoft</p>
                  <div className="flex items-center gap-1.5 text-[8px] text-slate-400">
                    <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-purple-400"></span> Hybrid</span>
                    <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-orange-400"></span> Full-time</span>
                    <span className="font-semibold text-slate-600 ml-auto">₹12 LPA</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-slate-100 flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                  <span className="font-bold text-[#FF9900] text-xs">a</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-[11px] font-bold text-slate-800">AI/ML Research Intern</h4>
                  <p className="text-[9px] text-slate-500 mb-1">Amazon</p>
                  <div className="flex items-center gap-1.5 text-[8px] text-slate-400">
                    <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-blue-400"></span> Remote</span>
                    <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-green-400"></span> Internship</span>
                    <span className="font-semibold text-slate-600 ml-auto">₹90K/mo</span>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="w-full border-t border-slate-100 bg-white py-10 px-6 lg:px-12 flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16">
        <span className="text-[13px] text-slate-500 font-medium">Trusted by students from top universities</span>
        <div className="flex items-center flex-wrap justify-center gap-8">
          {/* Google */}
          <span className="text-xl font-bold text-slate-800 tracking-tighter"><span className="text-[#4285F4]">G</span><span className="text-[#EA4335]">o</span><span className="text-[#FBBC05]">o</span><span className="text-[#4285F4]">g</span><span className="text-[#34A853]">l</span><span className="text-[#EA4335]">e</span></span>
          {/* Microsoft */}
          <span className="text-xl font-bold text-[#737373] flex items-center gap-1.5"><div className="grid grid-cols-2 gap-[2px]"><div className="w-2.5 h-2.5 bg-[#F25022]"></div><div className="w-2.5 h-2.5 bg-[#7FBA00]"></div><div className="w-2.5 h-2.5 bg-[#00A4EF]"></div><div className="w-2.5 h-2.5 bg-[#FFB900]"></div></div>Microsoft</span>
          {/* Amazon */}
          <span className="text-xl font-bold text-[#232F3E] tracking-tighter">amazon<span className="text-[#FF9900]">.</span></span>
          {/* Adobe */}
          <span className="text-xl font-bold text-[#FF0000] flex items-center gap-1"><span className="bg-[#FF0000] text-white w-[22px] h-[22px] flex items-center justify-center text-[15px] font-black rounded-sm shadow-sm">A</span>Adobe</span>
          {/* TCS */}
          <span className="text-xl font-black text-[#1F2C5C] tracking-wide">TCS</span>
          {/* Infosys */}
          <span className="text-xl font-bold text-[#007CC3]">Infosys</span>
          
          <span className="text-xs text-slate-400 font-medium">and more...</span>
        </div>
      </section>

      {/* Features Grid Section */}
      <section ref={featuresRef} className="w-full bg-[#f8fafc] py-20 px-6 lg:px-12 scroll-mt-20">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-[11px] font-bold text-blue-600 tracking-widest uppercase mb-3">Why CareerScout</h3>
            <h2 className="text-3xl font-extrabold text-[#0f172a] mb-4 tracking-tight">Everything you need to build your career</h2>
            <p className="text-[15px] text-slate-500">From discovering opportunities to getting hired — we've got you covered.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">AI-Powered Job Matching</h4>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Get personalized job and internship recommendations based on your skills and interests.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-5">
                <Book className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Skill Development</h4>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Access curated learning resources, courses, and skill roadmaps to stay ahead.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-5">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Track Your Progress</h4>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Monitor applications, get insights, and improve with data-driven recommendations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-5">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Career Community</h4>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Connect with peers, mentors, and industry professionals to grow your network.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
