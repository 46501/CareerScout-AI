import { Link } from 'react-router-dom';
import { Zap, Target, Search, ArrowRight, Sparkles } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob" style={{ animationDelay: '2s' }}></div>
      <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-primary-800 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-blob" style={{ animationDelay: '4s' }}></div>

      {/* Navigation */}
      <nav className="glass fixed w-full z-50 border-b-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-3">
              <img src="/branding/careerscout-logo.png" alt="CareerScout AI" className="h-8 w-auto object-contain filter brightness-0 invert" onError={(e) => e.currentTarget.style.display = 'none'} />
              <span className="text-2xl font-bold text-white tracking-tight">CareerScout AI</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="px-6 py-2.5 text-sm font-medium bg-primary-600 hover:bg-primary-500 text-white rounded-full transition-all duration-300 shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)]">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto z-10">
        <div className="text-center animate-float">
          <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-8 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-accent-500" />
            <span className="text-sm font-medium text-slate-300">The Future of Job Hunting is Here</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Your AI-Powered <br className="hidden md:block" />
            <span className="text-gradient">Career Opportunity</span> Scout
          </h1>
          <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop searching for jobs manually. Let our advanced AI analyze your unique profile and instantly match you with perfect opportunities across the web.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 w-full px-4 sm:px-0">
            <Link to="/register" className="group inline-flex items-center justify-center whitespace-nowrap text-lg px-8 py-4 h-14 font-semibold bg-white text-slate-900 hover:bg-slate-100 rounded-full transition-all duration-300 w-full sm:w-auto hover:scale-105">
              Start Scouting Now
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center whitespace-nowrap text-lg px-8 py-4 h-14 font-medium border border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-white rounded-full transition-all duration-300 w-full sm:w-auto hover:scale-105 backdrop-blur-sm">
              View Demo
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-40 grid md:grid-cols-3 gap-8 text-center relative z-10">
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center border border-primary-500/30">
              <Zap className="h-8 w-8 text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-white">AI Resume Parsing</h3>
            <p className="text-slate-400 leading-relaxed">Instantly extract your skills and experience to build a comprehensive, machine-readable career profile.</p>
          </div>
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <div className="mx-auto w-16 h-16 bg-accent-500/20 rounded-2xl flex items-center justify-center border border-accent-500/30">
              <Target className="h-8 w-8 text-accent-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Precision Matching</h3>
            <p className="text-slate-400 leading-relaxed">Our neural matching engine finds jobs, internships, and hackathons tailored exactly to your unique skills.</p>
          </div>
          <div className="glass-card p-8 rounded-3xl space-y-6">
            <div className="mx-auto w-16 h-16 bg-primary-500/20 rounded-2xl flex items-center justify-center border border-primary-500/30">
              <Search className="h-8 w-8 text-primary-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Automated Scouting</h3>
            <p className="text-slate-400 leading-relaxed">Background workers constantly scour the web 24/7 to notify you of new matches the moment they are posted.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
