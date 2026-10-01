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

  const firstName = profile?.fullName?.split(' ')[0] || 'there';
  const fullName = profile?.fullName || 'User';

  const defaultChartData = [
    { name: 'Apr', Jobs: 0, Internships: 0, Competitions: 0, Hackathons: 0 },
  ];
  const finalChartData = (trends && trends.length > 0) ? trends : defaultChartData;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-gray-900 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden backdrop-blur-sm" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-100 flex flex-col flex-shrink-0 h-screen transition-transform duration-300 ease-in-out lg:transform-none ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-50 pt-2 pb-2">
          <div className="flex items-center">
            <img src="/branding/careerscout-logo.png" alt="CareerScout AI" className="h-8 w-auto object-contain" />
          </div>
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto hide-scrollbar">
          <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl bg-blue-50 text-blue-700 mb-1 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)]">
            <LayoutDashboard className="h-4 w-4 mr-3 text-blue-600" /> Dashboard
          </Link>
          <Link to="/opportunities" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors">
            <Search className="h-4 w-4 mr-3 text-gray-400" /> Opportunities
          </Link>
          <Link to="/applications" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors">
            <CheckCircle className="h-4 w-4 mr-3 text-gray-400" /> Applications
          </Link>
          <Link to="/assistant" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors">
            <Bot className="h-4 w-4 mr-3 text-gray-400" /> AI Scout
          </Link>
          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors">
            <FileText className="h-4 w-4 mr-3 text-gray-400" /> Resume
          </Link>
          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors">
            <User className="h-4 w-4 mr-3 text-gray-400" /> Profile
          </Link>
          <Link to="/opportunities" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors mt-2">
            <BookOpen className="h-4 w-4 mr-3 text-gray-400" /> Learning Hub
          </Link>
          <Link to="/opportunities" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors">
            <Folder className="h-4 w-4 mr-3 text-gray-400" /> Resources
          </Link>
          <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors mt-2">
            <PieChart className="h-4 w-4 mr-3 text-gray-400" /> Analytics
          </Link>
          <Link to="/settings" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors">
            <Settings className="h-4 w-4 mr-3 text-gray-400" /> Settings
          </Link>
        </nav>

        {/* Sidebar Bottom Card */}
        <div className="p-5 mx-4 mb-6 mt-auto bg-gradient-to-br from-[#1E3A8A] to-[#312E81] rounded-2xl text-white relative overflow-hidden shadow-lg shadow-blue-900/20">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-10 -mb-10 pointer-events-none" />
          <div className="relative z-10">
            <h4 className="font-semibold text-[14px] leading-tight mb-2 text-white">Find Opportunities<br/>Built for Your Future</h4>
            <p className="text-[11px] text-blue-100 mb-4 font-light leading-relaxed">AI-powered recommendations<br/>for students and early careers.</p>
            <Button onClick={runScout} disabled={isScouting} className="w-full bg-[#3B82F6] hover:bg-blue-500 text-white border-0 shadow-sm transition-colors rounded-xl text-xs font-semibold h-9">
              {isScouting ? 'Scanning...' : 'Run AI Scout →'}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 lg:px-8 flex-shrink-0 sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          <div className="flex items-center flex-1">
            <button 
              className="lg:hidden mr-4 text-gray-500 hover:text-gray-700"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex-1 max-w-2xl relative flex items-center hidden md:flex">
              <Search className="h-4 w-4 text-gray-400 absolute left-3" />
              <input 
                type="text" 
                placeholder="Search for internships, jobs, hackathons, competitions..." 
                className="w-full pl-9 pr-16 py-2 bg-gray-50/50 border border-gray-200 rounded-full text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-shadow text-gray-700 placeholder-gray-400 font-medium"
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
                <span className="text-[10px] font-semibold text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm">Enter</span>
              </div>
            </div>
            
            {/* Mobile Header Title */}
            <div className="md:hidden flex items-center">
              <img src="/branding/careerscout-logo.png" alt="CareerScout AI" className="h-6 w-auto object-contain" />
            </div>
          </div>
          
          <div className="flex items-center space-x-5 ml-4">
            <button className="text-gray-400 hover:text-gray-600 transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="h-6 w-[1px] bg-gray-200"></div>
            <div className="flex items-center cursor-pointer group">
              <div className="h-9 w-9 rounded-full bg-[#1E3A8A] flex items-center justify-center text-white font-bold border border-blue-200 shadow-sm mr-3 object-cover overflow-hidden">
                {profile?.personal?.profilePhoto ? (
                  <img src={profile.personal.profilePhoto} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold">{fullName.charAt(0)}</span>
                )}
              </div>
              <div className="hidden md:block text-left mr-2">
                <p className="text-[13px] font-bold text-gray-900 leading-tight">{fullName}</p>
                <p className="text-[11px] font-medium text-gray-500">{profile?.education?.[0]?.institution || 'Student'}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar scroll-smooth">
          <div className="max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 flex flex-col xl:flex-row gap-6 lg:gap-8">
            
            {/* Left/Main Column */}
            <div className="flex-1 flex flex-col space-y-6 lg:space-y-8 min-w-0 w-full overflow-hidden">
              
              {/* Mobile Search Bar (shows only below md) */}
              <div className="md:hidden relative flex items-center w-full mb-2">
                <Search className="h-4 w-4 text-gray-400 absolute left-3" />
                <input 
                  type="text" 
                  placeholder="Search opportunities..." 
                  className="w-full pl-9 py-2 bg-white border border-gray-200 rounded-full text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 shadow-sm"
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
              <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden relative flex flex-col sm:flex-row sm:items-center p-6 sm:px-8 sm:min-h-[190px]">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/90 to-transparent z-0"></div>
                
                {/* Visual Image */}
                <div className="hidden sm:block absolute right-0 top-0 bottom-0 w-[55%] z-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#eff6ff] via-transparent to-transparent z-10 w-32 left-0"></div>
                  <img src={heroImg} alt="Campus" className="w-full h-full object-cover opacity-90 object-left mix-blend-multiply" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                
                <div className="relative z-10 w-full sm:max-w-lg py-2 sm:py-6">
                  <p className="text-[13px] font-semibold text-gray-600 mb-1 tracking-wide">Good Afternoon, 👋</p>
                  <h2 className="text-[28px] sm:text-[32px] font-extrabold text-gray-900 mb-2 tracking-tight leading-none truncate">{firstName} <span className="inline-block animate-wave">👋</span></h2>
                  <p className="text-[13px] text-gray-600 mb-5 font-medium max-w-sm leading-relaxed">"The right opportunity can be the start of something amazing."</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills && profile.skills.length > 0 ? (
                      profile.skills.slice(0, 3).map((skill: string) => (
                        <span key={skill} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold border border-blue-200/50 shadow-sm">{skill}</span>
                      ))
                    ) : (
                      <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold border border-blue-200/50 shadow-sm">Complete profile for tags</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex items-center hover:border-blue-200 transition-colors cursor-default">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 mr-4 border border-blue-100/50">
                    <Briefcase className="h-5 w-5 fill-blue-100" />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-semibold text-gray-500 mb-0.5">Saved</h3>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-xl font-bold text-gray-900">{stats?.saved || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex items-center hover:border-green-200 transition-colors cursor-default">
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500 mr-4 border border-green-100/50">
                    <FileText className="h-5 w-5 fill-green-100" />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-semibold text-gray-500 mb-0.5">Applied</h3>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-xl font-bold text-gray-900">{stats?.applied || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex items-center hover:border-purple-200 transition-colors cursor-default">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-500 mr-4 border border-purple-100/50">
                    <Users className="h-5 w-5 fill-purple-100" />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-semibold text-gray-500 mb-0.5">Interviews</h3>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-xl font-bold text-gray-900">{stats?.interviews || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex items-center hover:border-orange-200 transition-colors cursor-default">
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 mr-4 border border-orange-100/50">
                    <Trophy className="h-5 w-5 fill-orange-100" />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-semibold text-gray-500 mb-0.5">Shortlisted</h3>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-xl font-bold text-gray-900">{stats?.shortlisted || 0}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Section Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Recommended for You</h2>
                    <p className="text-[12px] text-gray-500 font-medium line-clamp-1 sm:line-clamp-none">Opportunities picked based on your profile, skills and interests</p>
                  </div>
                </div>
                <div className="flex space-x-1.5 overflow-x-auto hide-scrollbar pb-1 md:pb-0 w-full md:w-auto">
                  {['All', 'Internships', 'Jobs', 'Hackathons', 'Competitions', 'Fellowships'].map(tab => (
                    <button 
                      key={tab} 
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-1.5 rounded-full text-[12px] font-bold transition-all border ${activeTab === tab ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opportunity Cards */}
              <div className="space-y-4">
                {(!matches || matches.length === 0) ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-gray-500 font-medium">No personalized opportunities yet. Complete your profile or run AI Scout.</p>
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
                      logoColor="bg-blue-600"
                    />
                  ))
                )}
              </div>

              {/* Analytics Section */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-2 pb-8">
                {/* Opportunity Trends */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[15px] font-bold text-gray-900">Opportunity Trends</h3>
                    <div className="flex items-center text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1 cursor-pointer hover:bg-gray-100 transition-colors">
                      Last 6 months <ChevronDown className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                  <div className="h-52 w-full relative -ml-4">
                    {trends && trends.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={finalChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} />
                          <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '12px', fontWeight: 500 }} />
                          <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 500, paddingTop: '15px' }} />
                          <Line type="monotone" dataKey="Jobs" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3, fill: '#0ea5e9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
                          <Line type="monotone" dataKey="Internships" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }} />
                          <Line type="monotone" dataKey="Competitions" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7', strokeWidth: 2, stroke: '#fff' }} />
                          <Line type="monotone" dataKey="Hackathons" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-gray-400 text-sm font-medium">Not enough data yet.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* In-Demand Skills */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex flex-col h-full">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-[15px] font-bold text-gray-900">In-Demand Skills</h3>
                    <Link to="/opportunities" className="text-[12px] font-bold text-blue-600 hover:text-blue-700 flex items-center">
                      View all <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                    </Link>
                  </div>
                  <div className="space-y-4 flex-1 flex flex-col justify-between">
                    {skillsData && skillsData.length > 0 ? (
                      skillsData.map((skill: any, i: number) => (
                        <SkillBar key={skill.name} name={skill.name} percent={skill.percent} color={['bg-blue-600', 'bg-green-500', 'bg-yellow-400', 'bg-blue-400', 'bg-red-400', 'bg-gray-400'][i % 6]} />
                      ))
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-gray-400 text-sm font-medium">No skill-demand data available yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-full xl:w-[320px] flex flex-col gap-6 flex-shrink-0">
              
              {/* Profile Completion */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[15px] font-bold text-gray-900">Profile Completion</h3>
                  <Link to="/profile" className="text-[12px] font-bold text-blue-600 flex items-center">
                    Edit Profile <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                  </Link>
                </div>
                
                <div className="flex items-center justify-center mb-6">
                  {/* Circular Progress Indicator */}
                  <div className="relative w-[130px] h-[130px] flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="12" />
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="264" strokeDashoffset={264 - (264 * (completionData?.percentage || 0)) / 100} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                    </svg>
                    <div className="absolute text-[28px] font-extrabold text-gray-900">{completionData?.percentage || 0}%</div>
                  </div>
                </div>

                <div className="space-y-2.5 mb-6 pl-1">
                  {['Basic Information', 'Education', 'Technical Skills', 'Experience', 'Career Goals', 'Preferred Location', 'Resume'].map((field) => (
                    <ProfileStep key={field} name={field} completed={!(completionData?.missingFields || []).includes(field)} />
                  ))}
                </div>

                {completionData?.percentage === 100 ? (
                  <div className="bg-green-50 rounded-xl p-3.5 flex items-start mb-0">
                    <div className="mt-0.5 mr-2">
                      <span className="flex h-5 w-5 rounded-full bg-green-100 items-center justify-center text-green-600">
                        <CheckCircle className="h-3 w-3 fill-green-600 text-white" />
                      </span>
                    </div>
                    <p className="text-[12px] text-green-900 font-medium leading-relaxed pr-2">
                      Your profile is complete. You're ready for personalized opportunities.
                    </p>
                  </div>
                ) : (
                  <div className="bg-amber-50 rounded-xl p-3.5 flex items-start mb-0">
                    <div className="mt-0.5 mr-2">
                      <span className="flex h-5 w-5 rounded-full bg-amber-100 items-center justify-center text-amber-500">
                        <Star className="h-3 w-3 fill-amber-500" />
                      </span>
                    </div>
                    <p className="text-[12px] text-amber-900 font-medium leading-relaxed pr-2">
                      Complete your profile to get more relevant opportunities.
                    </p>
                  </div>
                )}
              </div>

              {/* AI Scout Card */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[15px] font-bold text-gray-900">AI Scout</h3>
                  <Link to="/assistant" className="text-[12px] font-bold text-blue-600 hover:underline">
                    How it works?
                  </Link>
                </div>
                
                <div className="flex items-center mb-5">
                  <div className="w-[52px] h-[52px] rounded-2xl bg-blue-50 flex items-center justify-center mr-4 border border-blue-100/50 flex-shrink-0">
                    <Bot className="h-[26px] w-[26px] text-blue-600" />
                  </div>
                  <p className="text-[12px] text-gray-600 font-medium leading-relaxed">
                    Status: <span className="font-bold text-blue-600">{scoutStatus?.status || 'Ready'}</span><br/>
                    Let AI find the best opportunities based on your profile, skills and goals.
                  </p>
                </div>

                <Button onClick={runScout} disabled={isScouting} className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm rounded-xl py-2 h-10 font-semibold text-[13px] mb-5 transition-colors border-0">
                  {isScouting ? 'Scouting...' : 'Run AI Scout →'}
                </Button>

                <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                  <div className="flex items-center text-[11px] font-semibold text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                    <Sparkles className="h-3.5 w-3.5 text-green-500 mr-2" /> Personalized Results
                  </div>
                  <div className="flex items-center text-[11px] font-semibold text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                    <Heart className="h-3.5 w-3.5 text-purple-500 mr-2" /> Smart Matching
                  </div>
                  <div className="flex items-center text-[11px] font-semibold text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                    <Clock className="h-3.5 w-3.5 text-blue-500 mr-2" /> Daily Updates
                  </div>
                  <div className="flex items-center text-[11px] font-semibold text-gray-600 bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                    <Navigation className="h-3.5 w-3.5 text-indigo-500 mr-2" /> Multiple Sources
                  </div>
                </div>
              </div>

              {/* Recent Opportunities */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-[15px] font-bold text-gray-900">Recent Opportunities</h3>
                  <Link to="/opportunities" className="text-[12px] font-bold text-blue-600 flex items-center">
                    View all <ArrowRight className="h-3.5 w-3.5 ml-0.5" />
                  </Link>
                </div>
                
                <div className="space-y-5">
                  {recentOpportunities && recentOpportunities.length > 0 ? (
                    recentOpportunities.map((opp: any, i: number) => {
                      const colors = ['bg-[#76B900]', 'bg-[#EA4335]', 'bg-[#00A4EF]', 'bg-[#FF0000]'];
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
                      <p className="text-gray-400 text-sm font-medium">No recent opportunities found.</p>
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
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setAlertMessage(null)}></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full mb-4 ${alertMessage.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                {alertMessage.type === 'success' ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <X className="h-6 w-6 text-red-600" />
                )}
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{alertMessage.title}</h3>
                <p className="text-sm text-gray-500">{alertMessage.message}</p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-center">
              <Button onClick={() => setAlertMessage(null)} className="w-full font-bold">
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
  <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row gap-4 sm:gap-5 hover:border-blue-200 hover:shadow-lg transition-all duration-200 group w-full overflow-hidden">
    <div className="flex items-center sm:items-start gap-4">
      <div className={`w-12 h-12 ${logoColor} rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-sm`}>
        {logo}
      </div>
      <div className="sm:hidden flex-1 min-w-0">
        <h3 className="text-[16px] font-bold text-gray-900 leading-tight mb-0.5 truncate">{title}</h3>
        <p className="text-[13px] text-gray-500 font-medium truncate">{company} • {location}</p>
      </div>
    </div>

    <div className="flex-1 min-w-0 w-full">
      <div className="hidden sm:flex justify-between items-start mb-1.5">
        <div className="min-w-0 flex-1 pr-4">
          <h3 className="text-[16px] font-bold text-gray-900 leading-tight mb-1 truncate">{title}</h3>
          <p className="text-[13px] text-gray-500 font-medium truncate">{company} • {location}</p>
        </div>
        <div className="flex items-center space-x-2 flex-shrink-0">
          <Badge className="bg-green-50 text-green-700 border border-green-200 font-bold px-2.5 py-0.5 rounded-full text-[11px] shadow-sm flex items-center">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> {match}% Match
          </Badge>
        </div>
      </div>
      
      {/* Mobile Match Badge */}
      <div className="sm:hidden mb-3">
        <Badge className="bg-green-50 text-green-700 border border-green-200 font-bold px-2.5 py-0.5 rounded-full text-[11px] shadow-sm inline-flex items-center">
          <CheckCircle className="w-3.5 h-3.5 mr-1" /> {match}% Match
        </Badge>
      </div>
      
      <div className="flex flex-wrap gap-2 my-3">
        {skills.map((s: string) => (
          <span key={s} className="px-2.5 py-1 bg-gray-50 text-blue-700 rounded-lg text-[11px] font-semibold border border-gray-100 truncate max-w-full">
            {s}
          </span>
        ))}
      </div>
      
      <div className="flex flex-col xs:flex-row flex-wrap text-[12px] font-medium text-gray-500 gap-y-2 gap-x-5 mt-1">
        <div className="flex items-center truncate"><Briefcase className="h-4 w-4 mr-1.5 flex-shrink-0" /> {type}</div>
        <div className="flex items-center truncate"><Clock className="h-4 w-4 mr-1.5 flex-shrink-0" /> {deadline}</div>
        <div className="flex items-center truncate"><Users className="h-4 w-4 mr-1.5 flex-shrink-0" /> {applicants}</div>
      </div>
    </div>
    
    <div className="flex sm:flex-col justify-between items-end sm:border-l border-gray-100 sm:pl-5 min-w-0 sm:min-w-[130px] mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 w-full sm:w-auto">
      <button className="text-gray-300 hover:text-blue-600 transition-colors hidden sm:block p-1">
        <Bookmark className="h-5 w-5" />
      </button>
      <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm h-[38px] text-[13px] font-semibold px-5 transition-colors border-0">
        View Details →
      </Button>
    </div>
  </div>
);

const SkillBar = ({ name, percent, color }: any) => (
  <div className="flex items-center">
    <span className="w-7 h-7 bg-white rounded-lg flex items-center justify-center mr-3 border border-gray-100 flex-shrink-0 shadow-sm text-gray-500">
      <Star className="h-4 w-4" />
    </span>
    <div className="flex-1">
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-[13px] font-bold text-gray-800">{name}</span>
        <span className="text-[11px] font-bold text-gray-500">{percent}%</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div className={`${color} h-1.5 rounded-full relative`} style={{ width: `${percent}%` }}>
          <div className="absolute inset-0 bg-white/20"></div>
        </div>
      </div>
    </div>
  </div>
);

const ProfileStep = ({ name, completed }: any) => (
  <div className="flex items-center text-sm py-0.5">
    {completed ? (
      <div className="w-[18px] h-[18px] rounded-full bg-green-500 flex items-center justify-center mr-3 flex-shrink-0">
        <CheckCircle className="h-3 w-3 text-white" />
      </div>
    ) : (
      <div className="w-[18px] h-[18px] rounded-full border-2 border-gray-200 flex items-center justify-center mr-3 flex-shrink-0">
      </div>
    )}
    <span className={`text-[13px] font-semibold ${completed ? 'text-gray-900' : 'text-gray-400'}`}>{name}</span>
  </div>
);

const RecentOpp = ({ logo, bg, title, company, type, tags, time }: any) => (
  <div className="flex items-start group">
    <div className={`w-[38px] h-[38px] rounded-xl ${bg} flex items-center justify-center text-white font-bold text-lg flex-shrink-0 mr-3.5 shadow-sm mt-0.5`}>
      {logo}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="text-[13px] font-bold text-gray-900 leading-tight truncate mb-1">{title}</h4>
      <p className="text-[11px] text-gray-500 mb-1.5 font-medium">{company} • {type}</p>
      <div className="flex items-center gap-1.5">
        {tags.map((t: string) => (
          <span key={t} className="text-[10px] px-2 py-0.5 bg-gray-50 border border-gray-100 text-blue-700 font-semibold rounded-md shadow-sm">{t}</span>
        ))}
      </div>
    </div>
    <div className="flex flex-col items-end justify-between self-stretch py-0.5">
      <button className="text-gray-300 hover:text-blue-500 transition-colors">
        <Bookmark className="h-4 w-4" />
      </button>
      <span className="text-[10px] text-gray-400 font-semibold">{time}</span>
    </div>
  </div>
);
