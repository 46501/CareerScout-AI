import { useState, useEffect } from 'react';
import { Loader2, Search } from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import OpportunityDetail from '../components/OpportunityDetail';
import clsx from 'clsx';
import api from '../api';
import { useFilterStore } from '../store/filterStore';

const tabs = ['All', 'Jobs', 'Internships', 'Hackathons', 'Webinars', 'More ⌄'];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('All');
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [scouting, setScouting] = useState(false);
  const [error, setError] = useState('');
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  
  const { searchQuery, types, location, experienceLevel, sort, setSort } = useFilterStore();

  const fetchOpportunities = async () => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      
      let typeList = [];
      if (activeTab !== 'All' && activeTab !== 'More ⌄') typeList.push(activeTab);
      if (types.length > 0) typeList.push(...types);
      
      if (typeList.length > 0) {
        queryParams.append('type', Array.from(new Set(typeList)).join(','));
      }

      if (location && location !== 'All Locations') queryParams.append('location', location);
      if (experienceLevel && experienceLevel !== 'All Levels') queryParams.append('experienceLevel', experienceLevel);
      if (searchQuery) queryParams.append('search', searchQuery);
      if (sort && sort !== 'Best Match') queryParams.append('sort', sort);

      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const [oppRes, savedRes] = await Promise.all([
        api.get(`/opportunities${queryString}`),
        api.get('/user/saved')
      ]);
      setOpportunities(oppRes.data);
      const sIds = new Set(savedRes.data.map((o: any) => o._id));
      setSavedIds(sIds as Set<string>);
    } catch (err) {
      console.error(err);
      setError('Failed to load opportunities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [activeTab, types, location, experienceLevel, searchQuery, sort]);

  const handleApply = async (id: string, externalUrl?: string) => {
    if (externalUrl) {
      window.open(externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    
    // Fallback for internal apply if URL is missing
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
    } catch (err) {
      console.error('Failed to save', err);
    }
  };

  const handleCardClick = (id: string) => {
    const opp = opportunities.find(o => o._id === id);
    if (opp) setSelectedOpp(opp);
  };

  const handleScoutNow = async () => {
    setScouting(true);
    try {
      await api.post('/opportunities/scout');
      // Refetch the updated list
      await fetchOpportunities();
    } catch (err) {
      console.error(err);
      alert('Failed to scout for new opportunities. Please try again.');
    } finally {
      setScouting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text-color mb-2">Opportunities for you 👋</h1>
          <p className="text-gray-500 dark:text-gray-400">Here are the best opportunities matched for you.</p>
        </div>
        <button
          onClick={handleScoutNow}
          disabled={scouting || loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-secondary text-primary font-medium rounded-lg hover:bg-secondary-hover transition-colors disabled:opacity-70"
        >
          {scouting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
          {scouting ? 'Scouting for opportunities...' : 'Scout Now'}
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={clsx(
              'px-5 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
              activeTab === tab
                ? 'bg-primary text-white shadow-sm hover:bg-primary-hover'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-6">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? 'Finding opportunities for you...' : `${opportunities.length} opportunities found`}
        </span>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          Sort by: 
          <select 
            value={sort} 
            onChange={(e) => setSort(e.target.value)}
            className="font-medium text-text-color bg-transparent cursor-pointer focus:outline-none"
          >
            <option value="Best Match">Best Match</option>
            <option value="Newest">Newest</option>
          </select>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg mb-6">{error}</div>}

      {loading || scouting ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
          <p className="font-medium">{scouting ? 'Scouting for opportunities...' : 'Finding opportunities for you...'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.length === 0 ? (
            <div className="text-center py-20 text-gray-500 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No matching opportunities found yet.</h3>
              <p className="max-w-sm mx-auto text-sm">Click "Scout Now" to discover fresh opportunities from the web, or adjust your filters to see more results.</p>
            </div>
          ) : (
            opportunities.map((opp) => (
              <OpportunityCard
                key={opp._id}
                id={opp._id}
                title={opp.title}
                organization={opp.organization}
                logo={opp.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(opp.organization)}&background=random`}
                isNew={false} // Would be calculated based on postedAt
                isVerified={opp.isVerified}
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
                onCardClick={handleCardClick}
              />
            ))
          )}
        </div>
      )}

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
