import { useState, useEffect } from 'react';
import { Loader2, Briefcase, MapPin, Calendar, Clock } from 'lucide-react';
import api from '../api';

export default function Applications() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await api.get('/applications');
        setApplications(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'shortlisted': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'interview': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'selected': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto w-full">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-color mb-2">My Applications</h1>
          <p className="text-gray-500 dark:text-gray-400">Track the status of jobs and internships you've applied to.</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-card-color rounded-2xl border border-border-color shadow-sm">
          You haven't applied to any opportunities yet.
        </div>
      ) : (
        <div className="bg-card-color rounded-2xl border border-border-color shadow-sm overflow-hidden">
          <ul className="divide-y divide-border-color">
            {applications.map((app) => (
              <li key={app._id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 p-2 shrink-0">
                      <img src={app.opportunity?.logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(app.opportunity?.organization || '?')}&background=random`} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-text-color">{app.opportunity?.title}</h3>
                      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium mb-2">{app.opportunity?.organization}</div>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{app.opportunity?.workMode}</div>
                        <div className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{app.opportunity?.type}</div>
                        <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Applied: {new Date(app.appliedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 min-w-[120px]">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                    <button className="text-sm font-medium text-primary hover:text-primary-hover">View Details</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
