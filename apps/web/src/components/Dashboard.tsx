import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, Search, FileText, Bot, User, 
  BookOpen, Folder, PieChart, Settings, Bell, ChevronDown, 
  Briefcase, Bookmark, Users, 
  ArrowRight, Sparkles, Trophy, CheckCircle, 
  Star, Heart, Navigation, Clock, Menu, X
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import api from '../lib/api';
import heroImg from '../assets/hero.png';
import { ProfileCompletionModal } from './ui/ProfileCompletionModal';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { useQuery } from '@tanstack/react-query';

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isScouting, setIsScouting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{type: 'success'|'error', title: string, message: string} | null>(null);

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/profile').then(res => res.data.data)
  });

  const { data: completionData } = useQuery({
    queryKey: ['profileCompletion'],
    queryFn: () => api.get('/profile/completion').then(res => res.data.data)
  });

  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => api.get('/dashboard/stats').then(res => res.data.data)
  });

  const { data: trends } = useQuery({
    queryKey: ['dashboardTrends'],
    queryFn: () => api.get('/dashboard/trends').then(res => res.data.data)
  });

  const { data: skillsData } = useQuery({
    queryKey: ['dashboardSkills'],
    queryFn: () => api.get('/dashboard/skills').then(res => res.data.data)
  });

  const { data: matches } = useQuery({
    queryKey: ['recommendedOpportunities', activeTab],
    queryFn: () => api.get(`/opportunities?filter=recommended&limit=5${activeTab !== 'All' ? `&type=${activeTab}` : ''}`).then(res => res.data.data)
  });

  const { data: recentOpportunities } = useQuery({
    queryKey: ['recentOpportunities'],
    queryFn: () => api.get('/opportunities?limit=4').then(res => res.data.data)
  });

  const { data: scoutStatus, refetch: refetchScoutStatus } = useQuery({
    queryKey: ['scoutStatus'],
    queryFn: () => api.get('/scout/status').then(res => res.data.data),
    refetchInterval: isScouting ? 3000 : false
  });

  useEffect(() => {
    if (scoutStatus?.status === 'Running' || scoutStatus?.status === 'Queued') {
      setIsScouting(true);
    } else {
      setIsScouting(false);
    }
  }, [scoutStatus]);

  const runScout = async () => {
    if (completionData && completionData.percentage < 100) {
      setIsModalOpen(true);
      return;
    }
    
    try {
      setIsScouting(true);
      const res = await api.post('/scout/run');
      if (res.data?.message) {
        setAlertMessage({ type: 'success', title: 'Scout Started', message: res.data.message });
      }
      refetchScoutStatus();
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message;
      if (errMsg && errMsg.toLowerCase().includes('profile must be 100% complete')) {
        setIsModalOpen(true);
      } else {
        setAlertMessage({ type: 'error', title: 'Failed to run scout', message: errMsg || 'An unexpected error occurred.' });
      }
      setIsScouting(false);
    }
  };

  const firstName = profile?.personal?.fullName?.split(' ')[0] || 'there';
  const fullName = profile?.personal?.fullName || 'User';

  const defaultChartData = [
    { name: 'Apr', Jobs: 0, Internships: 0, Competitions: 0, Hackathons: 0 },
  ];
  const finalChartData = (trends && trends.length > 0) ? trends : defaultChartData;

  return (
    <div className="min-h-screen bg-slate-950 flex font-sans text-slate-300 overflow-hidden relative">
      
      {/* Background Ambient Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600 rounded-full mix-blend-multiply filter blur-[128px] opacity-20 animate-blob pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-10 animate-blob pointer-events-none" style={{ animationDelay: '2s' }}></div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-40 lg:hidden backdrop-blur-md" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 glass-card border-r border-slate-800/50 flex flex-col flex-shrink-0 h-screen transition-transform duration-300 ease-in-out lg:transform-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} rounded-none`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800/50 pt-2 pb-2">
          <div className="flex items-center">
            {/* Note: Recommend updating logo asset to a light version for dark mode if available */}
            <span className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
               <Bot className="h-6 w-6 text-primary-500" /> CareerScout
            </span>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto hide-scrollbar">
          <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl bg-primary-500/10 text-primary-400 mb-1 border border-primary-500/20 shadow-[inset_0_0_15px_rgba(99,102,241,0.1)]">
            <LayoutDashboard className="h-4 w-4 mr-3" /> Dashboard
          </Link>
          <Link to="/opportunities" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white mb-1 transition-colors">
            <Search className="h-4 w-4 mr-3 text-slate-500" /> Opportunities
          </Link>
          <Link to="/applications" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white mb-1 transition-colors">
            <CheckCircle className="h-4 w-4 mr-3 text-slate-500" /> Applications
          </Link>
          <Link to="/assistant" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white mb-1 transition-colors">
            <Bot className="h-4 w-4 mr-3 text-slate-500" /> AI Scout
          </Link>
          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white mb-1 transition-colors">
            <FileText className="h-4 w-4 mr-3 text-slate-500" /> Resume
          </Link>
          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white mb-1 transition-colors">
            <User className="h-4 w-4 mr-3 text-slate-500" /> Profile
          </Link>
          
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Resources</p>
          </div>
          <Link to="/opportunities" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white mb-1 transition-colors">
            <BookOpen className="h-4 w-4 mr-3 text-slate-500" /> Learning Hub
          </Link>
          <Link to="/opportunities" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white mb-1 transition-colors">
            <Folder className="h-4 w-4 mr-3 text-slate-500" /> Resources
          </Link>
          <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white mb-1 transition-colors">
            <PieChart className="h-4 w-4 mr-3 text-slate-500" /> Analytics
          </Link>
          <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-slate-400 hover:bg-slate-800/50 hover:text-white mb-1 transition-colors mt-2">
            <Settings className="h-4 w-4 mr-3 text-slate-500" /> Settings
          </Link>
        </nav>

        {/* Sidebar Bottom Card */}
        <div className="p-5 mx-4 mb-6 mt-auto bg-gradient-to-br from-primary-900/80 to-slate-900 rounded-2xl text-white relative overflow-hidden border border-primary-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full -mr-16 -mt-16 pointer-events-none blur-xl" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent-500/20 rounded-full -ml-10 -mb-10 pointer-events-none blur-xl" />
          <div className="relative z-10">
            <h4 className="font-bold text-[14px] leading-tight mb-2 text-white">Find Opportunities<br/>Built for Your Future</h4>
            <p className="text-[11px] text-primary-200/80 mb-4 font-medium leading-relaxed">AI-powered recommendations<br/>for students and early careers.</p>
            <Button onClick={runScout} disabled={isScouting} className="w-full bg-primary-600 hover:bg-primary-500 text-white border-0 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all rounded-xl text-xs font-semibold h-9">
              {isScouting ? 'Scanning Web...' : 'Run AI Scout →'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden z-10 relative">
        {/* Top Header */}
        <header className="h-16 glass-card border-b border-slate-800/50 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 sticky top-0 z-20 rounded-none">
          <div className="flex items-center flex-1">
            <button 
              className="lg:hidden mr-4 text-slate-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 max-w-2xl relative flex items-center hidden md:flex">
              <Search className="h-4 w-4 text-slate-500 absolute left-3" />
              <input 
                type="text" 
                placeholder="Search for internships, jobs, hackathons, competitions..." 
                className="w-full pl-9 pr-16 py-2 bg-slate-900/50 border border-slate-700 rounded-full text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-shadow text-white placeholder-slate-500 font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      window.location.href = `/opportunities?search=${encodeURIComponent(target.value.trim())}`;
                    }
                  }
                }}
              />
              <div className="absolute right-3 flex items-center space-x-1">
                <span className="text-[10px] font-semibold text-slate-500 bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded shadow-sm">Enter</span>
              </div>
            </div>
            
            {/* Mobile Header Title */}
            <div className="md:hidden flex items-center">
              <span className="text-lg font-bold text-white flex items-center gap-2">
                 <Bot className="h-5 w-5 text-primary-500" /> CareerScout
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-5 ml-4">
            <button className="text-slate-400 hover:text-white transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-accent-500 rounded-full border border-slate-900"></span>
            </button>
            <div className="h-6 w-[1px] bg-slate-700"></div>
            <div className="flex items-center cursor-pointer group">
              <div className="h-9 w-9 rounded-full bg-slate-800 flex items-center justify-center text-white font-bold border border-slate-600 shadow-inner mr-3 object-cover overflow-hidden">
                {profile?.personal?.profilePhoto ? (
                  <img src={profile.personal.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-primary-400">{fullName.charAt(0)}</span>
                )}
              </div>
              <div className="hidden md:block text-left mr-2">
                <p className="text-[13px] font-bold text-white leading-tight">{fullName}</p>
                <p className="text-[11px] font-medium text-slate-400">{profile?.education?.[0]?.institution || 'Student'}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar scroll-smooth">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col xl:flex-row gap-6 lg:gap-8">
            
            {/* Left/Main Column */}
            <div className="flex-1 flex flex-col space-y-6 lg:space-y-8 min-w-0 w-full overflow-hidden">
              
              {/* Mobile Search Bar */}
              <div className="md:hidden relative flex items-center w-full mb-2">
                <Search className="h-4 w-4 text-slate-500 absolute left-3" />
                <input 
                  type="text" 
                  placeholder="Search opportunities..." 
                  className="w-full pl-9 py-2 bg-slate-900/50 border border-slate-700 rounded-full text-[13px] focus:outline-none focus:ring-2 focus:ring-primary-500/50 text-white placeholder-slate-500 shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement;
                      if (target.value.trim()) {
                        window.location.href = `/opportunities?search=${encodeURIComponent(target.value.trim())}`;
                      }
                    }
                  }}
                />
              </div>

              {/* Hero Section */}
              <div className="glass-card rounded-3xl border-slate-800/50 shadow-2xl overflow-hidden relative flex flex-col sm:flex-row sm:items-center p-6 sm:px-8 sm:min-h-[190px]">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900/20 to-transparent z-0"></div>
                
                {/* Visual Image - optional, maybe omit or blend differently for dark mode */}
                <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-[55%] z-0 overflow-hidden opacity-30 mix-blend-screen filter grayscale contrast-125">
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent z-10 w-32 left-0"></div>
                  <img src={heroImg} alt="Campus" className="w-full h-full object-cover object-left" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                
                <div className="relative z-10 w-full sm:max-w-lg py-2 sm:py-6">
                  <p className="text-[13px] font-semibold text-primary-300 mb-1 tracking-wide">Good Afternoon, 👋</p>
                  <h2 className="text-[28px] sm:text-[32px] font-extrabold text-white mb-2 tracking-tight leading-none truncate">{firstName}</h2>
                  <p className="text-[13px] text-slate-400 mb-5 font-medium max-w-sm leading-relaxed">"The right opportunity can be the start of something amazing."</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.slice(0, 3).map((skill: any) => (
                        <span key={skill.name || skill} className="px-3 py-1.5 bg-slate-900/80 text-primary-300 rounded-full text-[11px] font-bold border border-primary-500/30 shadow-inner">{skill.name || skill}</span>
                      ))
                    ) : (
                      <span className="px-3 py-1.5 bg-slate-900/80 text-primary-300 rounded-full text-[11px] font-bold border border-primary-500/30 shadow-inner">Complete profile for tags</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-2xl border-slate-800/50 p-4 shadow-lg flex items-center hover:border-primary-500/50 hover:-translate-y-1 transition-all duration-300 cursor-default group">
                  <div className="w-12 h-12 bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-400 mr-4 border border-primary-500/20 shadow-inner group-hover:scale-110 transition-transform">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-semibold text-slate-400 mb-0.5">Saved</h3>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-xl font-bold text-white">{stats?.saved || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="glass-card rounded-2xl border-slate-800/50 p-4 shadow-lg flex items-center hover:border-green-500/50 hover:-translate-y-1 transition-all duration-300 cursor-default group">
                  <div className="w-12 h-12 bg-green-900/20 rounded-xl flex items-center justify-center text-green-400 mr-4 border border-green-500/20 shadow-inner group-hover:scale-110 transition-transform">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-semibold text-slate-400 mb-0.5">Applied</h3>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-xl font-bold text-white">{stats?.applied || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl border-slate-800/50 p-4 shadow-lg flex items-center hover:border-purple-500/50 hover:-translate-y-1 transition-all duration-300 cursor-default group">
                  <div className="w-12 h-12 bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-400 mr-4 border border-purple-500/20 shadow-inner group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-semibold text-slate-400 mb-0.5">Interviews</h3>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-xl font-bold text-white">{stats?.interviews || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="glass-card rounded-2xl border-slate-800/50 p-4 shadow-lg flex items-center hover:border-accent-500/50 hover:-translate-y-1 transition-all duration-300 cursor-default group">
                  <div className="w-12 h-12 bg-accent-900/20 rounded-xl flex items-center justify-center text-accent-400 mr-4 border border-accent-500/20 shadow-inner group-hover:scale-110 transition-transform">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-semibold text-slate-400 mb-0.5">Shortlisted</h3>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-xl font-bold text-white">{stats?.shortlisted || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Section Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-primary-900/30 border border-primary-500/30 flex items-center justify-center mr-3 flex-shrink-0 shadow-inner">
                    <Sparkles className="h-4 w-4 text-primary-400" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-white tracking-tight">Recommended for You</h2>
                    <p className="text-[12px] text-slate-400 font-medium line-clamp-1 sm:line-clamp-none">Opportunities picked based on your profile, skills and interests</p>
                  </div>
                </div>
                <div className="flex space-x-2 overflow-x-auto hide-scrollbar pb-1 md:pb-0 w-full md:w-auto">
                  {['All', 'Internships', 'Jobs', 'Hackathons', 'Competitions', 'Fellowships'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all border ${activeTab === tab ? 'bg-primary-600/20 text-white border-primary-500/50 shadow-[0_0_10px_rgba(99,102,241,0.2)]' : 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-white'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opportunity Cards */}
              <div className="space-y-4">
                {(!matches || matches.length === 0) ? (
                  <div className="p-8 text-center glass-card rounded-2xl border-slate-800/50">
                    <p className="text-slate-400 font-medium">No personalized opportunities yet. Complete your profile or run AI Scout.</p>
                  </div>
                ) : (
                  matches.map((match: any) => (
                    <OpportunityCard 
                      key={match._id}
                      logo={match.organization?.charAt(0) || 'C'}
                      title={match.title} 
                      company={match.organization} 
                      location={match.location || 'Remote'}
                      type={match.type || 'Job'} 
                      skills={match.skills?.slice(0, 4) || []} 
                      deadline={match.deadline ? `Apply by ${new Date(match.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Deadline not specified'} 
                      applicants={match.applicantsCount ? `${match.applicantsCount} applicants` : 'Applicants: N/A'} 
                      match={match.matchDetails?.score || 0} 
                      logoColor="bg-slate-800 border-slate-700"
                    />
                  ))
                )}
              </div>

              {/* Analytics Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-2 pb-8">
                {/* Opportunity Trends */}
                <div className="glass-card rounded-2xl border-slate-800/50 p-6 shadow-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[15px] font-bold text-white">Opportunity Trends</h3>
                    <div className="flex items-center text-[11px] font-semibold text-slate-400 bg-slate-900/50 border border-slate-700 rounded-md px-2.5 py-1 cursor-pointer hover:bg-slate-800 hover:text-white transition-colors">
                      Last 6 months <ChevronDown className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                  <div className="h-52 w-full relative -ml-4">
                    {trends && trends.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={finalChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }} />
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', backgroundColor: '#0f172a', border: '1px solid #1e293b', boxShadow: '0 4px 20px -1px rgb(0 0 0 / 0.5)', color: '#fff', fontSize: '12px', fontWeight: 500 }} itemStyle={{ color: '#e2e8f0' }} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 500, paddingTop: '15px', color: '#cbd5e1' }} />
                          <Line type="monotone" dataKey="Jobs" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6', strokeWidth: 2, stroke: '#0f172a' }} activeDot={{ r: 5 }} />
                          <Line type="monotone" dataKey="Internships" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#0f172a' }} />
                          <Line type="monotone" dataKey="Competitions" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3, fill: '#8b5cf6', strokeWidth: 2, stroke: '#0f172a' }} />
                          <Line type="monotone" dataKey="Hackathons" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b', strokeWidth: 2, stroke: '#0f172a' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-slate-500 text-sm font-medium">Not enough data yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* In-Demand Skills */}
                <div className="glass-card rounded-2xl border-slate-800/50 p-6 shadow-2xl flex flex-col h-full">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[15px] font-bold text-white">In-Demand Skills</h3>
                    <Link to="/opportunities" className="text-[12px] font-bold text-primary-400 hover:text-primary-300 flex items-center">
                      View all <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                    </Link>
                  </div>
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    {skillsData && skillsData.length > 0 ? (
                      skillsData.map((skill: any, i: number) => (
                        <SkillBar key={skill.name} name={skill.name} percent={skill.percent} color={['bg-blue-500', 'bg-green-500', 'bg-accent-500', 'bg-indigo-500', 'bg-red-400', 'bg-slate-400'][i % 6]} />
                      ))
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-slate-500 text-sm font-medium">No skill-demand data available yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-full xl:w-[320px] flex flex-col gap-6 flex-shrink-0">
              
              {/* Profile Completion */}
              <div className="glass-card rounded-2xl border-slate-800/50 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[15px] font-bold text-white">Profile Completion</h3>
                  <Link to="/profile" className="text-[12px] font-bold text-primary-400 hover:text-primary-300 flex items-center">
                    Edit Profile <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                  </Link>
                </div>
                
                <div className="flex items-center justify-center mb-6">
                  {/* Circular Progress Indicator */}
                  <div className="relative w-[130px] h-[130px] flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#1e293b" strokeWidth="12" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" strokeWidth="12" strokeDasharray="264" strokeDashoffset={264 - (264 * (completionData?.percentage || 0)) / 100} className="transition-all duration-1000 ease-out drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" strokeLinecap="round" />
                    </svg>
                    <div className="absolute text-[28px] font-extrabold text-white">{completionData?.percentage || 0}%</div>
                  </div>
                </div>

                <div className="space-y-2.5 mb-6 pl-1">
                  {['Basic Information', 'Education', 'Technical Skills', 'Experience', 'Career Goals', 'Preferred Location', 'Resume'].map((field) => (
                    <ProfileStep key={field} name={field} completed={!(completionData?.missingFields || []).includes(field)} />
                  ))}
                </div>

                {completionData?.percentage === 100 ? (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3.5 flex items-start mb-0">
                    <div className="mt-0.5 mr-2 flex-shrink-0">
                      <span className="flex h-5 w-5 rounded-full bg-green-500/20 items-center justify-center text-green-400">
                        <CheckCircle className="h-3 w-3" />
                      </span>
                    </div>
                    <p className="text-[12px] text-green-300 font-medium leading-relaxed pr-2">
                      Your profile is complete. You're ready for personalized opportunities.
                    </p>
                  </div>
                ) : (
                  <div className="bg-accent-500/10 border border-accent-500/20 rounded-xl p-3.5 flex items-start mb-0">
                    <div className="mt-0.5 mr-2 flex-shrink-0">
                      <span className="flex h-5 w-5 rounded-full bg-accent-500/20 items-center justify-center text-accent-400">
                        <Star className="h-3 w-3 fill-accent-400" />
                      </span>
                    </div>
                    <p className="text-[12px] text-accent-300 font-medium leading-relaxed pr-2">
                      Complete your profile to get more relevant opportunities.
                    </p>
                  </div>
                )}
              </div>

              {/* AI Scout Card */}
              <div className="glass-card rounded-2xl border-slate-800/50 p-6 shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-500/20 rounded-full blur-xl group-hover:bg-primary-500/30 transition-colors"></div>
                <div className="flex items-center justify-between mb-4 relative z-10">
                  <h3 className="text-[15px] font-bold text-white">AI Scout</h3>
                  <Link to="/assistant" className="text-[12px] font-bold text-primary-400 hover:text-primary-300">
                    How it works?
                  </Link>
                </div>
                
                <div className="flex items-center mb-5 relative z-10">
                  <div className="w-[52px] h-[52px] rounded-2xl bg-slate-900/80 flex items-center justify-center mr-4 border border-primary-500/30 shadow-inner flex-shrink-0">
                    <Bot className="h-[26px] w-[26px] text-primary-400" />
                  </div>
                  <p className="text-[12px] text-slate-400 font-medium leading-relaxed">
                    Status: <span className={`font-bold ${isScouting ? 'text-accent-400 animate-pulse' : 'text-primary-400'}`}>{scoutStatus?.status || 'Ready'}</span><br/>
                    Let AI find the best opportunities based on your profile, skills and goals.
                  </p>
                </div>

                <Button onClick={runScout} disabled={isScouting} className="w-full bg-primary-600 hover:bg-primary-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)] rounded-xl py-2 h-10 font-semibold text-[13px] mb-5 transition-all border-0 relative z-10">
                  {isScouting ? 'Scouting...' : 'Run AI Scout →'}
                </Button>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2 relative z-10">
                  <div className="flex items-center text-[11px] font-semibold text-slate-300 bg-slate-900/50 px-2 py-1.5 rounded-lg border border-slate-800">
                    <Sparkles className="h-3.5 w-3.5 text-green-400 mr-2" /> Personalized Results
                  </div>
                  <div className="flex items-center text-[11px] font-semibold text-slate-300 bg-slate-900/50 px-2 py-1.5 rounded-lg border border-slate-800">
                    <Heart className="h-3.5 w-3.5 text-accent-400 mr-2" /> Smart Matching
                  </div>
                  <div className="flex items-center text-[11px] font-semibold text-slate-300 bg-slate-900/50 px-2 py-1.5 rounded-lg border border-slate-800">
                    <Clock className="h-3.5 w-3.5 text-blue-400 mr-2" /> Daily Updates
                  </div>
                  <div className="flex items-center text-[11px] font-semibold text-slate-300 bg-slate-900/50 px-2 py-1.5 rounded-lg border border-slate-800">
                    <Navigation className="h-3.5 w-3.5 text-indigo-400 mr-2" /> Multiple Sources
                  </div>
                </div>
              </div>

              {/* Recent Opportunities */}
              <div className="glass-card rounded-2xl border-slate-800/50 p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[15px] font-bold text-white">Recent Opportunities</h3>
                  <Link to="/opportunities" className="text-[12px] font-bold text-primary-400 flex items-center hover:text-primary-300">
                    View all <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                  </Link>
                </div>
                
                <div className="space-y-5">
                  {recentOpportunities && recentOpportunities.length > 0 ? (
                    recentOpportunities.map((opp: any, i: number) => {
                      const colors = ['bg-green-500/20 text-green-400 border-green-500/30', 'bg-accent-500/20 text-accent-400 border-accent-500/30', 'bg-blue-500/20 text-blue-400 border-blue-500/30', 'bg-purple-500/20 text-purple-400 border-purple-500/30'];
                      return (
                        <RecentOpp 
                          key={opp._id}
                          logo={opp.organization?.charAt(0) || 'C'} 
                          bg={colors[i % colors.length]}
                          title={opp.title} 
                          company={opp.organization} 
                          type={opp.type || 'Job'}
                          tags={opp.skills?.slice(0, 2) || []} 
                          time={new Date(opp.postedAt).toLocaleDateString()} 
                        />
                      );
                    })
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-slate-500 text-sm font-medium">No recent opportunities found.</p>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      <ProfileCompletionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        completionPercentage={completionData?.percentage || 0}
        missingFields={completionData?.missingFields || []}
      />

      {/* Alert Modal */}
      {alertMessage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setAlertMessage(null)}></div>
          <div className="relative glass-card border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4 shadow-inner ${alertMessage.type === 'success' ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                {alertMessage.type === 'success' ? (
                  <CheckCircle className="h-6 w-6 text-green-400" />
                ) : (
                  <X className="h-6 w-6 text-red-400" />
                )}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-2">{alertMessage.title}</h3>
                <p className="text-sm text-slate-400">{alertMessage.message}</p>
              </div>
            </div>
            <div className="bg-slate-900/50 px-6 py-4 flex justify-center border-t border-slate-800">
              <Button onClick={() => setAlertMessage(null)} className="w-full font-bold bg-slate-800 hover:bg-slate-700 text-white border-0">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Subcomponents ---

const OpportunityCard = ({ logo, title, company, location, type, skills, deadline, applicants, match, logoColor }: any) => (
  <div className="glass-card rounded-2xl border-slate-800/50 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row gap-4 sm:gap-5 hover:border-primary-500/50 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] hover:-translate-y-1 transition-all duration-300 group w-full overflow-hidden">
    <div className="flex items-center sm:items-start gap-4">
      <div className={`w-12 h-12 ${logoColor} rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-inner border`}>
        {logo}
      </div>
      <div className="sm:hidden flex-1 min-w-0">
        <h3 className="text-[16px] font-bold text-white leading-tight mb-0.5 truncate group-hover:text-primary-400 transition-colors">{title}</h3>
        <p className="text-[13px] text-slate-400 font-medium truncate">{company} • {location}</p>
      </div>
    </div>

    <div className="flex-1 min-w-0 w-full">
      <div className="hidden sm:flex justify-between items-start mb-1.5">
        <div className="min-w-0 flex-1 pr-4">
          <h3 className="text-[16px] font-bold text-white leading-tight mb-1 truncate group-hover:text-primary-400 transition-colors">{title}</h3>
          <p className="text-[13px] text-slate-400 font-medium truncate">{company} • {location}</p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 font-bold px-2.5 py-0.5 rounded-full text-[11px] shadow-sm flex items-center">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> {match}% Match
          </Badge>
        </div>
      </div>
      
      {/* Mobile Match Badge */}
      <div className="sm:hidden mb-3">
        <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 font-bold px-2.5 py-0.5 rounded-full text-[11px] shadow-sm inline-flex items-center">
          <CheckCircle className="w-3.5 h-3.5 mr-1" /> {match}% Match
        </Badge>
      </div>
      
      <div className="flex flex-wrap gap-2 my-3">
        {skills.map((s: string) => (
          <span key={s} className="px-2.5 py-1 bg-slate-900/50 text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-700 truncate max-w-full">
            {s}
          </span>
        ))}
      </div>
      
      <div className="flex flex-col xs:flex-row flex-wrap text-[12px] font-medium text-slate-500 gap-y-2 gap-x-5 mt-1">
        <div className="flex items-center truncate"><Briefcase className="h-4 w-4 mr-1.5 flex-shrink-0 text-slate-600" /> {type}</div>
        <div className="flex items-center truncate"><Clock className="h-4 w-4 mr-1.5 flex-shrink-0 text-slate-600" /> {deadline}</div>
        <div className="flex items-center truncate"><Users className="h-4 w-4 mr-1.5 flex-shrink-0 text-slate-600" /> {applicants}</div>
      </div>
    </div>
    
    <div className="flex sm:flex-col justify-between items-end sm:border-l border-slate-800 sm:pl-5 min-w-0 sm:min-w-[130px] mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 w-full sm:w-auto">
      <button className="text-slate-600 hover:text-accent-400 transition-colors hidden sm:block p-1">
        <Bookmark className="h-5 w-5" />
      </button>
      <Button className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-200 rounded-xl shadow-[0_0_10px_rgba(255,255,255,0.1)] h-[38px] text-[13px] font-bold px-5 transition-all border-0">
        View Details →
      </Button>
    </div>
  </div>
);

const SkillBar = ({ name, percent, color }: any) => (
  <div className="flex items-center">
    <span className="w-7 h-7 bg-slate-800/80 rounded-lg flex items-center justify-center mr-3 border border-slate-700 flex-shrink-0 shadow-inner text-primary-400">
      <Star className="h-4 w-4" />
    </span>
    <div className="flex-1">
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-[13px] font-bold text-slate-200">{name}</span>
        <span className="text-[11px] font-bold text-slate-400">{percent}%</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden shadow-inner">
        <div className={`${color} h-1.5 rounded-full relative shadow-[0_0_10px_currentColor]`} style={{ width: `${percent}%` }}>
          <div className="absolute inset-0 bg-white/20"></div>
        </div>
      </div>
    </div>
  </div>
);

const ProfileStep = ({ name, completed }: any) => (
  <div className="flex items-center text-sm py-0.5">
    {completed ? (
      <div className="w-[18px] h-[18px] rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mr-3 flex-shrink-0">
        <CheckCircle className="h-3 w-3 text-green-400" />
      </div>
    ) : (
      <div className="w-[18px] h-[18px] rounded-full border border-slate-600 flex items-center justify-center mr-3 flex-shrink-0">
      </div>
    )}
    <span className={`text-[13px] font-semibold ${completed ? 'text-slate-200' : 'text-slate-500'}`}>{name}</span>
  </div>
);

const RecentOpp = ({ logo, bg, title, company, type, tags, time }: any) => (
  <div className="flex items-start group hover:bg-slate-900/30 p-2 -mx-2 rounded-xl transition-colors">
    <div className={`w-[38px] h-[38px] rounded-xl border flex items-center justify-center font-bold text-lg flex-shrink-0 mr-3.5 shadow-inner mt-0.5 ${bg}`}>
      {logo}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-[13px] font-bold text-white leading-tight truncate mb-1 group-hover:text-primary-400 transition-colors">{title}</h4>
      <p className="text-[11px] text-slate-400 mb-1.5 font-medium">{company} • {type}</p>
      <div className="flex items-center gap-1.5">
        {tags.map((t: string) => (
          <span key={t} className="text-[10px] px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-md shadow-sm">{t}</span>
        ))}
      </div>
    </div>
    <div className="flex flex-col items-end justify-between self-stretch py-0.5 pl-2">
      <button className="text-slate-600 hover:text-accent-400 transition-colors">
        <Bookmark className="h-4 w-4" />
      </button>
      <span className="text-[10px] text-slate-500 font-semibold">{time}</span>
    </div>
  </div>
);
