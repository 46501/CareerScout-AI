import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Send,
  Bookmark,
  FileText,
  Settings,
  LogOut
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../store/authStore';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Find Jobs', path: '/opportunities?type=Jobs', icon: Briefcase },
  { name: 'Internships', path: '/opportunities?type=Internships', icon: GraduationCap },
  { name: 'My Applications', path: '/applications', icon: Send },
  { name: 'Saved', path: '/saved', icon: Bookmark },
  { name: 'Resume', path: '/resume', icon: FileText },
];

export default function Sidebar() {
  const location = useLocation();
  const { logout } = useAuthStore();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border-color bg-white flex flex-col h-full overflow-y-auto hidden md:flex">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg leading-none">A</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">CareerScout</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          // Active state matching logic
          let isActive = false;
          if (item.path === '/') {
            isActive = location.pathname === '/';
          } else if (item.path !== '#') {
            const [basePath, search] = item.path.split('?');
            isActive = location.pathname.startsWith(basePath) && (!search || location.search.includes(search));
          }

          return (
            <Link
              key={index}
              to={item.path}
              className={clsx(
                'group flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
              )}
            >
              <Icon className={clsx('w-5 h-5 transition-colors duration-200', isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-4 py-2 space-y-1">
        <Link
          to="/settings"
          className={clsx(
            'group flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold transition-all duration-200',
            location.pathname === '/settings' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
          )}
        >
          <Settings className={clsx('w-5 h-5 transition-colors duration-200', location.pathname === '/settings' ? 'text-blue-600' : 'text-slate-400 group-hover:text-blue-600')} />
          Settings
        </Link>
        <button
          onClick={() => logout()}
          className="group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-semibold text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200"
        >
          <LogOut className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors duration-200" />
          Logout
        </button>
      </div>


    </aside>
  );
}
