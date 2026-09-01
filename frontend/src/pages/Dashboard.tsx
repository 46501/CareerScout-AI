import { useState, useEffect } from 'react';
import { ChevronDown, Loader2 } from 'lucide-react';
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
  const [error, setError] = useState('');
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  
  const { searchQuery, types, location, experienceLevel, sort, setSort } = useFilterStore();

  useEffect(() => {
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

    fetchOpportunities();
  }, [activeTab, types, location, experienceLevel, searchQuery, sort]);

  const handleApply = async (id: string) => {
    try {
      const res = await api.post(`/applications/${id}`);
      if (res.data.externalUrl) {
        window.open(res.data.externalUrl, '_blank');
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

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-color mb-2">Opportunities for you 👋</h1>
        <p className="text-gray-500 dark:text-gray-400">Here are the best opportunities matched for you.</p>
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
          {loading ? 'Loading...' : `${opportunities.length} opportunities found`}
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

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          {opportunities.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No opportunities found for {activeTab}{searchQuery ? ` matching "${searchQuery}"` : ''}.
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
                isVerified={true}
                workMode={opp.workMode || 'Remote'}
                paymentType={opp.paymentType || 'Unspecified'}
                duration={opp.duration || 'Unspecified'}
                description={opp.description}
                skills={opp.skills || []}
                postedTime={opp.postedAt ? new Date(opp.postedAt).toLocaleDateString() : 'Recently'}
                matchScore={opp.matchScore || 50}
                isSaved={savedIds.has(opp._id)}
                onApply={handleApply}
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
          onApply={handleApply} 
        />
      )}
    </div>
  );
}
