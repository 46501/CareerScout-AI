import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  GraduationCap, LayoutDashboard, Search, FileText, Bot, User, 
  BookOpen, Folder, PieChart, Settings, Bell, ChevronDown, 
  Briefcase, Bookmark, Users, 
  ArrowRight, Sparkles, Trophy, CheckCircle, 
  Star, Heart, Navigation, Clock
} from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import api from '../lib/api';
import heroImg from '../assets/hero.png';
import { ProfileCompletionModal } from './ui/ProfileCompletionModal';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';

export const Dashboard = () => {
  
  // Using static for now to match the screenshot, but keeping the actual user values for structure
  const [stats] = useState({ saved: 12, applied: 5, interviews: 2, shortlisted: 1 });
  const [matches, setMatches] = useState<any[]>([]);
  const [completionData, setCompletionData] = useState<{ percentage: number, missingFields: string[], isComplete?: boolean } | null>(null);
  const [isScouting, setIsScouting] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [oppsRes, compRes] = await Promise.all([
          api.get('/opportunities?filter=recommended&limit=5'),
          api.get('/profile/completion')
        ]);
        if (oppsRes.data?.data) {
          setMatches(oppsRes.data.data);
        }
        if (compRes.data?.success) {
          setCompletionData(compRes.data.data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchDashboardData();
  }, []);

  const runScout = async () => {
    if (completionData && completionData.percentage < 100) {
      setIsModalOpen(true);
      return;
    }
    
    try {
      setIsScouting(true);
      const res = await api.post('/scout/run');
      // Only alert if we successfully run scout (though toast would be better, requirement was specifically profile-completion alerts)
      if (res.data?.message) {
        alert(res.data.message);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.error?.message;
      if (errMsg && errMsg.toLowerCase().includes('profile must be 100% complete')) {
        setIsModalOpen(true);
      } else {
        alert(errMsg || 'Failed to run scout');
      }
    } finally {
      setIsScouting(false);
    }
  };

  const chartData = [
    { name: 'Apr', Jobs: 40, Internships: 24, Competitions: 24, Hackathons: 20 },
    { name: 'May', Jobs: 30, Internships: 13, Competitions: 22, Hackathons: 20 },
    { name: 'Jun', Jobs: 20, Internships: 48, Competitions: 22, Hackathons: 20 },
    { name: 'Jul', Jobs: 27, Internships: 39, Competitions: 20, Hackathons: 20 },
    { name: 'Aug', Jobs: 18, Internships: 48, Competitions: 21, Hackathons: 20 },
    { name: 'Sep', Jobs: 23, Internships: 38, Competitions: 25, Hackathons: 20 },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-gray-900">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col flex-shrink-0 relative h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b border-gray-50 pt-2 pb-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3 shadow-sm">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-[17px] font-bold text-gray-900 leading-none block tracking-tight">CareerScout AI</span>
            <span className="text-[10px] text-gray-500 font-medium">Discover • Prepare • Grow</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto hide-scrollbar">
          <Link to="/dashboard" className="flex items-center px-3 py-2.5 text-sm font-semibold rounded-xl bg-blue-50 text-blue-700 mb-1 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.1)]">
            <LayoutDashboard className="h-4 w-4 mr-3 text-blue-600" /> Dashboard
          </Link>
          <Link to="/opportunities" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors">
            <Search className="h-4 w-4 mr-3 text-gray-400" /> Opportunities
          </Link>
          <Link to="/applications" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors">
            <CheckCircle className="h-4 w-4 mr-3 text-gray-400" /> Applications
          </Link>
          <Link to="/assistant" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors">
            <Bot className="h-4 w-4 mr-3 text-gray-400" /> AI Scout
          </Link>
          <Link to="/profile" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors">
            <FileText className="h-4 w-4 mr-3 text-gray-400" /> Resume
          </Link>
          <Link to="/profile" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors">
            <User className="h-4 w-4 mr-3 text-gray-400" /> Profile
          </Link>
          <Link to="/opportunities" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors mt-2">
            <BookOpen className="h-4 w-4 mr-3 text-gray-400" /> Learning Hub
          </Link>
          <Link to="/opportunities" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors">
            <Folder className="h-4 w-4 mr-3 text-gray-400" /> Resources
          </Link>
          <Link to="/dashboard" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors mt-2">
            <PieChart className="h-4 w-4 mr-3 text-gray-400" /> Analytics
          </Link>
          <Link to="/settings" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-gray-50 hover:text-gray-900 mb-1 transition-colors">
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
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 lg:px-8 flex-shrink-0 sticky top-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
          <div className="flex-1 max-w-2xl relative flex items-center">
            <Search className="h-4 w-4 text-gray-400 absolute left-3" />
            <input 
              type="text" 
              placeholder="Search for internships, jobs, hackathons, competitions..." 
              className="w-full pl-9 pr-16 py-2 bg-gray-50/50 border border-gray-200 rounded-full text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-shadow text-gray-700 placeholder-gray-400 font-medium"
            />
            <div className="absolute right-3 flex items-center space-x-1">
              <span className="text-[10px] font-semibold text-gray-400 bg-white border border-gray-200 px-1.5 py-0.5 rounded shadow-sm">Ctrl K</span>
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
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="h-full w-full object-cover" />
              </div>
              <div className="hidden md:block text-left mr-2">
                <p className="text-[13px] font-bold text-gray-900 leading-tight">Om Kulkarni</p>
                <p className="text-[11px] font-medium text-gray-500">Student • LPU</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar scroll-smooth">
          <div className="max-w-[1400px] mx-auto p-6 lg:p-8 flex flex-col xl:flex-row gap-8">
            
            {/* Left/Main Column */}
            <div className="flex-1 flex flex-col space-y-8 min-w-0">
              
              {/* Hero Section */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden relative min-h-[190px] flex items-center px-8">
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/90 to-transparent z-0"></div>
                
                {/* Visual Image */}
                <div className="absolute right-0 top-0 bottom-0 w-[55%] z-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#eff6ff] via-transparent to-transparent z-10 w-32 left-0"></div>
                  <img src={heroImg} alt="Campus" className="w-full h-full object-cover opacity-90 object-left mix-blend-multiply" onError={(e) => e.currentTarget.style.display = 'none'} />
                </div>
                
                <div className="relative z-10 max-w-lg py-6">
                  <p className="text-[13px] font-semibold text-gray-600 mb-1 tracking-wide">Good Afternoon, 👋</p>
                  <h2 className="text-[32px] font-extrabold text-gray-900 mb-2 tracking-tight leading-none">Om Kulkarni <span className="inline-block animate-wave">👋</span></h2>
                  <p className="text-[13px] text-gray-600 mb-5 font-medium max-w-sm leading-relaxed">"The right opportunity can be the start of something amazing."</p>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold border border-blue-200/50 shadow-sm">AI/ML Enthusiast</span>
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold border border-blue-200/50 shadow-sm">Full Stack Developer</span>
                    <span className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold border border-blue-200/50 shadow-sm">LPU CSE 2024–28</span>
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex items-center hover:border-blue-200 transition-colors cursor-default">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 mr-4 border border-blue-100/50">
                    <Briefcase className="h-5 w-5 fill-blue-100" />
                  </div>
                  <div>
                    <h3 className="text-[12px] font-semibold text-gray-500 mb-0.5">Saved</h3>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-xl font-bold text-gray-900">{stats.saved}</p>
                      <span className="text-[10px] font-bold text-green-500 bg-green-50 px-1.5 py-0.5 rounded">↑ 3 this week</span>
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
                      <p className="text-xl font-bold text-gray-900">{stats.applied}</p>
                      <span className="text-[10px] font-bold text-green-500 bg-green-50 px-1.5 py-0.5 rounded">↑ 2 this week</span>
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
                      <p className="text-xl font-bold text-gray-900">{stats.interviews}</p>
                      <span className="text-[10px] font-bold text-green-500 bg-green-50 px-1.5 py-0.5 rounded">↑ 1 this week</span>
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
                      <p className="text-xl font-bold text-gray-900">{stats.shortlisted}</p>
                      <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">Great job!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommended Section Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">Recommended for You</h2>
                    <p className="text-[12px] text-gray-500 font-medium">Opportunities picked based on your profile, skills and interests</p>
                  </div>
                </div>
                <div className="flex space-x-1.5 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
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
                {matches.length === 0 ? (
                  // Fallback Mock Data matching screenshot if backend empty
                  <>
                    <OpportunityCard 
                      logo="N"
                      title="Research Intern (AI/ML)" 
                      company="NVIDIA" 
                      location="Bengaluru, India"
                      type="Internship" 
                      skills={['Python', 'Machine Learning', 'Deep Learning', 'Research']} 
                      deadline="Apply by 15 Oct 2026" 
                      applicants="320 applicants" 
                      match="95" 
                      logoColor="bg-[#76B900]"
                    />
                    <OpportunityCard 
                      logo="G"
                      title="Software Engineering Intern" 
                      company="Google" 
                      location="Bengaluru, India"
                      type="Internship" 
                      skills={['JavaScript', 'React', 'Node.js', 'System Design']} 
                      deadline="Apply by 10 Oct 2026" 
                      applicants="1.2k applicants" 
                      match="92" 
                      logoColor="bg-[#EA4335]"
                    />
                    <OpportunityCard 
                      logo="M"
                      title="AI Research Intern" 
                      company="Microsoft" 
                      location="Hyderabad, India"
                      type="Internship" 
                      skills={['Python', 'NLP', 'LLMs', 'Data Analysis']} 
                      deadline="Apply by 30 Sep 2026" 
                      applicants="2.4k applicants" 
                      match="88" 
                      logoColor="bg-[#00A4EF]"
                    />
                  </>
                ) : (
                  matches.map(match => (
                    <OpportunityCard 
                      key={match._id}
                      logo={match.organization?.charAt(0) || 'C'}
                      title={match.title} 
                      company={match.organization} 
                      location={match.location || 'Remote'}
                      type={match.type || 'Internship'} 
                      skills={match.skills?.slice(0, 4) || []} 
                      deadline={`Apply by ${new Date(match.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`} 
                      applicants="Be the first" 
                      match={match.matchDetails?.score || 85} 
                      logoColor="bg-blue-600"
                    />
                  ))
                )}
              </div>

              {/* Analytics Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 pb-8">
                {/* Opportunity Trends */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[15px] font-bold text-gray-900">Opportunity Trends</h3>
                    <div className="flex items-center text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-md px-2.5 py-1 cursor-pointer hover:bg-gray-100 transition-colors">
                      Last 6 months <ChevronDown className="h-3 w-3 ml-1" />
                    </div>
                  </div>
                  <div className="h-52 w-full relative -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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
                    <SkillBar name="Python" percent={90} color="bg-blue-600" />
                    <SkillBar name="Machine Learning" percent={85} color="bg-green-500" />
                    <SkillBar name="JavaScript" percent={72} color="bg-yellow-400" />
                    <SkillBar name="React" percent={68} color="bg-blue-400" />
                    <SkillBar name="System Design" percent={60} color="bg-red-400" />
                    <SkillBar name="SQL" percent={55} color="bg-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-full xl:w-[320px] flex-shrink-0 space-y-6">
              
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
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#22c55e" strokeWidth="12" strokeDasharray="264" strokeDashoffset={264 - (264 * (completionData?.percentage || 72)) / 100} className="transition-all duration-1000 ease-out" strokeLinecap="round" />
                    </svg>
                    <div className="absolute text-[28px] font-extrabold text-gray-900">{completionData?.percentage || 72}%</div>
                  </div>
                </div>

                <div className="space-y-2.5 mb-6 pl-1">
                  <ProfileStep name="Basic Information" completed={true} />
                  <ProfileStep name="Education" completed={true} />
                  <ProfileStep name="Technical Skills" completed={true} />
                  <ProfileStep name="Experience" completed={true} />
                  <ProfileStep name="Career Goals" completed={false} />
                  <ProfileStep name="Preferred Location" completed={false} />
                  <ProfileStep name="Resume" completed={false} />
                </div>

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
                  <RecentOpp 
                    logo="N" bg="bg-[#76B900]"
                    title="Research Intern (AI/ML)" 
                    company="NVIDIA" type="Internship"
                    tags={['Remote', 'AI/ML']} 
                    time="2 hours ago" 
                  />
                  <RecentOpp 
                    logo="G" bg="bg-[#EA4335]"
                    title="Software Engineering Intern" 
                    company="Google" type="Internship"
                    tags={['On-site', 'SDE']} 
                    time="5 hours ago" 
                  />
                  <RecentOpp 
                    logo="M" bg="bg-[#00A4EF]"
                    title="AI Research Intern" 
                    company="Microsoft" type="Internship"
                    tags={['Hybrid', 'Research']} 
                    time="1 day ago" 
                  />
                  <RecentOpp 
                    logo="A" bg="bg-[#FF0000]"
                    title="ML Engineer Intern" 
                    company="Adobe" type="Internship"
                    tags={['On-site', 'ML']} 
                    time="1 day ago" 
                  />
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
    </div>
  );
};

// --- Subcomponents ---

const OpportunityCard = ({ logo, title, company, location, type, skills, deadline, applicants, match, logoColor }: any) => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] flex flex-col sm:flex-row gap-5 hover:border-blue-200 hover:shadow-lg transition-all duration-200 group">
    <div className={`w-12 h-12 ${logoColor} rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 mt-0.5 shadow-sm`}>
      {logo}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-start mb-1.5">
        <div>
          <h3 className="text-[16px] font-bold text-gray-900 leading-tight mb-1">{title}</h3>
          <p className="text-[13px] text-gray-500 font-medium">{company} • {location}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-50 text-green-700 border border-green-200 font-bold px-2.5 py-0.5 rounded-full text-[11px] shadow-sm flex items-center">
            <CheckCircle className="w-3.5 h-3.5 mr-1" /> {match}% Match
          </Badge>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 my-3">
        {skills.map((s: string) => (
          <span key={s} className="px-2.5 py-1 bg-gray-50 text-blue-700 rounded-lg text-[11px] font-semibold border border-gray-100">
            {s}
          </span>
        ))}
      </div>
      
      <div className="flex items-center text-[12px] font-medium text-gray-500 space-x-5 mt-1">
        <div className="flex items-center"><Briefcase className="h-4 w-4 mr-1.5" /> {type}</div>
        <div className="flex items-center"><Clock className="h-4 w-4 mr-1.5" /> {deadline}</div>
        <div className="flex items-center"><Users className="h-4 w-4 mr-1.5" /> {applicants}</div>
      </div>
    </div>
    
    <div className="flex sm:flex-col justify-between items-end sm:border-l border-gray-100 sm:pl-5 min-w-[130px]">
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
