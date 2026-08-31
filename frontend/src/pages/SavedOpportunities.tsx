import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import OpportunityCard from '../components/OpportunityCard';
import api from '../api';

export default function SavedOpportunities() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      try {
        const res = await api.get('/user/saved');
        setOpportunities(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSaved();
  }, []);

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
      await api.post(`/user/saved/${id}`);
      setOpportunities(prev => prev.filter(opp => opp._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-color mb-2">Saved Opportunities</h1>
        <p className="text-gray-500 dark:text-gray-400">Opportunities you've bookmarked for later.</p>
      </div>

      <div className="space-y-4">
        {opportunities.length === 0 ? (
          <div className="text-center py-12 text-gray-500 bg-card-color rounded-2xl border border-border-color shadow-sm">
            You haven't saved any opportunities yet.
          </div>
        ) : (
          opportunities.map((opp) => (
            <OpportunityCard
              key={opp._id}
              id={opp._id}
              title={opp.title}
              organization={opp.organization}
              logo={opp.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(opp.organization)}&background=random`}
              isNew={false}
              isVerified={true}
              workMode={opp.workMode || 'Remote'}
              paymentType={opp.paymentType || 'Unspecified'}
              duration={opp.duration || 'Unspecified'}
              description={opp.description}
              skills={opp.skills || []}
              postedTime={opp.postedAt ? new Date(opp.postedAt).toLocaleDateString() : 'Recently'}
              matchScore={opp.matchScore || 50}
              isSaved={true}
              onApply={handleApply}
              onSave={handleSave}
              onCardClick={() => {}}
            />
          ))
        )}
      </div>
    </div>
  );
}
