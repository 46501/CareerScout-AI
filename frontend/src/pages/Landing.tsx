import { 
  Sparkles, PlayCircle, Search, Compass, LineChart, BookOpen, 
  TrendingUp, Book, BarChart3, Users, ChevronRight
} from 'lucide-react';

// Import the generated image asset
import heroImage from '../assets/hero-student.jpg';

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      
      {/* Top Navigation */}
      <nav className="w-full flex items-center justify-between px-6 lg:px-12 py-4 bg-white border-b border-slate-100 relative z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg leading-none">A</span>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">CareerScout</span>
        </div>
        
        <div className="hidden lg:flex items-center gap-8">
          <a href="#" className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-1">Home</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Jobs</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Internships</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Learn</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Resources</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Success Stories</a>
          <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">About</a>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search jobs, skills, or roles..." 
              className="pl-9 pr-4 py-2 w-64 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <button className="px-5 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Login
          </button>
          <button className="px-5 py-2 rounded-full bg-blue-600 text-sm font-medium text-white shadow-md hover:bg-blue-700 transition-colors">
            Get Started →
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full max-w-[1400px] mx-auto px-6 lg:px-12 pt-16 pb-24 flex flex-col lg:flex-row items-center justify-between gap-12">
        
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-bl from-blue-50 to-white -z-10 rounded-bl-[100px]"></div>

        {/* Hero Left */}
        <div className="w-full lg:w-[45%] flex flex-col items-start z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-600 text-xs font-semibold tracking-wide uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            AI-POWERED CAREER PLATFORM
          </div>
          
          <h1 className="text-5xl lg:text-[4.5rem] font-bold text-slate-900 leading-[1.05] tracking-tight mb-6">
            Discover. Learn. <br/>
            <span className="text-blue-600">Get Hired.</span>
          </h1>
          
          <p className="text-lg text-slate-600 leading-relaxed mb-10 max-w-lg">
            CareerScout helps students and professionals find the right jobs, internships, and learning opportunities — all in one place, powered by AI.
          </p>
          
          <div className="flex items-center gap-4 mb-14">
            <button className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
              Get Started <ChevronRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-3.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-all flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-blue-600" /> Watch Demo
            </button>
          </div>

          <div className="flex items-center gap-8 lg:gap-12 w-full border-t border-slate-200 pt-8">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">10K+</div>
              <div className="text-sm text-slate-500 font-medium">Active Opportunities</div>
            </div>
            <div className="w-px h-12 bg-slate-200"></div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">5K+</div>
              <div className="text-sm text-slate-500 font-medium">Students Placed</div>
            </div>
            <div className="w-px h-12 bg-slate-200"></div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-1">95%</div>
              <div className="text-sm text-slate-500 font-medium">Positive Feedback</div>
            </div>
          </div>
        </div>

        {/* Hero Right (Graphic) */}
        <div className="w-full lg:w-[55%] relative min-h-[600px] flex justify-center lg:justify-end items-end z-10">
          
          {/* Handwritten Text */}
          <div className="absolute top-0 right-1/4 -rotate-6 z-0 hidden lg:block">
            <h3 className="text-3xl font-medium text-slate-400" style={{ fontFamily: 'cursive' }}>Better<br/>Skills<br/>Brighter<br/>Futures</h3>
          </div>

          {/* Student Image */}
          <div className="relative w-[450px] h-[550px] z-10 rounded-3xl overflow-hidden [mask-image:linear-gradient(to_bottom,black_80%,transparent)]">
            <img src={heroImage} alt="Student looking forward" className="w-full h-full object-cover object-bottom" />
          </div>

          {/* Floating UI: Personalized Menu */}
          <div className="absolute top-1/4 left-0 lg:-left-12 w-64 bg-white/90 backdrop-blur-xl rounded-2xl p-5 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white z-30 transform hover:-translate-y-1 transition-transform">
            <h4 className="font-bold text-slate-800 text-sm mb-4 leading-tight">Personalized<br/>for Your Growth</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-slate-600">AI Job Matching</span>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-slate-600">Skill Recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <Compass className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-slate-600">Career Insights</span>
              </div>
              <div className="flex items-center gap-3">
                <LineChart className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-medium text-slate-600">Learning Resources</span>
              </div>
            </div>
          </div>

          {/* Floating UI: Search Bar Mockup */}
          <div className="absolute top-16 right-0 lg:-right-8 w-80 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white z-20">
            <div className="flex gap-2 mb-3">
              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 flex items-center">
                <span className="text-xs text-slate-400">Find your next opportunity...</span>
              </div>
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <Search className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-[10px] text-slate-600">Software Engineer</span>
              <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-[10px] text-slate-600">Data Analyst</span>
              <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-[10px] text-slate-600">Product Manager</span>
              <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-[10px] text-slate-600">AI/ML Intern</span>
              <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-[10px] text-slate-600">Web Developer</span>
            </div>
          </div>

          {/* Floating UI: Job Cards */}
          <div className="absolute top-48 right-[-10%] lg:-right-16 w-72 flex flex-col gap-3 z-30">
            {/* Card 1 */}
            <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 shadow-xl border border-white flex gap-3 transform hover:translate-x-2 transition-transform cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                <span className="font-bold text-red-500">G</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-800">Software Engineer Intern</h4>
                <p className="text-[10px] text-slate-500 mb-1">Google</p>
                <div className="flex items-center gap-2 text-[9px] text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Remote</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Internship</span>
                  <span className="font-semibold text-slate-600">₹80K/month</span>
                </div>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 shadow-xl border border-white flex gap-3 transform hover:translate-x-2 transition-transform cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                <span className="font-bold text-blue-500">M</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-800">Data Analyst</h4>
                <p className="text-[10px] text-slate-500 mb-1">Microsoft</p>
                <div className="flex items-center gap-2 text-[9px] text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span> Hybrid</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span> Full-time</span>
                  <span className="font-semibold text-slate-600">₹12 LPA</span>
                </div>
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-white/95 backdrop-blur-xl rounded-xl p-3 shadow-xl border border-white flex gap-3 transform hover:translate-x-2 transition-transform cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 border border-slate-100">
                <span className="font-bold text-orange-500">a</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-800">AI/ML Research Intern</h4>
                <p className="text-[10px] text-slate-500 mb-1">Amazon</p>
                <div className="flex items-center gap-2 text-[9px] text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> Remote</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400"></span> Internship</span>
                  <span className="font-semibold text-slate-600">₹90K/month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating UI: Progress Chart */}
          <div className="absolute bottom-12 right-0 w-64 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-white z-40 transform rotate-2 hover:rotate-0 transition-transform">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-bold text-slate-800 text-xs">Your Progress</h4>
              <span className="text-[10px] font-bold text-emerald-500 flex items-center">+40% <TrendingUp className="w-3 h-3 ml-0.5" /></span>
            </div>
            <div className="flex items-end justify-between h-12 gap-1">
              {[30, 40, 35, 50, 45, 60, 55, 75, 70, 90, 85, 100].map((h, i) => (
                <div key={i} className={`w-full rounded-t-sm ${i > 7 ? 'bg-blue-600' : 'bg-blue-100'}`} style={{ height: `${h}%` }}></div>
              ))}
            </div>
          </div>
          
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="w-full border-t border-slate-100 bg-white py-10 px-6 lg:px-12 flex flex-col md:flex-row items-center justify-center gap-8 lg:gap-16">
        <span className="text-sm text-slate-500 font-medium">Trusted by students from top universities</span>
        <div className="flex items-center flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <span className="text-xl font-bold text-slate-800 tracking-tighter"><span className="text-blue-500">G</span>oogle</span>
          <span className="text-xl font-bold text-slate-800">Microsoft</span>
          <span className="text-xl font-bold text-slate-800 tracking-tighter">amazon</span>
          <span className="text-xl font-bold text-red-600 flex items-center gap-1"><span className="bg-red-600 text-white w-5 h-5 flex items-center justify-center text-xs">A</span>Adobe</span>
          <span className="text-xl font-bold text-slate-800">TCS</span>
          <span className="text-xl font-bold text-blue-600">Infosys</span>
          <span className="text-sm text-slate-400 font-medium">and more...</span>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="w-full bg-[#f8fafc] py-24 px-6 lg:px-12">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-4">Why CareerScout</h3>
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need to build your career</h2>
            <p className="text-slate-500">From discovering opportunities to getting hired — we've got you covered.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-5">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">AI-Powered Job Matching</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Get personalized job and internship recommendations based on your skills and interests.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-5">
                <Book className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Skill Development</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Access curated learning resources, courses, and skill roadmaps to stay ahead.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-5">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Track Your Progress</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Monitor applications, get insights, and improve with data-driven recommendations.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-5">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Career Community</h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Connect with peers, mentors, and industry professionals to grow your network.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
