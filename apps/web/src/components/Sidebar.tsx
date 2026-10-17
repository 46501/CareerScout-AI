import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Compass, Bot, Briefcase, User, 
  Settings, LogOut, X 
} from 'lucide-react';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface SidebarProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onRunScout?: () => void;
  isScouting?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobileOpen = false,
  onCloseMobile,
  onRunScout,
  isScouting = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { confirm, notify } = useNotification();

  const handleLogout = async () => {
    if (onCloseMobile) onCloseMobile();
    const confirmed = await confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of CareerScout AI?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      await logout();
      notify.info('Signed out successfully');
      navigate('/login');
    }
  };

  const navItems = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: LayoutDashboard,
      isActive: location.pathname === '/dashboard'
    },
    {
      label: 'Discover Opportunities',
      to: '/opportunities',
      icon: Compass,
      isActive: location.pathname.startsWith('/opportunities')
    },
    {
      label: 'AI Career Scout',
      to: '/assistant',
      icon: Bot,
      isActive: location.pathname.startsWith('/assistant') || location.pathname.startsWith('/scout')
    },
    {
      label: 'My Applications',
      to: '/applications',
      icon: Briefcase,
      isActive: location.pathname.startsWith('/applications')
    },
    {
      label: 'My Profile',
      to: '/profile',
      icon: User,
      isActive: location.pathname.startsWith('/profile')
    }
  ];

  const handleNavClick = () => {
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 z-40 lg:hidden backdrop-blur-md" 
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Aside */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 glass-card border-r border-slate-200 dark:border-slate-800/50 flex flex-col flex-shrink-0 h-screen transition-transform duration-300 ease-in-out lg:transform-none ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } rounded-none bg-white dark:bg-slate-900`}>
        
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800/50">
          <Link to="/dashboard" onClick={handleNavClick} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md shadow-primary-500/20">
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              CareerScout
            </span>
          </Link>
          <button 
            className="lg:hidden text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg"
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        {/* Primary Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto hide-scrollbar">
          <div className="px-3 pb-2">
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Navigation
            </p>
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={handleNavClick}
                className={`flex items-center px-3.5 py-2.5 text-sm rounded-xl transition-all duration-150 mb-1 ${
                  item.isActive
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-semibold border border-primary-500/20 shadow-[inset_0_0_15px_rgba(99,102,241,0.1)]'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white font-medium'
                }`}
              >
                <Icon className={`h-4 w-4 mr-3 shrink-0 ${item.isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* AI Scout Promo Card */}
        <div className="p-4 mx-4 mb-3 bg-gradient-to-br from-primary-900/90 to-slate-900 rounded-2xl text-white relative overflow-hidden border border-primary-500/20 shadow-md">
          <div className="absolute top-0 right-0 w-28 h-28 bg-primary-500/20 rounded-full -mr-12 -mt-12 pointer-events-none blur-xl" />
          <div className="relative z-10 space-y-2">
            <h4 className="font-bold text-xs leading-tight text-white">AI Opportunity Scout</h4>
            <p className="text-[11px] text-primary-200/80 leading-relaxed">
              Scan verified live sources for high-fit job matches.
            </p>
            <Button 
              onClick={() => {
                if (onRunScout) onRunScout();
                else navigate('/assistant');
              }} 
              disabled={isScouting} 
              className="w-full bg-primary-600 hover:bg-primary-500 text-white border-0 shadow-sm transition-all rounded-xl text-xs font-semibold h-8 mt-1"
            >
              {isScouting ? 'Scanning Web...' : 'Run AI Scout →'}
            </Button>
          </div>
        </div>

        {/* Bottom Utility Menu: Settings & Sign Out */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/50 space-y-1">
          <Link
            to="/settings"
            onClick={handleNavClick}
            className={`flex items-center px-3.5 py-2 text-xs font-medium rounded-xl transition-colors ${
              location.pathname === '/settings'
                ? 'bg-slate-100 dark:bg-slate-800 text-primary-600 dark:text-primary-400 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings className="h-4 w-4 mr-3 text-slate-400 dark:text-slate-500" />
            <span>Settings</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3.5 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-colors text-left"
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span>Sign Out</span>
          </button>
        </div>

      </aside>
    </>
  );
};
