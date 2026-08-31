import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  GraduationCap,
  Code2,
  Video,
  Award,
  Bookmark,
  Send,
  Bell,
  User,
  FileText,
  Settings,
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Opportunities', path: '/opportunities', isHeader: true },
  { name: 'Jobs', path: '/opportunities?type=jobs', icon: Briefcase },
  { name: 'Internships', path: '/opportunities?type=internships', icon: GraduationCap },
  { name: 'Hackathons', path: '/opportunities?type=hackathons', icon: Code2 },
  { name: 'Webinars', path: '/opportunities?type=webinars', icon: Video },
  { name: 'Scholarships', path: '/opportunities?type=scholarships', icon: Award },
  { name: 'Personal', path: '/saved', isHeader: true },
  { name: 'Saved', path: '/saved', icon: Bookmark },
  { name: 'Applications', path: '/applications', icon: Send },
  { name: 'Notifications', path: '/notifications', icon: Bell },
  { name: 'Profile', path: '/profile', icon: User },
  { name: 'Resume Analyzer', path: '/resume', icon: FileText },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 flex-shrink-0 border-r border-border-color bg-card-color flex flex-col h-full overflow-y-auto hidden md:flex">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
          <Award className="w-5 h-5 text-white" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-text-color">CareerScout AI</h1>
      </div>

      <nav className="flex-1 px-4 pb-6 space-y-1">
        {navItems.map((item, index) => {
          if (item.isHeader) {
            return (
              <div key={index} className="pt-6 pb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {item.name}
              </div>
            );
          }

          const Icon = item.icon!;
          const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path.split('?')[0]) && location.search === item.path.split('?')[1]);

          return (
            <Link
              key={index}
              to={item.path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Icon className={clsx('w-5 h-5', isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400')} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mx-4 mb-6 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex flex-col items-center text-center">
        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mb-3">
          <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
        </div>
        <h3 className="font-semibold text-sm mb-1">Upgrade to Pro</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Unlock AI insights, advanced filters and apply tracker.</p>
        <button className="w-full py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors">
          Upgrade Now
        </button>
      </div>
    </aside>
  );
}
