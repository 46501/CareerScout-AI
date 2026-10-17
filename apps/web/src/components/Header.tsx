import React, { useState } from 'react';
import { Bot, Bell, User as UserIcon, Settings, LogOut, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ThemeToggle } from './ui/ThemeToggle';
import { ProfileCompletionModal } from './ui/ProfileCompletionModal';

interface HeaderProps {
  onRunScout: () => void;
  isScouting: boolean;
  completionPercentage: number;
  missingFields?: string[];
}

export const Header: React.FC<HeaderProps> = ({ onRunScout, isScouting, completionPercentage, missingFields = [] }) => {
  const { user, logout } = useAuth();
  const { confirm, notify } = useNotification();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Overview</h1>
      <div className="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm" 
          className="hidden sm:flex" 
          onClick={handleRunScout} 
          disabled={isScouting}
        >
          <Bot className="h-4 w-4 mr-2" /> {isScouting ? 'Scanning...' : 'Run AI Scout'}
        </Button>
        <ThemeToggle />
        <button className="text-gray-400 hover:text-gray-500">
          <Bell className="h-6 w-6" />
        </button>

        {/* Profile Avatar Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center focus:outline-none"
          >
            {hasPhoto ? (
              <img src="/placeholder.png" alt="Profile" className="h-8 w-8 rounded-full object-cover border border-gray-200" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold border border-primary-200">
                {getInitials()}
              </div>
            )}
            <span className="ml-1 text-xs text-gray-500">▼</span>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-md shadow-lg py-1 border border-gray-200 z-50">
              <Link 
                to="/profile" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                <UserIcon className="h-4 w-4 mr-2" /> Profile
              </Link>
              <Link 
                to="/profile" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                <FileText className="h-4 w-4 mr-2" /> Edit Profile
              </Link>
              <Link 
                to="/settings" 
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings className="h-4 w-4 mr-2" /> Settings
              </Link>
              <div className="border-t border-gray-100 my-1"></div>
              <button 
                onClick={handleLogout}
                className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
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
