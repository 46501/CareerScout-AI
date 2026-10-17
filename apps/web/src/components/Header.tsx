import React, { useState, useEffect, useCallback } from 'react';
import { Bot, Bell, User as UserIcon, Settings, LogOut, CheckCheck, Sparkles, ExternalLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ThemeToggle } from './ui/ThemeToggle';
import { ProfileCompletionModal } from './ui/ProfileCompletionModal';
import { useSSE } from '../hooks/useSSE';
import api from '../lib/api';

interface HeaderProps {
  onRunScout: () => void;
  isScouting: boolean;
  completionPercentage: number;
  missingFields?: string[];
}

export const Header: React.FC<HeaderProps> = ({ onRunScout, isScouting, completionPercentage, missingFields = [] }) => {
  const { user, logout } = useAuth();
  const { confirm, notify } = useNotification();
  const navigate = useNavigate();
  const { lastEvent } = useSSE();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Fetch real notifications from API
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data?.success) {
        setNotifications(res.data.data || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (e) {
      console.warn('Could not load notifications:', e);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  // Re-fetch when an SSE NOTIFICATION or SCOUT_COMPLETED event fires
  useEffect(() => {
    if (lastEvent?.type === 'NOTIFICATION' || lastEvent?.type === 'SCOUT_COMPLETED') {
      fetchNotifications();
    }
  }, [lastEvent, fetchNotifications]);

  const handleMarkAsRead = async (notifId: string, actionUrl?: string) => {
    try {
      await api.put(`/notifications/${notifId}/read`);
      setNotifications(prev => prev.map(n => n._id === notifId ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      if (actionUrl) {
        setNotificationsOpen(false);
        navigate(actionUrl);
      }
    } catch (e) {
      console.error('Failed to mark notification as read:', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      notify.success('All notifications marked as read');
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    const confirmed = await confirm({
      title: 'Sign Out',
      message: 'Are you sure you want to sign out of CareerScout AI?',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (confirmed) {
      logout();
      notify.info('Signed out successfully');
    }
  };

  const handleRunScout = () => {
    if (completionPercentage < 100) {
      setIsModalOpen(true);
    } else {
      onRunScout();
    }
  };

  const getInitials = () => {
    if (user?.fullName && user.fullName.trim()) {
      const parts = user.fullName.trim().split(/\s+/);
      if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
      return parts[0].charAt(0).toUpperCase();
    }
    if (user?.email) return user.email.charAt(0).toUpperCase();
    return 'U';
  };

  const hasPhoto = !!user?.profilePhoto;

  return (
    <>
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 lg:px-8 relative z-40">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Overview</h1>
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="hidden sm:flex border-slate-300 dark:border-slate-700" 
          onClick={handleRunScout} 
          disabled={isScouting}
        >
          <Bot className="h-4 w-4 mr-2 text-primary-500" /> {isScouting ? 'Scanning...' : 'Run AI Scout'}
        </Button>
        <ThemeToggle />

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="View notifications"
          >
            <Bell className="h-6 w-6" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl py-2 border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-semibold bg-primary-500/10 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <CheckCheck className="h-3 w-3" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">
                    <Sparkles className="h-6 w-6 text-slate-400 mx-auto mb-2 opacity-50" />
                    No notifications yet. Matches and updates will appear here.
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif._id}
                      onClick={() => handleMarkAsRead(notif._id, notif.actionUrl)}
                      className={`p-3.5 text-xs transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-start gap-3 ${
                        !notif.read ? 'bg-primary-500/5 dark:bg-primary-500/10' : ''
                      }`}
                    >
                      <div className={`mt-0.5 w-2 h-2 rounded-full shrink-0 ${!notif.read ? 'bg-primary-500' : 'bg-transparent'}`} />
                      <div className="flex-1 space-y-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center justify-between">
                          <span>{notif.title}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {notif.message}
                        </p>
                        {notif.actionUrl && (
                          <div className="pt-1 text-[11px] font-medium text-primary-600 dark:text-primary-400 flex items-center gap-1">
                            <span>View details</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center focus:outline-none"
          >
            {hasPhoto ? (
              <img src="/placeholder.png" alt="Profile" className="h-8 w-8 rounded-full object-cover border border-gray-200 dark:border-slate-700" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold border border-primary-200 dark:border-primary-800">
                {getInitials()}
              </div>
            )}
            <span className="ml-1 text-xs text-gray-500">▼</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-lg py-1 border border-gray-200 dark:border-slate-800 z-50">
              <Link 
                to="/profile" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                onClick={() => setDropdownOpen(false)}
              >
                <UserIcon className="h-4 w-4 mr-2" /> My Profile
              </Link>
              <Link 
                to="/settings" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings className="h-4 w-4 mr-2" /> Settings
              </Link>
              <div className="border-t border-gray-100 dark:border-slate-800 my-1"></div>
              <button 
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
    <ProfileCompletionModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      completionPercentage={completionPercentage}
      missingFields={missingFields}
    />
    </>
  );
};
