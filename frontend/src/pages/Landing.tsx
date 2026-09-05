import { 
  Sparkles, PlayCircle, Search, Compass, LineChart, BookOpen, 
  Book, BarChart3, Users, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import LoginModal from '../components/LoginModal';

// Import the generated image asset
import heroImage from '../assets/hero-student.jpg';

interface LandingProps {
  initialLoginOpen?: boolean;
}

export default function Landing({ initialLoginOpen = false }: LandingProps) {
  const [isLoginOpen, setIsLoginOpen] = useState(initialLoginOpen);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      
      {/* Login Modal */}
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      
      {/* Top Navigation */}
      <div className="w-full bg-white border-b border-slate-100">
        <nav className="w-full flex items-center justify-between px-6 lg:px-8 py-3 relative z-50 max-w-[1400px] mx-auto">
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
                placeholder="Search jobs, skills, or roles..." 
                className="pl-8 pr-4 py-1.5 w-60 bg-slate-50 border border-slate-200 rounded-full text-[12px] focus:outline-none focus:border-blue-500 transition-colors"
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
            <button className="px-7 py-2.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[14px] font-semibold transition-all flex items-center gap-1.5">
              <PlayCircle className="w-4 h-4 text-blue-600" /> Watch Demo
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
        <div className="w-full lg:w-[52%] relative flex justify-end z-10 lg:pr-10">
          
          {/* Main Rounded Container */}
          <div className="relative w-full max-w-[480px] h-[520px] ml-auto">
            
            {/* The Image itself with rounded corners */}
            <div className="absolute inset-0 bg-[#eef2f6] rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm">
              <img src={heroImage} alt="Student" className="w-full h-full object-cover object-bottom" />
            </div>
            
            {/* Handwritten Text */}
            <div className="absolute top-[-25px] right-[25%] -rotate-6 z-0">
              <h3 className="text-2xl font-medium text-slate-400" style={{ fontFamily: 'cursive' }}>Better<br/>skills</h3>
            </div>

            {/* Floating UI: Personalized Menu */}
            <div className="absolute top-[18%] -left-[12%] w-52 bg-white rounded-2xl p-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 z-30">
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

            {/* Floating UI: Search Mockup */}
            <div className="absolute top-[6%] -right-[8%] w-[270px] bg-white rounded-2xl p-3 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-slate-100 z-20">
              <div className="flex gap-2 mb-2">
                <div className="flex-1 bg-slate-50 border border-slate-100 rounded-full px-3 py-1 flex items-center">
                  <span className="text-[10px] text-slate-400">Find your next opportunity...</span>
                </div>
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                  <Search className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] text-slate-500">Software Engineer</span>
                <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] text-slate-500">Data Analyst</span>
                <span className="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[9px] text-slate-500">Product Manager</span>
              </div>
            </div>

            {/* Floating UI: Job Cards */}
            <div className="absolute top-[32%] -right-[15%] w-64 flex flex-col gap-2.5 z-30">
              <div className="bg-white rounded-xl p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.05)] border border-slate-100 flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                  <span className="font-bold text-red-500 text-xs">G</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-[11px] font-bold text-slate-800">Software Engineer Intern</h4>
                  <p className="text-[9px] text-slate-500 mb-1">Google</p>
                  <div className="flex items-center gap-1.5 text-[8px] text-slate-400">
                    <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-blue-400"></span> Remote</span>
                    <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-green-400"></span> Internship</span>
                    <span className="font-semibold text-slate-600 ml-auto">₹80K/month</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.05)] border border-slate-100 flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                  <span className="font-bold text-blue-500 text-xs">M</span>
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
              <div className="bg-white rounded-xl p-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.05)] border border-slate-100 flex gap-2.5">
                <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                  <span className="font-bold text-orange-500 text-xs">a</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-[11px] font-bold text-slate-800">AI/ML Research Intern</h4>
                  <p className="text-[9px] text-slate-500 mb-1">Amazon</p>
                  <div className="flex items-center gap-1.5 text-[8px] text-slate-400">
                    <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-blue-400"></span> Remote</span>
                    <span className="flex items-center gap-0.5"><span className="w-1 h-1 rounded-full bg-green-400"></span> Internship</span>
                    <span className="font-semibold text-slate-600 ml-auto">₹90K/month</span>
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
        <div className="flex items-center flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <span className="text-xl font-bold text-slate-800 tracking-tighter"><span className="text-blue-500">G</span>oogle</span>
          <span className="text-xl font-bold text-slate-800">Microsoft</span>
          <span className="text-xl font-bold text-slate-800 tracking-tighter">amazon</span>
          <span className="text-xl font-bold text-red-600 flex items-center gap-1"><span className="bg-red-600 text-white w-5 h-5 flex items-center justify-center text-xs">A</span>Adobe</span>
          <span className="text-xl font-bold text-slate-800">TCS</span>
          <span className="text-xl font-bold text-blue-600">Infosys</span>
          <span className="text-xs text-slate-400 font-medium">and more...</span>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="w-full bg-[#f8fafc] py-20 px-6 lg:px-12">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-[11px] font-bold text-blue-600 tracking-widest uppercase mb-3">Why CareerScout</h3>
            <h2 className="text-3xl font-extrabold text-[#0f172a] mb-4 tracking-tight">Everything you need to build your career</h2>
            <p className="text-[15px] text-slate-500">From discovering opportunities to getting hired — we've got you covered.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                <Search className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">AI-Powered Job Matching</h4>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Get personalized job and internship recommendations based on your skills and interests.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-5">
                <Book className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Skill Development</h4>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Access curated learning resources, courses, and skill roadmaps to stay ahead.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-5">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">Track Your Progress</h4>
              <p className="text-[13px] text-slate-500 leading-relaxed">
                Monitor applications, get insights, and improve with data-driven recommendations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
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
