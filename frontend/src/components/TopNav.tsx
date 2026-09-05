import { Search, Bell, Menu, ChevronDown } from 'lucide-react';
import { useFilterStore } from '../store/filterStore';
import { useAuthStore } from '../store/authStore';

export default function TopNav() {
  const { searchQuery, setSearchQuery } = useFilterStore();
  const { user } = useAuthStore();

  return (
    <header className="h-20 bg-[#f8fafc] flex items-center justify-between px-6 lg:px-8 shrink-0">
      {/* Mobile Menu Button */}
      <button className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 md:hidden mr-4">
        <Menu className="w-6 h-6" />
      </button>

      {/* Global Search */}
      <div className="relative max-w-[500px] w-full hidden sm:block">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-11 pr-4 py-2.5 border border-slate-200 rounded-full bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-[13px] shadow-sm"
          placeholder="Search jobs, companies, skills..."
        />
      </div>

      <div className="flex-1 sm:hidden"></div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 lg:gap-6">
        <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-[#f8fafc]" />
        </button>

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold shadow-sm overflow-hidden border-2 border-transparent group-hover:border-blue-200 transition-colors">
            {user?.avatar || user?.profile?.avatar ? (
              <img src={user.avatar || user.profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}</span>
            )}
          </div>
          <div className="hidden lg:block text-left">
            <p className="text-[14px] font-bold text-slate-800 leading-tight">{user?.name || 'User Name'}</p>
            <p className="text-[12px] text-slate-500">Student</p>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden lg:block group-hover:text-slate-600 transition-colors" />
        </div>
      </div>
    </header>
  );
}
