import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { LogOut, Save, Loader2 } from 'lucide-react';
import api from '../api';

export default function Settings() {
  const { logout, user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    // Normally you'd hit an endpoint like /auth/password
    setSaving(true);
    setTimeout(() => {
      setMessage('Password updated (Mock)');
      setSaving(false);
      setPassword('');
      setNewPassword('');
    }, 1000);
  };

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-color mb-2">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account preferences and security.</p>
      </div>

      <div className="space-y-8">
        
        {/* Account Settings */}
        <div className="bg-card-color p-8 rounded-2xl border border-border-color shadow-sm">
          <h2 className="text-lg font-semibold text-text-color border-b border-border-color pb-2 mb-6">Account Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-color">Email</label>
              <div className="mt-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 border border-border-color rounded-lg text-gray-500">
                {user?.email}
              </div>
              <p className="text-xs text-gray-500 mt-1">To change your email, please contact support.</p>
            </div>
            
            <div className="pt-4">
              <button 
                onClick={() => logout()}
                className="flex items-center gap-2 px-5 py-2 border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20 font-medium rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-card-color p-8 rounded-2xl border border-border-color shadow-sm">
          <h2 className="text-lg font-semibold text-text-color border-b border-border-color pb-2 mb-6">Security</h2>
          
          {message && (
            <div className="p-3 mb-6 bg-green-50 text-green-700 rounded-lg text-sm">
              {message}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">Current Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-border-color rounded-lg bg-body-bg text-text-color focus:ring-1 focus:ring-primary focus:border-primary" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-color mb-1">New Password</label>
              <input 
                type="password" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-border-color rounded-lg bg-body-bg text-text-color focus:ring-1 focus:ring-primary focus:border-primary" 
              />
            </div>
            <button 
              type="submit" 
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update Password
            </button>
          </form>
        </div>

        {/* Preferences */}
        <div className="bg-card-color p-8 rounded-2xl border border-border-color shadow-sm">
          <h2 className="text-lg font-semibold text-text-color border-b border-border-color pb-2 mb-6">Preferences</h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-text-color">Dark Mode</h3>
              <p className="text-sm text-gray-500">Toggle dark mode appearance</p>
            </div>
            <button 
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
