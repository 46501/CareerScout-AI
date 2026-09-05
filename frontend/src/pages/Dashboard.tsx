import { useState, useEffect } from 'react';
import { Loader2, Search, Briefcase, FileText, Bookmark, Award, ArrowRight } from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import OpportunityDetail from '../components/OpportunityDetail';
import api from '../api';
import { useFilterStore } from '../store/filterStore';
import { useAuthStore } from '../store/authStore';

// Note: Using a placeholder illustration for the hero.
import heroImage from '../assets/hero-student.jpg'; 

export default function Dashboard() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({ saved: 0, applied: 0, unreadNotifications: 0 });
  const [loading, setLoading] = useState(true);
  const [scouting, setScouting] = useState(false);
  const [error, setError] = useState('');
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  
  const { searchQuery, setSearchQuery, types, location, experienceLevel, sort } = useFilterStore();
  const { user } = useAuthStore();
  
  // Local search state for the hero search bar so it doesn't instantly re-render everything on each keystroke
  const [heroSearch, setHeroSearch] = useState(searchQuery);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      
      let typeList = [];
      if (types.length > 0) typeList.push(...types);
      if (typeList.length > 0) {
        queryParams.append('type', Array.from(new Set(typeList)).join(','));
      }

      if (location && location !== 'All Locations') queryParams.append('location', location);
      if (experienceLevel && experienceLevel !== 'All Levels') queryParams.append('experienceLevel', experienceLevel);
      if (searchQuery) queryParams.append('search', searchQuery);
      if (sort && sort !== 'Best Match') queryParams.append('sort', sort);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const [oppRes, savedRes, statsRes] = await Promise.all([
        api.get(`/opportunities${queryString}`),
        api.get('/user/saved'),
        api.get('/user/stats')
      ]);
      setOpportunities(oppRes.data);
      const sIds = new Set(savedRes.data.map((o: any) => o._id));
      setSavedIds(sIds as Set<string>);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [types, location, experienceLevel, searchQuery, sort]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(heroSearch);
  };

  const handleApply = async (id: string, externalUrl?: string) => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    try {
      const res = await api.post(`/applications/${id}`);
      if (res.data.externalUrl) {
        window.open(res.data.externalUrl, '_blank', 'noopener,noreferrer');
      } else {
        alert('Application recorded successfully!');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to apply');
    }
  };

  const handleSave = async (id: string) => {
    try {
      const res = await api.post(`/user/saved/${id}`);
      setSavedIds(prev => {
        const newSet = new Set(prev);
        if (res.data.isSaved) newSet.add(id);
        else newSet.delete(id);
        return newSet;
      });
      // Optionally update the local stats count based on res.data.isSaved
      setStats(prev => ({
        ...prev,
        saved: res.data.isSaved ? prev.saved + 1 : prev.saved - 1
      }));
    } catch (err) {
      console.error('Failed to save', err);
    }
  };

  const handleScoutNow = async () => {
    setScouting(true);
    try {
      await api.post('/opportunities/scout');
      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      alert('Failed to scout for new opportunities. Please try again.');
    } finally {
      setScouting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full pb-20">
      
      {/* Welcome Hero Card */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 mb-8 p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between shadow-sm">
        <div className="relative z-10 w-full md:w-[60%]">
          <p className="text-slate-500 font-medium text-lg mb-1">Welcome back,</p>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {user?.name ? user.name.split(' ')[0] : 'User'}! <span className="inline-block animate-wave origin-[70%_70%]">👋</span>
          </h1>
          <p className="text-slate-600 mb-8 max-w-sm leading-relaxed">
            Your next opportunity is closer than you think. Let's make it happen.
          </p>
          
          <form onSubmit={handleHeroSearch} className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={heroSearch}
              onChange={(e) => setHeroSearch(e.target.value)}
              className="block w-full pl-11 pr-16 py-3.5 border border-white rounded-full bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-sm transition-colors text-[14px]"
              placeholder="Search for jobs, internships, or skills..."
            />
            <button type="submit" className="absolute inset-y-1.5 right-1.5 w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center hover:bg-blue-700 transition-colors">
              <Search className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
        
        {/* Decorative Image */}
        <div className="hidden md:block absolute right-[-5%] top-0 h-full w-[45%] opacity-90 mix-blend-multiply">
          <img src={heroImage} alt="Student" className="w-full h-full object-cover object-top mask-image-fade" />
        </div>
        <div className="hidden md:block absolute right-[35%] top-[25%] p-3 bg-white/80 backdrop-blur-md rounded-xl text-[10px] font-bold text-slate-600 shadow-sm rotate-3 border border-white/50">
          "Small steps<br/>today, big career<br/>tomorrow." <ArrowRight className="w-3 h-3 inline text-blue-500" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{opportunities.length}</div>
          <div className="text-[12px] text-slate-500 font-medium">Active Opportunities</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3">
            <FileText className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{stats.applied}</div>
          <div className="text-[12px] text-slate-500 font-medium">Applications</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
            <Bookmark className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{stats.saved}</div>
          <div className="text-[12px] text-slate-500 font-medium">Saved Jobs</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center mb-3">
            <Award className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-slate-800">{user?.profile?.certifications?.length || 0}</div>
          <div className="text-[12px] text-slate-500 font-medium">Skill Certifications</div>
        </div>
      </div>

      {/* Recommended For You Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Recommended for You</h2>
          <p className="text-[13px] text-slate-500 mt-1">Based on your profile, skills, and interests</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleScoutNow}
            disabled={scouting || loading}
            className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {scouting ? 'Scouting...' : 'Scout New'}
          </button>
          <a href="#" className="text-[13px] font-semibold text-blue-600 flex items-center gap-1 hover:text-blue-700">
            View All <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-600 rounded-lg mb-6">{error}</div>}

      {/* Opportunities List */}
      <div className="space-y-4">
        {loading || scouting ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
            <p className="font-medium text-sm">{scouting ? 'Scouting for opportunities...' : 'Loading recommendations...'}</p>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-100">
            <Search className="w-10 h-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-slate-900 mb-2">No matching opportunities found.</h3>
            <p className="text-[13px]">Try adjusting your search or click "Scout New".</p>
          </div>
        ) : (
          opportunities.map((opp) => (
            <OpportunityCard
              key={opp._id}
              id={opp._id}
              title={opp.title}
              organization={opp.organization}
              logo={opp.logo || ''}
              workMode={opp.workMode || 'Remote'}
              paymentType={opp.paymentType || 'Unspecified'}
              duration={opp.duration || 'Unspecified'}
              description={opp.description}
              skills={opp.skills || []}
              postedTime={opp.postedAt ? new Date(opp.postedAt).toLocaleDateString() : 'Recently'}
              matchScore={opp.matchScore || 50}
              isSaved={savedIds.has(opp._id)}
              onApply={() => handleApply(opp._id, opp.applicationUrl)}
              onSave={handleSave}
              onCardClick={(id) => {
                const o = opportunities.find(x => x._id === id);
                if (o) setSelectedOpp(o);
              }}
            />
          ))
        )}
      </div>

      {selectedOpp && (
        <OpportunityDetail 
          opp={selectedOpp} 
          onClose={() => setSelectedOpp(null)} 
          onApply={() => handleApply(selectedOpp._id, selectedOpp.applicationUrl)} 
        />
      )}
    </div>
  );
}
