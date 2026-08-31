import { ChevronDown, Check, Briefcase, Send, Bookmark, Bell, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../api';
import { useAuthStore } from '../store/authStore';

export default function RightPanel() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ saved: 0, applied: 0, unreadNotifications: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/user/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchStats();
    }
  }, [user]);
  return (
    <aside className="w-80 flex-shrink-0 border-l border-border-color bg-card-color hidden xl:flex flex-col h-full overflow-y-auto">
      <div className="p-6 space-y-8">
        
        {/* Profile Summary */}
        <div>
          <h2 className="text-sm font-semibold text-text-color mb-4">Your Profile Summary</h2>
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-border-color">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-14 h-14">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200 dark:text-gray-700" />
                  <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray="150" strokeDashoffset="22" className="text-primary" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-text-color">
                  {user?.completionPercentage || 0}%
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-color">Profile Complete</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Add skills and preferences to get better matches</p>
              </div>
            </div>
            <button className="w-full text-center text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors flex items-center justify-center gap-2">
              Complete Profile <span aria-hidden="true">&rarr;</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-color">Filters</h2>
            <button className="text-xs text-primary hover:text-primary-hover font-medium">Clear all</button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Opportunity Type</h3>
              <div className="space-y-2.5">
                {['Jobs', 'Internships', 'Hackathons', 'Webinars', 'Scholarships'].map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 rounded border-2 border-gray-300 dark:border-gray-600 group-hover:border-primary flex items-center justify-center transition-colors">
                      <Check className="w-3 h-3 text-white opacity-0 transition-opacity" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{type}</span>
                  </label>
                ))}
                <button className="text-xs text-primary mt-1 font-medium">Show more ⌄</button>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Experience Level</h3>
              <button className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 border border-border-color rounded-lg px-4 py-2.5 text-sm text-text-color text-left hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                All Levels
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Location Preference</h3>
              <button className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 border border-border-color rounded-lg px-4 py-2.5 text-sm text-text-color text-left hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                All Locations
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wider">Availability</h3>
              <button className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 border border-border-color rounded-lg px-4 py-2.5 text-sm text-text-color text-left hover:border-gray-400 dark:hover:border-gray-600 transition-colors">
                Anytime
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <button className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
              Apply Filters
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div>
          <h2 className="text-sm font-semibold text-text-color mb-4">Quick Stats</h2>
          {loading ? (
            <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : (
          <div className="grid grid-cols-4 gap-2 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-border-color">
            <div className="flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-2">
                <Briefcase className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-lg font-bold text-text-color">--</span>
              <span className="text-[10px] text-gray-500 mt-1 uppercase">New</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-2">
                <Send className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-lg font-bold text-text-color">{stats.applied}</span>
              <span className="text-[10px] text-gray-500 mt-1 uppercase">Applied</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-2">
                <Bookmark className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-lg font-bold text-text-color">{stats.saved}</span>
              <span className="text-[10px] text-gray-500 mt-1 uppercase">Saved</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-2">
                <Bell className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-lg font-bold text-text-color">{stats.unreadNotifications}</span>
              <span className="text-[10px] text-gray-500 mt-1 uppercase">Alerts</span>
            </div>
          </div>
          )}
        </div>

      </div>
    </aside>
  );
}
