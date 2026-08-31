import { Search, Moon, Sun, Bell, Menu } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export default function TopNav() {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="h-20 border-b border-border-color bg-card-color flex items-center justify-between px-6 lg:px-8 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden">
          <Menu className="w-6 h-6" />
        </button>
        <div className="relative max-w-2xl w-full hidden sm:block">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-3 border-transparent rounded-xl bg-gray-100 dark:bg-gray-900/50 text-text-color placeholder-gray-500 focus:border-primary focus:bg-white dark:focus:bg-gray-900 focus:ring-1 focus:ring-primary transition-colors text-sm"
            placeholder="Search jobs, internships, hackathons, webinars..."
          />
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-6">
        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
        
        <button className="relative p-2.5 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 block h-2 w-2 rounded-full bg-primary ring-2 ring-card-color" />
        </button>

        <div className="h-8 w-px bg-border-color hidden sm:block"></div>

        <button className="flex items-center gap-3">
          <img
            className="h-10 w-10 rounded-full object-cover border-2 border-transparent hover:border-primary transition-colors"
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
            alt="User avatar"
          />
          <div className="hidden lg:block text-left">
            <p className="text-sm font-medium text-text-color">Om Kulkarni</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">View Profile ⌄</p>
          </div>
        </button>
      </div>
    </header>
  );
}
